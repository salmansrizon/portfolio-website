import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const envPath = path.resolve('.env')
const envContent = fs.readFileSync(envPath, 'utf-8')
const envVars = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) envVars[match[1]] = match[2]
})

const supabaseUrl = envVars['VITE_SUPABASE_URL']
const supabaseKey = envVars['VITE_SUPABASE_ANON_KEY']

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data, error } = await supabase.from('availability_settings').select('*')
  console.log("Error:", error)
  console.log("Data:", data)
}
test()
