import { AppLayout } from "@/components/layout";
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
  customers,
  projects,
  estimates,
  invoices,
  getPropertyById,
  calculateInvoiceStatus,
} from "@/src/data/mock";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Building2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = customers.find((c) => c.id === parseInt(id));

  if (!customer) {
    notFound();
  }

  const customerProjects = projects.filter((p) => p.customer_id === customer.id);
  const customerProjectIds = customerProjects.map((p) => p.id);

  const customerEstimates = estimates.filter((e) =>
    customerProjectIds.includes((e as any).project_id)
  );

  const customerInvoices = invoices.filter((inv) =>
    customerProjectIds.includes((inv as any).project_id)
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/customers">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {customer.name}
            </h1>
            <p className="text-gray-600 mt-1">顧客詳細情報</p>
          </div>
        </div>

        {/* 基本情報 + 請求関連（1枚のカードに統合） */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              基本情報・請求関連
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">電話番号</p>
                    <p className="font-medium">{customer.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">メールアドレス</p>
                    <p className="font-medium">{customer.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">住所</p>
                    <p className="font-medium">{customer.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">登録日</p>
                    <p className="font-medium">
                      {customer.created_at ? formatDate(customer.created_at) : "-"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 mb-1">請求先担当者</p>
                  <p className="font-medium">
                    {customer.billing_contact_name || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">請求先メールアドレス</p>
                  <p className="font-medium">
                    {customer.billing_contact_email || "-"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">締め条件</p>
                    <p className="font-medium">
                      {customer.billing_closing_day || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">支払サイト</p>
                    <p className="font-medium">
                      {customer.billing_payment_site || "-"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">支払方法</p>
                  <p className="font-medium">
                    {customer.billing_payment_method || "-"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 関連見積・請求 */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* この顧客の見積 */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b flex items-center justify-between">
              <CardTitle>この顧客の見積</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {customerEstimates.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/60">
                        <TableHead className="text-xs md:text-sm font-semibold">
                          見積番号
                        </TableHead>
                        <TableHead className="text-xs md:text-sm font-semibold">
                          物件
                        </TableHead>
                        <TableHead className="text-xs md:text-sm font-semibold text-right">
                          合計金額
                        </TableHead>
                        <TableHead className="text-xs md:text-sm font-semibold">
                          作成日
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customerEstimates.map((estimate) => {
                        const project = customerProjects.find(
                          (p) => p.id === (estimate as any).project_id
                        );
                        const property = project
                          ? getPropertyById(project.property_id)
                          : undefined;
                        return (
                          <TableRow key={estimate.id} className="hover:bg-gray-50/60">
                            <TableCell className="text-xs md:text-sm font-medium">
                              <Link
                                href={`/estimates/${estimate.id}`}
                                className="text-blue-600 hover:text-blue-700 hover:underline"
                              >
                                {estimate.estimate_number}
                              </Link>
                            </TableCell>
                            <TableCell className="text-xs md:text-sm">
                              {property?.name || "-"}
                            </TableCell>
                            <TableCell className="text-xs md:text-sm text-right font-semibold">
                              {formatCurrency(estimate.total)}
                            </TableCell>
                            <TableCell className="text-xs md:text-sm">
                              {formatDate(estimate.created_at)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  この顧客の見積はまだありません
                </p>
              )}
            </CardContent>
          </Card>

          {/* この顧客の請求 */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b flex items-center justify-between">
              <CardTitle>この顧客の請求</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {customerInvoices.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/60">
                        <TableHead className="text-xs md:text-sm font-semibold">
                          請求番号
                        </TableHead>
                        <TableHead className="text-xs md:text-sm font-semibold">
                          物件
                        </TableHead>
                        <TableHead className="text-xs md:text-sm font-semibold text-right">
                          請求金額
                        </TableHead>
                        <TableHead className="text-xs md:text-sm font-semibold">
                          支払期限
                        </TableHead>
                        <TableHead className="text-xs md:text-sm font-semibold">
                          入金ステータス
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customerInvoices.map((invoice) => {
                        const project = customerProjects.find(
                          (p) => p.id === (invoice as any).project_id
                        );
                        const property = project
                          ? getPropertyById(project.property_id)
                          : undefined;
                        const status = calculateInvoiceStatus(invoice);
                        const isOverdue =
                          status === "無し" &&
                          new Date(invoice.due_date) < new Date();
                        return (
                          <TableRow key={invoice.id} className="hover:bg-gray-50/60">
                            <TableCell className="text-xs md:text-sm font-medium">
                              <Link
                                href={`/invoices/${invoice.id}`}
                                className="text-blue-600 hover:text-blue-700 hover:underline"
                              >
                                {invoice.invoice_number}
                              </Link>
                            </TableCell>
                            <TableCell className="text-xs md:text-sm">
                              {property?.name || "-"}
                            </TableCell>
                            <TableCell className="text-xs md:text-sm text-right font-semibold">
                              {formatCurrency(invoice.amount)}
                            </TableCell>
                            <TableCell className="text-xs md:text-sm">
                              <span
                                className={
                                  isOverdue ? "text-red-600 font-medium" : "text-gray-900"
                                }
                              >
                                {formatDate(invoice.due_date)}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs md:text-sm">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                                  status === "有"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {status}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  この顧客の請求はまだありません
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

