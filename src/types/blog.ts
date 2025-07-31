export interface BlogContent {
  type: string;
  content?: string;
  url?: string;
  alt?: string;
  caption?: string;
  language?: string;
  code?: string;
  [key: string]: any;
}

export interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  content: BlogContent[];
  excerpt?: string;
  featured_image?: string;
  published?: boolean;
  source_type?: "local" | "medium" | "linkedin" | "external";
  source_url?: string;
  created_at?: string;
  updated_at?: string;
  categories?: string[];
}