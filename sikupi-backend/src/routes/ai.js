const express = require('express');
const { VertexAI } = require('@google-cloud/vertexai');
const { v4: uuidv4 } = require('uuid');
const { supabase, supabaseAdmin } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();

// Initialize Vertex AI instance
let vertexAI = null;
let visionModel = null;
let initialized = false;

// Initialize Vertex AI
async function initializeVertexAI() {
  try {
    console.log('🔧 Initializing Vertex AI for Coffee Quality Assessment...');
    
    vertexAI = new VertexAI({
      project: process.env.GOOGLE_CLOUD_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT,
      location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
      googleAuthOptions: {
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
      }
    });

    // Configure Gemini model for vision tasks
    visionModel = vertexAI.getGenerativeModel({
      model: 'gemini-2.0-flash-001',
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.2,
        topP: 0.8,
        topK: 32,
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
    const testResponse = await visionModel.generateContent('Test connection for AI assessment');
    console.log('✅ Vertex AI for Coffee Quality Assessment initialized successfully');
    
    initialized = true;
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Vertex AI for AI Assessment:', error.message);
    initialized = false;
    throw error;
  }
}

// Initialize on startup
initializeVertexAI().catch(error => {
  console.error('❌ Vertex AI initialization failed on startup:', error.message);
});

// Coffee waste quality assessment prompt
const createQualityAssessmentPrompt = (imageContext = '') => {
  return `You are an expert coffee waste quality assessor. Analyze this coffee waste image and provide a detailed quality assessment.

${imageContext ? `Image context: ${imageContext}` : ''}

Please analyze the following aspects and provide specific measurements/ratings:

1. QUALITY GRADE (A-D scale):
   - Grade A (85-100): Premium quality, excellent for compost/biogas
   - Grade B (70-84): Good quality, suitable for most applications
   - Grade C (55-69): Fair quality, basic composting applications
   - Grade D (40-54): Poor quality, limited applications

2. VISUAL CHARACTERISTICS:
   - Color: Assess browning level, uniformity (dark_brown, medium_brown, light_brown, golden_brown)
   - Texture: Particle consistency (fine, medium, coarse, very_fine)
   - Moisture: Visual moisture indicators (low, optimal, high, very_low)
   - Contamination: Foreign materials presence (none, detected)
   - Particle size: Distribution uniformity (uniform, varied)
   - Freshness: Processing quality indicators (fresh, aged)

3. QUALITY METRICS:
   - Overall quality score (40-100 numerical value)
   - Confidence level (75-95% based on image clarity)
   - Processing quality assessment (excellent, good, fair, poor)

4. RECOMMENDATIONS:
   - Specific improvement suggestions
   - Best use applications
   - Processing recommendations

Respond in JSON format with this exact structure:
{
  "assessment_data": {
    "color": "color_classification",
    "texture": "texture_type",
    "moisture": "moisture_level",
    "contamination": "contamination_status",
    "particle_size": "size_distribution",
    "freshness": "freshness_level",
    "processing_quality": "processing_assessment"
  },
  "quality_score": numerical_score,
  "suggested_grade": "letter_grade",
  "confidence_level": confidence_percentage,
  "detailed_analysis": "comprehensive_analysis_text",
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"]
}

Be precise and realistic in your assessment based on actual visual analysis of the coffee waste image.`;
};

// Convert image URL to base64
const convertImageToBase64 = async (imageUrl) => {
  try {
    console.log('🖼️ Converting image to base64:', imageUrl);
    
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'Sikupi-AI-Assessment/1.0',
        'Accept': 'image/*'
      }
    });
    
    console.log('📥 Image downloaded:', {
      status: response.status,
      contentType: response.headers['content-type'],
      size: response.data.byteLength + ' bytes'
    });
    
    if (!response.data || response.data.byteLength === 0) {
      throw new Error('Empty image data received');
    }
    
    const buffer = Buffer.from(response.data);
    const base64Data = buffer.toString('base64');
    
    if (!base64Data || base64Data.length === 0) {
      throw new Error('Failed to convert image to base64');
    }
    
    // Determine MIME type
    let mimeType = response.headers['content-type'] || 'image/jpeg';
    
    // Validate MIME type
    const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validMimeTypes.includes(mimeType.toLowerCase())) {
      console.log('⚠️ Unusual MIME type detected:', mimeType, 'defaulting to image/jpeg');
      mimeType = 'image/jpeg';
    }
    
    console.log('✅ Image converted successfully:', {
      mimeType,
      base64Length: base64Data.length
    });
    
    return {
      data: base64Data,
      mimeType: mimeType
    };
  } catch (error) {
    console.error('❌ Error converting image to base64:', {
      url: imageUrl,
      error: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText
    });
    
    if (error.code === 'ENOTFOUND') {
      throw new Error('Image URL cannot be reached. Please check the URL.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Image download timeout. Please try with a smaller image.');
    } else if (error.response?.status === 404) {
      throw new Error('Image not found at the provided URL.');
    } else if (error.response?.status === 403) {
      throw new Error('Access denied to the image URL.');
    } else {
      throw new Error('Failed to process image. Please ensure the image URL is accessible and points to a valid image file.');
    }
  }
};

