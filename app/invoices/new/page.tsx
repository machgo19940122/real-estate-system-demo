"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { customers, properties, estimates } from "@/src/data/mock";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CustomerCombobox } from "@/components/customer-combobox";
import { PropertyCombobox } from "@/components/property-combobox";

const TAX_RATE = 0.1; // 消費税率10%

type InvoiceItemForm = {
  id: number;
  name: string;
  quantity: number;
  unit_price: number;
};

function NewInvoiceForm() {
  const searchParams = useSearchParams();
  const presetPropertyId = searchParams.get("propertyId") ?? "";
  const presetCustomerId = searchParams.get("customerId") ?? "";
  const presetRevenueCategory = searchParams.get("revenueCategory") ?? "";
  const presetEstimateId = searchParams.get("estimateId");

  const [customerId, setCustomerId] = useState(presetCustomerId);
  const [propertyId, setPropertyId] = useState(presetPropertyId);
  const [note, setNote] = useState("");
  const [items, setItems] = useState<InvoiceItemForm[]>([]);

  // 見積から明細を引き継ぎ
  useEffect(() => {
    if (!presetEstimateId) return;
    const estimateIdNum = Number(presetEstimateId);
    const estimate = estimates.find((e) => e.id === estimateIdNum);
    if (estimate?.items && estimate.items.length > 0) {
      setItems(
        estimate.items.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unit_price: item.unit_price,
        }))
      );
    }
  }, [presetEstimateId]);

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

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: prev.length ? prev[prev.length - 1].id + 1 : 1,
        name: "",
        quantity: 1,
        unit_price: 0,
      },
    ]);
  };

  const handleUpdateItem = (
    id: number,
    field: keyof InvoiceItemForm,
    value: string
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]:
                field === "quantity" || field === "unit_price"
                  ? Number(value) || 0
                  : value,
            }
          : item
      )
    );
  };

  const handleRemoveItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      alert("顧客を選択してください");
      return;
    }
    alert(
      "新規請求登録機能（ダミー）\n備考: " +
        (note.trim() || "-") +
        "\n請求明細行数: " +
        items.length
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/invoices">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              新規請求登録
            </h1>
            <p className="text-gray-600 mt-1">新しい請求情報を登録します</p>
          </div>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b">
            <CardTitle>請求情報</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-4">
                <div className="space-y-2 md:col-span-1">
                  <label htmlFor="customer" className="text-sm font-medium text-gray-700">
                    顧客 <span className="text-red-500">*</span>
                  </label>
                  <CustomerCombobox customers={customers} value={customerId} onChange={setCustomerId} />
                </div>

                <div className="space-y-2 md:col-span-1">
                  <label htmlFor="status" className="text-sm font-medium text-gray-700">
                    ステータス <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="status"
                    name="status"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                    defaultValue="無し"
                  >
                    <option value="有">黄色有</option>
                    <option value="無し">黄色無し</option>
                  </select>
                </div>

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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                    defaultValue={presetRevenueCategory}
                  >
                    <option value="">選択してください</option>
                    <option value="新築">新築</option>
                    <option value="リフォーム">リフォーム</option>
                    <option value="土地">土地</option>
                    <option value="仲介料">仲介料</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-1">
                  <label htmlFor="due_date" className="text-sm font-medium text-gray-700">
                    支払期限 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="due_date"
                    type="date"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div className="space-y-2 md:col-span-1">
                  <label htmlFor="property" className="text-sm font-medium text-gray-700">
                    物件（任意）
                  </label>
                  <PropertyCombobox properties={properties} value={propertyId} onChange={setPropertyId} />
                </div>
              </div>

              {/* 備考 */}
              <div className="space-y-2 border-t pt-4">
                <label className="text-sm font-medium text-gray-700">備考</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="備考を入力"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                />
              </div>

              {/* 請求明細 */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-700">請求明細</h2>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddItem}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    明細を追加
                  </Button>
                </div>
                {items.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">
                            項目
                          </th>
                          <th className="px-3 py-2 text-right font-medium text-gray-700">
                            数量
                          </th>
                          <th className="px-3 py-2 text-right font-medium text-gray-700">
                            単価
                          </th>
                          <th className="px-3 py-2 text-right font-medium text-gray-700">
                            金額
                          </th>
                          <th className="px-3 py-2 text-center font-medium text-gray-700">
                            操作
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {items.map((item) => (
                          <tr key={item.id} className="bg-white">
                            <td className="px-3 py-2">
                              <input
                                className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                value={item.name}
                                onChange={(e) =>
                                  handleUpdateItem(item.id, "name", e.target.value)
                                }
                                placeholder="工事内容など"
                              />
                            </td>
                            <td className="px-3 py-2 text-right">
                              <input
                                type="number"
                                min={0}
                                className="w-20 px-2 py-1 border border-gray-300 rounded-md text-right text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleUpdateItem(item.id, "quantity", e.target.value)
                                }
                              />
                            </td>
                            <td className="px-3 py-2 text-right">
                              <input
                                type="number"
                                min={0}
                                className="w-28 px-2 py-1 border border-gray-300 rounded-md text-right text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                value={item.unit_price}
                                onChange={(e) =>
                                  handleUpdateItem(item.id, "unit_price", e.target.value)
                                }
                              />
                            </td>
                            <td className="px-3 py-2 text-right">
                              {(item.quantity * item.unit_price).toLocaleString()}円
                            </td>
                            <td className="px-3 py-2 text-center">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4 text-gray-400" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    明細はまだありません。「明細を追加」から行を追加できます。
                  </p>
                )}

                {/* 請求税抜き合計・消費税・請求合計（見積画面と同様） */}
                {items.length > 0 && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 max-w-sm ml-auto space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">請求税抜き合計</span>
                      <span className="font-medium">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">消費税（10%）</span>
                      <span className="font-medium">{formatCurrency(tax)}</span>
                    </div>
                    <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-200">
                      <span>請求合計</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Link href="/invoices">
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
      </div>
    </AppLayout>
  );
}

export default function NewInvoicePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      }
    >
      <NewInvoiceForm />
    </Suspense>
  );
}
