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

// Sample products with unique SKUs to avoid conflicts
const newProducts = [
  // Additional Coffee Grounds
  {
    kind: 'ampas',
    category: 'ampas_kopi',
    sku: 'AMP-ROB-SEDANG-NEW',
    title: 'Ampas Kopi Robusta Sedang Fresh',
    slug: 'ampas-kopi-robusta-sedang-fresh',
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
    sku: 'AMP-MIX-KASAR-NEW',
    title: 'Ampas Kopi Mix Kasar Economy',
    slug: 'ampas-kopi-mix-kasar-economy',
    description: 'Campuran ampas kopi arabika dan robusta dengan penggilingan kasar. Cocok untuk drainase tanaman dan kompos aerobik.',
    coffee_type: 'mix',
    grind_level: 'kasar',
    condition: 'basah',
    price_idr: 5000,
    stock_qty: 120.8,
    published: true,
    image_urls: ['/image-asset/coffee-grounds-mix.jpg', '/image-asset/coffee-grounds-coarse.jpg']
  },

  // Briquettes
  {
    kind: 'turunan',
    category: 'briket',
    sku: 'BRK-ECO-NEW',
    title: 'Briket Eco Ampas Kopi Premium',
    slug: 'briket-eco-ampas-kopi-premium',
    description: 'Briket ramah lingkungan yang dibuat dari ampas kopi terkompresi. Pembakaran bersih dan tahan lama untuk keperluan memasak.',
    coffee_type: 'unknown',
    grind_level: 'unknown',
    condition: 'kering',
    price_idr: 15000,
    stock_qty: 200.0,
    published: true,
    image_urls: ['/image-asset/coffee-briquette.jpg', '/image-asset/eco-briquette.jpg']
  },

  // Scrub Products
  {
    kind: 'turunan',
    category: 'scrub',
    sku: 'SCR-BODY-NEW',
    title: 'Scrub Tubuh Ampas Kopi Alami Premium',
    slug: 'scrub-tubuh-ampas-kopi-alami-premium',
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
    sku: 'SCR-FACE-NEW',
    title: 'Scrub Wajah Coffee Glow Natural',
    slug: 'scrub-wajah-coffee-glow-natural',
    description: 'Scrub wajah dengan butiran ampas kopi yang halus. Diperkaya dengan minyak alami untuk kulit wajah yang lebih cerah.',
    coffee_type: 'unknown',
    grind_level: 'unknown',
    condition: 'kering',
    price_idr: 35000,
    stock_qty: 30.0,
    published: true,
    image_urls: ['/image-asset/face-scrub-coffee.jpg']
  },

  // Fertilizer
  {
    kind: 'turunan',
    category: 'pupuk',
    sku: 'PPK-KOMPOS-NEW',
    title: 'Pupuk Kompos Ampas Kopi Organic',
    slug: 'pupuk-kompos-ampas-kopi-organic',
    description: 'Pupuk kompos organik dari ampas kopi yang sudah difermentasi sempurna. Kaya nitrogen dan mineral untuk pertumbuhan tanaman optimal.',
    coffee_type: 'unknown',
    grind_level: 'unknown',
    condition: 'kering',
    price_idr: 12000,
    stock_qty: 300.5,
    published: true,
    image_urls: ['/image-asset/coffee-compost.jpg', '/image-asset/organic-fertilizer.jpg']
  },

  // Animal Feed
  {
    kind: 'turunan',
    category: 'pakan_ternak',
    sku: 'PKN-SAPI-NEW',
    title: 'Pakan Sapi Campuran Ampas Kopi Plus',
    slug: 'pakan-sapi-campuran-ampas-kopi-plus',
    description: 'Pakan ternak sapi yang diperkaya dengan ampas kopi kering. Meningkatkan nilai gizi dan mengurangi limbah.',
    coffee_type: 'unknown',
    grind_level: 'unknown',
    condition: 'kering',
    price_idr: 8000,
    stock_qty: 500.0,
    published: true,
    image_urls: ['/image-asset/cattle-feed-coffee.jpg']
  },

  // Others
  {
    kind: 'turunan',
    category: 'lainnya',
    sku: 'LNY-PEWARNA-NEW',
    title: 'Pewarna Alami Coffee Waste Dye',
    slug: 'pewarna-alami-coffee-waste-dye',
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
    sku: 'LNY-DEODOR-NEW',
    title: 'Deodorizer Alami Ampas Kopi Fresh',
    slug: 'deodorizer-alami-ampas-kopi-fresh',
    description: 'Penyerap bau alami dari ampas kopi kering. Efektif untuk lemari, kulkas, dan ruangan. Ramah lingkungan dan dapat didaur ulang.',
    coffee_type: 'unknown',
    grind_level: 'unknown',
    condition: 'kering',
    price_idr: 22000,
    stock_qty: 60.0,
    published: true,
    image_urls: ['/image-asset/coffee-deodorizer.jpg']
  },

  // Some more variety
  {
    kind: 'ampas',
    category: 'ampas_kopi',
    sku: 'AMP-GAYO-SPECIAL',
    title: 'Ampas Kopi Gayo Special Reserve',
    slug: 'ampas-kopi-gayo-special-reserve',
    description: 'Ampas kopi arabika Gayo yang terkenal dari dataran tinggi Aceh. Kualitas premium dengan aroma yang masih tersisa.',
    coffee_type: 'arabika',
    grind_level: 'sedang',
    condition: 'kering',
    price_idr: 12000,
    stock_qty: 25.3,
    published: true,
    image_urls: ['/image-asset/coffee-grounds-gayo.jpg']
  },
  {
    kind: 'turunan',
    category: 'pulp',
    sku: 'PLP-ORGANIC-NEW',
    title: 'Pulp Kopi Organik Premium Grade',
    slug: 'pulp-kopi-organik-premium-grade',
    description: 'Pulp dari buah kopi yang sudah difermentasi. Kaya akan nutrisi dan cocok untuk pupuk organik premium.',
    coffee_type: 'unknown',
    grind_level: 'unknown',
    condition: 'kering',
    price_idr: 10000,
    stock_qty: 80.7,
    published: true,
    image_urls: ['/image-asset/coffee-pulp.jpg']
  }
]

