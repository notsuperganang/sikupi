// FILE: sikupi-backend/src/routes/auth.js
// PERBAIKAN: Field name mapping dan response format

const express = require('express');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { supabase, supabaseAdmin } = require('../config/supabase');
const { generateToken, generateRefreshToken } = require('../config/jwt');
const { validateBody, schemas } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register new user - FIXED VERSION
router.post('/register', validateBody(schemas.userRegistration), async (req, res) => {
  try {
    const { email, password, ...userData } = req.body;

    // Check if user already exists (using admin client)
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists',
        message: 'An account with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Map camelCase frontend fields to snake_case database fields
    const dbUserData = {
      id: uuidv4(),
      email,
      password_hash,
      full_name: userData.fullName || userData.full_name,
      phone: userData.phone,
      user_type: userData.userType || userData.user_type || 'buyer',
      business_name: userData.businessName || userData.business_name,
      address: userData.address,
      city: userData.city,
      province: userData.province,
      postal_code: userData.postalCode || userData.postal_code
    };

    // Create user using admin client (bypasses RLS for registration)
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert(dbUserData)
      .select('id, email, full_name, phone, user_type, business_name, address, city, province, postal_code, is_verified, rating, total_reviews, created_at')
      .single();

    if (error) {
      console.error('Registration error:', error);
      
      // Provide specific error messages for common issues
      if (error.code === '42501') {
        return res.status(500).json({
          error: 'Database Policy Error',
          message: 'User registration is not allowed. Please check RLS policies.',
          hint: 'Run the database_fix_registration.sql file in Supabase SQL Editor'
        });
      }
      
      if (error.code === '23505') {
        return res.status(400).json({
          error: 'User already exists',
          message: 'An account with this email already exists'
        });
      }
      
      return res.status(500).json({
        error: 'Registration failed',
        message: 'Could not create user account',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    // Generate tokens
    const token = generateToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Convert snake_case to camelCase for frontend compatibility
    const frontendUser = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      phone: user.phone,
      userType: user.user_type,
      businessName: user.business_name,
      address: user.address,
      city: user.city,
      province: user.province,
      postalCode: user.postal_code,
      isVerified: user.is_verified,
      rating: user.rating,
      totalReviews: user.total_reviews,
      createdAt: user.created_at
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: frontendUser,
      token,
      refreshToken
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong during registration'
    });
  }
});

// Login user - UPDATED VERSION with consistent response format
router.post('/login', validateBody(schemas.userLogin), async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email (using admin client for login)
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Generate tokens
    const token = generateToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Convert snake_case to camelCase for frontend compatibility
    const frontendUser = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      phone: user.phone,
      userType: user.user_type,
      businessName: user.business_name,
      address: user.address,
      city: user.city,
      province: user.province,
      postalCode: user.postal_code,
      isVerified: user.is_verified,
      rating: user.rating,
      totalReviews: user.total_reviews,
      profileImageUrl: user.profile_image_url,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };

    res.json({
      success: true,
      message: 'Login successful',
      user: frontendUser,
      token,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Something went wrong during login'
    });
  }
});

// Get current user profile - FIXED VERSION
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    // Convert snake_case to camelCase for frontend compatibility
    const frontendUser = {
      id: req.user.id,
      email: req.user.email,
      fullName: req.user.full_name,
      phone: req.user.phone,
      userType: req.user.user_type,
      businessName: req.user.business_name,
      address: req.user.address,
      city: req.user.city,
      province: req.user.province,
      postalCode: req.user.postal_code,
      isVerified: req.user.is_verified,
      rating: req.user.rating,
      totalReviews: req.user.total_reviews,
      profileImageUrl: req.user.profile_image_url,
      createdAt: req.user.created_at,
      updatedAt: req.user.updated_at
    };

    res.json({
      success: true,
      user: frontendUser
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong while fetching profile'
    });
  }
});

// Update password
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Current password and new password are required'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(current_password, req.user.password_hash);

    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        error: 'Invalid current password',
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(new_password, saltRounds);

    // Update password
    const { error } = await supabase
      .from('users')
      .update({ password_hash: newPasswordHash })
      .eq('id', req.user.id);

    if (error) {
      console.error('Password change error:', error);
      return res.status(500).json({
        error: 'Update failed',
        message: 'Could not update password'
      });
    }

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong during password change'
    });
  }
});

// Logout (client-side token invalidation)
router.post('/logout', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// Refresh token (simplified version)
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        error: 'Refresh token required',
        message: 'Please provide a refresh token'
      });
    }

    // In a production app, you'd validate the refresh token properly
    // For now, we'll just generate a new token
    const newToken = generateToken({ userId: req.user?.id });
    
    res.json({
      success: true,
      token: newToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      error: 'Invalid refresh token',
      message: 'Could not refresh token'
    });
  }
});

module.exports = router;