import {
  createGeneralLineItem,
  getLineDisplayAmount,
  normalizeEstimateLineItem,
  type EstimateLineItemForm,
} from "@/lib/estimate-units";
import type { EstimateItem, EstimateLineKind, InvoiceItem } from "@/src/data/mock";

/** 見積・請求の永続化明細行（共通フィールド） */
export type DocumentLineItemSource = {
  id: number;
  line_kind?: EstimateLineKind;
  name: string;
  quantity: number;
  unit?: string;
  unit_price: number;
  amount: number;
};

export function persistedLineToForm(it: DocumentLineItemSource): EstimateLineItemForm {
  const kind = it.line_kind ?? "general";
  return normalizeEstimateLineItem({
    id: it.id,
    line_kind: kind,
    name: it.name,
    quantity: it.quantity,
    unit: it.unit,
    unit_price: it.unit_price,
    direct_amount: kind === "general" ? 0 : it.amount,
  });
}

export function formToEstimateItem(it: EstimateLineItemForm): EstimateItem {
  return {
    id: it.id,
    line_kind: it.line_kind,
    name: it.name,
    quantity: it.line_kind === "general" ? it.quantity : 0,
    unit: it.unit,
    unit_price: it.line_kind === "general" ? it.unit_price : 0,
    amount: getLineDisplayAmount(it) ?? 0,
  };
}

export function formToInvoiceItem(it: EstimateLineItemForm): InvoiceItem {
  return formToEstimateItem(it);
}

/** 永続化明細の amount を種別に応じて正規化 */
export function normalizePersistedLineAmount(it: DocumentLineItemSource): number {
  return getLineDisplayAmount(persistedLineToForm(it)) ?? 0;
}

export function normalizePersistedLineItem<T extends DocumentLineItemSource>(it: T): T {
  const kind = it.line_kind ?? "general";
  const amount = normalizePersistedLineAmount(it);
  return {
    ...it,
    line_kind: kind,
    quantity: kind === "general" ? Number(it.quantity) || 0 : 0,
    unit_price: kind === "general" ? Number(it.unit_price) || 0 : 0,
    amount,
  };
}

/** 見積明細を請求フォーム用の行に変換（IDはそのまま引き継ぎ） */
export function buildLineItemsFromEstimateItems(
  items: EstimateItem[]
): EstimateLineItemForm[] {
  if (items.length === 0) {
    return [createGeneralLineItem(Date.now() * 1000)];
  }
  return items.map((it) => persistedLineToForm(it));
}
