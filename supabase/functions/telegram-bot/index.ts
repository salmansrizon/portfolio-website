import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")
const ADMIN_CHAT_ID = Deno.env.get("ADMIN_CHAT_ID")
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

async function sendTelegramMessage(chatId: string, text: string, inlineKeyboard: any[] = []) {
  if (!BOT_TOKEN) {
    console.error("TELEGRAM_BOT_TOKEN not configured");
    return null;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        reply_markup: inlineKeyboard.length > 0 ? { inline_keyboard: inlineKeyboard } : undefined
      })
    });

    const data = await response.json();
    if (!data.ok) {
      console.error("Telegram API error:", data);
      return null;
    }
    return data.result.message_id;
  } catch (err) {
    console.error("Failed to send Telegram message:", err);
    return null;
  }
}

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
      let statusField = "";

      if (type === 'enrollment') {
        table = 'course_enrollments';
        statusField = 'status';
        updatePayload = { status: action === 'approve' ? 'active' : 'rejected' };
      } else if (type === 'booking') {
        table = 'session_bookings';
        statusField = 'booking_status';
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
          console.log(`[${requestId}] Updated ${table} ${recordId} - ${statusField}: ${updatePayload[statusField]}`);
        }
      }
    }
    // Handle new booking/enrollment notifications from database trigger
    else if (payload.table && payload.record) {
      const { table, record } = payload;
      console.log(`[${requestId}] New ${table} notification`);

      if (!ADMIN_CHAT_ID) {
        console.error("ADMIN_CHAT_ID not configured");
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      if (table === 'session_bookings') {
        const booking = record;
        const text = `🎯 <b>New Session Booking</b>\n\n` +
          `👤 <b>${booking.user_name}</b>\n` +
          `📧 ${booking.user_email}\n` +
          `📱 ${booking.phone_number || booking.whatsapp_number || 'N/A'}\n` +
          `📅 ${booking.booking_date} at ${booking.time_slot}\n` +
          `💰 Fee: ৳${booking.fee_amount}\n` +
          `💳 Method: ${booking.payment_method}\n` +
          `Status: <code>${booking.booking_status}</code>`;

        const keyboard = [[
          { text: '✅ Approve', callback_data: `approve:booking:${booking.id}` },
          { text: '❌ Reject', callback_data: `reject:booking:${booking.id}` }
        ]];

        await sendTelegramMessage(ADMIN_CHAT_ID, text, keyboard);
      }
      else if (table === 'course_enrollments') {
        const enrollment = record;
        const text = `📚 <b>New Course Enrollment</b>\n\n` +
          `👤 <b>${enrollment.user_name}</b>\n` +
          `📧 ${enrollment.email}\n` +
          `Status: <code>${enrollment.status}</code>`;

        const keyboard = [[
          { text: '✅ Approve', callback_data: `approve:enrollment:${enrollment.id}` },
          { text: '❌ Reject', callback_data: `reject:enrollment:${enrollment.id}` }
        ]];

        await sendTelegramMessage(ADMIN_CHAT_ID, text, keyboard);
      }
    }

    // Always return 200
    return new Response(JSON.stringify({ ok: true }), { status: 200 });

  } catch (err) {
    console.error(`[${requestId}] Error:`, err);
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }
});
