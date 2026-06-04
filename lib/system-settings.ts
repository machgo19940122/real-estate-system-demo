import { todayYmd } from "@/lib/invoice-dates";

export type AmountRoundingMode = "floor" | "round" | "ceil";

/** 適用開始日ごとの消費税率（古い順に並べる想定） */
export type TaxRateStep = {
  id: string;
  /** 税率（小数。0.1 = 10%） */
  rate: number;
  /** 適用開始日（YYYY-MM-DD・この日を含む） */
  effective_from: string;
};

export type SystemSettings = {
  /** 消費税率（適用開始日の昇順で登録） */
  tax_rates: TaxRateStep[];
  /** 税額・金額の端数処理 */
  amount_rounding: AmountRoundingMode;
  /** 基準となる会計期（例: 58） */
  period_anchor_number: number;
  /** その期の開始日（YYYY-MM-DD） */
  period_anchor_start: string;
  /** 毎年の期切替月（1〜12。例: 6月期なら 6） */
  fiscal_year_start_month: number;
  /** 毎年の期切替日（1〜31） */
  fiscal_year_start_day: number;
  /** 社名（請求書・見積の印字） */
  company_name: string;
  /** 住所 */
  company_address: string;
  /** 代表者名 */
  representative_name: string;
};

export type CompanyInfo = Pick<
  SystemSettings,
  "company_name" | "company_address" | "representative_name"
>;

export const SYSTEM_SETTINGS_UPDATED_EVENT = "system-settings-updated";

const STORAGE_KEY = "demo_system_settings_v1";

export const AMOUNT_ROUNDING_OPTIONS: { value: AmountRoundingMode; label: string }[] = [
  { value: "floor", label: "切捨て" },
  { value: "round", label: "四捨五入" },
  { value: "ceil", label: "切上げ" },
];

export const DEFAULT_TAX_RATES: TaxRateStep[] = [
  { id: "tax-1", rate: 0.08, effective_from: "2014-04-01" },
  { id: "tax-2", rate: 0.1, effective_from: "2019-10-01" },
  { id: "tax-3", rate: 0.05, effective_from: "2027-01-01" },
];

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  tax_rates: DEFAULT_TAX_RATES,
  amount_rounding: "floor",
  period_anchor_number: 58,
  period_anchor_start: "2025-06-01",
  fiscal_year_start_month: 6,
  fiscal_year_start_day: 1,
  company_name: "株式会社デモ建設",
  company_address: "東京都渋谷区神南1-1-1",
  representative_name: "山田 太郎",
};

function clampRate(rate: number): number {
  if (!Number.isFinite(rate)) return 0;
  return Math.min(1, Math.max(0, rate));
}

function normalizeRoundingMode(mode: unknown): AmountRoundingMode {
  if (mode === "round" || mode === "ceil" || mode === "floor") return mode;
  return DEFAULT_SYSTEM_SETTINGS.amount_rounding;
}

function clampPeriodNumber(n: number): number {
  return Math.max(1, Math.min(99, Math.floor(n) || 1));
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function ymdParts(year: number, month1to12: number, day: number): string {
  const dayClamped = Math.min(
    Math.max(1, day),
    new Date(year, month1to12, 0).getDate()
  );
  return `${year}-${pad2(month1to12)}-${pad2(dayClamped)}`;
}

function clampFiscalStartMonth(m: unknown): number {
  const n = Math.floor(Number(m));
  if (!Number.isFinite(n) || n < 1 || n > 12) return DEFAULT_SYSTEM_SETTINGS.fiscal_year_start_month;
  return n;
}

function clampFiscalStartDay(d: unknown, month: number): number {
  const n = Math.floor(Number(d));
  const max = new Date(2024, month, 0).getDate();
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, max);
}

/** 会計年度インデックス（期首月日が属する西暦年。6月期なら 2025-07-01 → 2025） */
export function fiscalYearIndexForYmd(
  dateYmd: string,
  startMonth: number,
  startDay: number
): number {
  const y = Number(dateYmd.slice(0, 4));
  const m = Number(dateYmd.slice(5, 7));
  const d = Number(dateYmd.slice(8, 10));
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return y;
  const onOrAfterStart = m > startMonth || (m === startMonth && d >= startDay);
  return onOrAfterStart ? y : y - 1;
}

type PeriodSettingsSlice = Pick<
  SystemSettings,
  | "period_anchor_number"
  | "period_anchor_start"
  | "fiscal_year_start_month"
  | "fiscal_year_start_day"
>;

