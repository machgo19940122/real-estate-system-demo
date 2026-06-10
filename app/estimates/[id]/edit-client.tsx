"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EstimateLineItemsEditor } from "@/components/estimate-line-items-editor";
import { DocumentLineItemsReadonlyTable } from "@/components/document-line-items-readonly";
import {
  EditableFooterTotalsView,
  FooterTotalsReadonly,
} from "@/components/editable-footer-totals";
import { Save, X, Pencil, FileText } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  formToEstimateItem,
  persistedLineToForm,
} from "@/lib/document-line-items";
import { type EstimateLineItemForm } from "@/lib/estimate-units";
import { useEditableFooterTotals } from "@/lib/use-editable-footer-totals";
import { formatTaxRateLabel } from "@/lib/system-settings";
import { useSystemSettings } from "@/lib/use-system-settings";
import { type Estimate, type RevenueCategory } from "@/src/data/mock";

export function EstimateEditClient({
  initialEstimate,
  customerName,
  propertyName,
  staffName,
}: {
  initialEstimate: Estimate;
  customerName?: string;
  propertyName?: string;
  staffName?: string;
}) {
  const [estimate, setEstimate] = useState<Estimate>(initialEstimate);
  const [isEditing, setIsEditing] = useState(false);
  const [draftCategory, setDraftCategory] = useState<RevenueCategory | "">(
    (initialEstimate.revenue_category as RevenueCategory | undefined) ?? ""
  );
  const [draftSubject, setDraftSubject] = useState(initialEstimate.subject ?? "");
  const [draftNote, setDraftNote] = useState(initialEstimate.note ?? "");
  const [draftItems, setDraftItems] = useState<EstimateLineItemForm[]>(
    initialEstimate.items?.map(persistedLineToForm) ?? []
  );

  const { settings, taxRateForDate } = useSystemSettings();
  const taxRate = taxRateForDate(estimate.created_at);
  const taxLabel = formatTaxRateLabel(taxRate);
  const footerTotals = useEditableFooterTotals(
    draftItems,
    taxRate,
    settings.amount_rounding
  );
  const { subtotal, tax, total } = footerTotals;

  const syncDraftFromEstimate = () => {
    setDraftCategory((estimate.revenue_category as RevenueCategory | undefined) ?? "");
    setDraftSubject(estimate.subject ?? "");
    setDraftNote(estimate.note ?? "");
    setDraftItems(estimate.items?.map(persistedLineToForm) ?? []);
  };

  const startEdit = () => {
    syncDraftFromEstimate();
    setIsEditing(true);
  };

  const cancelEdit = () => {
    syncDraftFromEstimate();
    setIsEditing(false);
  };

  const save = () => {
    const next: Estimate = {
      ...estimate,
      revenue_category: (draftCategory || undefined) as RevenueCategory | undefined,
      subject: draftSubject.trim() ? draftSubject.trim() : undefined,
      note: draftNote.trim() ? draftNote.trim() : undefined,
      items: draftItems.map(formToEstimateItem),
      subtotal,
      tax,
      total,
    };
    setEstimate(next);
    setDraftItems(next.items?.map(persistedLineToForm) ?? []);
    setIsEditing(false);
    alert("見積を更新しました（デモ / 保存処理は未実装）");
  };

  const displayItems = estimate.items ?? [];

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            見積内容
          </CardTitle>
          {!isEditing ? (
            <Button onClick={startEdit} variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-2" />
              編集
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button onClick={cancelEdit} variant="outline" size="sm">
                <X className="h-4 w-4 mr-2" />
                キャンセル
              </Button>
              <Button
                onClick={save}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                更新
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 pb-4 border-b">
            <div>
              <p className="text-sm text-gray-500">見積番号</p>
              <p className="font-semibold">{estimate.estimate_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">顧客</p>
              <p className="font-medium">{customerName || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">物件</p>
              <p className="font-medium">{propertyName || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">担当者</p>
              <p className="font-medium">{staffName || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">区分</p>
              {isEditing ? (
                <select
                  value={draftCategory}
                  onChange={(e) => setDraftCategory((e.target.value || "") as RevenueCategory | "")}
                  className="mt-1 w-full max-w-[220px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="">選択してください</option>
                  <option value="注文">注文</option>
                  <option value="建売">建売</option>
                  <option value="リフォーム">リフォーム</option>
                  <option value="土地">土地</option>
                  <option value="仲介料">仲介料</option>
                </select>
              ) : (
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium bg-blue-50 text-blue-800">
                  {estimate.revenue_category ?? "-"}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">作成日</p>
              <p className="font-medium">{formatDate(estimate.created_at)}</p>
            </div>
          </div>

          <div className="space-y-2 pb-4 border-b">
            <p className="text-sm text-gray-500">件名</p>
            {isEditing ? (
              <input
                type="text"
                value={draftSubject}
                onChange={(e) => setDraftSubject(e.target.value)}
                placeholder="見積書の件名を入力"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
              />
            ) : (
              <p className="text-sm text-gray-900">
                {estimate.subject?.trim() ? estimate.subject : "-"}
              </p>
            )}
          </div>

          <div className="space-y-2 pb-4 border-b">
            <p className="text-sm text-gray-500">備考</p>
            {isEditing ? (
              <textarea
                value={draftNote}
                onChange={(e) => setDraftNote(e.target.value)}
                rows={3}
                placeholder="備考を入力"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
              />
            ) : (
              <p className="text-sm text-gray-900 whitespace-pre-wrap">
                {estimate.note?.trim() ? estimate.note : "-"}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">見積項目</h3>

            {isEditing ? (
              <EstimateLineItemsEditor
                items={draftItems}
                onChange={setDraftItems}
                minRows={0}
              />
            ) : displayItems.length > 0 ? (
              <DocumentLineItemsReadonlyTable items={displayItems} />
            ) : (
              <p className="text-sm text-gray-500">見積項目がありません</p>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t">
            {isEditing ? (
              <EditableFooterTotalsView
                items={draftItems}
                totals={footerTotals}
                className="w-80 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2"
                emphasizeTotal
                labels={{
                  subtotal: "見積税抜き合計",
                  tax: taxLabel,
                  total: "見積合計",
                }}
              />
            ) : (
              <FooterTotalsReadonly
                subtotal={estimate.subtotal}
                tax={estimate.tax}
                total={estimate.total}
                className="w-80 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2"
                emphasizeTotal
                labels={{
                  subtotal: "見積税抜き合計",
                  tax: taxLabel,
                  total: "見積合計",
                }}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
