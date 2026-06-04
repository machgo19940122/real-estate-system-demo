/** デモ用：請求書PDF発行（実装時はAPI・ダウンロードに差し替え） */
export function issueInvoicePdfDemo(invoiceNumbers: string[]): void {
  if (invoiceNumbers.length === 0) {
    alert("請求書を1件以上選択してください");
    return;
  }
  if (invoiceNumbers.length === 1) {
    alert(`請求書発行（PDF / ダミー）: ${invoiceNumbers[0]}`);
    return;
  }
  alert(
    `請求書を一括発行（PDF / ダミー）: ${invoiceNumbers.length}件\n\n` +
      invoiceNumbers.join("\n")
  );
}
