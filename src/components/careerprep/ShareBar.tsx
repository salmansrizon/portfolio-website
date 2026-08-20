import { useState } from 'react';
import { Linkedin, Facebook, MessageCircle, Link2, Check } from 'lucide-react';
import { track } from '@/services/funnel';
import type { Surface } from '@/services/funnel';

// Sharing a Topic is the cheapest traffic this product has: the page is free,
// self-contained, and useful to someone who has never heard of the site.
//
// The share text carries the Topic's own title rather than a slogan — "Window
// functions, explained in plain terms" is a thing a person forwards; "Check out
// Career Prep" is an advert nobody forwards.

interface Props {
  title: string;
  surface: Surface;
  subjectId: string;
  /** Defaults to the current page. Passed explicitly in tests. */
  url?: string;
}

const ShareBar = ({ title, surface, subjectId, url }: Props) => {
  const [copied, setCopied] = useState(false);
  const href = url ?? (typeof window !== 'undefined' ? window.location.href : '');
  const text = `${title} — explained in plain terms`;

  const open = (network: string, target: string) => {
    void track({
      event: 'shared',
      surface,
      subjectType: 'topic',
      subjectId,
      metadata: { network },
    });
    window.open(target, '_blank', 'noopener,noreferrer,width=600,height=600');
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      void track({ event: 'shared', surface, subjectType: 'topic', subjectId, metadata: { network: 'copy' } });
    } catch {
      // Clipboard is blocked in some embedded browsers. Failing quietly is
      // right here: the buttons beside this one still work.
    }
  };

  const e = encodeURIComponent;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">
        Share
      </span>

      <button
        aria-label="Share on LinkedIn"
        onClick={() => open('linkedin', `https://www.linkedin.com/sharing/share-offsite/?url=${e(href)}`)}
        className="grid h-8 w-8 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
      >
        <Linkedin className="h-3.5 w-3.5" />
      </button>

      <button
        aria-label="Share on X"
        onClick={() => open('x', `https://twitter.com/intent/tweet?text=${e(text)}&url=${e(href)}`)}
        className="grid h-8 w-8 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
      >
        <span className="text-[13px] font-black leading-none">𝕏</span>
      </button>

      <button
        aria-label="Share on Facebook"
        onClick={() => open('facebook', `https://www.facebook.com/sharer/sharer.php?u=${e(href)}`)}
        className="grid h-8 w-8 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
      >
        <Facebook className="h-3.5 w-3.5" />
      </button>

      {/* WhatsApp first among messaging apps deliberately: it is where this
          audience actually forwards things. */}
      <button
        aria-label="Share on WhatsApp"
        onClick={() => open('whatsapp', `https://wa.me/?text=${e(`${text} ${href}`)}`)}
        className="grid h-8 w-8 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
      >
        <MessageCircle className="h-3.5 w-3.5" />
      </button>

      <button
        aria-label="Copy link"
        onClick={copy}
        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-[11px] font-bold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Link2 className="h-3.5 w-3.5" />}
        {copied ? 'Copied' : 'Copy link'}
      </button>
    </div>
  );
};

export default ShareBar;
