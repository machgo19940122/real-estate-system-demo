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
  getNegotiationHistoriesByCustomerId,
} from "@/src/data/mock";
import { formatCurrency, formatDate, getPaymentStatusChipClassName } from "@/lib/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CustomerDetailClient } from "./client";
import { NegotiationHistoryClient } from "./negotiation-history-client";

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

  const sortByCreatedAtDesc = <T extends { created_at: string }>(items: T[]) =>
    items
      .slice()
      .sort((a, b) =>
        a.created_at < b.created_at ? 1 : a.created_at > b.created_at ? -1 : 0
      );

  const customerEstimatesAll = estimates.filter((e) =>
    customerProjectIds.includes((e as any).project_id)
  );
  const customerEstimates = sortByCreatedAtDesc(customerEstimatesAll).slice(0, 3);

  const customerInvoicesAll = invoices.filter((inv) =>
    customerProjectIds.includes((inv as any).project_id)
  );
  const customerInvoices = sortByCreatedAtDesc(customerInvoicesAll).slice(0, 3);

  const estimatesListHref = `/estimates?customer=${encodeURIComponent(customer.name)}`;
  const invoicesListHref = `/invoices?customer=${encodeURIComponent(customer.name)}`;

  const negotiationHistories = getNegotiationHistoriesByCustomerId(customer.id);

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

        <CustomerDetailClient initialCustomer={customer} />

        {/* 交渉履歴 */}
        <NegotiationHistoryClient initialHistories={negotiationHistories} />

        {/* 関連見積・請求 */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* この顧客の見積 */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b flex items-center justify-between gap-3">
              <CardTitle>この顧客の見積</CardTitle>
              <Link href={estimatesListHref}>
                <Button variant="outline" size="sm">
                  見積一覧へ
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
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
              {customerEstimatesAll.length > 3 && (
                <p className="text-xs text-gray-500 mt-3 text-center">
                  最新3件を表示しています（全{customerEstimatesAll.length}件）
                </p>
              )}
            </CardContent>
          </Card>

          {/* この顧客の請求 */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b flex items-center justify-between gap-3">
              <CardTitle>この顧客の請求</CardTitle>
              <Link href={invoicesListHref}>
                <Button variant="outline" size="sm">
                  請求一覧へ
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
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
                          入金状況
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
                          status !== "入金済み" &&
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
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${getPaymentStatusChipClassName(status)}`}
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
              {customerInvoicesAll.length > 3 && (
                <p className="text-xs text-gray-500 mt-3 text-center">
                  最新3件を表示しています（全{customerInvoicesAll.length}件）
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

