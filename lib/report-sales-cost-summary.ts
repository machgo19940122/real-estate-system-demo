import type { Invoice, RevenueCategory } from "@/src/data/mock";
import { getPaymentsByInvoiceId } from "@/src/data/mock";

/**
 * 集計画面用: 選択区分で期間内入金・請求税込・原価を集計する。
 * - 期間内入金（totalPaidInPeriod）: キャッシュ計上額
 * - 請求金額税込合計（totalInvoiceRevenue）: 対象請求の税込請求額の合計（利益・利益率の計算ベース）
 * - 原価: 請求ごとに1回だけ加算（税込）。入力された原価を反映
 * - 利益率: (請求税込合計 − 原価合計) ÷ 請求税込合計
 * @param includeInvoicesWithoutPeriodPayment true のとき、期間内入金が0でも請求税込・原価に含める（月次詳細向け）
 */
export function summarizeReportSalesCostMargin(params: {
  periodInvoices: Invoice[];
  sectionIncluded: Record<RevenueCategory, boolean>;
  resolveCategory: (invoice: Invoice) => RevenueCategory | null;
  getPeriodPaidAmount: (invoice: Invoice) => number;
  /** 月次詳細: 対象月に入金がなくても請求税込・原価を集計対象に含める */
  includeInvoicesWithoutPeriodPayment?: boolean;
}): {
  totalPaidInPeriod: number;
  totalInvoiceRevenue: number;
  totalCost: number;
  profitMarginRate: number | undefined;
} {
  const {
    periodInvoices,
    sectionIncluded,
    resolveCategory,
    getPeriodPaidAmount,
    includeInvoicesWithoutPeriodPayment = false,
  } = params;

  let totalPaidInPeriod = 0;
  let totalInvoiceRevenue = 0;
  let totalCost = 0;

  for (const invoice of periodInvoices) {
    const category = resolveCategory(invoice);
    if (category == null || !sectionIncluded[category]) continue;

    const periodPaid = getPeriodPaidAmount(invoice);
    if (!includeInvoicesWithoutPeriodPayment && periodPaid <= 0) continue;

    totalPaidInPeriod += periodPaid;
    totalInvoiceRevenue += invoice.amount;
    totalCost += invoice.cost_amount_including_tax ?? invoice.cost_amount_excluding_tax ?? 0;
  }

  const profitMarginRate =
    totalInvoiceRevenue > 0
      ? (totalInvoiceRevenue - totalCost) / totalInvoiceRevenue
      : undefined;

  return { totalPaidInPeriod, totalInvoiceRevenue, totalCost, profitMarginRate };
}

/** 日付範囲 [start, endExclusive) 内の入金合計 */
export function getInvoicePaidInRange(invoice: Invoice, start: Date, endExclusive: Date): number {
  const isInRange = (dateStr: string) => {
    const d = new Date(dateStr);
    return d >= start && d < endExclusive;
  };
  return getPaymentsByInvoiceId(invoice.id)
    .filter((p) => isInRange(p.payment_date))
    .reduce((sum, p) => sum + p.amount, 0);
}

/** 指定年月内の入金合計 */
export function getInvoicePaidInMonth(invoice: Invoice, year: number, month: number): number {
  return getPaymentsByInvoiceId(invoice.id)
    .filter((p) => {
      const d = new Date(p.payment_date);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    })
    .reduce((sum, p) => sum + p.amount, 0);
}

/** 請求の作成日（created_at）が指定の暦月に含まれるか */
export function isInvoiceCreatedInCalendarMonth(
  invoice: Invoice,
  year: number,
  month: number
): boolean {
  const d = new Date(invoice.created_at);
  return d.getFullYear() === year && d.getMonth() + 1 === month;
}
