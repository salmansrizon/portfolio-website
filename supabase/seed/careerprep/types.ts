export type SeedQuestionType = "root" | "code" | "mcq" | "case_study";
export type SeedDifficulty = "Easy" | "Medium" | "Hard";
export type SeedIndustry = "Fintech" | "E-Commerce" | "Logistics" | "Telco";

export interface SeedMCQOption {
  label: "A" | "B" | "C" | "D";
  text: string;
}

/**
 * Authoring shape for one Question. SQL questions reference a shared dataset
 * (industry "world") by name; the seed index expands that into the
 * schema_sql/initial_sql columns candidates boot into PGLite.
 */
export interface SeedQuestion {
  slug: string;
  title: string;
  question_type: SeedQuestionType;
  difficulty: SeedDifficulty;
  industry: SeedIndustry;
  /** SQL topic, e.g. "Joins", "Aggregation", "Window Functions" */
  category: string;
  tags?: string[];
  content_md: string;
  /** Shared dataset key for code/case_study (and MCQs that show a schema) */
  dataset?: string;
  solution_sql?: string;
  hints?: string[];
  options?: SeedMCQOption[];
  correct_option?: "A" | "B" | "C" | "D";
  /** Mission children reference their root by slug */
  parent_slug?: string;
  order_index?: number;
  time_limit_secs?: number | null;
  success_rate?: number;
}
