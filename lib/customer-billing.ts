import type { Customer, Invoice } from "@/src/data/mock";

/** 請求書に印字する宛名（顧客名＋敬称） */
export function getBillingAddresseeName(customer: Customer | undefined): string {
  if (!customer?.name?.trim()) return "";
  const name = customer.name.trim();
  const honorific = customer.honorific?.trim();
  return honorific ? `${name} ${honorific}` : name;
}

/**
 * 請求に表示する宛先名。
 * 請求の請求宛先名があれば優先、なければ顧客マスタの宛名（名＋敬称）、最後に顧客名のみ。
 */
export function getInvoiceBillingAddresseeDisplayName(
  invoice: Pick<Invoice, "billing_addressee_name">,
  customer: Customer | undefined
): string {
  const override = invoice.billing_addressee_name?.trim();
  if (override) return override;
  const fromCustomer = getBillingAddresseeName(customer);
  if (fromCustomer) return fromCustomer;
  return customer?.name?.trim() ?? "";
}

/** 請求一覧検索用：請求宛先名・顧客宛名・請求先担当者など */
export function getInvoiceBillingSearchTexts(
  invoice: Pick<Invoice, "billing_addressee_name">,
  customer: Customer | undefined
): string[] {
  const texts = [
    invoice.billing_addressee_name,
    getInvoiceBillingAddresseeDisplayName(invoice, customer),
    customer?.name,
    getBillingAddresseeName(customer),
    customer?.billing_contact_name,
    customer?.billing_contact_email,
  ];
  const seen = new Set<string>();
  return texts.filter((t): t is string => {
    const v = t?.trim();
    if (!v || seen.has(v)) return false;
    seen.add(v);
    return true;
  });
}

export function normalizeInvoiceSearchQuery(query: string): string {
  return query
    .toLowerCase()
    .replaceAll(" ", "")
    .replaceAll("　", "")
    .replaceAll("-", "");
}

export function matchesInvoiceSearchText(haystack: string, normalizedQuery: string): boolean {
  if (!normalizedQuery) return true;
  return normalizeInvoiceSearchQuery(haystack).includes(normalizedQuery);
}
