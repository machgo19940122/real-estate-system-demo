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
import {
  invoices,
  getCustomerById,
  getProjectById,
  calculateInvoiceStatus,
} from "@/src/data/mock";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TrendingUp, FileX, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  // 今月の売上計算（入金済み＝入金額が請求金額以上のもののみ）
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const monthlyRevenue = invoices
    .filter(
      (inv) =>
        calculateInvoiceStatus(inv) === "有" &&
        new Date(inv.created_at).getMonth() + 1 === currentMonth &&
        new Date(inv.created_at).getFullYear() === currentYear
    )
    .reduce((sum, inv) => sum + inv.amount, 0);

  // 未請求件数（入金ステータスが無しの件数）
  const unpaidInvoicesCount = invoices.filter(
    (inv) => calculateInvoiceStatus(inv) === "無し"
  ).length;

  // 未入金件数（入金ステータスが無しの件数）
  const outstandingInvoicesCount = invoices.filter(
    (inv) => calculateInvoiceStatus(inv) === "無し"
  ).length;

  // 最近の請求（最新5件）
  const recentInvoices = [...invoices]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
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

        {/* 最近の請求 */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">最近の請求</CardTitle>
              <Link
                href="/invoices"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                一覧を見る
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="font-semibold">請求番号</TableHead>
                  <TableHead className="font-semibold">顧客</TableHead>
                  <TableHead className="font-semibold text-right">金額</TableHead>
                  <TableHead className="font-semibold">支払期限</TableHead>
                  <TableHead className="font-semibold">ステータス</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentInvoices.map((inv) => {
                  const project = getProjectById((inv as any).project_id);
                  const customer = project
                    ? getCustomerById(project.customer_id)
                    : undefined;
                  return (
                    <TableRow
                      key={inv.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        <Link
                          href={`/invoices/${inv.id}`}
                          className="text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          {inv.invoice_number}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {customer ? (
                          <Link
                            href={`/customers/${customer.id}`}
                            className="text-gray-700 hover:text-blue-600 hover:underline"
                          >
                            {customer.name}
                          </Link>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(inv.amount)}
                      </TableCell>
                      <TableCell>{formatDate(inv.due_date)}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800">
                          {calculateInvoiceStatus(inv)}
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

