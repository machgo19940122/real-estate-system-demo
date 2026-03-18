"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Save, X, Pencil, Trash2, Receipt } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { type Invoice, type InvoiceItem, type RevenueCategory, type PaymentStatus } from "@/src/data/mock";

const TAX_RATE = 0.1;

type DraftItem = Omit<InvoiceItem, "amount"> & { amount?: number };

export function InvoiceEditClient({
  initialInvoice,
  customerName,
  propertyName,
  paymentStatus,
  totalPaid,
}: {
  initialInvoice: Invoice;
  customerName?: string;
  propertyName?: string;
  paymentStatus: PaymentStatus;
  totalPaid: number;
}) {
  const [invoice, setInvoice] = useState<Invoice>(initialInvoice);
  const [isEditing, setIsEditing] = useState(false);

  const [draftDueDate, setDraftDueDate] = useState(initialInvoice.due_date);
  const [draftCategory, setDraftCategory] = useState<RevenueCategory | "">(
    (initialInvoice.revenue_category as RevenueCategory | undefined) ?? ""
  );
  const [draftManualStatus, setDraftManualStatus] = useState<"有" | "無し">(initialInvoice.status);
  const [draftNote, setDraftNote] = useState(initialInvoice.note ?? "");
  const [draftItems, setDraftItems] = useState<DraftItem[]>(initialInvoice.items?.map((it) => ({ ...it })) ?? []);

  const { subtotal, tax, total } = useMemo(() => {
    const sub = draftItems.reduce((sum, it) => {
      const qty = Number(it.quantity) || 0;
      const unit = Number(it.unit_price) || 0;
      return sum + qty * unit;
    }, 0);
    const taxAmount = Math.floor(sub * TAX_RATE);
    return { subtotal: sub, tax: taxAmount, total: sub + taxAmount };
  }, [draftItems]);

  const { viewSubtotal, viewTax, viewTotal } = useMemo(() => {
    const sub = (invoice.items ?? []).reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
    const taxAmount = Math.floor(sub * TAX_RATE);
    return { viewSubtotal: sub, viewTax: taxAmount, viewTotal: sub + taxAmount };
  }, [invoice.items]);

  const startEdit = () => {
    setDraftDueDate(invoice.due_date);
    setDraftCategory((invoice.revenue_category as RevenueCategory | undefined) ?? "");
    setDraftManualStatus(invoice.status);
    setDraftNote(invoice.note ?? "");
    setDraftItems(invoice.items?.map((it) => ({ ...it })) ?? []);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraftDueDate(invoice.due_date);
    setDraftCategory((invoice.revenue_category as RevenueCategory | undefined) ?? "");
    setDraftManualStatus(invoice.status);
    setDraftNote(invoice.note ?? "");
    setDraftItems(invoice.items?.map((it) => ({ ...it })) ?? []);
    setIsEditing(false);
  };

  const save = () => {
    const items = draftItems.map((it) => {
      const qty = Number(it.quantity) || 0;
      const unit = Number(it.unit_price) || 0;
      return {
        id: it.id,
        name: it.name,
        quantity: qty,
        unit_price: unit,
        amount: qty * unit,
      };
    });
    const next: Invoice = {
      ...invoice,
      due_date: draftDueDate,
      revenue_category: (draftCategory || undefined) as RevenueCategory | undefined,
      status: draftManualStatus,
      note: draftNote.trim() ? draftNote.trim() : undefined,
      items,
      amount: items.length > 0 ? total : invoice.amount,
    };
    setInvoice(next);
    setIsEditing(false);
    alert("請求を更新しました（デモ / 保存処理は未実装）");
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

  const amountForDisplay = isEditing && draftItems.length > 0 ? total : invoice.amount;
  const remaining = amountForDisplay - totalPaid;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-blue-600" />
            請求情報・請求明細
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
              <Button onClick={save} size="sm">
                <Save className="h-4 w-4 mr-2" />
                更新
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-3 md:col-span-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">請求番号</p>
                <p className="font-semibold text-sm md:text-base">{invoice.invoice_number}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">請求日</p>
                <p className="font-medium text-sm md:text-base">{formatDate(invoice.created_at)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">顧客</p>
                <p className="font-medium text-gray-900 text-sm md:text-base">{customerName || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">物件</p>
                <p className="font-medium text-gray-900 text-sm md:text-base">{propertyName || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">区分</p>
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
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-blue-50 text-blue-800">
                    {invoice.revenue_category || "-"}
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2">
              <p className="text-xs text-gray-500 mb-1">備考</p>
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
                  {invoice.note?.trim() ? invoice.note : "-"}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 pt-2">
              <div>
                <p className="text-xs text-gray-500 mb-1">請求金額</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">
                  {formatCurrency(amountForDisplay)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">入金済み</p>
                <p className="font-semibold text-sm md:text-base text-gray-900">{formatCurrency(totalPaid)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">残額</p>
                <p className="font-semibold text-sm md:text-base text-gray-900">{formatCurrency(remaining)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">ステータス</p>
              {isEditing ? (
                <select
                  value={draftManualStatus}
                  onChange={(e) => setDraftManualStatus(e.target.value as "有" | "無し")}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="有">黄色有</option>
                  <option value="無し">黄色無し</option>
                </select>
              ) : (
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs md:text-sm font-medium ${
                    invoice.status === "有" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {invoice.status === "有" ? "黄色有" : "黄色無し"}
                </span>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">入金状況</p>
              <span className="inline-flex items-center rounded-full px-3 py-1 text-xs md:text-sm font-medium bg-gray-100 text-gray-800">
                {paymentStatus}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">支払期限</p>
              {isEditing ? (
                <input
                  type="date"
                  value={draftDueDate}
                  onChange={(e) => setDraftDueDate(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              ) : (
                <p className="font-semibold text-sm md:text-base text-gray-900">{formatDate(invoice.due_date)}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">請求明細</p>
            {isEditing && (
              <Button type="button" variant="outline" size="sm" onClick={addRow}>
                <Plus className="h-4 w-4 mr-2" />
                行を追加
              </Button>
            )}
          </div>

          {!isEditing ? (
            invoice.items && invoice.items.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">項目</th>
                      <th className="px-4 py-2 text-right font-medium text-gray-700">数量</th>
                      <th className="px-4 py-2 text-right font-medium text-gray-700">単価</th>
                      <th className="px-4 py-2 text-right font-medium text-gray-700">金額</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {invoice.items.map((item) => (
                      <tr key={item.id} className="bg-white">
                        <td className="px-4 py-2">{item.name}</td>
                        <td className="px-4 py-2 text-right">{item.quantity.toLocaleString()}</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(item.unit_price)}</td>
                        <td className="px-4 py-2 text-right font-semibold">{formatCurrency(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">請求明細は登録されていません。</p>
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
                        <td className="px-3 py-2 text-right">{(qty * unit).toLocaleString()}円</td>
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

          {!isEditing && (invoice.items?.length ?? 0) > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 max-w-sm ml-auto space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">税抜き合計</span>
                <span className="font-medium">{formatCurrency(viewSubtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">消費税（10%）</span>
                <span className="font-medium">{formatCurrency(viewTax)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-200">
                <span>請求合計</span>
                <span>{formatCurrency(viewTotal)}</span>
              </div>
            </div>
          )}

          {isEditing && draftItems.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 max-w-sm ml-auto space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">税抜き合計</span>
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
      </CardContent>
    </Card>
  );
}

