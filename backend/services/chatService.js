/**
 * CuraBot Chat Service
 * Rule-based Ayurvedic + therapy + booking intent engine
 */

import { findMany, findOne, insertOne } from '../config/database.js';

// Intent patterns and responses
const INTENTS = {
  GREETING: {
    patterns: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'namaste'],
    responses: [
      "Namaste! 🙏 I'm CuraBot, your Ayurvedic wellness assistant. How can I help you today?",
      "Hello! Welcome to CuraOne. I'm here to help you with therapies, bookings, and Ayurvedic wellness questions.",
      "Hi there! I'm CuraBot. Would you like to book a therapy, check your dosha, or learn about our treatments?"
    ]
  },
  BOOKING_INTENT: {
    patterns: ['book', 'appointment', 'schedule', 'reserve', 'booking', 'session', 'available slots', 'when can i'],
    responses: [
      "I'd be happy to help you book a therapy session! 📅 Would you like me to show you available slots, or would you prefer to browse our therapies first?",
      "Great choice! To book a session, you can use the 'Book Session' button on your dashboard, or tell me which therapy interests you."
    ],
    action: 'SHOW_BOOKING'
  },
  THERAPY_INFO: {
    patterns: ['therapy', 'treatment', 'therapies', 'abhyanga', 'shirodhara', 'panchakarma', 'massage', 'oil', 'detox'],
    responses: [
      "We offer several authentic Ayurvedic therapies:\n\n🌿 **Abhyanga** - Full body oil massage for relaxation and detox ($120, 60 min)\n\n💧 **Shirodhara** - Oil pouring therapy for mental calmness ($150, 45 min)\n\n✨ **Panchakarma** - Complete detox program ($300, 90 min)\n\nWould you like more details about any specific therapy?",
    ],
    action: 'SHOW_THERAPIES'
  },
  DOSHA_INFO: {
    patterns: ['dosha', 'vata', 'pitta', 'kapha', 'constitution', 'body type', 'prakriti', 'quiz'],
    responses: [
      "Understanding your dosha (body constitution) is fundamental to Ayurvedic wellness! 🌟\n\n**Three Doshas:**\n- 🌬️ **Vata** - Air & Space (movement, creativity)\n- 🔥 **Pitta** - Fire & Water (transformation, digestion)\n- 🌍 **Kapha** - Earth & Water (structure, stability)\n\nWould you like to take our Dosha Quiz to discover your constitution?",
    ],
    action: 'SHOW_DOSHA_QUIZ'
  },
  PRESCRIPTION_INFO: {
    patterns: ['prescription', 'medicine', 'medication', 'herbs', 'remedy', 'treatment plan'],
    responses: [
      "Your prescriptions are managed by your practitioner. You can view your active prescriptions in the 'Prescriptions' section of your dashboard. 📋\n\nIf you have questions about a specific prescription, I recommend discussing with your practitioner during your next session."
    ],
    action: 'SHOW_PRESCRIPTIONS'
  },
  WELLNESS_TIP: {
    patterns: ['tip', 'advice', 'healthy', 'wellness', 'routine', 'lifestyle', 'diet', 'sleep', 'stress'],
    responses: [
      "Here's an Ayurvedic wellness tip! 🌿\n\n**Daily Routine (Dinacharya):**\n1. Wake up before sunrise\n2. Drink warm water with lemon\n3. Practice oil pulling\n4. Do gentle yoga or stretching\n5. Eat your largest meal at midday\n6. Sleep before 10 PM\n\nWould you like more tips based on your dosha?",
      "Stress relief tip from Ayurveda: 🧘\n\nTry **Pranayama** (breathing exercises):\n- Sit comfortably\n- Breathe in for 4 counts\n- Hold for 4 counts\n- Breathe out for 6 counts\n- Repeat 5-10 times\n\nThis calms the nervous system naturally!"
    ]
  },
  HELP: {
    patterns: ['help', 'what can you do', 'options', 'menu', 'features', 'assist'],
    responses: [
      "I can help you with:\n\n📅 **Book Therapy** - Schedule appointments\n🔍 **Check Dosha** - Take our constitution quiz\n💆 **Therapy Info** - Learn about our treatments\n📋 **Prescriptions** - View your medications\n💡 **Wellness Tips** - Get Ayurvedic advice\n\nJust ask about any of these topics!"
    ]
  },
  FAREWELL: {
    patterns: ['bye', 'goodbye', 'thanks', 'thank you', 'see you', 'later'],
    responses: [
      "Thank you for chatting! 🙏 Remember, wellness is a journey. Take care and stay healthy!",
      "Goodbye! May your path be filled with health and harmony. Come back anytime you need assistance!"
    ]
  }
};

// Suggested quick actions
const QUICK_SUGGESTIONS = [
  { text: 'Book Therapy', action: 'SHOW_BOOKING' },
  { text: 'Check Dosha', action: 'SHOW_DOSHA_QUIZ' },
  { text: 'View Prescriptions', action: 'SHOW_PRESCRIPTIONS' },
  { text: 'Wellness Tips', action: 'WELLNESS_TIP' }
];

