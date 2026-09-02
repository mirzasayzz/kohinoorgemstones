import express from 'express';
import rateLimit from 'express-rate-limit';
import Gemstone from '../models/Gemstone.js';

const router = express.Router();

// ============================================
// MULTI-PROVIDER FALLBACK AI SYSTEM
// Tier 0: DeepSeek V4 Flash (primary) — fast, high quality
// Tier 1: Groq (llama-3.3-70b-versatile) — ultra fast, free
// Tier 2: Groq (llama-3.1-8b-instant) — smaller but reliable
// Tier 3: Mistral (mistral-small-latest) — good quality
// Tier 4: Pollinations (no auth, always free)
// Tier 5: Smart hardcoded fallback — NEVER fails
// ============================================

// ============================================
// TRUE MULTI-TURN AI CALL
// Sends full messages[] array for real context
// ============================================
const callAIMessages = async (messages) => {
  let lastError = null;

  // Tier 0: DeepSeek V4 Flash — PRIMARY provider
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  const deepseekBaseUrl = process.env.DEEPSEEK_BASE_URL;
  if (deepseekKey && deepseekBaseUrl) {
    try {
      console.log('[AI] Trying deepseek/deepseek-v4-flash');
      const res = await fetch(`${deepseekBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${deepseekKey}`
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-v4-flash',
          messages,
          max_tokens: 500,
          temperature: 0.85
        }),
        signal: AbortSignal.timeout(10000)
      });
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;
      if (text && text.trim().length > 5) {
        console.log('[AI] ✅ deepseek/deepseek-v4-flash');
        return text.trim();
      }
    } catch (err) {
      lastError = err;
      console.warn('[AI] ❌ deepseek:', err.message);
    }
  } else {
    console.warn('[AI] DEEPSEEK_API_KEY or DEEPSEEK_BASE_URL not set — skipping DeepSeek tier');
  }

  // Tier 1 & 2: Groq — OpenAI-compatible, uses messages[] natively
  const groqKey = process.env.GROQ_API_KEY || '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';
  const groqModels = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
  for (const model of groqModels) {
    try {
      console.log(`[AI] Trying groq/${model}`);
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`
        },
        body: JSON.stringify({ model, messages, max_tokens: 500, temperature: 0.85 }),
        signal: AbortSignal.timeout(8000)
      });
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;
      if (text && text.trim().length > 5) {
        console.log(`[AI] ✅ groq/${model}`);
        return text.trim();
      }
    } catch (err) {
      lastError = err;
      console.warn(`[AI] ❌ groq/${model}:`, err.message);
    }
  }

  // Tier 3: Mistral — also OpenAI-compatible
  const mistralKey = process.env.MISTRAL_API_KEY || 'v2SqFAZuImAflsiKwXC6KBsPN1SJoLZS';
  try {
    console.log('[AI] Trying mistral');
    const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mistralKey}`
      },
      body: JSON.stringify({ model: 'mistral-small-latest', messages, max_tokens: 500, temperature: 0.85 }),
      signal: AbortSignal.timeout(8000)
    });
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;
    if (text && text.trim().length > 5) {
      console.log('[AI] ✅ mistral');
      return text.trim();
    }
  } catch (err) {
    lastError = err;
    console.warn('[AI] ❌ mistral:', err.message);
  }

  // Tier 4: Pollinations — flatten messages to a single prompt string
  try {
    console.log('[AI] Trying pollinations');
    const flatPrompt = messages
      .map(m => `${m.role === 'system' ? '<<INSTRUCTIONS>>' : m.role === 'user' ? 'User' : 'Kohinoor'}: ${m.content}`)
      .join('\n') + '\nKohinoor:';
    const encoded = encodeURIComponent(flatPrompt.slice(-800));
    const res = await fetch(`https://text.pollinations.ai/${encoded}`, { signal: AbortSignal.timeout(12000) });
    if (res.ok) {
      const text = (await res.text()).trim();
      if (text && text.length > 5) {
        console.log('[AI] ✅ pollinations');
        return text;
      }
    }
  } catch (err) {
    lastError = err;
    console.warn('[AI] ❌ pollinations:', err.message);
  }

  console.warn('[AI] All providers failed. Last error:', lastError?.message);
  return null;
};

// Stub for backward compat (status endpoint)
const getAIClient = async () => ({
  provider: process.env.DEEPSEEK_API_KEY ? 'deepseek' : 'groq',
  model: process.env.DEEPSEEK_API_KEY ? 'deepseek-v4-flash' : 'llama-3.3-70b-versatile'
});

// ============================================
// KOHINOOR AI - HUMAN-LIKE CONVERSATION SYSTEM
// ============================================

// Rate limiting
const aiRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30, // Increased for better conversation flow
  message: { error: 'Please wait a bit before continuing our chat.', rateLimitExceeded: true },
  standardHeaders: true,
  legacyHeaders: false,
});

