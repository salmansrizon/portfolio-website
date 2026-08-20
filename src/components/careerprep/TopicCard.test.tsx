import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TopicCard from './TopicCard';

const trackMock = vi.hoisted(() => vi.fn());
vi.mock('@/services/funnel', () => ({ track: trackMock }));

const topic = {
  id: 'c1',
  slug: 'window-functions',
  title: 'Window functions',
  what_it_is: 'A calculation across a set of rows related to the current row.',
  why_it_matters: 'Rankings and running totals without collapsing the rows.',
  how_it_works: 'OVER() defines the window; PARTITION BY splits it.',
  analogy: 'Like looking sideways at your neighbours in a queue.',
};

describe('TopicCard', () => {
  beforeEach(() => trackMock.mockClear());

  it('starts collapsed and shows all four parts once opened', async () => {
    const user = userEvent.setup();
    render(<TopicCard topic={topic} surface="roadmap" />);

    expect(screen.queryByText(topic.analogy)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button'));

    expect(screen.getByText(topic.what_it_is)).toBeInTheDocument();
    expect(screen.getByText(topic.why_it_matters)).toBeInTheDocument();
    expect(screen.getByText(topic.how_it_works)).toBeInTheDocument();
    expect(screen.getByText(topic.analogy)).toBeInTheDocument();
  });

  it('records one view however often it is toggled', async () => {
    const user = userEvent.setup();
    render(<TopicCard topic={topic} surface="workspace" />);
    const toggle = screen.getByRole('button');

    await user.click(toggle); // open
    await user.click(toggle); // close
    await user.click(toggle); // open again

    expect(trackMock).toHaveBeenCalledTimes(1);
    expect(trackMock).toHaveBeenCalledWith({
      event: 'topic_viewed',
      surface: 'workspace',
      subjectType: 'topic',
      subjectId: 'c1',
    });
  });

  it('counts a view when it opens itself, as it does after a failed Checkpoint', () => {
    render(<TopicCard topic={topic} surface="checkpoint_failure" defaultOpen />);
    expect(screen.getByText(topic.analogy)).toBeInTheDocument();
    // ponytail: deliberately not tracked on mount — the learner did not act, and
    // an auto-open that self-reports would inflate the one number this exists to
    // measure. The view is recorded when they toggle it.
    expect(trackMock).not.toHaveBeenCalled();
  });
});
