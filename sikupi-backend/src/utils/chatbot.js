const { VertexAI } = require('@google-cloud/vertexai');
const crypto = require('crypto');

class SikupiChatbot {
  constructor() {
    this.vertexAI = null;
    this.model = null;
    this.initialized = false;
    this.initializationError = null;
    this.conversationHistory = new Map(); // Store conversation context
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      startTime: new Date()
    };
    
    this.systemPrompt = `You are SikupiBot, an AI assistant for Sikupi - a smart coffee waste marketplace platform. Your role is to help users understand coffee waste management, marketplace features, and provide guidance on sustainable coffee waste practices.

Key information about Sikupi:
- A platform connecting coffee waste producers (cafes, hotels) with buyers (farmers, artisans, recyclers)
- Features AI quality assessment for coffee waste
- Includes marketplace for buying/selling coffee waste products
- Provides educational content about coffee waste utilization
- Tracks environmental and economic impact

Your capabilities:
1. Explain coffee waste types and their uses
2. Guide users through the marketplace (buying, selling, listing products)
3. Provide information about coffee waste quality grades
4. Offer sustainability tips and best practices
5. Help with account and transaction questions
6. Share educational content about coffee waste

Communication style:
- Friendly and knowledgeable
- Use simple, clear language
- Provide practical, actionable advice
- Be encouraging about sustainable practices
- Always be helpful and solution-oriented
- Respond in Bahasa Indonesia when appropriate

Important: If asked about technical issues, payment problems, or account security, recommend contacting customer support for personalized assistance.`;

