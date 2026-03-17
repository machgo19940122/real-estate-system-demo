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
  staff,
  estimates,
  invoices,
  projects,
  getPropertyById,
  getCustomerById,
  getInvoiceStaffId,
  calculateInvoiceStatus,
} from "@/src/data/mock";
import { formatDate, formatCurrency } from "@/lib/utils";
import { ArrowLeft, Mail, Phone, User, Calendar, Briefcase, FileText, Receipt } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function StaffDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const staffId = parseInt(id);
  const member = staff.find((s) => s.id === staffId);

  if (!member) {
    notFound();
  }

  const staffEstimates = estimates.filter((e) => e.staff_id === staffId);
  const staffInvoices = invoices.filter((inv) => getInvoiceStaffId(inv) === staffId);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/staff">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {member.name}
            </h1>
            <p className="text-gray-600 mt-1">担当者詳細情報</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* 基本情報 */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                基本情報
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">メールアドレス</p>
                  <p className="font-medium">{member.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">電話番号</p>
                  <p className="font-medium">{member.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">役職</p>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium mt-1 ${
                      member.role === "管理者"
                        ? "bg-purple-100 text-purple-800"
                        : member.role === "営業"
                        ? "bg-blue-100 text-blue-800"
                        : member.role === "現場監督"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {member.role}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">部署</p>
                  <p className="font-medium">{member.department}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">登録日</p>
                  <p className="font-medium">
                    {member.created_at ? formatDate(member.created_at) : "-"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* この担当者の見積 */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b flex flex-row items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <CardTitle>この担当者の見積 ({staffEstimates.length}件)</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {staffEstimates.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/60">
                      <TableHead className="text-xs md:text-sm font-semibold">見積番号</TableHead>
                      <TableHead className="text-xs md:text-sm font-semibold">顧客</TableHead>
                      <TableHead className="text-xs md:text-sm font-semibold">物件</TableHead>
                      <TableHead className="text-xs md:text-sm font-semibold text-right">合計金額</TableHead>
                      <TableHead className="text-xs md:text-sm font-semibold">作成日</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffEstimates.map((estimate) => {
                      const project = projects.find((p) => p.id === estimate.project_id);
                      const customer = project ? getCustomerById(project.customer_id) : undefined;
                      const property = project ? getPropertyById(project.property_id) : undefined;
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
                            {customer ? (
                              <Link href={`/customers/${customer.id}`} className="hover:underline">
                                {customer.name}
                              </Link>
                            ) : "-"}
                          </TableCell>
                          <TableCell className="text-xs md:text-sm">
                            {property ? (
                              <Link href={`/properties/${property.id}`} className="hover:underline">
                                {property.name}
                              </Link>
                            ) : "-"}
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
              <p className="text-gray-500 text-center py-4">この担当者の見積はまだありません</p>
            )}
          </CardContent>
        </Card>

        {/* この担当者の請求 */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b flex flex-row items-center gap-2">
            <Receipt className="h-5 w-5 text-blue-600" />
            <CardTitle>この担当者の請求 ({staffInvoices.length}件)</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {staffInvoices.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/60">
                      <TableHead className="text-xs md:text-sm font-semibold">請求番号</TableHead>
                      <TableHead className="text-xs md:text-sm font-semibold">顧客</TableHead>
                      <TableHead className="text-xs md:text-sm font-semibold">物件</TableHead>
                      <TableHead className="text-xs md:text-sm font-semibold text-right">請求金額</TableHead>
                      <TableHead className="text-xs md:text-sm font-semibold">支払期限</TableHead>
                      <TableHead className="text-xs md:text-sm font-semibold">入金ステータス</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffInvoices.map((invoice) => {
                      const project = projects.find((p) => p.id === (invoice as any).project_id);
                      const customer = project ? getCustomerById(project.customer_id) : undefined;
                      const property = project ? getPropertyById(project.property_id) : undefined;
                      const status = calculateInvoiceStatus(invoice);
                      const isOverdue =
                        status === "無し" && new Date(invoice.due_date) < new Date();
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
                            {customer ? (
                              <Link href={`/customers/${customer.id}`} className="hover:underline">
                                {customer.name}
                              </Link>
                            ) : "-"}
                          </TableCell>
                          <TableCell className="text-xs md:text-sm">
                            {property ? (
                              <Link href={`/properties/${property.id}`} className="hover:underline">
                                {property.name}
                              </Link>
                            ) : "-"}
                          </TableCell>
                          <TableCell className="text-xs md:text-sm text-right font-semibold">
                            {formatCurrency(invoice.amount)}
                          </TableCell>
                          <TableCell className="text-xs md:text-sm">
                            <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                              {formatDate(invoice.due_date)}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs md:text-sm">
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-yellow-100 text-yellow-800">
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
              <p className="text-gray-500 text-center py-4">この担当者の請求はまだありません</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

