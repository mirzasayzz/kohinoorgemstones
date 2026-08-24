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

// Conversation context storage (per session)
const conversationContext = new Map();

// Extract user parameters from message with improved detection
const extractUserParameters = (message, sessionId = null) => {
  const lowerMessage = message.toLowerCase();
  const params = {};
  
  // Get existing context for this session
  const existingContext = sessionId ? (conversationContext.get(sessionId) || {}) : {};
  
  // Extract name (looking for "I'm", "my name is", "call me", etc.)
  // Be more strict to avoid picking up random words
  const namePatterns = [
    /(?:i'm|i am|my name is|this is|call me|myself)\s+([a-zA-Z]{2,15})/i,
    /^(?:hi|hello|hey)[,!]?\s+(?:i'm|i am|my name is)\s+([a-zA-Z]{2,15})/i,
    /^(?:i'm|i am)\s+([a-zA-Z]{2,15})(?:\s|,|\.|!|$)/i
  ];
  
  // Common words that should NOT be treated as names
  const notNames = ['looking', 'searching', 'need', 'want', 'interested', 'show', 'find', 'help', 'please', 'thanks', 'hello', 'hi', 'hey', 'good', 'fine', 'okay', 'yes', 'no', 'just', 'only', 'also', 'very', 'really', 'quite', 'much', 'many', 'some', 'any', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'such', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'here', 'there', 'where', 'when', 'why', 'how', 'under', 'around', 'about', 'budget', 'price', 'wedding', 'engagement', 'gift'];
  
  for (const pattern of namePatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      const potentialName = match[1].trim();
      // Only accept if it's not a common word and starts with capital
      if (!notNames.includes(potentialName.toLowerCase()) && /^[A-Z]/.test(potentialName)) {
        params.userName = potentialName;
        break;
      }
    }
  }
  
  // Extract budget with multiple patterns
  const budgetPatterns = [
    /(?:budget|price|cost|spend|afford|looking for|within|around|about|upto|up to).{0,20}?(\d+(?:,\d+)*(?:k|K|lakh|lac|L)?)/i,
    /₹\s*(\d+(?:,\d+)*(?:k|K|lakh|lac|L)?)/i,
    /(\d+(?:,\d+)*(?:k|K|lakh|lac|L)?)(?:\s*(?:rs|rupees|inr|rupee|₹))/i,
    /\b(\d{4,})\b/ // Any 4+ digit number likely a price
  ];
  
  for (const pattern of budgetPatterns) {
    const match = lowerMessage.match(pattern) || message.match(pattern);
    if (match) {
      let budget = match[1].replace(/,/g, '');
      // Handle k/K for thousands, lakh/lac/L for lakhs
      if (/k$/i.test(budget)) {
        budget = parseInt(budget) * 1000;
      } else if (/lakh|lac|l$/i.test(budget)) {
        budget = parseInt(budget) * 100000;
      }
      params.budget = String(budget);
      break;
    }
  }
  
  // Extract gemstone categories (expanded list)
  const categories = [
    'diamond', 'emerald', 'ruby', 'sapphire', 'pearl', 'topaz', 'coral', 
    'opal', 'garnet', 'amethyst', 'turquoise', 'onyx', 'aqeeq', 'agate',
    'moonstone', 'zircon', 'tourmaline', 'neelam', 'pukhraj', 'panna',
    'manik', 'moti', 'moonga', 'heera'
  ];
  
  const categoryMap = {
    'neelam': 'sapphire', 'pukhraj': 'topaz', 'panna': 'emerald',
    'manik': 'ruby', 'moti': 'pearl', 'moonga': 'coral', 'heera': 'diamond',
    'agate': 'aqeeq'
  };
  
  for (const category of categories) {
    if (lowerMessage.includes(category)) {
      params.category = categoryMap[category] || category;
      break;
    }
  }
  
  // Extract colors (expanded)
  const colors = [
    'red', 'blue', 'green', 'yellow', 'white', 'black', 'pink', 'purple', 
    'orange', 'clear', 'golden', 'gold', 'silver', 'brown', 'grey', 'gray',
    'multi', 'colorful', 'dark', 'light', 'deep', 'bright'
  ];
  
  for (const color of colors) {
    if (lowerMessage.includes(color)) {
      params.color = color;
      break;
    }
  }
  
  // Extract occasions (expanded)
  const occasionKeywords = {
    'wedding': ['wedding', 'shaadi', 'marriage', 'nikah', 'bride', 'bridal'],
    'engagement': ['engagement', 'propose', 'proposal', 'sagai', 'ring ceremony'],
    'anniversary': ['anniversary', 'salgirah'],
    'birthday': ['birthday', 'janamdin'],
    'gift': ['gift', 'present', 'tohfa', 'surprise'],
    'daily': ['daily', 'everyday', 'casual', 'regular'],
    'office': ['office', 'work', 'professional', 'formal'],
    'party': ['party', 'celebration', 'function', 'event'],
    'religious': ['religious', 'pooja', 'spiritual', 'temple', 'astrological']
  };
  
  for (const [occasion, keywords] of Object.entries(occasionKeywords)) {
    if (keywords.some(kw => lowerMessage.includes(kw))) {
      params.occasion = occasion;
      break;
    }
  }
  
  // Extract purpose/jewelry type
  const purposeKeywords = {
    'ring': ['ring', 'anguthi'],
    'necklace': ['necklace', 'haar', 'pendant', 'chain'],
    'earrings': ['earring', 'earrings', 'tops', 'jhumka', 'bali'],
    'bracelet': ['bracelet', 'bangle', 'kangan', 'kara'],
    'investment': ['investment', 'invest', 'value', 'appreciation'],
    'collection': ['collection', 'collect', 'hobby']
  };
  
  for (const [purpose, keywords] of Object.entries(purposeKeywords)) {
    if (keywords.some(kw => lowerMessage.includes(kw))) {
      params.purpose = purpose;
      break;
    }
  }
  
  // Extract astrological/zodiac preferences
  const zodiacSigns = [
    'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
    'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
    'mesh', 'vrishabh', 'mithun', 'kark', 'singh', 'kanya',
    'tula', 'vrishchik', 'dhanu', 'makar', 'kumbh', 'meen'
  ];
  
  for (const sign of zodiacSigns) {
    if (lowerMessage.includes(sign)) {
      params.zodiac = sign;
      break;
    }
  }
  
  // Detect if user is asking about benefits/properties
  if (lowerMessage.match(/benefit|property|healing|power|energy|chakra|effect|good for|help with/i)) {
    params.askingBenefits = true;
  }
  
  // Merge with existing context
  const mergedParams = { ...existingContext, ...params };
  
  // Update session context
  if (sessionId) {
    conversationContext.set(sessionId, mergedParams);
  }
  
  return mergedParams;
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

// Function to get suitable gemstones from database with improved matching
const getSuggestedGemstones = async (userParams) => {
  try {
    const { budget, occasion, color, purpose, category, zodiac } = userParams;
    
    let query = { isActive: true };
    let sortCriteria = { trending: -1, viewCount: -1, createdAt: -1 };
    
    // Category filter with case-insensitive matching
    if (category) {
      query.category = new RegExp(`^${category}$`, 'i');
    }
    
    // Build complex query conditions
    const conditions = [];
    
    // Add budget filter if provided - find gemstones where user can afford a good quality piece
    if (budget) {
      const budgetNum = parseInt(String(budget).replace(/[^\d]/g, ''));
      if (budgetNum > 0) {
        // User should be able to afford at least mid-range quality
        // Show gemstones where: min <= budget AND max is not more than 2x budget
        // This ensures the user can afford a decent quality stone, not just the lowest grade
        conditions.push({
          $and: [
            { 'priceRange.min': { $lte: budgetNum } },
            { 'priceRange.max': { $lte: budgetNum * 2 } } // Max within 2x budget for realistic options
          ]
        });
      }
    }
    
    // Add color filter - search in multiple fields
    if (color) {
      conditions.push({
        $or: [
          { color: new RegExp(color, 'i') },
          { 'name.english': new RegExp(color, 'i') },
          { description: new RegExp(color, 'i') },
          { tags: new RegExp(color, 'i') }
        ]
      });
    }
    
    // Add purpose-based filtering
    if (purpose || occasion) {
      const purposeKeyword = purpose || occasion;
      conditions.push({
        $or: [
          { purpose: new RegExp(purposeKeyword, 'i') },
          { tags: new RegExp(purposeKeyword, 'i') },
          { description: new RegExp(purposeKeyword, 'i') },
          { astrologyBenefits: new RegExp(purposeKeyword, 'i') },
          { uses: new RegExp(purposeKeyword, 'i') }
        ]
      });
    }
    
    // Add zodiac-based recommendations
    if (zodiac) {
      conditions.push({
        $or: [
          { astrologyBenefits: new RegExp(zodiac, 'i') },
          { description: new RegExp(zodiac, 'i') },
          { tags: new RegExp(zodiac, 'i') }
        ]
      });
    }
    
    // Combine conditions with $and if we have multiple
    if (conditions.length > 0) {
      query.$and = conditions;
    }
    
    // First try with strict query
    let gemstones = await Gemstone.find(query)
      .sort(sortCriteria)
      .limit(4)
      .select('name category priceRange images color slug isActive trending summary');
    
    // If no results, try with relaxed query (just category or trending)
    if (gemstones.length === 0) {
      const relaxedQuery = { isActive: true };
      if (category) {
        relaxedQuery.category = new RegExp(`^${category}$`, 'i');
      } else {
        relaxedQuery.trending = true;
      }
      
      gemstones = await Gemstone.find(relaxedQuery)
        .sort(sortCriteria)
        .limit(4)
        .select('name category priceRange images color slug isActive trending summary');
    }
    
    // If still no results, get trending/popular ones
    if (gemstones.length === 0) {
      gemstones = await Gemstone.find({ isActive: true })
        .sort({ trending: -1, viewCount: -1 })
        .limit(4)
        .select('name category priceRange images color slug isActive trending summary');
    }
    
    return gemstones;
  } catch (error) {
    console.error('Error fetching suggested gemstones:', error);
    return [];
  }
};

const createGemstonePrompt = (userMessage, suggestedGemstones = [], extractedParams = {}) => {
  const hasGemstones = suggestedGemstones && suggestedGemstones.length > 0;
  const userName = extractedParams.userName ? extractedParams.userName : '';
  const greeting = userName ? `${userName}, ` : '';
  
  // Determine what info we already have
  const hasName = !!extractedParams.userName;
  const hasBudget = !!extractedParams.budget;
  const hasOccasion = !!extractedParams.occasion;
  const hasPurpose = !!extractedParams.purpose;
  const hasCategory = !!extractedParams.category;
  const hasColor = !!extractedParams.color;
  
  // Calculate completeness
  const infoCount = [hasName, hasBudget, hasOccasion || hasPurpose, hasCategory || hasColor].filter(Boolean).length;
  
  if (hasGemstones) {
    const gemstoneList = suggestedGemstones.map(g => {
      const price = g.priceRange?.min ? 
        `₹${g.priceRange.min.toLocaleString('en-IN')}${g.priceRange.max ? ` - ₹${g.priceRange.max.toLocaleString('en-IN')}` : '+'}` :
        'Contact for price';
      return `**${g.name.english}** (${g.category}) - ${price}`;
    }).join('\n• ');
    
    return `You are Kohinoor AI, a warm and knowledgeable gemstone consultant from Kohinoor Gemstone, a trusted family-owned business.

USER MESSAGE: "${userMessage}"

CONTEXT: User${userName ? ` named ${userName}` : ''} is looking for gemstones.
${hasBudget ? `Budget: Around ₹${parseInt(extractedParams.budget).toLocaleString('en-IN')}` : ''}
${hasOccasion ? `Occasion: ${extractedParams.occasion}` : ''}
${hasPurpose ? `For: ${extractedParams.purpose}` : ''}

MATCHING GEMSTONES FOUND:
• ${gemstoneList}

RESPOND with a warm, personalized message (2-3 short sentences max):
1. ${greeting ? `Address them by name (${userName})` : 'Acknowledge their interest'}
2. Briefly mention why these gems match their needs
3. Invite them to click on the cards below to explore

Be conversational, not robotic. Sound like a friendly expert.`;
  }
  
  // Handle greetings and introductions
  const isGreeting = /^(hi|hello|hey|good morning|good evening|good afternoon|namaste|salam|assalam)/i.test(userMessage.trim());
  const isJustName = /^[A-Za-z]+$/i.test(userMessage.trim()) && userMessage.trim().length < 20;
  const isThanks = /thank|thanks|shukriya|dhanyawad/i.test(userMessage);
  const isBye = /bye|goodbye|see you|take care|alvida/i.test(userMessage);
  
  // Build context string
  let contextInfo = '';
  if (hasName) contextInfo += `User's name: ${extractedParams.userName}. `;
  if (hasBudget) contextInfo += `Budget: ₹${parseInt(extractedParams.budget).toLocaleString('en-IN')}. `;
  if (hasOccasion) contextInfo += `Occasion: ${extractedParams.occasion}. `;
  if (hasPurpose) contextInfo += `Looking for: ${extractedParams.purpose}. `;
  if (hasCategory) contextInfo += `Interested in: ${extractedParams.category}. `;
  if (hasColor) contextInfo += `Color preference: ${extractedParams.color}. `;
  
  // Determine what to ask next
  let nextQuestion = '';
  if (!hasName && !hasBudget && !hasOccasion) {
    nextQuestion = "Ask for their name and what brings them to look for gemstones today.";
  } else if (!hasBudget) {
    nextQuestion = "Gently ask about their budget range to help find the perfect match.";
  } else if (!hasOccasion && !hasPurpose) {
    nextQuestion = "Ask what the gemstone is for (occasion, jewelry type, or purpose).";
  } else if (!hasCategory && !hasColor) {
    nextQuestion = "Ask if they have a preference for specific gemstone type or color.";
  } else {
    nextQuestion = "You have enough info! Summarize what you understood and say you're searching for perfect matches.";
  }
  
  return `You are Kohinoor AI, a warm, knowledgeable gemstone consultant at Kohinoor Gemstone - a trusted family-owned gemstone business in India.

YOUR PERSONALITY:
- Warm, friendly, and professional
- Expert in gemstones, their properties, and astrological significance
- Helpful without being pushy
- Use simple language, occasional Hindi/Urdu terms are okay
- Address users by name once you know it

CURRENT CONVERSATION:
User says: "${userMessage}"

INFORMATION GATHERED SO FAR:
${contextInfo || 'None yet - this is a new conversation.'}

${isGreeting ? 'INSTRUCTION: Warmly greet them, introduce yourself as Kohinoor AI, and ask how you can help them find the perfect gemstone today.' : ''}
${isJustName ? `INSTRUCTION: The user just shared their name. Warmly acknowledge it and ask what kind of gemstone they're looking for.` : ''}
${isThanks ? 'INSTRUCTION: Thank them warmly and offer further assistance if needed.' : ''}
${isBye ? 'INSTRUCTION: Wish them well, remind them Kohinoor is always here to help, and invite them to visit again.' : ''}
${!isGreeting && !isJustName && !isThanks && !isBye ? `INSTRUCTION: ${nextQuestion}` : ''}

${extractedParams.askingBenefits ? 'The user is asking about gemstone benefits/properties - share brief, authentic information.' : ''}
${extractedParams.zodiac ? `User mentioned zodiac sign: ${extractedParams.zodiac}. Consider recommending stones good for this sign.` : ''}

RESPONSE RULES:
- Keep response to 2-3 sentences maximum
- Be conversational and warm, not robotic
- ${userName ? `Address them as "${userName}"` : 'Ask for their name if you don\'t have it yet'}
- If they ask non-gemstone questions, briefly answer then guide back to gemstones
- Never be rude or dismissive
- Sound like a real person, not a script`;
};

// POST /api/gemstone-ai
router.post('/gemstone-ai', aiRateLimit, async (req, res) => {
  try {
    const { message, context, conversationHistory } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress;
    const sessionId = `${clientIP}_context`;
    
    // Validate request
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required and must be a string' });
    }
    
    if (message.length > 200) {
      return res.status(400).json({ error: 'Message too long. Maximum 200 characters allowed.' });
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
      const minInterval = 3 * 1000; // 3 seconds minimum between requests (reduced for better UX)
      
      if (timeDiff < minInterval) {
        return res.status(429).json({ 
          error: 'Please wait a moment before sending another message.',
          spamProtection: true,
          waitTime: Math.ceil((minInterval - timeDiff) / 1000)
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
        // Also clean up context
        conversationContext.delete(key.replace('_session', '_context'));
      }
    }
    
    // Extract parameters from user message with session context
    const extractedParams = extractUserParameters(message, sessionId);
    console.log('Extracted parameters:', extractedParams);
    
    // Check if we have enough info to suggest gemstones
    let suggestedGemstones = [];
    const hasEnoughInfo = extractedParams.budget || extractedParams.category || extractedParams.color || extractedParams.occasion;
    
    if (hasEnoughInfo) {
      suggestedGemstones = await getSuggestedGemstones(extractedParams);
      console.log(`Found ${suggestedGemstones.length} suggested gemstones`);
    }
    
    // Generate cache key including context
    const contextHash = JSON.stringify(extractedParams);
    const cacheKey = `${message}_${suggestedGemstones.length}_${contextHash.length}`;
    
    // Skip cache for personalized responses (when we have user context)
    const shouldUseCache = !extractedParams.userName && !hasEnoughInfo;
    
    if (shouldUseCache) {
      const cachedResponse = getCachedResponse(cacheKey);
      if (cachedResponse) {
        console.log(`Cache hit for: ${message.substring(0, 30)}...`);
        return res.json({
          response: cachedResponse.response,
          timestamp: new Date().toISOString(),
          rateLimitRemaining: req.rateLimit?.remaining || 0,
          cached: true,
          suggestedGemstones: cachedResponse.gemstones || [],
          extractedParams: extractedParams
        });
      }
    }
    
    // Get AI response from Gemini with optimized parameters
    // Using gemini-2.0-flash which is the latest available model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        maxOutputTokens: 150,      // Allow for warmer, more conversational responses
        temperature: 0.7,          // More natural, varied responses
        topP: 0.85,               // Good balance of creativity and focus
        topK: 40,                 // Allow more token variety
        candidateCount: 1
      }
    });
    
    const prompt = createGemstonePrompt(message, suggestedGemstones, extractedParams);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let aiResponse = response.text();
    
    // Clean up AI response (remove any markdown artifacts if present)
    aiResponse = aiResponse
      .replace(/\*\*/g, '') // Remove bold markers
      .replace(/^\s*[\-\•]\s*/gm, '') // Remove bullet points at start of lines
      .trim();
    
    // Basic validation on AI response
    if (!aiResponse || aiResponse.trim().length === 0) {
      // Provide a fallback response
      aiResponse = extractedParams.userName 
        ? `${extractedParams.userName}, I'd love to help you find the perfect gemstone! Could you tell me more about what you're looking for?`
        : "Welcome to Kohinoor! I'm here to help you find the perfect gemstone. What's your name, and what brings you here today?";
    }
    
    // Cache the response (only for non-personalized responses)
    if (shouldUseCache) {
      setCachedResponse(cacheKey, aiResponse, suggestedGemstones);
    }
    
    // Log successful request for monitoring
    console.log(`Kohinoor AI Request from ${clientIP}: ${message.substring(0, 30)}... (${aiResponse.length} chars, ${suggestedGemstones.length} gems)`);
    
    res.json({
      response: aiResponse,
      timestamp: new Date().toISOString(),
      rateLimitRemaining: req.rateLimit?.remaining || 0,
      cached: false,
      suggestedGemstones: suggestedGemstones,
      extractedParams: extractedParams
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
    
    // Provide helpful fallback
    res.status(500).json({ 
      error: 'I\'m having a moment! Please try again, or contact us directly via WhatsApp for immediate assistance.',
      serverError: true
    });
  }
});

// GET /api/gemstone-ai/status - Check service status
router.get('/gemstone-ai/status', (req, res) => {
  const hasApiKey = !!process.env.GEMINI_API_KEY;
  const clientIP = req.ip || req.connection.remoteAddress;
  const sessionData = sessionTracker.get(`${clientIP}_session`);
  const contextData = conversationContext.get(`${clientIP}_context`);
  
  res.json({
    serviceAvailable: hasApiKey,
    rateLimit: {
      windowMs: 60 * 60 * 1000,
      max: 15,
      current: sessionData?.requestCount || 0
    },
    conversationContext: contextData ? {
      hasName: !!contextData.userName,
      hasBudget: !!contextData.budget,
      hasOccasion: !!contextData.occasion,
      hasPreferences: !!(contextData.category || contextData.color)
    } : null,
    restrictions: {
      maxMessageLength: 200,
      responseFormat: 'conversational',
      supportedParameters: ['name', 'occasion', 'budget', 'purpose', 'color', 'category', 'zodiac'],
      supportedLanguages: ['English', 'Hindi/Urdu terms'],
      minIntervalSeconds: 3,
      cacheEnabled: true,
      cacheDuration: '10 minutes'
    }
  });
});

// Reset rate limit and conversation for testing (only in development)
router.post('/gemstone-ai/reset-limit', (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ error: 'Not available in production' });
  }
  
  const clientIP = req.ip || req.connection.remoteAddress;
  const sessionKey = `${clientIP}_session`;
  const contextKey = `${clientIP}_context`;
  
  // Clear session data and conversation context
  sessionTracker.delete(sessionKey);
  conversationContext.delete(contextKey);
  
  res.json({
    success: true,
    message: 'Rate limit and conversation context reset successfully',
    newLimit: 15
  });
});

export default router; 