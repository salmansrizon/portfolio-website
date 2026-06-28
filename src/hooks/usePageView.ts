import { useEffect } from "react";
import { usePageView as usePageViewAnalytics } from "@/services/analytics";

export function usePageView(pagePath: string) {
  usePageViewAnalytics(pagePath);
}

