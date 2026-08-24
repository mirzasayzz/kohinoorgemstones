import express from 'express';
import rateLimit from 'express-rate-limit';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Gemstone from '../models/Gemstone.js';

const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Rate limiting: 15 requests per hour per IP (more generous for testing)
const aiRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15, // limit each IP to 15 requests per windowMs
  message: {
    error: 'Too many AI requests. Please try again in an hour.',
    rateLimitExceeded: true
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Additional spam protection: track user sessions
const sessionTracker = new Map();

// Simple response cache to avoid duplicate API calls
const responseCache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

const getCachedResponse = (message) => {
  const key = message.toLowerCase().trim();
  const cached = responseCache.get(key);
  
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }
  
  return null;
};

const setCachedResponse = (message, response, gemstones = []) => {
  const key = message.toLowerCase().trim();
  responseCache.set(key, {
    data: {
      response,
      gemstones
    },
    timestamp: Date.now()
  });
  
  // Clean old cache entries periodically
  if (responseCache.size > 100) {
    const cutoff = Date.now() - CACHE_DURATION;
    for (const [k, v] of responseCache.entries()) {
      if (v.timestamp < cutoff) {
        responseCache.delete(k);
      }
    }
  }
};

// Extract user parameters from message
const extractUserParameters = (message) => {
  const lowerMessage = message.toLowerCase();
  const params = {};
  
  // Extract budget (looking for numbers with currency or "budget")
  const budgetMatch = lowerMessage.match(/(?:budget|price|cost|spend|afford).{0,20}?(\d+(?:,\d+)*(?:\.\d+)?)/i) ||
                     lowerMessage.match(/₹\s*(\d+(?:,\d+)*(?:\.\d+)?)/i) ||
                     lowerMessage.match(/(\d+(?:,\d+)*(?:\.\d+)?)(?:\s*(?:rs|rupees|inr|dollars?))/i);
  if (budgetMatch) {
    params.budget = budgetMatch[1].replace(/,/g, '');
  }
  
  // Extract gemstone categories
  const categories = ['diamond', 'emerald', 'ruby', 'sapphire', 'pearl', 'topaz', 'coral', 'opal', 'garnet', 'amethyst'];
  for (const category of categories) {
    if (lowerMessage.includes(category)) {
      params.category = category;
      break;
    }
  }
  
  // Extract colors
  const colors = ['red', 'blue', 'green', 'yellow', 'white', 'black', 'pink', 'purple', 'orange', 'clear'];
  for (const color of colors) {
    if (lowerMessage.includes(color)) {
      params.color = color;
      break;
    }
  }
  
  // Extract occasions
  const occasions = ['wedding', 'engagement', 'anniversary', 'birthday', 'gift'];
  for (const occasion of occasions) {
    if (lowerMessage.includes(occasion)) {
      params.occasion = occasion;
      break;
    }
  }
  
  // Extract purpose
  if (lowerMessage.includes('ring')) params.purpose = 'ring';
  if (lowerMessage.includes('necklace')) params.purpose = 'necklace';
  if (lowerMessage.includes('earring')) params.purpose = 'earrings';
  if (lowerMessage.includes('investment')) params.purpose = 'investment';
  
  return params;
};

const validateGemstoneQuery = (message) => {
  // Only block clearly malicious or inappropriate content
  const maliciousPatterns = [
    /hack|crack|exploit|inject|breach/i,
    /virus|malware|phishing|spam/i,
    /password|login|admin|database|sql/i,
    /porn|adult|explicit|sexual|nsfw/i,
    /\b(fuck|shit|bitch|asshole)\b/i, // Basic profanity filter
    /script|javascript|<script/i, // Basic XSS protection
  ];
  
  // Check for malicious patterns
  if (maliciousPatterns.some(pattern => pattern.test(message))) {
    return false;
  }
  
  // Allow everything else - let the AI handle context and guide conversation
  return true;
};

