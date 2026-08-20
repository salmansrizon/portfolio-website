import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, HelpCircle, Loader2, Code2, ListChecks, Map, PlayCircle, BookDown, Video, Briefcase, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import TopicCard from '@/components/careerprep/TopicCard';
import CheckpointDialog from '@/components/careerprep/CheckpointDialog';
import { useTopic, useTopicProgress, useTopicNavigation } from '@/hooks/useTopics';
import { useCheckpoint } from '@/hooks/useCheckpoints';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import ShareBar from '@/components/careerprep/ShareBar';
import { track } from '@/services/funnel';
import { CourseCountdown } from '@/components/CourseCountdown';
import { TopicSkeleton } from '@/components/ui/skeletons';
import TopicSections from '@/components/careerprep/TopicSections';

// The Topic page: explanation, practice, checkpoint — the interactive medium
// Career Prep is for. A Roadmap covers the same subject matter as a written
// reference and is reached separately; neither renders the other.

const TopicPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data, loading } = useTopic(slug);
  const { passed } = useTopicProgress();
  const { checkpoint } = useCheckpoint(data?.checkpoint?.id);
  const { nav } = useTopicNavigation(slug);

  // Browser-side only. The preview a social crawler sees is a static file
  // written at build time — see scripts/prerender-topics.mjs.
  useDocumentMeta({
    title: data ? `${data.topic.title} — Career Prep` : undefined,
    description: data ? `${data.topic.what_it_is} ${data.topic.why_it_matters}`.slice(0, 200) : undefined,
  });
  const [open, setOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <TopicSkeleton />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-2xl px-4 pt-32 text-center">
          <h1 className="text-2xl font-bold">Topic not found</h1>
          <p className="mt-2 text-muted-foreground">It may not be published yet.</p>
          <Button asChild className="mt-6 rounded-full"><Link to="/career-prep">Back to Career Prep</Link></Button>
        </div>
      </div>
    );
  }

  const { topic, practice, caseStudies, sections, references, offers } = data;
  const isDone = passed.has(topic.id);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-24">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => navigate('/career-prep')}>
            <ArrowLeft className="h-4 w-4" /> Career Prep
          </Button>
          {/* Position inside the learner's own plan — never a global count, so a
              Data Analyst is not told they are on topic 4 of an AI syllabus. */}
          {nav?.journey && nav.index >= 0 && (
            <span className="text-xs text-muted-foreground">
              {nav.journey.title} · topic {nav.index + 1} of {nav.sequence.length}
            </span>
          )}
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-black tracking-tight sm:text-2xl lg:text-3xl [overflow-wrap:anywhere]">{topic.title}</h1>
          {isDone && (
            <Badge className="border-0 bg-success-soft text-success-strong">
              <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Passed
            </Badge>
          )}
        </div>

        {/* The explanation opens by default here. On a Step it was an escape
            hatch; on the Topic page it is the point of the page. */}
        <TopicCard topic={topic} surface="topic" defaultOpen />

        {/* Every Topic is a shareable page in its own right: free, complete,
            and useful to someone who has never heard of this site. Sharing sits
            under the explanation, where a reader has just decided it was good. */}
        <div className="mt-4">
          <ShareBar title={topic.title} surface="topic" subjectId={topic.id} />
        </div>

        <TopicSections sections={sections} />

        <section className="mt-6">
          <h2 className="mb-3 text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground">
            Practise it ({practice.length})
          </h2>

          {practice.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No practice questions attached to this topic yet.
            </p>
          ) : (
            <div className="grid gap-1.5">
              {practice.map((q) => (
                <button
                  key={q.id}
                  onClick={() => navigate(`/career-prep/solve/${q.slug}`)}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 text-left transition-colors hover:border-primary/40"
                >
                  {q.question_type === 'mcq'
                    ? <ListChecks className="h-4 w-4 shrink-0 text-series-data" />
                    : <Code2 className="h-4 w-4 shrink-0 text-series-web" />}
                  <span className="min-w-0 flex-1 text-sm font-medium leading-snug [overflow-wrap:anywhere]">{q.title}</span>
                  {q.difficulty && (
                    <Badge variant="outline" className="shrink-0 text-[10px]">{q.difficulty}</Badge>
                  )}
                </button>
              ))}
            </div>
          )}
        </section>

        {caseStudies.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-1 text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground">
              Apply it ({caseStudies.length})
            </h2>
            <p className="mb-3 text-xs text-muted-foreground">
              A real scenario, worked through one decision at a time — the shape the interview round
              actually takes.
            </p>

            <div className="grid gap-1.5">
              {caseStudies.map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate(`/career-prep/solve/${c.slug}`)}
                  className="flex items-center gap-3 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2.5 text-left transition-colors hover:border-primary/50"
                >
                  <Briefcase className="h-4 w-4 shrink-0 text-primary" />
                  <span className="min-w-0 flex-1 text-sm font-semibold">{c.title}</span>
                  {c.difficulty && (
                    <Badge variant="outline" className="shrink-0 text-[10px]">{c.difficulty}</Badge>
                  )}
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="mt-6">
          <h2 className="mb-3 text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground">
            Checkpoint
          </h2>

          {!checkpoint ? (
            <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              This topic has no checkpoint yet.
            </p>
          ) : isDone ? (
            <div className="flex items-center gap-2 rounded-xl border border-success/30 bg-success-soft/40 p-4 text-sm text-success">
              <CheckCircle2 className="h-4 w-4" /> You have passed this checkpoint.
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="mb-3 text-sm text-muted-foreground">
                One multiple-choice question closes this topic. Getting it wrong changes nothing you have
                earned — only the certificate needs every checkpoint passed.
              </p>
              <Button className="gap-2 rounded-full" onClick={() => setOpen(true)}>
                <HelpCircle className="h-4 w-4" /> Answer the checkpoint
              </Button>
            </div>
          )}
        </section>
        {references.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-1 text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground">
              Learn more ({references.length})
            </h2>
            <p className="mb-3 text-xs text-muted-foreground">
              Primary sources and open courses, chosen one per reason — not a bookmark dump.
            </p>

            <div className="grid gap-1.5">
              {references.map((r) => (
                <a
                  key={r.id}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => void track({ event: 'offer_clicked', surface: 'topic', subjectType: 'topic', subjectId: topic.id, metadata: { reference: r.url } })}
                  className="flex items-start gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/40"
                >
                  <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{r.label}</span>
                    {r.note && <span className="block text-xs text-muted-foreground">{r.note}</span>}
                  </span>
                  <Badge variant="outline" className="shrink-0 text-[10px]">
                    {r.is_free ? r.kind : `${r.kind} · paid`}
                  </Badge>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Extension, and only after the free material is done: the Topic is
            complete on its own, and this is the deeper cut for the learner who
            wants it. Placed under the next-topic step so continuing the plan is
            always the more obvious action. */}
        {(offers.course || offers.ebook || offers.webinar) && (
          <section className="mt-10">
            <h2 className="mb-3 text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground">
              Go further on this topic
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {offers.course && (
                <button
                  onClick={() => navigate(`/course/${offers.course!.id}`)}
                  className="rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40"
                >
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary">
                    <PlayCircle className="h-3.5 w-3.5" /> Recorded course
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug">{offers.course.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{offers.course.short_description}</p>
                  <p className="mt-2 text-xs font-bold">
                    {offers.course.is_free ? 'Free' : `৳${offers.course.price}`}
                  </p>
                </button>
              )}

              {offers.ebook && (
                <button
                  onClick={() => navigate('/career-prep')}
                  className="rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40"
                >
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary">
                    <BookDown className="h-3.5 w-3.5" /> Study material
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug">{offers.ebook.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-3">{offers.ebook.description}</p>
                  <p className="mt-2 text-xs font-bold">Free with your email</p>
                </button>
              )}

              {offers.webinar && (
                <button
                  onClick={() => navigate('/webinars')}
                  className="rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40"
                >
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary">
                    <Video className="h-3.5 w-3.5" /> Live session
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug">{offers.webinar.title}</p>
                  {offers.webinar.webinar_date && (
                    <>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(offers.webinar.webinar_date).toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}
                      </p>
                      <div className="mt-2"><CourseCountdown startDate={offers.webinar.webinar_date} /></div>
                    </>
                  )}
                  <p className="mt-2 text-xs font-bold">{offers.webinar.is_free ? 'Free' : 'Paid'}</p>
                </button>
              )}
            </div>
          </section>
        )}

        {nav?.roadmap && (
          <div className="mt-8 rounded-xl border border-border bg-muted/30 p-4">
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground">
              Want the wider map?
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              This stage follows the <strong className="text-foreground">{nav.roadmap.title}</strong> roadmap.
              It is optional reading — the topics above are what this plan actually covers.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 gap-1.5 rounded-full"
              onClick={() => navigate(`/roadmaps/${nav.roadmap!.slug}`)}
            >
              <Map className="h-3.5 w-3.5" /> Read the roadmap
            </Button>
          </div>
        )}

        {/* The end of a Topic is the start of the next one. Without this the
            learner has to go back to the timeline and find their place again,
            which is where a plan quietly stops being followed. */}
        {nav && (nav.next || nav.previous) && (
          <nav className="mt-8 flex flex-col gap-2 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
            {nav.previous ? (
              <Button
                variant="ghost"
                className="justify-start gap-2 text-muted-foreground"
                onClick={() => navigate(`/career-prep/topic/${nav.previous!.slug}`)}
              >
                <ArrowLeft className="h-4 w-4" /> {nav.previous.title}
              </Button>
            ) : <span />}
            {nav.next && (
              <Button
                className="justify-between gap-3 rounded-full sm:justify-center"
                onClick={() => navigate(`/career-prep/topic/${nav.next!.slug}`)}
              >
                <span className="truncate">Next: {nav.next.title}</span>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </Button>
            )}
          </nav>
        )}
      </div>

      {open && checkpoint && (
        <CheckpointDialog
          topicId={topic.id}
          checkpoint={checkpoint}
          topicTitle={topic.title}
          topic={topic}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
};

export default TopicPage;
