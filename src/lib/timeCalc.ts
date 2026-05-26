export interface TimeUnits {
  years: number;
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  ms: number;
}

export interface GridInfo {
  /** 0-based index of the square that is currently "active" (being consumed) */
  currentIndex: number;
  /** total squares in the grid */
  total: number;
  /** fraction [0,1] of how far through the current square we are */
  progress: number;
}

export function calculateTimeUnits(daysRemaining: number, earnedMinutes: number): TimeUnits {
  const totalMs = (daysRemaining * 86_400_000) + (earnedMinutes * 60_000);

  const years = totalMs / (365.25 * 86_400_000);
  const weeks = totalMs / (7 * 86_400_000);
  const days = totalMs / 86_400_000;
  const hours = totalMs / 3_600_000;
  const minutes = totalMs / 60_000;
  const seconds = totalMs / 1_000;
  const ms = totalMs;

  return { years, weeks, days, hours, minutes, seconds, ms };
}

/** Returns live TimeUnits based on the current wall clock, anchored to daysRemaining at midnight. */
export function getLiveTimeUnits(daysRemaining: number, earnedMinutes: number): TimeUnits {
  const now = new Date();
  const secondsIntoDay =
    now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds() + now.getMilliseconds() / 1000;
  // daysRemaining is from midnight tonight; subtract the seconds already elapsed today
  const totalMs =
    (daysRemaining * 86_400_000) + (earnedMinutes * 60_000) - (secondsIntoDay * 1000);

  const years = totalMs / (365.25 * 86_400_000);
  const weeks = totalMs / (7 * 86_400_000);
  const days = totalMs / 86_400_000;
  const hours = totalMs / 3_600_000;
  const minutes = totalMs / 60_000;
  const seconds = totalMs / 1_000;
  const ms = totalMs;

  return { years, weeks, days, hours, minutes, seconds, ms };
}

// ── Grid helpers ──────────────────────────────────────────────────────────────

/** How many years into the current life-year are we? Used for the Years grid. */
export function getCurrentYearProgress(units: TimeUnits, totalLifeYears: number): GridInfo {
  const floored = Math.floor(units.years);
  const progress = units.years - floored;
  // grid shows all life-years; current square = remaining whole years (counting down from top)
  const currentIndex = Math.max(0, floored);
  return { currentIndex, total: Math.ceil(totalLifeYears), progress };
}

/** Days grid: each square = 1 day. Current square = remaining whole days. */
export function getDayGridInfo(units: TimeUnits): GridInfo {
  const floored = Math.floor(units.days);
  const progress = units.days - floored;
  return { currentIndex: floored, total: floored + 1, progress };
}

/** Hours grid within the current day: 0–23. */
export function getHourOfDayGridInfo(units: TimeUnits): GridInfo {
  const now = new Date();
  const currentHour = now.getHours();
  const minutesFraction = (now.getMinutes() * 60 + now.getSeconds()) / 3600;
  const progress = minutesFraction;
  return { currentIndex: currentHour, total: 24, progress };
}

/** Minutes grid within the current hour: 0–59. */
export function getMinuteOfHourGridInfo(units: TimeUnits): GridInfo {
  const now = new Date();
  const currentMinute = now.getMinutes();
  const secondsFraction = (now.getSeconds() + now.getMilliseconds() / 1000) / 60;
  const progress = secondsFraction;
  return { currentIndex: currentMinute, total: 60, progress };
}

/** Seconds grid within the current minute: 0–59. */
export function getSecondOfMinuteGridInfo(units: TimeUnits): GridInfo {
  const now = new Date();
  const currentSecond = now.getSeconds();
  const msFraction = now.getMilliseconds() / 1000;
  const progress = msFraction;
  return { currentIndex: currentSecond, total: 60, progress };
}
