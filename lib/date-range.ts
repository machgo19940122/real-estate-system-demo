export type PeriodMode = "all" | "month" | "half" | "year" | "custom";

export type HalfKey = "H1" | "H2";

export type DateRange = { start: string; end: string };

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function ymd(year: number, month: number, day: number): string {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function lastDayOfMonth(year: number, month1to12: number): number {
  return new Date(year, month1to12, 0).getDate();
}

export function rangeForMonth(year: number, month1to12: number): DateRange {
  return {
    start: ymd(year, month1to12, 1),
    end: ymd(year, month1to12, lastDayOfMonth(year, month1to12)),
  };
}

export function rangeForHalf(year: number, half: HalfKey): DateRange {
  if (half === "H1") return { start: ymd(year, 1, 1), end: ymd(year, 6, 30) };
  return { start: ymd(year, 7, 1), end: ymd(year, 12, 31) };
}

export function rangeForYear(year: number): DateRange {
  return { start: ymd(year, 1, 1), end: ymd(year, 12, 31) };
}

export function isWithinYmdRange(dateYmd: string, range: DateRange): boolean {
  // dateYmd / range are YYYY-MM-DD. Lexicographical comparison is safe.
  return dateYmd >= range.start && dateYmd <= range.end;
}

