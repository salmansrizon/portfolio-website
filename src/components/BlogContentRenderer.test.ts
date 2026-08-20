import { describe, it, expect, vi } from 'vitest';
import { parseBlogContent } from './BlogContentRenderer';

describe('parseBlogContent', () => {
  it('parses a JSON string of blocks', () => {
    const raw = JSON.stringify([{ type: 'text', content: 'hello' }]);
    expect(parseBlogContent(raw)).toEqual([{ type: 'text', content: 'hello' }]);
  });

  it('drops blocks that do not match the union, keeping the valid ones', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const raw = JSON.stringify([
      { type: 'text', content: 'keep' },
      { type: 'text' },                      // missing content
      { type: 'wat', anything: true },       // unknown type
      { type: 'heading', level: 9, content: 'bad level' },
      { type: 'divider' },
    ]);
    expect(parseBlogContent(raw)).toEqual([
      { type: 'text', content: 'keep' },
      { type: 'divider' },
    ]);
  });

  it('keeps a code block caption, which the editor writes', () => {
    const raw = JSON.stringify([{ type: 'code', code: 'select 1', caption: 'a query' }]);
    expect(parseBlogContent(raw)).toEqual([{ type: 'code', code: 'select 1', caption: 'a query' }]);
  });

  it('returns an empty array for null, junk, and non-arrays', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(parseBlogContent(null)).toEqual([]);
    expect(parseBlogContent('not json')).toEqual([]);
    expect(parseBlogContent('{"type":"text"}')).toEqual([]);
  });
});
