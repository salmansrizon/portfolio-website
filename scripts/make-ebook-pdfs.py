#!/usr/bin/env python3
"""Generate the sample ebook PDFs for the Career Prep lead magnets.

Deliberately dependency-free: no reportlab, no fpdf, nothing to install. PDF is a
text format, so a few hundred lines of layout is cheaper than adding a dependency
to a repo that does not otherwise use Python.

These are SAMPLES with real content, meant to be replaced by properly designed
books later. Regenerate with:  python3 scripts/make-ebook-pdfs.py
"""

import pathlib
import textwrap

PAGE_W, PAGE_H = 595, 842          # A4 points
MARGIN_X, TOP_Y = 64, 782
BODY_LEADING = 15
WRAP = 74


def esc(s: str) -> str:
    return s.replace("\\", r"\\").replace("(", r"\(").replace(")", r"\)")


def layout(blocks):
    """blocks: (style, text) -> list of pages, each a list of (font, size, text)."""
    pages, page, y = [], [], TOP_Y

    def flush():
        nonlocal page, y
        if page:
            pages.append(page)
        page, y = [], TOP_Y

    for style, text in blocks:
        if style == "pagebreak":
            flush()
            continue

        font, size, lead, gap = {
            "h1": ("F2", 22, 26, 16),
            "h2": ("F2", 14, 18, 12),
            "body": ("F1", 10.5, BODY_LEADING, 8),
            "mono": ("F3", 9.5, 13, 8),
            "small": ("F1", 8.5, 12, 6),
        }[style]

        lines = [text] if style == "mono" else textwrap.wrap(text, WRAP) or [""]
        if style == "mono":
            lines = text.split("\n")

        if y - (len(lines) * lead + gap) < 70:
            flush()

        for ln in lines:
            page.append((font, size, ln))
            y -= lead
        page.append((None, gap, ""))   # spacer
        y -= gap

    flush()
    return pages


def build_pdf(path: pathlib.Path, title: str, blocks):
    pages = layout(blocks)
    objs, page_ids = [], []

    # 1 catalog, 2 pages tree, 3..5 fonts
    font_objs = {
        "F1": b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        "F2": b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
        "F3": b"<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>",
    }

    next_id = 6
    for pg in pages:
        stream = ["BT", f"1 0 0 1 {MARGIN_X} {TOP_Y} Tm"]
        first = True
        for font, size, text in pg:
            if font is None:
                stream.append(f"0 -{size} Td")
                continue
            stream.append(f"/{font} {size} Tf")
            if first:
                stream.append(f"({esc(text)}) Tj")
                first = False
            else:
                stream.append(f"0 -{size + 4.5:.1f} Td ({esc(text)}) Tj")
        stream.append("ET")
        content = "\n".join(stream).encode("latin-1", "replace")

        content_id, page_id = next_id, next_id + 1
        next_id += 2
        objs.append((content_id, b"<< /Length " + str(len(content)).encode() +
                     b" >>\nstream\n" + content + b"\nendstream"))
        objs.append((page_id, (
            f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {PAGE_W} {PAGE_H}] "
            f"/Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> "
            f"/Contents {content_id} 0 R >>").encode()))
        page_ids.append(page_id)

    kids = " ".join(f"{i} 0 R" for i in page_ids)
    head = [
        (1, b"<< /Type /Catalog /Pages 2 0 R >>"),
        (2, f"<< /Type /Pages /Count {len(page_ids)} /Kids [{kids}] >>".encode()),
        (3, font_objs["F1"]), (4, font_objs["F2"]), (5, font_objs["F3"]),
    ]
    all_objs = sorted(head + objs)

    out = bytearray(b"%PDF-1.4\n")
    offsets = {}
    for num, body in all_objs:
        offsets[num] = len(out)
        out += f"{num} 0 obj\n".encode() + body + b"\nendobj\n"

    xref_at = len(out)
    n = len(all_objs) + 1
    out += f"xref\n0 {n}\n0000000000 65535 f \n".encode()
    for num, _ in all_objs:
        out += f"{offsets[num]:010d} 00000 n \n".encode()
    out += (f"trailer\n<< /Size {n} /Root 1 0 R >>\nstartxref\n{xref_at}\n%%EOF\n").encode()

    path.write_bytes(bytes(out))
    print(f"  {path.name}  ({len(pages)} pages, {len(out) // 1024} KB)")


