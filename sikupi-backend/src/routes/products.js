const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { supabase, supabaseAdmin } = require('../config/supabase'); // Import both
const { uploadFile, getPublicUrl } = require('../config/storage');
const { authenticateToken, requireSeller, optionalAuth } = require('../middleware/auth');
const { validateBody, validateParams, validateQuery, schemas } = require('../middleware/validation');

const router = express.Router();

// 🧪 TEST ENDPOINT - untuk debug seller join issue
router.get('/debug/seller-test/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    console.log('🧪 SELLER DEBUG TEST START');
    console.log('Testing product ID:', productId);

    const results = {};

    // Test 1: Basic product query
    console.log('Test 1: Basic product query...');
    try {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (productError) throw productError;
      
      results.test1_product = {
        success: true,
        data: {
          id: product.id,
          title: product.title,
          seller_id: product.seller_id
        }
      };
      console.log('✅ Test 1 passed');
    } catch (error) {
      results.test1_product = {
        success: false,
        error: error.message
      };
      console.log('❌ Test 1 failed:', error.message);
    }

    // Test 2: Direct user query
    if (results.test1_product.success) {
      const sellerId = results.test1_product.data.seller_id;
      console.log('Test 2: Direct user query for seller_id:', sellerId);
      
      try {
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', sellerId)
          .single();

        if (userError) throw userError;

        results.test2_user = {
          success: true,
          data: {
            id: user.id,
            full_name: user.full_name,
            business_name: user.business_name,
            city: user.city
          }
        };
        console.log('✅ Test 2 passed');
      } catch (error) {
        results.test2_user = {
          success: false,
          error: error.message,
          details: error
        };
        console.log('❌ Test 2 failed:', error.message);
      }
    }

    // Test 3: JOIN query
    console.log('Test 3: JOIN query...');
    try {
      const { data: joinedData, error: joinError } = await supabase
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
        .eq('id', productId)
        .single();

      if (joinError) throw joinError;

      results.test3_join = {
        success: true,
        data: {
          product_id: joinedData.id,
          product_title: joinedData.title,
          users_data: joinedData.users
        }
      };
      console.log('✅ Test 3 passed');
    } catch (error) {
      results.test3_join = {
        success: false,
        error: error.message,
        details: error
      };
      console.log('❌ Test 3 failed:', error.message);
    }

    // Test 4: Check RLS policies
    console.log('Test 4: Checking RLS policies...');
    try {
      const { data: policies, error: policiesError } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'users');

      results.test4_rls = {
        success: !policiesError,
        data: policies || [],
        note: "Empty array means RLS might be disabled"
      };
      console.log('✅ Test 4 completed');
    } catch (error) {
      results.test4_rls = {
        success: false,
        error: error.message,
        note: "Could not check RLS policies"
      };
    }

    console.log('🧪 SELLER DEBUG TEST END');

    res.json({
      success: true,
      debug_results: results,
      recommendations: [
        results.test1_product.success ? "✅ Product query OK" : "❌ Product not found or access denied",
        results.test2_user?.success ? "✅ User query OK" : "❌ User access blocked - likely RLS issue",
        results.test3_join?.success ? "✅ JOIN query OK" : "❌ JOIN blocked - check RLS policies",
        "💡 If user queries fail, try: ALTER TABLE users DISABLE ROW LEVEL SECURITY;"
      ]
    });

  } catch (error) {
    console.error('💥 Debug test failed:', error);
    res.status(500).json({
      success: false,
      error: 'Debug test failed',
      message: error.message
    });
  }
});

