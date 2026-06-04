"use client";

import { useState, Suspense, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { customers, properties, staff, getEstimateById } from "@/src/data/mock";
import { buildDraftFromEstimate, type EstimateNewFormDraft } from "@/lib/estimate-prefill";
import { EstimateLineItemsEditor } from "@/components/estimate-line-items-editor";
import { EstimateQuoteModal } from "@/components/estimate-quote-modal";
import { EditableFooterTotalsView } from "@/components/editable-footer-totals";
import { createGeneralLineItem } from "@/lib/estimate-units";
import { useEditableFooterTotals } from "@/lib/use-editable-footer-totals";
import { ArrowLeft, Quote } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CustomerCombobox } from "@/components/customer-combobox";
import { PropertyCombobox } from "@/components/property-combobox";

function NewEstimateForm() {
  const searchParams = useSearchParams();
  const presetPropertyId = searchParams.get("propertyId") ?? "";
  const presetCustomerId = searchParams.get("customerId") ?? "";
  const presetRevenueCategory = searchParams.get("revenueCategory") ?? "";
  const fromEstimateIdParam = searchParams.get("fromEstimateId") ?? "";

  const [customerId, setCustomerId] = useState(presetCustomerId);
  const [propertyId, setPropertyId] = useState(presetPropertyId);
  const [revenueCategory, setRevenueCategory] = useState(presetRevenueCategory);
  const [staffId, setStaffId] = useState("");
  const [note, setNote] = useState("");
  const [items, setItems] = useState([createGeneralLineItem(1)]);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);

  const applyDraft = useCallback((draft: EstimateNewFormDraft) => {
    setCustomerId(draft.customerId);
    setPropertyId(draft.propertyId);
    setRevenueCategory(draft.revenueCategory);
    setStaffId(draft.staffId);
    setNote(draft.note);
    setItems(draft.items);
  }, []);

  useEffect(() => {
    if (!fromEstimateIdParam) return;
    const id = parseInt(fromEstimateIdParam, 10);
    if (Number.isNaN(id)) return;
    const src = getEstimateById(id);
    if (!src) return;
    applyDraft(buildDraftFromEstimate(src));
  }, [fromEstimateIdParam, applyDraft]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      alert("顧客を選択してください");
      return;
    }
    alert("新規見積登録機能（ダミー）\n備考: " + (note.trim() || "-"));
  };

  const footerTotals = useEditableFooterTotals(items);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/estimates">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                戻る
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                新規見積登録
              </h1>
              <p className="text-gray-600 mt-1">新しい見積情報を登録します</p>
            </div>
          </div>
          <Button type="button" variant="outline" onClick={() => setQuoteModalOpen(true)}>
            <Quote className="h-4 w-4 mr-2" />
            見積を引用
          </Button>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b">
            <CardTitle>見積情報</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-4">
                {/* 顧客 */}
                <div className="space-y-2 md:col-span-1">
                  <label htmlFor="customer" className="text-sm font-medium text-gray-700">
                    顧客 <span className="text-red-500">*</span>
                  </label>
                  <CustomerCombobox customers={customers} value={customerId} onChange={setCustomerId} />
                </div>

                {/* 区分 */}
                <div className="space-y-2 md:col-span-1">
                  <label
                    htmlFor="revenue_category"
                    className="text-sm font-medium text-gray-700"
                  >
                    区分 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="revenue_category"
                    name="revenue_category"
                    required
                    value={revenueCategory}
                    onChange={(e) => setRevenueCategory(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                  >
                    <option value="">選択してください</option>
                    <option value="注文">注文</option>
                    <option value="建売">建売</option>
                    <option value="リフォーム">リフォーム</option>
                    <option value="土地">土地</option>
                    <option value="仲介料">仲介料</option>
                  </select>
                </div>

                {/* 担当者 */}
                <div className="space-y-2 md:col-span-1">
                  <label htmlFor="staff" className="text-sm font-medium text-gray-700">
                    担当者
                  </label>
                  <select
                    id="staff"
                    name="staff"
                    value={staffId}
                    onChange={(e) => setStaffId(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                  >
                    <option value="">選択してください</option>
                    {staff.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 物件（任意） */}
                <div className="space-y-2 md:col-span-1">
                  <label htmlFor="property" className="text-sm font-medium text-gray-700">
                    物件（任意）
                  </label>
                  <PropertyCombobox properties={properties} value={propertyId} onChange={setPropertyId} />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                {/* 備考 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">備考</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    placeholder="備考を入力"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                  />
                </div>

                <h3 className="text-lg font-semibold">見積項目</h3>
                <EstimateLineItemsEditor items={items} onChange={setItems} />

                <EditableFooterTotalsView
                  items={items}
                  totals={footerTotals}
                  labels={{
                    subtotal: "見積税抜き合計",
                    tax: "消費税（10%）",
                    total: "見積合計",
                  }}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Link href="/estimates">
                  <Button type="button" variant="outline">
                    キャンセル
                  </Button>
                </Link>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  登録する
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <EstimateQuoteModal
          open={quoteModalOpen}
          onOpenChange={setQuoteModalOpen}
          onSelectEstimate={(e) => applyDraft(buildDraftFromEstimate(e))}
        />
      </div>
    </AppLayout>
  );
}

export default function NewEstimatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      }
    >
      <NewEstimateForm />
    </Suspense>
  );
}