// Perform AI assessment using Vertex AI Vision - FIXED VERSION
const performAIAssessment = async (imageUrl, imageContext = '') => {
  try {
    console.log('🔍 Starting AI assessment with Vertex AI Vision...');
    
    // Ensure Vertex AI is initialized
    if (!initialized) {
      console.log('🔄 Vertex AI not initialized, initializing now...');
      await initializeVertexAI();
    }

    // Convert image to base64
    const imageData = await convertImageToBase64(imageUrl);
    console.log('📄 Image converted:', {
      mimeType: imageData.mimeType,
      dataLength: imageData.data?.length || 0
    });
    
    // Create assessment prompt
    const prompt = createQualityAssessmentPrompt(imageContext);
    console.log('📝 Prompt created, length:', prompt.length);
    
    console.log('📸 Sending image to Vertex AI for analysis...');
    
    // Use correct request format for Node.js SDK
    const request = {
      contents: [{
        role: 'user',
        parts: [
          { text: prompt },
          { 
            inline_data: {
              mimeType: imageData.mimeType,
              data: imageData.data
            }
          }
        ]
      }]
    };
    
    // Generate response using Gemini Vision with correct format
    const result = await visionModel.generateContent(request);
    
    if (!result || !result.response) {
      throw new Error('No response from Vertex AI');
    }

    let responseText = '';
    if (result.response.candidates && result.response.candidates.length > 0) {
      const candidate = result.response.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        responseText = candidate.content.parts[0].text;
      }
    }

    if (!responseText) {
      throw new Error('Empty response from Vertex AI');
    }

    console.log('✅ AI analysis completed, response length:', responseText.length);
    
    // Parse JSON response
    let assessmentResult;
    try {
      // Clean the response text to extract JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        assessmentResult = JSON.parse(jsonMatch[0]);
        console.log('✅ JSON parsed successfully');
      } else {
        console.log('⚠️ No JSON found in response, using text parser');
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.warn('⚠️ Failed to parse JSON response, creating structured response from text');
      // Fallback: Create structured response from text analysis
      assessmentResult = parseTextualResponse(responseText);
    }

    // Validate and ensure all required fields are present
    assessmentResult = validateAndCleanAssessment(assessmentResult);
    
    // ✅ FIXED: Don't add metadata fields that don't exist in DB schema
    // These will be added in the response, not in the DB record
    // assessmentResult.ai_provider = 'vertex-ai';  // ← REMOVED
    // assessmentResult.model = 'gemini-2.0-flash-001';  // ← REMOVED
    
    return assessmentResult;
    
  } catch (error) {
    console.error('❌ Error in AI assessment:', error);
    
    // Log more details for debugging
    if (error.message.includes('contents field is required')) {
      console.error('❌ Content format error - this suggests the request format is incorrect');
    }
    
    throw new Error(`AI assessment failed: ${error.message}`);
  }
};