/**
 * Detect intent from user message
 */
const detectIntent = (message) => {
  const lowerMessage = message.toLowerCase();
  
  for (const [intentName, intentData] of Object.entries(INTENTS)) {
    for (const pattern of intentData.patterns) {
      if (lowerMessage.includes(pattern)) {
        return { intent: intentName, data: intentData };
      }
    }
  }
  
  return { intent: 'UNKNOWN', data: null };
};

/**
 * Get available slots for booking intent
 */
const getAvailableSlots = async () => {
  const practitioners = findMany('users', { role: 'practitioner', isActive: true });
  
  if (practitioners.length === 0) {
    return "No practitioners are currently available. Please check back later or contact support.";
  }
  
  const practitionerInfo = practitioners.map(p => 
    `• ${p.firstName} ${p.lastName} - ${(p.specialization || []).join(', ')}`
  ).join('\n');
  
  return `Available practitioners:\n${practitionerInfo}\n\nUse the booking form to see available time slots.`;
};

/**
 * Get therapy recommendations based on user concerns
 */
const getTherapyRecommendation = (concerns) => {
  const recommendations = {
    stress: ['Shirodhara', 'Abhyanga'],
    pain: ['Abhyanga', 'Panchakarma'],
    detox: ['Panchakarma', 'Swedana'],
    relaxation: ['Abhyanga', 'Shirodhara'],
    sleep: ['Shirodhara', 'Abhyanga']
  };
  
  for (const [concern, therapies] of Object.entries(recommendations)) {
    if (concerns.toLowerCase().includes(concern)) {
      return therapies;
    }
  }
  
  return ['Abhyanga', 'Shirodhara'];
};

/**
 * Generate response based on intent
 */
const generateResponse = async (intent, intentData, userId) => {
  if (!intentData) {
    return {
      message: "I'm not sure I understand. Could you rephrase that? Or try asking about:\n\n• Booking a therapy\n• Dosha quiz\n• Our treatments\n• Wellness tips",
      suggestions: QUICK_SUGGESTIONS,
      action: null
    };
  }
  
  // Get random response from intent responses
  const responses = intentData.responses;
  const message = responses[Math.floor(Math.random() * responses.length)];
  
  // Add context-specific information for booking intents
  let additionalInfo = '';
  if (intent === 'BOOKING_INTENT') {
    additionalInfo = '\n\n' + await getAvailableSlots();
  }
  
  return {
    message: message + additionalInfo,
    suggestions: QUICK_SUGGESTIONS,
    action: intentData.action || null
  };
};

/**
 * Rate limiting check
 */
const checkRateLimit = async (userId) => {
  const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
  const recentChats = findMany('chats', { userId })
    .filter(chat => chat.timestamp > oneMinuteAgo);
  
  return recentChats.length < 20; // Max 20 messages per minute
};

/**
 * Sanitize user input
 */
const sanitizeInput = (message) => {
  if (!message || typeof message !== 'string') {
    return '';
  }
  
  // Remove HTML tags
  let sanitized = message.replace(/<[^>]*>/g, '');
  
  // Limit length
  sanitized = sanitized.slice(0, 500);
  
  // Remove potentially harmful characters
  sanitized = sanitized.replace(/[<>\"'`;]/g, '');
  
  return sanitized.trim();
};

/**
 * Process chat message and generate response
 */
export const processMessage = async (userId, userMessage, userRole = 'patient') => {
  // Sanitize input
  const sanitizedMessage = sanitizeInput(userMessage);
  
  if (!sanitizedMessage) {
    return {
      success: false,
      error: 'Invalid message',
      message: null
    };
  }
  
  // Check rate limit
  const withinLimit = await checkRateLimit(userId);
  if (!withinLimit) {
    return {
      success: false,
      error: 'Rate limit exceeded. Please wait a moment before sending more messages.',
      message: null
    };
  }
  
  // Detect intent
  const { intent, data } = detectIntent(sanitizedMessage);
  
  // Generate response
  const response = await generateResponse(intent, data, userId);
  
  // Save conversation to database
  const chatEntry = await insertOne('chats', {
    userId,
    userRole,
    userMessage: sanitizedMessage,
    botResponse: response.message,
    intent,
    action: response.action,
    timestamp: new Date().toISOString()
  });
  
  return {
    success: true,
    message: {
      id: chatEntry.id,
      response: response.message,
      suggestions: response.suggestions,
      action: response.action,
      timestamp: chatEntry.timestamp
    }
  };
};

/**
 * Get chat history for a user
 */
export const getChatHistory = async (userId, limit = 50) => {
  const chats = findMany('chats', { userId }, {
    sortBy: 'timestamp',
    sortOrder: 'desc',
    limit
  });
  
  return chats.reverse();
};

export { QUICK_SUGGESTIONS };

export default {
  processMessage,
  getChatHistory,
  QUICK_SUGGESTIONS
};