// 🔍 TAMBAHAN: Endpoint untuk quick RLS check
router.get('/debug/rls-status', async (req, res) => {
  try {
    // Check if we can access users table
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name')
      .limit(1);

    res.json({
      success: true,
      can_access_users: !error,
      error: error?.message || null,
      sample_data: data?.[0] || null,
      message: error 
        ? "❌ Cannot access users table - likely RLS blocking"
        : "✅ Can access users table - RLS OK or disabled"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Clean formatProductForFrontend - remove excessive debug logs
const formatProductForFrontend = (product) => {
  return {
    id: product.id,
    sellerId: product.seller_id,
    title: product.title,
    description: product.description,
    wasteType: product.waste_type,
    quantityKg: parseFloat(product.quantity_kg || 0),
    pricePerKg: parseFloat(product.price_per_kg || 0),
    qualityGrade: product.quality_grade,
    grade: product.quality_grade,
    processingMethod: product.processing_method,
    originLocation: product.origin_location,
    location: product.origin_location,
    harvestDate: product.harvest_date,
    expiryDate: product.expiry_date, // ✅ Include expiryDate
    moistureContent: product.moisture_content ? parseFloat(product.moisture_content) : null,
    organicCertified: Boolean(product.organic_certified),
    fairTradeCertified: Boolean(product.fair_trade_certified),
    status: product.status,
    images: Array.isArray(product.image_urls) ? product.image_urls : [],
    tags: Array.isArray(product.tags) ? product.tags : [],
    viewsCount: parseInt(product.views_count || 0),
    favoritesCount: parseInt(product.favorites_count || 0),
    createdAt: product.created_at,
    updatedAt: product.updated_at,
    
    // Clean seller mapping
    seller: product.users ? {
      id: product.users.id,
      fullName: product.users.full_name || 'Unknown Seller',
      businessName: product.users.business_name || null,
      city: product.users.city || null,
      province: product.users.province || null,
      rating: parseFloat(product.users.rating || 0),
      totalReviews: parseInt(product.users.total_reviews || 0),
      isVerified: Boolean(product.users.is_verified),
      phone: product.users.phone || null,
      email: product.users.email || null
    } : null
  };
};

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

// PERBAIKAN: Get all products dengan debug logging
router.get('/', validateQuery(schemas.productQuery), optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      waste_type,
      wasteType, 
      quality_grade,
      qualityGrade, 
      min_price,
      minPrice, 
      max_price,
      maxPrice, 
      city,
      province,
      organic_certified,
      organicCertified, 
      fair_trade_certified,
      fairTradeCertified, 
      sort_by = 'created_at',
      sortBy, 
      order = 'desc'
    } = req.query;

    console.log('Products API called with params:', req.query); // DEBUG

    // Normalize parameters
    const normalizedParams = {
      wasteType: wasteType || waste_type,
      qualityGrade: qualityGrade || quality_grade,
      minPrice: minPrice || min_price,
      maxPrice: maxPrice || max_price,
      organicCertified: organicCertified !== undefined ? organicCertified : organic_certified,
      fairTradeCertified: fairTradeCertified !== undefined ? fairTradeCertified : fair_trade_certified,
      sortBy: sortBy || sort_by
    };

    console.log('Normalized params:', normalizedParams); // DEBUG

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
          is_verified,
          phone,
          email
        )
      `)
      .eq('status', 'active');

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (normalizedParams.wasteType) {
      query = query.eq('waste_type', normalizedParams.wasteType);
    }

    if (normalizedParams.qualityGrade) {
      query = query.eq('quality_grade', normalizedParams.qualityGrade);
    }

    if (normalizedParams.minPrice) {
      query = query.gte('price_per_kg', normalizedParams.minPrice);
    }

    if (normalizedParams.maxPrice) {
      query = query.lte('price_per_kg', normalizedParams.maxPrice);
    }

    if (city) {
      query = query.eq('users.city', city);
    }

    if (province) {
      query = query.eq('users.province', province);
    }

    if (normalizedParams.organicCertified !== undefined) {
      query = query.eq('organic_certified', normalizedParams.organicCertified);
    }

    if (normalizedParams.fairTradeCertified !== undefined) {
      query = query.eq('fair_trade_certified', normalizedParams.fairTradeCertified);
    }

    // Apply sorting - PERBAIKAN
    const ascending = order === 'asc';
    let sortField = normalizedParams.sortBy;
    
    // Handle frontend sortBy values
    if (sortField === 'newest') sortField = 'created_at';
    if (sortField === 'oldest') { 
      sortField = 'created_at';
    }
    if (sortField === 'price_low') { 
      sortField = 'price_per_kg'; 
    }
    if (sortField === 'price_high') { 
      sortField = 'price_per_kg'; 
    }
    if (sortField === 'popular') {
      sortField = 'views_count';
      console.log('Sorting by popular (views_count)'); // DEBUG
    }
    if (sortField === 'rating') sortField = 'users.rating';

    const sortAscending = sortField === 'oldest' ? true : 
                         (sortField === 'price_high' || sortField === 'views_count') ? false : 
                         ascending;

    console.log(`Sorting by: ${sortField}, ascending: ${sortAscending}`); // DEBUG

    query = query.order(sortField, { ascending: sortAscending });

    // Apply pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: products, error } = await query;

    if (error) {
      console.error('Products fetch error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch products',
        message: 'Could not retrieve products'
      });
    }

    console.log(`Found ${products?.length || 0} products`); // DEBUG
    
    if (products && products.length > 0) {
      console.log('Sample product before formatting:', products[0]); // DEBUG
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Apply same filters for count
    if (search) {
      countQuery = countQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    if (normalizedParams.wasteType) {
      countQuery = countQuery.eq('waste_type', normalizedParams.wasteType);
    }
    if (normalizedParams.qualityGrade) {
      countQuery = countQuery.eq('quality_grade', normalizedParams.qualityGrade);
    }
    if (normalizedParams.minPrice) {
      countQuery = countQuery.gte('price_per_kg', normalizedParams.minPrice);
    }
    if (normalizedParams.maxPrice) {
      countQuery = countQuery.lte('price_per_kg', normalizedParams.maxPrice);
    }

    const { count } = await countQuery;

    // Format products for frontend
    const formattedProducts = products ? products.map(formatProductForFrontend) : [];

    console.log(`Returning ${formattedProducts.length} formatted products`); // DEBUG

    const response = {
      success: true,
      products: formattedProducts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil((count || 0) / parseInt(limit)),
        pageSize: parseInt(limit),
        totalItems: count || 0,
        hasNextPage: parseInt(page) < Math.ceil((count || 0) / parseInt(limit)),
        hasPrevPage: parseInt(page) > 1
      }
    };

    console.log('Final API response structure:', {
      success: response.success,
      productsCount: response.products.length,
      pagination: response.pagination
    }); // DEBUG

    res.json(response);
  } catch (error) {
    console.error('Products fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Something went wrong while fetching products'
    });
  }
});

// Get single product by ID - CLEAN PRODUCTION VERSION  
router.get('/:id', validateParams(schemas.uuidParam), optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Basic logging for monitoring
    console.log(`Fetching product: ${id}`);

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
          is_verified,
          phone,
          email
        )
      `)
      .eq('id', id)
      .single();

    const { data: product, error } = await query;

    if (error) {
      console.error('Product fetch error:', error.code, error.message);
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Product not found',
          message: 'The requested product does not exist'
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch product',
        message: 'Could not retrieve product details'
      });
    }

    // Check if user has favorited this product (if authenticated)
    let isFavorited = false;
    if (userId) {
      // TODO: Implement favorites check when favorites table is ready
      // const { data: favorite } = await supabase
      //   .from('favorites')
      //   .select('id')
      //   .eq('user_id', userId)
      //   .eq('product_id', id)
      //   .single();
      // isFavorited = !!favorite;
    }

    // Increment view count (only in production)
    if (process.env.NODE_ENV === 'production') {
      await supabase
        .from('products')
        .update({ views_count: (product.views_count || 0) + 1 })
        .eq('id', id);
    }

    // Format product for frontend
    const formattedProduct = {
      ...formatProductForFrontend(product),
      isFavorited
    };

    // Log success (minimal)
    console.log(`✅ Product fetched successfully: ${product.title}`);

    res.json({
      success: true,
      product: formattedProduct
    });
  } catch (error) {
    console.error('Product fetch unexpected error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Something went wrong while fetching product'
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