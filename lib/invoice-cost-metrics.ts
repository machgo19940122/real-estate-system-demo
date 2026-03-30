import type { Invoice } from "@/src/data/mock";

/** 入力文字列から原価（税抜・円）を解釈。空なら undefined */
export function parseInvoiceCostInput(raw: string): number | undefined {
  const t = raw.trim().replace(/,/g, "");
  if (t === "") return undefined;
  const n = Number(t);
  if (Number.isNaN(n)) return undefined;
  return Math.max(0, Math.floor(n));
}

/**
 * 税抜売上（明細小計）と原価から、保存用フィールドを求める。
 * 原価未入力時は undefined を返す（呼び出し側で各キーを明示クリアすること）。
 */
export function deriveInvoiceCostFields(
  subtotalExcludingTax: number,
  costExcludingTax: number | undefined
): Pick<Invoice, "cost_amount_excluding_tax" | "cost_rate" | "profit_margin_rate"> {
  if (costExcludingTax === undefined) {
    return {};
  }
  const sub = Math.max(0, subtotalExcludingTax);
  const cost = Math.max(0, Math.floor(costExcludingTax));
  if (sub <= 0) {
    return {
      cost_amount_excluding_tax: cost,
      cost_rate: undefined,
      profit_margin_rate: undefined,
    };
  }
  return {
    cost_amount_excluding_tax: cost,
    cost_rate: cost / sub,
    profit_margin_rate: (sub - cost) / sub,
  };
}

/** 利益率（0〜1）を表示用パーセントに */
export function formatProfitMarginRate(rate: number | undefined | null): string {
  if (rate == null || Number.isNaN(rate)) return "—";
  return `${(rate * 100).toFixed(1)}%`;
}

/** 請求の税抜売上（明細金額の合計） */
export function invoiceSubtotalExcludingTax(inv: Invoice): number {
  return (inv.items ?? []).reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
}

/**
 * 請求行の表示用利益率（税抜売上基準）。保存済み profit_margin_rate があれば優先。
 */
export function invoiceProfitMarginRateForDisplay(inv: Invoice): number | undefined {
  if (inv.profit_margin_rate != null) return inv.profit_margin_rate;
  const sub = invoiceSubtotalExcludingTax(inv);
  const c = inv.cost_amount_excluding_tax;
  if (c == null || sub <= 0) return undefined;
  return (sub - c) / sub;
}

/** 編集中プレビュー: 税抜小計と原価文字列から利益率（0〜1） */
export function previewProfitMarginRate(
  subtotalExcludingTax: number,
  costInputRaw: string
): number | undefined {
  const cost = parseInvoiceCostInput(costInputRaw);
  if (cost === undefined) return undefined;
  const sub = Math.max(0, subtotalExcludingTax);
  if (sub <= 0) return undefined;
  return (sub - cost) / sub;
}

/** フォームの原価入力から updateInvoice 用の差分（未入力時はフィールドをクリア） */
export function invoiceCostPatchFromForm(
  subtotalExcludingTax: number,
  costInputRaw: string
): Partial<Pick<Invoice, "cost_amount_excluding_tax" | "cost_rate" | "profit_margin_rate">> {
  const cost = parseInvoiceCostInput(costInputRaw);
  if (cost === undefined) {
    return {
      cost_amount_excluding_tax: undefined,
      cost_rate: undefined,
      profit_margin_rate: undefined,
    };
  }
  return deriveInvoiceCostFields(subtotalExcludingTax, cost);
}
