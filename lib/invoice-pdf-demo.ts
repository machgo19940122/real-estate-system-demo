import { getInvoiceDateForPrint } from "@/lib/invoice-dates";
import { getCompanyInfo } from "@/lib/system-settings";
import { invoices, updateInvoice, type Invoice } from "@/src/data/mock";
import { formatDate } from "@/lib/utils";

export function getInvoicePdfIssueCount(invoice: Pick<Invoice, "pdf_issue_count">): number {
  return Math.max(0, Math.floor(Number(invoice.pdf_issue_count) || 0));
}

function findInvoiceByNumber(invoiceNumber: string): Invoice | undefined {
  return invoices.find((i) => i.invoice_number === invoiceNumber);
}

function confirmReissuePdf(targets: { invoice: Invoice; invoiceNumber: string }[]): boolean {
  if (targets.length === 0) return true;

  if (targets.length === 1) {
    const { invoice, invoiceNumber } = targets[0];
    const count = getInvoicePdfIssueCount(invoice);
    return window.confirm(
      `${invoiceNumber} は既に請求書PDFを ${count} 回発行しています。\n再度発行しますか？`
    );
  }

  const lines = targets
    .map(
      ({ invoice, invoiceNumber }) =>
        `・${invoiceNumber}（${getInvoicePdfIssueCount(invoice)}回発行済み）`
    )
    .join("\n");

  return window.confirm(
    `次の請求は既にPDFを発行済みです。\n\n${lines}\n\nまとめて再度発行しますか？`
  );
}

function recordPdfIssue(invoice: Invoice): number {
  const nextCount = getInvoicePdfIssueCount(invoice) + 1;
  updateInvoice(invoice.id, { pdf_issue_count: nextCount });
  return nextCount;
}

/** デモ用：請求書PDF発行（実装時はAPI・ダウンロードに差し替え） */
export function issueInvoicePdfDemo(invoiceNumbers: string[]): void {
  if (invoiceNumbers.length === 0) {
    alert("請求書を1件以上選択してください");
    return;
  }

  const resolved = invoiceNumbers.map((invoiceNumber) => ({
    invoiceNumber,
    invoice: findInvoiceByNumber(invoiceNumber),
  }));

  const notFound = resolved.filter((r) => !r.invoice).map((r) => r.invoiceNumber);
  if (notFound.length > 0) {
    alert(`請求が見つかりません: ${notFound.join(", ")}`);
    return;
  }

  const targets = resolved.filter(
    (r): r is { invoiceNumber: string; invoice: Invoice } => r.invoice != null
  );

  const reissueTargets = targets.filter((t) => getInvoicePdfIssueCount(t.invoice) >= 1);
  if (reissueTargets.length > 0 && !confirmReissuePdf(reissueTargets)) {
    return;
  }

  const issueCounts = targets.map(({ invoice }) => recordPdfIssue(invoice));

  if (invoiceNumbers.length === 1) {
    const inv = targets[0].invoice;
    const company = getCompanyInfo();
    const companyLines = [
      company.company_name,
      company.company_address,
      company.representative_name ? `代表: ${company.representative_name}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    alert(
      `請求書発行（PDF / ダミー）: ${invoiceNumbers[0]}\n請求日: ${formatDate(getInvoiceDateForPrint(inv))}` +
        (companyLines ? `\n\n【発行元】\n${companyLines}` : "") +
        `\n（累計 ${issueCounts[0]} 回目）`
    );
    return;
  }

  alert(
    `請求書を一括発行（PDF / ダミー）: ${invoiceNumbers.length}件\n\n` +
      invoiceNumbers.join("\n")
  );
}
