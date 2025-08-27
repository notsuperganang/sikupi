// Temporary script to create admin user for testing
// Run with: node scripts/create-admin.js

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function createAdmin() {
  // Use the admin client to create user
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
    console.log('Creating admin user...')
    
    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@sikupi.com',
      password: 'AdminPass123!',
      email_confirm: true
    })

    if (authError) {
      console.error('Auth error:', authError)
      return
    }

    console.log('Auth user created:', authData.user.id)

    // Create profile with admin role
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name: 'Admin User',
        phone: '081234567890',
        role: 'admin'
      })
      .select()

    if (profileError) {
      console.error('Profile error:', profileError)
      return
    }

    console.log('✅ Admin user created successfully!')
    console.log('📧 Email: admin@sikupi.com')
    console.log('🔑 Password: AdminPass123!')
    console.log('👤 User ID:', authData.user.id)

  } catch (error) {
    console.error('Script error:', error)
  }
}

createAdmin()