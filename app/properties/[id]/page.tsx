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
  properties,
  projects,
  estimates,
  invoices,
  getCustomerById,
  getPropertyOwnerCustomerId,
  calculateInvoiceStatus,
} from "@/src/data/mock";
import { formatCurrency, formatDate, getPaymentStatusChipClassName } from "@/lib/utils";
import { ArrowLeft, ArrowRight, FileText, Receipt } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PropertyDetailClient } from "./client";
import { PropertyAttachmentsClient } from "./property-attachments-client";

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = properties.find((p) => p.id === parseInt(id));

  if (!property) {
    notFound();
  }

  const propertyProjects = projects.filter((p) => p.property_id === property.id);
  const propertyProjectIds = propertyProjects.map((p) => p.id);

  const sortByCreatedAtDesc = <T extends { created_at: string }>(items: T[]) =>
    items
      .slice()
      .sort((a, b) =>
        a.created_at < b.created_at ? 1 : a.created_at > b.created_at ? -1 : 0
      );

  const propertyEstimatesAll = estimates.filter((e) =>
    propertyProjectIds.includes((e as any).project_id)
  );
  const propertyEstimates = sortByCreatedAtDesc(propertyEstimatesAll).slice(0, 3);

  const propertyInvoicesAll = invoices.filter((inv) =>
    propertyProjectIds.includes((inv as any).project_id)
  );
  const propertyInvoices = sortByCreatedAtDesc(propertyInvoicesAll).slice(0, 3);

  const estimatesListHref = `/estimates?property=${encodeURIComponent(property.name)}`;
  const invoicesListHref = `/invoices?property=${encodeURIComponent(property.name)}`;

  const ownerCustomerId = getPropertyOwnerCustomerId(property);
  const ownerCustomer = ownerCustomerId ? getCustomerById(ownerCustomerId) : undefined;

  const estimateNewParams = new URLSearchParams();
  estimateNewParams.set("propertyId", String(property.id));
  if (property.category) {
    // 物件区分（注文/建売/土地）→ 売上区分（同じ5択）へ
    estimateNewParams.set("revenueCategory", property.category);
  }
  if (ownerCustomer) estimateNewParams.set("customerId", String(ownerCustomer.id));
  const estimateNewHref = `/estimates/new?${estimateNewParams.toString()}`;

  const invoiceNewParams = new URLSearchParams();
  invoiceNewParams.set("propertyId", String(property.id));
  if (property.category) {
    invoiceNewParams.set("revenueCategory", property.category);
  }
  if (ownerCustomer) {
    invoiceNewParams.set("customerId", String(ownerCustomer.id));
  }
  if (property.memo?.trim()) {
    invoiceNewParams.set("note", property.memo.trim());
  }
  const latestEstimate = sortByCreatedAtDesc(propertyEstimatesAll)[0];
  if (latestEstimate) {
    invoiceNewParams.set("estimateId", String(latestEstimate.id));
    if (latestEstimate.staff_id != null) {
      invoiceNewParams.set("staffId", String(latestEstimate.staff_id));
    }
  }
  const invoiceNewHref = `/invoices/new?${invoiceNewParams.toString()}`;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/properties">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                戻る
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {property.name}
              </h1>
              <p className="text-gray-600 mt-1">物件詳細情報</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href={estimateNewHref}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <FileText className="h-4 w-4 mr-2" />
                この物件の見積を作る
              </Button>
            </Link>
            <Link href={invoiceNewHref}>
              <Button variant="outline" className="border-blue-600 text-blue-700 hover:bg-blue-50">
                <Receipt className="h-4 w-4 mr-2" />
                この物件の請求書を作る
              </Button>
            </Link>
          </div>
        </div>

        <PropertyDetailClient initialProperty={property} />

        <PropertyAttachmentsClient
          propertyId={property.id}
          initialAttachments={property.attachments}
        />

        {/* 関連請求・見積 */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* この物件の請求 */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b flex items-center justify-between gap-3">
              <CardTitle>この物件の請求</CardTitle>
              <Link href={invoicesListHref}>
                <Button variant="outline" size="sm">
                  請求一覧へ
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-6">
              {propertyInvoices.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/60">
                        <TableHead className="text-xs md:text-sm font-semibold">
                          請求番号
                        </TableHead>
                        <TableHead className="text-xs md:text-sm font-semibold">
                          顧客
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
                      {propertyInvoices.map((invoice) => {
                        const project = propertyProjects.find(
                          (p) => p.id === (invoice as any).project_id
                        );
                        const customer = project
                          ? getCustomerById(project.customer_id)
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
                              {customer?.name || "-"}
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
                  この物件の請求はまだありません
                </p>
              )}
              {propertyInvoicesAll.length > 3 && (
                <p className="text-xs text-gray-500 mt-3 text-center">
                  最新3件を表示しています（全{propertyInvoicesAll.length}件）
                </p>
              )}
            </CardContent>
          </Card>

          {/* この物件の見積 */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b flex items-center justify-between gap-3">
              <CardTitle>この物件の見積</CardTitle>
              <Link href={estimatesListHref}>
                <Button variant="outline" size="sm">
                  見積一覧へ
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-6">
              {propertyEstimates.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/60">
                        <TableHead className="text-xs md:text-sm font-semibold">
                          見積番号
                        </TableHead>
                        <TableHead className="text-xs md:text-sm font-semibold">
                          顧客
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
                      {propertyEstimates.map((estimate) => {
                        const project = propertyProjects.find(
                          (p) => p.id === (estimate as any).project_id
                        );
                        const customer = project
                          ? getCustomerById(project.customer_id)
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
                              {customer?.name || "-"}
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
                  この物件の見積はまだありません
                </p>
              )}
              {propertyEstimatesAll.length > 3 && (
                <p className="text-xs text-gray-500 mt-3 text-center">
                  最新3件を表示しています（全{propertyEstimatesAll.length}件）
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

