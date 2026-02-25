import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

function getVisitorId(): string {
  const key = "visitor_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export function usePageView(pagePath: string) {
  useEffect(() => {
    const visitorId = getVisitorId();
    supabase
      .from("page_views")
      .insert({ page_path: pagePath, visitor_id: visitorId })
      .then(); // fire-and-forget
  }, [pagePath]);
}
