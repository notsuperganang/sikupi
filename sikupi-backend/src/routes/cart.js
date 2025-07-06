const express = require('express');
const { supabase } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');
const { validateBody, validateParams, schemas } = require('../middleware/validation');

const router = express.Router();

// Get user's cart
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: cartItems, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        products (
          id,
          title,
          description,
          waste_type,
          price_per_kg,
          quantity_kg,
          status,
          image_urls,
          users!products_seller_id_fkey (
            id,
            full_name,
            business_name,
            city,
            province
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Cart fetch error:', error);
      return res.status(500).json({
        error: 'Failed to fetch cart',
        message: 'Could not retrieve cart items'
      });
    }

    // Calculate cart totals
    let totalItems = 0;
    let totalAmount = 0;

    const validCartItems = cartItems.filter(item => {
      // Filter out items where product no longer exists or is inactive
      if (!item.products || item.products.status !== 'active') {
        return false;
      }
      
      totalItems += 1;
      totalAmount += item.quantity_kg * item.products.price_per_kg;
      return true;
    });

    res.json({
      cart: {
        items: validCartItems,
        summary: {
          total_items: totalItems,
          total_quantity_kg: validCartItems.reduce((sum, item) => sum + item.quantity_kg, 0),
          total_amount: totalAmount,
          estimated_shipping: 0 // Will be calculated based on shipping address
        }
      }
    });
  } catch (error) {
    console.error('Cart fetch error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong while fetching cart'
    });
  }
});

// Add item to cart
router.post('/items', authenticateToken, validateBody(schemas.cartItemAdd), async (req, res) => {
  try {
    const { product_id, quantity_kg } = req.body;
    const userId = req.user.id;

    // Check if product exists and is available
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, title, price_per_kg, quantity_kg, status, seller_id')
      .eq('id', product_id)
      .single();

    if (productError || !product) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'The requested product does not exist'
      });
    }

    if (product.status !== 'active') {
      return res.status(400).json({
        error: 'Product unavailable',
        message: 'This product is currently not available'
      });
    }

    if (product.seller_id === userId) {
      return res.status(400).json({
        error: 'Cannot add own product',
        message: 'You cannot add your own product to cart'
      });
    }

    if (quantity_kg > product.quantity_kg) {
      return res.status(400).json({
        error: 'Insufficient quantity',
        message: `Only ${product.quantity_kg}kg available`
      });
    }

    // Check if item already exists in cart
    const { data: existingItem, error: existingError } = await supabase
      .from('cart_items')
      .select('id, quantity_kg')
      .eq('user_id', userId)
      .eq('product_id', product_id)
      .single();

    if (existingError && existingError.code !== 'PGRST116') {
      console.error('Cart check error:', existingError);
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Could not check cart'
      });
    }

    if (existingItem) {
      // Update existing cart item
      const newQuantity = existingItem.quantity_kg + quantity_kg;

      if (newQuantity > product.quantity_kg) {
        return res.status(400).json({
          error: 'Insufficient quantity',
          message: `Only ${product.quantity_kg}kg available, you already have ${existingItem.quantity_kg}kg in cart`
        });
      }

      const { data: updatedItem, error: updateError } = await supabase
        .from('cart_items')
        .update({ quantity_kg: newQuantity })
        .eq('id', existingItem.id)
        .select(`
          *,
          products (
            id,
            title,
            price_per_kg,
            users!products_seller_id_fkey (
              full_name,
              business_name
            )
          )
        `)
        .single();

      if (updateError) {
        console.error('Cart update error:', updateError);
        return res.status(500).json({
          error: 'Failed to update cart',
          message: 'Could not update cart item'
        });
      }

      res.json({
        message: 'Cart item updated successfully',
        item: updatedItem
      });
    } else {
      // Add new cart item
      const { data: newItem, error: insertError } = await supabase
        .from('cart_items')
        .insert({
          user_id: userId,
          product_id,
          quantity_kg
        })
        .select(`
          *,
          products (
            id,
            title,
            price_per_kg,
            users!products_seller_id_fkey (
              full_name,
              business_name
            )
          )
        `)
        .single();

      if (insertError) {
        console.error('Cart insert error:', insertError);
        return res.status(500).json({
          error: 'Failed to add to cart',
          message: 'Could not add item to cart'
        });
      }

      res.status(201).json({
        message: 'Item added to cart successfully',
        item: newItem
      });
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong while adding item to cart'
    });
  }
});

// Update cart item quantity
router.put('/items/:id', authenticateToken, validateParams(schemas.uuidParam), validateBody(schemas.cartItemUpdate), async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity_kg } = req.body;
    const userId = req.user.id;

    // Check if cart item exists and belongs to user
    const { data: cartItem, error: cartError } = await supabase
      .from('cart_items')
      .select(`
        *,
        products (
          id,
          quantity_kg,
          status,
          price_per_kg
        )
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (cartError || !cartItem) {
      return res.status(404).json({
        error: 'Cart item not found',
        message: 'The requested cart item does not exist'
      });
    }

    if (!cartItem.products || cartItem.products.status !== 'active') {
      return res.status(400).json({
        error: 'Product unavailable',
        message: 'This product is no longer available'
      });
    }

    if (quantity_kg > cartItem.products.quantity_kg) {
      return res.status(400).json({
        error: 'Insufficient quantity',
        message: `Only ${cartItem.products.quantity_kg}kg available`
      });
    }

    // Update cart item
    const { data: updatedItem, error: updateError } = await supabase
      .from('cart_items')
      .update({ quantity_kg })
      .eq('id', id)
      .select(`
        *,
        products (
          id,
          title,
          price_per_kg,
          users!products_seller_id_fkey (
            full_name,
            business_name
          )
        )
      `)
      .single();

    if (updateError) {
      console.error('Cart update error:', updateError);
      return res.status(500).json({
        error: 'Failed to update cart item',
        message: 'Could not update cart item'
      });
    }

    res.json({
      message: 'Cart item updated successfully',
      item: updatedItem
    });
  } catch (error) {
    console.error('Cart update error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong while updating cart item'
    });
  }
});

// Remove item from cart
router.delete('/items/:id', authenticateToken, validateParams(schemas.uuidParam), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if cart item exists and belongs to user
    const { data: cartItem, error: checkError } = await supabase
      .from('cart_items')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (checkError || !cartItem) {
      return res.status(404).json({
        error: 'Cart item not found',
        message: 'The requested cart item does not exist'
      });
    }

    // Delete cart item
    const { error: deleteError } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Cart delete error:', deleteError);
      return res.status(500).json({
        error: 'Failed to remove item',
        message: 'Could not remove item from cart'
      });
    }

    res.json({
      message: 'Item removed from cart successfully'
    });
  } catch (error) {
    console.error('Cart remove error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong while removing item from cart'
    });
  }
});

// Clear entire cart
router.delete('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Cart clear error:', error);
      return res.status(500).json({
        error: 'Failed to clear cart',
        message: 'Could not clear cart'
      });
    }

    res.json({
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Cart clear error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong while clearing cart'
    });
  }
});

// Get cart item count
router.get('/count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const { count, error } = await supabase
      .from('cart_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      console.error('Cart count error:', error);
      return res.status(500).json({
        error: 'Failed to get cart count',
        message: 'Could not retrieve cart count'
      });
    }

    res.json({
      count: count || 0
    });
  } catch (error) {
    console.error('Cart count error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong while getting cart count'
    });
  }
});

module.exports = router;