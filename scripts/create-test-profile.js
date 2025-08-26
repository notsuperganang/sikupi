const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function createTestProfile() {
  console.log('🔧 Creating test profile for Midtrans integration...\n')
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  // Test user ID (UUID v4)
  const testUserId = '123e4567-e89b-12d3-a456-426614174000'
  
  try {
    // Check if profile already exists
    const { data: existing, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', testUserId)
      .single()
    
    if (existing) {
      console.log('✅ Test profile already exists:')
      console.log(`   ID: ${existing.id}`)
      console.log(`   Name: ${existing.full_name}`)
      console.log(`   Phone: ${existing.phone}`)
      console.log(`   Role: ${existing.role}`)
      return existing
    }

    // Create the test profile
    const { data: profile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: testUserId,
        full_name: 'Test User',
        phone: '08123456789',
        role: 'buyer'
      })
      .select()
      .single()

    if (createError) {
      console.error('❌ Error creating profile:', createError)
      return null
    }

    console.log('✅ Test profile created successfully:')
    console.log(`   ID: ${profile.id}`)
    console.log(`   Name: ${profile.full_name}`)
    console.log(`   Phone: ${profile.phone}`)
    console.log(`   Role: ${profile.role}`)
    
    return profile
  } catch (error) {
    console.error('❌ Error:', error.message)
    return null
  }
}

async function createTestProduct() {
  console.log('\n🛍️ Creating test product for orders...\n')
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  try {
    // Check if test product exists
    const { data: existing, error: checkError } = await supabase
      .from('products')
      .select('*')
      .eq('id', 1)
      .single()
    
    if (existing) {
      console.log('✅ Test product already exists:')
      console.log(`   ID: ${existing.id}`)
      console.log(`   Title: ${existing.title}`)
      console.log(`   Price: Rp ${existing.price_idr.toLocaleString('id-ID')}`)
      console.log(`   Stock: ${existing.stock_qty} ${existing.unit}`)
      return existing
    }

    // Create test product
    const { data: product, error: createError } = await supabase
      .from('products')
      .insert({
        kind: 'ampas',
        category: 'ampas_kopi',
        sku: 'TEST-AMPAS-001',
        title: 'Ampas Kopi Arabika Premium',
        slug: 'ampas-kopi-arabika-premium',
        description: 'Ampas kopi arabika berkualitas tinggi untuk berbagai keperluan. Cocok untuk pupuk organik dan kerajinan.',
        coffee_type: 'arabika',
        grind_level: 'halus',
        condition: 'kering',
        price_idr: 25000,
        stock_qty: 100.0,
        unit: 'kg',
        image_urls: ['https://example.com/ampas-kopi.jpg'],
        published: true
      })
      .select()
      .single()

    if (createError) {
      console.error('❌ Error creating product:', createError)
      return null
    }

    console.log('✅ Test product created successfully:')
    console.log(`   ID: ${product.id}`)
    console.log(`   Title: ${product.title}`)
    console.log(`   Price: Rp ${product.price_idr.toLocaleString('id-ID')}`)
    console.log(`   Stock: ${product.stock_qty} ${product.unit}`)
    
    return product
  } catch (error) {
    console.error('❌ Error:', error.message)
    return null
  }
}

async function main() {
  const profile = await createTestProfile()
  const product = await createTestProduct()
  
  if (profile && product) {
    console.log('\n🎉 Test data ready!')
    console.log('\nYou can now test the Midtrans integration with:')
    console.log(`curl -X POST http://localhost:3001/api/midtrans/create-transaction \\`)
    console.log(`-H "Content-Type: application/json" \\`)
    console.log(`-d '{`)
    console.log(`  "buyer_id": "${profile.id}",`)
    console.log(`  "items": [`)
    console.log(`    {`)
    console.log(`      "product_id": ${product.id},`)
    console.log(`      "quantity": 2.5,`)
    console.log(`      "coffee_type": "arabika",`)
    console.log(`      "grind_level": "halus",`)
    console.log(`      "condition": "kering"`)
    console.log(`    }`)
    console.log(`  ],`)
    console.log(`  "shipping_address": {`)
    console.log(`    "recipient_name": "Test User",`)
    console.log(`    "phone": "08123456789",`)
    console.log(`    "email": "test@sikupi.com",`)
    console.log(`    "address": "Jl. Test No. 123, Banda Aceh",`)
    console.log(`    "city": "Banda Aceh",`)
    console.log(`    "postal_code": "23111",`)
    console.log(`    "area_id": "test-area"`)
    console.log(`  },`)
    console.log(`  "shipping_fee_idr": 15000,`)
    console.log(`  "courier_company": "JNE",`)
    console.log(`  "courier_service": "REG",`)
    console.log(`  "notes": "Test order from curl"`)
    console.log(`}' | jq .`)
  }
}

main().catch(console.error)