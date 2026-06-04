import type { Invoice } from "@/src/data/mock";

const YMD_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** 請求日（未設定時は登録日 created_at の日付部分） */
export function getInvoiceDate(invoice: Pick<Invoice, "invoice_date" | "created_at">): string {
  const raw = invoice.invoice_date?.trim() || invoice.created_at?.trim() || "";
  const m = YMD_RE.exec(raw);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw.slice(0, 10);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** 請求書印字用の請求日（印刷請求日があれば優先） */
export function getInvoiceDateForPrint(
  invoice: Pick<Invoice, "invoice_date" | "print_invoice_date" | "created_at">
): string {
  if (invoice.print_invoice_date?.trim()) {
    const m = YMD_RE.exec(invoice.print_invoice_date.trim());
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;
    return invoice.print_invoice_date.trim();
  }
  return getInvoiceDate(invoice);
}

export function todayYmd(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** 請求日（YYYY-MM-DD）から支払期限（+3週間＝21日） */
export function dueDateFromInvoiceDate(invoiceDateYmd: string): string {
  const m = YMD_RE.exec(invoiceDateYmd.trim());
  if (!m) return invoiceDateYmd;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const day = Number(m[3]);
  const d = new Date(y, mo, day);
  d.setDate(d.getDate() + 21);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
