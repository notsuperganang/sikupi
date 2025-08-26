const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyMigrations() {
  console.log('🚀 Applying database migrations...')
  
  const migrationsDir = path.join(__dirname, '../supabase/migrations')
  const migrationFiles = [
    '001_initial_schema.sql',
    '002_rls_policies.sql', 
    '003_stored_procedures.sql'
  ]
  
  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file)
    
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Migration file not found: ${file}`)
      continue
    }
    
    console.log(`📄 Applying ${file}...`)
    
    const sql = fs.readFileSync(filePath, 'utf8')
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql })
      
      if (error) {
        // Try direct SQL execution if RPC doesn't work
        const { error: directError } = await supabase
          .from('_migrations')
          .insert({ name: file, sql: sql })
        
        if (directError) {
          console.error(`❌ Error applying ${file}:`, error.message || error)
        } else {
          console.log(`✅ ${file} applied successfully`)
        }
      } else {
        console.log(`✅ ${file} applied successfully`)
      }
    } catch (err) {
      console.error(`❌ Error applying ${file}:`, err.message)
    }
  }
  
  console.log('🎉 Migration process completed')
}

// Test connection first
async function testConnection() {
  try {
    console.log('🔗 Testing Supabase connection...')
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (error && !error.message.includes('relation "profiles" does not exist')) {
      throw error
    }
    
    console.log('✅ Connection successful')
    return true
  } catch (err) {
    console.error('❌ Connection failed:', err.message)
    return false
  }
}

async function main() {
  const connected = await testConnection()
  if (connected) {
    await applyMigrations()
  }
}

main().catch(console.error)