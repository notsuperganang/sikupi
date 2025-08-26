const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function createTestUser() {
  console.log('🔧 Creating test user and profile...\n')
  
  // Admin client to create user
  const supabaseAdmin = createClient(
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
    // Create auth user with admin client
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: 'testuser@sikupi.com',
      password: 'testpassword123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Test User',
        phone: '08123456789'
      }
    })

    if (authError) {
      console.error('❌ Error creating auth user:', authError)
      return null
    }

    console.log('✅ Auth user created:')
    console.log(`   ID: ${authUser.user.id}`)
    console.log(`   Email: ${authUser.user.email}`)

    // Create profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authUser.user.id,
        full_name: 'Test User',
        phone: '08123456789',
        role: 'buyer'
      })
      .select()
      .single()

    if (profileError) {
      console.error('❌ Error creating profile:', profileError)
      return null
    }

    console.log('\n✅ Profile created:')
    console.log(`   ID: ${profile.id}`)
    console.log(`   Name: ${profile.full_name}`)
    console.log(`   Phone: ${profile.phone}`)
    console.log(`   Role: ${profile.role}`)

    return { authUser: authUser.user, profile }
  } catch (error) {
    console.error('❌ Error:', error.message)
    return null
  }
}

async function createTestProduct() {
  console.log('\n🛍️ Ensuring test product exists...\n')
  
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
    const { data: existing } = await supabase
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

    // Create test product if it doesn't exist
    const { data: product, error: createError } = await supabase
      .from('products')
      .insert({
        kind: 'ampas',
        category: 'ampas_kopi',
        sku: 'TEST-AMPAS-001',
        title: 'Ampas Kopi Arabika Premium',
        slug: 'ampas-kopi-arabika-premium',
        description: 'Ampas kopi arabika berkualitas tinggi untuk berbagai keperluan.',
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

    console.log('✅ Test product created:')
    console.log(`   ID: ${product.id}`)
    console.log(`   Title: ${product.title}`)
    console.log(`   Price: Rp ${product.price_idr.toLocaleString('id-ID')}`)
    
    return product
  } catch (error) {
    console.error('❌ Error:', error.message)
    return null
  }
}

async function main() {
  const userData = await createTestUser()
  const product = await createTestProduct()
  
  if (userData && product) {
    console.log('\n🎉 Test data ready!')
    console.log('\n📋 Test Credentials:')
    console.log(`   Email: testuser@sikupi.com`)
    console.log(`   Password: testpassword123`)
    console.log(`   User ID: ${userData.profile.id}`)
    
    console.log('\n🧪 Test the Midtrans integration with:')
    console.log(`curl -X POST http://localhost:3001/api/midtrans/create-transaction \\`)
    console.log(`-H "Content-Type: application/json" \\`)
    console.log(`-d '{`)
    console.log(`  "buyer_id": "${userData.profile.id}",`)
    console.log(`  "items": [`)
    console.log(`    {`)
    console.log(`      "product_id": ${product.id},`)
    console.log(`      "quantity": 2.5`)
    console.log(`    }`)
    console.log(`  ],`)
    console.log(`  "shipping_address": {`)
    console.log(`    "recipient_name": "Test User",`)
    console.log(`    "phone": "08123456789",`)
    console.log(`    "email": "testuser@sikupi.com",`)
    console.log(`    "address": "Jl. Test No. 123, Banda Aceh",`)
    console.log(`    "city": "Banda Aceh",`)
    console.log(`    "postal_code": "23111",`)
    console.log(`    "area_id": "test-area"`)
    console.log(`  },`)
    console.log(`  "shipping_fee_idr": 15000`)
    console.log(`}' | jq .`)
  }
}

main().catch(console.error)