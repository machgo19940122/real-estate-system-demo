import type { Invoice } from "@/src/data/mock";

/** 入力文字列から原価（税込・円）を解釈。空なら undefined */
export function parseInvoiceCostInput(raw: string): number | undefined {
  const t = raw.trim().replace(/,/g, "");
  if (t === "") return undefined;
  const n = Number(t);
  if (Number.isNaN(n)) return undefined;
  return Math.max(0, Math.floor(n));
}

/**
 * 税込売上（請求合計）と原価（税込）から、保存用フィールドを求める。
 * 原価未入力時は undefined を返す（呼び出し側で各キーを明示クリアすること）。
 */
export function deriveInvoiceCostFields(
  totalIncludingTax: number,
  costIncludingTax: number | undefined
): Pick<Invoice, "cost_amount_including_tax" | "cost_rate" | "profit_margin_rate"> {
  if (costIncludingTax === undefined) {
    return {};
  }
  const sales = Math.max(0, totalIncludingTax);
  const cost = Math.max(0, Math.floor(costIncludingTax));
  if (sales <= 0) {
    return {
      cost_amount_including_tax: cost,
      cost_rate: undefined,
      profit_margin_rate: undefined,
    };
  }
  return {
    cost_amount_including_tax: cost,
    cost_rate: cost / sales,
    profit_margin_rate: (sales - cost) / sales,
  };
}

/** 利益率（0〜1）を表示用パーセントに */
export function formatProfitMarginRate(rate: number | undefined | null): string {
  if (rate == null || Number.isNaN(rate)) return "—";
  return `${(rate * 100).toFixed(1)}%`;
}

/** 請求の売上（税込） */
export function invoiceSalesIncludingTax(inv: Invoice): number {
  return Math.max(0, Math.floor(Number(inv.amount) || 0));
}

/** 請求の原価（税込）。税込を優先し、なければ互換として税抜を使用 */
export function invoiceCostIncludingTaxForDisplay(inv: Invoice): number | undefined {
  if (inv.cost_amount_including_tax != null) return inv.cost_amount_including_tax;
  if (inv.cost_amount_excluding_tax != null) return inv.cost_amount_excluding_tax;
  return undefined;
}

/**
 * 請求行の表示用利益率（税込売上基準）。保存済み profit_margin_rate があれば優先。
 */
export function invoiceProfitMarginRateForDisplay(inv: Invoice): number | undefined {
  if (inv.profit_margin_rate != null) return inv.profit_margin_rate;
  const sales = invoiceSalesIncludingTax(inv);
  const c = invoiceCostIncludingTaxForDisplay(inv);
  if (c == null || sales <= 0) return undefined;
  return (sales - c) / sales;
}

/** 表示用利益額（税込） */
export function invoiceProfitAmountIncludingTaxForDisplay(inv: Invoice): number | undefined {
  const sales = invoiceSalesIncludingTax(inv);
  const c = invoiceCostIncludingTaxForDisplay(inv);
  if (c == null) return undefined;
  return Math.max(0, sales - c);
}

/** 編集中プレビュー: 税込合計と原価文字列から利益率（0〜1） */
export function previewProfitMarginRate(
  totalIncludingTax: number,
  costInputRaw: string
): number | undefined {
  const cost = parseInvoiceCostInput(costInputRaw);
  if (cost === undefined) return undefined;
  const sales = Math.max(0, totalIncludingTax);
  if (sales <= 0) return undefined;
  return (sales - cost) / sales;
}

/** 編集中プレビュー: 税込合計と原価文字列から利益額（税込） */
export function previewProfitAmountIncludingTax(
  totalIncludingTax: number,
  costInputRaw: string
): number | undefined {
  const cost = parseInvoiceCostInput(costInputRaw);
  if (cost === undefined) return undefined;
  const sales = Math.max(0, totalIncludingTax);
  return Math.max(0, sales - Math.max(0, Math.floor(cost)));
}

export type InvoiceCostPatch = Partial<
  Pick<
    Invoice,
    | "cost_amount_including_tax"
    | "cost_rate"
    | "profit_margin_rate"
    | "cost_amount_updated_at"
  >
>;

/** 保存用: 原価更新日時（クライアントのローカル時刻） */
export function costAmountUpdatedAtNow(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/** ヘルパー表示用（例: 最終更新: 2026/06/04 15:30） */
export function formatInvoiceCostAmountUpdatedAtLine(
  updatedAt?: string | null
): string | null {
  if (!updatedAt?.trim()) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/.exec(updatedAt.trim());
  if (m) {
    return `最終更新: ${m[1]}/${m[2]}/${m[3]} ${m[4]}:${m[5]}`;
  }
  const d = new Date(updatedAt);
  if (Number.isNaN(d.getTime())) return null;
  const parts = d.toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `最終更新: ${parts}`;
}

function normalizedStoredCost(cost: number | undefined): number | undefined {
  if (cost == null || Number.isNaN(cost)) return undefined;
  return Math.max(0, Math.floor(cost));
}

/** フォームの原価入力から updateInvoice 用の差分（未入力時はフィールドをクリア） */
export function invoiceCostPatchFromForm(
  totalIncludingTax: number,
  costInputRaw: string,
  previousCostIncludingTax?: number
): InvoiceCostPatch {
  const cost = parseInvoiceCostInput(costInputRaw);
  const prev = normalizedStoredCost(previousCostIncludingTax);

  if (cost === undefined) {
    const cleared: InvoiceCostPatch = {
      cost_amount_including_tax: undefined,
      cost_rate: undefined,
      profit_margin_rate: undefined,
    };
    if (prev !== undefined) {
      return { ...cleared, cost_amount_updated_at: undefined };
    }
    return cleared;
  }

  const fields = deriveInvoiceCostFields(totalIncludingTax, cost);
  if (prev !== cost) {
    return { ...fields, cost_amount_updated_at: costAmountUpdatedAtNow() };
  }
  return fields;
}
