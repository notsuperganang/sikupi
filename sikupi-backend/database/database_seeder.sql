-- Sikupi Coffee Waste Marketplace Sample Data Seeder
-- Run this AFTER the schema creation in Supabase SQL Editor

-- Insert sample users
INSERT INTO users (id, email, password_hash, full_name, phone, user_type, business_name, address, city, province, postal_code, is_verified, rating, total_reviews) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin@sikupi.com', '$2b$10$8K1p/aZZt4.nQJ9LyxQxweNvJDfSKZ1QrPDJ5FXvNFYWMzV9wGkqu', 'Admin Sikupi', '+62812345678', 'admin', 'Sikupi Platform', 'Jl. Sudirman No. 123', 'Jakarta', 'DKI Jakarta', '10110', true, 5.00, 0),
('550e8400-e29b-41d4-a716-446655440002', 'coffeeshop@example.com', '$2b$10$8K1p/aZZt4.nQJ9LyxQxweNvJDfSKZ1QrPDJ5FXvNFYWMzV9wGkqu', 'Sarah Johnson', '+62812345679', 'seller', 'Kopi Nusantara', 'Jl. Malioboro No. 45', 'Yogyakarta', 'DI Yogyakarta', '55271', true, 4.8, 23),
('550e8400-e29b-41d4-a716-446655440003', 'hotel@example.com', '$2b$10$8K1p/aZZt4.nQJ9LyxQxweNvJDfSKZ1QrPDJ5FXvNFYWMzV9wGkqu', 'Michael Chen', '+62812345680', 'seller', 'Grand Hotel Surabaya', 'Jl. Pemuda No. 78', 'Surabaya', 'Jawa Timur', '60271', true, 4.6, 18),
('550e8400-e29b-41d4-a716-446655440004', 'farmer@example.com', '$2b$10$8K1p/aZZt4.nQJ9LyxQxweNvJDfSKZ1QrPDJ5FXvNFYWMzV9wGkqu', 'Budi Santoso', '+62812345681', 'buyer', 'Tani Organik Budi', 'Jl. Raya Cipanas No. 12', 'Bogor', 'Jawa Barat', '16750', true, 4.9, 15),
('550e8400-e29b-41d4-a716-446655440005', 'artisan@example.com', '$2b$10$8K1p/aZZt4.nQJ9LyxQxweNvJDfSKZ1QrPDJ5FXvNFYWMzV9wGkqu', 'Siti Nurhaliza', '+62812345682', 'buyer', 'Kerajinan Siti', 'Jl. Cihampelas No. 89', 'Bandung', 'Jawa Barat', '40114', true, 4.7, 12),
('550e8400-e29b-41d4-a716-446655440006', 'recycler@example.com', '$2b$10$8K1p/aZZt4.nQJ9LyxQxweNvJDfSKZ1QrPDJ5FXvNFYWMzV9wGkqu', 'Ahmad Recycling', '+62812345683', 'buyer', 'EcoRecycle Indonesia', 'Jl. Industri No. 34', 'Bekasi', 'Jawa Barat', '17530', true, 4.5, 8),
('550e8400-e29b-41d4-a716-446655440007', 'newbuyer@example.com', '$2b$10$8K1p/aZZt4.nQJ9LyxQxweNvJDfSKZ1QrPDJ5FXvNFYWMzV9wGkqu', 'Lisa Pratiwi', '+62812345684', 'buyer', null, 'Jl. Diponegoro No. 56', 'Semarang', 'Jawa Tengah', '50241', false, 0.00, 0);

