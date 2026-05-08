import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")
const ADMIN_CHAT_ID = Deno.env.get("ADMIN_CHAT_ID")
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

Deno.serve(async (req: Request) => {
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    const payload = await req.json();
    console.log(`[${requestId}] Payload:`, JSON.stringify(payload, null, 2));

    // Handle Telegram Callback (Approve/Reject buttons)
    if (payload.callback_query) {
      const { data, id } = payload.callback_query;
      console.log(`[${requestId}] Callback: ${data}`);
      
      // Answer the callback immediately
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: id, text: "Processing..." })
      });

      // Parse callback data: "action:type:recordId"
      const parts = data.split(':');
      const action = parts[0];
      const type = parts[1];
      const recordId = parts[2];
      
      let updatePayload: Record<string, any> = {};
      let table = "";

      if (type === 'enrollment') {
        table = 'course_enrollments';
        updatePayload = { status: action === 'approve' ? 'active' : 'rejected' };
      } else if (type === 'booking') {
        table = 'session_bookings';
        updatePayload = { booking_status: action === 'approve' ? 'confirmed' : 'cancelled' };
      }

      if (table && recordId) {
        const { error } = await supabase
          .from(table)
          .update(updatePayload)
          .eq('id', recordId);
        
        if (error) {
          console.error(`[${requestId}] DB Error:`, error);
        } else {
          console.log(`[${requestId}] Updated ${table} ${recordId}`);
        }
      }
    }

    // Always return 200 to Telegram
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
    
  } catch (err) {
    console.error(`[${requestId}] Error:`, err);
    // Always return 200 to Telegram
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }
});
