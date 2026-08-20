import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { CourseCountdown } from '@/components/CourseCountdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GraduationCap, CalendarDays, BookDown, CheckCircle2, Download } from 'lucide-react';
import { track } from '@/services/funnel';

// One offer per Surface, by fixed priority (§5). Which course, webinar and
// ebook appear is an explicit per-Journey mapping set by an admin — not tag
// matching, which is a system to maintain for a problem that does not exist yet.

interface Props {
  journeyId?: string;
}

interface Offers {
  course: { id: string; title: string; short_description: string | null } | null;
  webinar: { id: string; title: string; webinar_date: string | null } | null;
  ebook: { id: string; title: string; description: string | null; storage_path: string | null } | null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Bangladeshi mobile numbers, with or without country code.
const PHONE_RE = /^(?:\+?88)?01[3-9]\d{8}$/;
const EBOOK_BUCKET = 'ebooks';

const JourneyOffers = ({ journeyId }: Props) => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [unlockedUrl, setUnlockedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: offers } = useQuery({
    queryKey: ['journey-offers', journeyId],
    enabled: !!journeyId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('journeys')
        .select(`
          course:courses(id, title, short_description),
          webinar:webinars(id, title, webinar_date),
          ebook:ebooks(id, title, description, storage_path)
        `)
        .eq('id', journeyId)
        .maybeSingle();
      if (error) return null;
      return (data ?? null) as Offers | null;
    },
  });

  // The lead is recorded, then the file is handed over immediately — no email is
  // sent, so nothing can silently fail in a queue the learner cannot see. The
  // trade-off is deliberate: contact details are unverified, so this is a lead
  // list of *claimed* addresses, not confirmed ones.
  const requestEbook = useMutation({
    mutationFn: async () => {
      if (!offers?.ebook) return null;

      const { error } = await (supabase as any).from('ebook_unlocks').insert({
        ebook_id: offers.ebook.id,
        user_id: session?.user?.id ?? null,
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        surface: 'lobby',
        delivered_at: new Date().toISOString(),
      });
      if (error) throw error;

      if (!offers.ebook.storage_path) return null;
      const { data } = (supabase as any).storage
        .from(EBOOK_BUCKET)
        .getPublicUrl(offers.ebook.storage_path);
      return (data?.publicUrl as string) ?? null;
    },
    onSuccess: (url) => {
      void track({
        event: 'identified', surface: 'lobby',
        subjectType: 'ebook', subjectId: offers?.ebook?.id, journeyId,
      });
      // Recording the lead is the part that must not fail. A missing file is a
      // content gap, not a reason to lose the lead or show an error.
      setUnlockedUrl(url ?? 'pending');
      if (url) window.open(url, '_blank', 'noopener');
    },
    onError: (e: any) => setError(e.message ?? 'Could not save that — try again.'),
  });

  if (!offers) return null;
  const { course, webinar, ebook } = offers;
  if (!course && !webinar && !ebook) return null;

  return (
    <div className="mb-6 grid gap-4 md:grid-cols-3">
      {course && (
        <Card className="border-dashed">
          <CardContent className="flex h-full flex-col p-4">
            <p className="mb-1 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              <GraduationCap className="h-3.5 w-3.5" /> Recommended course
            </p>
            <p className="font-semibold">{course.title}</p>
            {course.short_description && (
              <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">{course.short_description}</p>
            )}
            <Button
              size="sm"
              className="mt-auto w-full rounded-full"
              onClick={() => {
                void track({ event: 'offer_clicked', surface: 'lobby', subjectType: 'course', subjectId: course.id, journeyId });
                navigate(`/course/${course.id}`);
              }}
            >
              View course
            </Button>
          </CardContent>
        </Card>
      )}

      {webinar && (
        <Card className="border-dashed">
          <CardContent className="flex h-full flex-col p-4">
            <p className="mb-1 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" /> Upcoming webinar
            </p>
            <p className="font-semibold">{webinar.title}</p>
            <p className="mb-3 text-xs text-muted-foreground">
              {webinar.webinar_date
                ? new Date(webinar.webinar_date).toLocaleDateString(undefined, {
                    weekday: 'short', day: 'numeric', month: 'short',
                  })
                : 'Date to be announced'}{' '}
              · free
            </p>
            {/* A live session has a real deadline, so showing it is information
                rather than pressure — the countdown disappears once it starts,
                and no fake scarcity is invented for anything without a date. */}
            {webinar.webinar_date && (
              <div className="mb-3">
                <CourseCountdown startDate={webinar.webinar_date} />
              </div>
            )}
            <Button
              size="sm"
              variant="outline"
              className="mt-auto w-full rounded-full"
              onClick={() => navigate(`/webinar/${webinar.id}`)}
            >
              Register
            </Button>
          </CardContent>
        </Card>
      )}

      {ebook && (
        <Card className="border-dashed">
          <CardContent className="flex h-full flex-col p-4">
            <p className="mb-1 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              <BookDown className="h-3.5 w-3.5" /> Free resource
            </p>
            <p className="font-semibold">{ebook.title}</p>
            <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">{ebook.description}</p>

            {unlockedUrl ? (
              <div className="mt-auto space-y-2">
                {unlockedUrl === 'pending' ? (
                  <p className="text-xs text-muted-foreground">
                    Thanks — this one is not uploaded yet. We have your details and will let you know.
                  </p>
                ) : (
                  <>
                    <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-success">
                      <CheckCircle2 className="h-4 w-4" /> Unlocked.
                    </p>
                    <Button
                      size="sm"
                      className="w-full rounded-full"
                      onClick={() => window.open(unlockedUrl, '_blank', 'noopener')}
                    >
                      <Download className="mr-1.5 h-3.5 w-3.5" /> Download again
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="mt-auto space-y-2">
                <Input
                  type="email"
                  inputMode="email"
                  placeholder="you@example.com"
                  className="h-9"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                />
                <Input
                  type="tel"
                  inputMode="tel"
                  placeholder="01XXXXXXXXX"
                  className="h-9"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setError(null); }}
                />
                {error && <p className="text-[11px] text-danger">{error}</p>}
                <Button
                  size="sm"
                  className="w-full rounded-full"
                  disabled={requestEbook.isPending}
                  onClick={() => {
                    // Format is the only check there is — nothing verifies these
                    // details, since the file is handed over immediately.
                    if (!EMAIL_RE.test(email.trim())) {
                      setError('That does not look like an email address.');
                      return;
                    }
                    if (!PHONE_RE.test(phone.replace(/[\s-]/g, ''))) {
                      setError('Enter a valid mobile number, e.g. 01712345678.');
                      return;
                    }
                    requestEbook.mutate();
                  }}
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" /> Get the PDF
                </Button>
                <p className="text-[10px] text-muted-foreground">
                  Instant download — no email to wait for.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default JourneyOffers;