async function addSampleProducts() {
  console.log('🌱 Adding sample products to database...')
  
  try {
    // Check existing products count
    const { data: existingProducts, error: checkError } = await supabase
      .from('products')
      .select('id, title')

    if (checkError) {
      console.error('❌ Error checking existing products:', checkError)
      return
    }

    console.log(`📊 Found ${existingProducts?.length || 0} existing products`)

    // Insert new products
    console.log(`📦 Adding ${newProducts.length} new sample products...`)
    
    const { data, error } = await supabase
      .from('products')
      .insert(newProducts)
      .select()

    if (error) {
      console.error('❌ Error inserting products:', error)
      return
    }

    console.log(`✅ Successfully added ${data?.length || 0} new products!`)
    
    // Display summary
    const categoryCounts = newProducts.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1
      return acc
    }, {})

    console.log('\n📊 Added Products by Category:')
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} products`)
    })

    // Final count
    const { data: finalProducts, error: finalError } = await supabase
      .from('products')
      .select('id')

    if (!finalError) {
      console.log(`\n🎯 Total products in database: ${finalProducts?.length || 0}`)
    }

    console.log('\n🎉 Sample products added successfully!')
    
  } catch (error) {
    console.error('❌ Unexpected error during seeding:', error)
  }
}

// Run the seeder
if (require.main === module) {
  addSampleProducts().then(() => {
    console.log('🏁 Process finished')
    process.exit(0)
  }).catch((error) => {
    console.error('💥 Process failed:', error)
    process.exit(1)
  })
}

module.exports = { addSampleProducts }
