"use client";

import { useEffect, useMemo, useState } from "react";
import type { Customer } from "@/src/data/mock";
import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";

/**
 * エーワン ラベルシール 品番 72421（F21A4-2）
 * A4・21面・3列×7段・各片 70mm×42.3mm
 * @see https://www.a-one.co.jp/product/search/detail.php?id=72421
 */
const LABELS_PER_PAGE = 21;

/** 左上＝1 … 右下＝21（行優先）。1枚目だけ startSlot より前を空け、2枚目以降は左上から詰める */
function buildLabelPages(customers: Customer[], startSlot: number): (Customer | null)[][] {
  const s = Math.min(LABELS_PER_PAGE, Math.max(1, Math.floor(startSlot) || 1));
  if (customers.length === 0) return [];

  const pages: (Customer | null)[][] = [];
  let idx = 0;

  const page0: (Customer | null)[] = Array(LABELS_PER_PAGE).fill(null);
  let pos = s - 1;
  while (pos < LABELS_PER_PAGE && idx < customers.length) {
    page0[pos] = customers[idx];
    idx++;
    pos++;
  }
  pages.push(page0);

  while (idx < customers.length) {
    const page: (Customer | null)[] = Array(LABELS_PER_PAGE).fill(null);
    pos = 0;
    while (pos < LABELS_PER_PAGE && idx < customers.length) {
      page[pos] = customers[idx];
      idx++;
      pos++;
    }
    pages.push(page);
  }

  return pages;
}

function slotRowCol(slot: number): { row: number; col: number } {
  const s = Math.min(LABELS_PER_PAGE, Math.max(1, slot));
  const zero = s - 1;
  return { row: Math.floor(zero / 3) + 1, col: (zero % 3) + 1 };
}

function formatAddress(c: Customer): string {
  const t = c.address?.trim();
  return t || "（住所未登録）";
}

function formatPostalCode(c: Customer): string | null {
  const raw = c.postal_code?.trim();
  if (raw) {
    const m = /(\d{3})-?(\d{4})/.exec(raw);
    if (m) return `〒${m[1]}-${m[2]}`;
    return `〒${raw}`;
  }
  const addr = c.address?.trim() ?? "";
  const m = /(\d{3})-?(\d{4})/.exec(addr);
  if (m) return `〒${m[1]}-${m[2]}`;
  return null;
}

export function CustomerEnvelopeLabelModal(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customers: Customer[];
}) {
  const { open, onOpenChange, customers } = props;
  const [startSlot, setStartSlot] = useState(1);

  useEffect(() => {
    if (open) setStartSlot(1);
  }, [open]);

  useEffect(() => {
    const onAfterPrint = () => {
      document.documentElement.classList.remove("customer-label-print-mode");
    };
    window.addEventListener("afterprint", onAfterPrint);
    return () => window.removeEventListener("afterprint", onAfterPrint);
  }, []);

  const pages = useMemo(
    () => buildLabelPages(customers, startSlot),
    [customers, startSlot]
  );

  const missingAddress = customers.filter((c) => !c.address?.trim());
  const firstPageCapacity = 22 - Math.min(21, Math.max(1, startSlot));
  const { row: startRow, col: startCol } = slotRowCol(startSlot);

  const handlePrint = () => {
    document.documentElement.classList.add("customer-label-print-mode");
    requestAnimationFrame(() => {
      window.print();
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:hidden">
      <div className="flex max-h-[90vh] w-full max-w-[min(1200px,96vw)] flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3 print:hidden">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">封筒ラベル印刷</h2>
            <p className="text-sm text-gray-500">
              {customers.length}件 · 印刷はエーワン 72421（21面・70×42.3mm）用です
            </p>
            <p className="mt-1 text-xs text-gray-500">
              拡大縮小なし・余白なし（最小）を推奨。ズレる場合はブラウザの印刷プレビューで調整してください。
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="閉じる"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-auto">
          <div className="shrink-0 border-b border-gray-100 px-4 py-3 print:hidden">
            <p className="text-sm font-semibold text-gray-800">
              プレビュー：3列×7行（21面）
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <label htmlFor="label-start-slot" className="text-xs font-medium text-gray-700">
                  1枚目の開始マス
                </label>
                <input
                  id="label-start-slot"
                  type="number"
                  min={1}
                  max={21}
                  value={startSlot}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (Number.isNaN(v)) setStartSlot(1);
                    else setStartSlot(Math.min(21, Math.max(1, v)));
                  }}
                  className="w-14 rounded-md border border-gray-300 px-2 py-1.5 text-sm tabular-nums outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="1枚目の開始マス（1から21）"
                />
                <span className="text-xs text-gray-500">
                  （{startRow}段目・左から{startCol}列目）· 左上を1とした通し番号。2枚目以降は左上から。
                </span>
              </div>
              {startSlot > 1 && customers.length > 0 && (
                <p className="text-xs text-gray-500">
                  1枚目は最大 <strong>{firstPageCapacity}</strong> 件まで
                </p>
              )}
            </div>
            {missingAddress.length > 0 && (
              <p className="mt-2 text-xs text-amber-700">
                住所未入力は「（住所未登録）」と印字されます（{missingAddress.length}件）
              </p>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-auto px-4 pb-4 pt-3">
            <div
              id="customer-envelope-label-print-area"
              className="mx-auto w-full max-w-full space-y-6 bg-white text-black print:space-y-0"
            >
              {pages.map((cells, pageIdx) => (
                  <div
                    key={pageIdx}
                    className="customer-label-page border border-dashed border-gray-300 bg-white p-2 print:border-0 print:p-0 sm:p-3"
                  >
                    {(pages.length > 1 || startSlot > 1) && (
                      <div className="print:hidden mb-2 text-xs text-gray-500">
                        {pages.length > 1 ? (
                          <>
                            A4シート {pageIdx + 1} / {pages.length} 枚目
                            {pageIdx === 0 && startSlot > 1
                              ? ` · マス${startSlot}から`
                              : pageIdx > 0
                                ? " · 左上から"
                                : ""}
                          </>
                        ) : (
                          <>
                            マス{startSlot}（{startRow}段目・{startCol}列目）から
                          </>
                        )}
                      </div>
                    )}
                    <div className="customer-label-preview-scroll print:block print:overflow-visible">
                      <div className="customer-label-f21-grid">
                        {cells.map((c, i) =>
                          c ? (
                            <div
                              key={`${pageIdx}-${c.id}-${i}`}
                              className="customer-label-cell flex flex-col justify-center border border-dashed border-gray-200 px-[2mm] py-[1.5mm] print:border-0"
                            >
                              <p className="font-bold leading-tight print:text-[9pt]">{c.name}</p>
                              {formatPostalCode(c) && (
                                <p className="mt-0.5 leading-tight text-gray-800 print:text-[8pt]">
                                  {formatPostalCode(c)}
                                </p>
                              )}
                              <p className="mt-0.5 whitespace-pre-wrap leading-snug text-gray-800 print:text-[8pt]">
                                {formatAddress(c)}
                              </p>
                            </div>
                          ) : (
                            <div
                              key={`${pageIdx}-empty-${i}`}
                              className="customer-label-cell customer-label-cell--empty border border-dashed border-gray-100 print:border-0"
                              aria-hidden
                            />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t px-4 py-3 print:hidden">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            閉じる
          </Button>
          <Button
            type="button"
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white"
            onClick={handlePrint}
            disabled={customers.length === 0}
          >
            <Printer className="mr-2 h-4 w-4" />
            印刷
          </Button>
        </div>
      </div>
    </div>
  );
}
