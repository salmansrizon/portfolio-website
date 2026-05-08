// Test script to check Supabase tables and create missing ones
import { supabase } from './integrations/supabase/client';

const testTable = async (tableName: string) => {
  try {
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log(`❌ Table "${tableName}" error:`, error.message);
      return false;
    }
    
    console.log(`✅ Table "${tableName}" exists (count: ${count})`);
    return true;
  } catch (err: any) {
    console.log(`❌ Table "${tableName}" error:`, err.message);
    return false;
  }
};

const runTests = async () => {
  console.log('Testing Supabase tables...\n');
  
  const tables = [
    'blogs',
    'session_bookings',
    'courses',
    'projects',
    'page_views',
    'webinars',
    'instructors',
    'students',
    'course_categories',
    'course_content',
    'course_reviews',
    'brand_logos',
    'career_prep',
    'roadmaps',
    'services',
    'testimonials',
    'certifications',
    'portfolio_sections'
  ];
  
  for (const table of tables) {
    await testTable(table);
  }
};

runTests();
