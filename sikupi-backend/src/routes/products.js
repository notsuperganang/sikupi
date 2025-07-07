const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { supabase, supabaseAdmin } = require('../config/supabase'); // Import both
const { uploadFile, getPublicUrl } = require('../config/storage');
const { authenticateToken, requireSeller, optionalAuth } = require('../middleware/auth');
const { validateBody, validateParams, validateQuery, schemas } = require('../middleware/validation');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Get all products with filtering and pagination
router.get('/', validateQuery(schemas.productQuery), optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      waste_type,
      quality_grade,
      min_price,
      max_price,
      city,
      province,
      organic_certified,
      fair_trade_certified,
      sort_by = 'created_at',
      order = 'desc'
    } = req.query;

    let query = supabase
      .from('products')
      .select(`
        *,
        users!products_seller_id_fkey (
          id,
          full_name,
          business_name,
          city,
          province,
          rating,
          total_reviews,
          is_verified
        )
      `)
      .eq('status', 'active');

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (waste_type) {
      query = query.eq('waste_type', waste_type);
    }

    if (quality_grade) {
      query = query.eq('quality_grade', quality_grade);
    }

    if (min_price) {
      query = query.gte('price_per_kg', min_price);
    }

    if (max_price) {
      query = query.lte('price_per_kg', max_price);
    }

    if (city) {
      query = query.eq('users.city', city);
    }

    if (province) {
      query = query.eq('users.province', province);
    }

    if (organic_certified !== undefined) {
      query = query.eq('organic_certified', organic_certified);
    }

    if (fair_trade_certified !== undefined) {
      query = query.eq('fair_trade_certified', fair_trade_certified);
    }

    // Apply sorting
    const ascending = order === 'asc';
    query = query.order(sort_by, { ascending });

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: products, error } = await query;

    if (error) {
      console.error('Products fetch error:', error);
      return res.status(500).json({
        error: 'Failed to fetch products',
        message: 'Could not retrieve products'
      });
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    res.json({
      products,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Products fetch error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong while fetching products'
    });
  }
});

