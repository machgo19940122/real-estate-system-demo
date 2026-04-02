import type { Invoice, RevenueCategory } from "@/src/data/mock";
import { getPaymentsByInvoiceId } from "@/src/data/mock";

/**
 * 集計画面用: 選択区分・期間内入金ベースで売上合計・原価合計・利益率を求める。
 * 原価は請求ごとに1回だけ加算（税込）。入金が期間内にあれば請求全体の原価を足す。
 */
export function summarizeReportSalesCostMargin(params: {
  periodInvoices: Invoice[];
  sectionIncluded: Record<RevenueCategory, boolean>;
  resolveCategory: (invoice: Invoice) => RevenueCategory | null;
  getPeriodPaidAmount: (invoice: Invoice) => number;
}): {
  totalSales: number;
  totalCost: number;
  profitMarginRate: number | undefined;
} {
  const { periodInvoices, sectionIncluded, resolveCategory, getPeriodPaidAmount } = params;

  let totalSales = 0;
  let totalCost = 0;

  for (const invoice of periodInvoices) {
    const category = resolveCategory(invoice);
    if (category == null || !sectionIncluded[category]) continue;

    const periodPaid = getPeriodPaidAmount(invoice);
    if (periodPaid <= 0) continue;

    totalSales += periodPaid;
    totalCost += invoice.cost_amount_including_tax ?? invoice.cost_amount_excluding_tax ?? 0;
  }

  const profitMarginRate = totalSales > 0 ? (totalSales - totalCost) / totalSales : undefined;

  return { totalSales, totalCost, profitMarginRate };
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
