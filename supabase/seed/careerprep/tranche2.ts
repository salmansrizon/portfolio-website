import type { SeedQuestion } from "./types";

/**
 * Tranche 2 (75 Questions): 38 Singles, 15 MCQs, 7 Case Studies,
 * 3 Missions × 4 code children. Cumulative library target: ~125.
 */
export const tranche2: SeedQuestion[] = [
  // ════════════════ FINTECH — Singles (13) ════════════════
  {
    slug: "app-only-transactions", title: "App-Only Transactions", question_type: "code",
    difficulty: "Easy", industry: "Fintech", category: "NULL Handling", tags: ["is-null"],
    dataset: "fintech_wallet",
    content_md: `Digital adoption tracking: return \`txn_id\`, \`user_id\`, and \`txn_type\` of transactions done **without an agent** (no agent involved), newest first.`,
    solution_sql: `SELECT txn_id, user_id, txn_type FROM transactions WHERE agent_id IS NULL ORDER BY txn_at DESC;`,
    hints: ["App-only means agent_id IS NULL", "Never write = NULL"], success_rate: 77,
  },
  {
    slug: "dhaka-agents", title: "Agent Points in Dhaka", question_type: "code",
    difficulty: "Easy", industry: "Fintech", category: "Filtering", tags: ["where"],
    dataset: "fintech_wallet",
    content_md: `Field ops is visiting Dhaka agent points today. Return \`agent_id\` and \`shop_name\` of agents in the Dhaka district, alphabetical by shop name.`,
    solution_sql: `SELECT agent_id, shop_name FROM agents WHERE district = 'Dhaka' ORDER BY shop_name;`,
    hints: ["Filter agents by district", "ORDER BY shop_name"], success_rate: 88,
  },
  {
    slug: "fee-revenue-by-type", title: "Fee Revenue by Transaction Type", question_type: "code",
    difficulty: "Easy", industry: "Fintech", category: "Aggregation", tags: ["sum", "group-by"],
    dataset: "fintech_wallet",
    content_md: `Fees are the business. For successful transactions, return each \`txn_type\` and total \`fee_revenue\`, highest first. Skip types that earned nothing.`,
    solution_sql: `SELECT txn_type, SUM(fee) AS fee_revenue
FROM transactions WHERE status = 'success'
GROUP BY txn_type HAVING SUM(fee) > 0 ORDER BY fee_revenue DESC;`,
    hints: ["SUM(fee) per type", "HAVING SUM(fee) > 0 drops zero-fee types"], success_rate: 68,
  },
  {
    slug: "unverified-active-users", title: "Unverified but Transacting", question_type: "code",
    difficulty: "Medium", industry: "Fintech", category: "Joins", tags: ["join", "distinct"],
    dataset: "fintech_wallet",
    content_md: `Compliance red flag: users who are **not KYC-verified** yet have successful transactions. Return each such user's \`user_id\` and \`name\` once, ordered by user_id.`,
    solution_sql: `SELECT DISTINCT u.user_id, u.name
FROM users u JOIN transactions t ON t.user_id = u.user_id
WHERE u.kyc_verified = false AND t.status = 'success'
ORDER BY u.user_id;`,
    hints: ["Join and filter kyc_verified = false", "DISTINCT prevents one row per transaction"], success_rate: 63,
  },
  {
    slug: "avg-txn-size-by-district", title: "Average Ticket Size by District", question_type: "code",
    difficulty: "Medium", industry: "Fintech", category: "Aggregation", tags: ["avg", "join", "round"],
    dataset: "fintech_wallet",
    content_md: `Marketing segments districts by ticket size. Return user \`district\` and the average successful transaction \`amount\` (\`avg_amount\`, 2 decimals), highest first.`,
    solution_sql: `SELECT u.district, ROUND(AVG(t.amount), 2) AS avg_amount
FROM users u JOIN transactions t ON t.user_id = u.user_id
WHERE t.status = 'success'
GROUP BY u.district ORDER BY avg_amount DESC;`,
    hints: ["District lives on users", "ROUND(AVG(amount), 2)"], success_rate: 60,
  },
  {
    slug: "first-transaction-per-user", title: "Each User's First Transaction", question_type: "code",
    difficulty: "Medium", industry: "Fintech", category: "Window Functions", tags: ["row-number", "first-event"],
    dataset: "fintech_wallet",
    content_md: `Onboarding analysis: what do users do first? Return \`user_id\`, \`txn_type\`, and \`txn_at\` of each user's **earliest** transaction, ordered by user_id.`,
    solution_sql: `SELECT user_id, txn_type, txn_at FROM (
  SELECT user_id, txn_type, txn_at,
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY txn_at) AS rn
  FROM transactions
) t WHERE rn = 1 ORDER BY user_id;`,
    hints: ["ROW_NUMBER() ordered by txn_at ascending", "Keep rn = 1"], success_rate: 52,
  },
  {
    slug: "share-of-volume-by-type", title: "Each Type's Share of Volume", question_type: "code",
    difficulty: "Hard", industry: "Fintech", category: "Window Functions", tags: ["window", "ratio"],
    dataset: "fintech_wallet", time_limit_secs: 1800,
    content_md: `The exec deck wants percentages, not raw sums. For successful transactions, return \`txn_type\`, \`type_volume\`, and \`pct_share\` of total volume (1 decimal), highest share first.`,
    solution_sql: `SELECT txn_type, SUM(amount) AS type_volume,
       ROUND(100.0 * SUM(amount) / SUM(SUM(amount)) OVER (), 1) AS pct_share
FROM transactions WHERE status = 'success'
GROUP BY txn_type ORDER BY pct_share DESC;`,
    hints: ["SUM(SUM(amount)) OVER () gives the grand total next to each group", "Multiply by 100.0 for float math", "ROUND(x, 1)"], success_rate: 33,
  },
  {
    slug: "loan-book-by-status", title: "Loan Book by Status", question_type: "code",
    difficulty: "Easy", industry: "Fintech", category: "Aggregation", tags: ["group-by", "sum"],
    dataset: "fintech_microloan",
    content_md: `Portfolio snapshot: return each loan \`status\`, the number of loans (\`loan_count\`), and total \`principal_total\`, ordered by principal_total descending.`,
    solution_sql: `SELECT status, COUNT(*) AS loan_count, SUM(principal) AS principal_total
FROM loans GROUP BY status ORDER BY principal_total DESC;`,
    hints: ["One GROUP BY, two aggregates", "COUNT(*) and SUM(principal)"], success_rate: 79,
  },
  {
    slug: "repayment-progress", title: "Repayment Progress per Loan", question_type: "code",
    difficulty: "Medium", industry: "Fintech", category: "Joins", tags: ["join", "group-by", "ratio"],
    dataset: "fintech_microloan",
    content_md: `Collections tracks recovery. For each loan with repayments, return \`loan_id\`, \`borrower\`, \`principal\`, total repaid (\`repaid\`), and \`pct_recovered\` (repaid ÷ principal × 100, 1 decimal), least recovered first.`,
    solution_sql: `SELECT l.loan_id, l.borrower, l.principal, SUM(r.amount) AS repaid,
       ROUND(100.0 * SUM(r.amount) / l.principal, 1) AS pct_recovered
FROM loans l JOIN repayments r ON r.loan_id = l.loan_id
GROUP BY l.loan_id, l.borrower, l.principal
ORDER BY pct_recovered;`,
    hints: ["SUM repayments per loan", "Percentage = 100.0 * repaid / principal", "Order ascending to surface laggards"], success_rate: 55,
  },
  {
    slug: "no-repayment-in-may", title: "Loans Silent in May", question_type: "code",
    difficulty: "Medium", industry: "Fintech", category: "Subqueries", tags: ["not-exists", "date"],
    dataset: "fintech_microloan",
    content_md: `A loan with no repayment in May 2026 gets a follow-up call. Return \`loan_id\`, \`borrower\`, and \`status\` of **active or defaulted** loans that made no repayment in May 2026, by loan_id.`,
    solution_sql: `SELECT l.loan_id, l.borrower, l.status
FROM loans l
WHERE l.status IN ('active','defaulted')
  AND NOT EXISTS (
    SELECT 1 FROM repayments r
    WHERE r.loan_id = l.loan_id
      AND r.paid_on >= '2026-05-01' AND r.paid_on < '2026-06-01'
  )
ORDER BY l.loan_id;`,
    hints: ["NOT EXISTS with a date-bounded subquery", "Half-open May range", "Filter status first"], success_rate: 48,
  },
  {
    slug: "monthly-collections", title: "Monthly Collections Trend", question_type: "code",
    difficulty: "Medium", industry: "Fintech", category: "Date Functions", tags: ["date-trunc", "group-by"],
    dataset: "fintech_microloan",
    content_md: `Finance charts collections by month. Return each month (\`month\`, as the first day of the month) and total repayments received (\`collected\`), in time order.`,
    solution_sql: `SELECT DATE_TRUNC('month', paid_on)::date AS month, SUM(amount) AS collected
FROM repayments GROUP BY DATE_TRUNC('month', paid_on) ORDER BY month;`,
    hints: ["DATE_TRUNC('month', paid_on)", "Cast to ::date for a clean label"], success_rate: 57,
  },
  {
    slug: "gap-between-repayments", title: "Gaps Between Repayments", question_type: "code",
    difficulty: "Hard", industry: "Fintech", category: "Window Functions", tags: ["lag", "date-diff"],
    dataset: "fintech_microloan", time_limit_secs: 1800,
    content_md: `Late-payment early warning: for each repayment after a loan's first, compute the days since that loan's **previous** repayment. Return \`loan_id\`, \`paid_on\`, and \`days_since_prev\`, largest gap first.`,
    solution_sql: `SELECT loan_id, paid_on, paid_on - prev_paid AS days_since_prev FROM (
  SELECT loan_id, paid_on, LAG(paid_on) OVER (PARTITION BY loan_id ORDER BY paid_on) AS prev_paid
  FROM repayments
) t WHERE prev_paid IS NOT NULL
ORDER BY days_since_prev DESC;`,
    hints: ["LAG(paid_on) partitioned by loan", "Date minus date is an integer day count in Postgres", "Drop each loan's first repayment (prev IS NULL)"], success_rate: 31,
  },
  {
    slug: "district-default-rate", title: "Default Rate by District", question_type: "code",
    difficulty: "Hard", industry: "Fintech", category: "Conditional Aggregation", tags: ["case-when", "ratio"],
    dataset: "fintech_microloan", time_limit_secs: 1800,
    content_md: `Credit policy wants geography risk. Return each \`district\`, its \`total_loans\`, \`defaulted_loans\`, and \`default_rate_pct\` (share of loans defaulted, 1 decimal), highest rate first.`,
    solution_sql: `SELECT district, COUNT(*) AS total_loans,
       COUNT(*) FILTER (WHERE status = 'defaulted') AS defaulted_loans,
       ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'defaulted') / COUNT(*), 1) AS default_rate_pct
FROM loans GROUP BY district ORDER BY default_rate_pct DESC;`,
    hints: ["COUNT(*) FILTER (WHERE ...) counts a subset", "Rate = 100.0 * defaulted / total", "GROUP BY district"], success_rate: 35,
  },

  // ════════════════ FINTECH — MCQs (5) ════════════════
  {
    slug: "mcq-filter-vs-case-count", title: "Counting a Subset Inside GROUP BY", question_type: "mcq",
    difficulty: "Medium", industry: "Fintech", category: "Conditional Aggregation", tags: ["concept"],
    content_md: `You're counting defaulted loans per district inside a single GROUP BY query. Which two expressions are equivalent ways to do it?`,
    options: [
      { label: "A", text: "COUNT(*) FILTER (WHERE status='defaulted') and SUM(CASE WHEN status='defaulted' THEN 1 ELSE 0 END)" },
      { label: "B", text: "COUNT(status='defaulted') and SUM(status)" },
      { label: "C", text: "COUNT(DISTINCT status) and MAX(status)" },
      { label: "D", text: "WHERE status='defaulted' twice" },
    ],
    correct_option: "A", success_rate: 58,
  },
  {
    slug: "mcq-union-vs-union-all", title: "UNION vs UNION ALL", question_type: "mcq",
    difficulty: "Easy", industry: "Fintech", category: "Set Operations", tags: ["concept"],
    content_md: `You combine June's agent list with July's agent list; the same agent can appear in both months and you want it **once**.

Which operator, and why?`,
    options: [
      { label: "A", text: "UNION ALL — it's faster" },
      { label: "B", text: "UNION — it removes duplicate rows across the combined result" },
      { label: "C", text: "INTERSECT — it merges the lists" },
      { label: "D", text: "EXCEPT — it keeps the shared agents" },
    ],
    correct_option: "B", success_rate: 70,
  },
  {
    slug: "mcq-fee-avg-null", title: "Does AVG See NULLs?", question_type: "mcq",
    difficulty: "Medium", industry: "Fintech", category: "NULL Semantics", tags: ["avg", "null"],
    content_md: `A fee column has values 10, 20, and NULL.

What is \`AVG(fee)\` over those three rows?`,
    options: [
      { label: "A", text: "10 — NULL counts as zero" },
      { label: "B", text: "15 — AVG ignores NULLs (30 / 2)" },
      { label: "C", text: "NULL — one NULL poisons the aggregate" },
      { label: "D", text: "An error" },
    ],
    correct_option: "B", success_rate: 61,
  },
  {
    slug: "mcq-between-inclusive", title: "Is BETWEEN Inclusive?", question_type: "mcq",
    difficulty: "Easy", industry: "Fintech", category: "Filtering", tags: ["between"],
    content_md: `\`WHERE amount BETWEEN 1000 AND 5000\` — which amounts qualify?`,
    options: [
      { label: "A", text: "Strictly greater than 1000 and strictly less than 5000" },
      { label: "B", text: "1000 and 5000 are both included" },
      { label: "C", text: "1000 included, 5000 excluded" },
      { label: "D", text: "Depends on the database collation" },
    ],
    correct_option: "B", success_rate: 76,
  },
  {
    slug: "mcq-window-vs-groupby", title: "Window Function vs GROUP BY", question_type: "mcq",
    difficulty: "Medium", industry: "Fintech", category: "Window Functions", tags: ["concept"],
    content_md: `You need every transaction row **plus** each user's total alongside it.

Why is \`SUM(amount) OVER (PARTITION BY user_id)\` the right tool rather than GROUP BY?`,
    options: [
      { label: "A", text: "GROUP BY would collapse rows; a window function keeps every row and adds the aggregate" },
      { label: "B", text: "Window functions are always faster than GROUP BY" },
      { label: "C", text: "GROUP BY cannot compute SUM" },
      { label: "D", text: "They are interchangeable; it's a style choice" },
    ],
    correct_option: "A", success_rate: 59,
  },

  // ════════════════ FINTECH — Case Studies (2) ════════════════
  {
    slug: "collections-priority-list", title: "Case: Monday Collections Priority List", question_type: "case_study",
    difficulty: "Medium", industry: "Fintech", category: "Joins", tags: ["left-join", "coalesce"],
    dataset: "fintech_microloan",
    content_md: `**Scenario.** The collections team starts Monday with a priority list: every non-paid loan and how much is still outstanding.

For loans not in \`paid\` status, return \`loan_id\`, \`borrower\`, \`district\`, and \`outstanding\` (principal minus total repaid; loans with zero repayments count fully outstanding), largest first.`,
    solution_sql: `SELECT l.loan_id, l.borrower, l.district,
       l.principal - COALESCE(SUM(r.amount), 0) AS outstanding
FROM loans l LEFT JOIN repayments r ON r.loan_id = l.loan_id
WHERE l.status <> 'paid'
GROUP BY l.loan_id, l.borrower, l.district, l.principal
ORDER BY outstanding DESC;`,
    hints: ["LEFT JOIN keeps loans with no repayments", "COALESCE(SUM(amount), 0) turns no-repayment NULL into 0", "Outstanding = principal - repaid"], success_rate: 49,
  },
  {
    slug: "agent-inactivity-audit", title: "Case: Agent Inactivity Audit", question_type: "case_study",
    difficulty: "Hard", industry: "Fintech", category: "Subqueries", tags: ["anti-join", "date"],
    dataset: "fintech_wallet", time_limit_secs: 1800,
    content_md: `**Scenario.** Distribution audits agent points every quarter; an agent with no successful transaction after **8 June 2026** is flagged dormant.

Return \`agent_id\` and \`shop_name\` of dormant agents, with their last successful activity date (\`last_active\`, NULL if never active), oldest activity first (NULLs first).`,
    solution_sql: `SELECT a.agent_id, a.shop_name, MAX(t.txn_at)::date AS last_active
FROM agents a LEFT JOIN transactions t
  ON t.agent_id = a.agent_id AND t.status = 'success'
GROUP BY a.agent_id, a.shop_name
HAVING COALESCE(MAX(t.txn_at), '1970-01-01') < '2026-06-08'
ORDER BY last_active NULLS FIRST;`,
    hints: ["Put the status filter in the JOIN condition so agents with no activity survive", "MAX(txn_at) is the last activity; HAVING applies the cutoff", "COALESCE handles never-active agents"], success_rate: 30,
  },

  // ════════════════ FINTECH — Mission: Collections Sprint (5) ════════════════
  {
    slug: "mission-collections-sprint", title: "Mission: The Collections Sprint", question_type: "root",
    difficulty: "Medium", industry: "Fintech", category: "Investigation", tags: ["mission", "lending"],
    content_md: `**The story.** Quarter-end is two weeks away and your DFS lender's recovery number looks soft. The head of credit hands you the microloan book: "Tell me exactly where the money is stuck, and who we call first." Four steps, one dataset, increasingly sharp answers.`,
    success_rate: 44,
  },
  {
    slug: "collections-1-book-overview", title: "Step 1: Size the Book", question_type: "code",
    difficulty: "Easy", industry: "Fintech", category: "Aggregation", tags: ["group-by"],
    dataset: "fintech_microloan", parent_slug: "mission-collections-sprint", order_index: 0,
    content_md: `First, the shape of the book by geography: return \`district\`, number of loans (\`loans\`), and total \`principal\` disbursed (\`disbursed\`), largest book first.`,
    solution_sql: `SELECT district, COUNT(*) AS loans, SUM(principal) AS disbursed
FROM loans GROUP BY district ORDER BY disbursed DESC;`,
    hints: ["GROUP BY district", "COUNT and SUM together"], success_rate: 78,
  },
  {
    slug: "collections-2-recovery-rate", title: "Step 2: Recovery Rate per District", question_type: "code",
    difficulty: "Medium", industry: "Fintech", category: "Joins", tags: ["left-join", "ratio"],
    dataset: "fintech_microloan", parent_slug: "mission-collections-sprint", order_index: 1,
    content_md: `Now the health metric: per district, how much of the disbursed principal has come back? Return \`district\`, \`disbursed\`, \`recovered\`, and \`recovery_pct\` (1 decimal), lowest recovery first.`,
    solution_sql: `SELECT l.district, SUM(DISTINCT_PRINCIPAL.principal) AS disbursed,
       COALESCE(SUM(r.amount), 0) AS recovered,
       ROUND(100.0 * COALESCE(SUM(r.amount), 0) / SUM(DISTINCT_PRINCIPAL.principal), 1) AS recovery_pct
FROM loans l
JOIN LATERAL (SELECT l.principal) DISTINCT_PRINCIPAL ON true
LEFT JOIN repayments r ON r.loan_id = l.loan_id
GROUP BY l.district
ORDER BY recovery_pct;`,
    hints: ["Careful: joining repayments duplicates loan rows — aggregate repayments per loan first, or sum principal separately", "A subquery per loan (or CTE) avoids double-counting principal", "Recovery = repaid / disbursed"], success_rate: 38,
  },
  {
    slug: "collections-3-slow-payers", title: "Step 3: The Slow Payers", question_type: "code",
    difficulty: "Medium", industry: "Fintech", category: "Aggregation", tags: ["having", "date"],
    dataset: "fintech_microloan", parent_slug: "mission-collections-sprint", order_index: 2,
    content_md: `District view done — now names. Active loans whose **last repayment** was before 1 May 2026 are officially slow. Return \`loan_id\`, \`borrower\`, and \`last_paid\`, oldest last payment first.`,
    solution_sql: `SELECT l.loan_id, l.borrower, MAX(r.paid_on) AS last_paid
FROM loans l JOIN repayments r ON r.loan_id = l.loan_id
WHERE l.status = 'active'
GROUP BY l.loan_id, l.borrower
HAVING MAX(r.paid_on) < '2026-05-01'
ORDER BY last_paid;`,
    hints: ["MAX(paid_on) per loan is the last payment", "The cutoff test on an aggregate goes in HAVING"], success_rate: 51,
  },
  {
    slug: "collections-4-call-list", title: "Step 4: The Call List", question_type: "code",
    difficulty: "Hard", industry: "Fintech", category: "Subqueries", tags: ["cte", "outstanding"],
    dataset: "fintech_microloan", parent_slug: "mission-collections-sprint", order_index: 3, time_limit_secs: 1800,
    content_md: `Final deliverable: the ranked call list. For every **non-paid** loan, compute outstanding (principal − repaid) and rank by outstanding descending. Return \`rank\`, \`borrower\`, \`district\`, \`status\`, and \`outstanding\`.`,
    solution_sql: `WITH repaid AS (
  SELECT loan_id, SUM(amount) AS total FROM repayments GROUP BY loan_id
)
SELECT RANK() OVER (ORDER BY l.principal - COALESCE(rp.total, 0) DESC) AS rank,
       l.borrower, l.district, l.status,
       l.principal - COALESCE(rp.total, 0) AS outstanding
FROM loans l LEFT JOIN repaid rp ON rp.loan_id = l.loan_id
WHERE l.status <> 'paid'
ORDER BY outstanding DESC;`,
    hints: ["A CTE of repayments per loan keeps the main query clean", "RANK() OVER (ORDER BY outstanding DESC)", "COALESCE for never-paid loans"], success_rate: 29,
  },

  // ════════════════ E-COMMERCE — Singles (12) ════════════════
  {
    slug: "fashion-under-2500", title: "Affordable Fashion Picks", question_type: "code",
    difficulty: "Easy", industry: "E-Commerce", category: "Filtering", tags: ["where", "and"],
    dataset: "ecommerce_shop",
    content_md: `The "Fashion under ৳2,500" carousel needs data. Return \`name\` and \`price\` of Fashion products priced below ৳2,500, cheapest first.`,
    solution_sql: `SELECT name, price FROM products WHERE category = 'Fashion' AND price < 2500 ORDER BY price;`,
    hints: ["Two conditions with AND", "Cheapest first = ORDER BY price"], success_rate: 87,
  },
  {
    slug: "customers-from-dhaka", title: "Dhaka Customer Base", question_type: "code",
    difficulty: "Easy", industry: "E-Commerce", category: "Filtering", tags: ["where", "date"],
    dataset: "ecommerce_shop",
    content_md: `Return \`name\` and \`signup_date\` of customers in Dhaka who signed up in 2026, newest first.`,
    solution_sql: `SELECT name, signup_date FROM customers
WHERE city = 'Dhaka' AND signup_date >= '2026-01-01'
ORDER BY signup_date DESC;`,
    hints: ["City filter plus a date lower bound", "All 2026 dates are >= '2026-01-01'"], success_rate: 84,
  },
  {
    slug: "order-count-per-customer", title: "Orders per Customer", question_type: "code",
    difficulty: "Easy", industry: "E-Commerce", category: "Joins", tags: ["join", "count"],
    dataset: "ecommerce_shop",
    content_md: `Return each customer \`name\` and their total order count (\`orders_count\`) — any status — most orders first, then by name.`,
    solution_sql: `SELECT c.name, COUNT(o.order_id) AS orders_count
FROM customers c JOIN orders o ON o.customer_id = c.customer_id
GROUP BY c.name ORDER BY orders_count DESC, name;`,
    hints: ["Join orders to customers", "COUNT per customer"], success_rate: 80,
  },
  {
    slug: "category-price-stats", title: "Price Stats per Category", question_type: "code",
    difficulty: "Medium", industry: "E-Commerce", category: "Aggregation", tags: ["min-max", "avg"],
    dataset: "ecommerce_shop",
    content_md: `Pricing reviews start from the spread. Return each \`category\` with its cheapest (\`min_price\`), most expensive (\`max_price\`), and average (\`avg_price\`, 2 decimals) product price, alphabetical by category.`,
    solution_sql: `SELECT category, MIN(price) AS min_price, MAX(price) AS max_price, ROUND(AVG(price), 2) AS avg_price
FROM products GROUP BY category ORDER BY category;`,
    hints: ["Three aggregates in one GROUP BY", "ROUND the average only"], success_rate: 72,
  },
  {
    slug: "cancelled-or-returned-value", title: "Value Lost to Cancellations and Returns", question_type: "code",
    difficulty: "Medium", industry: "E-Commerce", category: "Filtering", tags: ["in", "join"],
    dataset: "ecommerce_shop",
    content_md: `Sum the item value of orders that were **cancelled or returned**. Return one row: \`lost_value\`.`,
    solution_sql: `SELECT SUM(oi.quantity * oi.unit_price) AS lost_value
FROM orders o JOIN order_items oi ON oi.order_id = o.order_id
WHERE o.status IN ('cancelled','returned');`,
    hints: ["status IN (...) covers both", "Value = quantity * unit_price"], success_rate: 69,
  },
  {
    slug: "multi-item-orders", title: "Orders with Multiple Line Items", question_type: "code",
    difficulty: "Medium", industry: "E-Commerce", category: "Aggregation", tags: ["having", "count"],
    dataset: "ecommerce_shop",
    content_md: `Bundling analysis: which orders contained **more than one distinct product**? Return \`order_id\` and \`item_lines\`, most lines first.`,
    solution_sql: `SELECT order_id, COUNT(*) AS item_lines
FROM order_items GROUP BY order_id
HAVING COUNT(*) > 1 ORDER BY item_lines DESC, order_id;`,
    hints: ["Each order_items row is one product line", "HAVING COUNT(*) > 1"], success_rate: 67,
  },
  {
    slug: "june-vs-may-revenue", title: "May vs June Delivered Revenue", question_type: "code",
    difficulty: "Medium", industry: "E-Commerce", category: "Conditional Aggregation", tags: ["case-when", "date"],
    dataset: "ecommerce_shop",
    content_md: `One row, two numbers: delivered revenue in **May 2026** (\`may_revenue\`) and in **June 2026** (\`june_revenue\`).`,
    solution_sql: `SELECT
  SUM(CASE WHEN o.order_date >= '2026-05-01' AND o.order_date < '2026-06-01' THEN oi.quantity * oi.unit_price ELSE 0 END) AS may_revenue,
  SUM(CASE WHEN o.order_date >= '2026-06-01' AND o.order_date < '2026-07-01' THEN oi.quantity * oi.unit_price ELSE 0 END) AS june_revenue
FROM orders o JOIN order_items oi ON oi.order_id = o.order_id
WHERE o.status = 'delivered';`,
    hints: ["Pivot the months with CASE inside SUM", "Keep the delivered filter in WHERE"], success_rate: 54,
  },
  {
    slug: "products-in-every-status", title: "Products Sold and Also Returned", question_type: "code",
    difficulty: "Medium", industry: "E-Commerce", category: "Set Operations", tags: ["intersect", "subquery"],
    dataset: "ecommerce_shop",
    content_md: `Quality wants products that appear in **both** a delivered order and a cancelled order — sold fine to some, abandoned by others. Return their \`product_id\` and \`name\`.`,
    solution_sql: `SELECT p.product_id, p.name FROM products p
WHERE p.product_id IN (
  SELECT oi.product_id FROM order_items oi JOIN orders o ON o.order_id = oi.order_id WHERE o.status = 'delivered'
)
AND p.product_id IN (
  SELECT oi.product_id FROM order_items oi JOIN orders o ON o.order_id = oi.order_id WHERE o.status = 'cancelled'
);`,
    hints: ["Two membership tests, one per status", "IN (subquery) twice — or INTERSECT two selects"], success_rate: 50,
  },
  {
    slug: "revenue-rank-in-category", title: "Revenue Rank Within Category", question_type: "code",
    difficulty: "Hard", industry: "E-Commerce", category: "Window Functions", tags: ["rank", "partition"],
    dataset: "ecommerce_shop", time_limit_secs: 1800,
    content_md: `For **delivered** sales, rank products **within their category** by revenue. Return \`category\`, \`name\`, \`revenue\`, and \`rank_in_category\`, ordered by category then rank.`,
    solution_sql: `SELECT category, name, revenue,
       RANK() OVER (PARTITION BY category ORDER BY revenue DESC) AS rank_in_category
FROM (
  SELECT p.category, p.name, SUM(oi.quantity * oi.unit_price) AS revenue
  FROM products p
  JOIN order_items oi ON oi.product_id = p.product_id
  JOIN orders o ON o.order_id = oi.order_id
  WHERE o.status = 'delivered'
  GROUP BY p.category, p.name
) t ORDER BY category, rank_in_category;`,
    hints: ["Aggregate revenue per product first", "RANK() partitioned by category over that", "Two-level query"], success_rate: 34,
  },
  {
    slug: "days-to-first-order", title: "Days from Signup to First Order", question_type: "code",
    difficulty: "Hard", industry: "E-Commerce", category: "Window Functions", tags: ["min", "date-diff"],
    dataset: "ecommerce_shop", time_limit_secs: 1800,
    content_md: `Activation metric: for every customer who ordered, return \`name\`, \`signup_date\`, their first order date (\`first_order\`), and \`days_to_activate\`, fastest first.`,
    solution_sql: `SELECT c.name, c.signup_date, MIN(o.order_date) AS first_order,
       MIN(o.order_date) - c.signup_date AS days_to_activate
FROM customers c JOIN orders o ON o.customer_id = c.customer_id
GROUP BY c.customer_id, c.name, c.signup_date
ORDER BY days_to_activate;`,
    hints: ["MIN(order_date) is the first order", "Date subtraction yields days", "Group per customer"], success_rate: 42,
  },
  {
    slug: "aov-by-city", title: "Average Order Value by City", question_type: "code",
    difficulty: "Hard", industry: "E-Commerce", category: "Subqueries", tags: ["cte", "avg"],
    dataset: "ecommerce_shop", time_limit_secs: 1800,
    content_md: `City economics: average **delivered** order value per customer city (\`aov\`, 2 decimals), highest first. (Average of order totals — not the total divided by item count.)`,
    solution_sql: `WITH order_values AS (
  SELECT o.order_id, c.city, SUM(oi.quantity * oi.unit_price) AS order_value
  FROM orders o
  JOIN customers c ON c.customer_id = o.customer_id
  JOIN order_items oi ON oi.order_id = o.order_id
  WHERE o.status = 'delivered'
  GROUP BY o.order_id, c.city
)
SELECT city, ROUND(AVG(order_value), 2) AS aov
FROM order_values GROUP BY city ORDER BY aov DESC;`,
    hints: ["Order value first (per order), city average second", "A CTE keeps the two levels readable"], success_rate: 37,
  },

  // ════════════════ E-COMMERCE — MCQs (5) ════════════════
  {
    slug: "mcq-inner-join-drops", title: "Who Disappears in an INNER JOIN?", question_type: "mcq",
    difficulty: "Easy", industry: "E-Commerce", category: "Joins", tags: ["concept"],
    dataset: "ecommerce_shop",
    content_md: `\`customers INNER JOIN orders\` — customer 4's only order was cancelled and customer 6's order is processing, but one registered customer has **no orders at all**.

What happens to that no-order customer in the join result?`,
    options: [
      { label: "A", text: "They appear with NULL order columns" },
      { label: "B", text: "They are excluded — INNER JOIN keeps only matching rows" },
      { label: "C", text: "They appear once with default values" },
      { label: "D", text: "The query errors" },
    ],
    correct_option: "B", success_rate: 78,
  },
  {
    slug: "mcq-group-by-rule", title: "The GROUP BY Column Rule", question_type: "mcq",
    difficulty: "Easy", industry: "E-Commerce", category: "Aggregation", tags: ["concept"],
    content_md: `\`SELECT city, name, COUNT(*) FROM customers GROUP BY city;\` fails in Postgres.

Why?`,
    options: [
      { label: "A", text: "COUNT(*) can't be combined with text columns" },
      { label: "B", text: "name is neither grouped nor aggregated, so its value per group is ambiguous" },
      { label: "C", text: "GROUP BY only accepts one column" },
      { label: "D", text: "city must appear last in the SELECT list" },
    ],
    correct_option: "B", success_rate: 69,
  },
  {
    slug: "mcq-limit-without-order", title: "LIMIT Without ORDER BY", question_type: "mcq",
    difficulty: "Medium", industry: "E-Commerce", category: "Sorting", tags: ["concept", "limit"],
    content_md: `A dashboard uses \`SELECT * FROM orders LIMIT 5\` to show "the latest 5 orders" — and sometimes shows different rows after a deploy.

What's the root cause?`,
    options: [
      { label: "A", text: "LIMIT is non-deterministic without ORDER BY — row order is not guaranteed" },
      { label: "B", text: "LIMIT caches results between deploys" },
      { label: "C", text: "Postgres returns rows by primary key unless told otherwise" },
      { label: "D", text: "The table needs VACUUM" },
    ],
    correct_option: "A", success_rate: 63,
  },
  {
    slug: "mcq-left-join-count-trap", title: "The LEFT JOIN COUNT(*) Trap", question_type: "mcq",
    difficulty: "Medium", industry: "E-Commerce", category: "Joins", tags: ["count", "null"],
    content_md: `Counting orders per customer with \`customers LEFT JOIN orders\`: a customer with **zero orders** shows a count of 1 when you use \`COUNT(*)\`.

What fixes it?`,
    options: [
      { label: "A", text: "Switch to COUNT(o.order_id) — it ignores the NULL from the unmatched row" },
      { label: "B", text: "Use INNER JOIN instead" },
      { label: "C", text: "Add DISTINCT to COUNT(*)" },
      { label: "D", text: "Filter WHERE o.order_id IS NOT NULL" },
    ],
    correct_option: "A", success_rate: 55,
  },
  {
    slug: "mcq-subquery-in-where", title: "Scalar Subquery Cardinality", question_type: "mcq",
    difficulty: "Medium", industry: "E-Commerce", category: "Subqueries", tags: ["concept"],
    content_md: `\`WHERE price > (SELECT AVG(price) FROM products)\` works, but \`WHERE price > (SELECT price FROM products)\` errors at runtime.

Why?`,
    options: [
      { label: "A", text: "AVG is the only function allowed in subqueries" },
      { label: "B", text: "A comparison needs a scalar; the second subquery returns multiple rows" },
      { label: "C", text: "The second subquery is missing GROUP BY" },
      { label: "D", text: "Subqueries in WHERE must use IN" },
    ],
    correct_option: "B", success_rate: 60,
  },

  // ════════════════ E-COMMERCE — Case Studies (2) ════════════════
  {
    slug: "free-shipping-threshold", title: "Case: Setting the Free-Shipping Threshold", question_type: "case_study",
    difficulty: "Medium", industry: "E-Commerce", category: "Aggregation", tags: ["percentile", "order-value"],
    dataset: "ecommerce_shop",
    content_md: `**Scenario.** Growth wants free shipping above a threshold that most orders *almost* reach. As the first input, they need every delivered order's value and how it compares to the average.

Return \`order_id\`, \`order_value\`, and \`vs_avg\` (order value minus the average delivered order value, 2 decimals), highest value first.`,
    solution_sql: `WITH vals AS (
  SELECT o.order_id, SUM(oi.quantity * oi.unit_price) AS order_value
  FROM orders o JOIN order_items oi ON oi.order_id = o.order_id
  WHERE o.status = 'delivered'
  GROUP BY o.order_id
)
SELECT order_id, order_value, ROUND(order_value - AVG(order_value) OVER (), 2) AS vs_avg
FROM vals ORDER BY order_value DESC;`,
    hints: ["Per-order values in a CTE", "AVG(...) OVER () compares each row to the overall average without collapsing rows"], success_rate: 43,
  },
  {
    slug: "category-return-rate", title: "Case: Category Return Rates", question_type: "case_study",
    difficulty: "Hard", industry: "E-Commerce", category: "Conditional Aggregation", tags: ["ratio", "case-when"],
    dataset: "ecommerce_shop", time_limit_secs: 1800,
    content_md: `**Scenario.** Supplier scorecards need a defect proxy: of each category's ordered units (delivered + returned orders only), what share sat in returned orders?

Return \`category\`, \`units_total\`, \`units_returned\`, and \`return_rate_pct\` (1 decimal), highest rate first.`,
    solution_sql: `SELECT p.category,
       SUM(oi.quantity) AS units_total,
       SUM(CASE WHEN o.status = 'returned' THEN oi.quantity ELSE 0 END) AS units_returned,
       ROUND(100.0 * SUM(CASE WHEN o.status = 'returned' THEN oi.quantity ELSE 0 END) / SUM(oi.quantity), 1) AS return_rate_pct
FROM products p
JOIN order_items oi ON oi.product_id = p.product_id
JOIN orders o ON o.order_id = oi.order_id
WHERE o.status IN ('delivered','returned')
GROUP BY p.category
ORDER BY return_rate_pct DESC;`,
    hints: ["Restrict to the two statuses in WHERE", "Returned units via conditional SUM", "Rate = returned / total units"], success_rate: 32,
  },

  // ════════════════ LOGISTICS — Singles (7) ════════════════
  {
    slug: "prepaid-parcels", title: "Prepaid Parcels", question_type: "code",
    difficulty: "Easy", industry: "Logistics", category: "Filtering", tags: ["where"],
    dataset: "logistics_courier",
    content_md: `Prepaid parcels (no COD to collect) skip the cash desk. Return \`parcel_id\`, \`sender_area\`, and \`receiver_area\` of parcels with zero COD, by parcel_id.`,
    solution_sql: `SELECT parcel_id, sender_area, receiver_area FROM parcels WHERE cod_amount = 0 ORDER BY parcel_id;`,
    hints: ["cod_amount = 0 means prepaid", "ORDER BY parcel_id for a stable list"], success_rate: 89,
  },
  {
    slug: "heavy-parcels", title: "Heavy Parcel Surcharge List", question_type: "code",
    difficulty: "Easy", industry: "Logistics", category: "Filtering", tags: ["where", "order-by"],
    dataset: "logistics_courier",
    content_md: `Parcels over 2 kg carry a surcharge. Return \`parcel_id\`, \`weight_kg\`, and \`receiver_area\`, heaviest first.`,
    solution_sql: `SELECT parcel_id, weight_kg, receiver_area FROM parcels WHERE weight_kg > 2 ORDER BY weight_kg DESC;`,
    hints: ["Numeric comparison on weight_kg", "Heaviest first = ORDER BY weight_kg DESC"], success_rate: 90,
  },
  {
    slug: "deliveries-per-rider", title: "Completed Deliveries per Rider", question_type: "code",
    difficulty: "Easy", industry: "Logistics", category: "Joins", tags: ["join", "count"],
    dataset: "logistics_courier",
    content_md: `Weekly leaderboard: return rider \`name\` and their **delivered** count (\`completed\`), highest first, then by name.`,
    solution_sql: `SELECT r.name, COUNT(*) AS completed
FROM riders r JOIN deliveries d ON d.rider_id = r.rider_id
WHERE d.status = 'delivered'
GROUP BY r.name ORDER BY completed DESC, name;`,
    hints: ["Filter delivered, then count per rider", "Tie-break the order with the rider name"], success_rate: 81,
  },
  {
    slug: "hub-delivery-share", title: "Delivery Share by Hub", question_type: "code",
    difficulty: "Medium", industry: "Logistics", category: "Joins", tags: ["multi-join", "group-by"],
    dataset: "logistics_courier",
    content_md: `Which hub moves the network? Return hub \`city\` and its count of **delivered** runs (\`delivered_count\`), highest first.`,
    solution_sql: `SELECT h.city, COUNT(*) AS delivered_count
FROM hubs h
JOIN riders r ON r.hub_id = h.hub_id
JOIN deliveries d ON d.rider_id = r.rider_id
WHERE d.status = 'delivered'
GROUP BY h.city ORDER BY delivered_count DESC;`,
    hints: ["Hubs connect to deliveries through riders", "Two joins"], success_rate: 66,
  },
  {
    slug: "same-day-deliveries", title: "Same-Day Delivery Rate Inputs", question_type: "code",
    difficulty: "Medium", industry: "Logistics", category: "Date Functions", tags: ["date", "case"],
    dataset: "logistics_courier",
    content_md: `The SLA team defines *same-day* as picked and delivered on the same calendar date. Return \`delivery_id\`, \`parcel_id\`, and \`same_day\` (true/false) for every **delivered** run, delivery_id order.`,
    solution_sql: `SELECT delivery_id, parcel_id, (picked_at::date = delivered_at::date) AS same_day
FROM deliveries WHERE status = 'delivered' ORDER BY delivery_id;`,
    hints: ["Compare the ::date casts of both timestamps", "A boolean expression can be selected directly"], success_rate: 58,
  },
  {
    slug: "rider-cod-vs-prepaid", title: "Rider Workload: COD vs Prepaid", question_type: "code",
    difficulty: "Hard", industry: "Logistics", category: "Conditional Aggregation", tags: ["case-when"],
    dataset: "logistics_courier", time_limit_secs: 1800,
    content_md: `Cash handling is risk. Per rider (delivered runs only), return \`name\`, \`cod_deliveries\`, and \`prepaid_deliveries\` in one row each, most COD first.`,
    solution_sql: `SELECT r.name,
       SUM(CASE WHEN p.cod_amount > 0 THEN 1 ELSE 0 END) AS cod_deliveries,
       SUM(CASE WHEN p.cod_amount = 0 THEN 1 ELSE 0 END) AS prepaid_deliveries
FROM riders r
JOIN deliveries d ON d.rider_id = r.rider_id
JOIN parcels p ON p.parcel_id = d.parcel_id
WHERE d.status = 'delivered'
GROUP BY r.name ORDER BY cod_deliveries DESC;`,
    hints: ["Two conditional counts in one GROUP BY", "COD-ness lives on the parcel"], success_rate: 40,
  },
  {
    slug: "fastest-delivery-per-hub", title: "Fastest Delivery per Hub", question_type: "code",
    difficulty: "Hard", industry: "Logistics", category: "Window Functions", tags: ["row-number", "extract"],
    dataset: "logistics_courier", time_limit_secs: 1800,
    content_md: `Bragging rights: each hub's single fastest delivered run. Return hub \`city\`, rider \`name\`, and \`minutes\` (pickup to delivery, whole minutes), fastest overall first.`,
    solution_sql: `SELECT city, name, minutes FROM (
  SELECT h.city, r.name,
         ROUND(EXTRACT(EPOCH FROM (d.delivered_at - d.picked_at)) / 60) AS minutes,
         ROW_NUMBER() OVER (PARTITION BY h.hub_id ORDER BY d.delivered_at - d.picked_at) AS rn
  FROM hubs h
  JOIN riders r ON r.hub_id = h.hub_id
  JOIN deliveries d ON d.rider_id = r.rider_id
  WHERE d.status = 'delivered'
) t WHERE rn = 1 ORDER BY minutes;`,
    hints: ["Duration = delivered_at - picked_at", "ROW_NUMBER per hub ordered by duration ascending", "EPOCH/60 for minutes"], success_rate: 33,
  },

  // ════════════════ LOGISTICS — MCQs (3) ════════════════
  {
    slug: "mcq-timestamp-date-cast", title: "Casting a Timestamp to a Date", question_type: "mcq",
    difficulty: "Easy", industry: "Logistics", category: "Date Functions", tags: ["cast"],
    content_md: `\`picked_at\` is \`2026-06-01 10:00:00\`.

What does \`picked_at::date\` give you in Postgres?`,
    options: [
      { label: "A", text: "2026-06-01 — the date part only" },
      { label: "B", text: "10:00:00 — the time part only" },
      { label: "C", text: "An error; timestamps can't be cast" },
      { label: "D", text: "The Unix epoch seconds" },
    ],
    correct_option: "A", success_rate: 82,
  },
  {
    slug: "mcq-interval-subtraction", title: "Subtracting Two Timestamps", question_type: "mcq",
    difficulty: "Medium", industry: "Logistics", category: "Date Functions", tags: ["interval"],
    content_md: `In Postgres, \`delivered_at - picked_at\` (both timestamps) returns which type?`,
    options: [
      { label: "A", text: "An integer number of seconds" },
      { label: "B", text: "An INTERVAL (e.g. '05:30:00')" },
      { label: "C", text: "A float number of days" },
      { label: "D", text: "A new timestamp" },
    ],
    correct_option: "B", success_rate: 56,
  },
  {
    slug: "mcq-multiple-attempts-grain", title: "Choosing the Right Grain", question_type: "mcq",
    difficulty: "Medium", industry: "Logistics", category: "Modeling", tags: ["concept", "grain"],
    dataset: "logistics_courier",
    content_md: `\`deliveries\` holds one row **per attempt**, and a parcel can have several attempts.

To report "parcels delivered per rider", what must you be careful about?`,
    options: [
      { label: "A", text: "Nothing — COUNT(*) on deliveries is always the parcel count" },
      { label: "B", text: "Failed attempts exist, so count only rows with status='delivered' (and distinct parcels if needed)" },
      { label: "C", text: "You must join hubs first" },
      { label: "D", text: "COUNT(DISTINCT rider_id) is required" },
    ],
    correct_option: "B", success_rate: 61,
  },

  // ════════════════ LOGISTICS — Case Study (1) ════════════════
  {
    slug: "failed-first-attempt-cost", title: "Case: The Cost of Failed First Attempts", question_type: "case_study",
    difficulty: "Hard", industry: "Logistics", category: "Window Functions", tags: ["lag", "attempts"],
    dataset: "logistics_courier", time_limit_secs: 1800,
    content_md: `**Scenario.** Every failed first attempt means a re-dispatch. Ops wants the parcels whose **first attempt failed**, and whether a later attempt rescued them.

Return \`parcel_id\`, first attempt's \`status\` (\`first_status\`), and \`rescued\` (true if any later attempt delivered).`,
    solution_sql: `WITH ranked AS (
  SELECT parcel_id, status,
         ROW_NUMBER() OVER (PARTITION BY parcel_id ORDER BY picked_at) AS attempt_no
  FROM deliveries
)
SELECT f.parcel_id, f.status AS first_status,
       EXISTS (
         SELECT 1 FROM ranked l
         WHERE l.parcel_id = f.parcel_id AND l.attempt_no > 1 AND l.status = 'delivered'
       ) AS rescued
FROM ranked f
WHERE f.attempt_no = 1 AND f.status = 'failed';`,
    hints: ["Number attempts per parcel with ROW_NUMBER over picked_at", "First attempt = attempt_no 1", "EXISTS over later attempts answers 'rescued'"], success_rate: 28,
  },

  // ════════════════ LOGISTICS — Mission: SLA Crunch (5) ════════════════
  {
    slug: "mission-sla-crunch", title: "Mission: SLA Crunch Week", question_type: "root",
    difficulty: "Medium", industry: "Logistics", category: "Investigation", tags: ["mission", "sla"],
    content_md: `**The story.** A key e-commerce client threatens to switch couriers: "your Dhaka deliveries are slipping." The city lead gives you the ops database and 48 hours. Four steps from raw counts to the exact riders and runs behind the slippage.`,
    success_rate: 46,
  },
  {
    slug: "sla-1-attempt-outcomes", title: "Step 1: Attempt Outcomes", question_type: "code",
    difficulty: "Easy", industry: "Logistics", category: "Aggregation", tags: ["group-by"],
    dataset: "logistics_courier", parent_slug: "mission-sla-crunch", order_index: 0,
    content_md: `Baseline first: return each delivery \`status\` and its attempt count (\`attempts\`), largest first.`,
    solution_sql: `SELECT status, COUNT(*) AS attempts FROM deliveries GROUP BY status ORDER BY attempts DESC;`,
    hints: ["GROUP BY status over the attempts table", "ORDER BY the count descending"], success_rate: 85,
  },
  {
    slug: "sla-2-duration-distribution", title: "Step 2: How Long Deliveries Take", question_type: "code",
    difficulty: "Medium", industry: "Logistics", category: "Date Functions", tags: ["extract", "bucketing"],
    dataset: "logistics_courier", parent_slug: "mission-sla-crunch", order_index: 1,
    content_md: `The SLA is 6 hours. Bucket **delivered** runs into \`'within_sla'\` (≤ 6h) and \`'breached'\` (> 6h). Return \`bucket\` and \`runs\`, breaches first.`,
    solution_sql: `SELECT CASE WHEN EXTRACT(EPOCH FROM (delivered_at - picked_at)) / 3600 <= 6
            THEN 'within_sla' ELSE 'breached' END AS bucket,
       COUNT(*) AS runs
FROM deliveries WHERE status = 'delivered'
GROUP BY 1 ORDER BY bucket;`,
    hints: ["Hours = EPOCH difference / 3600", "CASE builds the bucket label", "GROUP BY 1 groups by the first select expression"], success_rate: 49,
  },
  {
    slug: "sla-3-rider-breach-rate", title: "Step 3: Breaches by Rider", question_type: "code",
    difficulty: "Medium", industry: "Logistics", category: "Conditional Aggregation", tags: ["case-when", "ratio"],
    dataset: "logistics_courier", parent_slug: "mission-sla-crunch", order_index: 2,
    content_md: `Now names: per rider (delivered runs), return \`name\`, \`total_runs\`, \`breaches\` (> 6h), most breaches first, ties by name.`,
    solution_sql: `SELECT r.name, COUNT(*) AS total_runs,
       SUM(CASE WHEN EXTRACT(EPOCH FROM (d.delivered_at - d.picked_at)) / 3600 > 6 THEN 1 ELSE 0 END) AS breaches
FROM riders r JOIN deliveries d ON d.rider_id = r.rider_id
WHERE d.status = 'delivered'
GROUP BY r.name ORDER BY breaches DESC, name;`,
    hints: ["Reuse the 6-hour test inside a conditional SUM", "Count total and breaches in the same pass"], success_rate: 47,
  },
  {
    slug: "sla-4-worst-runs-report", title: "Step 4: The Evidence Pack", question_type: "code",
    difficulty: "Hard", industry: "Logistics", category: "Window Functions", tags: ["rank", "report"],
    dataset: "logistics_courier", parent_slug: "mission-sla-crunch", order_index: 3, time_limit_secs: 1800,
    content_md: `For the client call, rank the 5 slowest delivered runs. Return \`rank\`, parcel \`parcel_id\`, rider \`name\`, \`hours\` (1 decimal), slowest first.`,
    solution_sql: `SELECT RANK() OVER (ORDER BY d.delivered_at - d.picked_at DESC) AS rank,
       d.parcel_id, r.name,
       ROUND((EXTRACT(EPOCH FROM (d.delivered_at - d.picked_at)) / 3600)::numeric, 1) AS hours
FROM deliveries d JOIN riders r ON r.rider_id = d.rider_id
WHERE d.status = 'delivered'
ORDER BY hours DESC LIMIT 5;`,
    hints: ["RANK over the duration descending", "LIMIT 5 after ordering", "Round hours to 1 decimal"], success_rate: 36,
  },

  // ════════════════ TELCO — Singles (6) ════════════════
  {
    slug: "premium-plan-roster", title: "Premium Plan Roster", question_type: "code",
    difficulty: "Easy", industry: "Telco", category: "Joins", tags: ["join", "where"],
    dataset: "telco_network",
    content_md: `Return \`name\` and \`activated_on\` of subscribers on plans costing **৳500+ per month**, newest activation first.`,
    solution_sql: `SELECT s.name, s.activated_on
FROM subscribers s JOIN plans p ON p.plan_id = s.plan_id
WHERE p.monthly_fee >= 500 ORDER BY s.activated_on DESC;`,
    hints: ["Fee filter lives on plans", "Join then WHERE"], success_rate: 82,
  },
  {
    slug: "small-recharges", title: "Micro-Recharge Behaviour", question_type: "code",
    difficulty: "Easy", industry: "Telco", category: "Filtering", tags: ["where", "count"],
    dataset: "telco_network",
    content_md: `Micro top-ups (< ৳150) signal price sensitivity. Return one row with their count (\`micro_count\`) and total value (\`micro_value\`).`,
    solution_sql: `SELECT COUNT(*) AS micro_count, SUM(amount) AS micro_value FROM recharges WHERE amount < 150;`,
    hints: ["Aggregate over a filtered set — no GROUP BY needed", "COUNT(*) and SUM(amount) in one SELECT"], success_rate: 83,
  },
  {
    slug: "district-subscriber-mix", title: "Subscriber Mix by District", question_type: "code",
    difficulty: "Medium", industry: "Telco", category: "Aggregation", tags: ["group-by", "count-distinct"],
    dataset: "telco_network",
    content_md: `Regional planning: per \`district\`, return subscriber count (\`subs\`) and how many **distinct plans** are in use there (\`plans_used\`), most subs first.`,
    solution_sql: `SELECT district, COUNT(*) AS subs, COUNT(DISTINCT plan_id) AS plans_used
FROM subscribers GROUP BY district ORDER BY subs DESC;`,
    hints: ["COUNT(DISTINCT plan_id) inside the same GROUP BY", "Plain COUNT(*) gives the subscriber count"], success_rate: 65,
  },
  {
    slug: "voice-heavy-users", title: "Voice-Heavy Subscribers", question_type: "code",
    difficulty: "Medium", industry: "Telco", category: "Aggregation", tags: ["having", "sum"],
    dataset: "telco_network",
    content_md: `Voice bundles are due an upsell. Return \`name\` and total voice minutes (\`total_min\`) of subscribers with **more than 100 minutes** across the recorded days, highest first.`,
    solution_sql: `SELECT s.name, SUM(u.voice_min) AS total_min
FROM subscribers s JOIN usage_daily u ON u.sub_id = s.sub_id
GROUP BY s.name HAVING SUM(u.voice_min) > 100
ORDER BY total_min DESC;`,
    hints: ["SUM voice_min per subscriber", "The >100 test goes in HAVING"], success_rate: 62,
  },
  {
    slug: "data-vs-plan-allowance", title: "Usage vs Plan Allowance", question_type: "code",
    difficulty: "Hard", industry: "Telco", category: "Joins", tags: ["ratio", "multi-join"],
    dataset: "telco_network", time_limit_secs: 1800,
    content_md: `Who's outgrowing their plan? Per subscriber, compare recorded total data (GB) to the plan's monthly allowance. Return \`name\`, plan \`allowance_gb\`, \`used_gb\` (2 decimals), and \`pct_of_allowance\` (1 decimal), highest percentage first.`,
    solution_sql: `SELECT s.name, p.data_gb AS allowance_gb,
       ROUND(SUM(u.data_mb) / 1024.0, 2) AS used_gb,
       ROUND(100.0 * SUM(u.data_mb) / 1024.0 / p.data_gb, 1) AS pct_of_allowance
FROM subscribers s
JOIN plans p ON p.plan_id = s.plan_id
JOIN usage_daily u ON u.sub_id = s.sub_id
GROUP BY s.name, p.data_gb
ORDER BY pct_of_allowance DESC;`,
    hints: ["GB = SUM(data_mb)/1024.0", "Percentage against p.data_gb", "Group by subscriber and allowance"], success_rate: 38,
  },
  {
    slug: "second-highest-recharge", title: "Second-Highest Recharge", question_type: "code",
    difficulty: "Hard", industry: "Telco", category: "Window Functions", tags: ["dense-rank", "offset"],
    dataset: "telco_network", time_limit_secs: 1800,
    content_md: `A classic interview twist: find the **second-highest distinct** recharge amount, and every recharge at that amount. Return \`recharge_id\`, \`sub_id\`, and \`amount\`.`,
    solution_sql: `SELECT recharge_id, sub_id, amount FROM (
  SELECT recharge_id, sub_id, amount, DENSE_RANK() OVER (ORDER BY amount DESC) AS dr
  FROM recharges
) t WHERE dr = 2;`,
    hints: ["DENSE_RANK handles ties on the top amount", "Keep dr = 2"], success_rate: 41,
  },

  // ════════════════ TELCO — MCQs (2) ════════════════
  {
    slug: "mcq-composite-pk", title: "Why a Composite Primary Key?", question_type: "mcq",
    difficulty: "Medium", industry: "Telco", category: "Modeling", tags: ["concept", "keys"],
    dataset: "telco_network",
    content_md: `\`usage_daily\` declares \`PRIMARY KEY (sub_id, usage_date)\`.

What does that model?`,
    options: [
      { label: "A", text: "Each subscriber may appear at most once per day — one usage row per subscriber-day" },
      { label: "B", text: "sub_id alone must be unique" },
      { label: "C", text: "usage_date alone must be unique" },
      { label: "D", text: "The table can't have foreign keys" },
    ],
    correct_option: "A", success_rate: 67,
  },
  {
    slug: "mcq-dense-vs-rank", title: "RANK vs DENSE_RANK on Ties", question_type: "mcq",
    difficulty: "Medium", industry: "Telco", category: "Window Functions", tags: ["concept", "rank"],
    content_md: `Recharge amounts 999, 599, 599, 349 are ranked descending.

What ranks do RANK() and DENSE_RANK() give the ৳349 row?`,
    options: [
      { label: "A", text: "RANK: 4, DENSE_RANK: 3 — RANK skips after ties, DENSE_RANK doesn't" },
      { label: "B", text: "Both give 4" },
      { label: "C", text: "Both give 3" },
      { label: "D", text: "RANK: 3, DENSE_RANK: 4" },
    ],
    correct_option: "A", success_rate: 54,
  },

  // ════════════════ TELCO — Case Studies (2) ════════════════
  {
    slug: "arpu-by-plan", title: "Case: ARPU by Plan", question_type: "case_study",
    difficulty: "Medium", industry: "Telco", category: "Joins", tags: ["arpu", "avg"],
    dataset: "telco_network",
    content_md: `**Scenario.** The pricing committee reviews ARPU (average recharge revenue per user) plan by plan before the next tariff filing.

Per plan, return \`name\`, subscriber count (\`subs\`), total recharge revenue (\`revenue\`), and \`arpu\` (revenue ÷ subs, 2 decimals), highest ARPU first.`,
    solution_sql: `SELECT p.name, COUNT(DISTINCT s.sub_id) AS subs,
       COALESCE(SUM(r.amount), 0) AS revenue,
       ROUND(COALESCE(SUM(r.amount), 0) / COUNT(DISTINCT s.sub_id), 2) AS arpu
FROM plans p
JOIN subscribers s ON s.plan_id = p.plan_id
LEFT JOIN recharges r ON r.sub_id = s.sub_id
GROUP BY p.name ORDER BY arpu DESC;`,
    hints: ["COUNT(DISTINCT sub_id) — recharges duplicate subscriber rows", "LEFT JOIN keeps plans whose subs never recharged", "ARPU = revenue / subs"], success_rate: 42,
  },
  {
    slug: "inactive-data-users", title: "Case: Paying but Barely Using", question_type: "case_study",
    difficulty: "Medium", industry: "Telco", category: "Subqueries", tags: ["avg", "comparison"],
    dataset: "telco_network",
    content_md: `**Scenario.** Retention suspects some subscribers pay for data they never use — prime downgrade-offer targets.

Return \`name\` and \`avg_daily_mb\` (average daily data, 1 decimal) of subscribers whose average is **below the overall average** across all subscriber-days, lowest first.`,
    solution_sql: `SELECT s.name, ROUND(AVG(u.data_mb), 1) AS avg_daily_mb
FROM subscribers s JOIN usage_daily u ON u.sub_id = s.sub_id
GROUP BY s.name
HAVING AVG(u.data_mb) < (SELECT AVG(data_mb) FROM usage_daily)
ORDER BY avg_daily_mb;`,
    hints: ["Overall average via a scalar subquery", "Compare per-subscriber AVG in HAVING"], success_rate: 45,
  },

  // ════════════════ TELCO — Mission: Congestion Hunt (5) ════════════════
  {
    slug: "mission-congestion-hunt", title: "Mission: The Congestion Hunt", question_type: "root",
    difficulty: "Medium", industry: "Telco", category: "Investigation", tags: ["mission", "network"],
    content_md: `**The story.** Complaint tickets about slow data tripled this week. The network team swears the towers are fine; your CTO wants proof from the usage data. Four steps: from raw consumption to naming exactly which subscribers and days drove the spike.`,
    success_rate: 47,
  },
  {
    slug: "congestion-1-daily-network-load", title: "Step 1: Daily Network Load", question_type: "code",
    difficulty: "Easy", industry: "Telco", category: "Aggregation", tags: ["group-by", "sum"],
    dataset: "telco_network", parent_slug: "mission-congestion-hunt", order_index: 0,
    content_md: `Start with the macro picture: total data consumed per \`usage_date\` (\`total_mb\`), in date order.`,
    solution_sql: `SELECT usage_date, SUM(data_mb) AS total_mb FROM usage_daily GROUP BY usage_date ORDER BY usage_date;`,
    hints: ["GROUP BY the date, SUM the megabytes", "Chronological order = ORDER BY usage_date"], success_rate: 86,
  },
  {
    slug: "congestion-2-district-load", title: "Step 2: Where the Load Lives", question_type: "code",
    difficulty: "Medium", industry: "Telco", category: "Joins", tags: ["join", "group-by"],
    dataset: "telco_network", parent_slug: "mission-congestion-hunt", order_index: 1,
    content_md: `The towers are regional — so is the truth. Return \`district\` and total data (\`total_mb\`), heaviest first.`,
    solution_sql: `SELECT s.district, SUM(u.data_mb) AS total_mb
FROM subscribers s JOIN usage_daily u ON u.sub_id = s.sub_id
GROUP BY s.district ORDER BY total_mb DESC;`,
    hints: ["District comes from subscribers", "Join then aggregate"], success_rate: 68,
  },
  {
    slug: "congestion-3-heavy-hitters", title: "Step 3: The Heavy Hitters", question_type: "code",
    difficulty: "Medium", industry: "Telco", category: "Window Functions", tags: ["window", "share"],
    dataset: "telco_network", parent_slug: "mission-congestion-hunt", order_index: 2,
    content_md: `Concentration check: per subscriber, total data and their **share of the whole network's** data (\`pct_of_network\`, 1 decimal), biggest first.`,
    solution_sql: `SELECT s.name, SUM(u.data_mb) AS total_mb,
       ROUND(100.0 * SUM(u.data_mb) / SUM(SUM(u.data_mb)) OVER (), 1) AS pct_of_network
FROM subscribers s JOIN usage_daily u ON u.sub_id = s.sub_id
GROUP BY s.name ORDER BY total_mb DESC;`,
    hints: ["SUM(SUM(...)) OVER () = grand total beside each group", "Share = 100.0 * subscriber / network"], success_rate: 44,
  },
  {
    slug: "congestion-4-spike-days", title: "Step 4: Naming the Spike", question_type: "code",
    difficulty: "Hard", industry: "Telco", category: "Window Functions", tags: ["avg-over", "anomaly"],
    dataset: "telco_network", parent_slug: "mission-congestion-hunt", order_index: 3, time_limit_secs: 1800,
    content_md: `The proof: subscriber-days that ran **at least 1.3×** that subscriber's own average. Return \`name\`, \`usage_date\`, \`data_mb\`, and their personal average (\`avg_mb\`, 1 decimal), biggest overshoot first.`,
    solution_sql: `SELECT name, usage_date, data_mb, avg_mb FROM (
  SELECT s.name, u.usage_date, u.data_mb,
         ROUND(AVG(u.data_mb) OVER (PARTITION BY u.sub_id), 1) AS avg_mb
  FROM subscribers s JOIN usage_daily u ON u.sub_id = s.sub_id
) t WHERE data_mb >= 1.3 * avg_mb
ORDER BY data_mb / avg_mb DESC;`,
    hints: ["AVG(...) OVER (PARTITION BY subscriber) puts the personal average on every row", "Filter rows ≥ 1.5× that average in an outer query"], success_rate: 30,
  },
];
