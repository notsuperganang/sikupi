-- Product Rating Summary View
-- Creates aggregated rating statistics for all products
-- This view can be used to quickly get rating info without complex queries

CREATE OR REPLACE VIEW product_rating_summary AS
SELECT 
  p.id as product_id,
  p.title,
  p.published,
  COALESCE(COUNT(pr.id), 0) as total_reviews,
  COALESCE(ROUND(AVG(pr.rating), 1), 0) as avg_rating,
  COALESCE(COUNT(CASE WHEN pr.rating = 5 THEN 1 END), 0) as five_stars,
  COALESCE(COUNT(CASE WHEN pr.rating = 4 THEN 1 END), 0) as four_stars,
  COALESCE(COUNT(CASE WHEN pr.rating = 3 THEN 1 END), 0) as three_stars,
  COALESCE(COUNT(CASE WHEN pr.rating = 2 THEN 1 END), 0) as two_stars,
  COALESCE(COUNT(CASE WHEN pr.rating = 1 THEN 1 END), 0) as one_star,
  MAX(pr.created_at) as latest_review_date
FROM products p
LEFT JOIN product_reviews pr ON p.id = pr.product_id
GROUP BY p.id, p.title, p.published;

-- Index for better performance
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_rating 
ON product_reviews(product_id, rating);

CREATE INDEX IF NOT EXISTS idx_product_reviews_created_at 
ON product_reviews(created_at);

-- Grant access to the view
GRANT SELECT ON product_rating_summary TO anon, authenticated;

COMMENT ON VIEW product_rating_summary IS 'Aggregated rating statistics for all products. Updated automatically when reviews are added/modified.';
