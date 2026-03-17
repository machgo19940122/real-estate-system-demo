"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getPaymentsByInvoiceId,
  getTotalPaidAmount,
  getInvoiceById,
  getProjectById,
  getCustomerById,
} from "@/src/data/mock";
import { formatCurrency, formatDate } from "@/lib/utils";
import { FileText, X } from "lucide-react";

interface ReceiptClientProps {
  invoiceId: number;
  invoiceAmount: number;
  totalPaid: number;
}

export function ReceiptClient({
  invoiceId,
  invoiceAmount,
  totalPaid,
}: ReceiptClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: totalPaid.toString(),
    note: "",
    receipt_date: new Date().toISOString().split("T")[0],
    delivery_method: "electronic" as "electronic" | "paper", // 電子送付 or 紙送付
  });

  const invoice = getInvoiceById(invoiceId);
  const project =
    invoice && invoice.project_id != null
      ? getProjectById(invoice.project_id)
      : undefined;
  const customer = project ? getCustomerById(project.customer_id) : undefined;

  // 入金済みまたは一部入金の場合のみ表示
  if (totalPaid === 0) return null;

  const handleOpen = () => {
    setFormData({
      amount: totalPaid.toString(),
      note: project?.name || "",
      receipt_date: new Date().toISOString().split("T")[0],
      delivery_method: "electronic",
    });
    setIsModalOpen(true);
  };

  const handleIssue = () => {
    // ダミー実装（実際はPDF生成やAPI呼び出し）
    alert(
      `領収書を発行しました。\n\n金額: ${formatCurrency(parseFloat(formData.amount))}\n但し書き: ${formData.note || "-"}\n発行日: ${formData.receipt_date}`
    );
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <FileText className="h-4 w-4 mr-2" />
        領収書発行
      </Button>

      {/* 領収書発行モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl border-0 shadow-xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">領収書発行</CardTitle>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="閉じる"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* 請求情報の表示 */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">請求番号:</span>
                  <span className="text-sm font-medium">{invoice?.invoice_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">取引先:</span>
                  <span className="text-sm font-medium">{customer?.name || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">案件名:</span>
                  <span className="text-sm font-medium">{project?.name || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">請求金額:</span>
                  <span className="text-sm font-medium">{formatCurrency(invoiceAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">入金済み:</span>
                  <span className="text-sm font-medium text-green-600">
                    {formatCurrency(totalPaid)}
                  </span>
                </div>
              </div>

              {/* 領収書情報の入力 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    領収金額 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={totalPaid}
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    最大: {formatCurrency(totalPaid)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    但し書き
                  </label>
                  <textarea
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    rows={3}
                    placeholder="例: リフォーム工事代金として"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    領収書に記載される但し書きを入力してください
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    発行日 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.receipt_date}
                    onChange={(e) =>
                      setFormData({ ...formData, receipt_date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    送付方法 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="delivery_method"
                        value="electronic"
                        checked={formData.delivery_method === "electronic"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            delivery_method: e.target.value as "electronic" | "paper",
                          })
                        }
                        className="w-4 h-4 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm">電子送付（PDF等）</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="delivery_method"
                        value="paper"
                        checked={formData.delivery_method === "paper"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            delivery_method: e.target.value as "electronic" | "paper",
                          })
                        }
                        className="w-4 h-4 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm">紙送付</span>
                    </label>
                  </div>
                  {formData.delivery_method === "electronic" && (
                    <p className="text-xs text-blue-600 mt-2 bg-blue-50 p-2 rounded">
                      ※ 電子送付の場合は印紙税法により印紙貼付は不要です
                    </p>
                  )}
                </div>
              </div>

              {/* プレビュー */}
              <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">プレビュー</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">金額:</span>
                    <span className="font-semibold">
                      {formatCurrency(parseFloat(formData.amount) || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">但し書き:</span>
                    <span className="font-medium">
                      {formData.note || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">発行日:</span>
                    <span className="font-medium">{formatDate(formData.receipt_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">送付方法:</span>
                    <span className="font-medium">
                      {formData.delivery_method === "electronic" ? "電子送付" : "紙送付"}
                    </span>
                  </div>
                  {formData.delivery_method === "electronic" && (
                    <div className="mt-2 pt-2 border-t border-gray-300">
                      <p className="text-xs text-gray-500 italic">
                        ※ この領収書は電子データのため印紙税法により印紙貼付は不要です
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ボタン */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsModalOpen(false)}
                >
                  キャンセル
                </Button>
                <Button
                  onClick={handleIssue}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                  disabled={!formData.amount || parseFloat(formData.amount) <= 0}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  領収書を発行
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

