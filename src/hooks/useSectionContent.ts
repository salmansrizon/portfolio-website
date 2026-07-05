import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SECTION_DEFAULTS, type SectionContentMap, type SectionName } from "@/lib/sections";

/**
 * Loads a homepage Section's editable copy from portfolio_sections.
 * The Section module's default copy renders immediately and stays in place
 * whenever no published row exists, so the page can never go blank from
 * missing data. DB fields win over default fields (shallow merge).
 */
export function useSectionContent<K extends SectionName>(
  sectionName: K,
): { content: SectionContentMap[K]; loading: boolean } {
  const [content, setContent] = useState<SectionContentMap[K]>(SECTION_DEFAULTS[sectionName]);
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
          setContent((prev) => ({ ...prev, ...(data.content as Partial<SectionContentMap[K]>) }));
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
