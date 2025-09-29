import { Intent, ConversationContext, Entity } from './types';
import { INTENTS } from './constants';
import { extractEntities } from './entityExtractor';
import { analyzeSentiment } from './sentimentAnalyzer';
import { isLowConfidenceIntent } from './fallbackManager';

export const detectIntent = (
  message: string, 
  conversationContext: ConversationContext,
  updateConversationContext: (updater: (prev: ConversationContext) => ConversationContext) => void
): Intent => {
  const lowerMessage = message.toLowerCase();
  const entities = extractEntities(message);
  const sentiment = analyzeSentiment(message);
  
  // Keep track of entities for conversation context
  entities.forEach(entity => {
    if (!conversationContext.mentionedEntities[entity.type]) {
      conversationContext.mentionedEntities[entity.type] = [];
    }
    if (!conversationContext.mentionedEntities[entity.type].includes(entity.value)) {
      updateConversationContext(prev => ({
        ...prev,
        mentionedEntities: {
          ...prev.mentionedEntities,
          [entity.type]: [...prev.mentionedEntities[entity.type], entity.value]
        }
      }));
    }
  });
  
  // Calculate scores for each intent based on keyword matches
  const intentScores = INTENTS.map(intent => {
    let score = 0;
    let matchCount = 0;
    
    // Check for keyword matches
    intent.keywords.forEach(keyword => {
      if (lowerMessage.includes(keyword)) {
        matchCount++;
        // More specific keywords get higher scores
        score += keyword.length > 3 ? 0.4 : 0.2;
      }
    });
    
    // Adjust score based on message length and match count
    if (matchCount > 0) {
      // Normalize score based on message length (shorter messages with matches are more focused)
      const wordCount = lowerMessage.split(/\s+/).length;
      score = score * (1 + (1 / wordCount));
      
      // Boost score if multiple keywords match
      if (matchCount > 1) {
        score *= (1 + (0.1 * matchCount));
      }
    }
    
    return {
      type: intent.name,
      score: score,
    };
  });
  
  // Enhanced conversation context consideration
  if (conversationContext.lastIntent && conversationContext.messageCount < 5) {
    // If we're in a conversation thread, slightly bias toward same intent family
    intentScores.forEach(intent => {
      if (intent.type === conversationContext.lastIntent) {
        intent.score += 0.15; // Increased from 0.1 for stronger context continuity
      }
    });
  }
  
  // Consider topic history for more coherent conversations
  if (conversationContext.topicHistory && conversationContext.topicHistory.length > 0) {
    intentScores.forEach(intent => {
      // If intent matches any recent topics, give it a small boost
      if (conversationContext.topicHistory.includes(intent.type)) {
        intent.score += 0.05 * (conversationContext.topicHistory.length > 3 ? 3 : conversationContext.topicHistory.length);
      }
    });
  }
  
  // Find highest scoring intent
  const highestIntent = intentScores.reduce((highest, current) => 
    current.score > highest.score ? current : highest, 
    { type: 'technical', score: 0.3 }
  );
  
  // Calculate confidence score
  const confidence = Math.min(0.95, highestIntent.score + 0.5); // Convert score to confidence
  
  // Determine if this is a low confidence intent
  const isLowConfidence = isLowConfidenceIntent(highestIntent.type, confidence);
  
  // If no strong intent is detected, default to technical
  if (highestIntent.score < 0.3) {
    // Update failed intent count if low confidence
    updateConversationContext(prev => ({
      ...prev,
      failedIntentCount: prev.failedIntentCount + 1,
      lastUserSentiment: sentiment
    }));
    
    return { 
      type: 'technical', 
      confidence: 0.6,
      entities
    };
  }
  
  // Update conversation context with the detected intent and sentiment
  updateConversationContext(prev => {
    // Add to topic history (keep last 5 topics)
    const newTopicHistory = [...(prev.topicHistory || [])];
    if (!newTopicHistory.includes(highestIntent.type)) {
      newTopicHistory.push(highestIntent.type);
      if (newTopicHistory.length > 5) {
        newTopicHistory.shift();
      }
    }
    
    return {
      ...prev,
      lastIntent: highestIntent.type,
      messageCount: prev.messageCount + 1,
      topicHistory: newTopicHistory,
      lastUserSentiment: sentiment,
      // Reset or increment failed intent count
      failedIntentCount: isLowConfidence ? prev.failedIntentCount + 1 : 0
    };
  });
  
  return {
    type: highestIntent.type,
    confidence,
    entities
  };
};
