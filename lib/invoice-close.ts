import type { Invoice } from "@/src/data/mock";

export function isInvoiceClosed(invoice: Pick<Invoice, "is_closed">): boolean {
  return invoice.is_closed === true;
}

export function invoiceClosedAtNow(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