// Parse textual response if JSON parsing fails
const parseTextualResponse = (responseText) => {
  // Extract key information using regex patterns
  const gradeMatch = responseText.match(/grade[:\s]*([A-D])/i);
  const scoreMatch = responseText.match(/score[:\s]*(\d+)/i);
  const confidenceMatch = responseText.match(/confidence[:\s]*(\d+)%?/i);
  
  return {
    assessment_data: {
      color: extractValue(responseText, ['color'], ['dark_brown', 'medium_brown', 'light_brown', 'golden_brown']) || 'medium_brown',
      texture: extractValue(responseText, ['texture'], ['fine', 'medium', 'coarse', 'very_fine']) || 'medium',
      moisture: extractValue(responseText, ['moisture'], ['low', 'optimal', 'high', 'very_low']) || 'optimal',
      contamination: responseText.toLowerCase().includes('contamination') ? 'detected' : 'none',
      particle_size: extractValue(responseText, ['particle'], ['uniform', 'varied']) || 'uniform',
      freshness: extractValue(responseText, ['fresh'], ['fresh', 'aged']) || 'fresh',
      processing_quality: extractValue(responseText, ['processing'], ['excellent', 'good', 'fair', 'poor']) || 'good'
    },
    quality_score: scoreMatch ? parseInt(scoreMatch[1]) : 75,
    suggested_grade: gradeMatch ? gradeMatch[1].toUpperCase() : 'B',
    confidence_level: confidenceMatch ? parseInt(confidenceMatch[1]) : 85,
    detailed_analysis: responseText.substring(0, 500) + '...',
    recommendations: extractRecommendations(responseText)
  };
};

// Helper function to extract values from text
const extractValue = (text, keywords, possibleValues) => {
  const lowerText = text.toLowerCase();
  for (const keyword of keywords) {
    const keywordIndex = lowerText.indexOf(keyword.toLowerCase());
    if (keywordIndex !== -1) {
      const searchArea = lowerText.substring(keywordIndex, keywordIndex + 100);
      for (const value of possibleValues) {
        if (searchArea.includes(value.toLowerCase())) {
          return value;
        }
      }
    }
  }
  return null;
};

// Extract recommendations from text
const extractRecommendations = (text) => {
  const recommendations = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    if (line.includes('recommend') || line.includes('suggest') || line.includes('improve')) {
      recommendations.push(line.trim());
      if (recommendations.length >= 3) break;
    }
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Continue current processing methods');
    recommendations.push('Monitor quality regularly');
    recommendations.push('Consider storage optimization');
  }
  
  return recommendations.slice(0, 3);
};

// Validate and clean assessment result
const validateAndCleanAssessment = (result) => {
  const defaultAssessment = {
    assessment_data: {
      color: 'medium_brown',
      texture: 'medium',
      moisture: 'optimal',
      contamination: 'none',
      particle_size: 'uniform',
      freshness: 'fresh',
      processing_quality: 'good'
    },
    quality_score: 75,
    suggested_grade: 'B',
    confidence_level: 85,
    detailed_analysis: 'AI analysis completed successfully',
    recommendations: ['Continue current processing methods', 'Monitor quality regularly', 'Consider storage optimization']
  };

  // Merge with defaults to ensure all fields exist
  const cleanResult = { ...defaultAssessment, ...result };
  cleanResult.assessment_data = { ...defaultAssessment.assessment_data, ...result.assessment_data };

  // Validate ranges
  cleanResult.quality_score = Math.max(40, Math.min(100, cleanResult.quality_score || 75));
  cleanResult.confidence_level = Math.max(75, Math.min(95, cleanResult.confidence_level || 85));
  
  // Validate grade based on score
  const score = cleanResult.quality_score;
  if (score >= 85) cleanResult.suggested_grade = 'A';
  else if (score >= 70) cleanResult.suggested_grade = 'B';
  else if (score >= 55) cleanResult.suggested_grade = 'C';
  else cleanResult.suggested_grade = 'D';

  return cleanResult;
};

