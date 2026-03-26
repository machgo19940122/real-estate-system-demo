"use client";

import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  invoices,
  getInvoiceRevenueCategory,
  getPaymentsByInvoiceId,
  getTotalPaidAmount,
  type RevenueCategory,
} from "@/src/data/mock";
import { formatCurrency } from "@/lib/utils";
import { Calendar, TrendingUp, FileText, Calculator } from "lucide-react";
import Link from "next/link";

const ALL_CATEGORIES: RevenueCategory[] = ["新築", "リフォーム", "土地", "仲介料"];

function defaultSectionIncluded(): Record<RevenueCategory, boolean> {
  return { 新築: true, リフォーム: true, 土地: true, 仲介料: true };
}

export default function ReportsPage() {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [periodMode, setPeriodMode] = useState<"monthly" | "half" | "year">("monthly");
  const [selectedHalf, setSelectedHalf] = useState<"H1" | "H2">("H1");
  const [sectionIncluded, setSectionIncluded] =
    useState<Record<RevenueCategory, boolean>>(defaultSectionIncluded);

  const [isAggregating, setIsAggregating] = useState(false);
  const [applied, setApplied] = useState<{
    periodMode: "monthly" | "half" | "year";
    year: number;
    month: number;
    half: "H1" | "H2";
  } | null>(null);

  // 期の開始月（6月開始: 6〜翌5月が1期）
  const fiscalStartMonth = 6;

  const periodLabel = useMemo(() => {
    const y = applied?.year ?? selectedYear;
    const m = applied?.month ?? selectedMonth;
    const mode = applied?.periodMode ?? periodMode;
    const half = applied?.half ?? selectedHalf;

    if (mode === "monthly") return `${y}年${m}月`;
    if (mode === "half") {
      // 上期: 6〜11月, 下期: 12〜翌5月
      return half === "H1"
        ? `${y}年度 上期（6〜11月）`
        : `${y}年度 下期（12〜5月）`;
    }
    return `${y}年度（通期）`;
  }, [applied, periodMode, selectedYear, selectedMonth, selectedHalf]);

  const range = useMemo(() => {
    if (!applied) return null;

    if (applied.periodMode === "monthly") {
      return {
        start: new Date(applied.year, applied.month - 1, 1),
        endExclusive: new Date(applied.year, applied.month, 1),
      };
    }

    // 会計年度: [selectedYear-06-01, selectedYear+1-06-01)
    const fiscalStart = new Date(applied.year, fiscalStartMonth - 1, 1); // 6月1日
    const fiscalEndExclusive = new Date(applied.year + 1, fiscalStartMonth - 1, 1); // 翌年6月1日

    if (applied.periodMode === "year") {
      return { start: fiscalStart, endExclusive: fiscalEndExclusive };
    }

    // half year
    if (applied.half === "H1") {
      // 上期: 6〜11月 → [6/1, 翌年12/1)
      return { start: fiscalStart, endExclusive: new Date(applied.year, 11 + 1, 1) };
    }
    // 下期: 12〜翌5月 → [12/1, 翌年6/1)
    return { start: new Date(applied.year, 11, 1), endExclusive: fiscalEndExclusive };
  }, [applied, fiscalStartMonth]);

  // 選択された期間の入金がある請求を取得
  const periodInvoices = useMemo(() => {
    if (!range) return [];
    const isInRange = (dateStr: string) => {
      const d = new Date(dateStr);
      return d >= range.start && d < range.endExclusive;
    };
    return invoices.filter((invoice) => {
      const invoicePayments = getPaymentsByInvoiceId(invoice.id);
      const totalPaid = getTotalPaidAmount(invoice.id);
      if (totalPaid === 0) return false;
      return invoicePayments.some((payment) => isInRange(payment.payment_date));
    });
  }, [range, range?.start, range?.endExclusive]);

  // 売上区分別に集計
  const categoryTotals = useMemo(() => {
    if (!range) {
      return {
        totals: { 新築: 0, リフォーム: 0, 土地: 0, 仲介料: 0 } as Record<RevenueCategory, number>,
        counts: { 新築: 0, リフォーム: 0, 土地: 0, 仲介料: 0 } as Record<RevenueCategory, number>,
      };
    }
    const isInRange = (dateStr: string) => {
      const d = new Date(dateStr);
      return d >= range.start && d < range.endExclusive;
    };
    const totals: Record<RevenueCategory, number> = {
      新築: 0,
      リフォーム: 0,
      土地: 0,
      仲介料: 0,
    };
    const counts: Record<RevenueCategory, number> = {
      新築: 0,
      リフォーム: 0,
      土地: 0,
      仲介料: 0,
    };

    periodInvoices.forEach((invoice) => {
      const category = getInvoiceRevenueCategory(invoice);
      const invoicePayments = getPaymentsByInvoiceId(invoice.id);

      const periodPaidAmount = invoicePayments
        .filter((payment) => isInRange(payment.payment_date))
        .reduce((sum, p) => sum + p.amount, 0);

      totals[category] += periodPaidAmount;
      if (periodPaidAmount > 0) counts[category]++;
    });

    return { totals, counts };
  }, [periodInvoices, range]);

  const categoryLabels: Record<RevenueCategory, string> = {
    新築: "新築",
    リフォーム: "リフォーム",
    土地: "土地",
    仲介料: "仲介料",
  };

  const categoryAccent: Record<RevenueCategory, string> = {
    新築: "bg-blue-500",
    リフォーム: "bg-orange-500",
    土地: "bg-emerald-500",
    仲介料: "bg-purple-500",
  };

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
    const title = allOn
      ? `${periodLabel} 総合計`
      : selectedCategories.length === 0
        ? `${periodLabel} 合計`
        : `${periodLabel} 選択中の合計`;
    const hint =
      !applied
        ? "条件を選択して「集計」を押してください"
        : 
      selectedCategories.length === 0
        ? "区分を1つ以上選択してください"
        : allOn
          ? `${periodInvoices.length}件の請求から集計（全区分）`
          : `選択した区分の入金合計（該当請求 ${invoiceCount} 件）`;
    return { amount, title, hint, allOn, selectedCategories };
  }, [applied, sectionIncluded, categoryTotals, periodLabel, periodInvoices.length]);

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const isDirty =
    applied == null ||
    applied.periodMode !== periodMode ||
    applied.year !== selectedYear ||
    applied.month !== selectedMonth ||
    applied.half !== selectedHalf;

  const canShowDetail = applied != null && !isDirty;
  const aggregatePrimary = applied == null || isDirty;

  return (
    <AppLayout>
      <div className="space-y-6">
        {isAggregating && (
          <div className="fixed inset-0 z-50 bg-white/60 backdrop-blur-sm flex items-center justify-center">
            <div className="rounded-2xl bg-white shadow-xl border border-gray-100 px-6 py-5 flex items-center gap-4">
              <div
                className="h-8 w-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"
                aria-hidden
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">集計中…</p>
                <p className="text-xs text-gray-500 mt-1">しばらくお待ちください</p>
              </div>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              集計
            </h1>
            <p className="text-gray-600 mt-2 text-sm md:text-base">
              月次・半期・通期の売上を区分別に集計します
            </p>
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
              disabled={isAggregating}
              className="px-2 md:px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
            >
              <option value="monthly">月次</option>
              <option value="half">半期</option>
              <option value="year">通期</option>
            </select>
          </div>
          <div className="flex items-center gap-2 flex-1">
            <Calendar className="h-4 w-4 md:h-5 md:w-5 text-gray-500 flex-shrink-0" />
            <label className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">
              年:
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              disabled={isAggregating}
              className="flex-1 px-2 md:px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
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
              <label className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">
                月:
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                disabled={isAggregating}
                className="flex-1 px-2 md:px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
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
                disabled={isAggregating}
                className="flex-1 px-2 md:px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
              >
                <option value="H1">上期</option>
                <option value="H2">下期</option>
              </select>
            </div>
          )}

              <div className="w-full md:w-auto md:ml-auto flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  size="lg"
                  variant={aggregatePrimary ? "default" : "outline"}
                  className={
                    aggregatePrimary
                      ? "w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold px-4 md:px-6 py-2 md:py-3 text-sm md:text-base"
                      : "w-full md:w-auto font-semibold px-4 md:px-6 py-2 md:py-3 text-sm md:text-base"
                  }
                  disabled={isAggregating}
                  onClick={() => {
                    if (isAggregating) return;
                    setIsAggregating(true);
                    window.setTimeout(() => {
                      setSectionIncluded(defaultSectionIncluded());
                      setApplied({
                        periodMode,
                        year: selectedYear,
                        month: selectedMonth,
                        half: selectedHalf,
                      });
                      setIsAggregating(false);
                    }, 1000);
                  }}
                >
                  <Calculator className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                  集計
                </Button>

                {periodMode === "monthly" ? (
                  canShowDetail ? (
                    <Link
                      href={`/reports/monthly/${applied!.year}/${applied!.month}`}
                      className="w-full md:w-auto"
                    >
                      <Button
                        size="lg"
                        className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold px-4 md:px-6 py-2 md:py-3 text-sm md:text-base"
                        disabled={isAggregating}
                      >
                        <FileText className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                        詳細を見る
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      size="lg"
                      disabled
                      className="w-full md:w-auto font-semibold px-4 md:px-6 py-2 md:py-3 text-sm md:text-base"
                    >
                      <FileText className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                      詳細を見る
                    </Button>
                  )
                ) : periodMode === "half" ? (
                  canShowDetail ? (
                    <Link
                      href={`/reports/half/${applied!.year}/${applied!.half}`}
                      className="w-full md:w-auto"
                    >
                      <Button
                        size="lg"
                        className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold px-4 md:px-6 py-2 md:py-3 text-sm md:text-base"
                        disabled={isAggregating}
                      >
                        <FileText className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                        詳細を見る
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      size="lg"
                      disabled
                      className="w-full md:w-auto font-semibold px-4 md:px-6 py-2 md:py-3 text-sm md:text-base"
                    >
                      <FileText className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                      詳細を見る
                    </Button>
                  )
                ) : canShowDetail ? (
                  <Link href={`/reports/year/${applied!.year}`} className="w-full md:w-auto">
                    <Button
                      size="lg"
                      className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold px-4 md:px-6 py-2 md:py-3 text-sm md:text-base"
                      disabled={isAggregating}
                    >
                      <FileText className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                      詳細を見る
                    </Button>
                  </Link>
                ) : (
                  <Button
                    size="lg"
                    disabled
                    className="w-full md:w-auto font-semibold px-4 md:px-6 py-2 md:py-3 text-sm md:text-base"
                  >
                    <FileText className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                    詳細を見る
                  </Button>
                )}
              </div>
            </div>
            {applied && isDirty && (
              <p className="text-xs text-gray-500 mt-3">
                条件が変更されています。「集計」を押すと結果が更新されます。
              </p>
            )}
          </CardContent>
        </Card>

        {/* 売上サマリー＋区分選択（1カードに集約） */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-br from-indigo-50/90 to-white px-5 sm:px-6 pt-5 pb-5 border-b border-gray-100">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                {!applied || isDirty ? (
                  <p className="text-sm font-medium text-gray-700">
                    集計期間を選択し、集計ボタンを押してください。
                  </p>
                ) : (
                  <>
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
                              <span
                                className={`size-1.5 rounded-full ${categoryAccent[cat]}`}
                                aria-hidden
                              />
                              {categoryLabels[cat]}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                    <p className="text-3xl sm:text-4xl font-bold text-gray-900 mt-1 tabular-nums tracking-tight">
                      {formatCurrency(selectionSummary.amount)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">{selectionSummary.hint}</p>
                  </>
                )}
              </div>
              <div className="rounded-xl bg-indigo-600 p-2.5 text-white shadow-sm shrink-0">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-5 sm:px-6 py-3 bg-gray-50/90 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-700">含める区分</span>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                disabled={isAggregating || aggregatePrimary}
                onClick={() => setSectionIncluded(defaultSectionIncluded())}
              >
                すべて選択
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                disabled={isAggregating || aggregatePrimary}
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

          <CardContent className="p-0">
            <ul className="divide-y divide-gray-100">
              {ALL_CATEGORIES.map((category) => (
                <li key={category}>
                  <label className="flex items-center gap-3 px-5 sm:px-6 py-3 cursor-pointer hover:bg-gray-50/80 transition-colors">
                    <input
                      type="checkbox"
                      checked={sectionIncluded[category]}
                      disabled={isAggregating || aggregatePrimary}
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
                    <span className="text-sm font-semibold text-gray-900 tabular-nums shrink-0">
                      {formatCurrency(categoryTotals.totals[category])}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            <p className="px-5 sm:px-6 py-3 text-xs text-gray-500 border-t border-gray-100 bg-white">
              チェックした区分の入金額を合計します。初期は全区分オン（総合計）です。
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

