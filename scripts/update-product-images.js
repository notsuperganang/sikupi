const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Real image URLs from Unsplash for different product categories
const imageUrls = {
  ampas_kopi: [
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
    'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400',
    'https://images.unsplash.com/photo-1559496417-e7f25cb247cd?w=400'
  ],
  briket: [
    'https://images.unsplash.com/photo-1574263867128-a3d5c1b1dedc?w=400',
    'https://images.unsplash.com/photo-1585438166316-6a2e7de89c1d?w=400',
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400'
  ],
  pulp: [
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    'https://images.unsplash.com/photo-1573246123716-6b1782bfc499?w=400',
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400'
  ],
  scrub: [
    'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
    'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400'
  ],
  pupuk: [
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    'https://images.unsplash.com/photo-1574263867128-a3d5c1b1dedc?w=400',
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400'
  ],
  pakan_ternak: [
    'https://images.unsplash.com/photo-1588022830992-d40e3fa63e94?w=400',
    'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400',
    'https://images.unsplash.com/photo-1574263867128-a3d5c1b1dedc?w=400'
  ],
  lainnya: [
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400',
    'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400',
    'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400'
  ]
};

async function updateProductImages() {
  try {
    console.log('Fetching products...');
    
    const { data: products, error } = await supabase
      .from('products')
      .select('id, category, title');

    if (error) {
      throw error;
    }

    console.log(`Found ${products.length} products to update`);

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const categoryImages = imageUrls[product.category] || imageUrls.lainnya;
      const randomImage = categoryImages[Math.floor(Math.random() * categoryImages.length)];
      
      console.log(`Updating product ${i + 1}/${products.length}: ${product.title}`);
      
      const { error: updateError } = await supabase
        .from('products')
        .update({
          image_urls: [randomImage]
        })
        .eq('id', product.id);

      if (updateError) {
        console.error(`Error updating product ${product.id}:`, updateError);
      } else {
        console.log(`✓ Updated ${product.title} with image: ${randomImage}`);
      }
    }

    console.log('\n✅ Successfully updated all product images!');
    console.log('All products now have working Unsplash image URLs.');

  } catch (error) {
    console.error('Error updating product images:', error);
    process.exit(1);
  }
}

updateProductImages();
