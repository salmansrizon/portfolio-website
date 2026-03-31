import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://your-project-url.supabase.co'
const supabaseKey = 'your-anon-key'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkRelated() {
  const { data: courses } = await supabase.from('courses').select('id, title, category_id, technologies')
  console.log('All Courses:', JSON.stringify(courses, null, 2))
}

checkRelated()
