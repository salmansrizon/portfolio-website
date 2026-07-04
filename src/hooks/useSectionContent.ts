import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Loads a homepage Section's editable copy from portfolio_sections.
 * The component's hardcoded copy is the fallback: it renders immediately and
 * stays in place whenever no published row exists, so the page can never go
 * blank from missing data. DB fields win over fallback fields (shallow merge).
 */
export function useSectionContent<T extends Record<string, unknown>>(
  sectionName: string,
  fallback: T,
): { content: T; loading: boolean } {
  const [content, setContent] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("portfolio_sections")
          .select("content")
          .eq("section_name", sectionName)
          .eq("status", "published")
          .maybeSingle();
        if (!cancelled && !error && data?.content && typeof data.content === "object") {
          setContent((prev) => ({ ...prev, ...(data.content as Partial<T>) }));
        }
      } catch (err) {
        console.error(`Failed to load section content for "${sectionName}":`, err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionName]);

  return { content, loading };
}
