"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getPaymentsByInvoiceId,
  getTotalPaidAmount,
  type Payment,
  type PaymentMethod,
} from "@/src/data/mock";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, CreditCard } from "lucide-react";

interface PaymentClientProps {
  invoiceId: number;
  invoiceAmount: number;
  initialPayments: Payment[];
}

export function PaymentClient({
  invoiceId,
  invoiceAmount,
  initialPayments,
}: PaymentClientProps) {
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    payment_date: new Date().toISOString().split("T")[0],
    payment_method: "振込" as PaymentMethod,
    note: "",
  });

  const totalPaid = getTotalPaidAmount(invoiceId);
  const remainingAmount = invoiceAmount - totalPaid;
  const paymentProgress = (totalPaid / invoiceAmount) * 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ダミー実装（実際はAPI呼び出し）
    const newPayment: Payment = {
      id: Date.now(),
      invoice_id: invoiceId,
      amount: parseFloat(formData.amount),
      payment_date: formData.payment_date,
      payment_method: formData.payment_method,
      note: formData.note || undefined,
      created_at: new Date().toISOString(),
    };
    setPayments([...payments, newPayment]);
    setFormData({
      amount: "",
      payment_date: new Date().toISOString().split("T")[0],
      payment_method: "振込",
      note: "",
    });
    setIsModalOpen(false);
  };

  return (
    <>
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              入金管理
            </CardTitle>
            <Button
              onClick={() => setIsModalOpen(true)}
              disabled={remainingAmount <= 0}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              入金登録
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {/* 入金状況サマリー */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">請求金額</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(invoiceAmount)}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">入金済み</p>
              <p className="text-xl font-bold text-green-700">
                {formatCurrency(totalPaid)}
              </p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">残額</p>
              <p className="text-xl font-bold text-orange-700">
                {formatCurrency(remainingAmount)}
              </p>
            </div>
          </div>

          {/* プログレスバー */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">入金進捗</span>
              <span className="text-sm font-semibold text-gray-900">
                {paymentProgress.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  paymentProgress === 100
                    ? "bg-green-500"
                    : paymentProgress > 0
                    ? "bg-blue-500"
                    : "bg-gray-300"
                }`}
                style={{ width: `${Math.min(paymentProgress, 100)}%` }}
              />
            </div>
          </div>

          {/* 入金履歴テーブル */}
          {payments.length > 0 ? (
            <div>
              <h3 className="font-semibold mb-3 text-sm text-gray-700">入金履歴</h3>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="font-semibold text-xs">入金日</TableHead>
                    <TableHead className="font-semibold text-xs">入金額</TableHead>
                    <TableHead className="font-semibold text-xs">入金方法</TableHead>
                    <TableHead className="font-semibold text-xs">備考</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id} className="hover:bg-gray-50/50">
                      <TableCell className="text-sm">
                        {formatDate(payment.payment_date)}
                      </TableCell>
                      <TableCell className="font-semibold text-sm">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell className="text-sm">{payment.payment_method}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {payment.note || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              入金履歴がありません
            </p>
          )}
        </CardContent>
      </Card>

      {/* 入金登録モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-0 shadow-xl">
            <CardHeader className="border-b">
              <CardTitle>入金登録</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    入金額 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={remainingAmount}
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    残額: {formatCurrency(remainingAmount)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    入金日 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.payment_date}
                    onChange={(e) =>
                      setFormData({ ...formData, payment_date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    入金方法 <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.payment_method}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payment_method: e.target.value as PaymentMethod,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="振込">振込</option>
                    <option value="現金">現金</option>
                    <option value="小切手">小切手</option>
                    <option value="その他">その他</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    備考
                  </label>
                  <textarea
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    rows={3}
                    placeholder="備考があれば入力してください"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsModalOpen(false)}
                  >
                    キャンセル
                  </Button>
                  <Button type="submit" className="flex-1">
                    登録
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}


