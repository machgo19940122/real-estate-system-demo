"use client";

import { Fragment } from "react";
import { Button } from "@/components/ui/button";
import {
  EstimatePdfPageBreakRow,
  EstimatePdfPageSummary,
} from "@/components/estimate-pdf-page-hints";
import {
  ESTIMATE_PDF_LINES_PER_PAGE,
  shouldShowPdfPageBreakAfter,
} from "@/lib/estimate-pdf-layout";
import { formatCurrency } from "@/lib/utils";
import {
  calcEstimateLineAmount,
  createCommentLineItem,
  createDiscountLineItem,
  createGeneralLineItem,
  createSubtotalLineItem,
  DEFAULT_ESTIMATE_UNIT,
  ESTIMATE_LINE_KIND_LABELS,
  ESTIMATE_LINE_KIND_SELECT_OPTIONS,
  ESTIMATE_UNITS,
  duplicateEstimateLineItem,
  moveEstimateLineItem,
  getLineDisplayAmount,
  type EstimateLineItemForm,
  type EstimateLineKind,
} from "@/lib/estimate-units";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  MessageSquare,
  MinusCircle,
  Plus,
  Sigma,
  Trash2,
} from "lucide-react";

const INPUT =
  "w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white";
const INPUT_NUM = `${INPUT} text-right tabular-nums`;
const CELL_MUTED = "text-gray-300 text-center text-xs select-none";

type Props = {
  items: EstimateLineItemForm[];
  onChange: (items: EstimateLineItemForm[]) => void;
  minRows?: number;
};