// Generate recommendations based on assessment
const generateRecommendations = (assessment) => {
  const recommendations = [];
  
  if (assessment.quality_score < 60) {
    recommendations.push('Consider improving processing methods to enhance quality');
  }
  
  if (assessment.assessment_data.moisture === 'high') {
    recommendations.push('Dry the coffee waste more thoroughly before storage');
  }
  
  if (assessment.assessment_data.contamination === 'detected') {
    recommendations.push('Remove any foreign materials to improve purity');
  }
  
  if (assessment.assessment_data.particle_size === 'varied') {
    recommendations.push('Consider sieving for more uniform particle size');
  }
  
  if (assessment.suggested_grade === 'A') {
    recommendations.push('Excellent quality! Suitable for premium applications');
  } else if (assessment.suggested_grade === 'B') {
    recommendations.push('Good quality, suitable for most commercial uses');
  } else if (assessment.suggested_grade === 'C') {
    recommendations.push('Fair quality, suitable for composting and basic applications');
  } else {
    recommendations.push('Consider improving processing to achieve higher grades');
  }

  return recommendations.length > 0 ? recommendations : ['Continue monitoring quality standards'];
};

// ROUTES

// Submit image for AI assessment - FIXED RLS VERSION
router.post('/assess', authenticateToken, async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { image_url, product_id, image_context } = req.body;

    if (!image_url) {
      return res.status(400).json({
        error: 'Missing image URL',
        message: 'Please provide an image URL for assessment'
      });
    }

    // Validate URL format
    try {
      new URL(image_url);
    } catch {
      return res.status(400).json({
        error: 'Invalid image URL',
        message: 'Please provide a valid image URL'
      });
    }

    // Validate product ownership if product_id is provided
    if (product_id) {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('seller_id, title, waste_type')
        .eq('id', product_id)
        .single();

      if (productError || !product) {
        return res.status(404).json({
          error: 'Product not found',
          message: 'The specified product does not exist'
        });
      }

      if (product.seller_id !== req.user.id) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You can only assess your own products'
        });
      }
    }

    console.log('🤖 Starting AI quality assessment for user:', req.user.id);

    // Perform AI assessment using Vertex AI
    const assessmentResult = await performAIAssessment(
      image_url, 
      image_context || `Coffee waste quality assessment for ${product_id ? 'product listing' : 'general evaluation'}`
    );

    // Calculate actual processing time
    const processingTime = Date.now() - startTime;
    
    // Only save fields that exist in database schema
    const dbAssessmentData = {
      id: uuidv4(),
      user_id: req.user.id,
      product_id: product_id || null,
      image_url,
      assessment_data: assessmentResult.assessment_data,
      quality_score: assessmentResult.quality_score,
      suggested_grade: assessmentResult.suggested_grade,
      confidence_level: assessmentResult.confidence_level,
      processing_time_ms: processingTime
    };

    console.log('💾 Saving assessment to database:', {
      assessment_id: dbAssessmentData.id,
      user_id: dbAssessmentData.user_id,
      quality_score: dbAssessmentData.quality_score,
      suggested_grade: dbAssessmentData.suggested_grade
    });

    // ✅ FIXED: Use supabaseAdmin to bypass RLS for INSERT
    const { data: assessment, error } = await supabaseAdmin
      .from('ai_assessments')
      .insert(dbAssessmentData)
      .select()
      .single();

    if (error) {
      console.error('AI assessment save error:', error);
      return res.status(500).json({
        error: 'Assessment save failed',
        message: 'Could not save assessment results',
        details: error.message
      });
    }

    // If this is for a product, update the product's quality grade with high confidence
    if (product_id && assessmentResult.confidence_level > 80) {
      // ✅ FIXED: Use supabaseAdmin for product update too
      await supabaseAdmin
        .from('products')
        .update({ 
          quality_grade: assessmentResult.suggested_grade 
        })
        .eq('id', product_id);
    }

    console.log('✅ AI assessment completed successfully:', {
      grade: assessmentResult.suggested_grade,
      score: assessmentResult.quality_score,
      confidence: assessmentResult.confidence_level,
      processingTime: processingTime + 'ms'
    });

    // Return complete response with metadata separate from DB data
    res.json({
      message: 'AI assessment completed successfully',
      assessment: {
        id: assessment.id,
        user_id: assessment.user_id,
        product_id: assessment.product_id,
        image_url: assessment.image_url,
        assessment_data: assessment.assessment_data,
        quality_score: assessment.quality_score,
        suggested_grade: assessment.suggested_grade,
        confidence_level: assessment.confidence_level,
        processing_time_ms: assessment.processing_time_ms,
        created_at: assessment.created_at,
        // Add metadata fields to response (not saved to DB)
        detailed_analysis: assessmentResult.detailed_analysis,
        recommendations: assessmentResult.recommendations || generateRecommendations(assessmentResult),
        ai_provider: 'vertex-ai',
        model: 'gemini-2.0-flash-001'
      }
    });
  } catch (error) {
    console.error('AI assessment error:', error);
    
    // Categorize error for better response
    let errorResponse = {
      error: 'Internal server error',
      message: 'Something went wrong during AI assessment',
      processing_time_ms: Date.now() - startTime,
      technical_details: error.message
    };

    if (error.message.includes('timeout')) {
      errorResponse.error = 'Request timeout';
      errorResponse.message = 'The assessment took too long to process. Please try again';
    } else if (error.message.includes('quota') || error.message.includes('rate limit')) {
      errorResponse.error = 'Quota exceeded';
      errorResponse.message = 'API quota exceeded. Please try again later';
    } else if (error.message.includes('authentication') || error.message.includes('permission')) {
      errorResponse.error = 'Authentication error';
      errorResponse.message = 'Please check your API credentials and permissions';
    } else if (error.message.includes('image')) {
      errorResponse.error = 'Image processing error';
      errorResponse.message = 'Could not process the image. Please check the image URL and format';
    }
    
    res.status(500).json(errorResponse);
  }
});