/** 旧設定（現在の期＋切替日）から基準期へ移行 */
function migratePeriodFields(
  raw: Partial<SystemSettings> & {
    current_period?: number;
    period_change_date?: string;
  }
): PeriodSettingsSlice {
  if (raw.period_anchor_start?.trim() && raw.period_anchor_number != null) {
    const month = clampFiscalStartMonth(raw.fiscal_year_start_month);
    return {
      period_anchor_number: clampPeriodNumber(Number(raw.period_anchor_number)),
      period_anchor_start: raw.period_anchor_start.trim(),
      fiscal_year_start_month: month,
      fiscal_year_start_day: clampFiscalStartDay(raw.fiscal_year_start_day, month),
    };
  }

  const legacyPeriod = clampPeriodNumber(
    Number(raw.current_period) || DEFAULT_SYSTEM_SETTINGS.period_anchor_number
  );
  const legacyChange =
    raw.period_change_date?.trim() || "2026-06-01";
  const changeY = Number(legacyChange.slice(0, 4));
  const changeM = Number(legacyChange.slice(5, 7));
  const changeD = Number(legacyChange.slice(8, 10));
  const month = Number.isFinite(changeM) ? changeM : 6;
  const day = Number.isFinite(changeD) ? changeD : 1;
  const anchorY = Number.isFinite(changeY) ? changeY - 1 : 2025;

  return {
    period_anchor_number: legacyPeriod,
    period_anchor_start: ymdParts(anchorY, month, day),
    fiscal_year_start_month: month,
    fiscal_year_start_day: day,
  };
}

/** 指定した期の開始日 */
export function getPeriodStartYmd(
  periodNumber: number,
  settings: PeriodSettingsSlice = loadSystemSettings()
): string {
  const anchorIdx = fiscalYearIndexForYmd(
    settings.period_anchor_start,
    settings.fiscal_year_start_month,
    settings.fiscal_year_start_day
  );
  const fy = anchorIdx + (periodNumber - settings.period_anchor_number);
  return ymdParts(fy, settings.fiscal_year_start_month, settings.fiscal_year_start_day);
}

function addDaysYmd(dateYmd: string, days: number): string {
  const [y, m, d] = dateYmd.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return ymdParts(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());
}

export type FiscalPeriodRange = {
  period: number;
  start: string;
  end: string;
  nextStart: string;
};

/** 指定日が属する会計期の範囲 */
export function getFiscalPeriodRangeForDate(
  asOfYmd: string,
  settings: SystemSettings = loadSystemSettings()
): FiscalPeriodRange {
  const period = getInvoicePeriodForDate(asOfYmd, settings);
  const start = getPeriodStartYmd(period, settings);
  const nextStart = getPeriodStartYmd(period + 1, settings);
  return {
    period,
    start,
    end: addDaysYmd(nextStart, -1),
    nextStart,
  };
}

/** 指定日の会計期（請求番号採番用） */
export function getInvoicePeriodForDate(
  asOfYmd: string,
  settings: SystemSettings = loadSystemSettings()
): number {
  const anchorIdx = fiscalYearIndexForYmd(
    settings.period_anchor_start,
    settings.fiscal_year_start_month,
    settings.fiscal_year_start_day
  );
  const asOfIdx = fiscalYearIndexForYmd(
    asOfYmd,
    settings.fiscal_year_start_month,
    settings.fiscal_year_start_day
  );
  return clampPeriodNumber(settings.period_anchor_number + (asOfIdx - anchorIdx));
}

type LegacyTaxSettings = {
  tax_rate_1?: number;
  tax_rate_1_effective_from?: string;
  tax_rate_2?: number;
  tax_rate_2_effective_from?: string;
  consumption_tax_schedules?: Array<{ rate: number; effective_from: string }>;
};

