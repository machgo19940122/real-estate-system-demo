/** 見積明細の単位（セレクト選択） */
export const ESTIMATE_UNITS = [
  "式",
  "㎡",
  "m",
  "台",
  "個",
  "本",
  "セット",
  "人工",
  "ヶ月",
  "回",
] as const;

export type EstimateUnit = (typeof ESTIMATE_UNITS)[number];

export const DEFAULT_ESTIMATE_UNIT: EstimateUnit = "式";

/** 見積明細の行種別 */
export type EstimateLineKind = "general" | "discount" | "comment" | "subtotal";

export const ESTIMATE_LINE_KIND_LABELS: Record<EstimateLineKind, string> = {
  general: "一般項目",
  discount: "値引き",
  comment: "コメント",
  subtotal: "小計",
};

/** 行追加時に種別セレクトで選べる項目（小計は専用ボタン） */
export const ESTIMATE_LINE_KIND_SELECT_OPTIONS: EstimateLineKind[] = [
  "general",
  "discount",
  "comment",
];

export type EstimateLineItemForm = {
  id: number;
  line_kind: EstimateLineKind;
  name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  /** 値引き・小計の直接入力金額 */
  direct_amount: number;
};

export function calcEstimateLineAmount(quantity: number, unitPrice: number): number {
  return (Number(quantity) || 0) * (Number(unitPrice) || 0);
}

export function getLineDisplayAmount(item: EstimateLineItemForm): number | null {
  switch (item.line_kind) {
    case "general":
      return calcEstimateLineAmount(item.quantity, item.unit_price);
    case "discount":
    case "subtotal":
      return Number(item.direct_amount) || 0;
    case "comment":
      return null;
    default:
      return null;
  }
}

/** 見積合計に含める明細の税抜小計（小計行・コメント行は除外） */
export function calcEstimateTaxableSubtotal(items: EstimateLineItemForm[]): number {
  return items.reduce((sum, item) => {
    if (item.line_kind === "comment" || item.line_kind === "subtotal") return sum;
    if (item.line_kind === "general") {
      return sum + calcEstimateLineAmount(item.quantity, item.unit_price);
    }
    if (item.line_kind === "discount") {
      return sum + (Number(item.direct_amount) || 0);
    }
    return sum;
  }, 0);
}

function nextLineId(items: EstimateLineItemForm[]): number {
  return items.length ? Math.max(...items.map((i) => i.id)) + 1 : 1;
}

/** 指定行を複製し、一覧の末尾に追加する */
export function duplicateEstimateLineItem(
  items: EstimateLineItemForm[],
  sourceId: number
): EstimateLineItemForm[] {
  const source = items.find((i) => i.id === sourceId);
  if (!source) return items;
  return [...items, { ...source, id: nextLineId(items) }];
}

/** 行の表示順を1つ上／下に移動 */
export function moveEstimateLineItem(
  items: EstimateLineItemForm[],
  sourceId: number,
  direction: "up" | "down"
): EstimateLineItemForm[] {
  const index = items.findIndex((i) => i.id === sourceId);
  if (index < 0) return items;
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function createGeneralLineItem(id?: number): EstimateLineItemForm {
  return {
    id: id ?? 1,
    line_kind: "general",
    name: "",
    quantity: 1,
    unit: DEFAULT_ESTIMATE_UNIT,
    unit_price: 0,
    direct_amount: 0,
  };
}

export function createDiscountLineItem(items: EstimateLineItemForm[]): EstimateLineItemForm {
  return {
    id: nextLineId(items),
    line_kind: "discount",
    name: "値引き",
    quantity: 0,
    unit: DEFAULT_ESTIMATE_UNIT,
    unit_price: 0,
    direct_amount: 0,
  };
}

export function createCommentLineItem(items: EstimateLineItemForm[]): EstimateLineItemForm {
  return {
    id: nextLineId(items),
    line_kind: "comment",
    name: "",
    quantity: 0,
    unit: DEFAULT_ESTIMATE_UNIT,
    unit_price: 0,
    direct_amount: 0,
  };
}

export function createSubtotalLineItem(items: EstimateLineItemForm[]): EstimateLineItemForm {
  return {
    id: nextLineId(items),
    line_kind: "subtotal",
    name: "小計",
    quantity: 0,
    unit: DEFAULT_ESTIMATE_UNIT,
    unit_price: 0,
    direct_amount: 0,
  };
}

/** @deprecated createGeneralLineItem を使用 */
export function createEmptyEstimateLineItem(id: number): EstimateLineItemForm {
  return createGeneralLineItem(id);
}

export function normalizeEstimateLineItem(
  item: Partial<EstimateLineItemForm> & { id: number; name: string }
): EstimateLineItemForm {
  const kind = item.line_kind ?? "general";
  return {
    id: item.id,
    line_kind: kind,
    name: item.name,
    quantity: item.quantity ?? (kind === "general" ? 1 : 0),
    unit: item.unit ?? DEFAULT_ESTIMATE_UNIT,
    unit_price: item.unit_price ?? 0,
    direct_amount: item.direct_amount ?? 0,
  };
}