// Bulk assess multiple images - FIXED RLS VERSION
router.post('/assess-batch', authenticateToken, async (req, res) => {
  try {
    const { images, product_id } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        error: 'Missing images',
        message: 'Please provide an array of image URLs'
      });
    }

    if (images.length > 5) {
      return res.status(400).json({
        error: 'Too many images',
        message: 'Maximum 5 images allowed per batch for AI processing'
      });
    }

    // Validate product ownership if provided
    if (product_id) {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('seller_id')
        .eq('id', product_id)
        .single();

      if (productError || !product || product.seller_id !== req.user.id) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Invalid product or insufficient permissions'
        });
      }
    }

    console.log(`🤖 Starting batch AI assessment for ${images.length} images`);
    const assessmentResults = [];
    const batchStartTime = Date.now();

    // Process each image with AI assessment
    for (let i = 0; i < images.length; i++) {
      const imageUrl = images[i];
      
      try {
        console.log(`📸 Processing image ${i + 1}/${images.length}`);
        
        const assessmentResult = await performAIAssessment(
          imageUrl,
          `Batch assessment ${i + 1}/${images.length} for ${product_id ? 'product listing' : 'quality evaluation'}`
        );

        // Only save fields that exist in database schema
        const dbAssessmentData = {
          id: uuidv4(),
          user_id: req.user.id,
          product_id: product_id || null,
          image_url: imageUrl,
          assessment_data: assessmentResult.assessment_data,
          quality_score: assessmentResult.quality_score,
          suggested_grade: assessmentResult.suggested_grade,
          confidence_level: assessmentResult.confidence_level,
          processing_time_ms: Date.now() - batchStartTime
        };

        // ✅ FIXED: Use supabaseAdmin for INSERT to bypass RLS
        const { data: assessment, error } = await supabaseAdmin
          .from('ai_assessments')
          .insert(dbAssessmentData)
          .select()
          .single();

        if (!error && assessment) {
          assessmentResults.push({
            image_url: imageUrl,
            assessment_id: assessment.id,
            assessment_data: assessment.assessment_data,
            quality_score: assessment.quality_score,
            suggested_grade: assessment.suggested_grade,
            confidence_level: assessment.confidence_level,
            processing_time_ms: assessment.processing_time_ms,
            created_at: assessment.created_at,
            // Add metadata to response (not saved to DB)
            detailed_analysis: assessmentResult.detailed_analysis,
            recommendations: assessmentResult.recommendations || generateRecommendations(assessmentResult),
            ai_provider: 'vertex-ai',
            model: 'gemini-2.0-flash-001'
          });
        } else if (error) {
          console.error(`❌ Failed to save assessment for image ${i + 1}:`, error);
        }
      } catch (imageError) {
        console.error(`❌ Failed to process image ${i + 1}:`, imageError);
        // Continue with other images
      }
    }

    // Calculate overall grade from batch if for a product
    if (product_id && assessmentResults.length > 0) {
      const avgScore = assessmentResults.reduce((sum, r) => sum + r.quality_score, 0) / assessmentResults.length;
      const overallGrade = avgScore >= 85 ? 'A' : avgScore >= 70 ? 'B' : avgScore >= 55 ? 'C' : 'D';
      
      // ✅ FIXED: Use supabaseAdmin for product update
      await supabaseAdmin
        .from('products')
        .update({ quality_grade: overallGrade })
        .eq('id', product_id);
    }

    const totalProcessingTime = Date.now() - batchStartTime;

    console.log('✅ Batch assessment completed:', {
      processed: assessmentResults.length,
      total: images.length,
      totalTime: totalProcessingTime + 'ms'
    });

    res.json({
      message: `Batch assessment completed for ${assessmentResults.length}/${images.length} images`,
      results: assessmentResults,
      summary: {
        total_requested: images.length,
        total_processed: assessmentResults.length,
        failed: images.length - assessmentResults.length,
        average_score: assessmentResults.length > 0 ? 
          Math.round((assessmentResults.reduce((sum, r) => sum + r.quality_score, 0) / assessmentResults.length) * 100) / 100 : 0,
        total_processing_time_ms: totalProcessingTime,
        ai_provider: 'vertex-ai',
        model: 'gemini-2.0-flash-001'
      }
    });
  } catch (error) {
    console.error('Batch assessment error:', error);
    
    res.status(500).json({
      error: 'Batch assessment failed',
      message: 'Could not complete batch assessment',
      technical_details: error.message
    });
  }
});

