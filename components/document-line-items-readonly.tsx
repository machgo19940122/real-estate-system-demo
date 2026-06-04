"use client";

import { Fragment } from "react";
import {
  EstimatePdfPageBreakRow,
  EstimatePdfPageSummary,
} from "@/components/estimate-pdf-page-hints";
import {
  ESTIMATE_PDF_LINES_PER_PAGE,
  shouldShowPdfPageBreakAfter,
} from "@/lib/estimate-pdf-layout";
import type { DocumentLineItemSource } from "@/lib/document-line-items";
import { persistedLineToForm } from "@/lib/document-line-items";
import {
  ESTIMATE_LINE_KIND_LABELS,
  getLineDisplayAmount,
  type EstimateLineKind,
} from "@/lib/estimate-units";
import { formatCurrency } from "@/lib/utils";

type Props = {
  items: DocumentLineItemSource[];
  emptyMessage?: string;
};

function rowClassForKind(kind: EstimateLineKind): string | undefined {
  if (kind === "subtotal") return "bg-amber-50/60";
  if (kind === "comment") return "bg-gray-50/80";
  if (kind === "discount") return "bg-red-50/30";
  return undefined;
}

export function DocumentLineItemsReadonlyTable({
  items,
  emptyMessage = "明細がありません",
}: Props) {
  if (items.length === 0) {
    return <p className="text-sm text-gray-500">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-2">
      <EstimatePdfPageSummary lineCount={items.length} />
      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-gray-700 w-24">種別</th>
              <th className="px-3 py-2 text-left font-medium text-gray-700">項目</th>
              <th className="px-3 py-2 text-right font-medium text-gray-700">数量</th>
              <th className="px-3 py-2 text-center font-medium text-gray-700">単位</th>
              <th className="px-3 py-2 text-right font-medium text-gray-700">単価</th>
              <th className="px-3 py-2 text-right font-medium text-gray-700">金額</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((item, index) => {
              const kind = item.line_kind ?? "general";
              const amount = getLineDisplayAmount(persistedLineToForm(item));
              const pageBreakAfter = shouldShowPdfPageBreakAfter(index, items.length);
              const pageEnded = Math.floor((index + 1) / ESTIMATE_PDF_LINES_PER_PAGE);
              return (
                <Fragment key={item.id}>
                  <tr className={rowClassForKind(kind)}>
                    <td className="px-3 py-2 text-xs text-gray-600 align-middle">
                      {ESTIMATE_LINE_KIND_LABELS[kind]}
                    </td>
                    <td className="px-3 py-2 align-middle">{item.name || "—"}</td>
                    <td className="px-3 py-2 text-right align-middle">
                      {kind === "general" ? item.quantity : "—"}
                    </td>
                    <td className="px-3 py-2 text-center align-middle">
                      {kind === "general" ? item.unit ?? "式" : "—"}
                    </td>
                    <td className="px-3 py-2 text-right align-middle">
                      {kind === "general" ? formatCurrency(item.unit_price) : "—"}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold align-middle">
                      {amount != null ? formatCurrency(amount) : "—"}
                    </td>
                  </tr>
                  {pageBreakAfter && (
                    <EstimatePdfPageBreakRow pageEnded={pageEnded} colSpan={6} />
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
