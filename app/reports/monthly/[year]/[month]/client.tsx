"use client";

import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  getRevenueCategory,
  getProjectById,
  getCustomerById,
  getPaymentsByInvoiceId,
  getTotalPaidAmount,
  type Invoice,
  type RevenueCategory,
} from "@/src/data/mock";
import { formatCurrency, formatDate } from "@/lib/utils";
import { summarizeReportSalesCostMargin, getInvoicePaidInMonth } from "@/lib/report-sales-cost-summary";
import { ReportSalesSummaryStats } from "@/components/report-sales-summary-stats";
import { formatProfitMarginRate } from "@/lib/invoice-cost-metrics";
import { ArrowLeft, Download, Lock, CheckCircle, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

const ALL_CATEGORIES: RevenueCategory[] = ["新築", "リフォーム", "土地", "仲介料"];

function defaultSectionIncluded(): Record<RevenueCategory, boolean> {
  return { 新築: true, リフォーム: true, 土地: true, 仲介料: true };
}

const categoryAccent: Record<RevenueCategory, string> = {
  新築: "bg-blue-500",
  リフォーム: "bg-orange-500",
  土地: "bg-emerald-500",
  仲介料: "bg-purple-500",
};

const categoryChipClass: Record<RevenueCategory, string> = {
  新築: "bg-blue-50 text-blue-700 border-blue-200",
  リフォーム: "bg-orange-50 text-orange-700 border-orange-200",
  土地: "bg-emerald-50 text-emerald-700 border-emerald-200",
  仲介料: "bg-purple-50 text-purple-700 border-purple-200",
};

interface MonthlyReportDetailClientProps {
  year: number;
  month: number;
  title?: string;
  /** 月次集計のみ締め処理・CSVを表示。年次・半期では false を渡す */
  showClosingAndCsv?: boolean;
}

export function MonthlyReportDetailClient({
  year,
  month,
  title,
  showClosingAndCsv = true,
}: MonthlyReportDetailClientProps) {
  const [isClosed, setIsClosed] = useState(false);
  const [sectionIncluded, setSectionIncluded] =
    useState<Record<RevenueCategory, boolean>>(defaultSectionIncluded);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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
          paymentDate.getFullYear() === year &&
          paymentDate.getMonth() + 1 === month
        );
      });
      return hasPaymentInMonth;
    });
  }, [year, month]);

  // チェックされた区分の請求だけに絞り込み（顧客別集計・CSVに反映）
  const filteredMonthlyInvoices = useMemo(() => {
    return monthlyInvoices.filter((invoice) => {
      const project = getProjectById((invoice as any).project_id);
      if (!project) return false;
      const category = getRevenueCategory(project.type);
      return Boolean(sectionIncluded[category]);
    });
  }, [monthlyInvoices, sectionIncluded]);

  // 顧客別にグループ化
  const invoicesByCustomer = useMemo(() => {
    const grouped = new Map<number, typeof monthlyInvoices>();

    filteredMonthlyInvoices.forEach((invoice) => {
      const project = getProjectById((invoice as any).project_id);
      if (!project) return;

      const customerId = project.customer_id;
      if (!grouped.has(customerId)) {
        grouped.set(customerId, []);
      }
      grouped.get(customerId)!.push(invoice);
    });

    return grouped;
  }, [filteredMonthlyInvoices]);

  // 売上区分別集計（サマリー用）
  const invoicesByCategory = useMemo(() => {
    const grouped: Record<RevenueCategory, typeof monthlyInvoices> = {
      新築: [],
      リフォーム: [],
      土地: [],
      仲介料: [],
    };

    monthlyInvoices.forEach((invoice) => {
      const project = getProjectById((invoice as any).project_id);
      if (!project) return;

      const category = getRevenueCategory(project.type);
      grouped[category].push(invoice);
    });

    return grouped;
  }, [monthlyInvoices]);

  // 区分別集計（金額・件数）
  const categoryTotals = useMemo(() => {
    const totals: Record<RevenueCategory, number> = { 新築: 0, リフォーム: 0, 土地: 0, 仲介料: 0 };
    const counts: Record<RevenueCategory, number> = { 新築: 0, リフォーム: 0, 土地: 0, 仲介料: 0 };
    const costTotals: Record<RevenueCategory, number> = { 新築: 0, リフォーム: 0, 土地: 0, 仲介料: 0 };

    Object.entries(invoicesByCategory).forEach(([category, categoryInvoices]) => {
      const cat = category as RevenueCategory;
      categoryInvoices.forEach((invoice) => {
        const invoicePayments = getPaymentsByInvoiceId(invoice.id);
        const monthlyPaidAmount = invoicePayments
          .filter((payment) => {
            const paymentDate = new Date(payment.payment_date);
            return (
              paymentDate.getFullYear() === year &&
              paymentDate.getMonth() + 1 === month
            );
          })
          .reduce((sum, p) => sum + p.amount, 0);
        totals[cat] += monthlyPaidAmount;
        if (monthlyPaidAmount > 0) {
          counts[cat]++;
          costTotals[cat] += invoice.cost_amount_excluding_tax ?? 0;
        }
      });
    });

    const profitMarginRates = {} as Record<RevenueCategory, number | undefined>;
    for (const cat of ALL_CATEGORIES) {
      const sales = totals[cat];
      profitMarginRates[cat] = sales > 0 ? (sales - costTotals[cat]) / sales : undefined;
    }

    return { totals, counts, costTotals, profitMarginRates };
  }, [invoicesByCategory, year, month]);

  const periodLabel = title ?? `${year}年${month}月`;

  const selectionSummary = useMemo(() => {
    let amount = 0;
    let invoiceCount = 0;
    const selectedCategories: RevenueCategory[] = [];
    for (const cat of ALL_CATEGORIES) {
      if (!sectionIncluded[cat]) continue;
      amount += categoryTotals.totals[cat];
      invoiceCount += categoryTotals.counts[cat];
      selectedCategories.push(cat);
    }
    const allOn = ALL_CATEGORIES.every((c) => sectionIncluded[c]);
    const summaryTitle = allOn
      ? `${periodLabel} 総合計`
      : selectedCategories.length === 0
        ? `${periodLabel} 合計`
        : `${periodLabel} 選択中の合計`;
    const hint =
      selectedCategories.length === 0
        ? "区分を1つ以上選択してください"
        : allOn
          ? `${monthlyInvoices.length}件の請求から集計（全区分）`
          : `選択した区分の入金合計（該当請求 ${invoiceCount} 件）`;
    return { amount, title: summaryTitle, hint, allOn, selectedCategories };
  }, [sectionIncluded, categoryTotals, periodLabel, monthlyInvoices.length]);

  const salesCostSummary = useMemo(() => {
    return summarizeReportSalesCostMargin({
      periodInvoices: monthlyInvoices,
      sectionIncluded,
      resolveCategory: (inv) => {
        const pid = (inv as Invoice).project_id;
        if (pid == null) return null;
        const project = getProjectById(pid);
        return project ? getRevenueCategory(project.type) : null;
      },
      getPeriodPaidAmount: (inv) => getInvoicePaidInMonth(inv, year, month),
    });
  }, [monthlyInvoices, sectionIncluded, year, month]);

  const selectedCategories = useMemo(() => {
    return ALL_CATEGORIES.filter((c) => sectionIncluded[c]);
  }, [sectionIncluded]);

  const isAllSelected = selectedCategories.length === ALL_CATEGORIES.length;
  const isNoneSelected = selectedCategories.length === 0;

  const handleClose = () => {
    if (confirm(`${year}年${month}月の集計を締めますか？締め後は編集できません。`)) {
      setIsClosed(true);
      // 実際の実装ではAPI呼び出し
    }
  };

  const handleExportCSV = () => {
    // CSV生成（基本実装）
    const csvRows: string[] = [];
    csvRows.push("日付,取引先,摘要,金額,売上区分");

    filteredMonthlyInvoices.forEach((invoice) => {
      const project = getProjectById((invoice as any).project_id);
      const customer = project ? getCustomerById(project.customer_id) : undefined;
      const category = project ? getRevenueCategory(project.type) : "リフォーム";
      const invoicePayments = getPaymentsByInvoiceId(invoice.id);
      
      invoicePayments
        .filter((payment) => {
          const paymentDate = new Date(payment.payment_date);
          return (
            paymentDate.getFullYear() === year &&
            paymentDate.getMonth() + 1 === month
          );
        })
        .forEach((payment) => {
          csvRows.push(
            `${payment.payment_date},${customer?.name || ""},${project?.name || ""},${payment.amount},${category}`
          );
        });
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${year}年${month}月_売上集計.csv`;
    link.click();
  };

  const categoryLabels: Record<RevenueCategory, string> = {
    新築: "新築",
    リフォーム: "リフォーム",
    土地: "土地",
    仲介料: "仲介料",
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/reports">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                戻る
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {title ?? `${year}年${month}月 月次集計`}
              </h1>
              <p className="text-gray-600 mt-1 text-sm md:text-base">請求先別の詳細集計</p>
            </div>
          </div>
          {showClosingAndCsv && (
            <div className="flex gap-2 flex-wrap">
              {!isClosed && (
                <Button onClick={handleClose} variant="outline" size="sm" className="flex-1 md:flex-none">
                  <Lock className="h-4 w-4 mr-2" />
                  締め処理
                </Button>
              )}
              <Button onClick={handleExportCSV} size="sm" className="flex-1 md:flex-none">
                <Download className="h-4 w-4 mr-2" />
                CSV出力
              </Button>
            </div>
          )}
        </div>

        {showClosingAndCsv && isClosed && (
          <Card className="border-0 shadow-lg bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">締め処理済み</p>
                  <p className="text-sm text-green-700">
                    この月の集計は締められています。編集はできません。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 売上サマリー＋区分選択（集計一覧と同じUI） */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-br from-indigo-50/90 to-white px-5 sm:px-6 pt-5 pb-5 border-b border-gray-100">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-medium text-gray-500 leading-snug">
                    {selectionSummary.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {selectionSummary.allOn ? (
                      <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[11px] font-medium text-gray-700">
                        全区分
                      </span>
                    ) : selectionSummary.selectedCategories.length === 0 ? (
                      <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[11px] font-medium text-gray-700">
                        未選択
                      </span>
                    ) : (
                      selectionSummary.selectedCategories.map((cat) => (
                        <span
                          key={cat}
                          className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[11px] font-medium text-gray-700"
                        >
                          <span className={`size-1.5 rounded-full ${categoryAccent[cat]}`} aria-hidden />
                          {categoryLabels[cat]}
                        </span>
                      ))
                    )}
                  </div>
                </div>
                <ReportSalesSummaryStats
                  totalSales={salesCostSummary.totalSales}
                  totalCost={salesCostSummary.totalCost}
                  profitMarginRate={salesCostSummary.profitMarginRate}
                />
                <p className="text-xs text-gray-500 mt-3">{selectionSummary.hint}</p>
              </div>
              <div className="rounded-xl bg-indigo-600 p-2.5 text-white shadow-sm shrink-0">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="px-5 sm:px-6 py-3 bg-gray-50/90 border-b border-gray-100">
            <button
              type="button"
              onClick={() => setIsFilterOpen((v) => !v)}
              aria-expanded={isFilterOpen}
              className="w-full flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  含める区分
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                {isFilterOpen ? "閉じる" : "開く"}
                {isFilterOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </span>
            </button>
          </div>

          {isFilterOpen && (
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-5 sm:px-6 py-3 border-b border-gray-100 bg-white">
                <div className="text-xs text-gray-500">
                  チェックした区分の入金額を合計します。
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => setSectionIncluded(defaultSectionIncluded())}
                  >
                    すべて選択
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() =>
                      setSectionIncluded({
                        新築: false,
                        リフォーム: false,
                        土地: false,
                        仲介料: false,
                      })
                    }
                  >
                    すべて解除
                  </Button>
                </div>
              </div>

              <ul className="divide-y divide-gray-100">
                {ALL_CATEGORIES.map((category) => (
                  <li key={category}>
                    <label className="flex items-center gap-3 px-5 sm:px-6 py-3 cursor-pointer hover:bg-gray-50/80 transition-colors">
                      <input
                        type="checkbox"
                        checked={sectionIncluded[category]}
                        onChange={() =>
                          setSectionIncluded((prev) => ({
                            ...prev,
                            [category]: !prev[category],
                          }))
                        }
                        className="size-4 rounded border-gray-300 text-indigo-600 focus:ring-blue-500 shrink-0"
                      />
                      <span
                        className={`size-2 rounded-full shrink-0 ${categoryAccent[category]}`}
                        aria-hidden
                      />
                      <span className="text-sm font-medium text-gray-900 w-16 sm:w-20 shrink-0">
                        {categoryLabels[category]}
                      </span>
                      <span className="text-xs text-gray-500 flex-1 min-w-0">
                        {categoryTotals.counts[category]}件
                      </span>
                      <div className="grid grid-cols-3 gap-3 items-end shrink-0">
                        <div className="text-right">
                          <p className="text-[10px] text-gray-500 leading-none">売上</p>
                          <p className="text-sm font-semibold text-gray-900 tabular-nums">
                            {formatCurrency(categoryTotals.totals[category])}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-gray-500 leading-none">原価</p>
                          <p className="text-sm font-semibold text-gray-900 tabular-nums">
                            {formatCurrency(categoryTotals.costTotals[category])}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-gray-500 leading-none">利益率</p>
                          <p className="text-sm font-semibold text-gray-900 tabular-nums">
                            {formatProfitMarginRate(categoryTotals.profitMarginRates[category])}
                          </p>
                        </div>
                      </div>
                    </label>
                  </li>
                ))}
              </ul>

              <p className="px-5 sm:px-6 py-3 text-xs text-gray-500 border-t border-gray-100 bg-white">
                初期は全区分オン（総合計）です。売上は対象月に計上された入金のみ、原価は入金があった請求の原価合計、利益率は（売上−原価）÷売上です。
              </p>
            </CardContent>
          )}
        </Card>

        {/* 顧客別集計サマリー */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="text-lg md:text-xl">顧客別集計</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="font-semibold text-xs md:text-sm whitespace-nowrap">顧客名</TableHead>
                  <TableHead className="font-semibold text-xs md:text-sm whitespace-nowrap">請求件数</TableHead>
                  <TableHead className="font-semibold text-xs md:text-sm whitespace-nowrap">請求金額</TableHead>
                  <TableHead className="font-semibold text-xs md:text-sm whitespace-nowrap">入金額（{year}年{month}月）</TableHead>
                  <TableHead className="font-semibold text-xs md:text-sm whitespace-nowrap">原価</TableHead>
                  <TableHead className="font-semibold text-xs md:text-sm whitespace-nowrap">利益率</TableHead>
                  <TableHead className="font-semibold text-xs md:text-sm whitespace-nowrap">残額</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoicesByCustomer.size === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-gray-500 py-8">
                      表示するデータがありません
                    </TableCell>
                  </TableRow>
                ) : (
                  Array.from(invoicesByCustomer.entries())
                    .sort(([customerIdA], [customerIdB]) => {
                      const customerA = getCustomerById(customerIdA);
                      const customerB = getCustomerById(customerIdB);
                      return (customerA?.name || "").localeCompare(customerB?.name || "");
                    })
                    .map(([customerId, customerInvoices]) => {
                      const customer = getCustomerById(customerId);
                      if (!customer) return null;

                      // 顧客ごとの集計
                      const customerInvoiceTotal = customerInvoices.reduce(
                        (sum, inv) => sum + inv.amount,
                        0
                      );
                      const customerPaidTotal = customerInvoices.reduce((sum, invoice) => {
                        const invoicePayments = getPaymentsByInvoiceId(invoice.id);
                        const monthlyPaidAmount = invoicePayments
                          .filter((payment) => {
                            const paymentDate = new Date(payment.payment_date);
                            return (
                              paymentDate.getFullYear() === year &&
                              paymentDate.getMonth() + 1 === month
                            );
                          })
                          .reduce((sum, p) => sum + p.amount, 0);
                        return sum + monthlyPaidAmount;
                      }, 0);
                      const customerCostTotal = customerInvoices.reduce((sum, invoice) => {
                        const monthlyPaidAmount = getPaymentsByInvoiceId(invoice.id)
                          .filter((payment) => {
                            const paymentDate = new Date(payment.payment_date);
                            return (
                              paymentDate.getFullYear() === year &&
                              paymentDate.getMonth() + 1 === month
                            );
                          })
                          .reduce((s, p) => s + p.amount, 0);
                        if (monthlyPaidAmount <= 0) return sum;
                        return sum + (invoice.cost_amount_excluding_tax ?? 0);
                      }, 0);
                      const customerProfitMarginRate =
                        customerPaidTotal > 0
                          ? (customerPaidTotal - customerCostTotal) / customerPaidTotal
                          : undefined;
                      const customerRemaining = customerInvoiceTotal - customerPaidTotal;

                      return (
                        <TableRow
                          key={customerId}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <TableCell className="font-medium text-xs md:text-sm whitespace-nowrap">
                            <Link
                              href={`/customers/${customerId}`}
                              className="text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              {customer.name}
                            </Link>
                          </TableCell>
                          <TableCell className="text-xs md:text-sm whitespace-nowrap">{customerInvoices.length}件</TableCell>
                          <TableCell className="text-xs md:text-sm whitespace-nowrap">{formatCurrency(customerInvoiceTotal)}</TableCell>
                          <TableCell className="font-semibold text-green-600 text-xs md:text-sm whitespace-nowrap">
                            {formatCurrency(customerPaidTotal)}
                          </TableCell>
                          <TableCell className="text-xs md:text-sm whitespace-nowrap tabular-nums">
                            {formatCurrency(customerCostTotal)}
                          </TableCell>
                          <TableCell className="text-xs md:text-sm whitespace-nowrap tabular-nums">
                            {formatProfitMarginRate(customerProfitMarginRate)}
                          </TableCell>
                          <TableCell className="text-xs md:text-sm whitespace-nowrap">
                            {customerRemaining > 0 ? (
                              <span className="font-semibold text-orange-600">
                                {formatCurrency(customerRemaining)}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 請求明細一覧 */}
        {/* 
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b">
            <CardTitle>請求明細一覧</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="font-semibold text-xs">請求番号</TableHead>
                  <TableHead className="font-semibold text-xs">顧客名</TableHead>
                  <TableHead className="font-semibold text-xs">案件名</TableHead>
                  <TableHead className="font-semibold text-xs">売上区分</TableHead>
                  <TableHead className="font-semibold text-xs">請求金額</TableHead>
                  <TableHead className="font-semibold text-xs">入金額</TableHead>
                  <TableHead className="font-semibold text-xs">入金日</TableHead>
                  <TableHead className="font-semibold text-xs">残額</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyInvoices
                  .sort((a, b) => {
                    const projectA = getProjectById((a as any).project_id);
                    const projectB = getProjectById((b as any).project_id);
                    const customerA = projectA ? getCustomerById(projectA.customer_id) : undefined;
                    const customerB = projectB ? getCustomerById(projectB.customer_id) : undefined;
                    return (customerA?.name || "").localeCompare(customerB?.name || "");
                  })
                  .map((invoice) => {
                    const project = getProjectById((invoice as any).project_id);
                    const customer = project ? getCustomerById(project.customer_id) : undefined;
                    const category = project ? getRevenueCategory(project.type) : "リフォーム";
                    const invoicePayments = getPaymentsByInvoiceId(invoice.id);
                    const monthlyPayments = invoicePayments.filter((payment) => {
                      const paymentDate = new Date(payment.payment_date);
                      return (
                        paymentDate.getFullYear() === year &&
                        paymentDate.getMonth() + 1 === month
                      );
                    });
                    const monthlyPaidAmount = monthlyPayments.reduce(
                      (sum, p) => sum + p.amount,
                      0
                    );
                    const totalPaid = getTotalPaidAmount(invoice.id);
                    const remaining = invoice.amount - totalPaid;

                    return (
                      <TableRow
                        key={invoice.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <TableCell className="text-xs">
                          <Link
                            href={`/invoices/${invoice.id}`}
                            className="text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            {invoice.invoice_number}
                          </Link>
                        </TableCell>
                        <TableCell className="text-xs">
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
                        <TableCell className="text-xs">
                          {project ? (
                            <Link
                              href={`/projects/${project.id}`}
                              className="text-gray-700 hover:text-blue-600 hover:underline"
                            >
                              {project.name}
                            </Link>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-xs">
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                            {categoryLabels[category]}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs">{formatCurrency(invoice.amount)}</TableCell>
                        <TableCell className="text-xs font-semibold text-green-600">
                          {formatCurrency(monthlyPaidAmount)}
                        </TableCell>
                        <TableCell className="text-xs">
                          {monthlyPayments.length > 0
                            ? monthlyPayments
                                .map((p) => formatDate(p.payment_date))
                                .join(", ")
                            : "-"}
                        </TableCell>
                        <TableCell className="text-xs">
                          {remaining > 0 ? (
                            <span className="font-semibold text-orange-600">
                              {formatCurrency(remaining)}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        */}
      </div>
    </AppLayout>
  );
}

