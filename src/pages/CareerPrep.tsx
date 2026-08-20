import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import { useQuestions } from '@/hooks/useCareerPrep';
import JourneyPanel from '@/components/careerprep/JourneyPanel';
import { track, trackOnce } from '@/services/funnel';

/**
 * Career Prep is the Journey dashboard.
 *
 * The filterable Library table that used to fill this page is gone: questions
 * are now reached *through* the Journey — the daily challenge, the next-up
 * queue, and Step Checkpoints on a Roadmap. `/career-prep/solve/:slug` is
 * unchanged, so every existing link and bookmark still resolves.
 *
 * The old guest modal is gone with it. It asked for an email and a WhatsApp
 * number *before* letting anyone open a question, which contradicts the rule
 * that nothing blocks learning — and it is redundant now that every visitor is
 * signed in anonymously on arrival. Contact details are asked for once, at the
 * ebook, and progress is claimed at the soft wall after the first success.
 */
const CareerPrep = () => {
  const navigate = useNavigate();
  const { questions } = useQuestions();

  useEffect(() => {
    void trackOnce('arrived', { event: 'arrived', surface: 'lobby' });
    // "returned" is the only retention-side stage, so it fires every visit.
    void track({ event: 'returned', surface: 'lobby' });
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="relative pt-32 pb-8 overflow-hidden">
        <main className="container max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col gap-4 mb-2">
            <Badge className="bg-primary/10 text-primary border-primary/20 w-fit px-4 py-1.5 font-semibold">
              Mission Command
            </Badge>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
              <span className="text-primary">Career Missions</span>
              <br />
              <span className="text-foreground">Master your skills by solving real-world Challenges</span>
            </h1>
          </div>
        </main>
      </div>

      <JourneyPanel
        questions={questions}
        onOpenQuestion={(slug) => navigate(`/career-prep/solve/${slug}`)}
      />
    </div>
  );
};

export default CareerPrep;
