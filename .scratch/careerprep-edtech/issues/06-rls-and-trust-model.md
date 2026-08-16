# 06 — RLS and trust model for learner-owned data

Type: grilling
Status: open
Blocked by: 05

## Question

RLS is currently open. `supabase/migrations/20260508_fix_all_admin_tables.sql:240` creates `"Allow all operations for anon" ... FOR ALL USING (true) WITH CHECK (true)` across admin tables. Today that exposes content. Once XP, certificates, and learner profiles exist there, anon can forge achievements and read every learner's record.

Settle:

- Which tables are anon-readable, which are owner-scoped, which are admin-only, and which are service-role-only?
- Certificates and XP must not be client-writable — where does the authority live? Postgres function with `security definer`, Edge Function, or trigger?
- How is a **guest** authorized to write progress at all, given no auth row exists? Anon insert scoped by session id is forgeable — decide what level of forgery is acceptable before signup.
- What stops a learner from re-submitting a known-correct answer to farm XP?
- Public profile is public by default — what exactly is exposed to anon, and what stays private (raw submission code, email, WhatsApp)?
- What is the migration path off the existing open policies without breaking the admin panel?

Deliverable: per-table policy matrix and the write-authority decision for every trusted counter.
