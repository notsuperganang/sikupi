// Script to get auth token for testing
// Run with: node scripts/get-token.js

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function getAuthToken() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  try {
    console.log('Signing in as admin...')
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@sikupi.com',
      password: 'AdminPass123!'
    })

    if (error) {
      console.error('Auth error:', error)
      return
    }

    console.log('✅ Successfully signed in!')
    console.log('🎫 Access Token:')
    console.log(data.session.access_token)
    console.log('\n📋 For testing, use this Bearer token:')
    console.log(`Authorization: Bearer ${data.session.access_token}`)

    // Save to a temp file for easy copying
    require('fs').writeFileSync('temp-token.txt', data.session.access_token)
    console.log('\n💾 Token also saved to temp-token.txt')

  } catch (error) {
    console.error('Script error:', error)
  }
}

getAuthToken()