// Session & Conversation Storage
const conversations = new Map(); // Full conversation history per session
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// ============================================
// KOHINOOR AI PERSONA & PERSONALITY
// ============================================
const KOHINOOR_PERSONA = {
  name: "Kohinoor",
  role: "Your Personal Gemstone Friend",
  background: `I'm Kohinoor - think of me as your gemstone-obsessed friend who happens to know 
everything about gems! 💎 My family has been in the gemstone business for generations here in 
Bareilly. I grew up surrounded by beautiful stones and learned their secrets from my grandfather. 
I'm not here to sell you anything - I genuinely love helping people find stones that feel right for them.`,
  
  personality: {
    warmth: "Like chatting with a knowledgeable friend, not a salesperson",
    expertise: "Knows gemstones inside out - astrology, healing, beauty",
    casual: "Relaxed, uses everyday language, never formal or stiff",
    curious: "Asks questions because genuinely interested in helping",
    honest: "Will tell you if something isn't a good fit",
    fun: "Makes gemstone shopping enjoyable, not intimidating"
  },
  
  speakingStyle: {
    greetings: ["Hey!", "Hi!", "Hello there!"],
    enthusiasm: ["Oh nice!", "Love that!", "That's exciting!", "Great choice!"],
    thinking: ["Hmm...", "Let me think...", "Interesting..."],
    empathy: ["I totally get it", "Makes sense!", "I hear you"],
    casual: ["So basically...", "Here's the thing...", "You know what...", "Between us..."]
  }
};

// ============================================
// GEMSTONE KNOWLEDGE BASE
// ============================================
const GEMSTONE_KNOWLEDGE = {
  sapphire: {
    hindi: ["neelam", "नीलम"],
    planet: "Saturn (Shani)",
    benefits: ["career success", "mental clarity", "discipline", "protection from negativity"],
    bestFor: ["Capricorn", "Aquarius", "professionals", "students"],
    warning: "Neelam is very powerful - it shows results within 3 days, good or bad. Always do a trial first!",
    occasions: ["job interviews", "business deals", "academic success"],
    priceGuide: "Good quality starts around ₹5,000/carat, premium Kashmir origin can go up to ₹50,000/carat"
  },
  ruby: {
    hindi: ["manik", "माणिक्य", "yakoot"],
    planet: "Sun (Surya)",
    benefits: ["leadership", "confidence", "fame", "father relationship", "heart health"],
    bestFor: ["Leo", "leaders", "politicians", "performers"],
    tip: "The deeper the red, the more powerful. Pigeon blood red is the most prized.",
    occasions: ["promotions", "authority positions", "confidence boost"],
    priceGuide: "Quality rubies start at ₹10,000/carat, Burmese pigeon blood can exceed ₹2 lakhs/carat"
  },
  emerald: {
    hindi: ["panna", "पन्ना", "zamurd"],
    planet: "Mercury (Budh)",
    benefits: ["intelligence", "communication", "business acumen", "creativity", "memory"],
    bestFor: ["Gemini", "Virgo", "writers", "traders", "students"],
    tip: "Minor inclusions are normal in emeralds - they're called 'jardin' (garden). Too perfect might be synthetic!",
    occasions: ["exams", "business ventures", "creative projects"],
    priceGuide: "Colombian emeralds are premium. Good quality starts at ₹8,000/carat"
  },
  pearl: {
    hindi: ["moti", "मोती"],
    planet: "Moon (Chandra)",
    benefits: ["peace of mind", "emotional balance", "beauty", "good relationships", "cooling effect"],
    bestFor: ["Cancer", "those with anger issues", "new mothers", "artists"],
    tip: "Natural pearls are rare and expensive. Cultured pearls are beautiful and more affordable.",
    occasions: ["weddings", "cooling temper", "emotional healing"],
    priceGuide: "South Sea pearls are premium. Good quality starts at ₹2,000/carat"
  },
  coral: {
    hindi: ["moonga", "मूंगा", "marjaan"],
    planet: "Mars (Mangal)",
    benefits: ["courage", "energy", "protection from accidents", "overcoming enemies"],
    bestFor: ["Aries", "Scorpio", "athletes", "soldiers", "those with Mangal dosh"],
    warning: "Essential for those with Mangal Dosh in their kundli before marriage!",
    occasions: ["sports competitions", "legal battles", "overcoming obstacles"],
    priceGuide: "Italian red coral is premium. Good quality starts at ₹3,000/carat"
  },
  yellowSapphire: {
    hindi: ["pukhraj", "पुखराज"],
    planet: "Jupiter (Brihaspati/Guru)",
    benefits: ["wisdom", "prosperity", "marriage", "children", "spiritual growth", "good fortune"],
    bestFor: ["Sagittarius", "Pisces", "teachers", "judges", "those seeking marriage"],
    tip: "Pukhraj is considered the most auspicious stone for marriage and prosperity in our tradition.",
    occasions: ["weddings", "engagements", "starting business", "seeking children"],
    priceGuide: "Ceylon pukhraj is highly valued. Good quality starts at ₹5,000/carat"
  },
  opal: {
    hindi: ["opal", "दूधिया पत्थर"],
    planet: "Venus (Shukra)",
    benefits: ["creativity", "love", "beauty", "luxury", "artistic abilities"],
    bestFor: ["Libra", "Taurus", "artists", "designers", "those seeking love"],
    tip: "Opals love moisture - wear them often! Storing too long can cause cracking.",
    occasions: ["romantic occasions", "creative projects", "beauty enhancement"],
    priceGuide: "Australian black opals are premium. Fire opals start at ₹3,000/carat"
  }
};

