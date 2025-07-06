const express = require('express');
const { supabase } = require('../config/supabase');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validateParams, validateBody, schemas } = require('../middleware/validation');

const router = express.Router();

// Get user profile (public info)
router.get('/:id', validateParams(schemas.uuidParam), optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, full_name, business_name, city, province, rating, total_reviews, is_verified, profile_image_url, created_at')
      .eq('id', id)
      .single();

    if (error || !user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    res.json({
      user
    });
  } catch (error) {
    console.error('User fetch error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong while fetching user'
    });
  }
});

// Get user's products
router.get('/:id/products', validateParams(schemas.uuidParam), async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, status = 'active' } = req.query;

    const offset = (page - 1) * limit;

    const { data: products, error } = await supabase
      .from('products')
      .select('id, title, description, waste_type, quantity_kg, price_per_kg, quality_grade, status, image_urls, views_count, favorites_count, created_at')
      .eq('seller_id', id)
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('User products fetch error:', error);
      return res.status(500).json({
        error: 'Failed to fetch products',
        message: 'Could not retrieve user products'
      });
    }

    // Get total count
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', id)
      .eq('status', status);

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('User products fetch error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong while fetching user products'
    });
  }
});

// Get user's reviews
router.get('/:id/reviews', validateParams(schemas.uuidParam), async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        review_text,
        created_at,
        reviewer:users!reviews_reviewer_id_fkey (
          id,
          full_name,
          profile_image_url
        ),
        transactions (
          id,
          products (
            title,
            waste_type
          )
        )
      `)
      .eq('reviewee_id', id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('User reviews fetch error:', error);
      return res.status(500).json({
        error: 'Failed to fetch reviews',
        message: 'Could not retrieve user reviews'
      });
    }

    // Get total count and rating statistics
    const { count } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('reviewee_id', id);

    const { data: ratingStats } = await supabase
      .from('reviews')
      .select('rating')
      .eq('reviewee_id', id);

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;

    ratingStats?.forEach(review => {
      ratingDistribution[review.rating]++;
      totalRating += review.rating;
    });

    const averageRating = ratingStats?.length ? (totalRating / ratingStats.length) : 0;

    res.json({
      reviews,
      statistics: {
        total_reviews: count || 0,
        average_rating: Math.round(averageRating * 100) / 100,
        rating_distribution: ratingDistribution
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('User reviews fetch error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong while fetching user reviews'
    });
  }
});

// Create review for user (after completed transaction)
router.post('/:id/reviews', authenticateToken, validateParams(schemas.uuidParam), validateBody(schemas.reviewCreate), async (req, res) => {
  try {
    const { id } = req.params; // reviewee_id
    const { rating, review_text, transaction_id } = req.body;
    const reviewerId = req.user.id;

    if (id === reviewerId) {
      return res.status(400).json({
        error: 'Invalid review',
        message: 'You cannot review yourself'
      });
    }

    // Verify transaction exists and is completed
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .select('id, buyer_id, seller_id, status')
      .eq('id', transaction_id)
      .single();

    if (transactionError || !transaction) {
      return res.status(404).json({
        error: 'Transaction not found',
        message: 'The specified transaction does not exist'
      });
    }

    if (transaction.status !== 'delivered') {
      return res.status(400).json({
        error: 'Transaction not completed',
        message: 'You can only review after transaction is completed'
      });
    }

    // Check if user is part of this transaction
    const isValidReviewer = (transaction.buyer_id === reviewerId && transaction.seller_id === id) ||
                          (transaction.seller_id === reviewerId && transaction.buyer_id === id);

    if (!isValidReviewer) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only review users from your completed transactions'
      });
    }

    // Check if review already exists
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('transaction_id', transaction_id)
      .eq('reviewer_id', reviewerId)
      .single();

    if (existingReview) {
      return res.status(400).json({
        error: 'Review already exists',
        message: 'You have already reviewed this transaction'
      });
    }

    // Create review
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert({
        transaction_id,
        reviewer_id: reviewerId,
        reviewee_id: id,
        rating,
        review_text
      })
      .select(`
        *,
        reviewer:users!reviews_reviewer_id_fkey (
          id,
          full_name,
          profile_image_url
        )
      `)
      .single();

    if (reviewError) {
      console.error('Review creation error:', reviewError);
      return res.status(500).json({
        error: 'Review creation failed',
        message: 'Could not create review'
      });
    }

    // Update user's rating statistics
    const { data: allReviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('reviewee_id', id);

    if (allReviews && allReviews.length > 0) {
      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalRating / allReviews.length;

      await supabase
        .from('users')
        .update({
          rating: Math.round(averageRating * 100) / 100,
          total_reviews: allReviews.length
        })
        .eq('id', id);
    }

    // Create notification for reviewee
    await supabase
      .from('notifications')
      .insert({
        user_id: id,
        title: 'New Review Received',
        message: `You received a ${rating}-star review`,
        type: 'review',
        related_id: review.id
      });

    res.status(201).json({
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    console.error('Review creation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong while creating review'
    });
  }
});

module.exports = router;