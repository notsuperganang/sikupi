const express = require('express');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Import chatbot from utils
let chatbotInstance = null;
let initializationError = null;

// Initialize chatbot
async function initializeChatbot() {
  try {
    console.log('🤖 Initializing Sikupi Chatbot...');
    
    const { chatbot } = require('../utils/chatbot');
    
    if (!chatbot.initialized) {
      console.log('🔄 Chatbot not initialized, initializing now...');
      await chatbot.initialize();
    }
    
    chatbotInstance = chatbot;
    initializationError = null;
    console.log('✅ Sikupi Chatbot initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize chatbot:', error.message);
    initializationError = error;
    return false;
  }
}

// Initialize chatbot on module load
initializeChatbot().then(success => {
  if (success) {
    console.log('🎉 Chatbot ready to serve requests');
  } else {
    console.log('⚠️ Chatbot initialization failed, will retry on first request');
  }
});

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    console.log('🏥 Chatbot health check requested');
    
    // If chatbot not initialized, try to initialize
    if (!chatbotInstance) {
      console.log('🔄 Chatbot not found, attempting initialization...');
      const initSuccess = await initializeChatbot();
      if (!initSuccess) {
        return res.status(503).json({
          status: 'unavailable',
          message: 'Chatbot initialization failed',
          error: initializationError?.message || 'Unknown error',
          timestamp: new Date().toISOString(),
          suggestions: [
            'Check Google Cloud configuration',
            'Verify service account credentials',
            'Ensure Vertex AI API is enabled'
          ]
        });
      }
    }

    // Perform health check
    const healthCheck = await chatbotInstance.healthCheck();
    
    console.log('📊 Health check result:', healthCheck.status);
    
    const statusCode = healthCheck.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json({
      ...healthCheck,
      backend_integration: 'active',
      integration_timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('💥 Health check error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString(),
      suggestions: [
        'Check server logs for details',
        'Verify chatbot service configuration',
        'Ensure all dependencies are installed'
      ]
    });
  }
});

// Send message to chatbot
router.post('/message', optionalAuth, async (req, res) => {
  try {
    const { message } = req.body;
    
    console.log('💬 Chatbot message received:', { 
      messageLength: message?.length,
      preview: message?.substring(0, 50) + '...',
      userId: req.user?.id || 'anonymous'
    });
    
    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Message is required and must be a non-empty string',
        timestamp: new Date().toISOString()
      });
    }

    // Check message length
    if (message.length > 1000) {
      return res.status(400).json({ 
        success: false,
        error: 'Message too long. Please keep messages under 1000 characters',
        timestamp: new Date().toISOString()
      });
    }

    // Check if chatbot is available
    if (!chatbotInstance) {
      console.log('🔄 Chatbot not available, attempting initialization...');
      const initSuccess = await initializeChatbot();
      if (!initSuccess) {
        return res.status(503).json({ 
          success: false,
          message: 'Layanan chatbot sedang tidak tersedia. Tim teknis sedang memperbaiki masalah ini.',
          error: 'Chatbot service unavailable',
          timestamp: new Date().toISOString(),
          suggestions: [
            'Silakan coba lagi dalam beberapa menit',
            'Refresh halaman dan coba lagi',
            'Hubungi customer support jika masalah berlanjut'
          ]
        });
      }
    }

    // Generate session ID - use user ID if authenticated, otherwise use IP
    const sessionId = req.user?.id || req.ip || req.connection.remoteAddress || 'anonymous_' + Date.now();
    
    console.log('🎯 Generating response for session:', sessionId);
    
    // Generate response using chatbot
    const startTime = Date.now();
    const response = await chatbotInstance.generateResponse(
      message.trim(), 
      sessionId,
      { useContext: true }
    );
    const responseTime = Date.now() - startTime;

    console.log('✅ Response generated successfully:', {
      sessionId,
      responseTime: responseTime + 'ms',
      urgency: response.urgencyLevel,
      success: response.success
    });

    // Add additional metadata
    response.backend_processed = true;
    response.response_time_ms = responseTime;
    response.session_id = sessionId;
    response.user_authenticated = !!req.user;

    res.json(response);
    
  } catch (error) {
    console.error('💥 Error in chatbot message processing:', error);
    
    // Determine error type and provide appropriate response
    let errorResponse = {
      success: false,
      message: 'Maaf, terjadi kesalahan pada sistem chatbot. Silakan coba lagi dalam beberapa saat.',
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
      suggestions: [
        'Coba kirim pesan lagi',
        'Refresh halaman dan coba lagi',
        'Hubungi customer support jika masalah berlanjut'
      ]
    };

    // Check specific error types
    if (error.message.includes('timeout')) {
      errorResponse.message = 'Respons chatbot memerlukan waktu terlalu lama. Silakan coba dengan pertanyaan yang lebih singkat.';
      errorResponse.error = 'Response timeout';
    } else if (error.message.includes('rate limit')) {
      errorResponse.message = 'Terlalu banyak permintaan. Silakan tunggu sebentar sebelum mencoba lagi.';
      errorResponse.error = 'Rate limit exceeded';
    } else if (error.message.includes('authentication') || error.message.includes('permission')) {
      errorResponse.message = 'Terjadi masalah konfigurasi sistem. Tim teknis sedang menangani masalah ini.';
      errorResponse.error = 'Authentication/Permission error';
    } else if (error.message.includes('quota')) {
      errorResponse.message = 'Layanan chatbot sedang mencapai batas maksimum. Silakan coba lagi nanti.';
      errorResponse.error = 'Quota exceeded';
    }
    
    res.status(500).json(errorResponse);
  }
});