// ============================================
// EMOTIONAL INTELLIGENCE
// ============================================
const detectMood = (message) => {
  const lower = message.toLowerCase();
  
  // Excitement/Happiness
  if (/excited|happy|great|wonderful|amazing|love|perfect|yay|wow|fantastic/i.test(lower) || /!{2,}/.test(message)) {
    return { mood: 'excited', intensity: 'high' };
  }
  
  // Confusion/Uncertainty
  if (/confused|don't know|not sure|help|which one|what should|recommend/i.test(lower) || /\?{2,}/.test(message)) {
    return { mood: 'confused', intensity: 'medium' };
  }
  
  // Worry/Concern
  if (/worried|concerned|afraid|scared|nervous|anxious|problem|issue/i.test(lower)) {
    return { mood: 'worried', intensity: 'medium' };
  }
  
  // Urgency
  if (/urgent|asap|quickly|hurry|soon|immediately|tomorrow|today/i.test(lower)) {
    return { mood: 'urgent', intensity: 'high' };
  }
  
  // Skepticism
  if (/really\?|sure\?|true\?|believe|doubt|fake|scam|trust/i.test(lower)) {
    return { mood: 'skeptical', intensity: 'medium' };
  }
  
  // Gratitude
  if (/thank|thanks|shukriya|dhanyawad|grateful|appreciate/i.test(lower)) {
    return { mood: 'grateful', intensity: 'high' };
  }
  
  // Casual/Friendly
  if (/hi|hello|hey|how are|what's up/i.test(lower)) {
    return { mood: 'friendly', intensity: 'medium' };
  }
  
  return { mood: 'neutral', intensity: 'low' };
};

// ============================================
// ZODIAC FROM DATE HELPER
// ============================================
const getZodiacFromDate = (day, month) => {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'aquarius';
  return 'pisces';
};