export function EstimateLineItemsEditor({ items, onChange, minRows = 1 }: Props) {
  const updateItem = (id: number, patch: Partial<EstimateLineItemForm>) => {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const changeLineKind = (id: number, kind: EstimateLineKind) => {
    onChange(
      items.map((item) => {
        if (item.id !== id) return item;
        if (item.line_kind === "subtotal") return item;
        return {
          ...item,
          line_kind: kind,
          quantity: kind === "general" ? item.quantity || 1 : 0,
          direct_amount: kind === "discount" ? item.direct_amount : 0,
        };
      })
    );
  };

  const addGeneral = () => {
    const nextId = items.length ? Math.max(...items.map((i) => i.id)) + 1 : 1;
    onChange([...items, createGeneralLineItem(nextId)]);
  };

  const addDiscount = () => onChange([...items, createDiscountLineItem(items)]);
  const addSubtotal = () => onChange([...items, createSubtotalLineItem(items)]);
  const addComment = () => onChange([...items, createCommentLineItem(items)]);

  const duplicateItem = (id: number) => {
    onChange(duplicateEstimateLineItem(items, id));
  };

  const moveItem = (id: number, direction: "up" | "down") => {
    onChange(moveEstimateLineItem(items, id, direction));
  };

  const removeItem = (id: number) => {
    if (items.length <= minRows) return;
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={addGeneral}>
          <Plus className="h-4 w-4 mr-1.5" />
          行を追加
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addDiscount}
          className="border-red-200 text-red-700 hover:bg-red-50"
        >
          <MinusCircle className="h-4 w-4 mr-1.5" />
          値引きを追加
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={addSubtotal}>
          <Sigma className="h-4 w-4 mr-1.5" />
          小計を追加
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={addComment}>
          <MessageSquare className="h-4 w-4 mr-1.5" />
          コメントを追加
        </Button>
      </div>
      <EstimatePdfPageSummary lineCount={items.length} />
      <div className="border border-gray-200 rounded-lg overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-2 text-left font-medium text-gray-700 w-[108px]">種別</th>
              <th className="px-3 py-2 text-left font-medium text-gray-700">項目名</th>
              <th className="px-3 py-2 text-right font-medium text-gray-700 w-24">数量</th>
              <th className="px-3 py-2 text-left font-medium text-gray-700 w-28">単位</th>
              <th className="px-3 py-2 text-right font-medium text-gray-700 w-32">単価</th>
              <th className="px-3 py-2 text-right font-medium text-gray-700 w-32">金額</th>
              <th className="px-2 py-2 w-[108px] text-center font-medium text-gray-700">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item, index) => {
              const isSubtotal = item.line_kind === "subtotal";
              const isComment = item.line_kind === "comment";
              const isDiscount = item.line_kind === "discount";
              const isGeneral = item.line_kind === "general";
              const displayAmount = getLineDisplayAmount(item);
              const rowClass = isSubtotal
                ? "bg-amber-50/60"
                : isComment
                  ? "bg-gray-50/80"
                  : isDiscount
                    ? "bg-red-50/30"
                    : "bg-white";

              const pageBreakAfter = shouldShowPdfPageBreakAfter(index, items.length);
              const pageEnded = Math.floor((index + 1) / ESTIMATE_PDF_LINES_PER_PAGE);

              return (
                <Fragment key={item.id}>
                  <tr className={rowClass}>
                  <td className="px-2 py-2 align-middle">
                    {isSubtotal ? (
                      <span className="inline-flex text-xs font-medium text-amber-800 px-2 py-1 rounded bg-amber-100">
                        小計
                      </span>
                    ) : (
                      <select
                        value={item.line_kind}
                        onChange={(e) =>
                          changeLineKind(item.id, e.target.value as EstimateLineKind)
                        }
                        className="w-full px-1.5 py-1 border border-gray-300 rounded-md text-xs focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                      >
                        {ESTIMATE_LINE_KIND_SELECT_OPTIONS.map((k) => (
                          <option key={k} value={k}>
                            {ESTIMATE_LINE_KIND_LABELS[k]}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-3 py-2 align-middle">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItem(item.id, { name: e.target.value })}
                      className={INPUT}
                      placeholder={
                        isComment
                          ? "コメントを入力"
                          : isSubtotal
                            ? "小計"
                            : isDiscount
                              ? "値引き項目名"
                              : "内装リフォーム工事"
                      }
                    />
                  </td>
                  <td className="px-3 py-2 align-middle">
                    {isGeneral ? (
                      <input
                        type="number"
                        min={0}
                        step="any"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(item.id, { quantity: Number(e.target.value) || 0 })
                        }
                        className={INPUT_NUM}
                      />
                    ) : (
                      <span className={CELL_MUTED}>—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 align-middle">
                    {isGeneral ? (
                      <select
                        value={item.unit || DEFAULT_ESTIMATE_UNIT}
                        onChange={(e) => updateItem(item.id, { unit: e.target.value })}
                        className={INPUT}
                      >
                        {ESTIMATE_UNITS.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className={CELL_MUTED}>—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 align-middle">
                    {isGeneral ? (
                      <input
                        type="number"
                        min={0}
                        value={item.unit_price}
                        onChange={(e) =>
                          updateItem(item.id, { unit_price: Number(e.target.value) || 0 })
                        }
                        className={INPUT_NUM}
                      />
                    ) : (
                      <span className={CELL_MUTED}>—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 align-middle">
                    {isComment ? (
                      <span className={CELL_MUTED}>—</span>
                    ) : isGeneral ? (
                      <span className="block text-right font-medium text-gray-900 tabular-nums py-1">
                        {formatCurrency(displayAmount ?? 0)}
                      </span>
                    ) : (
                      <input
                        type="number"
                        value={item.direct_amount}
                        onChange={(e) =>
                          updateItem(item.id, {
                            direct_amount: Number(e.target.value) || 0,
                          })
                        }
                        className={INPUT_NUM}
                        placeholder={isDiscount ? "マイナス可" : "0"}
                      />
                    )}
                  </td>
                  <td className="px-1 py-2 align-middle">
                    <div className="flex items-center justify-center gap-0.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        title="上へ移動"
                        disabled={index === 0}
                        onClick={() => moveItem(item.id, "up")}
                      >
                        <ChevronUp className="h-4 w-4 text-gray-500" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        title="下へ移動"
                        disabled={index === items.length - 1}
                        onClick={() => moveItem(item.id, "down")}
                      >
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        title="複製して末尾に追加"
                        onClick={() => duplicateItem(item.id)}
                      >
                        <Copy className="h-3.5 w-3.5 text-gray-500" />
                      </Button>
                      {items.length > minRows && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          title="削除"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-gray-400" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
                {pageBreakAfter && (
                  <EstimatePdfPageBreakRow pageEnded={pageEnded} colSpan={7} />
                )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500">
        青い破線はPDF出力時の改ページ位置（20行ごと）です。矢印で行の順序を変更できます。小計行は合計に含まれません。値引きは合計に反映されます（マイナス金額で入力）。
      </p>
    </div>
  );
}
