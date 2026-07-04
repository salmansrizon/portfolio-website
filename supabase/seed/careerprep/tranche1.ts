import type { SeedQuestion } from "./types";

/**
 * Tranche 1 (~50 Questions): founding library.
 * 25 Singles, 10 MCQs, 5 Case Studies, 2 Missions × 4 code children.
 */
export const tranche1: SeedQuestion[] = [
  // ════════════════ FINTECH — Singles ════════════════
  {
    slug: "verified-wallet-users",
    title: "List KYC-Verified Wallet Users",
    question_type: "code",
    difficulty: "Easy",
    industry: "Fintech",
    category: "Filtering",
    tags: ["select", "where"],
    dataset: "fintech_wallet",
    content_md: `Compliance needs a list of all KYC-verified wallet users.

Return \`user_id\`, \`name\`, and \`district\` of every user whose KYC is verified, ordered by \`user_id\`.`,
    solution_sql: `SELECT user_id, name, district FROM users WHERE kyc_verified = true ORDER BY user_id;`,
    hints: ["kyc_verified is a boolean column", "Filter with WHERE, then ORDER BY user_id"],
    success_rate: 82,
  },
  {
    slug: "large-successful-transactions",
    title: "Large Successful Transactions",
    question_type: "code",
    difficulty: "Easy",
    industry: "Fintech",
    category: "Filtering",
    tags: ["where", "and"],
    dataset: "fintech_wallet",
    content_md: `The risk team monitors big movements. Return \`txn_id\`, \`user_id\`, \`txn_type\`, and \`amount\` for every **successful** transaction of more than ৳5,000, newest first.`,
    solution_sql: `SELECT txn_id, user_id, txn_type, amount FROM transactions WHERE status = 'success' AND amount > 5000 ORDER BY txn_at DESC;`,
    hints: ["Combine two conditions with AND", "Newest first means ORDER BY txn_at DESC"],
    success_rate: 78,
  },
  {
    slug: "transactions-by-type",
    title: "Transaction Mix by Type",
    question_type: "code",
    difficulty: "Easy",
    industry: "Fintech",
    category: "Aggregation",
    tags: ["group-by", "count"],
    dataset: "fintech_wallet",
    content_md: `Product wants the transaction mix. For each \`txn_type\`, return the type and the number of transactions (\`txn_count\`), highest count first.`,
    solution_sql: `SELECT txn_type, COUNT(*) AS txn_count FROM transactions GROUP BY txn_type ORDER BY txn_count DESC;`,
    hints: ["GROUP BY txn_type", "COUNT(*) counts rows per group"],
    success_rate: 75,
  },
  {
    slug: "agent-cash-out-volume",
    title: "Cash-Out Volume per Agent",
    question_type: "code",
    difficulty: "Medium",
    industry: "Fintech",
    category: "Joins",
    tags: ["join", "group-by", "sum"],
    dataset: "fintech_wallet",
    content_md: `Agent operations ranks agent points by the cash they pay out.

For each agent, return \`shop_name\`, \`district\`, and total **successful** \`cash_out\` amount as \`total_cash_out\`, highest first. Only include agents that have at least one successful cash-out.`,
    solution_sql: `SELECT a.shop_name, a.district, SUM(t.amount) AS total_cash_out
FROM agents a
JOIN transactions t ON t.agent_id = a.agent_id
WHERE t.txn_type = 'cash_out' AND t.status = 'success'
GROUP BY a.shop_name, a.district
ORDER BY total_cash_out DESC;`,
    hints: ["JOIN transactions to agents on agent_id", "Filter type and status in WHERE before grouping", "SUM(amount) per agent"],
    success_rate: 61,
  },
  {
    slug: "daily-transaction-volume",
    title: "Daily Transaction Volume (First Week of June)",
    question_type: "code",
    difficulty: "Medium",
    industry: "Fintech",
    category: "Aggregation",
    tags: ["date", "group-by"],
    dataset: "fintech_wallet",
    content_md: `Finance tracks daily volume. For 1–7 June 2026, return each day (\`txn_date\`) and the total amount of **successful** transactions (\`daily_volume\`), ordered by day.`,
    solution_sql: `SELECT txn_at::date AS txn_date, SUM(amount) AS daily_volume
FROM transactions
WHERE status = 'success' AND txn_at >= '2026-06-01' AND txn_at < '2026-06-08'
GROUP BY txn_at::date
ORDER BY txn_date;`,
    hints: ["Cast the timestamp to a date with ::date", "Bound the range with >= and <", "GROUP BY the casted date"],
    success_rate: 58,
  },
  {
    slug: "users-with-clean-history",
    title: "Users with a Clean Transaction History",
    question_type: "code",
    difficulty: "Medium",
    industry: "Fintech",
    category: "Subqueries",
    tags: ["not-exists", "anti-join"],
    dataset: "fintech_wallet",
    content_md: `Support wants users who have **never** had a failed or reversed transaction.

Return \`user_id\` and \`name\` of those users, ordered by \`user_id\`.`,
    solution_sql: `SELECT u.user_id, u.name
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM transactions t
  WHERE t.user_id = u.user_id AND t.status IN ('failed','reversed')
)
ORDER BY u.user_id;`,
    hints: ["Think anti-join: users with no matching bad transaction", "NOT EXISTS with a correlated subquery", "status IN ('failed','reversed')"],
    success_rate: 49,
  },
  {
    slug: "top-payers",
    title: "Top 3 Users by Payment Spend",
    question_type: "code",
    difficulty: "Medium",
    industry: "Fintech",
    category: "Aggregation",
    tags: ["group-by", "limit", "join"],
    dataset: "fintech_wallet",
    content_md: `Merchant payments is the growth bet. Return the top 3 users by total successful \`payment\` amount: \`name\` and \`total_paid\`, highest first.`,
    solution_sql: `SELECT u.name, SUM(t.amount) AS total_paid
FROM users u
JOIN transactions t ON t.user_id = u.user_id
WHERE t.txn_type = 'payment' AND t.status = 'success'
GROUP BY u.name
ORDER BY total_paid DESC
LIMIT 3;`,
    hints: ["Join, filter to successful payments, group by user", "ORDER BY ... DESC LIMIT 3"],
    success_rate: 56,
  },
  {
    slug: "largest-transaction-per-user",
    title: "Each User's Largest Transaction",
    question_type: "code",
    difficulty: "Hard",
    industry: "Fintech",
    category: "Window Functions",
    tags: ["row-number", "partition"],
    dataset: "fintech_wallet",
    time_limit_secs: 1800,
    content_md: `For every user who has at least one successful transaction, return \`name\`, \`txn_type\`, and \`amount\` of their **single largest** successful transaction. Break amount ties by earliest \`txn_at\`. Order by \`name\`.`,
    solution_sql: `SELECT name, txn_type, amount FROM (
  SELECT u.name, t.txn_type, t.amount,
         ROW_NUMBER() OVER (PARTITION BY u.user_id ORDER BY t.amount DESC, t.txn_at ASC) AS rn
  FROM users u
  JOIN transactions t ON t.user_id = u.user_id
  WHERE t.status = 'success'
) ranked
WHERE rn = 1
ORDER BY name;`,
    hints: ["ROW_NUMBER() OVER (PARTITION BY user ORDER BY amount DESC)", "Wrap in a subquery and keep rn = 1", "Tie-break inside the window's ORDER BY"],
    success_rate: 38,
  },
  {
    slug: "running-cash-in-volume",
    title: "Running Cash-In Volume",
    question_type: "code",
    difficulty: "Hard",
    industry: "Fintech",
    category: "Window Functions",
    tags: ["window", "running-total"],
    dataset: "fintech_wallet",
    time_limit_secs: 1800,
    content_md: `Treasury watches liquidity build up. For successful \`cash_in\` transactions, return each day (\`txn_date\`), that day's total (\`day_total\`), and the running cumulative total (\`running_total\`) ordered by day.`,
    solution_sql: `SELECT txn_date, day_total, SUM(day_total) OVER (ORDER BY txn_date) AS running_total
FROM (
  SELECT txn_at::date AS txn_date, SUM(amount) AS day_total
  FROM transactions
  WHERE txn_type = 'cash_in' AND status = 'success'
  GROUP BY txn_at::date
) d
ORDER BY txn_date;`,
    hints: ["First aggregate per day in a subquery", "SUM(...) OVER (ORDER BY day) gives a running total"],
    success_rate: 34,
  },

  // ════════════════ FINTECH — MCQs ════════════════
  {
    slug: "mcq-left-join-semantics",
    title: "Which JOIN Keeps All Left Rows?",
    question_type: "mcq",
    difficulty: "Easy",
    industry: "Fintech",
    category: "Joins",
    tags: ["concept"],
    content_md: `Your query must list **every wallet user**, with their agent transactions where they exist — users without any agent transaction must still appear.

Which join does this?`,
    options: [
      { label: "A", text: "INNER JOIN" },
      { label: "B", text: "LEFT JOIN" },
      { label: "C", text: "RIGHT JOIN" },
      { label: "D", text: "CROSS JOIN" },
    ],
    correct_option: "B",
    success_rate: 80,
  },
  {
    slug: "mcq-count-nullable-column",
    title: "COUNT(*) vs COUNT(agent_id)",
    question_type: "mcq",
    difficulty: "Easy",
    industry: "Fintech",
    category: "Aggregation",
    tags: ["count", "null"],
    dataset: "fintech_wallet",
    content_md: `The \`transactions\` table has 24 rows; 14 of them have a non-NULL \`agent_id\` (agent-assisted), the other 10 are app-only (\`agent_id IS NULL\`).

What does this return?

\`\`\`sql
SELECT COUNT(*), COUNT(agent_id) FROM transactions;
\`\`\``,
    options: [
      { label: "A", text: "24 and 24" },
      { label: "B", text: "24 and 10" },
      { label: "C", text: "24 and 14" },
      { label: "D", text: "14 and 14" },
    ],
    correct_option: "C",
    success_rate: 66,
  },
  {
    slug: "mcq-null-equality",
    title: "What Does NULL = NULL Evaluate To?",
    question_type: "mcq",
    difficulty: "Medium",
    industry: "Fintech",
    category: "NULL Semantics",
    tags: ["concept", "null"],
    content_md: `A teammate filters app-only transactions with \`WHERE agent_id = NULL\` and gets zero rows even though NULLs exist.

In SQL, what does the comparison \`NULL = NULL\` evaluate to?`,
    options: [
      { label: "A", text: "TRUE" },
      { label: "B", text: "FALSE" },
      { label: "C", text: "NULL (unknown) — which is why IS NULL must be used" },
      { label: "D", text: "It raises an error" },
    ],
    correct_option: "C",
    success_rate: 57,
  },
  {
    slug: "mcq-cash-out-sum",
    title: "Predict the Cash-Out Total",
    question_type: "mcq",
    difficulty: "Medium",
    industry: "Fintech",
    category: "Aggregation",
    tags: ["sum", "where"],
    dataset: "fintech_wallet",
    content_md: `Successful cash-outs in the dataset are: ৳3,000, ৳7,000, ৳2,000, ৳2,500 and ৳5,000 (one cash-out of ৳5,000 failed and was retried).

What does this return?

\`\`\`sql
SELECT SUM(amount) FROM transactions
WHERE txn_type = 'cash_out' AND status = 'success';
\`\`\``,
    options: [
      { label: "A", text: "24500" },
      { label: "B", text: "19500" },
      { label: "C", text: "14500" },
      { label: "D", text: "22000" },
    ],
    correct_option: "B",
    success_rate: 62,
  },

  // ════════════════ FINTECH — Case Studies ════════════════
  {
    slug: "duplicate-send-money-attempts",
    title: "Case: Duplicate Send-Money Attempts",
    question_type: "case_study",
    difficulty: "Medium",
    industry: "Fintech",
    category: "Aggregation",
    tags: ["group-by", "having", "fraud"],
    dataset: "fintech_wallet",
    content_md: `**Scenario.** Customer support at an MFS keeps hearing "I sent money twice by mistake." Ops wants a daily duplicate report.

Find user/amount/day combinations with **more than one** \`send_money\` attempt (any status). Return \`user_id\`, the amount, the day (\`txn_date\`), and the attempt count.`,
    solution_sql: `SELECT user_id, amount, txn_at::date AS txn_date, COUNT(*) AS attempts
FROM transactions
WHERE txn_type = 'send_money'
GROUP BY user_id, amount, txn_at::date
HAVING COUNT(*) > 1;`,
    hints: ["Group by user, amount and day together", "HAVING COUNT(*) > 1 keeps only duplicates", "Any status — don't filter on status"],
    success_rate: 47,
  },
  {
    slug: "agent-settlement-report",
    title: "Case: Agent Settlement Report",
    question_type: "case_study",
    difficulty: "Hard",
    industry: "Fintech",
    category: "Conditional Aggregation",
    tags: ["case-when", "group-by"],
    dataset: "fintech_wallet",
    time_limit_secs: 1800,
    content_md: `**Scenario.** Every evening, finance settles cash with agent points: cash-in raises the agent's e-money balance, cash-out lowers it.

For each agent with successful activity, return \`shop_name\`, total successful cash-in (\`cash_in_total\`), total successful cash-out (\`cash_out_total\`), and \`net_float\` = cash_in − cash_out. Order by \`net_float\` descending.`,
    solution_sql: `SELECT a.shop_name,
       SUM(CASE WHEN t.txn_type = 'cash_in'  THEN t.amount ELSE 0 END) AS cash_in_total,
       SUM(CASE WHEN t.txn_type = 'cash_out' THEN t.amount ELSE 0 END) AS cash_out_total,
       SUM(CASE WHEN t.txn_type = 'cash_in'  THEN t.amount ELSE 0 END)
     - SUM(CASE WHEN t.txn_type = 'cash_out' THEN t.amount ELSE 0 END) AS net_float
FROM agents a
JOIN transactions t ON t.agent_id = a.agent_id
WHERE t.status = 'success'
GROUP BY a.shop_name
ORDER BY net_float DESC;`,
    hints: ["One row per agent means one GROUP BY with conditional SUMs", "SUM(CASE WHEN type='cash_in' THEN amount ELSE 0 END)", "Net float is the difference of the two conditional sums"],
    success_rate: 36,
  },

  // ════════════════ FINTECH — Mission: Fraud Week ════════════════
  {
    slug: "mission-fraud-week",
    title: "Mission: Fraud Week at an MFS",
    question_type: "root",
    difficulty: "Medium",
    industry: "Fintech",
    category: "Investigation",
    tags: ["mission", "fraud"],
    content_md: `**The story.** Monday morning, the risk dashboard at your MFS lights up: failed transactions spiked over the weekend. You're the analyst on call. Over the next four steps you'll work the same wallet dataset like a real investigation — from a first headcount of the damage to naming the accounts that need a manual review.

Complete the steps in order; each one builds on what the previous step told you.`,
    success_rate: 45,
  },
  {
    slug: "fraud-week-1-damage-count",
    title: "Day 1: Count the Damage",
    question_type: "code",
    difficulty: "Easy",
    industry: "Fintech",
    category: "Aggregation",
    tags: ["group-by", "having"],
    dataset: "fintech_wallet",
    parent_slug: "mission-fraud-week",
    order_index: 0,
    content_md: `First, a headcount. For every user with at least one failed or reversed transaction, return \`user_id\` and the number of such transactions (\`bad_txns\`), worst first.`,
    solution_sql: `SELECT user_id, COUNT(*) AS bad_txns
FROM transactions
WHERE status IN ('failed','reversed')
GROUP BY user_id
ORDER BY bad_txns DESC, user_id;`,
    hints: ["Filter to the two bad statuses first", "GROUP BY user_id and COUNT(*)"],
    success_rate: 70,
  },
  {
    slug: "fraud-week-2-retry-pairs",
    title: "Day 2: Find the Retry Pairs",
    question_type: "code",
    difficulty: "Medium",
    industry: "Fintech",
    category: "Self Joins",
    tags: ["self-join", "time-window"],
    dataset: "fintech_wallet",
    parent_slug: "mission-fraud-week",
    order_index: 1,
    content_md: `Day 1 showed the failures. Now check which of them were **retried and succeeded**: find pairs where the same user re-attempted the same type and amount within 30 minutes of a failure and it succeeded.

Return the failed \`txn_id\` (\`failed_txn\`), the successful \`txn_id\` (\`retry_txn\`), \`user_id\`, and the amount.`,
    solution_sql: `SELECT f.txn_id AS failed_txn, s.txn_id AS retry_txn, f.user_id, f.amount
FROM transactions f
JOIN transactions s
  ON s.user_id = f.user_id
 AND s.txn_type = f.txn_type
 AND s.amount = f.amount
 AND s.status = 'success'
 AND s.txn_at > f.txn_at
 AND s.txn_at <= f.txn_at + INTERVAL '30 minutes'
WHERE f.status = 'failed';`,
    hints: ["Join transactions to itself on user, type and amount", "The retry happens after the failure: s.txn_at > f.txn_at", "Bound the window with an INTERVAL"],
    success_rate: 41,
  },
  {
    slug: "fraud-week-3-district-exposure",
    title: "Day 3: District Exposure",
    question_type: "code",
    difficulty: "Medium",
    industry: "Fintech",
    category: "Joins",
    tags: ["join", "group-by"],
    dataset: "fintech_wallet",
    parent_slug: "mission-fraud-week",
    order_index: 2,
    content_md: `Leadership asks: *where* is this happening? Sum the amount of failed and reversed transactions per user district.

Return \`district\` and \`exposed_amount\`, highest first.`,
    solution_sql: `SELECT u.district, SUM(t.amount) AS exposed_amount
FROM users u
JOIN transactions t ON t.user_id = u.user_id
WHERE t.status IN ('failed','reversed')
GROUP BY u.district
ORDER BY exposed_amount DESC;`,
    hints: ["The district lives on users — join through user_id", "Same bad-status filter as Day 1, then GROUP BY district"],
    success_rate: 55,
  },
  {
    slug: "fraud-week-4-review-list",
    title: "Day 4: The Manual Review List",
    question_type: "code",
    difficulty: "Hard",
    industry: "Fintech",
    category: "Conditional Aggregation",
    tags: ["case-when", "having", "ratio"],
    dataset: "fintech_wallet",
    parent_slug: "mission-fraud-week",
    order_index: 3,
    time_limit_secs: 1800,
    content_md: `Final step: cash-out-heavy wallets are the classic mule pattern. Flag users whose total successful cash-out exceeds **50%** of their total successful cash-in.

Return \`user_id\`, \`name\`, \`cash_in_total\`, \`cash_out_total\`. Only include users with at least one successful cash-in.`,
    solution_sql: `SELECT u.user_id, u.name,
       SUM(CASE WHEN t.txn_type = 'cash_in'  THEN t.amount ELSE 0 END) AS cash_in_total,
       SUM(CASE WHEN t.txn_type = 'cash_out' THEN t.amount ELSE 0 END) AS cash_out_total
FROM users u
JOIN transactions t ON t.user_id = u.user_id
WHERE t.status = 'success'
GROUP BY u.user_id, u.name
HAVING SUM(CASE WHEN t.txn_type = 'cash_in' THEN t.amount ELSE 0 END) > 0
   AND SUM(CASE WHEN t.txn_type = 'cash_out' THEN t.amount ELSE 0 END)
     > 0.5 * SUM(CASE WHEN t.txn_type = 'cash_in' THEN t.amount ELSE 0 END);`,
    hints: ["Conditional SUMs give cash-in and cash-out in one pass", "The ratio test goes in HAVING, not WHERE", "Guard against users with zero cash-in"],
    success_rate: 31,
  },

  // ════════════════ E-COMMERCE — Singles ════════════════
  {
    slug: "electronics-catalog",
    title: "Electronics Catalog by Price",
    question_type: "code",
    difficulty: "Easy",
    industry: "E-Commerce",
    category: "Filtering",
    tags: ["where", "order-by"],
    dataset: "ecommerce_shop",
    content_md: `Merchandising wants the Electronics lineup. Return \`name\` and \`price\` of every product in the **Electronics** category, most expensive first.`,
    solution_sql: `SELECT name, price FROM products WHERE category = 'Electronics' ORDER BY price DESC;`,
    hints: ["Simple WHERE on category", "ORDER BY price DESC"],
    success_rate: 85,
  },
  {
    slug: "may-delivered-orders",
    title: "Delivered Orders in May",
    question_type: "code",
    difficulty: "Easy",
    industry: "E-Commerce",
    category: "Filtering",
    tags: ["date", "where"],
    dataset: "ecommerce_shop",
    content_md: `Return \`order_id\`, \`customer_id\`, and \`order_date\` of all orders placed in **May 2026** that were delivered, oldest first.`,
    solution_sql: `SELECT order_id, customer_id, order_date
FROM orders
WHERE status = 'delivered' AND order_date >= '2026-05-01' AND order_date < '2026-06-01'
ORDER BY order_date;`,
    hints: ["Bound May with >= '2026-05-01' AND < '2026-06-01'", "Also filter status = 'delivered'"],
    success_rate: 76,
  },
  {
    slug: "order-revenue",
    title: "Revenue per Delivered Order",
    question_type: "code",
    difficulty: "Medium",
    industry: "E-Commerce",
    category: "Joins",
    tags: ["join", "group-by", "sum"],
    dataset: "ecommerce_shop",
    content_md: `Finance reconciles order values from line items. For every **delivered** order, return \`order_id\` and its revenue (\`order_revenue\` = sum of quantity × unit price), highest first.`,
    solution_sql: `SELECT o.order_id, SUM(oi.quantity * oi.unit_price) AS order_revenue
FROM orders o
JOIN order_items oi ON oi.order_id = o.order_id
WHERE o.status = 'delivered'
GROUP BY o.order_id
ORDER BY order_revenue DESC;`,
    hints: ["Revenue lives in order_items: quantity * unit_price", "Join and GROUP BY order_id"],
    success_rate: 63,
  },
  {
    slug: "revenue-by-city",
    title: "Delivered Revenue by City",
    question_type: "code",
    difficulty: "Medium",
    industry: "E-Commerce",
    category: "Joins",
    tags: ["multi-join", "group-by"],
    dataset: "ecommerce_shop",
    content_md: `Where is the money coming from? Return each customer \`city\` and its total delivered revenue (\`city_revenue\`), highest first. Revenue is quantity × unit price of items on delivered orders.`,
    solution_sql: `SELECT c.city, SUM(oi.quantity * oi.unit_price) AS city_revenue
FROM customers c
JOIN orders o ON o.customer_id = c.customer_id
JOIN order_items oi ON oi.order_id = o.order_id
WHERE o.status = 'delivered'
GROUP BY c.city
ORDER BY city_revenue DESC;`,
    hints: ["Chain two joins: customers → orders → order_items", "Filter delivered before grouping by city"],
    success_rate: 59,
  },
  {
    slug: "never-ordered-products",
    title: "Products Nobody Has Ordered",
    question_type: "code",
    difficulty: "Medium",
    industry: "E-Commerce",
    category: "Subqueries",
    tags: ["anti-join", "left-join"],
    dataset: "ecommerce_shop",
    content_md: `Catalog cleanup: find products that appear in **no order at all**. Return \`product_id\`, \`name\`, and \`category\`.`,
    solution_sql: `SELECT p.product_id, p.name, p.category
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.product_id
WHERE oi.product_id IS NULL;`,
    hints: ["LEFT JOIN order_items and keep the rows with no match", "The no-match test is oi.product_id IS NULL"],
    success_rate: 54,
  },
  {
    slug: "biggest-order-per-customer",
    title: "Each Customer's Biggest Order",
    question_type: "code",
    difficulty: "Hard",
    industry: "E-Commerce",
    category: "Window Functions",
    tags: ["window", "rank"],
    dataset: "ecommerce_shop",
    time_limit_secs: 1800,
    content_md: `For every customer with at least one delivered order, return \`name\`, \`order_id\`, and the revenue of their **highest-revenue delivered order** (\`order_revenue\`). Order by revenue descending.`,
    solution_sql: `SELECT name, order_id, order_revenue FROM (
  SELECT c.name, o.order_id, SUM(oi.quantity * oi.unit_price) AS order_revenue,
         ROW_NUMBER() OVER (PARTITION BY c.customer_id ORDER BY SUM(oi.quantity * oi.unit_price) DESC) AS rn
  FROM customers c
  JOIN orders o ON o.customer_id = c.customer_id
  JOIN order_items oi ON oi.order_id = o.order_id
  WHERE o.status = 'delivered'
  GROUP BY c.customer_id, c.name, o.order_id
) t
WHERE rn = 1
ORDER BY order_revenue DESC;`,
    hints: ["First compute revenue per order (GROUP BY)", "Then ROW_NUMBER() partitioned by customer over that aggregate", "Keep rn = 1"],
    success_rate: 35,
  },

  // ════════════════ E-COMMERCE — MCQs ════════════════
  {
    slug: "mcq-where-vs-having",
    title: "WHERE vs HAVING",
    question_type: "mcq",
    difficulty: "Easy",
    industry: "E-Commerce",
    category: "Aggregation",
    tags: ["concept"],
    content_md: `You need "cities with more than ৳10,000 of delivered revenue". A teammate asks why \`WHERE SUM(...) > 10000\` throws an error.

What's the correct statement?`,
    options: [
      { label: "A", text: "WHERE filters rows before aggregation; HAVING filters groups after aggregation" },
      { label: "B", text: "HAVING is just a faster version of WHERE" },
      { label: "C", text: "WHERE works on aggregates if you add parentheses" },
      { label: "D", text: "HAVING can only be used with COUNT" },
    ],
    correct_option: "A",
    success_rate: 74,
  },
  {
    slug: "mcq-distinct-buyers",
    title: "Predict the Distinct Buyer Count",
    question_type: "mcq",
    difficulty: "Medium",
    industry: "E-Commerce",
    category: "Aggregation",
    tags: ["distinct", "count"],
    dataset: "ecommerce_shop",
    content_md: `Delivered orders in the dataset belong to customers 1, 2, 3 and 5 — customer 1 has three delivered orders, customers 2 and 3 have two each.

What does this return?

\`\`\`sql
SELECT COUNT(DISTINCT customer_id) FROM orders WHERE status = 'delivered';
\`\`\``,
    options: [
      { label: "A", text: "7" },
      { label: "B", text: "4" },
      { label: "C", text: "5" },
      { label: "D", text: "3" },
    ],
    correct_option: "B",
    success_rate: 71,
  },

  // ════════════════ E-COMMERCE — Case Study ════════════════
  {
    slug: "return-loss-by-category",
    title: "Case: What Returns Cost Us",
    question_type: "case_study",
    difficulty: "Medium",
    industry: "E-Commerce",
    category: "Joins",
    tags: ["join", "group-by", "returns"],
    dataset: "ecommerce_shop",
    content_md: `**Scenario.** The COO suspects returns are concentrated in a few categories and wants the losses quantified before the next supplier negotiation.

For **returned** orders, return each product \`category\` and the revenue lost (\`lost_revenue\` = quantity × unit price), highest first.`,
    solution_sql: `SELECT p.category, SUM(oi.quantity * oi.unit_price) AS lost_revenue
FROM orders o
JOIN order_items oi ON oi.order_id = o.order_id
JOIN products p ON p.product_id = oi.product_id
WHERE o.status = 'returned'
GROUP BY p.category
ORDER BY lost_revenue DESC;`,
    hints: ["Three tables: orders → order_items → products", "Filter status = 'returned'", "Group by product category"],
    success_rate: 52,
  },

  // ════════════════ E-COMMERCE — Mission: Campaign Postmortem ════════════════
  {
    slug: "mission-campaign-postmortem",
    title: "Mission: Eid Campaign Postmortem",
    question_type: "root",
    difficulty: "Medium",
    industry: "E-Commerce",
    category: "Investigation",
    tags: ["mission", "analytics"],
    content_md: `**The story.** Your marketplace just wrapped its Eid flash-sale campaign. The CMO wants a postmortem by Thursday: did we actually make money, what sold, and who kept coming back? You'll answer in four steps over the same shop dataset, each digging one level deeper than the last.`,
    success_rate: 48,
  },
  {
    slug: "postmortem-1-order-funnel",
    title: "Step 1: The Order Funnel",
    question_type: "code",
    difficulty: "Easy",
    industry: "E-Commerce",
    category: "Aggregation",
    tags: ["group-by", "count"],
    dataset: "ecommerce_shop",
    parent_slug: "mission-campaign-postmortem",
    order_index: 0,
    content_md: `Start wide: how did orders end up? Return each order \`status\` and its count (\`order_count\`), highest first.`,
    solution_sql: `SELECT status, COUNT(*) AS order_count FROM orders GROUP BY status ORDER BY order_count DESC;`,
    hints: ["GROUP BY status", "COUNT(*) per group"],
    success_rate: 81,
  },
  {
    slug: "postmortem-2-aov",
    title: "Step 2: Average Order Value",
    question_type: "code",
    difficulty: "Medium",
    industry: "E-Commerce",
    category: "Aggregation",
    tags: ["avg", "subquery"],
    dataset: "ecommerce_shop",
    parent_slug: "mission-campaign-postmortem",
    order_index: 1,
    content_md: `The funnel looked healthy. Now the money: what was the **average order value** of delivered orders? Return one row with \`aov\` (average of per-order revenue), rounded to 2 decimals.`,
    solution_sql: `SELECT ROUND(AVG(order_revenue), 2) AS aov FROM (
  SELECT o.order_id, SUM(oi.quantity * oi.unit_price) AS order_revenue
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.order_id
  WHERE o.status = 'delivered'
  GROUP BY o.order_id
) t;`,
    hints: ["Two levels: revenue per order first, then AVG over that", "ROUND(x, 2) for the final figure"],
    success_rate: 53,
  },
  {
    slug: "postmortem-3-bestseller",
    title: "Step 3: The Bestseller",
    question_type: "code",
    difficulty: "Medium",
    industry: "E-Commerce",
    category: "Joins",
    tags: ["join", "group-by", "limit"],
    dataset: "ecommerce_shop",
    parent_slug: "mission-campaign-postmortem",
    order_index: 2,
    content_md: `Marketing wants the hero product for the recap deck. Among **delivered** orders, return the product \`name\` and total units sold (\`units_sold\`) of the single best-selling product by units.`,
    solution_sql: `SELECT p.name, SUM(oi.quantity) AS units_sold
FROM products p
JOIN order_items oi ON oi.product_id = p.product_id
JOIN orders o ON o.order_id = oi.order_id
WHERE o.status = 'delivered'
GROUP BY p.name
ORDER BY units_sold DESC
LIMIT 1;`,
    hints: ["Units are SUM(quantity), not revenue", "ORDER BY DESC LIMIT 1 for the single winner"],
    success_rate: 58,
  },
  {
    slug: "postmortem-4-repeat-buyers",
    title: "Step 4: Repeat Buyers Carry the Campaign",
    question_type: "code",
    difficulty: "Hard",
    industry: "E-Commerce",
    category: "Aggregation",
    tags: ["having", "multi-join"],
    dataset: "ecommerce_shop",
    parent_slug: "mission-campaign-postmortem",
    order_index: 3,
    time_limit_secs: 1800,
    content_md: `The CMO's hypothesis: repeat buyers drove the campaign. Find customers with **2 or more delivered orders**; return \`name\`, their delivered order count (\`orders_count\`), and total delivered revenue (\`total_revenue\`), by revenue descending.`,
    solution_sql: `SELECT c.name, COUNT(DISTINCT o.order_id) AS orders_count,
       SUM(oi.quantity * oi.unit_price) AS total_revenue
FROM customers c
JOIN orders o ON o.customer_id = c.customer_id
JOIN order_items oi ON oi.order_id = o.order_id
WHERE o.status = 'delivered'
GROUP BY c.customer_id, c.name
HAVING COUNT(DISTINCT o.order_id) >= 2
ORDER BY total_revenue DESC;`,
    hints: ["COUNT(DISTINCT order_id) — line items would inflate a plain COUNT", "The ≥2 filter belongs in HAVING", "Revenue still comes from order_items"],
    success_rate: 33,
  },

  // ════════════════ LOGISTICS — Singles ════════════════
  {
    slug: "high-cod-parcels",
    title: "High-Value COD Parcels",
    question_type: "code",
    difficulty: "Easy",
    industry: "Logistics",
    category: "Filtering",
    tags: ["where", "order-by"],
    dataset: "logistics_courier",
    content_md: `COD parcels above ৳1,000 need extra verification at handover. Return \`parcel_id\`, \`receiver_area\`, and \`cod_amount\` for those parcels, highest COD first.`,
    solution_sql: `SELECT parcel_id, receiver_area, cod_amount FROM parcels WHERE cod_amount > 1000 ORDER BY cod_amount DESC;`,
    hints: ["cod_amount = 0 means prepaid", "Simple WHERE + ORDER BY"],
    success_rate: 83,
  },
  {
    slug: "riders-per-hub",
    title: "Rider Headcount per Hub",
    question_type: "code",
    difficulty: "Easy",
    industry: "Logistics",
    category: "Joins",
    tags: ["join", "count"],
    dataset: "logistics_courier",
    content_md: `Return each hub \`city\` and how many riders are based there (\`rider_count\`), highest first.`,
    solution_sql: `SELECT h.city, COUNT(*) AS rider_count
FROM hubs h
JOIN riders r ON r.hub_id = h.hub_id
GROUP BY h.city
ORDER BY rider_count DESC;`,
    hints: ["Join riders to hubs", "COUNT(*) per city"],
    success_rate: 77,
  },
  {
    slug: "avg-delivery-hours-per-rider",
    title: "Average Delivery Time per Rider",
    question_type: "code",
    difficulty: "Medium",
    industry: "Logistics",
    category: "Date Arithmetic",
    tags: ["extract", "interval", "avg"],
    dataset: "logistics_courier",
    content_md: `Ops benchmarks riders on speed. For **delivered** runs, return the rider \`name\` and their average delivery duration in hours (\`avg_hours\`, rounded to 1 decimal), fastest first.`,
    solution_sql: `SELECT r.name, ROUND(AVG(EXTRACT(EPOCH FROM (d.delivered_at - d.picked_at)) / 3600)::numeric, 1) AS avg_hours
FROM riders r
JOIN deliveries d ON d.rider_id = r.rider_id
WHERE d.status = 'delivered'
GROUP BY r.name
ORDER BY avg_hours;`,
    hints: ["delivered_at - picked_at gives an interval", "EXTRACT(EPOCH FROM interval) / 3600 converts to hours", "Average per rider, then order ascending"],
    success_rate: 44,
  },
  {
    slug: "multi-attempt-parcels",
    title: "Parcels Needing Multiple Attempts",
    question_type: "code",
    difficulty: "Medium",
    industry: "Logistics",
    category: "Aggregation",
    tags: ["group-by", "having"],
    dataset: "logistics_courier",
    content_md: `A failed attempt means a re-dispatch the next day — expensive. Return \`parcel_id\` and the number of delivery attempts (\`attempts\`) for parcels with **more than one** attempt.`,
    solution_sql: `SELECT parcel_id, COUNT(*) AS attempts
FROM deliveries
GROUP BY parcel_id
HAVING COUNT(*) > 1;`,
    hints: ["Each deliveries row is one attempt", "HAVING COUNT(*) > 1"],
    success_rate: 65,
  },
  {
    slug: "stuck-parcels-aging",
    title: "Aging Report for Stuck Parcels",
    question_type: "code",
    difficulty: "Hard",
    industry: "Logistics",
    category: "Date Arithmetic",
    tags: ["null", "interval", "left-join"],
    dataset: "logistics_courier",
    time_limit_secs: 1800,
    content_md: `As of **2026-06-06 00:00:00**, which picked-up parcels are still not delivered? Return \`parcel_id\`, rider \`name\`, delivery \`status\`, and \`hours_in_flight\` (hours from \`picked_at\` to that cutoff, rounded to 1 decimal), longest first. Include both in-transit and failed attempts that never delivered — but if a parcel was later delivered by another attempt, exclude it.`,
    solution_sql: `SELECT d.parcel_id, r.name, d.status,
       ROUND((EXTRACT(EPOCH FROM (TIMESTAMP '2026-06-06 00:00:00' - d.picked_at)) / 3600)::numeric, 1) AS hours_in_flight
FROM deliveries d
JOIN riders r ON r.rider_id = d.rider_id
WHERE d.delivered_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM deliveries d2
    WHERE d2.parcel_id = d.parcel_id AND d2.status = 'delivered'
  )
ORDER BY hours_in_flight DESC;`,
    hints: ["Undelivered attempts have delivered_at IS NULL", "A parcel rescued by a later attempt must be excluded — NOT EXISTS", "Hours = EPOCH difference / 3600 against the fixed cutoff"],
    success_rate: 29,
  },

  // ════════════════ LOGISTICS — MCQs ════════════════
  {
    slug: "mcq-primary-key-guarantees",
    title: "What Does a PRIMARY KEY Guarantee?",
    question_type: "mcq",
    difficulty: "Easy",
    industry: "Logistics",
    category: "Constraints",
    tags: ["concept"],
    content_md: `The \`parcels\` table declares \`parcel_id INT PRIMARY KEY\`.

Which pair of guarantees does that give you?`,
    options: [
      { label: "A", text: "Uniqueness and NOT NULL" },
      { label: "B", text: "Uniqueness and automatic indexing of every other column" },
      { label: "C", text: "NOT NULL and automatic foreign keys" },
      { label: "D", text: "Sorted physical storage and uniqueness" },
    ],
    correct_option: "A",
    success_rate: 72,
  },
  {
    slug: "mcq-null-delivered-count",
    title: "Predict the Undelivered Count",
    question_type: "mcq",
    difficulty: "Medium",
    industry: "Logistics",
    category: "NULL Semantics",
    tags: ["null", "count"],
    dataset: "logistics_courier",
    content_md: `In \`deliveries\`, three attempts have no \`delivered_at\` (one failed attempt and two still in transit).

What does this return?

\`\`\`sql
SELECT COUNT(*) FROM deliveries WHERE delivered_at IS NULL;
\`\`\``,
    options: [
      { label: "A", text: "0 — NULLs can't be counted" },
      { label: "B", text: "2" },
      { label: "C", text: "3" },
      { label: "D", text: "11" },
    ],
    correct_option: "C",
    success_rate: 75,
  },

  // ════════════════ LOGISTICS — Case Study ════════════════
  {
    slug: "cod-reconciliation",
    title: "Case: Evening COD Reconciliation",
    question_type: "case_study",
    difficulty: "Medium",
    industry: "Logistics",
    category: "Joins",
    tags: ["join", "group-by", "cod"],
    dataset: "logistics_courier",
    content_md: `**Scenario.** Every night the hub accountant collects cash from riders. The sheet must show exactly how much COD each rider collected on **delivered** parcels.

Return rider \`name\` and \`cod_collected\` (skip riders who collected nothing), highest first.`,
    solution_sql: `SELECT r.name, SUM(p.cod_amount) AS cod_collected
FROM riders r
JOIN deliveries d ON d.rider_id = r.rider_id
JOIN parcels p ON p.parcel_id = d.parcel_id
WHERE d.status = 'delivered' AND p.cod_amount > 0
GROUP BY r.name
ORDER BY cod_collected DESC;`,
    hints: ["COD lives on parcels; the rider link is on deliveries", "Only delivered attempts count", "cod_amount = 0 parcels are prepaid — exclude them"],
    success_rate: 51,
  },

  // ════════════════ TELCO — Singles ════════════════
  {
    slug: "shadhin-plan-subscribers",
    title: "Subscribers on the Shadhin 349 Plan",
    question_type: "code",
    difficulty: "Easy",
    industry: "Telco",
    category: "Joins",
    tags: ["join", "where"],
    dataset: "telco_network",
    content_md: `Return \`name\` and \`district\` of every subscriber on the **Shadhin 349** plan, ordered by name.`,
    solution_sql: `SELECT s.name, s.district
FROM subscribers s
JOIN plans p ON p.plan_id = s.plan_id
WHERE p.name = 'Shadhin 349'
ORDER BY s.name;`,
    hints: ["Join subscribers to plans", "Filter on the plan's name column"],
    success_rate: 80,
  },
  {
    slug: "june-recharges",
    title: "Recharge Log for Early June",
    question_type: "code",
    difficulty: "Easy",
    industry: "Telco",
    category: "Filtering",
    tags: ["where", "date"],
    dataset: "telco_network",
    content_md: `Return \`recharge_id\`, \`sub_id\`, and \`amount\` of recharges of at least ৳199 made from 1–5 June 2026, in time order.`,
    solution_sql: `SELECT recharge_id, sub_id, amount
FROM recharges
WHERE amount >= 199 AND recharged_at >= '2026-06-01' AND recharged_at < '2026-06-06'
ORDER BY recharged_at;`,
    hints: ["Two conditions: amount and the date window", "Half-open range: >= start, < day-after-end"],
    success_rate: 79,
  },
  {
    slug: "data-usage-per-subscriber",
    title: "Total Data Usage per Subscriber",
    question_type: "code",
    difficulty: "Medium",
    industry: "Telco",
    category: "Aggregation",
    tags: ["sum", "join", "round"],
    dataset: "telco_network",
    content_md: `Network planning needs consumption per subscriber. Return \`name\` and total data used in **GB** (\`total_gb\` = sum of data_mb / 1024, rounded to 2 decimals), heaviest first.`,
    solution_sql: `SELECT s.name, ROUND(SUM(u.data_mb) / 1024.0, 2) AS total_gb
FROM subscribers s
JOIN usage_daily u ON u.sub_id = s.sub_id
GROUP BY s.name
ORDER BY total_gb DESC;`,
    hints: ["SUM(data_mb) then divide by 1024.0 (float division)", "ROUND(x, 2)"],
    success_rate: 62,
  },
  {
    slug: "recharge-revenue-per-plan",
    title: "Recharge Revenue per Plan",
    question_type: "code",
    difficulty: "Medium",
    industry: "Telco",
    category: "Joins",
    tags: ["multi-join", "group-by"],
    dataset: "telco_network",
    content_md: `Which plans bring in the recharge money? Return plan \`name\` and total recharge amount by its subscribers (\`recharge_revenue\`), highest first.`,
    solution_sql: `SELECT p.name, SUM(r.amount) AS recharge_revenue
FROM plans p
JOIN subscribers s ON s.plan_id = p.plan_id
JOIN recharges r ON r.sub_id = s.sub_id
GROUP BY p.name
ORDER BY recharge_revenue DESC;`,
    hints: ["Recharges link to plans through subscribers", "Two joins, one GROUP BY"],
    success_rate: 57,
  },
  {
    slug: "peak-usage-day",
    title: "Each Subscriber's Peak Data Day",
    question_type: "code",
    difficulty: "Hard",
    industry: "Telco",
    category: "Window Functions",
    tags: ["row-number", "partition"],
    dataset: "telco_network",
    time_limit_secs: 1800,
    content_md: `For each subscriber, find the day they used the **most data**. Return \`name\`, \`usage_date\`, and \`data_mb\` of that peak day, ordered by data_mb descending.`,
    solution_sql: `SELECT name, usage_date, data_mb FROM (
  SELECT s.name, u.usage_date, u.data_mb,
         ROW_NUMBER() OVER (PARTITION BY s.sub_id ORDER BY u.data_mb DESC) AS rn
  FROM subscribers s
  JOIN usage_daily u ON u.sub_id = s.sub_id
) t
WHERE rn = 1
ORDER BY data_mb DESC;`,
    hints: ["ROW_NUMBER() OVER (PARTITION BY subscriber ORDER BY data_mb DESC)", "Filter to rn = 1 in the outer query"],
    success_rate: 39,
  },

  // ════════════════ TELCO — MCQs ════════════════
  {
    slug: "mcq-coalesce-behavior",
    title: "What Does COALESCE Return?",
    question_type: "mcq",
    difficulty: "Easy",
    industry: "Telco",
    category: "NULL Semantics",
    tags: ["concept", "coalesce"],
    content_md: `A report shows blank plan names for some legacy rows, so a teammate writes \`COALESCE(plan_name, 'Unknown')\`.

What does \`COALESCE\` do?`,
    options: [
      { label: "A", text: "Returns the first non-NULL argument, left to right" },
      { label: "B", text: "Concatenates all of its arguments" },
      { label: "C", text: "Replaces NULL with zero, always" },
      { label: "D", text: "Returns NULL if any argument is NULL" },
    ],
    correct_option: "A",
    success_rate: 73,
  },
  {
    slug: "mcq-max-data-usage",
    title: "Predict the Max Daily Usage",
    question_type: "mcq",
    difficulty: "Medium",
    industry: "Telco",
    category: "Aggregation",
    tags: ["max"],
    dataset: "telco_network",
    content_md: `The heaviest user in the dataset is a Business 999 subscriber whose three daily readings are 3,400 MB, 4,100 MB and 2,900 MB; nobody else crosses 2,500 MB.

What does this return?

\`\`\`sql
SELECT MAX(data_mb) FROM usage_daily;
\`\`\``,
    options: [
      { label: "A", text: "10400" },
      { label: "B", text: "3400" },
      { label: "C", text: "4100" },
      { label: "D", text: "2500" },
    ],
    correct_option: "C",
    success_rate: 84,
  },

  // ════════════════ TELCO — Case Study ════════════════
  {
    slug: "one-time-recharger-churn-risk",
    title: "Case: One-Time Rechargers",
    question_type: "case_study",
    difficulty: "Medium",
    industry: "Telco",
    category: "Aggregation",
    tags: ["having", "join", "churn"],
    dataset: "telco_network",
    content_md: `**Scenario.** Retention flags subscribers who recharged exactly **once** in June as churn risks — one top-up and silence.

Return \`name\`, plan name (\`plan_name\`), and their single recharge \`amount\`, ordered by amount descending.`,
    solution_sql: `SELECT s.name, p.name AS plan_name, MAX(r.amount) AS amount
FROM subscribers s
JOIN plans p ON p.plan_id = s.plan_id
JOIN recharges r ON r.sub_id = s.sub_id
GROUP BY s.sub_id, s.name, p.name
HAVING COUNT(r.recharge_id) = 1
ORDER BY amount DESC;`,
    hints: ["Group per subscriber and count recharges", "HAVING COUNT(...) = 1 keeps one-time rechargers", "With exactly one recharge, MAX(amount) is that recharge"],
    success_rate: 46,
  },
];
