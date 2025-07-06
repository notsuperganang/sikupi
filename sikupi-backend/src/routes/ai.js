const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { supabase } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Simulate AI quality assessment (since we're using simulation for MVP)
const simulateAIAssessment = (imageUrl) => {
  // Simulated assessment results
  const qualities = ['A', 'B', 'C', 'D'];
  const colors = ['dark_brown', 'medium_brown', 'light_brown', 'golden_brown'];
  const textures = ['fine', 'medium', 'coarse', 'very_fine'];
  const moistures = ['low', 'optimal', 'high', 'very_low'];
  
  // Generate random but realistic assessment
  const quality_grade = qualities[Math.floor(Math.random() * qualities.length)];
  const quality_score = quality_grade === 'A' ? 85 + Math.random() * 15 : 
                       quality_grade === 'B' ? 70 + Math.random() * 15 :
                       quality_grade === 'C' ? 55 + Math.random() * 15 : 
                       40 + Math.random() * 15;
  
  const assessment_data = {
    color: colors[Math.floor(Math.random() * colors.length)],
    texture: textures[Math.floor(Math.random() * textures.length)],
    moisture: moistures[Math.floor(Math.random() * moistures.length)],
    contamination: Math.random() > 0.8 ? 'detected' : 'none',
    particle_size: Math.random() > 0.5 ? 'uniform' : 'varied',
    freshness: Math.random() > 0.3 ? 'fresh' : 'aged',
    processing_quality: Math.random() > 0.4 ? 'good' : 'fair'
  };

  const confidence_level = 75 + Math.random() * 20; // 75-95% confidence
  const processing_time = 800 + Math.random() * 1000; // 800-1800ms

  return {
    assessment_data,
    quality_score: Math.round(quality_score * 100) / 100,
    suggested_grade: quality_grade,
    confidence_level: Math.round(confidence_level * 100) / 100,
    processing_time_ms: Math.round(processing_time)
  };
};

// Submit image for AI assessment
router.post('/assess', authenticateToken, async (req, res) => {
  try {
    const { image_url, product_id } = req.body;

    if (!image_url) {
      return res.status(400).json({
        error: 'Missing image URL',
        message: 'Please provide an image URL for assessment'
      });
    }

    // Validate product ownership if product_id is provided
    if (product_id) {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('seller_id')
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

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Generate simulated assessment
    const assessmentResult = simulateAIAssessment(image_url);

    // Save assessment to database
    const { data: assessment, error } = await supabase
      .from('ai_assessments')
      .insert({
        id: uuidv4(),
        user_id: req.user.id,
        product_id: product_id || null,
        image_url,
        ...assessmentResult
      })
      .select()
      .single();

    if (error) {
      console.error('AI assessment save error:', error);
      return res.status(500).json({
        error: 'Assessment save failed',
        message: 'Could not save assessment results'
      });
    }

    // If this is for a product, optionally update the product's quality grade
    if (product_id && assessmentResult.confidence_level > 80) {
      await supabase
        .from('products')
        .update({ 
          quality_grade: assessmentResult.suggested_grade 
        })
        .eq('id', product_id);
    }

    res.json({
      message: 'AI assessment completed successfully',
      assessment: {
        id: assessment.id,
        ...assessmentResult,
        recommendations: generateRecommendations(assessmentResult),
        image_url,
        created_at: assessment.created_at
      }
    });
  } catch (error) {
    console.error('AI assessment error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong during AI assessment'
    });
  }
});

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

  return recommendations;
};

// Get user's assessment history
router.get('/assessments', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const { data: assessments, error } = await supabase
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

    // Get total count
    const { count } = await supabase
      .from('ai_assessments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    res.json({
      assessments: assessments.map(assessment => ({
        ...assessment,
        recommendations: generateRecommendations(assessment)
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

// Get specific assessment
router.get('/assessments/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: assessment, error } = await supabase
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
        recommendations: generateRecommendations(assessment)
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

// Get assessment statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: assessments } = await supabase
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
        average_confidence: Math.round(averageConfidence * 100) / 100
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

// Bulk assess multiple images
router.post('/assess-batch', authenticateToken, async (req, res) => {
  try {
    const { images, product_id } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        error: 'Missing images',
        message: 'Please provide an array of image URLs'
      });
    }

    if (images.length > 10) {
      return res.status(400).json({
        error: 'Too many images',
        message: 'Maximum 10 images allowed per batch'
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

    const assessmentResults = [];

    // Process each image
    for (const imageUrl of images) {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

      const assessmentResult = simulateAIAssessment(imageUrl);

      // Save to database
      const { data: assessment, error } = await supabase
        .from('ai_assessments')
        .insert({
          id: uuidv4(),
          user_id: req.user.id,
          product_id: product_id || null,
          image_url: imageUrl,
          ...assessmentResult
        })
        .select()
        .single();

      if (!error && assessment) {
        assessmentResults.push({
          image_url: imageUrl,
          assessment_id: assessment.id,
          ...assessmentResult,
          recommendations: generateRecommendations(assessmentResult)
        });
      }
    }

    // Calculate overall grade from batch if for a product
    if (product_id && assessmentResults.length > 0) {
      const avgScore = assessmentResults.reduce((sum, r) => sum + r.quality_score, 0) / assessmentResults.length;
      const overallGrade = avgScore >= 85 ? 'A' : avgScore >= 70 ? 'B' : avgScore >= 55 ? 'C' : 'D';
      
      await supabase
        .from('products')
        .update({ quality_grade: overallGrade })
        .eq('id', product_id);
    }

    res.json({
      message: `Batch assessment completed for ${assessmentResults.length} images`,
      results: assessmentResults,
      summary: {
        total_processed: assessmentResults.length,
        average_score: assessmentResults.length > 0 ? 
          Math.round((assessmentResults.reduce((sum, r) => sum + r.quality_score, 0) / assessmentResults.length) * 100) / 100 : 0
      }
    });
  } catch (error) {
    console.error('Batch assessment error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong during batch assessment'
    });
  }
});

module.exports = router;