    console.log('🤖 SikupiBot instance created');
  }

  /**
   * Initialize the Vertex AI client for Gemini
   */
  async initialize() {
    try {
      console.log('🤖 Initializing SikupiBot with Vertex AI...');
      
      // Initialize Vertex AI with project configuration
      this.vertexAI = new VertexAI({
        project: process.env.GOOGLE_CLOUD_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT,
        location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
        googleAuthOptions: {
          keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
        }
      });

      // Configure Gemini model
      this.model = this.vertexAI.getGenerativeModel({
        model: 'gemini-2.0-flash-001',
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      });

      // Test the connection
      await this._testConnection();

      this.initialized = true;
      this.initializationError = null;
      
      console.log('✅ SikupiBot initialized successfully');
      return true;
    } catch (error) {
      this.initializationError = error;
      this.initialized = false;
      
      console.error('❌ Failed to initialize SikupiBot:', error.message);
      throw error;
    }
  }

  /**
   * Test connection to Vertex AI
   */
  async _testConnection() {
    try {
      const testResult = await this.model.generateContent('Test connection');
      console.log('✅ Connection test successful');
      return testResult;
    } catch (error) {
      console.error('❌ Connection test failed:', error.message);
      throw new Error(`Connection test failed: ${error.message}`);
    }
  }

  /**
   * Generate response with comprehensive processing
   */
  async generateResponse(userMessage, sessionId = null, options = {}) {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      // Check if chatbot is initialized
      if (!this.initialized) {
        if (this.initializationError) {
          throw this.initializationError;
        }
        throw new Error('Chatbot not initialized. Call initialize() first.');
      }

      // Input validation
      if (!userMessage || typeof userMessage !== 'string' || userMessage.trim().length === 0) {
        throw new Error('Pesan tidak boleh kosong');
      }

      if (userMessage.length > 1000) {
        throw new Error('Pesan terlalu panjang. Maksimal 1000 karakter.');
      }

      const sanitizedMessage = this._sanitizeInput(userMessage);

      // Build conversation context
      let prompt;
      const conversationContext = this.conversationHistory.get(sessionId);
      
      if (conversationContext && options.useContext) {
        prompt = this._createFollowUpPrompt(conversationContext.lastResponse, sanitizedMessage);
      } else {
        prompt = this._createSikupiPrompt(sanitizedMessage);
      }

      // Determine urgency level
      const urgencyLevel = this._determineUrgency(sanitizedMessage);

      // Generate response using Gemini
      const generatedText = await this._generateWithTimeout(prompt);

      // Update conversation history
      if (sessionId) {
        this.conversationHistory.set(sessionId, {
          lastMessage: sanitizedMessage,
          lastResponse: generatedText,
          timestamp: new Date().toISOString(),
          urgencyLevel
        });

        // Keep only last 20 messages to manage memory
        if (this.conversationHistory.size > 20) {
          const firstKey = this.conversationHistory.keys().next().value;
          this.conversationHistory.delete(firstKey);
        }
      }

      // Update metrics
      this.metrics.successfulRequests++;
      const responseTime = Date.now() - startTime;
      this._updateAverageResponseTime(responseTime);

      console.log('✅ Response generated successfully:', {
        sessionId,
        responseTime,
        urgencyLevel,
        messageLength: sanitizedMessage.length,
        responseLength: generatedText.length
      });

      return {
        success: true,
        message: generatedText,
        urgencyLevel: urgencyLevel,
        responseTime: responseTime,
        timestamp: new Date().toISOString(),
        sessionId: sessionId,
        model: 'gemini-2.0-flash-001',
        provider: 'vertex-ai'
      };

    } catch (error) {
      this.metrics.failedRequests++;
      const responseTime = Date.now() - startTime;

      console.error('❌ Error generating response:', error.message);

      return {
        success: false,
        message: 'Maaf, saya sedang mengalami kendala teknis. Silakan coba lagi dalam beberapa saat atau hubungi customer support untuk bantuan lebih lanjut.',
        error: this._categorizeError(error),
        urgencyLevel: 'medium',
        responseTime: responseTime,
        timestamp: new Date().toISOString(),
        sessionId: sessionId,
        technical_details: error.message
      };
    }
  }

  /**
   * Generate content with timeout protection
   */
  async _generateWithTimeout(prompt) {
    return new Promise(async (resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Response generation timeout'));
      }, 30000); // 30 seconds timeout

      try {
        const result = await this.model.generateContent(prompt);
        clearTimeout(timeoutId);

        let generatedText = 'Maaf, saya tidak dapat memberikan jawaban saat ini. Silakan coba lagi atau hubungi customer support jika Anda memerlukan bantuan segera.';
        
        if (result && result.response) {
          const response = result.response;
          if (response.candidates && response.candidates.length > 0) {
            const candidate = response.candidates[0];
            if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
              generatedText = candidate.content.parts[0].text || generatedText;
            }
          }
        }

        resolve(generatedText);
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }

  /**
   * Create Sikupi-specific prompt
   */
  _createSikupiPrompt(userMessage) {
    return `${this.systemPrompt}

Current user message: ${userMessage}

Please respond as SikupiBot with helpful, accurate information about coffee waste management, marketplace features, or sustainability practices. Be friendly and provide practical advice.`;
  }

  /**
   * Create follow-up prompt with context
   */
  _createFollowUpPrompt(previousResponse, newMessage) {
    return `${this.systemPrompt}

Previous conversation context: ${previousResponse}

Current user message: ${newMessage}

Please respond as SikupiBot, taking into account the previous conversation context while providing helpful information about coffee waste management and marketplace features.`;
  }

  /**
   * Sanitize user input
   */
  _sanitizeInput(input) {
    return input
      .trim()
      .replace(/[<>\"'%;()&+]/g, '') // Remove potential XSS characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Remove control characters
  }

  /**
   * Determine urgency level from message content
   */
  _determineUrgency(message) {
    const urgentKeywords = ['urgent', 'emergency', 'help', 'problem', 'error', 'not working', 'broken', 'darurat', 'rusak', 'gagal'];
    const mediumKeywords = ['question', 'how', 'what', 'why', 'when', 'where', 'bagaimana', 'apa', 'mengapa', 'kapan', 'dimana'];
    
    const lowerMessage = message.toLowerCase();
    
    if (urgentKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'high';
    } else if (mediumKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * Categorize errors for better error handling
   */
  _categorizeError(error) {
    if (error.message.includes('timeout')) {
      return 'timeout';
    } else if (error.message.includes('quota') || error.message.includes('rate limit')) {
      return 'quota_exceeded';
    } else if (error.message.includes('authentication') || error.message.includes('permission')) {
      return 'auth_error';
    } else if (error.message.includes('not initialized')) {
      return 'not_initialized';
    } else {
      return 'internal_error';
    }
  }

  /**
   * Update average response time
   */
  _updateAverageResponseTime(responseTime) {
    if (this.metrics.successfulRequests === 1) {
      this.metrics.averageResponseTime = responseTime;
    } else {
      this.metrics.averageResponseTime = 
        (this.metrics.averageResponseTime * (this.metrics.successfulRequests - 1) + responseTime) / this.metrics.successfulRequests;
    }
  }

  /**
   * Get conversation history for a session
   */
  getConversationHistory(sessionId) {
    return this.conversationHistory.get(sessionId) || null;
  }

  /**
   * Clear conversation history for a session
   */
  clearConversationHistory(sessionId) {
    if (sessionId) {
      this.conversationHistory.delete(sessionId);
      console.log('🗑️ Conversation history cleared for session:', sessionId);
    }
  }

  /**
   * Enhanced health check
   */
  async healthCheck() {
    try {
      if (!this.initialized) {
        return {
          status: 'unhealthy',
          message: 'Chatbot not initialized',
          error: this.initializationError?.message || 'Unknown initialization error',
          timestamp: new Date().toISOString()
        };
      }

      // Test with a simple message
      const testStart = Date.now();
      const testResponse = await this._generateWithTimeout('Health check test');
      const testTime = Date.now() - testStart;

      return {
        status: 'healthy',
        message: 'SikupiBot is working properly',
        model: 'gemini-2.0-flash-001',
        provider: 'vertex-ai',
        project: process.env.GOOGLE_CLOUD_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT,
        location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
        testResponseTime: testTime,
        testSuccess: !!testResponse,
        activeConversations: this.conversationHistory.size,
        metrics: this.getMetrics(),
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      
      return {
        status: 'unhealthy',
        message: 'Health check failed',
        error: error.message,
        metrics: this.getMetrics(),
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get system metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      activeConversations: this.conversationHistory.size,
      initialized: this.initialized,
      successRate: this.metrics.totalRequests > 0 
        ? (this.metrics.successfulRequests / this.metrics.totalRequests * 100).toFixed(2) + '%'
        : '0%',
      uptimeSeconds: Math.floor((new Date() - this.metrics.startTime) / 1000),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      startTime: new Date()
    };
    console.log('📊 Metrics reset');
  }

  /**
   * Clear all caches and conversation history
   */
  clearCache() {
    this.conversationHistory.clear();
    console.log('🗑️ All conversation history cleared');
  }
}

// Create singleton instance
const chatbot = new SikupiChatbot();

module.exports = {
  chatbot,
  SikupiChatbot
};