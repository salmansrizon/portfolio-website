// Test Supabase connection
import { supabase } from '@/integrations/supabase/client';

export const testSupabaseConnection = async () => {
  console.log('Testing Supabase connection...');
  
  try {
    // Test projects table
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .limit(1);
    
    if (projectsError) {
      console.error('Projects table error:', projectsError);
    } else {
      console.log('Projects table accessible:', projects);
    }
    
    // Test insert
    const testProject = {
      title: 'Test Project',
      description: 'Test Description',
      technologies: ['React', 'TypeScript']
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('projects')
      .insert([testProject])
      .select();
      
    if (insertError) {
      console.error('Insert test error:', insertError);
    } else {
      console.log('Insert test successful:', insertData);
      
      // Clean up - delete the test project
      if (insertData && insertData[0]) {
        await supabase
          .from('projects')
          .delete()
          .eq('id', insertData[0].id);
        console.log('Test project cleaned up');
      }
    }
  } catch (error) {
    console.error('Connection test error:', error);
  }
};
