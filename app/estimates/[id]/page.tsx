import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { estimates, getProjectById, getStaffById } from "@/src/data/mock";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, FileText, UserCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EstimateDetailClient } from "./client";

export default async function EstimateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const estimate = estimates.find((e) => e.id === parseInt(id));

  if (!estimate) {
    notFound();
  }

  const project = getProjectById(estimate.project_id);
  const staff = estimate.staff_id ? getStaffById(estimate.staff_id) : undefined;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/estimates">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                戻る
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {estimate.estimate_number}
              </h1>
              <p className="text-gray-600 mt-1">見積詳細</p>
            </div>
          </div>
          <EstimateDetailClient />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* 見積詳細 */}
          <Card className="border-0 shadow-lg md:col-span-2">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                見積内容
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                  <div>
                    <p className="text-sm text-gray-500">見積番号</p>
                    <p className="font-semibold">{estimate.estimate_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">案件名</p>
                    <Link
                      href={`/projects/${project?.id}`}
                      className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      {project?.name || "-"}
                    </Link>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">担当者</p>
                    {staff ? (
                      <Link
                        href={`/staff/${staff.id}`}
                        className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        {staff.name}
                      </Link>
                    ) : (
                      <p className="font-medium text-gray-500">-</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">作成日</p>
                    <p className="font-medium">{formatDate(estimate.created_at)}</p>
                  </div>
                </div>

                {estimate.items && estimate.items.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-4">見積項目</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                              項目
                            </th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                              数量
                            </th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                              単価
                            </th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                              金額
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {estimate.items.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">{item.name}</td>
                              <td className="px-4 py-3 text-right">{item.quantity}</td>
                              <td className="px-4 py-3 text-right">
                                {formatCurrency(item.unit_price)}
                              </td>
                              <td className="px-4 py-3 text-right font-semibold">
                                {formatCurrency(item.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-4 border-t">
                  <div className="w-80 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">小計:</span>
                      <span className="font-medium">{formatCurrency(estimate.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">消費税 (10%):</span>
                      <span className="font-medium">{formatCurrency(estimate.tax)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>合計:</span>
                      <span className="text-blue-600">{formatCurrency(estimate.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 情報カード */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b">
              <CardTitle>情報</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">見積番号</p>
                <p className="font-semibold">{estimate.estimate_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">案件</p>
                <Link
                  href={`/projects/${project?.id}`}
                  className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                  {project?.name || "-"}
                </Link>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">担当者</p>
                {staff ? (
                  <Link
                    href={`/staff/${staff.id}`}
                    className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    {staff.name}
                  </Link>
                ) : (
                  <p className="font-medium text-gray-500">-</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">作成日</p>
                <p className="font-medium">{formatDate(estimate.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">合計金額</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(estimate.total)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

