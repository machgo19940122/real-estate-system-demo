"use client";

import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  invoices,
  payments,
  projects,
  getRevenueCategory,
  getProjectById,
  getPaymentsByInvoiceId,
  getTotalPaidAmount,
  type RevenueCategory,
} from "@/src/data/mock";
import { formatCurrency } from "@/lib/utils";
import { Calendar, TrendingUp, FileText, Download } from "lucide-react";
import Link from "next/link";

export default function MonthlyReportsPage() {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);

  // 選択された年月の入金済み請求を取得
  const monthlyInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const invoicePayments = getPaymentsByInvoiceId(invoice.id);
      const totalPaid = getTotalPaidAmount(invoice.id);
      if (totalPaid === 0) return false;

      // 入金日が選択された年月に含まれるかチェック
      const hasPaymentInMonth = invoicePayments.some((payment) => {
        const paymentDate = new Date(payment.payment_date);
        return (
          paymentDate.getFullYear() === selectedYear &&
          paymentDate.getMonth() + 1 === selectedMonth
        );
      });
      return hasPaymentInMonth;
    });
  }, [selectedYear, selectedMonth]);

  // 売上区分別に集計
  const categoryTotals = useMemo(() => {
    const totals: Record<RevenueCategory, number> = {
      新築: 0,
      リフォーム: 0,
      土地: 0,
      仲介料: 0,
    };
    const categoryCounts: Record<RevenueCategory, number> = {
      新築: 0,
      リフォーム: 0,
      土地: 0,
      仲介料: 0,
    };

    monthlyInvoices.forEach((invoice) => {
      const project = getProjectById(invoice.project_id);
      if (!project) return;

      const category = getRevenueCategory(project.type);
      const invoicePayments = getPaymentsByInvoiceId(invoice.id);
      
      // その月に入金があった分のみを集計
      const monthlyPaidAmount = invoicePayments
        .filter((payment) => {
          const paymentDate = new Date(payment.payment_date);
          return (
            paymentDate.getFullYear() === selectedYear &&
            paymentDate.getMonth() + 1 === selectedMonth
          );
        })
        .reduce((sum, p) => sum + p.amount, 0);

      totals[category] += monthlyPaidAmount;
      if (monthlyPaidAmount > 0) {
        categoryCounts[category]++;
      }
    });

    return { totals, counts: categoryCounts };
  }, [monthlyInvoices, selectedYear, selectedMonth]);

  const totalAmount = Object.values(categoryTotals.totals).reduce(
    (sum, amount) => sum + amount,
    0
  );

  const categoryLabels: Record<RevenueCategory, string> = {
    新築: "新築",
    リフォーム: "リフォーム",
    土地: "土地",
    仲介料: "仲介料",
  };

  const categoryColors: Record<RevenueCategory, string> = {
    新築: "from-blue-500 to-blue-600",
    リフォーム: "from-orange-500 to-orange-600",
    土地: "from-green-500 to-green-600",
    仲介料: "from-purple-500 to-purple-600",
  };

  const categoryBgColors: Record<RevenueCategory, string> = {
    新築: "from-blue-50 to-white",
    リフォーム: "from-orange-50 to-white",
    土地: "from-green-50 to-white",
    仲介料: "from-purple-50 to-white",
  };

  // 年月選択のオプション
  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              月次集計
            </h1>
            <p className="text-gray-600 mt-2">月ごとの売上を区分別に集計します</p>
          </div>
        </div>

        {/* 年月選択 */}
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <label className="text-sm font-medium text-gray-700">年:</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}年
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">月:</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  {months.map((month) => (
                    <option key={month} value={month}>
                      {month}月
                    </option>
                  ))}
                </select>
              </div>
              <Link
                href={`/reports/monthly/${selectedYear}/${selectedMonth}`}
                className="ml-auto"
              >
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold px-6 py-3"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  詳細を見る
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* 合計金額 */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              {selectedYear}年{selectedMonth}月 合計売上
            </CardTitle>
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-md">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">
              {formatCurrency(totalAmount)}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {monthlyInvoices.length}件の請求から集計
            </p>
          </CardContent>
        </Card>

        {/* 区分別集計カード */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {(["新築", "リフォーム", "土地", "仲介料"] as RevenueCategory[]).map(
            (category) => (
              <Card
                key={category}
                className={`border-0 shadow-lg bg-gradient-to-br ${categoryBgColors[category]}`}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">
                    {categoryLabels[category]}
                  </CardTitle>
                  <div
                    className={`h-10 w-10 rounded-lg bg-gradient-to-br ${categoryColors[category]} flex items-center justify-center shadow-md`}
                  >
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(categoryTotals.totals[category])}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {categoryTotals.counts[category]}件
                  </p>
                </CardContent>
              </Card>
            )
          )}
        </div>
      </div>
    </AppLayout>
  );
}

