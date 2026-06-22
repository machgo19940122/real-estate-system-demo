import { getEffectiveInvoicePeriod } from "@/lib/system-settings";
import type { Invoice } from "@/src/data/mock";

/** 現在の会計期（システム設定。未読込時は58期） */
export function getCurrentInvoicePeriod(): number {
  return getEffectiveInvoicePeriod();
}

/** @deprecated 互換用。getCurrentInvoicePeriod() を使用 */
export const CURRENT_INVOICE_PERIOD = 58;

const INVOICE_NUMBER_RE = /^(\d{2})(\d{4})$/;

/** 期＋4桁連番（例: 58期・1件目 → 580001） */
export function formatInvoiceNumber(period: number, sequence: number): string {
  return `${period}${String(sequence).padStart(4, "0")}`;
}

/** 請求番号から会計期（2桁）と連番（4桁）を取得。形式不一致時は null */
export function parseInvoiceNumber(
  invoiceNumber: string
): { period: number; sequence: number } | null {
  const m = INVOICE_NUMBER_RE.exec(invoiceNumber.trim());
  if (!m) return null;
  const period = Number(m[1]);
  const sequence = Number(m[2]);
  if (!Number.isFinite(period) || !Number.isFinite(sequence) || sequence < 1) return null;
  return { period, sequence };
}

/** 指定期における最大連番の次（1始まり） */
export function nextInvoiceSequence(
  existing: Pick<Invoice, "invoice_number">[],
  period: number = getCurrentInvoicePeriod()
): number {
  let max = 0;
  for (const inv of existing) {
    const parsed = parseInvoiceNumber(inv.invoice_number);
    if (!parsed || parsed.period !== period) continue;
    max = Math.max(max, parsed.sequence);
  }
  return max + 1;
}

/** 次に採番する請求番号 */
export function nextInvoiceNumber(
  existing: Pick<Invoice, "invoice_number">[],
  period: number = getCurrentInvoicePeriod()
): string {
  return formatInvoiceNumber(period, nextInvoiceSequence(existing, period));
}

export function isInvoiceNumberTaken(
  existing: Pick<Invoice, "id" | "invoice_number">[],
  invoiceNumber: string,
  excludeId?: number
): boolean {
  const normalized = invoiceNumber.trim();
  if (!normalized) return false;
  return existing.some(
    (inv) =>
      inv.invoice_number.trim() === normalized &&
      (excludeId == null || inv.id !== excludeId)
  );
}
