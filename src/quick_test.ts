// Quick test to check Supabase connection
export const quickTest = async () => {
  const { supabase } = await import('@/integrations/supabase/client');
  
  console.log('Testing Supabase connection...');
  
  // Test 1: Check if we can read from projects table
  const { data: readData, error: readError } = await supabase
    .from('projects')
    .select('*')
    .limit(1);
    
  console.log('Read test:', { readData, readError });
  
  // Test 2: Try a simple insert
  const testProject = {
    title: 'Test ' + Date.now(),
    description: 'Test description',
    technologies: ['Test']
  };
  
  const { data: insertData, error: insertError } = await supabase
    .from('projects')
    .insert([testProject])
    .select();
    
  console.log('Insert test:', { insertData, insertError });
  
  // Clean up if successful
  if (insertData && insertData[0]) {
    await supabase
      .from('projects')
      .delete()
      .eq('id', insertData[0].id);
    console.log('Cleanup done');
  }
};
