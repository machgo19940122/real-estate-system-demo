"use client";

import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  invoices,
  getProjectById,
  getRevenueCategory,
  getPaymentsByInvoiceId,
  getTotalPaidAmount,
  type RevenueCategory,
} from "@/src/data/mock";
import { formatCurrency } from "@/lib/utils";
import { Calendar, TrendingUp, FileText } from "lucide-react";
import Link from "next/link";

export default function MonthlyReportsPage() {
  const currentDate = new Date();
  const [periodMode, setPeriodMode] = useState<"monthly" | "half" | "year">("monthly");
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedHalf, setSelectedHalf] = useState<"H1" | "H2">("H1");

  // 期の開始月（一般的な4月開始を想定）
  const fiscalStartMonth = 4;

  const periodLabel = useMemo(() => {
    if (periodMode === "monthly") return `${selectedYear}年${selectedMonth}月`;
    if (periodMode === "half") {
      return selectedHalf === "H1"
        ? `${selectedYear}年度 上期（${fiscalStartMonth}〜9月）`
        : `${selectedYear}年度 下期（10〜3月）`;
    }
    return `${selectedYear}年度（通期）`;
  }, [periodMode, selectedYear, selectedMonth, selectedHalf]);

  const range = useMemo(() => {
    if (periodMode === "monthly") {
      return {
        start: new Date(selectedYear, selectedMonth - 1, 1),
        endExclusive: new Date(selectedYear, selectedMonth, 1),
      };
    }

    // fiscal year: [selectedYear-04-01, selectedYear+1-04-01)
    const fiscalStart = new Date(selectedYear, fiscalStartMonth - 1, 1);
    const fiscalEndExclusive = new Date(selectedYear + 1, fiscalStartMonth - 1, 1);

    if (periodMode === "year") {
      return { start: fiscalStart, endExclusive: fiscalEndExclusive };
    }

    // half year
    if (selectedHalf === "H1") {
      // 4〜9
      return { start: fiscalStart, endExclusive: new Date(selectedYear, 9, 1) };
    }
    // 10〜3（次年度の4月の手前）
    return { start: new Date(selectedYear, 9, 1), endExclusive: fiscalEndExclusive };
  }, [periodMode, selectedYear, selectedMonth, selectedHalf, fiscalStartMonth]);

  const isInRange = (dateStr: string) => {
    const d = new Date(dateStr);
    return d >= range.start && d < range.endExclusive;
  };

  // 選択された期間の入金がある請求を取得
  const periodInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const invoicePayments = getPaymentsByInvoiceId(invoice.id);
      const totalPaid = getTotalPaidAmount(invoice.id);
      if (totalPaid === 0) return false;

      // 入金日が選択された期間に含まれるかチェック
      return invoicePayments.some((payment) => isInRange(payment.payment_date));
    });
  }, [range.start, range.endExclusive]);

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

    periodInvoices.forEach((invoice) => {
      const project = getProjectById((invoice as any).project_id);
      if (!project) return;

      const category = getRevenueCategory(project.type);
      const invoicePayments = getPaymentsByInvoiceId(invoice.id);
      
      // その期間に入金があった分のみを集計
      const monthlyPaidAmount = invoicePayments
        .filter((payment) => {
          return isInRange(payment.payment_date);
        })
        .reduce((sum, p) => sum + p.amount, 0);

      totals[category] += monthlyPaidAmount;
      if (monthlyPaidAmount > 0) {
        categoryCounts[category]++;
      }
    });

    return { totals, counts: categoryCounts };
  }, [periodInvoices, range.start, range.endExclusive]);

  const totalAmount = Object.values(categoryTotals.totals).reduce(
    (sum, amount) => sum + amount,
    0
  );

  // 複合合計
  const combinedNewAndReform =
    categoryTotals.totals["新築"] + categoryTotals.totals["リフォーム"];
  const combinedNewReformLand =
    categoryTotals.totals["新築"] +
    categoryTotals.totals["リフォーム"] +
    categoryTotals.totals["土地"];

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

  // 詳細（半期・通期向け）：顧客別の入金集計
  const invoicesByCustomer = useMemo(() => {
    const grouped = new Map<number, typeof periodInvoices>();
    periodInvoices.forEach((inv) => {
      const project = getProjectById((inv as any).project_id);
      if (!project) return;
      const customerId = project.customer_id;
      if (!grouped.has(customerId)) grouped.set(customerId, []);
      grouped.get(customerId)!.push(inv);
    });
    return grouped;
  }, [periodInvoices]);

  // 年月選択のオプション
  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              月次集計
            </h1>
            <p className="text-gray-600 mt-2 text-sm md:text-base">月ごとの売上を区分別に集計します</p>
          </div>
        </div>

        {/* 期間選択 */}
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">
                  集計:
                </label>
                <select
                  value={periodMode}
                  onChange={(e) => setPeriodMode(e.target.value as "monthly" | "half" | "year")}
                  className="px-2 md:px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="monthly">月次</option>
                  <option value="half">半期</option>
                  <option value="year">通期</option>
                </select>
              </div>
              <div className="flex items-center gap-2 flex-1">
                <Calendar className="h-4 w-4 md:h-5 md:w-5 text-gray-500 flex-shrink-0" />
                <label className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">年:</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="flex-1 px-2 md:px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}年
                    </option>
                  ))}
                </select>
              </div>
              {periodMode === "monthly" && (
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">月:</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="flex-1 px-2 md:px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    {months.map((month) => (
                      <option key={month} value={month}>
                        {month}月
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {periodMode === "half" && (
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">
                    半期:
                  </label>
                  <select
                    value={selectedHalf}
                    onChange={(e) => setSelectedHalf(e.target.value as "H1" | "H2")}
                    className="flex-1 px-2 md:px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                  >
                    <option value="H1">上期</option>
                    <option value="H2">下期</option>
                  </select>
                </div>
              )}
              {periodMode === "monthly" && (
                <Link
                  href={`/reports/monthly/${selectedYear}/${selectedMonth}`}
                  className="w-full md:w-auto md:ml-auto"
                >
                  <Button
                    size="lg"
                    className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold px-4 md:px-6 py-2 md:py-3 text-sm md:text-base"
                  >
                    <FileText className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                    詳細を見る
                  </Button>
                </Link>
              )}
              {periodMode === "half" && (
                <Link
                  href={`/reports/half/${selectedYear}/${selectedHalf}`}
                  className="w-full md:w-auto md:ml-auto"
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full md:w-auto"
                  >
                    <FileText className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                    詳細を見る
                  </Button>
                </Link>
              )}
              {periodMode === "year" && (
                <Link
                  href={`/reports/year/${selectedYear}`}
                  className="w-full md:w-auto md:ml-auto"
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full md:w-auto"
                  >
                    <FileText className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                    詳細を見る
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 合計金額 */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-700">
              {periodLabel} 合計売上
            </CardTitle>
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-md">
              <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-4xl font-bold text-gray-900">
              {formatCurrency(totalAmount)}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {periodInvoices.length}件の請求から集計
            </p>
          </CardContent>
        </Card>

        {/* 複合合計カード */}
        <div className="grid gap-4 md:gap-6 md:grid-cols-2">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="flex items-center gap-2 text-xs md:text-sm font-medium text-gray-700">
                新築＋リフォーム 合計
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                  <TrendingUp className="h-3 w-3 text-white" />
                </div>
                <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md">
                  <TrendingUp className="h-3 w-3 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-gray-900">
                {formatCurrency(combinedNewAndReform)}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                新築 と リフォーム の合計
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="flex items-center gap-2 text-xs md:text-sm font-medium text-gray-700">
                新築＋リフォーム＋土地 合計
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                  <TrendingUp className="h-3 w-3 text-white" />
                </div>
                <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md">
                  <TrendingUp className="h-3 w-3 text-white" />
                </div>
                <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md">
                  <TrendingUp className="h-3 w-3 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-gray-900">
                {formatCurrency(combinedNewReformLand)}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                新築・リフォーム・土地 の合計
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 区分別集計カード */}
        <div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
          {(["新築", "リフォーム", "土地", "仲介料"] as RevenueCategory[]).map(
            (category) => (
              <Card
                key={category}
                className={`border-0 shadow-lg bg-gradient-to-br ${categoryBgColors[category]}`}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium text-gray-700">
                    {categoryLabels[category]}
                  </CardTitle>
                  <div
                    className={`h-8 w-8 md:h-10 md:w-10 rounded-lg bg-gradient-to-br ${categoryColors[category]} flex items-center justify-center shadow-md`}
                  >
                    <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold text-gray-900">
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