-- Insert sample products
INSERT INTO products (id, seller_id, title, description, waste_type, quantity_kg, price_per_kg, quality_grade, processing_method, origin_location, harvest_date, expiry_date, moisture_content, organic_certified, fair_trade_certified, image_urls, tags, views_count, favorites_count) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Premium Coffee Grounds - Arabica Blend', 'Fresh coffee grounds from our daily espresso preparation. High-quality Arabica blend, perfect for composting or mushroom cultivation.', 'coffee_grounds', 50.00, 8500.00, 'A', 'Wet processing', 'Yogyakarta', '2024-01-15', '2024-02-15', 12.5, true, false, ARRAY['https://example.com/coffee-grounds-1.jpg', 'https://example.com/coffee-grounds-2.jpg'], ARRAY['arabica', 'fresh', 'organic'], 125, 8),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'Hotel Coffee Pulp - Bulk Sale', 'Large quantity of coffee pulp from our hotel restaurant. Great for organic farming and composting.', 'coffee_pulp', 150.00, 6000.00, 'B', 'Natural processing', 'Surabaya', '2024-01-10', '2024-02-10', 15.0, false, false, ARRAY['https://example.com/coffee-pulp-1.jpg'], ARRAY['bulk', 'composting', 'farming'], 89, 12),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Specialty Coffee Husks', 'Coffee husks from specialty single-origin beans. Excellent for tea brewing or craft projects.', 'coffee_husks', 25.00, 12000.00, 'A', 'Dry processing', 'Yogyakarta', '2024-01-20', '2024-03-20', 8.0, true, true, ARRAY['https://example.com/coffee-husks-1.jpg', 'https://example.com/coffee-husks-2.jpg'], ARRAY['specialty', 'single-origin', 'craft'], 67, 15),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 'Coffee Chaff - Light Roast', 'Coffee chaff from our light roasting process. Perfect for gardening mulch or biomass fuel.', 'coffee_chaff', 20.00, 5000.00, 'B', 'Light roasting', 'Surabaya', '2024-01-25', '2024-03-25', 10.0, false, false, ARRAY['https://example.com/coffee-chaff-1.jpg'], ARRAY['mulch', 'gardening', 'biomass'], 45, 6),
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'Organic Coffee Grounds Mix', 'Mixed coffee grounds from various organic beans. Great for soil amendment and mushroom growing.', 'coffee_grounds', 75.00, 7500.00, 'A', 'Mixed processing', 'Yogyakarta', '2024-01-18', '2024-02-18', 11.5, true, false, ARRAY['https://example.com/organic-grounds-1.jpg'], ARRAY['organic', 'mixed', 'mushroom'], 98, 11);

-- Insert sample product images
INSERT INTO product_images (product_id, image_url, alt_text, display_order) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'https://example.com/coffee-grounds-1.jpg', 'Fresh arabica coffee grounds', 1),
('660e8400-e29b-41d4-a716-446655440001', 'https://example.com/coffee-grounds-2.jpg', 'Coffee grounds texture detail', 2),
('660e8400-e29b-41d4-a716-446655440002', 'https://example.com/coffee-pulp-1.jpg', 'Coffee pulp bulk quantity', 1),
('660e8400-e29b-41d4-a716-446655440003', 'https://example.com/coffee-husks-1.jpg', 'Specialty coffee husks', 1),
('660e8400-e29b-41d4-a716-446655440003', 'https://example.com/coffee-husks-2.jpg', 'Coffee husks close-up', 2),
('660e8400-e29b-41d4-a716-446655440004', 'https://example.com/coffee-chaff-1.jpg', 'Light roast coffee chaff', 1),
('660e8400-e29b-41d4-a716-446655440005', 'https://example.com/organic-grounds-1.jpg', 'Organic coffee grounds mix', 1);

-- Insert sample transactions
INSERT INTO transactions (id, buyer_id, seller_id, product_id, quantity_kg, price_per_kg, total_amount, status, payment_method, shipping_address, shipping_cost, confirmed_at, shipped_at, delivered_at) VALUES
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 25.00, 8500.00, 237500.00, 'delivered', 'bank_transfer', 'Jl. Raya Cipanas No. 12, Bogor, Jawa Barat 16750', 25000.00, '2024-01-16 10:30:00', '2024-01-17 14:00:00', '2024-01-18 09:15:00'),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002', 50.00, 6000.00, 325000.00, 'shipped', 'e_wallet', 'Jl. Cihampelas No. 89, Bandung, Jawa Barat 40114', 35000.00, '2024-01-12 15:45:00', '2024-01-13 11:20:00', null),
('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440003', 15.00, 12000.00, 195000.00, 'confirmed', 'bank_transfer', 'Jl. Industri No. 34, Bekasi, Jawa Barat 17530', 20000.00, '2024-01-21 09:00:00', null, null),
('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440004', 20.00, 5000.00, 120000.00, 'pending', 'e_wallet', 'Jl. Raya Cipanas No. 12, Bogor, Jawa Barat 16750', 15000.00, null, null, null);

