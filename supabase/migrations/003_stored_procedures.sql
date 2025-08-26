-- Stored Procedures (RPCs) for Sikupi
-- These handle business-critical, multi-step operations

-- Function to create a product review (with all business logic validation)
CREATE OR REPLACE FUNCTION create_product_review(
  p_order_item_id bigint,
  p_rating integer,
  p_comment text DEFAULT NULL
)
RETURNS json AS $$
DECLARE
  v_buyer_id uuid;
  v_product_id bigint;
  v_order_status order_status;
  v_existing_review_id bigint;
  v_review_id bigint;
BEGIN
  -- Get the current user ID
  v_buyer_id := auth.uid();
  
  IF v_buyer_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Validate rating
  IF p_rating < 1 OR p_rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;
  
  -- Get order details and validate ownership
  SELECT 
    o.status,
    oi.product_id
  INTO 
    v_order_status,
    v_product_id
  FROM order_items oi
  JOIN orders o ON o.id = oi.order_id
  WHERE oi.id = p_order_item_id
  AND o.buyer_id = v_buyer_id;
  
  -- Check if order item exists and belongs to user
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order item not found or access denied';
  END IF;
  
  -- Check if order is completed
  IF v_order_status != 'completed' THEN
    RAISE EXCEPTION 'Reviews can only be created for completed orders';
  END IF;
  
  -- Check if review already exists for this order item
  SELECT id INTO v_existing_review_id
  FROM product_reviews
  WHERE order_item_id = p_order_item_id;
  
  IF FOUND THEN
    RAISE EXCEPTION 'Review already exists for this order item';
  END IF;
  
  -- Create the review
  INSERT INTO product_reviews (
    product_id,
    order_item_id,
    buyer_id,
    rating,
    comment
  ) VALUES (
    v_product_id,
    p_order_item_id,
    v_buyer_id,
    p_rating,
    p_comment
  ) RETURNING id INTO v_review_id;
  
  -- Return success response
  RETURN json_build_object(
    'success', true,
    'review_id', v_review_id,
    'message', 'Review created successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get product statistics (ratings, review count)
CREATE OR REPLACE FUNCTION get_product_stats(p_product_id bigint)
RETURNS json AS $$
DECLARE
  v_stats record;
BEGIN
  SELECT 
    COUNT(*) as review_count,
    COALESCE(AVG(rating), 0) as avg_rating,
    COALESCE(MIN(rating), 0) as min_rating,
    COALESCE(MAX(rating), 0) as max_rating
  INTO v_stats
  FROM product_reviews
  WHERE product_id = p_product_id;
  
  RETURN json_build_object(
    'review_count', v_stats.review_count,
    'avg_rating', ROUND(v_stats.avg_rating, 2),
    'min_rating', v_stats.min_rating,
    'max_rating', v_stats.max_rating
  );
END;
$$ LANGUAGE plpgsql;

-- Function to update product stock after order
CREATE OR REPLACE FUNCTION update_product_stock(
  p_product_id bigint,
  p_quantity numeric
)
RETURNS json AS $$
DECLARE
  v_current_stock numeric;
  v_new_stock numeric;
BEGIN
  -- Get current stock
  SELECT stock_qty INTO v_current_stock
  FROM products
  WHERE id = p_product_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not found';
  END IF;
  
  v_new_stock := v_current_stock - p_quantity;
  
  -- Check if sufficient stock
  IF v_new_stock < 0 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Insufficient stock',
      'current_stock', v_current_stock,
      'requested_quantity', p_quantity
    );
  END IF;
  
  -- Update stock
  UPDATE products
  SET stock_qty = v_new_stock,
      updated_at = NOW()
  WHERE id = p_product_id;
  
  RETURN json_build_object(
    'success', true,
    'previous_stock', v_current_stock,
    'new_stock', v_new_stock
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create order with items (atomic transaction)
CREATE OR REPLACE FUNCTION create_order_with_items(
  p_buyer_id uuid,
  p_items json,
  p_shipping_address json,
  p_shipping_fee_idr bigint DEFAULT 0,
  p_courier_company text DEFAULT NULL,
  p_courier_service text DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS json AS $$
DECLARE
  v_order_id bigint;
  v_item record;
  v_subtotal_idr bigint := 0;
  v_total_idr bigint;
  v_product_price bigint;
  v_product_title text;
BEGIN
  -- Validate buyer
  IF p_buyer_id != auth.uid() THEN
    RAISE EXCEPTION 'Cannot create order for another user';
  END IF;
  
  -- Create the order
  INSERT INTO orders (
    buyer_id,
    status,
    subtotal_idr,
    shipping_fee_idr,
    total_idr,
    shipping_address,
    courier_company,
    courier_service,
    notes
  ) VALUES (
    p_buyer_id,
    'new',
    0, -- Will be updated after processing items
    p_shipping_fee_idr,
    0, -- Will be calculated after processing items
    p_shipping_address,
    p_courier_company,
    p_courier_service,
    p_notes
  ) RETURNING id INTO v_order_id;
  
  -- Process each item
  FOR v_item IN 
    SELECT * FROM json_to_recordset(p_items) AS items(
      product_id bigint,
      quantity numeric,
      coffee_type text,
      grind_level text,
      condition text
    )
  LOOP
    -- Get product details and validate stock
    SELECT title, price_idr INTO v_product_title, v_product_price
    FROM products
    WHERE id = v_item.product_id
    AND published = true
    AND stock_qty >= v_item.quantity;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product not available or insufficient stock for product ID: %', v_item.product_id;
    END IF;
    
    -- Create order item
    INSERT INTO order_items (
      order_id,
      product_id,
      product_title,
      price_idr,
      qty,
      unit,
      coffee_type,
      grind_level,
      condition,
      image_url
    ) SELECT 
      v_order_id,
      v_item.product_id,
      v_product_title,
      v_product_price,
      v_item.quantity,
      'kg',
      COALESCE(v_item.coffee_type, p.coffee_type::text),
      COALESCE(v_item.grind_level, p.grind_level::text),
      COALESCE(v_item.condition, p.condition::text),
      CASE WHEN p.image_urls IS NOT NULL AND json_array_length(p.image_urls) > 0 
           THEN p.image_urls->>0 
           ELSE NULL 
      END
    FROM products p
    WHERE p.id = v_item.product_id;
    
    -- Update running subtotal
    v_subtotal_idr := v_subtotal_idr + (v_product_price * v_item.quantity);
    
    -- Update product stock
    PERFORM update_product_stock(v_item.product_id, v_item.quantity);
  END LOOP;
  
  -- Calculate total
  v_total_idr := v_subtotal_idr + p_shipping_fee_idr;
  
  -- Update order totals
  UPDATE orders
  SET subtotal_idr = v_subtotal_idr,
      total_idr = v_total_idr,
      updated_at = NOW()
  WHERE id = v_order_id;
  
  RETURN json_build_object(
    'success', true,
    'order_id', v_order_id,
    'subtotal_idr', v_subtotal_idr,
    'total_idr', v_total_idr
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get orders with items for a user
CREATE OR REPLACE FUNCTION get_user_orders(p_user_id uuid)
RETURNS json AS $$
BEGIN
  RETURN (
    SELECT json_agg(
      json_build_object(
        'id', o.id,
        'status', o.status,
        'subtotal_idr', o.subtotal_idr,
        'shipping_fee_idr', o.shipping_fee_idr,
        'total_idr', o.total_idr,
        'shipping_address', o.shipping_address,
        'courier_company', o.courier_company,
        'courier_service', o.courier_service,
        'tracking_number', o.tracking_number,
        'shipping_status', o.shipping_status,
        'payment_status', o.payment_status,
        'paid_at', o.paid_at,
        'notes', o.notes,
        'created_at', o.created_at,
        'updated_at', o.updated_at,
        'items', (
          SELECT json_agg(
            json_build_object(
              'id', oi.id,
              'product_id', oi.product_id,
              'product_title', oi.product_title,
              'price_idr', oi.price_idr,
              'qty', oi.qty,
              'unit', oi.unit,
              'coffee_type', oi.coffee_type,
              'grind_level', oi.grind_level,
              'condition', oi.condition,
              'image_url', oi.image_url
            )
          )
          FROM order_items oi
          WHERE oi.order_id = o.id
        )
      )
    )
    FROM orders o
    WHERE o.buyer_id = p_user_id
    ORDER BY o.created_at DESC
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for product listings with ratings
CREATE OR REPLACE VIEW product_listings AS
SELECT 
  p.*,
  COALESCE(stats.review_count, 0) as review_count,
  COALESCE(stats.avg_rating, 0) as avg_rating
FROM products p
LEFT JOIN LATERAL (
  SELECT 
    COUNT(*) as review_count,
    AVG(rating) as avg_rating
  FROM product_reviews pr
  WHERE pr.product_id = p.id
) stats ON true
WHERE p.published = true;