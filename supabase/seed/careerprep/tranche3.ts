import type { SeedQuestion } from "./types";

/**
 * Tranche 3 (76 Questions): completes the founding 200-Question library.
 * 38 Singles, 15 MCQs, 8 Case Studies, 3 Missions × 4 code children.
 */
export const tranche3: SeedQuestion[] = [
  // ════════════════ FINTECH — Singles (13) ════════════════
  {
    slug: "users-joined-2026", title: "The 2026 Cohort", question_type: "code",
    difficulty: "Easy", industry: "Fintech", category: "Filtering", tags: ["where", "date"],
    dataset: "fintech_wallet",
    content_md: `Growth reviews this year's signups. Return \`name\` and \`joined_at\` of users who joined in 2026, earliest first.`,
    solution_sql: `SELECT name, joined_at FROM users WHERE joined_at >= '2026-01-01' ORDER BY joined_at;`,
    hints: ["A simple date lower bound", "Earliest first = ascending order"], success_rate: 88,
  },
  {
    slug: "name-search-islam", title: "Directory Search", question_type: "code",
    difficulty: "Easy", industry: "Fintech", category: "String Functions", tags: ["like"],
    dataset: "fintech_wallet",
    content_md: `Support's directory search: return \`user_id\` and \`name\` of users whose name contains **"Islam"**, by user_id.`,
    solution_sql: `SELECT user_id, name FROM users WHERE name LIKE '%Islam%' ORDER BY user_id;`,
    hints: ["LIKE with % wildcards on both sides", "Case matters with LIKE; the data capitalises Islam"], success_rate: 84,
  },
  {
    slug: "reversed-transactions-log", title: "Reversal Audit Log", question_type: "code",
    difficulty: "Easy", industry: "Fintech", category: "Joins", tags: ["join", "where"],
    dataset: "fintech_wallet",
    content_md: `Every reversal is audited. Return \`txn_id\`, user \`name\`, \`amount\`, and \`txn_at\` of reversed transactions, newest first.`,
    solution_sql: `SELECT t.txn_id, u.name, t.amount, t.txn_at
FROM transactions t JOIN users u ON u.user_id = t.user_id
WHERE t.status = 'reversed' ORDER BY t.txn_at DESC;`,
    hints: ["Join for the name, filter status = 'reversed'", "Newest first = ORDER BY txn_at DESC"], success_rate: 80,
  },
  {
    slug: "district-user-counts", title: "Users per District", question_type: "code",
    difficulty: "Easy", industry: "Fintech", category: "Aggregation", tags: ["group-by", "count"],
    dataset: "fintech_wallet",
    content_md: `Return each \`district\` and its user count (\`users_count\`), largest first, ties alphabetical.`,
    solution_sql: `SELECT district, COUNT(*) AS users_count FROM users GROUP BY district ORDER BY users_count DESC, district;`,
    hints: ["GROUP BY district", "Two-level ORDER BY for stable ties"], success_rate: 86,
  },
  {
    slug: "weekend-transactions", title: "Weekend Transaction Volume", question_type: "code",
    difficulty: "Medium", industry: "Fintech", category: "Date Functions", tags: ["extract", "dow"],
    dataset: "fintech_wallet",
    content_md: `Do weekends behave differently? Return total successful volume (\`weekend_volume\`) for transactions on Saturdays and Sundays — one row. (June 6/7, 13/14... 2026 are weekend dates in the data.)`,
    solution_sql: `SELECT SUM(amount) AS weekend_volume
FROM transactions
WHERE status = 'success' AND EXTRACT(DOW FROM txn_at) IN (0, 6);`,
    hints: ["EXTRACT(DOW FROM ts): 0 = Sunday, 6 = Saturday", "One aggregate row — no GROUP BY"], success_rate: 55,
  },
  {
    slug: "fee-free-users", title: "Users Who Never Paid a Fee", question_type: "code",
    difficulty: "Medium", industry: "Fintech", category: "Aggregation", tags: ["having", "sum"],
    dataset: "fintech_wallet",
    content_md: `Pricing wonders who rides free. Return \`user_id\` and \`name\` of users whose successful transactions carried **zero total fees**, by user_id.`,
    solution_sql: `SELECT u.user_id, u.name
FROM users u JOIN transactions t ON t.user_id = u.user_id
WHERE t.status = 'success'
GROUP BY u.user_id, u.name
HAVING SUM(t.fee) = 0
ORDER BY u.user_id;`,
    hints: ["SUM(fee) per user", "HAVING SUM(fee) = 0 — the test is on an aggregate"], success_rate: 58,
  },
  {
    slug: "agent-vs-app-mix", title: "Agent vs App Split", question_type: "code",
    difficulty: "Medium", industry: "Fintech", category: "Conditional Aggregation", tags: ["case-when", "null"],
    dataset: "fintech_wallet",
    content_md: `One row for the channel report: count of successful **agent-assisted** transactions (\`agent_txns\`) and **app-only** transactions (\`app_txns\`).`,
    solution_sql: `SELECT
  COUNT(*) FILTER (WHERE agent_id IS NOT NULL) AS agent_txns,
  COUNT(*) FILTER (WHERE agent_id IS NULL) AS app_txns
FROM transactions WHERE status = 'success';`,
    hints: ["agent_id NULL-ness is the channel", "COUNT(*) FILTER (WHERE ...) or SUM(CASE...)"], success_rate: 60,
  },
  {
    slug: "days-since-last-txn", title: "Dormancy Snapshot", question_type: "code",
    difficulty: "Medium", industry: "Fintech", category: "Date Arithmetic", tags: ["max", "date-diff"],
    dataset: "fintech_wallet",
    content_md: `As of **2026-06-15**, how stale is each user? Return \`name\`, last transaction date (\`last_txn\`), and \`days_quiet\` (days from last_txn to 2026-06-15), most dormant first.`,
    solution_sql: `SELECT u.name, MAX(t.txn_at)::date AS last_txn,
       DATE '2026-06-15' - MAX(t.txn_at)::date AS days_quiet
FROM users u JOIN transactions t ON t.user_id = u.user_id
GROUP BY u.name ORDER BY days_quiet DESC;`,
    hints: ["MAX(txn_at) per user, cast to date", "date - date = integer days"], success_rate: 56,
  },
  {
    slug: "above-average-fees", title: "Above-Average Fee Payers", question_type: "code",
    difficulty: "Medium", industry: "Fintech", category: "Subqueries", tags: ["scalar-subquery", "having"],
    dataset: "fintech_wallet",
    content_md: `Return \`user_id\` and total fees paid (\`fees_paid\`) of users who paid **more total fees than the average user's total**, highest first.`,
    solution_sql: `SELECT user_id, SUM(fee) AS fees_paid
FROM transactions WHERE status = 'success'
GROUP BY user_id
HAVING SUM(fee) > (
  SELECT AVG(user_total) FROM (
    SELECT SUM(fee) AS user_total FROM transactions WHERE status = 'success' GROUP BY user_id
  ) t
)
ORDER BY fees_paid DESC;`,
    hints: ["Average-of-user-totals needs a nested aggregate", "Compare in HAVING against the scalar subquery"], success_rate: 44,
  },
  {
    slug: "loan-term-buckets", title: "Loan Term Buckets", question_type: "code",
    difficulty: "Medium", industry: "Fintech", category: "Conditional Aggregation", tags: ["case-when", "bucketing"],
    dataset: "fintech_microloan",
    content_md: `Bucket the loan book: \`'short'\` (≤ 3 months), \`'standard'\` (4–6), \`'long'\` (> 6). Return \`term_bucket\`, \`loans\`, and \`principal_total\`, largest principal first.`,
    solution_sql: `SELECT CASE WHEN term_months <= 3 THEN 'short'
            WHEN term_months <= 6 THEN 'standard'
            ELSE 'long' END AS term_bucket,
       COUNT(*) AS loans, SUM(principal) AS principal_total
FROM loans GROUP BY 1 ORDER BY principal_total DESC;`,
    hints: ["CASE builds the bucket label", "GROUP BY 1 groups by that expression"], success_rate: 59,
  },
  {
    slug: "biggest-single-repayment", title: "Largest Repayment per District", question_type: "code",
    difficulty: "Hard", industry: "Fintech", category: "Window Functions", tags: ["row-number", "join"],
    dataset: "fintech_microloan", time_limit_secs: 1800,
    content_md: `Per district, the single largest repayment ever received: return \`district\`, \`borrower\`, \`amount\`, and \`paid_on\`, largest amount first.`,
    solution_sql: `SELECT district, borrower, amount, paid_on FROM (
  SELECT l.district, l.borrower, r.amount, r.paid_on,
         ROW_NUMBER() OVER (PARTITION BY l.district ORDER BY r.amount DESC, r.paid_on) AS rn
  FROM loans l JOIN repayments r ON r.loan_id = l.loan_id
) t WHERE rn = 1 ORDER BY amount DESC;`,
    hints: ["Partition by district, order by amount descending", "Tie-break inside the window", "Keep rn = 1"], success_rate: 37,
  },
  {
    slug: "repayment-month-over-month", title: "Collections Month-over-Month", question_type: "code",
    difficulty: "Hard", industry: "Fintech", category: "Window Functions", tags: ["lag", "date-trunc"],
    dataset: "fintech_microloan", time_limit_secs: 1800,
    content_md: `Finance wants the trend with deltas. Per month, return \`month\`, \`collected\`, and \`vs_prev_month\` (difference from the previous month, NULL for the first), chronological.`,
    solution_sql: `SELECT month, collected, collected - LAG(collected) OVER (ORDER BY month) AS vs_prev_month
FROM (
  SELECT DATE_TRUNC('month', paid_on)::date AS month, SUM(amount) AS collected
  FROM repayments GROUP BY 1
) m ORDER BY month;`,
    hints: ["Aggregate per month first", "LAG over the month order gives the previous value"], success_rate: 35,
  },
  {
    slug: "kyc-volume-comparison", title: "KYC vs Non-KYC Volume", question_type: "code",
    difficulty: "Hard", industry: "Fintech", category: "Conditional Aggregation", tags: ["case-when", "ratio"],
    dataset: "fintech_wallet", time_limit_secs: 1800,
    content_md: `Regulators ask: how much successful volume flows through **unverified** users? Return one row: \`verified_volume\`, \`unverified_volume\`, and \`unverified_pct\` of the total (1 decimal).`,
    solution_sql: `SELECT
  SUM(CASE WHEN u.kyc_verified THEN t.amount ELSE 0 END) AS verified_volume,
  SUM(CASE WHEN NOT u.kyc_verified THEN t.amount ELSE 0 END) AS unverified_volume,
  ROUND(100.0 * SUM(CASE WHEN NOT u.kyc_verified THEN t.amount ELSE 0 END) / SUM(t.amount), 1) AS unverified_pct
FROM users u JOIN transactions t ON t.user_id = u.user_id
WHERE t.status = 'success';`,
    hints: ["Split the SUM with CASE on kyc_verified", "The percentage reuses the same conditional sums"], success_rate: 39,
  },

  // ════════════════ FINTECH — MCQs (5) ════════════════
  {
    slug: "mcq-exists-vs-in", title: "EXISTS vs IN", question_type: "mcq",
    difficulty: "Medium", industry: "Fintech", category: "Subqueries", tags: ["concept"],
    content_md: `Both \`WHERE user_id IN (SELECT ...)\` and \`WHERE EXISTS (SELECT 1 ...)\` can express "users with transactions".

Which statement is TRUE?`,
    options: [
      { label: "A", text: "EXISTS checks for the existence of matching rows and can short-circuit; IN materialises the value list" },
      { label: "B", text: "IN is always faster" },
      { label: "C", text: "EXISTS cannot use a correlated subquery" },
      { label: "D", text: "They can never return the same result" },
    ],
    correct_option: "A", success_rate: 57,
  },
  {
    slug: "mcq-round-two-args", title: "ROUND With Two Arguments", question_type: "mcq",
    difficulty: "Easy", industry: "Fintech", category: "Numeric Functions", tags: ["round"],
    content_md: `\`SELECT ROUND(123.4567, 2);\`

What comes back?`,
    options: [
      { label: "A", text: "123.46" },
      { label: "B", text: "123.45" },
      { label: "C", text: "123" },
      { label: "D", text: "120" },
    ],
    correct_option: "A", success_rate: 85,
  },
  {
    slug: "mcq-order-of-execution", title: "Logical Order of a Query", question_type: "mcq",
    difficulty: "Medium", industry: "Fintech", category: "Fundamentals", tags: ["concept"],
    content_md: `Which is the correct **logical** processing order of these clauses?`,
    options: [
      { label: "A", text: "FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY" },
      { label: "B", text: "SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY" },
      { label: "C", text: "FROM → SELECT → WHERE → ORDER BY → GROUP BY → HAVING" },
      { label: "D", text: "WHERE → FROM → SELECT → GROUP BY → HAVING → ORDER BY" },
    ],
    correct_option: "A", success_rate: 62,
  },
  {
    slug: "mcq-alias-in-where", title: "Why Can't WHERE See My Alias?", question_type: "mcq",
    difficulty: "Medium", industry: "Fintech", category: "Fundamentals", tags: ["concept", "alias"],
    content_md: `\`SELECT amount * 0.01 AS fee_est FROM transactions WHERE fee_est > 5;\` fails.

Why?`,
    options: [
      { label: "A", text: "WHERE runs before SELECT, so column aliases don't exist yet — repeat the expression or use a subquery" },
      { label: "B", text: "Aliases can't contain underscores" },
      { label: "C", text: "Multiplication isn't allowed in SELECT" },
      { label: "D", text: "fee_est needs double quotes" },
    ],
    correct_option: "A", success_rate: 58,
  },
  {
    slug: "mcq-self-join-purpose", title: "When Do You Self-Join?", question_type: "mcq",
    difficulty: "Medium", industry: "Fintech", category: "Self Joins", tags: ["concept"],
    content_md: `Detecting "a failed transaction retried by the same user within 30 minutes" joined \`transactions\` to itself.

What makes a self-join the right tool here?`,
    options: [
      { label: "A", text: "The rows being compared live in the same table — a self-join pairs each row with related rows of that table" },
      { label: "B", text: "Self-joins are required whenever timestamps are involved" },
      { label: "C", text: "It avoids needing a WHERE clause" },
      { label: "D", text: "Postgres forbids joining two different tables on time columns" },
    ],
    correct_option: "A", success_rate: 63,
  },

  // ════════════════ FINTECH — Case Studies (3) ════════════════
  {
    slug: "district-growth-report", title: "Case: District Growth One-Pager", question_type: "case_study",
    difficulty: "Medium", industry: "Fintech", category: "Joins", tags: ["group-by", "report"],
    dataset: "fintech_wallet",
    content_md: `**Scenario.** The country manager's one-pager: per district — users, successful transactions, and volume, in one table.

Return \`district\`, \`users_count\`, \`txn_count\`, and \`volume\`, by volume descending. Count every user in the district even if the counts come from joins.`,
    solution_sql: `SELECT u.district, COUNT(DISTINCT u.user_id) AS users_count,
       COUNT(t.txn_id) AS txn_count, COALESCE(SUM(t.amount), 0) AS volume
FROM users u LEFT JOIN transactions t ON t.user_id = u.user_id AND t.status = 'success'
GROUP BY u.district ORDER BY volume DESC;`,
    hints: ["LEFT JOIN with the status filter in the ON clause", "COUNT(DISTINCT user_id) — transactions duplicate users", "COALESCE the volume for silent districts"], success_rate: 46,
  },
  {
    slug: "early-payoff-candidates", title: "Case: Early Payoff Candidates", question_type: "case_study",
    difficulty: "Hard", industry: "Fintech", category: "Subqueries", tags: ["cte", "ratio"],
    dataset: "fintech_microloan", time_limit_secs: 1800,
    content_md: `**Scenario.** Marketing wants to offer early-payoff discounts to *active* borrowers who have already repaid **at least 30%** of principal — they finish loans, and they come back.

Return \`borrower\`, \`principal\`, \`repaid\`, and \`pct_done\` (1 decimal), most complete first.`,
    solution_sql: `WITH repaid AS (
  SELECT loan_id, SUM(amount) AS total FROM repayments GROUP BY loan_id
)
SELECT l.borrower, l.principal, rp.total AS repaid,
       ROUND(100.0 * rp.total / l.principal, 1) AS pct_done
FROM loans l JOIN repaid rp ON rp.loan_id = l.loan_id
WHERE l.status = 'active' AND rp.total >= 0.3 * l.principal
ORDER BY pct_done DESC;`,
    hints: ["Repayments per loan in a CTE", "The 30% test compares two columns — plain WHERE works after the join", "Active loans only"], success_rate: 33,
  },
  {
    slug: "cash-in-concentration", title: "Case: Deposit Concentration Risk", question_type: "case_study",
    difficulty: "Hard", industry: "Fintech", category: "Window Functions", tags: ["share", "window"],
    dataset: "fintech_wallet", time_limit_secs: 1800,
    content_md: `**Scenario.** Treasury's concentration rule: no single user should contribute more than 25% of total successful cash-in.

Return every user's \`name\`, \`cash_in_total\`, and \`pct_of_total\` (1 decimal), flagging the rule with \`breaches_rule\` (true/false), largest share first.`,
    solution_sql: `SELECT u.name, SUM(t.amount) AS cash_in_total,
       ROUND(100.0 * SUM(t.amount) / SUM(SUM(t.amount)) OVER (), 1) AS pct_of_total,
       (SUM(t.amount) > 0.25 * SUM(SUM(t.amount)) OVER ()) AS breaches_rule
FROM users u JOIN transactions t ON t.user_id = u.user_id
WHERE t.txn_type = 'cash_in' AND t.status = 'success'
GROUP BY u.name ORDER BY cash_in_total DESC;`,
    hints: ["Grand total beside each group: SUM(SUM(...)) OVER ()", "The flag is just a boolean expression in SELECT", "Filter to successful cash-in before grouping"], success_rate: 30,
  },

  // ════════════════ FINTECH — Mission: Launch Day (5) ════════════════
  {
    slug: "mission-launch-day", title: "Mission: Merchant Payments Launch Day", question_type: "root",
    difficulty: "Medium", industry: "Fintech", category: "Investigation", tags: ["mission", "payments"],
    content_md: `**The story.** Your MFS just launched merchant payments with a cashback splash. It's day one plus a week; the CPO walks over: "Is payment actually becoming a habit, or did we buy a spike?" Four steps through the wallet data to an honest answer.`,
    success_rate: 46,
  },
  {
    slug: "launch-1-payment-count", title: "Step 1: Raw Adoption", question_type: "code",
    difficulty: "Easy", industry: "Fintech", category: "Aggregation", tags: ["count", "where"],
    dataset: "fintech_wallet", parent_slug: "mission-launch-day", order_index: 0,
    content_md: `Baseline: one row with successful payment count (\`payments\`) and their total value (\`payment_volume\`).`,
    solution_sql: `SELECT COUNT(*) AS payments, SUM(amount) AS payment_volume
FROM transactions WHERE txn_type = 'payment' AND status = 'success';`,
    hints: ["Filter to successful payments", "Two aggregates, no GROUP BY"], success_rate: 83,
  },
  {
    slug: "launch-2-payer-profile", title: "Step 2: Who Pays?", question_type: "code",
    difficulty: "Medium", industry: "Fintech", category: "Joins", tags: ["join", "group-by"],
    dataset: "fintech_wallet", parent_slug: "mission-launch-day", order_index: 1,
    content_md: `Profile the payers by geography: per \`district\`, distinct paying users (\`payers\`) and payment volume (\`volume\`), by volume descending.`,
    solution_sql: `SELECT u.district, COUNT(DISTINCT u.user_id) AS payers, SUM(t.amount) AS volume
FROM users u JOIN transactions t ON t.user_id = u.user_id
WHERE t.txn_type = 'payment' AND t.status = 'success'
GROUP BY u.district ORDER BY volume DESC;`,
    hints: ["COUNT(DISTINCT user_id) for unique payers", "Same payment filter as step 1"], success_rate: 61,
  },
  {
    slug: "launch-3-repeat-payers", title: "Step 3: The Habit Signal", question_type: "code",
    difficulty: "Medium", industry: "Fintech", category: "Aggregation", tags: ["having"],
    dataset: "fintech_wallet", parent_slug: "mission-launch-day", order_index: 2,
    content_md: `A habit means spending from the wallet, not just topping it up. Return \`user_id\` and spend count (\`spend_count\`) of users with **2 or more** successful spend transactions (payments or send-money combined).`,
    solution_sql: `SELECT user_id, COUNT(*) AS spend_count
FROM transactions
WHERE txn_type IN ('payment','send_money') AND status = 'success'
GROUP BY user_id HAVING COUNT(*) >= 2
ORDER BY spend_count DESC;`,
    hints: ["Spend = payment + send_money via IN", "HAVING COUNT(*) >= 2"], success_rate: 66,
  },
  {
    slug: "launch-4-wallet-share", title: "Step 4: Share of Wallet", question_type: "code",
    difficulty: "Hard", industry: "Fintech", category: "Conditional Aggregation", tags: ["case-when", "ratio"],
    dataset: "fintech_wallet", parent_slug: "mission-launch-day", order_index: 3, time_limit_secs: 1800,
    content_md: `The honest answer: for each user who made any successful payment, what share of their total successful spend (payments + send_money) went to payments? Return \`user_id\`, \`payment_total\`, \`spend_total\`, and \`payment_share_pct\` (1 decimal), highest share first.`,
    solution_sql: `SELECT user_id,
       SUM(CASE WHEN txn_type = 'payment' THEN amount ELSE 0 END) AS payment_total,
       SUM(amount) AS spend_total,
       ROUND(100.0 * SUM(CASE WHEN txn_type = 'payment' THEN amount ELSE 0 END) / SUM(amount), 1) AS payment_share_pct
FROM transactions
WHERE status = 'success' AND txn_type IN ('payment','send_money')
GROUP BY user_id
HAVING SUM(CASE WHEN txn_type = 'payment' THEN amount ELSE 0 END) > 0
ORDER BY payment_share_pct DESC;`,
    hints: ["Restrict the universe to payment + send_money in WHERE", "Payment share via conditional SUM over the full SUM", "HAVING keeps actual payers"], success_rate: 32,
  },

  // ════════════════ E-COMMERCE — Singles (9) ════════════════
  {
    slug: "catalog-size-per-category", title: "Catalog Size per Category", question_type: "code",
    difficulty: "Easy", industry: "E-Commerce", category: "Aggregation", tags: ["group-by", "count"],
    dataset: "ecommerce_shop",
    content_md: `Return each product \`category\` and how many products it carries (\`products_count\`), alphabetical.`,
    solution_sql: `SELECT category, COUNT(*) AS products_count FROM products GROUP BY category ORDER BY category;`,
    hints: ["One GROUP BY over products", "Alphabetical = ORDER BY category"], success_rate: 90,
  },
  {
    slug: "orders-this-june", title: "June Order Log", question_type: "code",
    difficulty: "Easy", industry: "E-Commerce", category: "Filtering", tags: ["date"],
    dataset: "ecommerce_shop",
    content_md: `Return \`order_id\`, \`customer_id\`, and \`status\` of orders placed in June 2026, newest first.`,
    solution_sql: `SELECT order_id, customer_id, status FROM orders
WHERE order_date >= '2026-06-01' AND order_date < '2026-07-01'
ORDER BY order_date DESC;`,
    hints: ["Half-open date range for the month", "Newest first = ORDER BY order_date DESC"], success_rate: 87,
  },
  {
    slug: "expensive-line-items", title: "Big-Ticket Line Items", question_type: "code",
    difficulty: "Easy", industry: "E-Commerce", category: "Filtering", tags: ["arithmetic", "where"],
    dataset: "ecommerce_shop",
    content_md: `Return \`order_id\`, \`product_id\`, and line value (\`line_value\` = quantity × unit price) of line items worth over ৳3,000, largest first.`,
    solution_sql: `SELECT order_id, product_id, quantity * unit_price AS line_value
FROM order_items WHERE quantity * unit_price > 3000 ORDER BY line_value DESC;`,
    hints: ["Compute the product in both SELECT and WHERE (aliases aren't visible to WHERE)", "Largest first = ORDER BY the computed value DESC"], success_rate: 74,
  },
  {
    slug: "customer-lifetime-value", title: "Simple Customer Lifetime Value", question_type: "code",
    difficulty: "Medium", industry: "E-Commerce", category: "Joins", tags: ["multi-join", "sum"],
    dataset: "ecommerce_shop",
    content_md: `Return each customer \`name\` and their all-time **delivered** revenue (\`ltv\`), highest first. Customers with no delivered orders show ৳0.`,
    solution_sql: `SELECT c.name, COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS ltv
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id AND o.status = 'delivered'
LEFT JOIN order_items oi ON oi.order_id = o.order_id
GROUP BY c.name ORDER BY ltv DESC;`,
    hints: ["Keep zero-revenue customers: LEFT JOINs with the status filter in ON", "COALESCE(SUM(...), 0)"], success_rate: 52,
  },
  {
    slug: "category-mix-of-orders", title: "Categories Inside Each Order", question_type: "code",
    difficulty: "Medium", industry: "E-Commerce", category: "Joins", tags: ["count-distinct"],
    dataset: "ecommerce_shop",
    content_md: `Cross-category orders signal browsing, not searching. Return \`order_id\` and the number of **distinct categories** in it (\`categories\`), most first, ties by order_id.`,
    solution_sql: `SELECT oi.order_id, COUNT(DISTINCT p.category) AS categories
FROM order_items oi JOIN products p ON p.product_id = oi.product_id
GROUP BY oi.order_id ORDER BY categories DESC, oi.order_id;`,
    hints: ["Category comes from products", "COUNT(DISTINCT category) per order"], success_rate: 63,
  },
  {
    slug: "price-vs-sold-price", title: "Sold Below List Price?", question_type: "code",
    difficulty: "Medium", industry: "E-Commerce", category: "Joins", tags: ["comparison"],
    dataset: "ecommerce_shop",
    content_md: `Audit pricing drift: line items whose \`unit_price\` differs from the product's current list \`price\`. Return \`order_id\`, product \`name\`, \`unit_price\`, and list \`price\`. (Zero rows would mean no drift — the data has some.)`,
    solution_sql: `SELECT oi.order_id, p.name, oi.unit_price, p.price
FROM order_items oi JOIN products p ON p.product_id = oi.product_id
WHERE oi.unit_price <> p.price;`,
    hints: ["Compare the two price columns after the join", "<> is not-equals"], success_rate: 68,
  },
  {
    slug: "first-and-latest-order-dates", title: "First and Latest Order per Customer", question_type: "code",
    difficulty: "Medium", industry: "E-Commerce", category: "Aggregation", tags: ["min-max"],
    dataset: "ecommerce_shop",
    content_md: `Return each ordering customer's \`name\`, \`first_order\`, and \`latest_order\` dates, earliest first-order first.`,
    solution_sql: `SELECT c.name, MIN(o.order_date) AS first_order, MAX(o.order_date) AS latest_order
FROM customers c JOIN orders o ON o.customer_id = c.customer_id
GROUP BY c.name ORDER BY first_order;`,
    hints: ["MIN and MAX of the same column", "Group per customer"], success_rate: 76,
  },
  {
    slug: "quantity-share-per-product", title: "Each Product's Share of Units", question_type: "code",
    difficulty: "Hard", industry: "E-Commerce", category: "Window Functions", tags: ["share", "window"],
    dataset: "ecommerce_shop", time_limit_secs: 1800,
    content_md: `Across **delivered** orders, return product \`name\`, \`units\`, and \`pct_of_units\` (share of all delivered units, 1 decimal), biggest first.`,
    solution_sql: `SELECT p.name, SUM(oi.quantity) AS units,
       ROUND(100.0 * SUM(oi.quantity) / SUM(SUM(oi.quantity)) OVER (), 1) AS pct_of_units
FROM products p
JOIN order_items oi ON oi.product_id = p.product_id
JOIN orders o ON o.order_id = oi.order_id
WHERE o.status = 'delivered'
GROUP BY p.name ORDER BY units DESC;`,
    hints: ["Delivered filter first", "Grand total via SUM(SUM(...)) OVER ()"], success_rate: 38,
  },
  {
    slug: "order-value-percentile-band", title: "Quartile Bands for Order Values", question_type: "code",
    difficulty: "Hard", industry: "E-Commerce", category: "Window Functions", tags: ["ntile"],
    dataset: "ecommerce_shop", time_limit_secs: 1800,
    content_md: `Split **delivered** orders into 4 value quartiles with NTILE. Return \`order_id\`, \`order_value\`, and \`quartile\` (1 = highest values), by value descending.`,
    solution_sql: `SELECT order_id, order_value, NTILE(4) OVER (ORDER BY order_value DESC) AS quartile
FROM (
  SELECT o.order_id, SUM(oi.quantity * oi.unit_price) AS order_value
  FROM orders o JOIN order_items oi ON oi.order_id = o.order_id
  WHERE o.status = 'delivered'
  GROUP BY o.order_id
) t ORDER BY order_value DESC;`,
    hints: ["Per-order values first", "NTILE(4) over the ordered set"], success_rate: 36,
  },

  // ════════════════ E-COMMERCE — MCQs (4) ════════════════
  {
    slug: "mcq-distinct-position", title: "Where Does DISTINCT Apply?", question_type: "mcq",
    difficulty: "Easy", industry: "E-Commerce", category: "Fundamentals", tags: ["distinct"],
    content_md: `\`SELECT DISTINCT city, name FROM customers;\`

What is de-duplicated?`,
    options: [
      { label: "A", text: "Whole result rows — the (city, name) pairs" },
      { label: "B", text: "Only the city column" },
      { label: "C", text: "Only the name column" },
      { label: "D", text: "Nothing without ORDER BY" },
    ],
    correct_option: "A", success_rate: 71,
  },
  {
    slug: "mcq-coalesce-ltv", title: "Why COALESCE in LTV Reports?", question_type: "mcq",
    difficulty: "Medium", industry: "E-Commerce", category: "NULL Semantics", tags: ["coalesce", "left-join"],
    content_md: `A customer-lifetime-value query LEFT JOINs orders and computes \`SUM(quantity * unit_price)\`. Customers with no orders show **NULL** LTV.

What's the standard fix?`,
    options: [
      { label: "A", text: "COALESCE(SUM(...), 0) — turn the empty-group NULL into zero" },
      { label: "B", text: "Switch to INNER JOIN" },
      { label: "C", text: "Add WHERE quantity IS NOT NULL" },
      { label: "D", text: "Use COUNT instead of SUM" },
    ],
    correct_option: "A", success_rate: 66,
  },
  {
    slug: "mcq-except-behavior", title: "What Does EXCEPT Return?", question_type: "mcq",
    difficulty: "Medium", industry: "E-Commerce", category: "Set Operations", tags: ["except"],
    content_md: `\`SELECT product_id FROM products EXCEPT SELECT product_id FROM order_items;\`

What is this?`,
    options: [
      { label: "A", text: "Products that were never ordered — rows in the first set but not the second" },
      { label: "B", text: "Products ordered more than once" },
      { label: "C", text: "The union of both sets" },
      { label: "D", text: "A syntax error; EXCEPT needs JOIN" },
    ],
    correct_option: "A", success_rate: 64,
  },
  {
    slug: "mcq-orderby-multiple", title: "Multi-Column ORDER BY", question_type: "mcq",
    difficulty: "Easy", industry: "E-Commerce", category: "Sorting", tags: ["order-by"],
    content_md: `\`ORDER BY category ASC, price DESC\` sorts how?`,
    options: [
      { label: "A", text: "By category alphabetically; within each category, most expensive first" },
      { label: "B", text: "By price first, then category" },
      { label: "C", text: "Randomly within categories" },
      { label: "D", text: "It errors — directions must match" },
    ],
    correct_option: "A", success_rate: 83,
  },

  // ════════════════ E-COMMERCE — Case Studies (2) ════════════════
  {
    slug: "reorder-stock-signal", title: "Case: What to Restock First", question_type: "case_study",
    difficulty: "Medium", industry: "E-Commerce", category: "Joins", tags: ["group-by", "inventory"],
    dataset: "ecommerce_shop",
    content_md: `**Scenario.** The warehouse restocks weekly by demand. Rank products by units in **delivered + processing** orders (live demand), returning \`name\`, \`category\`, and \`demand_units\`, highest first.`,
    solution_sql: `SELECT p.name, p.category, SUM(oi.quantity) AS demand_units
FROM products p
JOIN order_items oi ON oi.product_id = p.product_id
JOIN orders o ON o.order_id = oi.order_id
WHERE o.status IN ('delivered','processing')
GROUP BY p.name, p.category
ORDER BY demand_units DESC;`,
    hints: ["Demand statuses via IN", "Units = SUM(quantity)"], success_rate: 55,
  },
  {
    slug: "vip-cutoff-analysis", title: "Case: Drawing the VIP Line", question_type: "case_study",
    difficulty: "Hard", industry: "E-Commerce", category: "Window Functions", tags: ["cume", "rank"],
    dataset: "ecommerce_shop", time_limit_secs: 1800,
    content_md: `**Scenario.** Loyalty wants a VIP tier for customers who drive the top of revenue. Rank ordering customers by delivered revenue and show the running cumulative share.

Return \`name\`, \`revenue\`, \`rank\`, and \`cumulative_pct\` (running share of total delivered revenue, 1 decimal), best first.`,
    solution_sql: `WITH per_customer AS (
  SELECT c.name, SUM(oi.quantity * oi.unit_price) AS revenue
  FROM customers c
  JOIN orders o ON o.customer_id = c.customer_id
  JOIN order_items oi ON oi.order_id = o.order_id
  WHERE o.status = 'delivered'
  GROUP BY c.name
)
SELECT name, revenue,
       RANK() OVER (ORDER BY revenue DESC) AS rank,
       ROUND(100.0 * SUM(revenue) OVER (ORDER BY revenue DESC) / SUM(revenue) OVER (), 1) AS cumulative_pct
FROM per_customer ORDER BY revenue DESC;`,
    hints: ["Revenue per customer in a CTE", "Running total: SUM(...) OVER (ORDER BY revenue DESC)", "Divide by the grand total window"], success_rate: 28,
  },

  // ════════════════ E-COMMERCE — Mission: Stockout Scare (5) ════════════════
  {
    slug: "mission-stockout-scare", title: "Mission: The Stockout Scare", question_type: "root",
    difficulty: "Medium", industry: "E-Commerce", category: "Investigation", tags: ["mission", "inventory"],
    content_md: `**The story.** Friday 6 pm: the ops channel erupts — "Power Banks are about to stock out and campaign traffic is still climbing." You own the numbers. Four steps to tell procurement exactly what's burning, how fast, and who's affected.`,
    success_rate: 47,
  },
  {
    slug: "stockout-1-velocity", title: "Step 1: Sales Velocity", question_type: "code",
    difficulty: "Easy", industry: "E-Commerce", category: "Aggregation", tags: ["group-by", "sum"],
    dataset: "ecommerce_shop", parent_slug: "mission-stockout-scare", order_index: 0,
    content_md: `Which products move? Return \`name\` and total units across **all non-cancelled** orders (\`units_moved\`), fastest first.`,
    solution_sql: `SELECT p.name, SUM(oi.quantity) AS units_moved
FROM products p
JOIN order_items oi ON oi.product_id = p.product_id
JOIN orders o ON o.order_id = oi.order_id
WHERE o.status <> 'cancelled'
GROUP BY p.name ORDER BY units_moved DESC;`,
    hints: ["Exclude cancelled with <>", "SUM(quantity) per product"], success_rate: 79,
  },
  {
    slug: "stockout-2-hero-buyers", title: "Step 2: Who Buys the Hero Product?", question_type: "code",
    difficulty: "Medium", industry: "E-Commerce", category: "Joins", tags: ["multi-join", "where"],
    dataset: "ecommerce_shop", parent_slug: "mission-stockout-scare", order_index: 1,
    content_md: `Zoom into the **Power Bank 20000mAh**: return each buying customer's \`name\`, \`city\`, order \`status\`, and \`quantity\`, by quantity descending.`,
    solution_sql: `SELECT c.name, c.city, o.status, oi.quantity
FROM customers c
JOIN orders o ON o.customer_id = c.customer_id
JOIN order_items oi ON oi.order_id = o.order_id
JOIN products p ON p.product_id = oi.product_id
WHERE p.name = 'Power Bank 20000mAh'
ORDER BY oi.quantity DESC;`,
    hints: ["Four tables chained by keys", "Filter on the product name"], success_rate: 62,
  },
  {
    slug: "stockout-3-city-demand", title: "Step 3: Demand by City", question_type: "code",
    difficulty: "Medium", industry: "E-Commerce", category: "Joins", tags: ["group-by"],
    dataset: "ecommerce_shop", parent_slug: "mission-stockout-scare", order_index: 2,
    content_md: `Warehouse allocation needs geography: for Electronics products (non-cancelled orders), return \`city\` and \`units\`, highest first.`,
    solution_sql: `SELECT c.city, SUM(oi.quantity) AS units
FROM customers c
JOIN orders o ON o.customer_id = c.customer_id
JOIN order_items oi ON oi.order_id = o.order_id
JOIN products p ON p.product_id = oi.product_id
WHERE p.category = 'Electronics' AND o.status <> 'cancelled'
GROUP BY c.city ORDER BY units DESC;`,
    hints: ["Same 4-table chain, category filter this time", "Group by city"], success_rate: 58,
  },
  {
    slug: "stockout-4-substitutes", title: "Step 4: The Substitute Pitch", question_type: "code",
    difficulty: "Hard", industry: "E-Commerce", category: "Subqueries", tags: ["not-in", "same-category"],
    dataset: "ecommerce_shop", parent_slug: "mission-stockout-scare", order_index: 3, time_limit_secs: 1800,
    content_md: `If the Power Bank stocks out, what do we push instead? Return other **Electronics** products with their delivered-order units (\`units_sold\`, 0 if never sold), best sellers first — excluding the Power Bank itself.`,
    solution_sql: `SELECT p.name,
       COALESCE(SUM(oi.quantity) FILTER (WHERE o.status = 'delivered'), 0) AS units_sold
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.product_id
LEFT JOIN orders o ON o.order_id = oi.order_id
WHERE p.category = 'Electronics' AND p.name <> 'Power Bank 20000mAh'
GROUP BY p.name ORDER BY units_sold DESC;`,
    hints: ["LEFT JOINs keep never-sold substitutes", "FILTER (or CASE) restricts the SUM to delivered", "Exclude the hero product in WHERE"], success_rate: 31,
  },

  // ════════════════ LOGISTICS — Singles (8) ════════════════
  {
    slug: "sylhet-routes", title: "Sylhet Route Sheet", question_type: "code",
    difficulty: "Easy", industry: "Logistics", category: "Filtering", tags: ["or", "where"],
    dataset: "logistics_courier",
    content_md: `The Sylhet hub audits its lanes. Return \`parcel_id\`, \`sender_area\`, and \`receiver_area\` of parcels touching **Zindabazar or Ambarkhana** on either end, by parcel_id.`,
    solution_sql: `SELECT parcel_id, sender_area, receiver_area FROM parcels
WHERE sender_area IN ('Zindabazar','Ambarkhana') OR receiver_area IN ('Zindabazar','Ambarkhana')
ORDER BY parcel_id;`,
    hints: ["Check both columns", "IN lists keep the OR readable"], success_rate: 78,
  },
  {
    slug: "avg-parcel-weight", title: "Average Parcel Weight by COD Type", question_type: "code",
    difficulty: "Easy", industry: "Logistics", category: "Conditional Aggregation", tags: ["case", "avg"],
    dataset: "logistics_courier",
    content_md: `Do COD parcels weigh more? Return two labelled rows — \`'cod'\` and \`'prepaid'\` (\`parcel_type\`) — each with \`avg_weight\` (2 decimals).`,
    solution_sql: `SELECT CASE WHEN cod_amount > 0 THEN 'cod' ELSE 'prepaid' END AS parcel_type,
       ROUND(AVG(weight_kg), 2) AS avg_weight
FROM parcels GROUP BY 1 ORDER BY parcel_type;`,
    hints: ["CASE creates the label, GROUP BY 1 groups on it", "ROUND(AVG(...), 2)"], success_rate: 70,
  },
  {
    slug: "june-4-manifest", title: "Pickup Manifest for 4 June", question_type: "code",
    difficulty: "Easy", industry: "Logistics", category: "Date Functions", tags: ["date", "cast"],
    dataset: "logistics_courier",
    content_md: `Print the manifest: \`delivery_id\`, \`parcel_id\`, and rider \`name\` for pickups on **4 June 2026**, in pickup order.`,
    solution_sql: `SELECT d.delivery_id, d.parcel_id, r.name
FROM deliveries d JOIN riders r ON r.rider_id = d.rider_id
WHERE d.picked_at::date = '2026-06-04'
ORDER BY d.picked_at;`,
    hints: ["Cast picked_at to ::date for a whole-day match", "Pickup order = ORDER BY picked_at"], success_rate: 75,
  },
  {
    slug: "rider-utilization", title: "Rider Utilization Snapshot", question_type: "code",
    difficulty: "Medium", industry: "Logistics", category: "Joins", tags: ["left-join", "count"],
    dataset: "logistics_courier",
    content_md: `HR asks who's idle. Return **every** rider's \`name\` and attempt count (\`attempts\`), including riders with zero, least busy first.`,
    solution_sql: `SELECT r.name, COUNT(d.delivery_id) AS attempts
FROM riders r LEFT JOIN deliveries d ON d.rider_id = r.rider_id
GROUP BY r.name ORDER BY attempts, name;`,
    hints: ["LEFT JOIN keeps idle riders", "COUNT(d.delivery_id) ignores the NULL rows"], success_rate: 64,
  },
  {
    slug: "cod-value-at-risk", title: "COD Value Still on the Road", question_type: "code",
    difficulty: "Medium", industry: "Logistics", category: "Subqueries", tags: ["exists", "cod"],
    dataset: "logistics_courier",
    content_md: `Finance's exposure number: total COD of parcels that have **no delivered attempt yet**. One row: \`cod_at_risk\`.`,
    solution_sql: `SELECT SUM(p.cod_amount) AS cod_at_risk
FROM parcels p
WHERE p.cod_amount > 0
  AND NOT EXISTS (
    SELECT 1 FROM deliveries d WHERE d.parcel_id = p.parcel_id AND d.status = 'delivered'
  );`,
    hints: ["NOT EXISTS over delivered attempts", "Only COD parcels carry risk"], success_rate: 53,
  },
  {
    slug: "weight-vs-duration", title: "Do Heavy Parcels Travel Slower?", question_type: "code",
    difficulty: "Medium", industry: "Logistics", category: "Date Arithmetic", tags: ["case", "avg"],
    dataset: "logistics_courier",
    content_md: `Compare average delivery hours for parcels **≤ 1.5 kg** vs **> 1.5 kg** (delivered runs). Return \`weight_class\` ('light'/'heavy') and \`avg_hours\` (1 decimal).`,
    solution_sql: `SELECT CASE WHEN p.weight_kg <= 1.5 THEN 'light' ELSE 'heavy' END AS weight_class,
       ROUND(AVG(EXTRACT(EPOCH FROM (d.delivered_at - d.picked_at)) / 3600)::numeric, 1) AS avg_hours
FROM parcels p JOIN deliveries d ON d.parcel_id = p.parcel_id
WHERE d.status = 'delivered'
GROUP BY 1 ORDER BY weight_class DESC;`,
    hints: ["Bucket by weight with CASE", "Hours from the EPOCH of the interval"], success_rate: 51,
  },
  {
    slug: "busiest-receiver-areas", title: "Busiest Receiver Areas", question_type: "code",
    difficulty: "Medium", industry: "Logistics", category: "Aggregation", tags: ["group-by", "limit"],
    dataset: "logistics_courier",
    content_md: `Where should the next dark store go? Return the top 3 \`receiver_area\`s by parcel count (\`parcels_in\`), most first, ties alphabetical.`,
    solution_sql: `SELECT receiver_area, COUNT(*) AS parcels_in
FROM parcels GROUP BY receiver_area
ORDER BY parcels_in DESC, receiver_area LIMIT 3;`,
    hints: ["Count per receiver_area", "Deterministic ties need a second sort key"], success_rate: 73,
  },
  {
    slug: "hub-cod-exposure", title: "COD Exposure per Hub", question_type: "code",
    difficulty: "Hard", industry: "Logistics", category: "Joins", tags: ["multi-join", "exposure"],
    dataset: "logistics_courier", time_limit_secs: 1800,
    content_md: `Which hub carries the cash risk? Sum COD of parcels whose **latest attempt** is not delivered, per the attempting rider's hub. Return hub \`city\` and \`exposure\`.`,
    solution_sql: `WITH latest AS (
  SELECT d.*, ROW_NUMBER() OVER (PARTITION BY parcel_id ORDER BY picked_at DESC) AS rn
  FROM deliveries d
)
SELECT h.city, SUM(p.cod_amount) AS exposure
FROM latest l
JOIN parcels p ON p.parcel_id = l.parcel_id
JOIN riders r ON r.rider_id = l.rider_id
JOIN hubs h ON h.hub_id = r.hub_id
WHERE l.rn = 1 AND l.status <> 'delivered' AND p.cod_amount > 0
GROUP BY h.city ORDER BY exposure DESC;`,
    hints: ["Latest attempt via ROW_NUMBER ... ORDER BY picked_at DESC", "Join up to hubs through riders", "Only COD parcels count"], success_rate: 27,
  },

  // ════════════════ LOGISTICS — MCQs (3) ════════════════
  {
    slug: "mcq-groupby-expression", title: "GROUP BY 1 — What Does It Mean?", question_type: "mcq",
    difficulty: "Easy", industry: "Logistics", category: "Aggregation", tags: ["group-by"],
    content_md: `You'll see \`GROUP BY 1\` in analyst SQL.

What does the \`1\` refer to?`,
    options: [
      { label: "A", text: "The first expression in the SELECT list" },
      { label: "B", text: "The first row of the table" },
      { label: "C", text: "The primary key" },
      { label: "D", text: "It groups everything into one group" },
    ],
    correct_option: "A", success_rate: 69,
  },
  {
    slug: "mcq-not-exists-vs-not-in-null", title: "The NOT IN NULL Trap", question_type: "mcq",
    difficulty: "Hard", industry: "Logistics", category: "NULL Semantics", tags: ["not-in", "null"],
    content_md: `\`WHERE parcel_id NOT IN (SELECT parcel_id FROM deliveries)\` silently returns **zero rows** if the subquery emits a single NULL.

Why — and what's the safe pattern?`,
    options: [
      { label: "A", text: "NOT IN with a NULL makes every comparison unknown; use NOT EXISTS instead" },
      { label: "B", text: "NOT IN sorts the list first and NULL breaks sorting; add ORDER BY" },
      { label: "C", text: "It's a Postgres bug fixed by DISTINCT" },
      { label: "D", text: "The subquery needs LIMIT" },
    ],
    correct_option: "A", success_rate: 41,
  },
  {
    slug: "mcq-count-star-vs-column", title: "Three Kinds of COUNT", question_type: "mcq",
    difficulty: "Easy", industry: "Logistics", category: "Aggregation", tags: ["count"],
    content_md: `Rank these by what they count: \`COUNT(*)\`, \`COUNT(delivered_at)\`, \`COUNT(DISTINCT rider_id)\`.`,
    options: [
      { label: "A", text: "All rows; rows where delivered_at is non-NULL; unique rider ids" },
      { label: "B", text: "They all count the same thing" },
      { label: "C", text: "Non-NULL rows; all rows; all rider rows" },
      { label: "D", text: "COUNT(*) errors on NULL columns" },
    ],
    correct_option: "A", success_rate: 77,
  },

  // ════════════════ LOGISTICS — Case Study (1) ════════════════
  {
    slug: "rider-scorecard", title: "Case: The Rider Scorecard", question_type: "case_study",
    difficulty: "Hard", industry: "Logistics", category: "Conditional Aggregation", tags: ["scorecard", "ratio"],
    dataset: "logistics_courier", time_limit_secs: 1800,
    content_md: `**Scenario.** Monthly rider reviews use one scorecard: attempts, completions, failures, and completion rate.

Per rider with any attempts, return \`name\`, \`attempts\`, \`completed\`, \`failed\`, and \`completion_pct\` (completed ÷ attempts × 100, 1 decimal), best rate first.`,
    solution_sql: `SELECT r.name, COUNT(*) AS attempts,
       COUNT(*) FILTER (WHERE d.status = 'delivered') AS completed,
       COUNT(*) FILTER (WHERE d.status = 'failed') AS failed,
       ROUND(100.0 * COUNT(*) FILTER (WHERE d.status = 'delivered') / COUNT(*), 1) AS completion_pct
FROM riders r JOIN deliveries d ON d.rider_id = r.rider_id
GROUP BY r.name ORDER BY completion_pct DESC, name;`,
    hints: ["FILTER-ed COUNTs share one GROUP BY pass", "Rate = completed / attempts with 100.0 for float math"], success_rate: 34,
  },

  // ════════════════ LOGISTICS — Mission: Peak Day (5) ════════════════
  {
    slug: "mission-peak-day", title: "Mission: Surviving Peak Day", question_type: "root",
    difficulty: "Medium", industry: "Logistics", category: "Investigation", tags: ["mission", "capacity"],
    content_md: `**The story.** The 11.11 mega-sale hits in three weeks and last year the network buckled. The COO wants a capacity read from normal-week data: where parcels flow, who carries the load, and where a surge would snap first. Four steps to the capacity memo.`,
    success_rate: 45,
  },
  {
    slug: "peak-1-flow-map", title: "Step 1: The Flow Map", question_type: "code",
    difficulty: "Easy", industry: "Logistics", category: "Aggregation", tags: ["group-by"],
    dataset: "logistics_courier", parent_slug: "mission-peak-day", order_index: 0,
    content_md: `Map the lanes: return \`sender_area\`, \`receiver_area\`, and parcel count (\`parcels\`) per lane, busiest first, ties by sender then receiver.`,
    solution_sql: `SELECT sender_area, receiver_area, COUNT(*) AS parcels
FROM parcels GROUP BY sender_area, receiver_area
ORDER BY parcels DESC, sender_area, receiver_area;`,
    hints: ["Group by both endpoints", "Stable ordering with extra sort keys"], success_rate: 80,
  },
  {
    slug: "peak-2-daily-throughput", title: "Step 2: Daily Throughput", question_type: "code",
    difficulty: "Medium", industry: "Logistics", category: "Date Functions", tags: ["date", "group-by"],
    dataset: "logistics_courier", parent_slug: "mission-peak-day", order_index: 1,
    content_md: `Capacity is a daily number. Return each pickup day (\`day\`) with attempts started (\`pickups\`) and completions (\`delivered\`), chronological.`,
    solution_sql: `SELECT picked_at::date AS day, COUNT(*) AS pickups,
       COUNT(*) FILTER (WHERE status = 'delivered') AS delivered
FROM deliveries GROUP BY picked_at::date ORDER BY day;`,
    hints: ["Group by the pickup date", "Completions via a FILTERed COUNT"], success_rate: 57,
  },
  {
    slug: "peak-3-rider-load-balance", title: "Step 3: Load Balance Check", question_type: "code",
    difficulty: "Medium", industry: "Logistics", category: "Window Functions", tags: ["share"],
    dataset: "logistics_courier", parent_slug: "mission-peak-day", order_index: 2,
    content_md: `Is work spread evenly? Per rider: \`name\`, \`attempts\`, and \`pct_of_attempts\` across the whole network (1 decimal), heaviest first.`,
    solution_sql: `SELECT r.name, COUNT(*) AS attempts,
       ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS pct_of_attempts
FROM riders r JOIN deliveries d ON d.rider_id = r.rider_id
GROUP BY r.name ORDER BY attempts DESC;`,
    hints: ["SUM(COUNT(*)) OVER () is the network total", "Share = rider / network"], success_rate: 48,
  },
  {
    slug: "peak-4-fragile-lanes", title: "Step 4: The Fragile Lanes", question_type: "code",
    difficulty: "Hard", industry: "Logistics", category: "Joins", tags: ["failure-rate", "group-by"],
    dataset: "logistics_courier", parent_slug: "mission-peak-day", order_index: 3, time_limit_secs: 1800,
    content_md: `Finale: lanes that already show cracks. Per receiver_area with any attempts, return \`receiver_area\`, \`attempts\`, \`non_delivered\` (failed or still in transit), and \`risk_pct\` (1 decimal), riskiest first.`,
    solution_sql: `SELECT p.receiver_area, COUNT(*) AS attempts,
       COUNT(*) FILTER (WHERE d.status <> 'delivered') AS non_delivered,
       ROUND(100.0 * COUNT(*) FILTER (WHERE d.status <> 'delivered') / COUNT(*), 1) AS risk_pct
FROM parcels p JOIN deliveries d ON d.parcel_id = p.parcel_id
GROUP BY p.receiver_area
HAVING COUNT(*) FILTER (WHERE d.status <> 'delivered') > 0
ORDER BY risk_pct DESC;`,
    hints: ["Non-delivered = status <> 'delivered' on attempts", "HAVING keeps only lanes with cracks", "Rate needs 100.0 float math"], success_rate: 29,
  },

  // ════════════════ TELCO — Singles (8) ════════════════
  {
    slug: "plan-price-list", title: "The Tariff Sheet", question_type: "code",
    difficulty: "Easy", industry: "Telco", category: "Sorting", tags: ["order-by"],
    dataset: "telco_network",
    content_md: `Return every plan's \`name\`, \`monthly_fee\`, and \`data_gb\`, cheapest first.`,
    solution_sql: `SELECT name, monthly_fee, data_gb FROM plans ORDER BY monthly_fee;`,
    hints: ["No filter — the whole tariff sheet, sorted", "Cheapest first = ORDER BY monthly_fee"], success_rate: 93,
  },
  {
    slug: "taka-per-gb", title: "Taka per GB by Plan", question_type: "code",
    difficulty: "Easy", industry: "Telco", category: "Numeric Functions", tags: ["arithmetic", "round"],
    dataset: "telco_network",
    content_md: `Value-for-money check: per plan, \`name\` and \`taka_per_gb\` (monthly fee ÷ allowance GB, 2 decimals), best value first.`,
    solution_sql: `SELECT name, ROUND(monthly_fee / data_gb, 2) AS taka_per_gb
FROM plans ORDER BY taka_per_gb;`,
    hints: ["Simple division per row", "Best value = smallest ratio"], success_rate: 82,
  },
  {
    slug: "chattogram-subscribers", title: "Chattogram Base", question_type: "code",
    difficulty: "Easy", industry: "Telco", category: "Joins", tags: ["join", "where"],
    dataset: "telco_network",
    content_md: `Return Chattogram subscribers with their plan: \`name\`, plan name (\`plan_name\`), \`activated_on\`, by activation date.`,
    solution_sql: `SELECT s.name, p.name AS plan_name, s.activated_on
FROM subscribers s JOIN plans p ON p.plan_id = s.plan_id
WHERE s.district = 'Chattogram' ORDER BY s.activated_on;`,
    hints: ["Alias the second name column", "District filter on subscribers"], success_rate: 85,
  },
  {
    slug: "recharge-frequency", title: "Recharge Frequency", question_type: "code",
    difficulty: "Medium", industry: "Telco", category: "Joins", tags: ["left-join", "count"],
    dataset: "telco_network",
    content_md: `Per subscriber — **including those who never recharged** — return \`name\` and \`recharge_count\`, most frequent first, ties by name.`,
    solution_sql: `SELECT s.name, COUNT(r.recharge_id) AS recharge_count
FROM subscribers s LEFT JOIN recharges r ON r.sub_id = s.sub_id
GROUP BY s.name ORDER BY recharge_count DESC, name;`,
    hints: ["LEFT JOIN + COUNT(column) counts only real recharges", "Ties broken by name in ORDER BY"], success_rate: 71,
  },
  {
    slug: "zero-voice-days", title: "Data-Only Days", question_type: "code",
    difficulty: "Medium", industry: "Telco", category: "Filtering", tags: ["comparison"],
    dataset: "telco_network",
    content_md: `Voice is dying — prove it. Return \`name\`, \`usage_date\`, and \`data_mb\` for subscriber-days with **under 10 voice minutes**, heaviest data first.`,
    solution_sql: `SELECT s.name, u.usage_date, u.data_mb
FROM subscribers s JOIN usage_daily u ON u.sub_id = s.sub_id
WHERE u.voice_min < 10 ORDER BY u.data_mb DESC;`,
    hints: ["Row-level filter, no aggregation needed", "Heaviest data first = ORDER BY data_mb DESC"], success_rate: 74,
  },
  {
    slug: "district-arpu-gap", title: "District Recharge Gap", question_type: "code",
    difficulty: "Medium", industry: "Telco", category: "Aggregation", tags: ["group-by", "avg"],
    dataset: "telco_network",
    content_md: `Where does recharge money come from? Per subscriber \`district\`: \`total_recharge\` and \`avg_recharge\` per top-up (2 decimals), highest total first.`,
    solution_sql: `SELECT s.district, SUM(r.amount) AS total_recharge, ROUND(AVG(r.amount), 2) AS avg_recharge
FROM subscribers s JOIN recharges r ON r.sub_id = s.sub_id
GROUP BY s.district ORDER BY total_recharge DESC;`,
    hints: ["Join recharges through subscribers for the district", "SUM and AVG in one pass"], success_rate: 66,
  },
  {
    slug: "consecutive-usage-growth", title: "Two Days of Growth in a Row", question_type: "code",
    difficulty: "Hard", industry: "Telco", category: "Window Functions", tags: ["lag", "trend"],
    dataset: "telco_network", time_limit_secs: 1800,
    content_md: `Find subscriber-days where data usage grew versus the **previous day** for that subscriber. Return \`name\`, \`usage_date\`, \`data_mb\`, and \`prev_mb\`, largest jump first.`,
    solution_sql: `SELECT name, usage_date, data_mb, prev_mb FROM (
  SELECT s.name, u.usage_date, u.data_mb,
         LAG(u.data_mb) OVER (PARTITION BY u.sub_id ORDER BY u.usage_date) AS prev_mb
  FROM subscribers s JOIN usage_daily u ON u.sub_id = s.sub_id
) t WHERE prev_mb IS NOT NULL AND data_mb > prev_mb
ORDER BY data_mb - prev_mb DESC;`,
    hints: ["LAG per subscriber ordered by date", "Growth = current > previous", "First day per subscriber has NULL prev"], success_rate: 36,
  },
  {
    slug: "plan-upgrade-shortlist", title: "The Upgrade Shortlist", question_type: "code",
    difficulty: "Hard", industry: "Telco", category: "Subqueries", tags: ["cte", "comparison"],
    dataset: "telco_network", time_limit_secs: 1800,
    content_md: `Sales wants subscribers whose average daily data, projected to 30 days, **exceeds their plan's allowance**. Return \`name\`, plan \`allowance_gb\`, and \`projected_gb\` (30 × daily average ÷ 1024, 1 decimal), biggest overshoot first.`,
    solution_sql: `WITH daily AS (
  SELECT sub_id, AVG(data_mb) AS avg_mb FROM usage_daily GROUP BY sub_id
)
SELECT s.name, p.data_gb AS allowance_gb,
       ROUND(30 * d.avg_mb / 1024.0, 1) AS projected_gb
FROM subscribers s
JOIN plans p ON p.plan_id = s.plan_id
JOIN daily d ON d.sub_id = s.sub_id
WHERE 30 * d.avg_mb / 1024.0 > p.data_gb
ORDER BY 30 * d.avg_mb / 1024.0 - p.data_gb DESC;`,
    hints: ["Daily average per subscriber in a CTE", "Project: 30 × avg ÷ 1024 GB", "Compare against the plan allowance in WHERE"], success_rate: 30,
  },

  // ════════════════ TELCO — MCQs (3) ════════════════
  {
    slug: "mcq-having-without-groupby", title: "HAVING Without GROUP BY", question_type: "mcq",
    difficulty: "Hard", industry: "Telco", category: "Aggregation", tags: ["having"],
    content_md: `Is \`SELECT SUM(amount) FROM recharges HAVING SUM(amount) > 1000;\` valid SQL?`,
    options: [
      { label: "A", text: "Yes — the whole table is one implicit group, and HAVING filters that group" },
      { label: "B", text: "No — HAVING always requires GROUP BY" },
      { label: "C", text: "Only in MySQL, not Postgres" },
      { label: "D", text: "Yes, but it behaves exactly like WHERE" },
    ],
    correct_option: "A", success_rate: 43,
  },
  {
    slug: "mcq-integer-division", title: "The Integer Division Trap", question_type: "mcq",
    difficulty: "Medium", industry: "Telco", category: "Numeric Functions", tags: ["division"],
    content_md: `\`data_mb\` is an INT. A teammate computes GB with \`SUM(data_mb) / 1024\` and the decimals vanish.

What happened, and the fix?`,
    options: [
      { label: "A", text: "Integer ÷ integer truncates in Postgres; divide by 1024.0 (or cast) to keep decimals" },
      { label: "B", text: "SUM always rounds; use TOTAL instead" },
      { label: "C", text: "The column needs an index" },
      { label: "D", text: "GB conversion requires the pg_units extension" },
    ],
    correct_option: "A", success_rate: 59,
  },
  {
    slug: "mcq-view-of-latest-row", title: "Latest Row per Group — Idiom Check", question_type: "mcq",
    difficulty: "Medium", industry: "Telco", category: "Window Functions", tags: ["concept", "row-number"],
    content_md: `"Latest recharge per subscriber" — which is the standard window idiom?`,
    options: [
      { label: "A", text: "ROW_NUMBER() OVER (PARTITION BY sub_id ORDER BY recharged_at DESC), then keep rn = 1" },
      { label: "B", text: "MAX(recharged_at) alone, selecting all other columns freely" },
      { label: "C", text: "ORDER BY recharged_at DESC LIMIT 1 (one row for the whole table is fine)" },
      { label: "D", text: "DISTINCT sub_id with no ordering" },
    ],
    correct_option: "A", success_rate: 56,
  },

  // ════════════════ TELCO — Case Studies (2) ════════════════
  {
    slug: "recharge-behavior-segments", title: "Case: Recharge Behaviour Segments", question_type: "case_study",
    difficulty: "Medium", industry: "Telco", category: "Conditional Aggregation", tags: ["bucketing", "segments"],
    dataset: "telco_network",
    content_md: `**Scenario.** CVM segments the base by top-up style: \`'big_ticket'\` (average recharge ≥ ৳300), \`'regular'\` (৳150–299), \`'micro'\` (< ৳150).

Per recharging subscriber: \`name\`, \`avg_recharge\` (2 decimals), and \`segment\`, largest average first.`,
    solution_sql: `SELECT s.name, ROUND(AVG(r.amount), 2) AS avg_recharge,
       CASE WHEN AVG(r.amount) >= 300 THEN 'big_ticket'
            WHEN AVG(r.amount) >= 150 THEN 'regular'
            ELSE 'micro' END AS segment
FROM subscribers s JOIN recharges r ON r.sub_id = s.sub_id
GROUP BY s.name ORDER BY avg_recharge DESC;`,
    hints: ["Segment on the AVG aggregate with CASE", "The CASE can reference AVG(...) directly in SELECT"], success_rate: 52,
  },
  {
    slug: "quiet-then-gone", title: "Case: Quiet Before the Churn", question_type: "case_study",
    difficulty: "Hard", industry: "Telco", category: "Subqueries", tags: ["anti-join", "date"],
    dataset: "telco_network", time_limit_secs: 1800,
    content_md: `**Scenario.** Churn theory: subscribers go quiet on recharges *after* the first week of June while still burning data.

Return \`name\` and total June-recorded data (\`data_mb_total\`) of subscribers with **no recharge after 5 June 2026**, heaviest user first.`,
    solution_sql: `SELECT s.name, SUM(u.data_mb) AS data_mb_total
FROM subscribers s JOIN usage_daily u ON u.sub_id = s.sub_id
WHERE NOT EXISTS (
  SELECT 1 FROM recharges r
  WHERE r.sub_id = s.sub_id AND r.recharged_at > '2026-06-05'
)
GROUP BY s.name ORDER BY data_mb_total DESC;`,
    hints: ["NOT EXISTS with the date cutoff inside", "Still join usage for the data total"], success_rate: 35,
  },
];
