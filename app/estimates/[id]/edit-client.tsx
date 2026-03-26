"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Save, X, Pencil, Trash2, FileText } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { type Estimate, type RevenueCategory, type EstimateItem } from "@/src/data/mock";

const TAX_RATE = 0.1;

type DraftItem = Omit<EstimateItem, "amount"> & { amount?: number };

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
  const [draftNote, setDraftNote] = useState(initialEstimate.note ?? "");
  const [draftItems, setDraftItems] = useState<DraftItem[]>(
    initialEstimate.items?.map((it) => ({ ...it })) ?? []
  );

  const { subtotal, tax, total } = useMemo(() => {
    const sub = draftItems.reduce((sum, it) => {
      const qty = Number(it.quantity) || 0;
      const unit = Number(it.unit_price) || 0;
      return sum + qty * unit;
    }, 0);
    const taxAmount = Math.floor(sub * TAX_RATE);
    return { subtotal: sub, tax: taxAmount, total: sub + taxAmount };
  }, [draftItems]);

  const startEdit = () => {
    setDraftCategory((estimate.revenue_category as RevenueCategory | undefined) ?? "");
    setDraftNote(estimate.note ?? "");
    setDraftItems(estimate.items?.map((it) => ({ ...it })) ?? []);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraftCategory((estimate.revenue_category as RevenueCategory | undefined) ?? "");
    setDraftNote(estimate.note ?? "");
    setDraftItems(estimate.items?.map((it) => ({ ...it })) ?? []);
    setIsEditing(false);
  };

  const save = () => {
    const next: Estimate = {
      ...estimate,
      revenue_category: (draftCategory || undefined) as RevenueCategory | undefined,
      note: draftNote.trim() ? draftNote.trim() : undefined,
      items: draftItems.map((it) => {
        const qty = Number(it.quantity) || 0;
        const unit = Number(it.unit_price) || 0;
        return {
          id: it.id,
          name: it.name,
          quantity: qty,
          unit_price: unit,
          amount: qty * unit,
        };
      }),
      subtotal,
      tax,
      total,
    };
    setEstimate(next);
    setIsEditing(false);
    alert("見積を更新しました（デモ / 保存処理は未実装）");
  };

  const addRow = () => {
    setDraftItems((prev) => [
      ...prev,
      {
        id: prev.length ? Math.max(...prev.map((p) => p.id)) + 1 : 1,
        name: "",
        quantity: 1,
        unit_price: 0,
      },
    ]);
  };

  const removeRow = (id: number) => {
    setDraftItems((prev) => prev.filter((p) => p.id !== id));
  };

  const updateRow = (id: number, patch: Partial<DraftItem>) => {
    setDraftItems((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
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
                  <option value="新築">新築</option>
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
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">見積項目</h3>
              {isEditing && (
                <Button type="button" variant="outline" size="sm" onClick={addRow}>
                  <Plus className="h-4 w-4 mr-2" />
                  行を追加
                </Button>
              )}
            </div>

            {!isEditing ? (
              displayItems.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          項目
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                          数量
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                          単価
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                          金額
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {displayItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">{item.name}</td>
                          <td className="px-4 py-3 text-right">{item.quantity}</td>
                          <td className="px-4 py-3 text-right">{formatCurrency(item.unit_price)}</td>
                          <td className="px-4 py-3 text-right font-semibold">
                            {formatCurrency(item.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500">見積項目がありません</p>
              )
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">項目</th>
                      <th className="px-3 py-2 text-right font-medium text-gray-700">数量</th>
                      <th className="px-3 py-2 text-right font-medium text-gray-700">単価</th>
                      <th className="px-3 py-2 text-right font-medium text-gray-700">金額</th>
                      <th className="px-3 py-2 text-center font-medium text-gray-700">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {draftItems.map((item) => {
                      const qty = Number(item.quantity) || 0;
                      const unit = Number(item.unit_price) || 0;
                      return (
                        <tr key={item.id} className="bg-white">
                          <td className="px-3 py-2">
                            <input
                              value={item.name}
                              onChange={(e) => updateRow(item.id, { name: e.target.value })}
                              className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              placeholder="工事内容など"
                            />
                          </td>
                          <td className="px-3 py-2 text-right">
                            <input
                              type="number"
                              min={0}
                              value={item.quantity}
                              onChange={(e) => updateRow(item.id, { quantity: Number(e.target.value) || 0 })}
                              className="w-20 px-2 py-1 border border-gray-300 rounded-md text-right text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                          </td>
                          <td className="px-3 py-2 text-right">
                            <input
                              type="number"
                              min={0}
                              value={item.unit_price}
                              onChange={(e) => updateRow(item.id, { unit_price: Number(e.target.value) || 0 })}
                              className="w-28 px-2 py-1 border border-gray-300 rounded-md text-right text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                          </td>
                          <td className="px-3 py-2 text-right">
                            {(qty * unit).toLocaleString()}円
                          </td>
                          <td className="px-3 py-2 text-center">
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeRow(item.id)}>
                              <Trash2 className="h-4 w-4 text-gray-400" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t">
            <div className="w-80 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">小計:</span>
                <span className="font-medium">
                  {formatCurrency(isEditing ? subtotal : estimate.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">消費税 (10%):</span>
                <span className="font-medium">
                  {formatCurrency(isEditing ? tax : estimate.tax)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>合計:</span>
                <span className="text-blue-600">
                  {formatCurrency(isEditing ? total : estimate.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

