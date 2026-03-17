import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  invoices,
  projects,
  getCustomerById,
  getPropertyById,
  getPaymentsByInvoiceId,
  getTotalPaidAmount,
  calculateInvoiceStatus,
} from "@/src/data/mock";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, Receipt, Calendar, AlertCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PaymentClient } from "./payment-client";
import { ReceiptClient } from "./receipt-client";
import { InvoicePdfClient } from "./pdf-client";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = invoices.find((i) => i.id === parseInt(id));

  if (!invoice) {
    notFound();
  }

  const project = projects.find((p) => p.id === (invoice as any).project_id);
  const customer = project ? getCustomerById(project.customer_id) : undefined;
  const property = project ? getPropertyById(project.property_id) : undefined;
  const payments = getPaymentsByInvoiceId(invoice.id);
  const totalPaid = getTotalPaidAmount(invoice.id);
  const currentStatus = calculateInvoiceStatus(invoice);
  const isOverdue =
    currentStatus === "無し" && new Date(invoice.due_date) < new Date();

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
              {invoice.invoice_number}
            </h1>
            <p className="text-gray-600 mt-1">請求詳細</p>
          </div>
        </div>

        {isOverdue && (
          <Card className="border-0 shadow-lg bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-semibold text-red-900">支払期限を過ぎています</p>
                  <p className="text-sm text-red-700">
                    支払期限: {formatDate(invoice.due_date)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 一般的な請求書レイアウトに近いまとめカード */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-blue-600" />
                請求情報・請求明細
              </CardTitle>
              <div className="flex items-center gap-2">
                <InvoicePdfClient invoiceNumber={invoice.invoice_number} />
                <ReceiptClient
                  invoiceId={invoice.id}
                  invoiceAmount={invoice.amount}
                  totalPaid={totalPaid}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* 上段：請求ヘッダー情報＋支払情報をコンパクトに */}
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-3 md:col-span-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">請求番号</p>
                    <p className="font-semibold text-sm md:text-base">
                      {invoice.invoice_number}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">請求日</p>
                    <p className="font-medium text-sm md:text-base">
                      {formatDate(invoice.created_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">顧客</p>
                    {customer ? (
                      <Link
                        href={`/customers/${customer.id}`}
                        className="font-medium text-blue-600 hover:text-blue-700 hover:underline text-sm md:text-base"
                      >
                        {customer.name}
                      </Link>
                    ) : (
                      <p className="font-medium text-gray-500 text-sm md:text-base">-</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">物件</p>
                    {property ? (
                      <Link
                        href={`/properties/${property.id}`}
                        className="font-medium text-blue-600 hover:text-blue-700 hover:underline text-sm md:text-base"
                      >
                        {property.name}
                      </Link>
                    ) : (
                      <p className="font-medium text-gray-500 text-sm md:text-base">-</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">区分</p>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-blue-50 text-blue-800">
                      {invoice.revenue_category || "-"}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">請求金額</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">
                      {formatCurrency(invoice.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">入金済み</p>
                    <p className="font-semibold text-sm md:text-base text-gray-900">
                      {formatCurrency(totalPaid)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">残額</p>
                    <p className="font-semibold text-sm md:text-base text-gray-900">
                      {formatCurrency(invoice.amount - totalPaid)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">入金ステータス</p>
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-xs md:text-sm font-medium bg-yellow-100 text-yellow-800">
                    {currentStatus}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">支払期限</p>
                  <p
                    className={`font-semibold text-sm md:text-base ${
                      isOverdue ? "text-red-600" : "text-gray-900"
                    }`}
                  >
                    {formatDate(invoice.due_date)}
                  </p>
                  {isOverdue && (
                    <p className="text-[11px] text-red-600 mt-0.5">
                      {Math.floor(
                        (new Date().getTime() -
                          new Date(invoice.due_date).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}{" "}
                      日超過
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">残り日数</p>
                  {currentStatus === "有" ? (
                    <p className="font-medium text-sm md:text-base text-yellow-600">
                      入金済み
                    </p>
                  ) : (
                    <p
                      className={`font-semibold text-sm md:text-base ${
                        isOverdue
                          ? "text-red-600"
                          : new Date(invoice.due_date).getTime() -
                              new Date().getTime() <
                            7 * 24 * 60 * 60 * 1000
                          ? "text-yellow-600"
                          : "text-gray-900"
                      }`}
                    >
                      {Math.ceil(
                        (new Date(invoice.due_date).getTime() -
                          new Date().getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}{" "}
                      日
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 下段：請求明細テーブル */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700">請求明細</p>
              {invoice.items && invoice.items.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">
                          項目
                        </th>
                        <th className="px-4 py-2 text-right font-medium text-gray-700">
                          数量
                        </th>
                        <th className="px-4 py-2 text-right font-medium text-gray-700">
                          単価
                        </th>
                        <th className="px-4 py-2 text-right font-medium text-gray-700">
                          金額
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {invoice.items.map((item) => (
                        <tr key={item.id} className="bg-white">
                          <td className="px-4 py-2">{item.name}</td>
                          <td className="px-4 py-2 text-right">
                            {item.quantity.toLocaleString()}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {formatCurrency(item.unit_price)}
                          </td>
                          <td className="px-4 py-2 text-right font-semibold">
                            {formatCurrency(item.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  請求明細は登録されていません。
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 入金管理 */}
        <PaymentClient
          invoiceId={invoice.id}
          invoiceAmount={invoice.amount}
          initialPayments={payments}
        />
      </div>
    </AppLayout>
  );
}

