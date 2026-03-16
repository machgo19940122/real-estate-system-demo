import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  invoices,
  getProjectById,
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

  const project = getProjectById(invoice.project_id);
  const payments = getPaymentsByInvoiceId(invoice.id);
  const totalPaid = getTotalPaidAmount(invoice.id);
  const currentStatus = calculateInvoiceStatus(invoice);
  const isOverdue =
    (currentStatus === "未入金" || currentStatus === "一部入金") &&
    new Date(invoice.due_date) < new Date();

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

        <div className="grid gap-6 md:grid-cols-2">
          {/* 請求詳細 */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-blue-600" />
                  請求情報
                </CardTitle>
                <ReceiptClient
                  invoiceId={invoice.id}
                  invoiceAmount={invoice.amount}
                  totalPaid={totalPaid}
                />
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">請求番号</p>
                <p className="font-semibold text-lg">{invoice.invoice_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">案件名</p>
                <Link
                  href={`/projects/${project?.id}`}
                  className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                  {project?.name || "-"}
                </Link>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">請求金額</p>
                <p className="text-3xl font-bold text-blue-600">
                  {formatCurrency(invoice.amount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">ステータス</p>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                    currentStatus === "入金済"
                      ? "bg-green-100 text-green-800"
                      : currentStatus === "一部入金"
                      ? "bg-blue-100 text-blue-800"
                      : currentStatus === "未入金"
                      ? isOverdue
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {currentStatus}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">入金済み</p>
                <p className="font-semibold text-lg text-green-600">
                  {formatCurrency(totalPaid)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">残額</p>
                <p className="font-semibold text-lg text-orange-600">
                  {formatCurrency(invoice.amount - totalPaid)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 支払情報 */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                支払情報
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">支払期限</p>
                <p
                  className={`font-semibold text-lg ${
                    isOverdue ? "text-red-600" : "text-gray-900"
                  }`}
                >
                  {formatDate(invoice.due_date)}
                </p>
                {isOverdue && (
                  <p className="text-xs text-red-600 mt-1">
                    {Math.floor(
                      (new Date().getTime() - new Date(invoice.due_date).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    日超過
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">請求日</p>
                <p className="font-medium">{formatDate(invoice.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">残り日数</p>
                {currentStatus === "入金済" ? (
                  <p className="font-medium text-green-600">入金済み</p>
                ) : (
                  <p
                    className={`font-semibold ${
                      isOverdue
                        ? "text-red-600"
                        : new Date(invoice.due_date).getTime() - new Date().getTime() <
                          7 * 24 * 60 * 60 * 1000
                        ? "text-yellow-600"
                        : "text-gray-900"
                    }`}
                  >
                    {Math.ceil(
                      (new Date(invoice.due_date).getTime() - new Date().getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    日
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

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

