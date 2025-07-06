const express = require('express');
const { supabase } = require('../config/supabase');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const { validateParams, validateQuery, schemas } = require('../middleware/validation');

const router = express.Router();

// Get published articles
router.get('/', validateQuery(schemas.paginationQuery), optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('articles')
      .select(`
        id,
        title,
        slug,
        excerpt,
        featured_image_url,
        category,
        tags,
        views_count,
        reading_time_minutes,
        created_at,
        users!articles_author_id_fkey (
          id,
          full_name,
          profile_image_url
        )
      `)
      .eq('is_published', true);

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,excerpt.ilike.%${search}%`);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data: articles, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Articles fetch error:', error);
      return res.status(500).json({
        error: 'Failed to fetch articles',
        message: 'Could not retrieve articles'
      });
    }

    // Get total count
    let countQuery = supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true);

    if (search) {
      countQuery = countQuery.or(`title.ilike.%${search}%,content.ilike.%${search}%,excerpt.ilike.%${search}%`);
    }

    if (category) {
      countQuery = countQuery.eq('category', category);
    }

    const { count } = await countQuery;

    res.json({
      articles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Articles fetch error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong while fetching articles'
    });
  }
});

// Get article by slug
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const { slug } = req.params;

    const { data: article, error } = await supabase
      .from('articles')
      .select(`
        *,
        users!articles_author_id_fkey (
          id,
          full_name,
          profile_image_url,
          business_name
        )
      `)
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (error || !article) {
      return res.status(404).json({
        error: 'Article not found',
        message: 'The requested article does not exist'
      });
    }

    // Increment view count
    await supabase
      .from('articles')
      .update({ views_count: article.views_count + 1 })
      .eq('id', article.id);

    res.json({
      article: {
        ...article,
        views_count: article.views_count + 1
      }
    });
  } catch (error) {
    console.error('Article fetch error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong while fetching the article'
    });
  }
});

// Get article categories
router.get('/meta/categories', async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from('articles')
      .select('category')
      .eq('is_published', true)
      .not('category', 'is', null);

    if (error) {
      console.error('Categories fetch error:', error);
      return res.status(500).json({
        error: 'Failed to fetch categories',
        message: 'Could not retrieve article categories'
      });
    }

    // Get unique categories with counts
    const categoryCount = {};
    categories.forEach(article => {
      if (article.category) {
        categoryCount[article.category] = (categoryCount[article.category] || 0) + 1;
      }
    });

    const categoriesWithCount = Object.keys(categoryCount).map(category => ({
      name: category,
      count: categoryCount[category]
    }));

    res.json({
      categories: categoriesWithCount
    });
  } catch (error) {
    console.error('Categories fetch error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong while fetching categories'
    });
  }
});

// Get related articles
router.get('/:slug/related', async (req, res) => {
  try {
    const { slug } = req.params;
    const { limit = 4 } = req.query;

    // Get current article to find related ones
    const { data: currentArticle, error: currentError } = await supabase
      .from('articles')
      .select('id, category, tags')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (currentError || !currentArticle) {
      return res.status(404).json({
        error: 'Article not found',
        message: 'The requested article does not exist'
      });
    }

    // Find related articles by category or tags
    let query = supabase
      .from('articles')
      .select(`
        id,
        title,
        slug,
        excerpt,
        featured_image_url,
        category,
        reading_time_minutes,
        created_at,
        users!articles_author_id_fkey (
          full_name
        )
      `)
      .eq('is_published', true)
      .neq('id', currentArticle.id);

    if (currentArticle.category) {
      query = query.eq('category', currentArticle.category);
    }

    const { data: relatedArticles, error } = await query
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      console.error('Related articles fetch error:', error);
      return res.status(500).json({
        error: 'Failed to fetch related articles',
        message: 'Could not retrieve related articles'
      });
    }

    res.json({
      related_articles: relatedArticles
    });
  } catch (error) {
    console.error('Related articles fetch error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong while fetching related articles'
    });
  }
});

// Admin routes for article management
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      title,
      content,
      excerpt,
      featured_image_url,
      category,
      tags,
      is_published = false,
      reading_time_minutes
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Title and content are required'
      });
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    // Check if slug already exists
    const { data: existingArticle } = await supabase
      .from('articles')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingArticle) {
      return res.status(400).json({
        error: 'Slug already exists',
        message: 'An article with this title already exists'
      });
    }

    const { data: article, error } = await supabase
      .from('articles')
      .insert({
        title,
        slug,
        content,
        excerpt,
        featured_image_url,
        author_id: req.user.id,
        category,
        tags,
        is_published,
        reading_time_minutes
      })
      .select()
      .single();

    if (error) {
      console.error('Article creation error:', error);
      return res.status(500).json({
        error: 'Article creation failed',
        message: 'Could not create article'
      });
    }

    res.status(201).json({
      message: 'Article created successfully',
      article
    });
  } catch (error) {
    console.error('Article creation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong while creating the article'
    });
  }
});

// Update article (admin only)
router.put('/:id', authenticateToken, requireAdmin, validateParams(schemas.uuidParam), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If title is being updated, regenerate slug
    if (updateData.title) {
      const newSlug = updateData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');

      // Check if new slug conflicts with existing articles
      const { data: existingArticle } = await supabase
        .from('articles')
        .select('id')
        .eq('slug', newSlug)
        .neq('id', id)
        .single();

      if (existingArticle) {
        return res.status(400).json({
          error: 'Slug conflict',
          message: 'An article with this title already exists'
        });
      }

      updateData.slug = newSlug;
    }

    const { data: article, error } = await supabase
      .from('articles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Article update error:', error);
      return res.status(500).json({
        error: 'Article update failed',
        message: 'Could not update article'
      });
    }

    if (!article) {
      return res.status(404).json({
        error: 'Article not found',
        message: 'The requested article does not exist'
      });
    }

    res.json({
      message: 'Article updated successfully',
      article
    });
  } catch (error) {
    console.error('Article update error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong while updating the article'
    });
  }
});

// Delete article (admin only)
router.delete('/:id', authenticateToken, requireAdmin, validateParams(schemas.uuidParam), async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Article deletion error:', error);
      return res.status(500).json({
        error: 'Article deletion failed',
        message: 'Could not delete article'
      });
    }

    res.json({
      message: 'Article deleted successfully'
    });
  } catch (error) {
    console.error('Article deletion error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong while deleting the article'
    });
  }
});

module.exports = router;