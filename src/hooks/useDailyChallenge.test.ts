import { describe, it, expect } from 'vitest';
import { challengeDate } from './useDailyChallenge';

// The daily challenge is global: everyone must resolve the same date key, or
// two learners in different timezones get different "today" questions and the
// thing stops being discussable.

describe('challengeDate', () => {
  it('formats as YYYY-MM-DD for the date column', () => {
    expect(challengeDate(new Date('2026-08-17T12:00:00Z'))).toBe('2026-08-17');
  });

  it('uses Asia/Dhaka, not the caller — late UTC is already tomorrow there', () => {
    // 2026-08-17T20:00Z is 2026-08-18 02:00 in Dhaka (UTC+6).
    expect(challengeDate(new Date('2026-08-17T20:00:00Z'))).toBe('2026-08-18');
  });

  it('gives the same key regardless of the visitor timezone argument default', () => {
    const instant = new Date('2026-08-17T01:00:00Z');
    expect(challengeDate(instant)).toBe(challengeDate(instant, 'Asia/Dhaka'));
  });

  it('does not roll over early in the Dhaka evening', () => {
    // 17:00Z is 23:00 Dhaka — still the 17th.
    expect(challengeDate(new Date('2026-08-17T17:00:00Z'))).toBe('2026-08-17');
  });
});
