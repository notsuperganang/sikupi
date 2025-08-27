// Quick script to get auth token for testing Phase 2
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function getAuthToken() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  try {
    // Try to sign in as admin first
    console.log('Trying to sign in as admin...')
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@sikupi.com',
      password: 'AdminPass123!'
    })

    if (error) {
      console.error('Admin login error:', error.message)
      console.log('Let me try creating a regular user...')
      
      // Create a regular user for testing
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'testuser@sikupi.com',
        password: 'TestPass123!',
        options: {
          data: {
            full_name: 'Test User',
            phone: '081234567890'
          }
        }
      })
      
      if (signUpError) {
        console.error('Sign up error:', signUpError.message)
        return
      }
      
      console.log('✅ User created, getting token...')
      console.log('🎫 Access Token:')
      console.log(signUpData.session?.access_token)
      
      require('fs').writeFileSync('temp-token.txt', signUpData.session?.access_token || '')
      
    } else {
      console.log('✅ Admin login successful!')
      console.log('🎫 Access Token:')
      console.log(data.session.access_token)
      
      require('fs').writeFileSync('temp-token.txt', data.session.access_token)
    }
    
    console.log('\n💾 Token saved to temp-token.txt')

  } catch (error) {
    console.error('Script error:', error)
  }
}

getAuthToken()