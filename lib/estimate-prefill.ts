import { projects, type Estimate } from "@/src/data/mock";

export type EstimateFormLineItem = {
  id: number;
  name: string;
  quantity: number;
  unit_price: number;
};

export type EstimateNewFormDraft = {
  customerId: string;
  propertyId: string;
  revenueCategory: string;
  staffId: string;
  note: string;
  items: EstimateFormLineItem[];
};

/** 見積を新規登録フォーム用の下書きに変換（案件から顧客・物件を解決） */
export function buildDraftFromEstimate(estimate: Estimate): EstimateNewFormDraft {
  const project =
    estimate.project_id != null
      ? projects.find((p) => p.id === estimate.project_id)
      : undefined;
  const baseLines = (estimate.items ?? []).map((it, i) => ({
    id: Date.now() * 1000 + i,
    name: it.name,
    quantity: it.quantity,
    unit_price: it.unit_price,
  }));
  const items =
    baseLines.length > 0
      ? baseLines
      : [{ id: Date.now() * 1000, name: "", quantity: 1, unit_price: 0 }];
  return {
    customerId: project ? String(project.customer_id) : "",
    propertyId: project ? String(project.property_id) : "",
    revenueCategory: estimate.revenue_category ?? "",
    staffId: estimate.staff_id != null ? String(estimate.staff_id) : "",
    note: estimate.note ?? "",
    items,
  };
}
