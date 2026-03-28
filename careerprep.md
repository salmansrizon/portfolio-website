# Project Context: Antigravity SQL

## 🎯 Project Vision
career prep is a new feature to my portfolio website. It is a localized, high-performance SQL & python and business case wise interview preparation platform designed for the South Asian tech ecosystem (Bangladesh focus). It mimics the **LeetCode experience** but operates at **zero hosting cost** by executing all SQL logic in the user's browser via WebAssembly.

---

## 🛠️ Technical Stack (The "Free-Tier" Architecture)
- **Framework:** use existing framework and theme
- **Database (Global/Auth):** **Supabase (Free Tier)** for user profiles, question metadata, and submission history.
- **Database (Execution Engine):** **PGLite (Postgres WASM)**. Runs a full, isolated Postgres instance in the browser. 
- **Code Editor:** `@monaco-editor/react` (SQL language support).
- **UI Components:** use existing framework and theme
---

## 🏗️ System Architecture & Logic
1. **Thick Client Logic:** To avoid Vercel serverless function limits, 100% of SQL execution happens in the client’s browser using PGLite.
2. **The Execution Loop:**
   - **Load:** Fetch `initial_sql` (DDL + Inserts) from Supabase.
   - **Seed:** Initialize PGLite and execute the `initial_sql`.
   - **Run:** Execute user-written SQL against the PGLite instance.
   - **Compare:** Run the `solution_sql` in the background; compare JSON result sets for "Deep Equality" to validate the answer.

---

## 👥 User Roles & Personas
- **The Candidate (Job Seeker):** Preparing for roles at companies like bKash, Pathao, or ShopUp. Needs localized business logic (Fintech, Logistics).
- **The Admin (Content Manager):** You. can add, edit, delete questions and users. can enable and disable authentication methods. can see all users data and submissions.

---

## 🚀 Core Features (LeetCode-Style)

there will be 2 types of senarios , one is leetcode style sql questions and another is business case wise sql questions with multiple option to choose from .

### 1. The Three-Pane Workspace
- **Left:** Problem description (Markdown), Schema visualizer, and "Example Output" table.
- **Center:** Monaco SQL Editor with a "Run" button (Sample Test) and "Submit" button (Validation).
- **Bottom:** Results console showing a `DataTable` of the query output or error logs from PGLite.

### 2. Localized Industry Scenarios
- Questions must be categorized by local industries: **Fintech (MFS), E-commerce, Logistics, and Telco.**
- *Example:* "Find the top 5 merchants with the highest 'Cash Out' volume in the last 24 hours."


### 4. Interview Simulation Mode
- A timed challenge (e.g., 30 mins) that hides the "View Solution" button and disables hints to mimic a real technical screening.

### 5. Public Proof-of-Work
- A public profile page showing a "Contribution Calendar" and a list of solved high-complexity challenges that users can link on their CV.

---
## 🛣️ User Specific Journey Flow

### 1. Discovery & Onboarding
- **Landing:** User arrives at the homepage; sees localized "Real-world" SQL challenges.
- **Auth:** login with email, password, phone number, whatsappnumber (admin can enable and disable any of them)
- **Onboarding:** User selects a "Target Industry" (e.g., Fintech) to customize their dashboard.

### 2. The Lobby (Question Selection)
- **Browse:** User filters the library by Industry, Difficulty, or Success Rate.
- **Selection:** Clicks "Solve Challenge" to enter the dedicated workspace.

### 3. The Solving Loop (The Workspace)
- **Contextualization:** User reads the localized problem statement and studies the Schema Diagram.
- **Environment Setup:** PGLite boots in the background and runs the `initial_sql` seed data.
- **Iterative Drafting:** - User writes SQL in the Monaco editor.
    - Hits `Cmd + Enter` to run code locally.
    - View results instantly in the output table.
    - show hints if user is stuck

### 4. Validation & Success
- **Submission:** User clicks "Submit." The app runs a "Hidden Test" against a larger dataset.
- **Outcome:** - **Success:** XP is awarded, streaks are updated, and the "Official Solution" tab is unlocked.
    - **Failure:** User receives specific feedback on why the output didn't match the expected result.

### 5. Proof of Work (Public Profile)
- **Portfolio:** Every successful submission is logged on the user's public profile.
- **Sharing:** User copies their profile link (`/u/username`) to share on LinkedIn or CVs.

---

## 🗄️ Database Schema (Supabase)

### `profiles`
- `id`: uuid (Auth)
- `username`: text
- `xp`: int (gamification)
- `streak`: int

### `questions`
- `id`: uuid
- `title`: text
- `slug`: text (for URL)
- `difficulty`: enum (Easy, Medium, Hard)
- `industry`: text (Fintech, Logistics, etc.)
- `content_md`: text (The prompt)
- `initial_sql`: text (The setup script for PGLite)
- `solution_sql`: text (The hidden answer for validation)

### `submissions`
- `id`: uuid
- `user_id`: uuid
- `question_id`: uuid
- `submitted_code`: text
- `is_correct`: boolean
- `execution_time`: float

---

## 🚦 Implementation Priorities for the AI Agent
1. **Phase 1:** Scaffold Next.js + Shadcn UI. Implement the `SQLProvider` using PGLite.
2. **Phase 2:** Create the 3-pane Layout. Ensure Monaco Editor can run a query and display results in a table.
3. **Phase 3:** Setup Supabase Auth and fetch real questions from the DB.
4. **Phase 4:** Build the "Submit" validation logic (User Results vs. Solution Results).
5. **Phase 5:** Add the AI Vibe Check and Interview Timer.