// Function to get suitable gemstones from database
const getSuggestedGemstones = async (userParams) => {
  try {
    const { budget, occasion, color, purpose, category } = userParams;
    
    let query = { 
      isActive: true,
      ...(category && { category: new RegExp(category, 'i') })
    };
    
    // Add budget filter if provided
    if (budget) {
      const budgetNum = parseInt(budget.replace(/[^\d]/g, ''));
      if (budgetNum > 0) {
        // Find gemstones where the minimum price is within budget
        query.$and = query.$and || [];
        query.$and.push({
          $or: [
            { 'priceRange.min': { $lte: budgetNum } },
            { 'priceRange': { $exists: false } }, // Include items without price range
            { 'priceRange.min': { $exists: false } } // Include items without min price
          ]
        });
      }
    }
    
    // Add color/category filter if provided
    if (color) {
      query.$or = [
        { 'name.english': new RegExp(color, 'i') },
        { 'name.urdu': new RegExp(color, 'i') },
        { category: new RegExp(color, 'i') },
        { 'properties.color': new RegExp(color, 'i') }
      ];
    }
    
    const gemstones = await Gemstone.find(query)
      .sort({ isTrending: -1, createdAt: -1 })
      .limit(3)
      .select('name category priceRange images properties slug isActive isTrending');
    
    return gemstones;
  } catch (error) {
    console.error('Error fetching suggested gemstones:', error);
    return [];
  }
};

const createGemstonePrompt = (userMessage, suggestedGemstones = []) => {
  const hasGemstones = suggestedGemstones && suggestedGemstones.length > 0;
  
  if (hasGemstones) {
    const gemstoneList = suggestedGemstones.map(g => {
      const price = g.priceRange?.min ? 
        `₹${g.priceRange.min.toLocaleString('en-IN')}${g.priceRange.max ? ` - ₹${g.priceRange.max.toLocaleString('en-IN')}` : '+'}` :
        'Price on request';
      return `${g.name.english} (${g.category}) - ${price}`;
    }).join(', ');
    
    return `USER ASKED: "${userMessage}"

I FOUND THESE MATCHING GEMSTONES: ${gemstoneList}

RESPOND EXACTLY: "Perfect! I found these gems for you: ${gemstoneList}. Click any card below to view details!"

ONE LINE ONLY. NO OTHER TEXT.`;
  }
  
      return `You are Kohinoor AI, a premium gemstone consultant. Ask specific parameters systematically.

RULES:
- ONE LINE responses only
- If about gemstones/jewelry/rings: Ask for missing info: "What's your name, the occasion date, and your budget range?"
- If completely unrelated: "Quick answer. For gemstones: What's your name, occasion, and budget?"
- Collect: Name → Occasion/Date → Budget → Purpose → Color preference in order

USER: "${userMessage}"

RESPOND: One line asking for specific missing parameters only.`;
};

