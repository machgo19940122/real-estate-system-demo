import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { projects, invoices, getCustomerById, getStaffById } from "@/src/data/mock";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, FileX, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  // 今月の売上計算（入金済の請求のみ）
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const monthlyRevenue = invoices
    .filter(
      (inv) =>
        inv.status === "入金済" &&
        new Date(inv.created_at).getMonth() + 1 === currentMonth &&
        new Date(inv.created_at).getFullYear() === currentYear
    )
    .reduce((sum, inv) => sum + inv.amount, 0);

  // 未請求件数
  const unpaidInvoicesCount = invoices.filter(
    (inv) => inv.status === "未請求"
  ).length;

  // 未入金件数
  const outstandingInvoicesCount = invoices.filter(
    (inv) => inv.status === "未入金"
  ).length;

  // 最近の案件（最新5件）
  const recentProjects = projects
    .sort(
      (a, b) =>
        new Date(b.created_at || "").getTime() -
        new Date(a.created_at || "").getTime()
    )
    .slice(0, 5);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            ダッシュボード
          </h1>
          <p className="text-gray-600 mt-2">システムの概要を確認できます</p>
        </div>

        {/* 統計カード */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">今月売上</CardTitle>
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {formatCurrency(monthlyRevenue)}
              </div>
              <p className="text-xs text-gray-500 mt-2">入金済みの請求のみ</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-orange-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">未請求件数</CardTitle>
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md">
                <FileX className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{unpaidInvoicesCount}</div>
              <p className="text-xs text-gray-500 mt-2">請求書未発行</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-yellow-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">未入金件数</CardTitle>
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-md">
                <Clock className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {outstandingInvoicesCount}
              </div>
              <p className="text-xs text-gray-500 mt-2">入金待ち</p>
            </CardContent>
          </Card>
        </div>

        {/* 最近の案件テーブル */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">最近の案件</CardTitle>
              <Link
                href="/projects"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                すべて見る
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="font-semibold">案件名</TableHead>
                  <TableHead className="font-semibold">顧客</TableHead>
                  <TableHead className="font-semibold">担当者</TableHead>
                  <TableHead className="font-semibold">タイプ</TableHead>
                  <TableHead className="font-semibold">金額</TableHead>
                  <TableHead className="font-semibold">ステータス</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentProjects.map((project) => {
                  const customer = getCustomerById(project.customer_id);
                  const staff = project.staff_id ? getStaffById(project.staff_id) : undefined;
                  return (
                    <TableRow key={project.id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell className="font-medium">
                        <Link
                          href={`/projects/${project.id}`}
                          className="text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          {project.name}
                        </Link>
                      </TableCell>
                      <TableCell>{customer?.name || "-"}</TableCell>
                      <TableCell>
                        {staff ? (
                          <Link
                            href={`/staff/${staff.id}`}
                            className="text-gray-700 hover:text-blue-600 hover:underline"
                          >
                            {staff.name}
                          </Link>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
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
                      </TableCell>
                      <TableCell className="font-semibold">{formatCurrency(project.price)}</TableCell>
                      <TableCell>
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
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

