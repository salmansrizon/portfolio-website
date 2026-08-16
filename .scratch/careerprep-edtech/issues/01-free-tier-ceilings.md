# 01 — Free-tier ceilings

Type: research
Status: open
Blocked by:

## Question

What are the hard limits this platform hits on the current free stack, and where does each one break first?

Specifically:

- **Supabase free tier**: row/database size cap, Storage size + egress cap (ebooks served via signed URL), monthly active users cap, connection limits, and what happens on breach (throttle vs suspend).
- **Signed URL mechanics**: expiry options, whether a signed URL can be re-shared, and whether Storage egress or bandwidth is the binding limit for ebook delivery.
- **Vercel free tier (Hobby)**: bandwidth cap, and whether the commercial nature of this site (selling courses) violates Hobby terms — this matters more than the technical ceiling.
- **PGLite payload**: current gzipped bundle cost, and whether it can be lazy-loaded only on the solve route.
- **Pyodide path** (out of scope to build, in scope to know): payload size, whether it is purely static/client-side and therefore free-tier compatible, and what the realistic cold-start cost is.

Deliverable: a table of limit → current headroom → what breaks first → the cheapest mitigation.
