import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShareBar from './ShareBar';

const trackMock = vi.hoisted(() => vi.fn());
vi.mock('@/services/funnel', () => ({ track: trackMock }));

const props = {
  title: 'Rerankers',
  surface: 'topic' as const,
  subjectId: 't1',
  url: 'https://example.com/career-prep/topic/rerankers',
};

describe('ShareBar', () => {
  beforeEach(() => {
    trackMock.mockClear();
    vi.stubGlobal('open', vi.fn());
  });

  it('sends the topic URL to each network, not the current page', async () => {
    const user = userEvent.setup();
    render(<ShareBar {...props} />);

    await user.click(screen.getByLabelText('Share on LinkedIn'));
    const target = (window.open as any).mock.calls[0][0] as string;
    expect(target).toContain(encodeURIComponent(props.url));
  });

  it('records which network was used', async () => {
    const user = userEvent.setup();
    render(<ShareBar {...props} />);

    await user.click(screen.getByLabelText('Share on WhatsApp'));

    expect(trackMock).toHaveBeenCalledWith(
      expect.objectContaining({ event: 'shared', subjectType: 'topic', metadata: { network: 'whatsapp' } }),
    );
  });

  it('survives a clipboard that refuses, which embedded browsers do', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('navigator', {
      ...navigator,
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
    });
    render(<ShareBar {...props} />);

    await user.click(screen.getByLabelText('Copy link'));

    // No throw, and nothing claims success.
    expect(screen.queryByText('Copied')).not.toBeInTheDocument();
  });
});
