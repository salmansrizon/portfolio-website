// Level thresholds from §4 of the careerprep-edtech spec.
//
// Level is ALWAYS derived from XP against this table and never stored, so
// rebalancing is a table edit and nobody is demoted by a migration bug.
//
// Calibrated against ~170 root missions: full XP on first solve only, at
// Easy 10 / Medium 25 / Hard 50, so level 12 takes a genuine run through both
// Journeys. Recheck these numbers if the question library changes size.

export interface Level {
  level: number;
  xp: number;
  /** Only the top three carry a name — playful names on every level read as
   *  unserious on a page a hiring manager may open. */
  name?: string;
}

export const LEVELS: Level[] = [
  { level: 1, xp: 0 },
  { level: 2, xp: 50 },
  { level: 3, xp: 150 },
  { level: 4, xp: 300 },
  { level: 5, xp: 550 },
  { level: 6, xp: 900 },
  { level: 7, xp: 1400 },
  { level: 8, xp: 2000 },
  { level: 9, xp: 2800 },
  { level: 10, xp: 3800, name: 'Analyst' },
  { level: 11, xp: 5000, name: 'Senior Analyst' },
  { level: 12, xp: 6500, name: 'Principal' },
];

export interface LevelStanding {
  level: number;
  name?: string;
  /** XP at which the current level started. */
  floor: number;
  /** XP needed for the next level, or null at the top. */
  next: number | null;
  /** 0-1 progress through the current level; 1 at max level. */
  progress: number;
}

export function levelFor(xp: number): LevelStanding {
  let current = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.xp) current = l;
    else break;
  }
  const next = LEVELS.find((l) => l.level === current.level + 1) ?? null;
  const span = next ? next.xp - current.xp : 0;
  return {
    level: current.level,
    name: current.name,
    floor: current.xp,
    next: next ? next.xp : null,
    progress: next && span > 0 ? Math.min(1, (xp - current.xp) / span) : 1,
  };
}

/**
 * Streak from the dates a learner solved something, counted in their own
 * timezone. "Today or yesterday" keeps the streak alive, so someone who has not
 * solved *yet today* is not punished mid-day.
 *
 * `dates` are ISO timestamps; order does not matter.
 */
export function streakFrom(dates: string[], timeZone = 'Asia/Dhaka'): { current: number; longest: number } {
  if (dates.length === 0) return { current: 0, longest: 0 };

  const dayKey = (d: Date) =>
    new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);

  const days = [...new Set(dates.map((d) => dayKey(new Date(d))))].sort();

  // Longest run of consecutive days anywhere in the history.
  const dayNumber = (key: string) => Math.floor(Date.parse(`${key}T00:00:00Z`) / 86_400_000);
  let longest = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    run = dayNumber(days[i]) - dayNumber(days[i - 1]) === 1 ? run + 1 : 1;
    if (run > longest) longest = run;
  }

  // Current run only counts if it reaches today or yesterday.
  const today = dayNumber(dayKey(new Date()));
  const last = dayNumber(days[days.length - 1]);
  if (today - last > 1) return { current: 0, longest };

  let current = 1;
  for (let i = days.length - 1; i > 0; i--) {
    if (dayNumber(days[i]) - dayNumber(days[i - 1]) === 1) current++;
    else break;
  }
  return { current, longest };
}
