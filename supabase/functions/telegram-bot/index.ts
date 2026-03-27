import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")
const ADMIN_CHAT_ID = Deno.env.get("ADMIN_CHAT_ID")
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

Deno.serve(async (req: Request) => {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[VER:1.1][${requestId}] Incoming ${req.method} request...`);

  try {
    // 1. Health Check (GET)
    if (req.method === 'GET') {
      console.log(`[${requestId}] Health check successful.`);
      return new Response(JSON.stringify({ 
        ok: true,
        message: "Telegram Bot Function is online",
        config: {
          botToken: !!BOT_TOKEN ? "SET" : "MISSING",
          adminChatId: !!ADMIN_CHAT_ID ? "SET" : "MISSING",
          supabaseUrl: !!SUPABASE_URL ? "SET" : "MISSING",
          serviceRole: !!SUPABASE_SERVICE_ROLE_KEY ? "SET" : "MISSING",
        }
      }), { headers: { "Content-Type": "application/json" } });
    }

    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const payload = await req.json();
    console.log(`[${requestId}] Payload:`, JSON.stringify(payload, null, 2));

    // 2. Handle Telegram Callback (Actions)
    if (payload.callback_query) {
      console.log(`[${requestId}] Detected Telegram Callback Query`);
      const { data, message, id } = payload.callback_query;
      const chatId = message.chat.id;
      const [action, type, recordId] = data.split(':');
      
      let updatePayload: Record<string, any> = {};
      let table = "";
      let statusValue = "";

      if (type === 'enrollment') {
        table = 'course_enrollments';
        statusValue = action === 'approve' ? 'active' : 'rejected';
        updatePayload = { status: statusValue };
      } else if (type === 'booking') {
        table = 'session_bookings';
        statusValue = action === 'approve' ? 'confirmed' : 'cancelled';
        updatePayload = { booking_status: statusValue };
      }

      console.log(`[${requestId}] Action: ${action}, Target: ${table}, RecordID: ${recordId}`);

      if (!table || !recordId) {
        throw new Error("Invalid callback structure from Telegram");
      }

      const { data: dbData, error: dbError } = await supabase
        .from(table)
        .update(updatePayload)
        .eq('id', recordId)
        .select();
      
      if (dbError) {
        console.error(`[${requestId}] Database Update Failed:`, dbError);
        throw dbError;
      }
      
      console.log(`[${requestId}] Database Update Successful. Rows affected:`, dbData?.length);

      // Answer Telegram Query
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          callback_query_id: id, 
          text: `Success: ${statusValue.toUpperCase()}` 
        })
      });

      // Update Message UI
      const updatedText = message.text + `\n\n<b>✅ VERDICT: ${statusValue.toUpperCase()}</b>`;
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: message.message_id,
          text: updatedText,
          parse_mode: 'HTML'
        })
      });

      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    // 3. Handle Webhook Notifications
    const record = payload.record || payload.data || payload.new;
    const table = payload.table || payload.record_table || "unknown";
    
    if (record && table !== "unknown") {
      console.log(`[${requestId}] Detected Webhook for Table: ${table}`);
      let message = "";
      let callbackType = "";
      const escape = (str: any) => String(str || 'N/A').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      if (table.includes('course_enrollments')) {
        callbackType = "enrollment";
        message = `🎓 <b>NEW ENROLLMENT</b>\n\n` +
                  `👤 <b>User:</b> ${escape(record.user_name)}\n` +
                  `📧 <b>Email:</b> ${escape(record.user_email)}\n` +
                  `📱 <b>WhatsApp:</b> ${escape(record.whatsapp_number)}\n` +
                  `💰 <b>Method:</b> ${escape(record.payment_method)}\n` +
                  `🧾 <b>TXN ID:</b> <code>${escape(record.transaction_id)}</code>`;
      } else if (table.includes('session_bookings')) {
        callbackType = "booking";
        message = `📅 <b>NEW SESSION BOOKING</b>\n\n` +
                  `👤 <b>User:</b> ${escape(record.user_name)}\n` +
                  `📧 <b>Email:</b> ${escape(record.user_email)}\n` +
                  `🗓 <b>Date:</b> ${escape(record.booking_date)}\n` +
                  `⏰ <b>Slot:</b> ${escape(record.time_slot)}\n` +
                  `💰 <b>Method:</b> ${escape(record.payment_method)}\n` +
                  `🧾 <b>TXN ID:</b> <code>${escape(record.transaction_id)}</code>`;
      }

      if (message && ADMIN_CHAT_ID && BOT_TOKEN) {
        console.log(`[${requestId}] Sending Notification to Telegram Chat: ${ADMIN_CHAT_ID}`);
        const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: ADMIN_CHAT_ID,
            text: message,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [[
                { text: "✅ Approve", callback_data: `approve:${callbackType}:${record.id}` },
                { text: "❌ Reject", callback_data: `reject:${callbackType}:${record.id}` }
              ]]
            }
          })
        });
        
        const tgData = await tgRes.json();
        if (!tgData.ok) {
          console.error(`[${requestId}] Telegram API Error:`, tgData);
        } else {
          console.log(`[${requestId}] Telegram Notification Sent.`);
        }
      }
      
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    console.warn(`[${requestId}] Request format not recognized as Telegram or Webhook.`);
    return new Response(JSON.stringify({ error: "Unrecognized request format" }), { status: 400 });

  } catch (err) {
    console.error(`[${requestId}] Critical Error:`, err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