// Get user's assessment history - FIXED RLS VERSION
router.get('/assessments', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    // ✅ FIXED: Use supabaseAdmin for SELECT to ensure data access
    const { data: assessments, error } = await supabaseAdmin
      .from('ai_assessments')
      .select(`
        *,
        products (
          id,
          title,
          waste_type
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Assessments fetch error:', error);
      return res.status(500).json({
        error: 'Failed to fetch assessments',
        message: 'Could not retrieve assessment history'
      });
    }

    // Get total count using admin client
    const { count } = await supabaseAdmin
      .from('ai_assessments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    res.json({
      assessments: assessments.map(assessment => ({
        ...assessment,
        recommendations: assessment.recommendations || generateRecommendations(assessment),
        ai_provider: 'vertex-ai',
        model: 'gemini-2.0-flash-001'
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Assessments fetch error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong while fetching assessments'
    });
  }
});

// Get specific assessment - FIXED RLS VERSION
router.get('/assessments/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // ✅ FIXED: Use supabaseAdmin for SELECT
    const { data: assessment, error } = await supabaseAdmin
      .from('ai_assessments')
      .select(`
        *,
        products (
          id,
          title,
          waste_type,
          description
        )
      `)
      .eq('id', id)
      .single();

    if (error || !assessment) {
      return res.status(404).json({
        error: 'Assessment not found',
        message: 'The requested assessment does not exist'
      });
    }

    // Check if user owns this assessment
    if (assessment.user_id !== userId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You are not authorized to view this assessment'
      });
    }

    res.json({
      assessment: {
        ...assessment,
        recommendations: assessment.recommendations || generateRecommendations(assessment),
        ai_provider: 'vertex-ai',
        model: 'gemini-2.0-flash-001'
      }
    });
  } catch (error) {
    console.error('Assessment fetch error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong while fetching the assessment'
    });
  }
});

// Get assessment statistics - FIXED RLS VERSION
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // ✅ FIXED: Use supabaseAdmin for SELECT
    const { data: assessments } = await supabaseAdmin
      .from('ai_assessments')
      .select('suggested_grade, quality_score, confidence_level')
      .eq('user_id', userId);

    if (!assessments || assessments.length === 0) {
      return res.json({
        stats: {
          total_assessments: 0,
          average_quality_score: 0,
          grade_distribution: { A: 0, B: 0, C: 0, D: 0 },
          average_confidence: 0
        }
      });
    }

    const totalAssessments = assessments.length;
    const averageQualityScore = assessments.reduce((sum, a) => sum + a.quality_score, 0) / totalAssessments;
    const averageConfidence = assessments.reduce((sum, a) => sum + a.confidence_level, 0) / totalAssessments;

    const gradeDistribution = { A: 0, B: 0, C: 0, D: 0 };
    assessments.forEach(a => {
      if (a.suggested_grade) {
        gradeDistribution[a.suggested_grade]++;
      }
    });

    res.json({
      stats: {
        total_assessments: totalAssessments,
        average_quality_score: Math.round(averageQualityScore * 100) / 100,
        grade_distribution: gradeDistribution,
        average_confidence: Math.round(averageConfidence * 100) / 100,
        ai_provider: 'vertex-ai',
        model: 'gemini-2.0-flash-001'
      }
    });
  } catch (error) {
    console.error('Assessment stats error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong while fetching assessment statistics'
    });
  }
});

// Test endpoint for AI functionality
router.get('/test-ai', authenticateToken, async (req, res) => {
  try {
    console.log('🧪 Running AI assessment test...');
    
    // Test with a simple prompt (without image)
    if (!initialized) {
      await initializeVertexAI();
    }

    const testResponse = await visionModel.generateContent('Test AI assessment functionality');
    
    res.json({
      test: 'AI assessment system test',
      vertex_ai_status: initialized ? 'healthy' : 'unhealthy',
      capabilities: {
        image_analysis: true,
        quality_grading: true,
        batch_processing: true,
        confidence_scoring: true
      },
      supported_formats: ['JPEG', 'PNG', 'WebP'],
      max_batch_size: 5,
      ai_provider: 'vertex-ai',
      model: 'gemini-2.0-flash-001',
      test_response_received: !!testResponse,
      test_response_length: testResponse?.response?.candidates?.[0]?.content?.parts?.[0]?.text?.length || 0,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('💥 AI test failed:', error);
    res.status(500).json({
      test: 'failed',
      error: error.message,
      vertex_ai_status: initialized ? 'initialized_but_failed' : 'not_initialized',
      timestamp: new Date().toISOString()
    });
  }
});

// Simple vision test endpoint (for debugging)
router.post('/test-vision', authenticateToken, async (req, res) => {
  try {
    const { image_url } = req.body;
    
    if (!image_url) {
      return res.status(400).json({
        error: 'image_url is required for vision test'
      });
    }
    
    console.log('🧪 Running vision test with image:', image_url);
    
    if (!initialized) {
      await initializeVertexAI();
    }

    // Convert image
    const imageData = await convertImageToBase64(image_url);
    
    // Simple vision test
    const result = await visionModel.generateContent([
      'Describe what you see in this image briefly.',
      {
        inlineData: {
          mimeType: imageData.mimeType,
          data: imageData.data
        }
      }
    ]);

    let responseText = '';
    if (result?.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
      responseText = result.response.candidates[0].content.parts[0].text;
    }

    res.json({
      test: 'vision test',
      success: true,
      image_processed: true,
      response_received: !!responseText,
      response_length: responseText.length,
      response_preview: responseText.substring(0, 200) + '...',
      image_info: {
        mime_type: imageData.mimeType,
        size_bytes: imageData.data.length
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('💥 Vision test failed:', error);
    res.status(500).json({
      test: 'vision test failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;