-- Insert sample cart items
INSERT INTO cart_items (user_id, product_id, quantity_kg) VALUES
('550e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440001', 10.00),
('550e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440005', 20.00),
('550e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440002', 30.00);

-- Insert sample user favorites
INSERT INTO user_favorites (user_id, product_id) VALUES
('550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440005'),
('550e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440004'),
('550e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440005');

-- Insert sample reviews
INSERT INTO reviews (transaction_id, reviewer_id, reviewee_id, rating, review_text) VALUES
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 5, 'Excellent quality coffee grounds! Perfect for my organic farming needs. Fast delivery and great packaging.'),
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 5, 'Great buyer! Payment was prompt and communication was clear. Highly recommended.'),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', 4, 'Good quality coffee pulp. Arrived as described. Will purchase again for my composting business.'),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', 4, 'Professional buyer with clear requirements. Smooth transaction overall.');

-- Insert sample articles
INSERT INTO articles (id, title, slug, content, excerpt, featured_image_url, author_id, category, tags, is_published, views_count, reading_time_minutes) VALUES
('880e8400-e29b-41d4-a716-446655440001', 'Complete Guide to Coffee Waste Composting', 'complete-guide-coffee-waste-composting', 'Coffee waste is an excellent addition to any composting system. This comprehensive guide will walk you through everything you need to know about using coffee grounds, pulp, and other coffee byproducts in your compost pile.

## Why Coffee Waste is Perfect for Composting

Coffee waste is rich in nitrogen, making it an excellent "green" material for composting. The ideal carbon-to-nitrogen ratio for composting is about 30:1, and coffee grounds have a C:N ratio of approximately 20:1, which is perfect for balancing carbon-rich materials.

## Types of Coffee Waste for Composting

### 1. Coffee Grounds
Used coffee grounds are the most common type of coffee waste. They break down quickly and add valuable nutrients to your compost.

### 2. Coffee Filters
Paper coffee filters are compostable and add carbon to your mix.

### 3. Coffee Pulp
The fruit pulp removed during coffee processing is excellent for composting but may need to be balanced with carbon-rich materials.

## Getting Started

1. Collect your coffee waste
2. Mix with carbon-rich materials (leaves, paper, cardboard)
3. Maintain proper moisture levels
4. Turn regularly for aeration
5. Monitor temperature

## Tips for Success

- Don''t add too much coffee waste at once
- Always mix with carbon materials
- Keep the pile moist but not waterlogged
- Turn the pile every 2-3 weeks
- Be patient - composting takes time

Your finished compost will be rich in nutrients and perfect for gardens, potted plants, or lawn care.', 'Learn how to turn coffee waste into nutrient-rich compost for your garden. Complete guide with tips and techniques.', 'https://example.com/articles/composting-guide.jpg', '550e8400-e29b-41d4-a716-446655440001', 'Education', ARRAY['composting', 'gardening', 'sustainability'], true, 456, 8),
('880e8400-e29b-41d4-a716-446655440002', 'Growing Mushrooms with Coffee Grounds', 'growing-mushrooms-coffee-grounds', 'Coffee grounds provide an excellent growing medium for mushrooms. This article explores how to use coffee waste for mushroom cultivation, including species selection and growing techniques.

## Why Coffee Grounds Work for Mushrooms

Coffee grounds are sterile after brewing and contain the nutrients that mushrooms need to thrive. They also have the right pH level and moisture retention properties.

## Best Mushroom Varieties

### Oyster Mushrooms
The easiest variety for beginners. They grow quickly and are very forgiving.

### Shiitake Mushrooms
Require more experience but produce excellent results with coffee grounds.

### Lion''s Mane
A gourmet mushroom that grows well on coffee substrate.

## Growing Process

1. **Preparation**: Collect fresh coffee grounds (within 3 days of brewing)
2. **Sterilization**: Ensure grounds are properly sterilized
3. **Inoculation**: Add mushroom spawn to the grounds
4. **Incubation**: Keep in dark, humid conditions
5. **Fruiting**: Move to light when mushrooms begin to form

## Common Mistakes to Avoid

- Using old, moldy coffee grounds
- Not maintaining proper humidity
- Contamination during the process
- Harvesting too early or too late

## Harvesting and Storage

Harvest mushrooms when caps are fully formed but before spores drop. Store in refrigerator for up to one week.

Coffee ground mushroom cultivation is sustainable, profitable, and rewarding. Start small and expand as you gain experience.', 'Discover how to grow gourmet mushrooms using coffee grounds. Step-by-step guide for beginners and advanced cultivators.', 'https://example.com/articles/mushroom-growing.jpg', '550e8400-e29b-41d4-a716-446655440001', 'Education', ARRAY['mushrooms', 'cultivation', 'upcycling'], true, 342, 12),
('880e8400-e29b-41d4-a716-446655440003', 'Coffee Waste in Sustainable Agriculture', 'coffee-waste-sustainable-agriculture', 'Coffee waste plays a crucial role in sustainable agriculture practices. From soil amendment to natural fertilizer, coffee byproducts offer numerous benefits for farmers and gardeners.

## Environmental Benefits

Coffee waste diverts organic material from landfills, reducing methane emissions and creating valuable agricultural inputs.

## Soil Amendment Properties

Coffee grounds improve soil structure, water retention, and provide slow-release nutrients. They work particularly well in acidic soil conditions.

## Application Methods

### Direct Application
Mix coffee grounds directly into soil, but use sparingly to avoid over-acidification.

### Composting
The preferred method - combine with other organic materials for balanced nutrition.

### Liquid Fertilizer
Steep coffee grounds in water to create a liquid fertilizer for plants.

## Research and Results

Studies show that coffee waste can increase crop yields by 15-20% when properly applied. The key is balanced application and proper composting.

## Best Practices

- Test soil pH before application
- Mix with other organic materials
- Apply during growing season
- Monitor plant response
- Adjust application rates based on results

## Economic Impact

Using coffee waste reduces fertilizer costs while improving soil health. Many farmers report significant savings and improved crop quality.

The future of sustainable agriculture includes making better use of waste products like coffee grounds. This circular economy approach benefits both environment and economy.', 'Explore how coffee waste contributes to sustainable agriculture. Learn application methods and benefits for soil health.', 'https://example.com/articles/sustainable-agriculture.jpg', '550e8400-e29b-41d4-a716-446655440001', 'Education', ARRAY['agriculture', 'sustainability', 'fertilizer'], true, 278, 10),
('880e8400-e29b-41d4-a716-446655440004', 'Creative Uses for Coffee Husks and Chaff', 'creative-uses-coffee-husks-chaff', 'Coffee husks and chaff are often overlooked byproducts of coffee processing. Discover innovative ways to use these materials in crafts, construction, and other creative applications.

## Understanding Coffee Byproducts

Coffee husks are the dried outer shell of coffee cherries, while chaff is the thin skin that comes off during roasting. Both have unique properties that make them useful for various applications.

## Craft Applications

### Natural Dyes
Coffee husks create beautiful brown and tan dyes for fabric and paper.

### Mulch and Decoration
Chaff makes excellent decorative mulch for gardens and landscaping.

### Paper Making
Both materials can be incorporated into handmade paper for texture and color.

## Construction and Building

### Insulation Material
Coffee husks provide natural insulation properties for eco-friendly construction.

### Composite Materials
Mixed with binders, coffee waste creates strong, lightweight building materials.

## Fuel and Energy

### Biomass Fuel
Coffee husks and chaff burn cleanly and provide good heat output.

### Biochar Production
Processing coffee waste into biochar creates valuable soil amendment.

## Commercial Applications

Many companies are now using coffee waste in products ranging from cosmetics to building materials. This creates new revenue streams for coffee producers.

## Getting Started

1. Source quality coffee husks and chaff
2. Experiment with small projects
3. Research local regulations for fuel use
4. Connect with other makers and craftspeople
5. Consider commercial opportunities

Innovation in coffee waste utilization continues to grow. These byproducts offer endless possibilities for creative and sustainable applications.', 'Discover innovative ways to use coffee husks and chaff. From crafts to construction, explore creative applications for coffee byproducts.', 'https://example.com/articles/creative-uses.jpg', '550e8400-e29b-41d4-a716-446655440001', 'Education', ARRAY['crafts', 'upcycling', 'innovation'], true, 189, 7);

-- Insert sample AI assessments
INSERT INTO ai_assessments (product_id, user_id, image_url, assessment_data, quality_score, suggested_grade, confidence_level, processing_time_ms) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'https://example.com/assessment-1.jpg', '{"color": "dark_brown", "texture": "fine", "moisture": "optimal", "contamination": "none", "particle_size": "uniform"}', 92.5, 'A', 89.2, 1250),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'https://example.com/assessment-2.jpg', '{"color": "reddish_brown", "texture": "coarse", "moisture": "high", "contamination": "minimal", "particle_size": "varied"}', 78.0, 'B', 82.5, 1850),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'https://example.com/assessment-3.jpg', '{"color": "golden_brown", "texture": "dry", "moisture": "low", "contamination": "none", "particle_size": "uniform"}', 94.0, 'A', 91.8, 1100);

-- Insert sample platform metrics
INSERT INTO platform_metrics (metric_type, metric_value, unit, description) VALUES
('total_waste_diverted', 2850.75, 'kg', 'Total coffee waste diverted from landfills'),
('co2_emissions_saved', 1425.38, 'kg', 'CO2 emissions saved through waste diversion'),
('active_users', 156, 'count', 'Number of active users on the platform'),
('completed_transactions', 89, 'count', 'Total number of completed transactions'),
('revenue_generated', 15750000, 'idr', 'Total revenue generated on the platform'),
('waste_reused', 2650.25, 'kg', 'Amount of coffee waste successfully reused'),
('trees_equivalent_saved', 47, 'count', 'Equivalent trees saved through waste reduction'),
('water_saved', 28500, 'liters', 'Water saved through waste diversion practices');

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, type, is_read, related_id) VALUES
('550e8400-e29b-41d4-a716-446655440004', 'Order Delivered', 'Your order of Premium Coffee Grounds has been delivered successfully.', 'order_update', true, '770e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440002', 'New Review', 'You received a 5-star review from Budi Santoso.', 'review', true, '770e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440005', 'Order Shipped', 'Your order of Hotel Coffee Pulp has been shipped.', 'order_update', false, '770e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440006', 'Payment Confirmed', 'Payment for your order of Specialty Coffee Husks has been confirmed.', 'payment', false, '770e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440007', 'Welcome to Sikupi', 'Welcome to Sikupi! Start exploring coffee waste products in your area.', 'welcome', false, null);

-- Update user statistics based on transactions and reviews
UPDATE users SET 
    rating = 4.8,
    total_reviews = 2
WHERE id = '550e8400-e29b-41d4-a716-446655440002';

UPDATE users SET 
    rating = 4.0,
    total_reviews = 1
WHERE id = '550e8400-e29b-41d4-a716-446655440003';

UPDATE users SET 
    rating = 5.0,
    total_reviews = 1
WHERE id = '550e8400-e29b-41d4-a716-446655440004';

UPDATE users SET 
    rating = 4.0,
    total_reviews = 1
WHERE id = '550e8400-e29b-41d4-a716-446655440005';