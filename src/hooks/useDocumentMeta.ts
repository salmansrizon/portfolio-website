import { useEffect } from 'react';

// Sets the page title and social meta while the app is running.
//
// This is NOT what makes a shared link preview correctly — social crawlers do
// not execute JavaScript, so that job belongs to the static files written by
// scripts/prerender-topics.mjs at build time. This is for the browser: the tab
// title, the bookmark, and the in-app share sheets on mobile that read the live
// DOM. Fifteen lines beats a dependency for that.

const setMeta = (selector: string, attr: 'name' | 'property', key: string, content: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

export function useDocumentMeta({ title, description }: { title?: string; description?: string }) {
  useEffect(() => {
    if (!title) return;
    const previous = document.title;
    document.title = title;
    setMeta('meta[property="og:title"]', 'property', 'og:title', title);
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    if (description) {
      setMeta('meta[name="description"]', 'name', 'description', description);
      setMeta('meta[property="og:description"]', 'property', 'og:description', description);
      setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    }
    // Restore on unmount so navigating away does not leave one Topic's title on
    // an unrelated page.
    return () => { document.title = previous; };
  }, [title, description]);
}
