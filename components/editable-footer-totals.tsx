"use client";

import { Button } from "@/components/ui/button";
import type { EditableFooterTotalsState } from "@/lib/use-editable-footer-totals";
import { formatCurrency } from "@/lib/utils";
import type { EstimateLineItemForm } from "@/lib/estimate-units";
import { Lock, Pencil } from "lucide-react";
import { useEditableFooterTotals } from "@/lib/use-editable-footer-totals";

export type FooterTotalsLabels = {
  subtotal: string;
  tax: string;
  total: string;
};

const DEFAULT_LABELS: FooterTotalsLabels = {
  subtotal: "税抜き合計",
  tax: "消費税（10%）",
  total: "合計",
};

type ViewProps = {
  items: EstimateLineItemForm[];
  totals: EditableFooterTotalsState;
  labels?: Partial<FooterTotalsLabels>;
  className?: string;
  emphasizeTotal?: boolean;
};

export function EditableFooterTotalsView({
  items,
  totals,
  labels: labelPatch,
  className = "mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 max-w-sm ml-auto space-y-2",
  emphasizeTotal = false,
}: ViewProps) {
  const labels = { ...DEFAULT_LABELS, ...labelPatch };
  const {
    subtotal,
    tax,
    total,
    editUnlocked,
    isManual,
    unlockEdit,
    lockEdit,
    setManualSubtotal,
    setManualTax,
  } = totals;

  if (items.length === 0) return null;

  const amountInputClass =
    "w-32 px-2 py-1 border border-amber-300 rounded-md text-right text-sm tabular-nums bg-white focus:ring-1 focus:ring-amber-500 outline-none";

  return (
    <div className={className}>
      <div className="flex items-center justify-end gap-1 -mt-1 mb-1">
        {isManual && (
          <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded mr-1">
            手動
          </span>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          title={
            editUnlocked
              ? "自動計算に戻す"
              : "税抜き合計・消費税を手動で上書き（イレギュラー対応）"
          }
          onClick={() => (editUnlocked ? lockEdit() : unlockEdit())}
        >
          {editUnlocked ? (
            <Lock className="h-3.5 w-3.5 text-gray-500" />
          ) : (
            <Pencil className="h-3.5 w-3.5 text-gray-500" />
          )}
        </Button>
      </div>

      <div className="flex justify-between items-center gap-2 text-sm">
        <span className="text-gray-600 shrink-0">{labels.subtotal}</span>
        {editUnlocked ? (
          <input
            type="number"
            value={subtotal}
            onChange={(e) => setManualSubtotal(Number(e.target.value))}
            className={amountInputClass}
            aria-label={labels.subtotal}
          />
        ) : (
          <span className="font-medium tabular-nums">{formatCurrency(subtotal)}</span>
        )}
      </div>

      <div className="flex justify-between items-center gap-2 text-sm">
        <span className="text-gray-600 shrink-0">{labels.tax}</span>
        {editUnlocked ? (
          <input
            type="number"
            value={tax}
            onChange={(e) => setManualTax(Number(e.target.value))}
            className={amountInputClass}
            aria-label={labels.tax}
          />
        ) : (
          <span className="font-medium tabular-nums">{formatCurrency(tax)}</span>
        )}
      </div>

      <div
        className={`flex justify-between pt-2 border-t border-gray-200 ${
          emphasizeTotal ? "text-lg font-bold" : "text-base font-semibold"
        }`}
      >
        <span>{labels.total}</span>
        <span
          className={`tabular-nums ${emphasizeTotal ? "text-blue-600" : ""}`}
        >
          {formatCurrency(total)}
        </span>
      </div>

      <p className="text-[11px] text-gray-500 pt-0.5">
        {editUnlocked
          ? "請求合計は税抜き合計＋消費税で表示します。明細を変更すると自動計算に戻ります。"
          : "鉛筆アイコンで税抜き合計・消費税のみ手動変更できます。"}
      </p>
    </div>
  );
}

/** items から合計を算出（編集用フックを内包） */
type FooterTotalsReadonlyProps = {
  subtotal: number;
  tax: number;
  total: number;
  labels?: Partial<FooterTotalsLabels>;
  className?: string;
  emphasizeTotal?: boolean;
};

export function FooterTotalsReadonly({
  subtotal,
  tax,
  total,
  labels: labelPatch,
  className = "mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 max-w-sm ml-auto space-y-2",
  emphasizeTotal = false,
}: FooterTotalsReadonlyProps) {
  const labels = { ...DEFAULT_LABELS, ...labelPatch };
  return (
    <div className={className}>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{labels.subtotal}</span>
        <span className="font-medium tabular-nums">{formatCurrency(subtotal)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{labels.tax}</span>
        <span className="font-medium tabular-nums">{formatCurrency(tax)}</span>
      </div>
      <div
        className={`flex justify-between pt-2 border-t border-gray-200 ${
          emphasizeTotal ? "text-lg font-bold" : "text-base font-semibold"
        }`}
      >
        <span>{labels.total}</span>
        <span className={`tabular-nums ${emphasizeTotal ? "text-blue-600" : ""}`}>
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  );
}
