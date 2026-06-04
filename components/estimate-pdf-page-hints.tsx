import {
  ESTIMATE_PDF_LINES_PER_PAGE,
  estimatePdfTotalPages,
} from "@/lib/estimate-pdf-layout";
import { FileOutput } from "lucide-react";

const COL_SPAN_DEFAULT = 7;

/** 見積明細テーブル上部のPDFページ数サマリー */
export function EstimatePdfPageSummary({ lineCount }: { lineCount: number }) {
  if (lineCount === 0) return null;
  const pages = estimatePdfTotalPages(lineCount);
  if (pages <= 1) {
    return (
      <p className="text-xs text-blue-700 bg-blue-50/80 border border-blue-100 rounded-md px-3 py-2">
        PDF出力時は1ページ（明細{lineCount}行 / 1ページあたり最大{ESTIMATE_PDF_LINES_PER_PAGE}行）
      </p>
    );
  }
  return (
    <p className="text-xs text-blue-700 bg-blue-50/80 border border-blue-100 rounded-md px-3 py-2">
      PDF出力時は約{pages}ページ（明細{lineCount}行・{ESTIMATE_PDF_LINES_PER_PAGE}行ごとに改ページ）
    </p>
  );
}

/** 20行目ごとの改ページ位置を示す区切り行 */
export function EstimatePdfPageBreakRow({
  pageEnded,
  colSpan = COL_SPAN_DEFAULT,
}: {
  /** ここまでが何ページ目か */
  pageEnded: number;
  colSpan?: number;
}) {
  const nextPageStart = pageEnded * ESTIMATE_PDF_LINES_PER_PAGE + 1;
  return (
    <tr className="bg-blue-50/90" aria-label={`PDF改ページ・${pageEnded}ページ目まで`}>
      <td colSpan={colSpan} className="px-3 py-1.5 border-y-2 border-dashed border-blue-400">
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-xs text-blue-800">
          <FileOutput className="h-3.5 w-3.5 shrink-0" />
          <span className="font-medium">
            PDF改ページ（{pageEnded}ページ目まで・{ESTIMATE_PDF_LINES_PER_PAGE}行）
          </span>
          <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-800">
            {pageEnded + 1}ページ目
          </span>
          <span className="text-blue-600">（{nextPageStart}行目〜）</span>
        </div>
      </td>
    </tr>
  );
}