function newTaxRateStepId(): string {
  return `tax-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function createTaxRateStep(
  partial?: Partial<TaxRateStep>
): TaxRateStep {
  return {
    id: partial?.id?.trim() || newTaxRateStepId(),
    rate: clampRate(Number(partial?.rate ?? 0.1)),
    effective_from: partial?.effective_from?.trim() || todayYmd(),
  };
}

export function normalizeTaxRates(steps: TaxRateStep[]): TaxRateStep[] {
  const normalized = steps.map((s, i) => ({
    id: s.id?.trim() || `tax-${i + 1}`,
    rate: clampRate(Number(s.rate)),
    effective_from: s.effective_from?.trim() || "2019-10-01",
  }));
  normalized.sort((a, b) =>
    a.effective_from < b.effective_from ? -1 : a.effective_from > b.effective_from ? 1 : 0
  );
  return normalized;
}

function migrateTaxRates(
  raw: Partial<SystemSettings> & LegacyTaxSettings
): TaxRateStep[] {
  if (raw.tax_rates?.length) {
    return normalizeTaxRates(raw.tax_rates);
  }

  if (raw.tax_rate_1 != null && raw.tax_rate_2 != null) {
    const steps: TaxRateStep[] = [
      {
        id: "legacy-1",
        rate: clampRate(Number(raw.tax_rate_1)),
        effective_from:
          raw.tax_rate_1_effective_from?.trim() || "2014-04-01",
      },
      {
        id: "legacy-2",
        rate: clampRate(Number(raw.tax_rate_2)),
        effective_from:
          raw.tax_rate_2_effective_from?.trim() || "2019-10-01",
      },
    ];
    return normalizeTaxRates(steps);
  }

  if (raw.consumption_tax_schedules?.length) {
    return normalizeTaxRates(
      raw.consumption_tax_schedules.map((s, i) => ({
        id: `legacy-${i + 1}`,
        rate: clampRate(Number(s.rate)),
        effective_from: s.effective_from?.trim() || "2019-10-01",
      }))
    );
  }

  return DEFAULT_TAX_RATES;
}

export function validateTaxRates(rates: TaxRateStep[]): string | null {
  if (rates.length === 0) return "税率を1件以上登録してください。";
  for (let i = 0; i < rates.length; i++) {
    const r = rates[i];
    if (!r.effective_from) return `${i + 1}件目の適用開始日を入力してください。`;
    if (i > 0 && rates[i - 1].effective_from >= r.effective_from) {
      return "適用開始日は古い税率から昇順になるよう並べてください。";
    }
  }
  return null;
}

function normalizeSettings(
  raw: Partial<SystemSettings> & LegacyTaxSettings & {
    current_period?: number;
    period_change_date?: string;
  }
): SystemSettings {
  const d = { ...DEFAULT_SYSTEM_SETTINGS, ...raw };
  const period = migratePeriodFields(d);
  return {
    tax_rates: migrateTaxRates(d),
    amount_rounding: normalizeRoundingMode(d.amount_rounding),
    ...period,
    company_name: d.company_name?.trim() ?? "",
    company_address: d.company_address?.trim() ?? "",
    representative_name: d.representative_name?.trim() ?? "",
  };
}

/** 税額・金額の端数処理を適用（円単位想定） */
export function applyAmountRounding(
  value: number,
  mode: AmountRoundingMode = DEFAULT_SYSTEM_SETTINGS.amount_rounding
): number {
  if (!Number.isFinite(value)) return 0;
  switch (mode) {
    case "round":
      return Math.round(value);
    case "ceil":
      return Math.ceil(value);
    case "floor":
    default:
      return Math.floor(value);
  }
}

export function formatRoundingModeLabel(mode: AmountRoundingMode): string {
  return AMOUNT_ROUNDING_OPTIONS.find((o) => o.value === mode)?.label ?? mode;
}

export function getCompanyInfo(
  settings: SystemSettings = loadSystemSettings()
): CompanyInfo {
  return {
    company_name: settings.company_name,
    company_address: settings.company_address,
    representative_name: settings.representative_name,
  };
}

export function loadSystemSettings(): SystemSettings {
  if (typeof window === "undefined") return DEFAULT_SYSTEM_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SYSTEM_SETTINGS;
    return normalizeSettings(JSON.parse(raw) as Partial<SystemSettings>);
  } catch {
    return DEFAULT_SYSTEM_SETTINGS;
  }
}

export function saveSystemSettings(next: SystemSettings): SystemSettings {
  const normalized = normalizeSettings(next);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new Event(SYSTEM_SETTINGS_UPDATED_EVENT));
  }
  return normalized;
}

/** 指定日に適用する消費税率（その日以前で最も新しい適用開始日の税率） */
export function getTaxRateForDate(
  dateYmd: string,
  settings: SystemSettings = loadSystemSettings()
): number {
  const d = dateYmd.trim();
  const rates = settings.tax_rates;
  const candidates = rates
    .filter((step) => d >= step.effective_from)
    .sort((a, b) =>
      a.effective_from < b.effective_from ? -1 : a.effective_from > b.effective_from ? 1 : 0
    );
  return candidates.at(-1)?.rate ?? rates.at(-1)?.rate ?? 0.1;
}

export function formatTaxRatePercent(rate: number): string {
  const pct = rate * 100;
  return Number.isInteger(pct) ? String(pct) : pct.toFixed(1).replace(/\.0$/, "");
}

export function formatTaxRateLabel(rate: number): string {
  return `消費税（${formatTaxRatePercent(rate)}%）`;
}

export function calcTaxFromSubtotal(
  subtotal: number,
  taxRate: number,
  settings: SystemSettings = loadSystemSettings()
): number {
  return applyAmountRounding(subtotal * taxRate, settings.amount_rounding);
}

export function calcTaxAmount(
  subtotal: number,
  dateYmd?: string,
  settings?: SystemSettings
): number {
  const s = settings ?? loadSystemSettings();
  const rate = getTaxRateForDate(dateYmd ?? todayYmd(), s);
  return calcTaxFromSubtotal(subtotal, rate, s);
}

/** 請求番号採番に使う会計期（本日基準） */
export function getEffectiveInvoicePeriod(
  asOfYmd: string = todayYmd(),
  settings: SystemSettings = loadSystemSettings()
): number {
  return getInvoicePeriodForDate(asOfYmd, settings);
}

/** UI入力用: パーセント → 小数 */
export function percentToRate(percentStr: string): number {
  const n = Number(percentStr.replace(/%/g, "").trim());
  if (!Number.isFinite(n)) return 0;
  return clampRate(n / 100);
}

/** UI表示用: 小数 → パーセント文字列 */
export function rateToPercentInput(rate: number): string {
  return formatTaxRatePercent(rate);
}
