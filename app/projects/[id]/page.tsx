import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  projects,
  getCustomerById,
  getPropertyById,
  getStaffById,
  estimates,
  invoices,
  calculateInvoiceStatus,
} from "@/src/data/mock";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  User,
  Building2,
  Tag,
  DollarSign,
  Calendar,
  FileText,
  Receipt,
  UserCircle,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = projects.find((p) => p.id === parseInt(id));

  if (!project) {
    notFound();
  }

  const customer = getCustomerById(project.customer_id);
  const property = getPropertyById(project.property_id);
  const staff = project.staff_id ? getStaffById(project.staff_id) : undefined;
  const projectEstimates = estimates.filter((e) => e.project_id === project.id);
  const projectInvoices = invoices.filter((i) => i.project_id === project.id);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/projects">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {project.name}
            </h1>
            <p className="text-gray-600 mt-1">案件詳細情報</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* 基本情報 */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                基本情報
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">顧客</p>
                  <Link
                    href={`/customers/${customer?.id}`}
                    className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    {customer?.name || "-"}
                  </Link>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">物件</p>
                  <Link
                    href={`/properties/${property?.id}`}
                    className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    {property?.name || "-"}
                  </Link>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <UserCircle className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">担当者</p>
                  {staff ? (
                    <Link
                      href={`/staff/${staff.id}`}
                      className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      {staff.name}
                    </Link>
                  ) : (
                    <span className="font-medium text-gray-500">-</span>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Tag className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">案件タイプ</p>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium mt-1 ${
                      project.type === "新築売買"
                        ? "bg-blue-100 text-blue-800"
                        : project.type === "中古売買"
                        ? "bg-purple-100 text-purple-800"
                        : project.type === "仲介"
                        ? "bg-indigo-100 text-indigo-800"
                        : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {project.type}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">金額</p>
                  <p className="font-semibold text-lg">{formatCurrency(project.price)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-sm text-gray-500">ステータス:</span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    project.status === "完了"
                      ? "bg-green-100 text-green-800"
                      : project.status === "契約済"
                      ? "bg-blue-100 text-blue-800"
                      : project.status === "工事中"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {project.status}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">作成日</p>
                  <p className="font-medium">
                    {project.created_at ? formatDate(project.created_at) : "-"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 見積・請求情報 */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b">
              <CardTitle>見積・請求情報</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  見積 ({projectEstimates.length}件)
                </h3>
                {projectEstimates.length > 0 ? (
                  <div className="space-y-2">
                    {projectEstimates.map((estimate) => (
                      <Link
                        key={estimate.id}
                        href={`/estimates/${estimate.id}`}
                        className="block p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{estimate.estimate_number}</p>
                            <p className="text-xs text-gray-500">
                              {formatDate(estimate.created_at)}
                            </p>
                          </div>
                          <p className="font-semibold">{formatCurrency(estimate.total)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">見積がありません</p>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  請求 ({projectInvoices.length}件)
                </h3>
                {projectInvoices.length > 0 ? (
                  <div className="space-y-2">
                    {projectInvoices.map((invoice) => (
                      <Link
                        key={invoice.id}
                        href={`/invoices/${invoice.id}`}
                        className="block p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{invoice.invoice_number}</p>
                            <p className="text-xs text-gray-500">
                              期限: {formatDate(invoice.due_date)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(invoice.amount)}</p>
                            <span
                              className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium mt-1 bg-gray-100 text-gray-800"
                            >
                              {calculateInvoiceStatus(invoice)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">請求がありません</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

