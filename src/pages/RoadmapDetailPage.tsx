import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { parseRoadmapMarkdown } from '@/utils/parseRoadmapMarkdown';
import RoadmapTreeView from '@/components/roadmap/RoadmapTreeView';
import RoadmapAccordionView from '@/components/roadmap/RoadmapAccordionView';
import { TreePine, List, ArrowLeft, Sparkles, Loader2, Share2, Check, MessageCircleQuestion, ArrowRight } from 'lucide-react';
import { usePageView } from '@/hooks/usePageView';
import { Skeleton } from '@/components/ui/skeleton';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '@/contexts/AuthContext';

interface Roadmap {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  markdown_content: string;
  banner_image: string | null;
}

const RoadmapDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { session } = useAuth();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'tree' | 'accordion'>('tree');
  usePageView(`/roadmaps/${slug}`);

  // Guest gate (reuses careerprep_guests + same localStorage keys)
  const [showGate, setShowGate] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestWhatsapp, setGuestWhatsapp] = useState('');
  const [guestSaving, setGuestSaving] = useState(false);

  useEffect(() => {
    if (session?.user) return;
    const isGuest = localStorage.getItem('careerprep_guest') === 'true';
    if (!isGuest) setShowGate(true);
    if (!localStorage.getItem('careerprep_session_id')) {
      localStorage.setItem('careerprep_session_id', Math.random().toString(36).substring(2, 15));
    }
  }, [session]);

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestEmail)) {
      alert('Please enter a valid email address.');
      return;
    }
    const cleanPhone = guestWhatsapp.replace(/[\s-]/g, '');
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(cleanPhone)) {
      alert('Please enter a valid WhatsApp number (e.g. +8801712345678).');
      return;
    }

    setGuestSaving(true);
    try {
      const payload = {
        email: guestEmail.trim().toLowerCase(),
        whatsapp: cleanPhone,
        last_active_at: new Date().toISOString(),
      };
      const { error } = await supabase
        .from('careerprep_guests')
        .upsert(payload, { onConflict: 'email' });
      if (error) {
        alert(`Could not save your info: ${error.message}`);
        setGuestSaving(false);
        return;
      }
      localStorage.setItem('careerprep_guest', 'true');
      localStorage.setItem('careerprep_guest_email', payload.email);
      localStorage.setItem('careerprep_guest_whatsapp', cleanPhone);
      setShowGate(false);
    } catch (err) {
      alert('Something went wrong. Please try again.');
    } finally {
      setGuestSaving(false);
    }
  };

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('roadmaps')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();
      setRoadmap(data as Roadmap | null);
      setLoading(false);
    };
    if (slug) fetch();
  }, [slug]);

  const nodes = useMemo(() => {
    if (!roadmap?.markdown_content) return [];
    return parseRoadmapMarkdown(roadmap.markdown_content);
  }, [roadmap?.markdown_content]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-6 w-96 mb-8" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-16 px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Roadmap not found</h1>
          <Button asChild variant="outline"><Link to="/roadmaps"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Roadmaps</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20 sm:pt-24 pb-12 sm:pb-16 px-3 sm:px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <Link to="/roadmaps" className="inline-flex items-center text-xs sm:text-sm text-muted-foreground hover:text-primary mb-3 sm:mb-4 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" /> All Roadmaps
            </Link>
            <div className="flex items-start justify-between gap-3 mb-1.5 sm:mb-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold flex-1 min-w-0 break-words">{roadmap.title}</h1>
              <ShareButton title={roadmap.title} />
            </div>
            {roadmap.description && (
              <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-muted-foreground prose-headings:text-foreground prose-strong:text-foreground prose-a:text-primary">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{roadmap.description}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 sm:gap-2 mb-4 sm:mb-6 p-1 bg-muted rounded-lg w-fit">
            <Button
              variant={viewMode === 'tree' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('tree')}
              className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2.5 sm:px-3"
            >
              <TreePine className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Tree
            </Button>
            <Button
              variant={viewMode === 'accordion' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('accordion')}
              className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2.5 sm:px-3"
            >
              <List className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> List
            </Button>
          </div>

          {/* Content */}
          {nodes.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">No content available for this roadmap yet.</p>
          ) : viewMode === 'tree' ? (
            <RoadmapTreeView nodes={nodes} />
          ) : (
            <RoadmapAccordionView nodes={nodes} />
          )}

          {/* Customize Guideline CTA */}
          {nodes.length > 0 && (
            <div className="mt-10 sm:mt-14 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-accent/5 to-background p-6 sm:p-8 text-center shadow-sm">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center mb-3">
                <MessageCircleQuestion className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">Need Customize Guideline?</h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto mb-5">
                Get a personalized roadmap tailored to your goals, background, and timeline. Book a 1:1 session to plan your career journey.
              </p>
              <Button asChild size="lg" className="gap-2">
                <Link to="/book-session">
                  Book a Session <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Guest Gate Modal */}
      <Dialog open={showGate} onOpenChange={(open) => { if (!open && localStorage.getItem('careerprep_guest') !== 'true') return; setShowGate(open); }}>
        <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-center text-xl">Unlock the Full Roadmap</DialogTitle>
            <DialogDescription className="text-center">
              Enter your details to access this career roadmap. Free, no spam — just stay updated on new content.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleGuestSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="gate-email">Email</Label>
              <Input id="gate-email" type="email" placeholder="you@example.com" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gate-whatsapp">WhatsApp Number</Label>
              <Input id="gate-whatsapp" type="tel" placeholder="+8801712345678" value={guestWhatsapp} onChange={(e) => setGuestWhatsapp(e.target.value)} required />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full" disabled={guestSaving}>
                {guestSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Continue to Roadmap'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ShareButton = ({ title }: { title: string }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const shareData = { title, text: `Check out this roadmap: ${title}`, url };
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      try {
        await (navigator as any).share(shareData);
        return;
      } catch {
        // fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleShare} className="gap-1.5 shrink-0 mt-1">
      {copied ? <Check className="h-4 w-4 text-primary" /> : <Share2 className="h-4 w-4" />}
      <span className="hidden sm:inline">{copied ? 'Copied!' : 'Share'}</span>
    </Button>
  );
};

export default RoadmapDetailPage;
