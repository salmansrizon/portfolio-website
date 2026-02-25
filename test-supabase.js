import { createClient } from '@supabase/supabase-js';

// Load env variables (assuming they are in .env)
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSessionTypes() {
  console.log("1. Testing INSERT (Adding Session Type)...");
  const newType = {
    title: 'CLI Test Session',
    description: 'Testing from script',
    duration_minutes: 45,
    fee: 1500,
    is_paid: true
  };

  const { data: insertData, error: insertError } = await supabase
    .from('session_types')
    .insert([newType])
    .select();

  if (insertError) {
    console.error("❌ INSERT FAILED:", insertError);
  } else {
    console.log("✅ INSERT SUCCESS:", insertData);
    
    // If insert succeeded, let's test UPDATE
    const newId = insertData[0].id;
    console.log(`\n2. Testing UPDATE for ID ${newId}...`);
    
    const { data: updateData, error: updateError } = await supabase
      .from('session_types')
      .update({
        title: 'CLI Test Session Updated',
        fee: 2000,
        is_paid: false
      })
      .eq('id', newId)
      .select();

    if (updateError) {
      console.error("❌ UPDATE FAILED:", updateError);
    } else {
      console.log("✅ UPDATE SUCCESS:", updateData);
    }
    
    // Cleanup
    console.log(`\n3. Cleaning up (DELETE)...`);
    const { error: deleteError } = await supabase
      .from('session_types')
      .delete()
      .eq('id', newId);
      
    if (deleteError) {
      console.error("❌ DELETE FAILED:", deleteError);
    } else {
      console.log("✅ DELETE SUCCESS");
    }
  }
}

testSessionTypes();
