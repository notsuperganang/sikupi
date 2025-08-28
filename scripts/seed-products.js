const { createClient } = require('@supabase/supabase-js')
const path = require('path')

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  console.error('Make sure to set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Sample product data covering all categories and combinations
const products = [
  // AMPAS KOPI (Coffee Grounds) - Main category
  {
    kind: 'ampas',
    category: 'ampas_kopi',
    sku: 'AMP-ARB-HALUS-001',
    title: 'Ampas Kopi Arabika Halus Premium',
    slug: 'ampas-kopi-arabika-halus-premium',
    description: 'Ampas kopi arabika dengan tingkat penggilingan halus, cocok untuk kompos premium dan media tanam berkualitas tinggi. Berasal dari kedai kopi terpilih di Banda Aceh.',
    coffee_type: 'arabika',
    grind_level: 'halus',
    condition: 'kering',
    price_idr: 8000,
    stock_qty: 50.5,
    published: true,
    image_urls: ['/image-asset/coffee-grounds-arabica.jpg', '/image-asset/coffee-grounds-fine.jpg']
  },
  {
    kind: 'ampas',
    category: 'ampas_kopi',
    sku: 'AMP-ROB-SEDANG-002',
    title: 'Ampas Kopi Robusta Sedang',
    slug: 'ampas-kopi-robusta-sedang',
    description: 'Ampas kopi robusta dengan penggilingan sedang. Ideal untuk campuran kompos dan pupuk organik. Kandungan nitrogen yang baik untuk tanaman.',
    coffee_type: 'robusta',
    grind_level: 'sedang',
    condition: 'kering',
    price_idr: 6500,
    stock_qty: 75.2,
    published: true,
    image_urls: ['/image-asset/coffee-grounds-robusta.jpg']
  },
  {
    kind: 'ampas',
    category: 'ampas_kopi',
    sku: 'AMP-MIX-KASAR-003',
    title: 'Ampas Kopi Mix Kasar',
    slug: 'ampas-kopi-mix-kasar',
    description: 'Campuran ampas kopi arabika dan robusta dengan penggilingan kasar. Cocok untuk drainase tanaman dan kompos aerobik.',
    coffee_type: 'mix',
    grind_level: 'kasar',
    condition: 'basah',
    price_idr: 5000,
    stock_qty: 120.8,
    published: true,
    image_urls: ['/image-asset/coffee-grounds-mix.jpg', '/image-asset/coffee-grounds-coarse.jpg']
  },
  {
    kind: 'ampas',
    category: 'ampas_kopi',
    sku: 'AMP-ARB-SEDANG-004',
    title: 'Ampas Kopi Arabika Gayo Premium',
    slug: 'ampas-kopi-arabika-gayo-premium',
    description: 'Ampas kopi arabika Gayo yang terkenal dari dataran tinggi Aceh. Kualitas premium dengan aroma yang masih tersisa.',
    coffee_type: 'arabika',
    grind_level: 'sedang',
    condition: 'kering',
    price_idr: 12000,
    stock_qty: 25.3,
    published: true,
    image_urls: ['/image-asset/coffee-grounds-gayo.jpg']
  },

  // BRIKET (Briquettes from coffee waste)
  {
    kind: 'turunan',
    category: 'briket',
    sku: 'BRK-ECO-001',
    title: 'Briket Eco Ampas Kopi',
    slug: 'briket-eco-ampas-kopi',
    description: 'Briket ramah lingkungan yang dibuat dari ampas kopi terkompresi. Pembakaran bersih dan tahan lama untuk keperluan memasak.',
    coffee_type: 'unknown',
    grind_level: 'unknown',
    condition: 'kering',
    price_idr: 15000,
    stock_qty: 200.0,
    published: true,
    image_urls: ['/image-asset/coffee-briquette.jpg', '/image-asset/eco-briquette.jpg']
  },
  {
    kind: 'turunan',
    category: 'briket',
    sku: 'BRK-PREMIUM-002',
    title: 'Briket Premium Coffee Waste',
    slug: 'briket-premium-coffee-waste',
    description: 'Briket berkualitas tinggi dengan campuran ampas kopi dan bahan organik lainnya. Menghasilkan panas stabil dan asap minimal.',
    coffee_type: 'unknown',
    grind_level: 'unknown',
    condition: 'kering',
    price_idr: 18000,
    stock_qty: 150.5,
    published: true,
    image_urls: ['/image-asset/premium-briquette.jpg']
  },

  // PULP (Coffee pulp/cherry waste)
  {
    kind: 'turunan',
    category: 'pulp',
    sku: 'PLP-ORGANIC-001',
    title: 'Pulp Kopi Organik',
    slug: 'pulp-kopi-organik',
    description: 'Pulp dari buah kopi yang sudah difermentasi. Kaya akan nutrisi dan cocok untuk pupuk organik premium.',
    coffee_type: 'unknown',
    grind_level: 'unknown',
    condition: 'kering',
    price_idr: 10000,
    stock_qty: 80.7,
    published: true,
    image_urls: ['/image-asset/coffee-pulp.jpg']
  },

  // SCRUB (Coffee scrub for skincare)
  {
    kind: 'turunan',
    category: 'scrub',
    sku: 'SCR-BODY-001',
    title: 'Scrub Tubuh Ampas Kopi Alami',
    slug: 'scrub-tubuh-ampas-kopi-alami',
    description: 'Scrub tubuh alami dari ampas kopi untuk eksfoliasi kulit. Membantu mengangkat sel kulit mati dan melancarkan sirkulasi darah.',
    coffee_type: 'unknown',
    grind_level: 'unknown',
    condition: 'kering',
    price_idr: 25000,
    stock_qty: 45.2,
    published: true,
    image_urls: ['/image-asset/coffee-scrub.jpg', '/image-asset/body-scrub.jpg']
  },
  {
    kind: 'turunan',
    category: 'scrub',
    sku: 'SCR-FACE-002',
    title: 'Scrub Wajah Coffee Glow',
    slug: 'scrub-wajah-coffee-glow',
    description: 'Scrub wajah dengan butiran ampas kopi yang halus. Diperkaya dengan minyak alami untuk kulit wajah yang lebih cerah.',
    coffee_type: 'unknown',
    grind_level: 'unknown',
    condition: 'kering',
    price_idr: 35000,
    stock_qty: 30.0,
    published: true,
    image_urls: ['/image-asset/face-scrub-coffee.jpg']
  },

  // PUPUK (Fertilizer)
  {
    kind: 'turunan',
    category: 'pupuk',
    sku: 'PPK-KOMPOS-001',
    title: 'Pupuk Kompos Ampas Kopi',
    slug: 'pupuk-kompos-ampas-kopi',
    description: 'Pupuk kompos organik dari ampas kopi yang sudah difermentasi sempurna. Kaya nitrogen dan mineral untuk pertumbuhan tanaman optimal.',
    coffee_type: 'unknown',
    grind_level: 'unknown',
    condition: 'kering',
    price_idr: 12000,
    stock_qty: 300.5,
    published: true,
    image_urls: ['/image-asset/coffee-compost.jpg', '/image-asset/organic-fertilizer.jpg']
  },
  {
    kind: 'turunan',
    category: 'pupuk',
    sku: 'PPK-CAIR-002',
    title: 'Pupuk Cair Ekstrak Kopi',
    slug: 'pupuk-cair-ekstrak-kopi',
    description: 'Pupuk cair dari ekstrak ampas kopi. Mudah diserap tanaman dan cocok untuk tanaman hias dan sayuran.',
    coffee_type: 'unknown',
    grind_level: 'unknown',
    condition: 'basah',
    price_idr: 20000,
    stock_qty: 100.0,
    published: true,
    image_urls: ['/image-asset/liquid-fertilizer-coffee.jpg']
  },

  // PAKAN TERNAK (Animal feed)
  {
    kind: 'turunan',
    category: 'pakan_ternak',
    sku: 'PKN-SAPI-001',
    title: 'Pakan Sapi Campuran Ampas Kopi',
    slug: 'pakan-sapi-campuran-ampas-kopi',
    description: 'Pakan ternak sapi yang diperkaya dengan ampas kopi kering. Meningkatkan nilai gizi dan mengurangi limbah.',
    coffee_type: 'unknown',
    grind_level: 'unknown',
    condition: 'kering',
    price_idr: 8000,
    stock_qty: 500.0,
    published: true,
    image_urls: ['/image-asset/cattle-feed-coffee.jpg']
  },
  {
    kind: 'turunan',
    category: 'pakan_ternak',
    sku: 'PKN-AYAM-002',
    title: 'Pakan Ayam Plus Coffee Waste',
    slug: 'pakan-ayam-plus-coffee-waste',
    description: 'Pakan ayam yang ditambahkan ampas kopi sebagai suplemen. Membantu meningkatkan sistem imun ayam.',
    coffee_type: 'unknown',
    grind_level: 'unknown',
    condition: 'kering',
    price_idr: 15000,
    stock_qty: 250.3,
    published: true,
    image_urls: ['/image-asset/chicken-feed-coffee.jpg']
  },

  // LAINNYA (Others)
  {
    kind: 'turunan',
    category: 'lainnya',
    sku: 'LNY-PEWARNA-001',
    title: 'Pewarna Alami dari Ampas Kopi',
    slug: 'pewarna-alami-dari-ampas-kopi',
    description: 'Pewarna alami berwarna cokelat dari ekstrak ampas kopi. Cocok untuk kerajinan, tekstil, dan seni.',
    coffee_type: 'unknown',
    grind_level: 'unknown',
    condition: 'kering',
    price_idr: 30000,
    stock_qty: 15.5,
    published: true,
    image_urls: ['/image-asset/coffee-dye.jpg']
  },
  {
    kind: 'turunan',
    category: 'lainnya',
    sku: 'LNY-MEDIA-002',
    title: 'Media Tanam Campuran Coffee Waste',
    slug: 'media-tanam-campuran-coffee-waste',
    description: 'Media tanam khusus dengan campuran ampas kopi, sekam, dan bahan organik lainnya. Ideal untuk tanaman hias dan sayuran.',
    coffee_type: 'unknown',
    grind_level: 'unknown',
    condition: 'kering',
    price_idr: 18000,
    stock_qty: 180.0,
    published: true,
    image_urls: ['/image-asset/growing-medium-coffee.jpg', '/image-asset/planting-medium.jpg']
  },

  // Additional products for variety
  {
    kind: 'ampas',
    category: 'ampas_kopi',
    sku: 'AMP-FRESH-005',
    title: 'Ampas Kopi Segar Harian',
    slug: 'ampas-kopi-segar-harian',
    description: 'Ampas kopi segar yang dikumpulkan setiap hari dari berbagai kedai kopi di Banda Aceh. Kondisi masih basah dan cocok untuk kompos cepat.',
    coffee_type: 'mix',
    grind_level: 'sedang',
    condition: 'basah',
    price_idr: 3500,
    stock_qty: 200.0,
    published: true,
    image_urls: ['/image-asset/fresh-coffee-grounds.jpg']
  },
  {
    kind: 'turunan',
    category: 'lainnya',
    sku: 'LNY-DEODOR-003',
    title: 'Deodorizer Alami Ampas Kopi',
    slug: 'deodorizer-alami-ampas-kopi',
    description: 'Penyerap bau alami dari ampas kopi kering. Efektif untuk lemari, kulkas, dan ruangan. Ramah lingkungan dan dapat didaur ulang.',
    coffee_type: 'unknown',
    grind_level: 'unknown',
    condition: 'kering',
    price_idr: 22000,
    stock_qty: 60.0,
    published: true,
    image_urls: ['/image-asset/coffee-deodorizer.jpg']
  }
]

async function seedProducts(force = false) {
  console.log('🌱 Starting product seeding...')
  
  try {
    // Check if products already exist
    const { data: existingProducts, error: checkError } = await supabase
      .from('products')
      .select('id')
      .limit(1)

    if (checkError) {
      console.error('❌ Error checking existing products:', checkError)
      return
    }

    if (existingProducts && existingProducts.length > 0) {
      if (!force) {
        console.log('⚠️  Products already exist. Use force=true to overwrite or clear manually.')
        console.log('💡 Skipping seeding to avoid conflicts.')
        return
      }
      
      console.log('⚠️  Products already exist. Force clearing existing data...')
      
      // Clear existing products (be careful in production!)
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .neq('id', 0) // Delete all

      if (deleteError) {
        console.error('❌ Error clearing existing products:', deleteError)
        console.log('💡 Try clearing order_items first, or use a fresh database')
        return
      }
      
      console.log('✅ Existing products cleared')
    }

    // Insert new products
    console.log(`📦 Inserting ${products.length} products...`)
    
    const { data, error } = await supabase
      .from('products')
      .insert(products)
      .select()

    if (error) {
      console.error('❌ Error inserting products:', error)
      return
    }

    console.log(`✅ Successfully seeded ${data?.length || 0} products!`)
    
    // Display summary
    const categoryCounts = products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1
      return acc
    }, {})

    console.log('\n📊 Product Summary by Category:')
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} products`)
    })

    const kindCounts = products.reduce((acc, product) => {
      acc[product.kind] = (acc[product.kind] || 0) + 1
      return acc
    }, {})

    console.log('\n📋 Product Summary by Kind:')
    Object.entries(kindCounts).forEach(([kind, count]) => {
      console.log(`   ${kind}: ${count} products`)
    })

    console.log('\n🎉 Product seeding completed successfully!')
    
  } catch (error) {
    console.error('❌ Unexpected error during seeding:', error)
  }
}

// Run the seeder
if (require.main === module) {
  seedProducts().then(() => {
    console.log('🏁 Seeding process finished')
    process.exit(0)
  }).catch((error) => {
    console.error('💥 Seeding failed:', error)
    process.exit(1)
  })
}

module.exports = { seedProducts }