COVER = "Career Prep · careerprep.site"

BOOKS = {
    "50-sql-interview-questions.pdf": ("50 SQL Interview Questions", [
        ("h1", "50 SQL Interview Questions"),
        ("small", COVER + "  ·  Sample edition"),
        ("body", "The questions that actually come up in Bangladeshi tech interviews, grouped the way interviewers ask them. Each one lists the trap most candidates fall into."),
        ("h2", "1. Filtering and NULLs"),
        ("body", "Q1. What does COUNT(column) skip that COUNT(*) does not? Trap: candidates say 'nothing'. COUNT(column) ignores NULLs; COUNT(*) counts rows."),
        ("body", "Q2. Why does WHERE status != 'failed' drop rows where status IS NULL? Trap: NULL comparisons are unknown, not true. Use IS DISTINCT FROM or add OR status IS NULL."),
        ("body", "Q3. What is the difference between WHERE and HAVING? Trap: answering 'HAVING is for aggregates'. The real point is ordering: WHERE filters rows before grouping, HAVING filters groups after."),
        ("h2", "2. Joins"),
        ("body", "Q4. Which join keeps every row from the left table? LEFT JOIN. Follow-up interviewers love: what happens to the right-hand columns when there is no match? They are NULL."),
        ("body", "Q5. You LEFT JOIN then filter on the right table in WHERE. Why did it become an INNER JOIN? Because the NULL rows fail the predicate. Move the condition into the ON clause."),
        ("body", "Q6. When is a CROSS JOIN the right answer? Generating a date spine, or every combination of two small dimensions."),
        ("mono", "select d.day, m.id\nfrom generate_series('2026-01-01'::date,\n                    '2026-01-31'::date,\n                    '1 day') as d(day)\ncross join merchants m;"),
        ("h2", "3. Aggregation and windows"),
        ("body", "Q7. RANK vs DENSE_RANK vs ROW_NUMBER. RANK leaves gaps after a tie, DENSE_RANK does not, ROW_NUMBER never ties."),
        ("body", "Q8. Write a running total of transaction amount per merchant, ordered by time."),
        ("mono", "select merchant_id, created_at, amount,\n       sum(amount) over (\n         partition by merchant_id\n         order by created_at\n       ) as running_total\nfrom transactions;"),
        ("body", "Q9. What does a window function do that GROUP BY cannot? Keeps every row while adding a computed column, rather than collapsing rows."),
        ("body", "Q10. Find the top 3 merchants per district. Trap: LIMIT works per query, not per group. Use ROW_NUMBER in a subquery and filter rn <= 3."),
        ("h2", "4. Modelling and performance"),
        ("body", "Q11. Why does an index speed up reads but slow down writes? The index is a second structure that must also be maintained on every insert, update and delete."),
        ("body", "Q12. Your query is slow. What do you look at first? The plan. EXPLAIN ANALYZE shows what the database actually did, not what you assume it did."),
        ("body", "Q13. What does normalisation reduce? Redundancy and update anomalies — the same fact stored in two places that can disagree."),
        ("small", "This is a sample edition covering 13 of the 50 questions. Replace this file from the admin panel with the full book."),
    ]),

    "window-functions-cheatsheet.pdf": ("Window Functions Cheat Sheet", [
        ("h1", "Window Functions Cheat Sheet"),
        ("small", COVER + "  ·  Sample edition"),
        ("body", "One page of the patterns that cover most interview questions, plus the framing rules people get wrong under pressure."),
        ("h2", "The shape"),
        ("mono", "function() over (\n  partition by <group>\n  order by     <sort>\n  rows between <frame>\n)"),
        ("body", "PARTITION BY restarts the calculation per group. ORDER BY defines the running order. The frame decides which rows are visible to the function."),
        ("h2", "Ranking"),
        ("mono", "row_number()  1 2 3 4   never ties\nrank()        1 2 2 4   gap after tie\ndense_rank()  1 2 2 3   no gap"),
        ("h2", "Running totals"),
        ("mono", "sum(amount) over (\n  partition by merchant_id\n  order by created_at\n)"),
        ("body", "With ORDER BY and no explicit frame, the default is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — a running total. Without ORDER BY, you get the partition total on every row."),
        ("h2", "Comparing to the previous row"),
        ("mono", "lag(amount)  over (order by created_at)\nlead(amount) over (order by created_at)\namount - lag(amount) over (...)  -- delta"),
        ("h2", "Sessionisation"),
        ("body", "A new session starts when the gap since the previous event exceeds a threshold. Flag the breaks, then cumulative-sum the flags into a session id."),
        ("mono", "select *,\n  sum(is_new) over (\n    partition by user_id order by ts\n  ) as session_id\nfrom (\n  select *,\n    case when ts - lag(ts) over (\n           partition by user_id order by ts)\n         > interval '30 min'\n    then 1 else 0 end as is_new\n  from events\n) t;"),
        ("h2", "Three things people get wrong"),
        ("body", "1. You cannot use a window function in WHERE. It is computed after WHERE. Wrap it in a subquery or CTE and filter outside."),
        ("body", "2. ROWS and RANGE are not the same. RANGE groups peer rows with equal ORDER BY values; ROWS counts physical rows."),
        ("body", "3. PARTITION BY is not GROUP BY. Nothing is collapsed — the row count is unchanged."),
        ("small", "Sample edition. Replace this file from the admin panel."),
    ]),

    "data-modelling-starter-kit.pdf": ("Data Modelling Starter Kit", [
        ("h1", "Data Modelling Starter Kit"),
        ("small", COVER + "  ·  Sample edition"),
        ("body", "A worked example taking a messy orders export to a schema other people can query without asking you first."),
        ("h2", "The source you are given"),
        ("mono", "orders_export(\n  order_ref, customer_name, customer_phone,\n  district, item_name, item_price, qty,\n  status, ordered_at_text\n)"),
        ("body", "One wide table, one row per item, customer details repeated on every line, and a date stored as text. Every problem below follows from that."),
        ("h2", "Step 1 — pick the grain, and write it down"),
        ("body", "The grain is what one row means. Here: one row per item within an order. Every later decision refers back to this sentence, and most modelling arguments are really disagreements about the grain."),
        ("h2", "Step 2 — separate what changes from what does not"),
        ("body", "A customer's phone number changes; an order that already happened does not. Facts record events, dimensions record things. Mixing them means editing history when someone moves house."),
        ("mono", "dim_customer(customer_id, name, phone, district)\ndim_item(item_id, name, category)\nfact_order_item(\n  order_id, customer_id, item_id,\n  qty, unit_price, ordered_at, status\n)"),
        ("h2", "Step 3 — fix the date before anything else"),
        ("body", "A date stored as text sorts alphabetically, so '2026-1-9' lands before '2026-10-01'. Cast it once, at load, and never again downstream."),
        ("mono", "alter table stg_orders\n  alter column ordered_at\n  type timestamptz\n  using ordered_at_text::timestamptz;"),
        ("h2", "Step 4 — decide what a duplicate is"),
        ("body", "Before deduplicating, define it. Same order_ref and item? Or same customer, item and minute? The second catches double-submitted forms; the first does not."),
        ("h2", "Step 5 — make the load idempotent"),
        ("body", "Re-running Tuesday should not double Tuesday. Upsert on a natural key rather than appending."),
        ("mono", "insert into fact_order_item as f (...)\nselect ... from stg_orders\non conflict (order_id, item_id)\ndo update set\n  qty = excluded.qty,\n  status = excluded.status;"),
        ("h2", "The test that catches most of it"),
        ("body", "After every load, assert row counts per day against the source, and assert that no natural key appears twice. Two cheap checks catch the majority of silent pipeline failures."),
        ("small", "Sample edition. Replace this file from the admin panel."),
    ]),
}

if __name__ == "__main__":
    out_dir = pathlib.Path(__file__).parent.parent / "tmp" / "ebooks"
    out_dir.mkdir(parents=True, exist_ok=True)
    print("Writing sample ebooks:")
    for filename, (title, blocks) in BOOKS.items():
        build_pdf(out_dir / filename, title, blocks)
    print(f"\nOutput: {out_dir}")