// POST /api/gemstone-ai
router.post('/gemstone-ai', aiRateLimit, async (req, res) => {
  try {
    const { message, context } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress;
    
    // Validate request
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required and must be a string' });
    }
    
    if (message.length > 100) {
      return res.status(400).json({ error: 'Message too long. Maximum 100 characters allowed.' });
    }
    
    if (context !== 'gemstone_recommendation') {
      return res.status(400).json({ error: 'Invalid context. Only gemstone recommendations are allowed.' });
    }
    
    // Validate for malicious content only
    if (!validateGemstoneQuery(message)) {
      return res.status(400).json({ 
        error: 'Message contains inappropriate content. Please keep your questions respectful.',
        restricted: true
      });
    }
    
    // Session-based spam protection
    const sessionKey = `${clientIP}_session`;
    const now = Date.now();
    const sessionData = sessionTracker.get(sessionKey);
    
    if (sessionData) {
      const timeDiff = now - sessionData.lastRequest;
      const minInterval = 10 * 1000; // 10 seconds minimum between requests
      
      if (timeDiff < minInterval) {
        return res.status(429).json({ 
          error: 'Please wait at least 10 seconds between requests.',
          spamProtection: true
        });
      }
      
      // Update session
      sessionData.lastRequest = now;
      sessionData.requestCount = (sessionData.requestCount || 0) + 1;
    } else {
      // Create new session
      sessionTracker.set(sessionKey, {
        lastRequest: now,
        requestCount: 1
      });
    }
    
    // Clean up old sessions (older than 1 hour)
    for (const [key, data] of sessionTracker.entries()) {
      if (now - data.lastRequest > 60 * 60 * 1000) {
        sessionTracker.delete(key);
      }
    }
    
    // Extract parameters from user message
    const extractedParams = extractUserParameters(message);
    console.log('Extracted parameters:', extractedParams);
    
    // Check if we have enough info to suggest gemstones
    let suggestedGemstones = [];
    const hasEnoughInfo = extractedParams.budget || extractedParams.category || extractedParams.color;
    
    if (hasEnoughInfo) {
      suggestedGemstones = await getSuggestedGemstones(extractedParams);
      console.log(`Found ${suggestedGemstones.length} suggested gemstones`);
    }
    
    // Check cache first to save AI API calls
    const cacheKey = `${message}_${suggestedGemstones.length}`;
    const cachedResponse = getCachedResponse(cacheKey);
    if (cachedResponse) {
      console.log(`Cache hit for: ${message.substring(0, 30)}...`);
      return res.json({
        response: cachedResponse.response,
        timestamp: new Date().toISOString(),
        rateLimitRemaining: req.rateLimit?.remaining || 0,
        cached: true,
        suggestedGemstones: cachedResponse.gemstones || []
      });
    }
    
    // Get AI response from Gemini with optimized parameters for one-line responses
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        maxOutputTokens: 60,       // Very short responses (~40 words max)
        temperature: 0.3,          // Low creativity, more focused
        topP: 0.6,                // Reduce randomness further
        topK: 20,                 // Limit token selection more
        candidateCount: 1,        // Only generate one response
        stopSequences: ["\n", "\n\n", ". What", ". Could"] // Stop at newlines and common continuations
      }
    });
    
    const prompt = createGemstonePrompt(message, suggestedGemstones);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResponse = response.text();
    
    // Basic validation on AI response to ensure it's appropriate
    if (!aiResponse || aiResponse.trim().length === 0) {
      return res.status(500).json({ 
        error: 'AI service returned empty response. Please try again.',
        validationFailed: true
      });
    }
    
    // Cache the response for future use
    setCachedResponse(cacheKey, aiResponse, suggestedGemstones);
    
    // Log successful request for monitoring
    console.log(`Kohinoor AI Request from ${clientIP}: ${message.substring(0, 30)}... (${aiResponse.length} chars, ${suggestedGemstones.length} gems)`);
    
    res.json({
      response: aiResponse,
      timestamp: new Date().toISOString(),
      rateLimitRemaining: req.rateLimit?.remaining || 0,
      cached: false,
      suggestedGemstones: suggestedGemstones
    });
    
  } catch (error) {
    console.error('Kohinoor AI Error:', error);
    
    // Handle specific Gemini API errors
    if (error.message?.includes('API_KEY')) {
      return res.status(500).json({ 
        error: 'AI service configuration error. Please contact support.',
        configError: true
      });
    }
    
    if (error.message?.includes('QUOTA_EXCEEDED')) {
      return res.status(503).json({ 
        error: 'AI service temporarily unavailable. Please try again later.',
        quotaExceeded: true
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to process your request. Please try again.',
      serverError: true
    });
  }
});

// GET /api/gemstone-ai/status - Check service status
router.get('/gemstone-ai/status', (req, res) => {
  const hasApiKey = !!process.env.GEMINI_API_KEY;
  const clientIP = req.ip || req.connection.remoteAddress;
  const sessionData = sessionTracker.get(`${clientIP}_session`);
  
  res.json({
    serviceAvailable: hasApiKey,
    rateLimit: {
      windowMs: 60 * 60 * 1000,
      max: 15,
      current: sessionData?.requestCount || 0
    },
    restrictions: {
      maxMessageLength: 100,
      maxResponseLength: 60,
      responseFormat: 'one-line-parametrized',
      requiredParameters: ['name', 'occasion', 'date', 'budget', 'purpose', 'color'],
      allowedTopics: ['gemstones', 'jewelry', 'precious stones', 'minerals'],
      minIntervalSeconds: 10,
      cacheEnabled: true,
      cacheDuration: '10 minutes'
    }
  });
});

// Reset rate limit for testing (only in development)
router.post('/gemstone-ai/reset-limit', (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ error: 'Not available in production' });
  }
  
  const clientIP = req.ip || req.connection.remoteAddress;
  const sessionKey = `${clientIP}_session`;
  
  // Clear session data
  sessionTracker.delete(sessionKey);
  
  res.json({
    success: true,
    message: 'Rate limit reset successfully',
    newLimit: 15
  });
});

export default router; 