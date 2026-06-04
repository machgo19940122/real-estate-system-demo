/** 見積PDF出力時、明細が何行で1ページに収まるか（デモ仕様） */
export const ESTIMATE_PDF_LINES_PER_PAGE = 20;

export function estimatePdfPageForLineIndex(lineIndex: number): number {
  return Math.floor(lineIndex / ESTIMATE_PDF_LINES_PER_PAGE) + 1;
}

export function estimatePdfTotalPages(lineCount: number): number {
  if (lineCount <= 0) return 0;
  return Math.ceil(lineCount / ESTIMATE_PDF_LINES_PER_PAGE);
}

/** この行の直後にPDF改ページが入るか（最終行の後は除く） */
export function shouldShowPdfPageBreakAfter(lineIndex: number, totalLines: number): boolean {
  return (
    (lineIndex + 1) % ESTIMATE_PDF_LINES_PER_PAGE === 0 && lineIndex < totalLines - 1
  );
}
