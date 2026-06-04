import { projects, type Estimate } from "@/src/data/mock";
import {
  buildLineItemsFromEstimateItems,
  persistedLineToForm,
} from "@/lib/document-line-items";
import {
  createGeneralLineItem,
  type EstimateLineItemForm,
} from "@/lib/estimate-units";

export type EstimateFormLineItem = EstimateLineItemForm;

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
  const raw = estimate.items ?? [];
  const items =
    raw.length > 0
      ? raw.map((it, i) =>
          persistedLineToForm({ ...it, id: Date.now() * 1000 + i })
        )
      : [createGeneralLineItem(Date.now() * 1000)];
  return {
    customerId: project ? String(project.customer_id) : "",
    propertyId: project ? String(project.property_id) : "",
    revenueCategory: estimate.revenue_category ?? "",
    staffId: estimate.staff_id != null ? String(estimate.staff_id) : "",
    note: estimate.note ?? "",
    items,
  };
}
