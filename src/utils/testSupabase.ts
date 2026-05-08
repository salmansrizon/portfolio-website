// Test Supabase connection and blogs table
import { supabase } from './integrations/supabase/client';

export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase.from('blogs').select('count').limit(1);
    
    if (error) {
      console.error('Supabase connection error:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Supabase connection successful!');
    return { success: true, data };
  } catch (err: any) {
    console.error('Unexpected error:', err);
    return { success: false, error: err.message };
  }
};

export const testBlogInsert = async () => {
  try {
    console.log('Testing blog insert...');
    
    const testBlog = {
      title: 'Test Blog',
      slug: 'test-blog-' + Date.now(),
      content: [{ type: 'text', content: 'Test content' }],
      published: false,
      source_type: 'local',
    };
    
    const { data, error } = await supabase
      .from('blogs')
      .insert([testBlog])
      .select();
    
    if (error) {
      console.error('Blog insert error:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Blog insert successful!', data);
    
    // Clean up - delete the test blog
    if (data && data[0]) {
      await supabase.from('blogs').delete().eq('id', data[0].id);
    }
    
    return { success: true, data };
  } catch (err: any) {
    console.error('Unexpected error:', err);
    return { success: false, error: err.message };
  }
};
