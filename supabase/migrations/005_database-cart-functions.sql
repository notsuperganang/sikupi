-- Additional database functions for cart management

-- Function to get cart statistics for admin dashboard
CREATE OR REPLACE FUNCTION get_cart_statistics()
RETURNS JSON AS $$
DECLARE
  total_users INTEGER;
  total_items BIGINT;
  avg_value NUMERIC;
BEGIN
  -- Count users with cart items
  SELECT COUNT(DISTINCT user_id) INTO total_users
  FROM cart_items;
  
  -- Count total cart items
  SELECT COUNT(*) INTO total_items
  FROM cart_items;
  
  -- Calculate average cart value
  SELECT COALESCE(AVG(cart_value), 0) INTO avg_value
  FROM (
    SELECT SUM(ci.quantity * p.price_idr) as cart_value
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    GROUP BY ci.user_id
  ) cart_values;
  
  RETURN json_build_object(
    'total_users_with_carts', total_users,
    'total_cart_items', total_items,
    'average_cart_value', ROUND(avg_value, 0)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup abandoned carts
CREATE OR REPLACE FUNCTION cleanup_abandoned_carts(
  days_old INTEGER DEFAULT 30,
  dry_run BOOLEAN DEFAULT true
)
RETURNS JSON AS $$
DECLARE
  deleted_count INTEGER;
  affected_users INTEGER;
BEGIN
  IF dry_run THEN
    -- Return what would be deleted without actually deleting
    SELECT COUNT(*) INTO deleted_count
    FROM cart_items 
    WHERE updated_at < (NOW() - INTERVAL '1 day' * days_old);
    
    SELECT COUNT(DISTINCT user_id) INTO affected_users
    FROM cart_items 
    WHERE updated_at < (NOW() - INTERVAL '1 day' * days_old);
    
    RETURN json_build_object(
      'dry_run', true,
      'would_delete_items', deleted_count,
      'would_affect_users', affected_users,
      'cutoff_date', (NOW() - INTERVAL '1 day' * days_old)
    );
  ELSE
    -- Actually delete old cart items
    DELETE FROM cart_items 
    WHERE updated_at < (NOW() - INTERVAL '1 day' * days_old);
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN json_build_object(
      'dry_run', false,
      'deleted_items', deleted_count,
      'cutoff_date', (NOW() - INTERVAL '1 day' * days_old)
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to migrate user cart from session to database (for gradual migration)
CREATE OR REPLACE FUNCTION migrate_session_cart(
  p_user_id UUID,
  p_session_cart JSON
)
RETURNS JSON AS $$
DECLARE
  item RECORD;
  processed_count INTEGER := 0;
  error_count INTEGER := 0;
  result JSON;
BEGIN
  -- Clear existing cart for this user
  DELETE FROM cart_items WHERE user_id = p_user_id;
  
  -- Process each item from session cart
  FOR item IN SELECT * FROM json_to_recordset(p_session_cart) AS items(
    product_id INTEGER,
    quantity NUMERIC
  )
  LOOP
    BEGIN
      -- Insert cart item
      INSERT INTO cart_items (user_id, product_id, quantity)
      VALUES (p_user_id, item.product_id, item.quantity);
      
      processed_count := processed_count + 1;
    EXCEPTION WHEN OTHERS THEN
      error_count := error_count + 1;
      -- Continue processing other items
    END;
  END LOOP;
  
  RETURN json_build_object(
    'success', true,
    'processed_items', processed_count,
    'error_count', error_count
  );
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;