import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")
const ADMIN_CHAT_ID = Deno.env.get("ADMIN_CHAT_ID")
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

const TG_API = `https://api.telegram.org/bot${BOT_TOKEN}`

async function tg(method: string, body: Record<string, unknown>) {
  const res = await fetch(`${TG_API}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok || !json.ok) {
    console.error(`Telegram ${method} failed:`, JSON.stringify(json));
  }
  return json;
}

function escapeHtml(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildMessage(table: string, record: Record<string, any>): { text: string; type: string } | null {
  if (table === "course_enrollments") {
    const text =
      `🎓 <b>New Course Enrollment</b>\n\n` +
      `<b>Name:</b> ${escapeHtml(record.user_name)}\n` +
      `<b>Email:</b> ${escapeHtml(record.user_email)}\n` +
      `<b>WhatsApp:</b> ${escapeHtml(record.whatsapp_number || "—")}\n` +
      `<b>Institute:</b> ${escapeHtml(record.institute_name || "—")}\n` +
      `<b>Profession:</b> ${escapeHtml(record.profession || "—")}\n` +
      `<b>Payment:</b> ${escapeHtml(record.payment_method)}\n` +
      `<b>Txn ID:</b> ${escapeHtml(record.transaction_id || "—")}\n` +
      `<b>Status:</b> ${escapeHtml(record.status)}\n` +
      `<b>ID:</b> <code>${escapeHtml(record.id)}</code>`;
    return { text, type: "enrollment" };
  }
  if (table === "session_bookings") {
    const text =
      `📅 <b>New Session Booking</b>\n\n` +
      `<b>Name:</b> ${escapeHtml(record.full_name || record.user_name)}\n` +
      `<b>Email:</b> ${escapeHtml(record.email || record.user_email)}\n` +
      `<b>Phone:</b> ${escapeHtml(record.phone || record.whatsapp_number || "—")}\n` +
      `<b>Date:</b> ${escapeHtml(record.booking_date)}\n` +
      `<b>Time:</b> ${escapeHtml(record.booking_time)}\n` +
      `<b>Payment:</b> ${escapeHtml(record.payment_method || "—")}\n` +
      `<b>Txn ID:</b> ${escapeHtml(record.transaction_id || "—")}\n` +
      `<b>ID:</b> <code>${escapeHtml(record.id)}</code>`;
    return { text, type: "booking" };
  }
  return null;
}

Deno.serve(async (req: Request) => {
  const requestId = Math.random().toString(36).substring(7);

  try {
    const payload = await req.json();
    console.log(`[${requestId}] Payload:`, JSON.stringify(payload));

    // Telegram callback (Approve/Reject buttons)
    if (payload.callback_query) {
      const cb = payload.callback_query;
      const data: string = cb.data || "";
      const callbackId = cb.id;
      const message = cb.message;

      await tg("answerCallbackQuery", { callback_query_id: callbackId, text: "Processing..." });

      const [action, type, recordId] = data.split(":");
      let table = "";
      let updatePayload: Record<string, any> = {};

      if (type === "enrollment") {
        table = "course_enrollments";
        updatePayload = { status: action === "approve" ? "active" : "rejected" };
      } else if (type === "booking") {
        table = "session_bookings";
        updatePayload = { booking_status: action === "approve" ? "confirmed" : "cancelled" };
      }

      if (table && recordId) {
        const { error } = await supabase.from(table).update(updatePayload).eq("id", recordId);
        if (error) {
          console.error(`[${requestId}] DB update error:`, error);
          await tg("answerCallbackQuery", {
            callback_query_id: callbackId,
            text: `❌ Update failed: ${error.message}`,
            show_alert: true,
          });
        } else {
          const verdict = action === "approve" ? "✅ APPROVED" : "❌ REJECTED";
          if (message?.chat?.id && message?.message_id) {
            await tg("editMessageText", {
              chat_id: message.chat.id,
              message_id: message.message_id,
              text: `${message.text || ""}\n\n<b>${verdict}</b>`,
              parse_mode: "HTML",
            });
          }
        }
      }

      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    // Database webhook payload: { table, record }
    if (payload.table && payload.record && ADMIN_CHAT_ID) {
      const built = buildMessage(payload.table, payload.record);
      if (built) {
        const recordId = payload.record.id;
        await tg("sendMessage", {
          chat_id: ADMIN_CHAT_ID,
          text: built.text,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [[
              { text: "✅ Approve", callback_data: `approve:${built.type}:${recordId}` },
              { text: "❌ Reject", callback_data: `reject:${built.type}:${recordId}` },
            ]],
          },
        });
      }
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error(`[${requestId}] Error:`, err);
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }
});
