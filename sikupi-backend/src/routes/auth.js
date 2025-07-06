const express = require('express');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { supabase, supabaseAdmin } = require('../config/supabase');
const { generateToken, generateRefreshToken } = require('../config/jwt');
const { validateBody, schemas } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register new user
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

    // Create user using admin client (bypasses RLS for registration)
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({
        id: uuidv4(),
        email,
        password_hash,
        ...userData
      })
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

    res.status(201).json({
      message: 'User registered successfully',
      user,
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

// Login user
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
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Generate tokens
    const token = generateToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong during login'
    });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const { password_hash, ...userWithoutPassword } = req.user;
    
    res.json({
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Could not retrieve profile'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, validateBody(schemas.userUpdate), async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select('id, email, full_name, phone, user_type, business_name, address, city, province, postal_code, is_verified, rating, total_reviews, created_at, updated_at')
      .single();

    if (error) {
      console.error('Profile update error:', error);
      return res.status(500).json({
        error: 'Update failed',
        message: 'Could not update profile'
      });
    }

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong during profile update'
    });
  }
});

// Change password
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Current password and new password are required'
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        error: 'Invalid password',
        message: 'New password must be at least 6 characters long'
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