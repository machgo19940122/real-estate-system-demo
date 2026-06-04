import {
  getPropertyById,
  projects,
  type Invoice,
  type Property,
} from "@/src/data/mock";

/** 請求に紐づく物件ID（property_ids 優先、なければ従来の単一紐づけ） */
export function getInvoicePropertyIds(invoice: Invoice): number[] {
  if (invoice.property_ids && invoice.property_ids.length > 0) {
    return [...new Set(invoice.property_ids)];
  }
  const ids: number[] = [];
  if (invoice.property_id != null) ids.push(invoice.property_id);
  if (invoice.project_id != null) {
    const project = projects.find((p) => p.id === invoice.project_id);
    if (project?.property_id != null && !ids.includes(project.property_id)) {
      ids.push(project.property_id);
    }
  }
  return ids;
}

export function getInvoiceProperties(invoice: Invoice): Property[] {
  return getInvoicePropertyIds(invoice)
    .map((id) => getPropertyById(id))
    .filter((p): p is Property => p != null);
}

export function normalizeInvoicePropertyIds(ids: number[]): number[] {
  const seen = new Set<number>();
  const out: number[] = [];
  for (const id of ids) {
    if (!Number.isFinite(id) || id <= 0 || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

/** 一覧検索用：物件名をすべて返す */
export function getInvoicePropertySearchTexts(invoice: Invoice): string[] {
  return getInvoiceProperties(invoice).map((p) => p.name);
}
