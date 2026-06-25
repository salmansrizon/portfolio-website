# Telegram Notification Tester

## Overview
This task tests that the Supabase serverless **telegram‑bot** function sends a notification when a new row is inserted into the `course_enrollments` or `session_bookings` tables.

The function is triggered via PostgreSQL triggers defined in the migration:
```
CREATE TRIGGER notify_tg_on_enrollment
  AFTER INSERT ON public.course_enrollments
  FOR EACH ROW EXECUTE FUNCTION public.notify_telegram_bot();

CREATE TRIGGER notify_tg_on_booking
  AFTER INSERT ON public.session_bookings
  FOR EACH ROW EXECUTE FUNCTION public.notify_telegram_bot();
```
The trigger emits an HTTP POST to the endpoint defined by the supabase function. The function forwards the payload to the Telegram bot via the Bot API.

## Prerequisites
- A running local or remote Supabase instance with the proper project ID (``llmeentlxjauihrkkrjg``).
- The JavaScript SDK with the public and service‑role keys available. The current repo contains the **public** key in `src/integrations/supabase/client.ts`.  To trigger the webhook you must use a **service‑role** key so the trigger is executed.  It is *not* stored in the repo; obtain it via the Supabase dashboard.
- The Telegram bot token and admin chat ID set in the function’s env vars:
  - `TELEGRAM_BOT_TOKEN`
  - `ADMIN_CHAT_ID`
  These can be set in the Supabase dashboard → Functions → telegram-bot → Secrets.

## Steps to test the notification
1. **Launch Supabase** (`supabase start` or use the hosted instance).
2. **Generate a service‑role key** if you don’t have one:
   ```bash
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<service‑role‑token>
   ```
3. **Send a test insert**: run the following JavaScript snippet in the browser console or a Node script. *Make sure the key matches the service‑role.*
   ```js
   import { createClient } from "@supabase/supabase-js";

   const supabase = createClient(
     "https://llmeentlxjauihrkkrjg.supabase.co",
     "<service‑role‑token>",
     { auth: { persistSession: false } }
   );

   const { data, error } = await supabase
     .from("course_enrollments")
     .insert({
       course_id: "<existing‑course‑id>",
       user_name: "Test User",
       user_email: "test@example.com",
       whatsapp_number: "", // optional
       profession: "Tester",
       institute_name: "Unit Test",
       payment_method: "free",
       transaction_id: null,
     })
     .single();
   console.log({ data, error });
   ```
4. The trigger should call the `telegram-bot` function which posts back to the Telegram API.  Check the **Admin** chat to see the message.

## Verification
- After insertion, Google the course ID or check the DB directly: 
  ```sql
  SELECT * FROM public.course_enrollments WHERE id = <new‑id>;
  ```
- The bot should have sent a message to the admin. You can also view the webhook logs in Supabase → Functions → telegram-bot → logs.

## Cleanup
If you need to remove the test row:
```sql
DELETE FROM public.course_enrollments WHERE id = <new‑id>;
```
or drop the trigger if you don't want future notifications:
```sql
DROP TRIGGER IF EXISTS notify_tg_on_enrollment ON public.course_enrollments;
```
---
**Note**: The service‑role key is a powerful credential; never commit it to the repo. Store it securely in your environment or secrets manager.