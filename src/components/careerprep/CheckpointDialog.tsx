import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { type Checkpoint, useSubmitCheckpoint } from '@/hooks/useCheckpoints';
import TopicCard from './TopicCard';
import type { Topic } from '@/hooks/useTopics';

// The Checkpoint fires as a modal over the Step. Auto-graded, never a written
// answer. A wrong answer is a SOFT gate: "Continue anyway" sits beside "Try
// again", and the copy says plainly that only the certificate needs every
// Checkpoint passed — otherwise learners assume they are blocked and leave.

interface Props {
  topicId: string;
  checkpoint: Checkpoint | null;
  topicTitle: string;
  // The explanation to show on a first failure, if the Topic has one.
  topic?: Topic | null;
  onClose: () => void;
}

const CheckpointDialog = ({ topicId, checkpoint, topicTitle, topic, onClose }: Props) => {
  const [picked, setPicked] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [outcome, setOutcome] = useState<'asking' | 'right' | 'wrong'>('asking');
  // Revealed by the server on submit, not held by the client beforehand.
  const [answer, setAnswer] = useState<string | null>(null);
  const submit = useSubmitCheckpoint(topicId);

  if (!checkpoint) return null;

  const check = async () => {
    if (!picked) return;
    const res = await submit.mutateAsync({
      checkpoint,
      choice: picked,
      firstTry: attempts === 0,
    });
    setAttempts((n) => n + 1);
    setAnswer(res.correctOption);
    setOutcome(res.isCorrect ? 'right' : 'wrong');
  };

  const retry = () => {
    setPicked(null);
    setAnswer(null);
    setOutcome('asking');
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <div className="mb-1 flex items-center gap-2">
          <Badge variant="outline" className="text-[10px]">Checkpoint</Badge>
          <span className="truncate text-xs text-muted-foreground">{topicTitle}</span>
        </div>
        <h2 className="mb-4 text-lg font-bold">{checkpoint.title}</h2>

        {checkpoint.content_md && (
          <p className="mb-4 whitespace-pre-wrap text-sm text-muted-foreground">
            {checkpoint.content_md}
          </p>
        )}

        <div className="space-y-2">
          {checkpoint.options.map((o) => {
            const isPicked = picked === o.label;
            const showWrong = outcome === 'wrong' && isPicked;
            const showRight = outcome !== 'asking' && o.label === answer;
            return (
              <button
                key={o.label}
                disabled={outcome !== 'asking'}
                onClick={() => setPicked(o.label)}
                className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left text-sm transition-colors
                  ${showWrong ? 'border-danger bg-danger-soft' : ''}
                  ${showRight ? 'border-success bg-success-soft' : ''}
                  ${outcome === 'asking' && isPicked ? 'border-primary bg-primary/5' : ''}
                  ${outcome === 'asking' && !isPicked ? 'hover:bg-muted/50' : ''}`}
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border text-xs font-bold">
                  {o.label}
                </span>
                <span className="flex-1">{o.text}</span>
                {showWrong && <XCircle className="h-4 w-4 shrink-0 text-danger" />}
                {showRight && <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />}
              </button>
            );
          })}
        </div>

        {outcome === 'asking' && (
          <Button className="mt-4 w-full rounded-full" disabled={!picked || submit.isPending} onClick={check}>
            Check answer
          </Button>
        )}

        {outcome === 'right' && (
          <div className="mt-4">
            <div className="mb-3 flex items-center gap-2 rounded-xl bg-success-soft p-3">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
              <p className="text-sm font-semibold text-success">
                Step complete{attempts === 1 ? ' — first try' : ''}.
              </p>
            </div>
            <Button className="w-full rounded-full" onClick={onClose}>Continue</Button>
          </div>
        )}

        {outcome === 'wrong' && (
          <div className="mt-4 space-y-3">
            {/* The explanation goes above everything else, and opens itself: a
                learner who just got this wrong has already asked the question
                the card answers. The offer on this Surface waits for a repeat
                failure — showing a sales asset before explaining the mistake is
                the version of this that costs trust. */}
            {attempts < 2 && topic && (
              <TopicCard topic={topic} surface="checkpoint_failure" defaultOpen />
            )}
            <div className="flex items-start gap-2 rounded-xl bg-muted p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                The correct answer is highlighted. <strong>You can carry on to the next Step</strong> —
                only the certificate needs every Checkpoint passed.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-full" onClick={onClose}>
                Continue anyway
              </Button>
              <Button className="flex-1 rounded-full" onClick={retry}>Try again</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CheckpointDialog;
