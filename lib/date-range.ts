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

/** 暦年（1/1〜12/31） */
export function rangeForYear(year: number): DateRange {
  return { start: ymd(year, 1, 1), end: ymd(year, 12, 31) };
}

/**
 * 会計年度（6月〜翌5月が一期）。
 * `fiscalStartYear` は期首の6月が属する西暦年（例: 2025 → 2025-06-01〜2026-05-31）。
 */
export function rangeForFiscalYearJuneMay(fiscalStartYear: number): DateRange {
  return {
    start: ymd(fiscalStartYear, 6, 1),
    end: ymd(fiscalStartYear + 1, 5, 31),
  };
}

/** 基準日を含む会計年度の「期首6月」の西暦年 */
export function fiscalStartYearContainingDate(d: Date): number {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  if (m >= 6) return y;
  return y - 1;
}

/** 日付文字列（YYYY-MM-DD）が属する会計年度の期首6月の西暦年 */
export function fiscalStartYearForYmd(dateYmd: string): number {
  const y = Number(dateYmd.slice(0, 4));
  const m = Number(dateYmd.slice(5, 7));
  if (!Number.isFinite(y) || !Number.isFinite(m)) return y;
  if (m >= 6) return y;
  return y - 1;
}

export function isWithinYmdRange(dateYmd: string, range: DateRange): boolean {
  // dateYmd / range are YYYY-MM-DD. Lexicographical comparison is safe.
  return dateYmd >= range.start && dateYmd <= range.end;
}

