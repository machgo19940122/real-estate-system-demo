"use client";

import { useState, useMemo, Suspense, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { customers, properties, staff, getEstimateById } from "@/src/data/mock";
import { formatCurrency } from "@/lib/utils";
import { buildDraftFromEstimate, type EstimateNewFormDraft } from "@/lib/estimate-prefill";
import { EstimateQuoteModal } from "@/components/estimate-quote-modal";
import { ArrowLeft, Plus, Quote, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CustomerCombobox } from "@/components/customer-combobox";
import { PropertyCombobox } from "@/components/property-combobox";

const TAX_RATE = 0.1; // 消費税率10%

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
  const [items, setItems] = useState([
    { id: 1, name: "", quantity: 1, unit_price: 0 },
  ]);
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

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now(), name: "", quantity: 1, unit_price: 0 },
    ]);
  };

  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: number, field: string, value: string | number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const { subtotal, tax, total } = useMemo(() => {
    const sub = items.reduce(
      (sum, item) => sum + item.quantity * (item.unit_price || 0),
      0
    );
    const taxAmount = Math.floor(sub * TAX_RATE);
    return {
      subtotal: sub,
      tax: taxAmount,
      total: sub + taxAmount,
    };
  }, [items]);

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
                    <option value="新築">新築</option>
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

                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">見積項目</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addItem}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    項目を追加
                  </Button>
                </div>

                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      className="grid gap-4 md:grid-cols-12 items-end p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="md:col-span-5 space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          項目名
                        </label>
                        <input
                          type="text"
                          required
                          value={item.name}
                          onChange={(e) =>
                            updateItem(item.id, "name", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          placeholder="内装リフォーム工事"
                        />
                      </div>
                      <div className="md:col-span-3 space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          数量
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(item.id, "quantity", parseInt(e.target.value) || 1)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>
                      <div className="md:col-span-3 space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          単価
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={item.unit_price}
                          onChange={(e) =>
                            updateItem(item.id, "unit_price", parseInt(e.target.value) || 0)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>
                      <div className="md:col-span-1">
                        {items.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="w-full"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 見積税抜き合計・消費税・見積合計 */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 max-w-sm ml-auto space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">見積税抜き合計</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">消費税（10%）</span>
                    <span className="font-medium">{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-200">
                    <span>見積合計</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
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