// Get single product by ID
router.get('/:id', validateParams(schemas.uuidParam), optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        users!products_seller_id_fkey (
          id,
          full_name,
          business_name,
          city,
          province,
          rating,
          total_reviews,
          is_verified,
          phone,
          email
        ),
        product_images (
          id,
          image_url,
          alt_text,
          display_order
        )
      `)
      .eq('id', id)
      .single();

    if (error || !product) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'The requested product does not exist'
      });
    }

    // Increment view count using admin client
    await supabaseAdmin
      .from('products')
      .update({ views_count: product.views_count + 1 })
      .eq('id', id);

    // Check if user has favorited this product
    let is_favorited = false;
    if (req.user) {
      const { data: favorite } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', req.user.id)
        .eq('product_id', id)
        .single();

      is_favorited = !!favorite;
    }

    res.json({
      product: {
        ...product,
        is_favorited
      }
    });
  } catch (error) {
    console.error('Product fetch error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong while fetching the product'
    });
  }
});

// Create new product - ✅ FIXED VERSION
router.post('/', authenticateToken, requireSeller, validateBody(schemas.productCreate), async (req, res) => {
  try {
    console.log('Creating product for user:', req.user.id); // Debug log
    console.log('Product data:', req.body); // Debug log

    const productData = {
      ...req.body,
      id: uuidv4(),
      seller_id: req.user.id
    };

    console.log('Final product data:', productData); // Debug log

    // Use supabaseAdmin to bypass RLS for product creation
    const { data: product, error } = await supabaseAdmin  // ✅ Using admin client
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (error) {
      console.error('Product creation error:', error);
      return res.status(500).json({
        error: 'Product creation failed',
        message: 'Could not create product',
        details: error.message
      });
    }

    console.log('Product created successfully:', product.id); // Debug log

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong while creating the product'
    });
  }
});

// Update product - ✅ FIXED VERSION  
router.put('/:id', authenticateToken, requireSeller, validateParams(schemas.uuidParam), validateBody(schemas.productUpdate), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if product exists and user owns it using admin client
    const { data: existingProduct, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('seller_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingProduct) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'The requested product does not exist'
      });
    }

    if (existingProduct.seller_id !== req.user.id && req.user.user_type !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only update your own products'
      });
    }

    // Update using admin client
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Product update error:', error);
      return res.status(500).json({
        error: 'Product update failed',
        message: 'Could not update product'
      });
    }

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Product update error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong while updating the product'
    });
  }
});

// Delete product - ✅ FIXED VERSION
router.delete('/:id', authenticateToken, requireSeller, validateParams(schemas.uuidParam), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists and user owns it using admin client
    const { data: existingProduct, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('seller_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingProduct) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'The requested product does not exist'
      });
    }

    if (existingProduct.seller_id !== req.user.id && req.user.user_type !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only delete your own products'
      });
    }

    // Delete using admin client
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Product deletion error:', error);
      return res.status(500).json({
        error: 'Product deletion failed',
        message: 'Could not delete product'
      });
    }

    res.json({
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Product deletion error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong while deleting the product'
    });
  }
});

// Upload product images
router.post('/:id/images', authenticateToken, requireSeller, validateParams(schemas.uuidParam), upload.array('images', 5), async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        error: 'No files provided',
        message: 'Please select at least one image to upload'
      });
    }

    // Check if product exists and user owns it using admin client
    const { data: existingProduct, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('seller_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingProduct) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'The requested product does not exist'
      });
    }

    if (existingProduct.seller_id !== req.user.id) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only upload images for your own products'
      });
    }

    const uploadedImages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = `products/${id}/${uuidv4()}-${file.originalname}`;

      try {
        // Upload to Supabase Storage
        await uploadFile(file.buffer, fileName);
        const publicUrl = getPublicUrl(fileName);

        // Save image record to database using admin client
        const { data: imageRecord, error: imageError } = await supabaseAdmin
          .from('product_images')
          .insert({
            product_id: id,
            image_url: publicUrl,
            alt_text: file.originalname,
            display_order: i + 1
          })
          .select()
          .single();

        if (imageError) {
          console.error('Image record creation error:', imageError);
          continue;
        }

        uploadedImages.push(imageRecord);
      } catch (uploadError) {
        console.error('File upload error:', uploadError);
        continue;
      }
    }

    res.json({
      message: `${uploadedImages.length} images uploaded successfully`,
      images: uploadedImages
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong while uploading images'
    });
  }
});

// Toggle product favorite
router.post('/:id/favorite', authenticateToken, validateParams(schemas.uuidParam), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if product exists
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, favorites_count')
      .eq('id', id)
      .single();

    if (productError || !product) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'The requested product does not exist'
      });
    }

    // Check if already favorited
    const { data: existingFavorite, error: favoriteError } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', id)
      .single();

    if (favoriteError && favoriteError.code !== 'PGRST116') {
      console.error('Favorite check error:', favoriteError);
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Could not check favorite status'
      });
    }

    if (existingFavorite) {
      // Remove from favorites using admin client
      await supabaseAdmin
        .from('user_favorites')
        .delete()
        .eq('id', existingFavorite.id);

      // Decrement favorites count using admin client
      await supabaseAdmin
        .from('products')
        .update({ favorites_count: Math.max(0, product.favorites_count - 1) })
        .eq('id', id);

      res.json({
        message: 'Product removed from favorites',
        is_favorited: false
      });
    } else {
      // Add to favorites using admin client
      await supabaseAdmin
        .from('user_favorites')
        .insert({
          user_id: userId,
          product_id: id
        });

      // Increment favorites count using admin client
      await supabaseAdmin
        .from('products')
        .update({ favorites_count: product.favorites_count + 1 })
        .eq('id', id);

      res.json({
        message: 'Product added to favorites',
        is_favorited: true
      });
    }
  } catch (error) {
    console.error('Favorite toggle error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong while updating favorites'
    });
  }
});

// Get similar products
router.get('/:id/similar', validateParams(schemas.uuidParam), async (req, res) => {
  try {
    const { id } = req.params;

    // Get the current product details
    const { data: currentProduct, error: currentError } = await supabase
      .from('products')
      .select('waste_type, quality_grade, price_per_kg')
      .eq('id', id)
      .single();

    if (currentError || !currentProduct) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'The requested product does not exist'
      });
    }

    // Find similar products
    const { data: similarProducts, error } = await supabase
      .from('products')
      .select(`
        *,
        users!products_seller_id_fkey (
          id,
          full_name,
          business_name,
          city,
          province,
          rating,
          is_verified
        )
      `)
      .eq('waste_type', currentProduct.waste_type)
      .eq('status', 'active')
      .neq('id', id)
      .limit(6);

    if (error) {
      console.error('Similar products fetch error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Could not fetch similar products'
      });
    }

    res.json({
      similar_products: similarProducts
    });
  } catch (error) {
    console.error('Similar products error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong while fetching similar products'
    });
  }
});

module.exports = router;