// Get conversation history
router.get('/history', optionalAuth, async (req, res) => {
  try {
    if (!chatbotInstance) {
      return res.status(503).json({ 
        success: false,
        error: 'Chatbot service is not available' 
      });
    }

    const sessionId = req.user?.id || req.ip || req.connection.remoteAddress || 'anonymous';
    const history = chatbotInstance.getConversationHistory(sessionId);
    
    console.log('📜 Conversation history requested for session:', sessionId);
    
    res.json({
      success: true,
      history: history || null,
      timestamp: new Date().toISOString(),
      session_id: sessionId,
      user_authenticated: !!req.user
    });
    
  } catch (error) {
    console.error('💥 Error getting conversation history:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get conversation history',
      timestamp: new Date().toISOString()
    });
  }
});

// Clear conversation history
router.delete('/history', optionalAuth, async (req, res) => {
  try {
    if (!chatbotInstance) {
      return res.status(503).json({ 
        success: false,
        error: 'Chatbot service is not available' 
      });
    }

    const sessionId = req.user?.id || req.ip || req.connection.remoteAddress || 'anonymous';
    chatbotInstance.clearConversationHistory(sessionId);
    
    console.log('🗑️ Conversation history cleared for session:', sessionId);
    
    res.json({
      success: true,
      message: 'Riwayat percakapan telah dihapus',
      timestamp: new Date().toISOString(),
      session_id: sessionId,
      user_authenticated: !!req.user
    });
    
  } catch (error) {
    console.error('💥 Error clearing conversation history:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to clear conversation history',
      timestamp: new Date().toISOString()
    });
  }
});

// Get chatbot metrics (for monitoring)
router.get('/metrics', async (req, res) => {
  try {
    if (!chatbotInstance) {
      return res.status(503).json({ 
        error: 'Chatbot service is not available' 
      });
    }

    const metrics = chatbotInstance.getMetrics();
    
    res.json({
      ...metrics,
      backend_integration: 'active',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('💥 Error getting chatbot metrics:', error);
    res.status(500).json({ 
      error: 'Failed to get metrics',
      timestamp: new Date().toISOString()
    });
  }
});

// Test endpoint for troubleshooting
router.get('/test', async (req, res) => {
  try {
    console.log('🧪 Running chatbot test...');
    
    if (!chatbotInstance) {
      const initSuccess = await initializeChatbot();
      if (!initSuccess) {
        return res.status(503).json({
          test: 'failed',
          reason: 'Chatbot initialization failed',
          error: initializationError?.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Test with a simple message
    const testMessage = 'Halo SikupiBot, ini adalah test koneksi';
    const response = await chatbotInstance.generateResponse(testMessage, 'test_session');
    
    res.json({
      test: 'success',
      test_message: testMessage,
      response_received: response.success,
      response_length: response.message?.length || 0,
      chatbot_status: 'working',
      model: 'gemini-2.0-flash-001',
      provider: 'vertex-ai',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('💥 Test failed:', error);
    res.status(500).json({
      test: 'failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get chatbot configuration info
router.get('/config', (req, res) => {
  res.json({
    chatbot_name: 'SikupiBot',
    model: 'gemini-2.0-flash-001',
    provider: 'vertex-ai',
    features: [
      'Coffee waste marketplace guidance',
      'Sustainability tips and advice',
      'Product quality information',
      'Platform feature explanations',
      'Educational content delivery'
    ],
    capabilities: [
      'Natural language understanding',
      'Context-aware conversations',
      'Multi-session support',
      'Urgency detection',
      'Conversation history management'
    ],
    supported_languages: ['Bahasa Indonesia', 'English'],
    message_limits: {
      max_length: 1000,
      rate_limit: '100 requests per 15 minutes per IP'
    },
    session_management: {
      authenticated_users: 'User ID based sessions',
      anonymous_users: 'IP based sessions',
      history_retention: 'Last 20 messages per session'
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;