// ============================================
// CONVERSATION CONTEXT EXTRACTION
// ============================================
const extractContext = (message, existingContext = {}) => {
  const lower = message.toLowerCase();
  const context = { ...existingContext };
  
  // Name extraction (improved - handles just saying name)
  const namePatterns = [
    /(?:i'm|i am|my name is|this is|call me|myself)\s+([A-Za-z]{2,15})/i,
    /^(?:hi|hello|hey),?\s+(?:i'm|i am)\s+([A-Za-z]{2,15})/i,
    /(?:^|\s)([A-Za-z]{2,15})\s+(?:here|speaking|this side)/i,
    /^([A-Za-z]{2,15})$/i  // Just a single name like "azhar"
  ];
  
  const notNames = ['looking', 'searching', 'need', 'want', 'interested', 'show', 'find', 'help', 'please', 'thanks', 'hello', 'hi', 'hey', 'good', 'fine', 'okay', 'yes', 'no', 'the', 'for', 'and', 'wedding', 'engagement', 'gift', 'budget', 'under', 'around', 'about', 'gemstone', 'stone', 'ring', 'love', 'health', 'wealth', 'marriage', 'zodiac', 'popular', 'trending'];
  
  for (const pattern of namePatterns) {
    const match = message.match(pattern);
    if (match && match[1] && !notNames.includes(match[1].toLowerCase()) && match[1].length >= 2) {
      context.userName = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
      break;
    }
  }
  
  // Budget extraction (comprehensive)
  const budgetPatterns = [
    /(?:budget|price|cost|spend|afford|within|around|about|upto|up to|under|below|max|maximum)\s*(?:is|of|:)?\s*(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)*)\s*(?:k|thousand|lakh|lac)?/i,
    /₹\s*(\d+(?:,\d+)*)\s*(?:k|thousand|lakh|lac)?/i,
    /(\d+(?:,\d+)*)\s*(?:k|thousand|lakh|lac)?\s*(?:₹|rs|rupees?|inr)/i,
    /(\d+)\s*(?:k|K)\b/,
    /(\d+)\s*(?:lakh|lac|L)\b/i,
    /\b(\d{5,})\b/ // 5+ digit numbers likely prices
  ];
  
  for (const pattern of budgetPatterns) {
    const match = message.match(pattern);
    if (match) {
      let budget = match[1].replace(/,/g, '');
      const fullMatch = match[0].toLowerCase();
      
      if (/k\b|thousand/i.test(fullMatch)) {
        budget = parseInt(budget) * 1000;
      } else if (/lakh|lac|l\b/i.test(fullMatch)) {
        budget = parseInt(budget) * 100000;
      } else {
        budget = parseInt(budget);
      }
      
      context.budget = budget;
      context.budgetDisplay = `₹${budget.toLocaleString('en-IN')}`;
      break;
    }
  }
  
  // Occasion detection
  const occasions = {
    wedding: /wedding|shaadi|vivah|marriage|dulhan|bride|groom/i,
    engagement: /engagement|ring|sagai|mangni|propose/i,
    anniversary: /anniversary|varshgira/i,
    birthday: /birthday|janamdin/i,
    gift: /gift|tohfa|present|surprise/i,
    astrological: /astro|jyotish|kundli|horoscope|graha|dasha|shani|rahu|ketu|mangal/i,
    daily: /daily|everyday|regular|office|work/i,
    investment: /invest|collection|value|appreciation/i
  };
  
  for (const [occasion, pattern] of Object.entries(occasions)) {
    if (pattern.test(lower)) {
      context.occasion = occasion;
      break;
    }
  }
  
  // Gemstone type detection (Hindi + English)
  const gemstoneTypes = {
    sapphire: /neelam|नीलम|blue sapphire|sapphire/i,
    ruby: /manik|माणिक्य|ruby|yakoot/i,
    emerald: /panna|पन्ना|emerald|zamurd/i,
    pearl: /moti|मोती|pearl/i,
    coral: /moonga|मूंगा|coral|marjaan/i,
    yellowSapphire: /pukhraj|पुखराज|yellow sapphire/i,
    opal: /opal|दूधिया/i,
    diamond: /heera|हीरा|diamond/i,
    catseye: /lehsunia|लहसुनिया|cat'?s?\s*eye|vaidurya/i,
    hessonite: /gomed|गोमेद|hessonite/i
  };
  
  for (const [gem, pattern] of Object.entries(gemstoneTypes)) {
    if (pattern.test(lower)) {
      context.gemstoneType = gem;
      context.gemstoneTypeDisplay = gem.charAt(0).toUpperCase() + gem.slice(1);
      break;
    }
  }
  
  // Zodiac detection
  const zodiacSigns = {
    aries: /aries|mesh|मेष/i,
    taurus: /taurus|vrishabh|वृषभ/i,
    gemini: /gemini|mithun|मिथुन/i,
    cancer: /cancer|kark|कर्क/i,
    leo: /leo|singh|सिंह/i,
    virgo: /virgo|kanya|कन्या/i,
    libra: /libra|tula|तुला/i,
    scorpio: /scorpio|vrishchik|वृश्चिक/i,
    sagittarius: /sagittarius|dhanu|धनु/i,
    capricorn: /capricorn|makar|मकर/i,
    aquarius: /aquarius|kumbh|कुंभ/i,
    pisces: /pisces|meen|मीन/i
  };
  
  for (const [sign, pattern] of Object.entries(zodiacSigns)) {
    if (pattern.test(lower)) {
      context.zodiac = sign;
      break;
    }
  }
  
  // Color preference
  const colors = {
    blue: /blue|neela|नीला/i,
    red: /red|lal|लाल/i,
    green: /green|hara|हरा/i,
    yellow: /yellow|peela|पीला/i,
    white: /white|safed|सफेद/i,
    pink: /pink|gulabi/i
  };
  
  for (const [color, pattern] of Object.entries(colors)) {
    if (pattern.test(lower)) {
      context.color = color;
      break;
    }
  }
  
  // Purpose detection
  if (/love|relationship|partner|spouse/i.test(lower)) context.purpose = 'love';
  if (/health|healing|medical|wellness|illness/i.test(lower)) context.purpose = 'health';
  if (/wealth|money|business|career|job|promotion|success/i.test(lower)) context.purpose = 'wealth';
  if (/marriage|shaadi|wedding/i.test(lower)) context.purpose = 'marriage';
  if (/protection|safety|evil|nazar/i.test(lower)) context.purpose = 'protection';
  
  // Date of Birth extraction
  const dobPatterns = [
    /(?:born on|dob|date of birth|birthday)[:\s]+(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/i,
    /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/,
    /(?:i was born|born|birth)[:\s]+.*?(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/i
  ];
  
  for (const pattern of dobPatterns) {
    const match = message.match(pattern);
    if (match) {
      context.dateOfBirth = `${match[1]}/${match[2]}/${match[3]}`;
      // Calculate zodiac from DOB
      const day = parseInt(match[1]);
      const month = parseInt(match[2]);
      context.zodiac = getZodiacFromDate(day, month);
      break;
    }
  }
  if (/protection|safety|evil|negative/i.test(lower)) context.purpose = 'protection';
  if (/peace|calm|stress|anxiety|anger/i.test(lower)) context.purpose = 'peace';
  if (/wisdom|study|exam|education|learning/i.test(lower)) context.purpose = 'wisdom';
  
  // Detect questions about gemstones
  if (/what is|tell me about|explain|benefits of|properties of|good for/i.test(lower)) {
    context.askingInfo = true;
  }
  
  // Detect price inquiry
  if (/price|cost|how much|kitna|rate/i.test(lower)) {
    context.askingPrice = true;
  }
  
  return context;
};

// Zodiac to recommended gemstones mapping (astrological recommendations)
const ZODIAC_GEMSTONES = {
  aries: ['Coral', 'Ruby', 'Diamond'],
  taurus: ['Emerald', 'Diamond', 'Sapphire'],
  gemini: ['Emerald', 'Pearl', 'Citrine'],
  cancer: ['Pearl', 'Ruby', 'Moonstone'],
  leo: ['Ruby', 'Peridot', 'Diamond'],
  virgo: ['Emerald', 'Sapphire', 'Jade'],
  libra: ['Diamond', 'Opal', 'Sapphire'],
  scorpio: ['Coral', 'Topaz', 'Ruby'],
  sagittarius: ['Sapphire', 'Topaz', 'Turquoise'],
  capricorn: ['Sapphire', 'Garnet', 'Onyx'],
  aquarius: ['Sapphire', 'Amethyst', 'Garnet'],
  pisces: ['Pearl', 'Amethyst', 'Aquamarine']
};

// ============================================
// GET MATCHING GEMSTONES - VARIETY FOCUSED
// ============================================
const getMatchingGemstones = async (context) => {
  try {
    const { budget, gemstoneType, occasion, zodiac, color, purpose } = context;
    
    // Get ALL active gemstones first, then filter and diversify
    let allGemstones = await Gemstone.find({ isActive: true })
      .select('name category priceRange price images color slug trending summary purpose certification astrologyBenefits tags description');
    
    if (allGemstones.length === 0) return [];
    
    // Score each gemstone based on context matches
    const scoredGemstones = allGemstones.map(gem => {
      let score = 0;
      const gemCategory = (gem.category || '').toLowerCase();
      const gemPurpose = (gem.purpose || []).join(' ').toLowerCase();
      const gemTags = (gem.tags || []).join(' ').toLowerCase();
      const gemBenefits = (gem.astrologyBenefits || '').toLowerCase();
      const gemDesc = (gem.description || '').toLowerCase();
      const allText = `${gemPurpose} ${gemTags} ${gemBenefits} ${gemDesc}`;
      
      // Specific gemstone type match - highest priority
      if (gemstoneType) {
        const categoryMap = {
          sapphire: 'sapphire', ruby: 'ruby', emerald: 'emerald', pearl: 'pearl',
          coral: 'coral', yellowSapphire: 'sapphire', opal: 'opal', diamond: 'diamond'
        };
        if (gemCategory === categoryMap[gemstoneType]) score += 50;
      }
      
      // Budget match
      if (budget && gem.priceRange?.min) {
        if (gem.priceRange.min <= budget && (gem.priceRange.max || gem.priceRange.min * 2) <= budget * 2) {
          score += 20;
        }
      }
      
      // Occasion/Purpose match - use $or logic (any match counts)
      if (occasion) {
        if (allText.includes(occasion.toLowerCase())) score += 15;
        // Wedding-specific gems
        if (occasion === 'wedding' || occasion === 'marriage') {
          if (['ruby', 'diamond', 'emerald', 'sapphire'].includes(gemCategory)) score += 10;
        }
      }
      
      if (purpose && allText.includes(purpose.toLowerCase())) score += 15;
      if (color && (gem.color || '').toLowerCase().includes(color.toLowerCase())) score += 10;
      
      // Zodiac match
      if (zodiac) {
        const zodiacLower = zodiac.toLowerCase();
        const recommendedGems = ZODIAC_GEMSTONES[zodiacLower] || [];
        if (recommendedGems.some(g => gemCategory.includes(g.toLowerCase()))) score += 25;
        if (allText.includes(zodiacLower)) score += 10;
      }
      
      // Trending bonus
      if (gem.trending) score += 5;
      
      return { gem, score, category: gemCategory };
    });
    
    // Sort by score
    scoredGemstones.sort((a, b) => b.score - a.score);
    
    // ENSURE VARIETY: Pick from different categories
    const selectedGemstones = [];
    const usedCategories = new Set();
    
    // First pass: Get top scoring gems from different categories
    for (const item of scoredGemstones) {
      if (selectedGemstones.length >= 4) break;
      if (!usedCategories.has(item.category) || selectedGemstones.length < 2) {
        selectedGemstones.push(item.gem);
        usedCategories.add(item.category);
      }
    }
    
    // Second pass: Fill remaining slots if needed
    for (const item of scoredGemstones) {
      if (selectedGemstones.length >= 4) break;
      if (!selectedGemstones.includes(item.gem)) {
        selectedGemstones.push(item.gem);
      }
    }
    
    // Final shuffle for randomness
    return selectedGemstones.sort(() => Math.random() - 0.5);
    
  } catch (error) {
    console.error('Error fetching gemstones:', error);
    return [];
  }
};

// ============================================
// BUILD TRUE MULTI-TURN MESSAGES ARRAY
// System prompt sets persona + context
// Full conversation history passed as actual turns
// ============================================
const buildMessages = (userMessage, history, context, gemstones, mood) => {
  const userName = context.userName || '';
  const hasGemstones = gemstones && gemstones.length > 0;

  // ---- SYSTEM PROMPT (persona + live context) ----
  let systemContent = `You are Kohinoor — a warm, knowledgeable gemstone friend who works at Kohinoor Gemstones in Bareilly, India. You have grown up surrounded by gemstones and genuinely love helping people find the right stone.

YOUR PERSONALITY:
- Talk like a helpful friend texting — casual, warm, never robotic
- Short replies (2-4 sentences max). No essays.
- Use contractions naturally (I'm, you're, that's, it's)
- Occasional emoji 💎✨ but not every sentence
- FORBIDDEN phrases: "I understand", "Based on your requirements", "As an AI", "I'd be happy to help", "Certainly!"
- PREFERRED phrases: "Oh nice!", "Got it!", "So basically...", "Here's the thing...", "Between us..."
- Ask only ONE follow-up question per reply, not multiple
- NEVER repeat information you already told in this conversation
- NEVER give the same opening line twice
- If they ask something off-topic, gently steer back to gemstones
- Always reference what they said before — show you remember the conversation

CURRENT MOOD CONTEXT: ${mood.mood} (${mood.intensity} intensity)
MOOD INSTRUCTION: ${
  mood.mood === 'excited' ? 'Match their energy! Be enthusiastic.' :
  mood.mood === 'confused' ? 'Be extra clear and patient. Ask one clarifying question.' :
  mood.mood === 'worried' ? 'Be reassuring. Give facts to ease concerns.' :
  mood.mood === 'urgent' ? 'Be efficient. Get to the point quickly but stay warm.' :
  mood.mood === 'skeptical' ? 'Be honest and factual. No hype. Let quality speak.' :
  mood.mood === 'grateful' ? 'Accept warmly. Offer to help further.' :
  'Keep it natural and friendly.'
}`;

  // Add what we know about this person
  const knownFacts = [];
  if (userName) knownFacts.push(`Name: ${userName}`);
  if (context.zodiac) knownFacts.push(`Zodiac: ${context.zodiac}${context.zodiacFromDob ? ' (from DOB)' : ''}`);
  if (context.budget) knownFacts.push(`Budget: ${context.budgetDisplay}`);
  if (context.occasion) knownFacts.push(`Occasion: ${context.occasion}`);
  if (context.gemstoneType) knownFacts.push(`Interested in: ${context.gemstoneTypeDisplay}`);
  if (context.purpose) knownFacts.push(`Purpose: ${context.purpose}`);
  if (context.userPlace) knownFacts.push(`Location: ${context.userPlace}`);
  if (knownFacts.length > 0) {
    systemContent += `\n\nWHAT YOU KNOW ABOUT THIS CUSTOMER:\n${knownFacts.join('\n')}`;
  }

  // Add gemstone knowledge if relevant
  if (context.gemstoneType && GEMSTONE_KNOWLEDGE[context.gemstoneType]) {
    const k = GEMSTONE_KNOWLEDGE[context.gemstoneType];
    systemContent += `\n\nEXPERT KNOWLEDGE (share naturally, not all at once):\n`;
    if (k.planet) systemContent += `Planet: ${k.planet}\n`;
    if (k.benefits) systemContent += `Benefits: ${k.benefits.join(', ')}\n`;
    if (k.bestFor) systemContent += `Best for: ${k.bestFor.join(', ')}\n`;
    if (k.warning) systemContent += `Important: ${k.warning}\n`;
    if (k.tip) systemContent += `Pro tip: ${k.tip}\n`;
    if (k.priceGuide) systemContent += `Price guide: ${k.priceGuide}\n`;
  }

  // Add matching gemstones context
  if (hasGemstones) {
    systemContent += `\n\nMATCHING GEMSTONES IN OUR CATALOG (mention these naturally):\n`;
    gemstones.forEach(g => {
      const price = g.priceRange?.min
        ? `₹${g.priceRange.min.toLocaleString('en-IN')}–₹${(g.priceRange.max || g.priceRange.min * 1.5).toLocaleString('en-IN')}`
        : 'price on request';
      systemContent += `• ${g.name.english} (${g.category}) at ${price}: ${g.summary || 'premium quality gemstone'}\n`;
    });
    systemContent += `Tell them you found matching options and they can see the cards below! 👇`;
  }

  // ---- BUILD MESSAGES ARRAY ----
  const messages = [{ role: 'system', content: systemContent }];

  // Add full conversation history as proper turns (last 10 for context)
  const recentHistory = history.slice(-10);
  for (const msg of recentHistory) {
    // Skip the current user message (we'll add it last)
    if (msg.role === 'user' && msg.content === userMessage && msg === recentHistory[recentHistory.length - 2]) continue;
    messages.push({ role: msg.role === 'assistant' ? 'assistant' : 'user', content: msg.content });
  }

  // The current user message is already the last in history — check if we need to add it
  const lastMsg = messages[messages.length - 1];
  if (!lastMsg || lastMsg.role !== 'user' || lastMsg.content !== userMessage) {
    messages.push({ role: 'user', content: userMessage });
  }

  return messages;
};

// ============================================
// MAIN AI ENDPOINT
// ============================================
router.post('/gemstone-ai', aiRateLimit, async (req, res) => {
  try {
    const { message, context: reqContext, sessionId: clientSessionId, userInfo } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress;
    // Use client-provided sessionId or generate from IP + timestamp
    const sessionId = clientSessionId || `session_${clientIP}`;
    
    // Validate
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    if (message.length > 500) {
      return res.status(400).json({ error: 'Message too long' });
    }
    
    // Get or create conversation
    let conversationData = conversations.get(sessionId);
    if (!conversationData || Date.now() - conversationData.lastActivity > SESSION_TIMEOUT) {
      conversationData = {
        history: [],
        context: {},
        lastActivity: Date.now()
      };
    }
    
    // Update last activity
    conversationData.lastActivity = Date.now();
    
    // Store user info in context if provided (logged-in user)
    if (userInfo) {
      console.log('[AI] User info received:', { name: userInfo.name, dob: userInfo.dob, place: userInfo.place });
      conversationData.context.userName = userInfo.name || conversationData.context.userName;
      conversationData.context.userPlace = userInfo.place || conversationData.context.userPlace;
      conversationData.context.userPhone = userInfo.phone || conversationData.context.userPhone;
      
      // Calculate zodiac from DOB if provided
      if (userInfo.dob) {
        const dob = new Date(userInfo.dob);
        if (!isNaN(dob.getTime())) {
          conversationData.context.userDob = userInfo.dob;
          conversationData.context.zodiac = getZodiacFromDate(dob.getMonth() + 1, dob.getDate());
          conversationData.context.zodiacFromDob = true;
          console.log('[AI] Calculated zodiac from DOB:', conversationData.context.zodiac);
        }
      }
    } else {
      console.log('[AI] No user info provided (guest user)');
    }
    
    // Add user message to history
    conversationData.history.push({
      role: 'user',
      content: message,
      timestamp: Date.now()
    });
    
    // Extract context from message (merges with existing context including userInfo)
    const extractedContext = extractContext(message, conversationData.context);
    conversationData.context = extractedContext;
    
    // Detect mood
    const mood = detectMood(message);
    
    // Get matching gemstones if we have enough context or user asks for suggestions
    let suggestedGemstones = [];
    const hasSearchCriteria = extractedContext.budget || extractedContext.gemstoneType || 
                              extractedContext.occasion || extractedContext.zodiac || 
                              extractedContext.purpose;
    
    // Check if user is asking for suggestions
    const wantsSuggestions = /suggest|show|recommend|options|ideas|popular|trending|best|what.*have|see.*gems/i.test(message);
    
    if (hasSearchCriteria || wantsSuggestions) {
      suggestedGemstones = await getMatchingGemstones(extractedContext);
      
      // If no matches but user wants suggestions, show trending
      if (suggestedGemstones.length === 0 && wantsSuggestions) {
        suggestedGemstones = await Gemstone.find({ isActive: true })
          .sort({ trending: -1, viewCount: -1 })
          .limit(4)
          .select('name category priceRange price images color slug trending summary purpose certification');
      }
    }
    
    // Build true multi-turn messages array
    const messages = buildMessages(
      message,
      conversationData.history,
      extractedContext,
      suggestedGemstones,
      mood
    );

    // Call AI with full conversation context
    let aiResponse = await callAIMessages(messages);

    // Clean up response artifacts
    if (aiResponse) {
      aiResponse = aiResponse
        .replace(/^[\s"']+|[\s"']+$/g, '')           // trim quotes
        .replace(/\*\*(.*?)\*\*/g, '$1')              // remove **bold**
        .replace(/^(Kohinoor:|Assistant:|Response:)/i, '') // remove role prefixes
        .replace(/^<<INSTRUCTIONS>>[\s\S]*?\n/m, '')  // remove stray system text
        .trim();
    }

    // Smart fallback when all AI providers fail
    if (!aiResponse || aiResponse.length < 5) {
      const name = extractedContext.userName;
      const convLen = conversationData.history.length;
      if (suggestedGemstones.length > 0) {
        const gemNames = suggestedGemstones.slice(0, 2).map(g => g.name?.english || g.category).join(' and ');
        aiResponse = name
          ? `${name}, check out ${gemNames} — they look perfect for what you need! Tap any card below for full details. 💎`
          : `Found some beautiful options for you — ${gemNames}! Tap the cards below to explore. 💎`;
      } else if (convLen > 2) {
        // Mid-conversation fallback — reference what was said
        aiResponse = name
          ? `Sorry ${name}, I hit a small glitch! 😅 So where were we — ${extractedContext.purpose || extractedContext.occasion ? `you were looking for something for ${extractedContext.purpose || extractedContext.occasion}` : 'you wanted gemstone recommendations'}. Still on it!`
          : `Oops, tiny glitch on my end! 😅 Still here — tell me more about what you're looking for and I'll find the perfect stone!`;
      } else {
        // Fresh start fallback
        const openers = name ? [
          `Hey ${name}! 💎 Great to meet you — are you looking for something for a special occasion, or more for astrology?`,
          `${name}! So what brings you to Kohinoor today — a gift, something for yourself, or an astrological reason?`,
          `Nice to meet you ${name} 💎 Tell me — what's the occasion? I'll find you the perfect stone!`
        ] : [
          "Hey! I'm Kohinoor 💎 Here to help you find the perfect gemstone. What are you looking for — occasion, astrology, or just something beautiful?",
          "Hi there! 💎 Tell me your zodiac, occasion, or budget and I'll pick the perfect gem for you!",
          "Hey! Welcome 💎 Are you looking for something astrological, a gift, or a treat for yourself?"
        ];
        aiResponse = openers[Math.floor(Math.random() * openers.length)];
      }
    }
    
    // Add AI response to history
    conversationData.history.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: Date.now()
    });
    
    // Save conversation
    conversations.set(sessionId, conversationData);
    
    // Cleanup old sessions periodically
    if (Math.random() < 0.1) { // 10% chance each request
      const now = Date.now();
      for (const [key, data] of conversations.entries()) {
        if (now - data.lastActivity > SESSION_TIMEOUT) {
          conversations.delete(key);
        }
      }
    }
    
    // Log for debugging
    console.log(`[Kohinoor AI] ${clientIP}: "${message.substring(0, 50)}..." → ${suggestedGemstones.length} gems`);
    
    res.json({
      response: aiResponse,
      suggestedGemstones,
      extractedParams: extractedContext,
      mood: mood.mood,
      conversationLength: conversationData.history.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Kohinoor AI Error:', error);
    
    // Try to get fallback gemstones even when AI fails
    let fallbackGemstones = [];
    try {
      fallbackGemstones = await Gemstone.find({ isActive: true, trending: true })
        .sort({ viewCount: -1 })
        .limit(4)
        .select('name category priceRange price images color slug trending summary purpose certification');
    } catch (dbError) {
      console.error('Failed to fetch fallback gemstones:', dbError);
    }
    
    const fallbackMessages = [
      "Hey! 💎 I'm taking a quick break right now, but I've got some amazing gems picked out for you! Check these beauties below 👇",
      "Oops! My brain needs a little rest 😅 But here are some stunning gemstones I think you'll love! ✨",
      "I'm a bit busy right now, but here are some of our finest gems just for you! 💎",
      "Taking a quick breather! 🌟 Meanwhile, feast your eyes on these gorgeous gemstones below!"
    ];
    
    res.json({
      response: fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)],
      suggestedGemstones: fallbackGemstones,
      isServiceDown: true,
      error: false // Don't mark as error since we're handling gracefully
    });
  }
});

// Status endpoint
router.get('/gemstone-ai/status', async (req, res) => {
  try {
    const { provider, model } = await getAIClient();
    res.json({
      status: 'active',
      provider: provider,
      model: model,
      persona: KOHINOOR_PERSONA.name,
      features: ['conversation_memory', 'emotional_intelligence', 'gemstone_expertise', 'cultural_awareness'],
      sessionTimeout: SESSION_TIMEOUT / 1000 / 60 + ' minutes'
    });
  } catch (error) {
    res.json({
      status: 'inactive',
      provider: null,
      model: null,
      error: 'No API key configured'
    });
  }
});

// Reset conversation endpoint
router.post('/gemstone-ai/reset', (req, res) => {
  const { sessionId: clientSessionId } = req.body;
  const clientIP = req.ip || req.connection.remoteAddress;
  const sessionId = clientSessionId || `session_${clientIP}`;
  conversations.delete(sessionId);
  res.json({ success: true, message: 'Conversation reset' });
});

// Clear all sessions (admin/dev use)
router.post('/gemstone-ai/clear-all', (req, res) => {
  const count = conversations.size;
  conversations.clear();
  res.json({ success: true, message: `Cleared ${count} sessions` });
});

export default router;
