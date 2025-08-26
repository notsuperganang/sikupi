const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function testConnection() {
  console.log('🔍 Testing Sikupi Backend Connections...\n')
  
  // Test 1: Environment Variables
  console.log('1️⃣  Environment Variables')
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'OPENAI_API_KEY',
    'MIDTRANS_SERVER_KEY',
    'BITESHIP_API_KEY'
  ]
  
  const envResults = {}
  for (const varName of requiredVars) {
    const value = process.env[varName]
    const status = !value ? '❌ MISSING' : 
                  (value.startsWith('your-') || value === 'placeholder') ? '⚠️  PLACEHOLDER' : '✅ SET'
    envResults[varName] = status
    console.log(`   ${status} ${varName}`)
  }
  
  const envOk = Object.values(envResults).every(status => status === '✅ SET')
  console.log(`   Result: ${envOk ? '✅ All environment variables configured' : '❌ Some variables need configuration'}\n`)

  if (!envOk) {
    console.log('⚠️  Cannot proceed with database tests - environment variables not properly configured')
    return
  }

  // Test 2: Supabase Connection
  console.log('2️⃣  Supabase Connection')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (error) throw error
    console.log('   ✅ Supabase connection successful')
  } catch (error) {
    console.log(`   ❌ Supabase connection failed: ${error.message}`)
    return
  }

  // Test 3: Database Tables
  console.log('\n3️⃣  Database Tables')
  const tables = ['profiles', 'products', 'orders', 'order_items', 'product_reviews', 'magazine_posts']
  
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(1)
      if (error) throw error
      console.log(`   ✅ ${table}`)
    } catch (error) {
      console.log(`   ❌ ${table}: ${error.message}`)
    }
  }

  // Test 4: Stored Procedures
  console.log('\n4️⃣  Stored Procedures')
  try {
    const { data, error } = await supabase.rpc('is_admin')
    if (error) throw error
    console.log(`   ✅ is_admin function working (returned: ${data})`)
  } catch (error) {
    console.log(`   ❌ Stored procedure test failed: ${error.message}`)
  }

  // Test 5: Service Role (Admin Functions)
  console.log('\n5️⃣  Service Role Access')
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
    // Test admin access by trying to read all profiles (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, role')
      .limit(5)
    
    if (error) throw error
    console.log(`   ✅ Service role working (can access ${data?.length || 0} profiles)`)
  } catch (error) {
    console.log(`   ❌ Service role test failed: ${error.message}`)
  }

  console.log('\n🎉 Backend connection tests completed!')
  console.log('\n📋 Next Steps:')
  console.log('   1. Visit http://localhost:3000/test for interactive testing')
  console.log('   2. Test authentication by registering a new account')
  console.log('   3. Ready to implement payment and shipping integrations')
}

testConnection().catch(console.error)