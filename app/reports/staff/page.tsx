"use client";

import { useMemo, useState } from "react";
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
  staff,
  invoices,
  getTotalPaidAmount,
  calculateInvoiceStatus,
  getPaymentsByInvoiceId,
  getInvoiceStaffId,
} from "@/src/data/mock";
import { formatCurrency } from "@/lib/utils";
import { formatProfitMarginRate, invoiceProfitMarginRateForDisplay } from "@/lib/invoice-cost-metrics";
import Link from "next/link";
import { Calculator } from "lucide-react";

type AppliedStaffReport = {
  selectedStaffId: string;
  periodMode: "monthly" | "half" | "year";
  selectedYear: number;
  selectedMonth: number;
  selectedHalf: "H1" | "H2";
};

// 期の開始月（6〜翌5月が1期）
const FISCAL_START_MONTH = 6;

function rangeFromApplied(a: AppliedStaffReport) {
  if (a.periodMode === "monthly") {
    return {
      start: new Date(a.selectedYear, a.selectedMonth - 1, 1),
      endExclusive: new Date(a.selectedYear, a.selectedMonth, 1),
    };
  }
  const fiscalStart = new Date(a.selectedYear, FISCAL_START_MONTH - 1, 1);
  const fiscalEndExclusive = new Date(a.selectedYear + 1, FISCAL_START_MONTH - 1, 1);

  if (a.periodMode === "year") {
    return { start: fiscalStart, endExclusive: fiscalEndExclusive };
  }
  if (a.selectedHalf === "H1") {
    return { start: fiscalStart, endExclusive: new Date(a.selectedYear, 12, 1) };
  }
  return { start: new Date(a.selectedYear, 11, 1), endExclusive: fiscalEndExclusive };
}

function periodLabelFromApplied(a: AppliedStaffReport) {
  if (a.periodMode === "monthly") return `${a.selectedYear}年${a.selectedMonth}月`;
  if (a.periodMode === "half") {
    return a.selectedHalf === "H1"
      ? `${a.selectedYear}年度 上期（6〜11月）`
      : `${a.selectedYear}年度 下期（12〜5月）`;
  }
  return `${a.selectedYear}年度（通期）`;
}

export default function StaffReportsPage() {
  const currentDate = new Date();
  const [selectedStaffId, setSelectedStaffId] = useState<string>("all");
  const [periodMode, setPeriodMode] = useState<"monthly" | "half" | "year">("monthly");
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedHalf, setSelectedHalf] = useState<"H1" | "H2">("H1");

  const [applied, setApplied] = useState<AppliedStaffReport | null>(null);
  const [isAggregating, setIsAggregating] = useState(false);

  const periodLabel = useMemo(() => {
    if (periodMode === "monthly") return `${selectedYear}年${selectedMonth}月`;
    if (periodMode === "half") {
      return selectedHalf === "H1"
        ? `${selectedYear}年度 上期（6〜11月）`
        : `${selectedYear}年度 下期（12〜5月）`;
    }
    return `${selectedYear}年度（通期）`;
  }, [periodMode, selectedYear, selectedMonth, selectedHalf]);

  const isDirty =
    applied === null ||
    applied.selectedStaffId !== selectedStaffId ||
    applied.periodMode !== periodMode ||
    applied.selectedYear !== selectedYear ||
    applied.selectedMonth !== selectedMonth ||
    applied.selectedHalf !== selectedHalf;

  const effectiveApplied = applied && !isDirty ? applied : null;

  const statsByStaff = useMemo(() => {
    if (!effectiveApplied) return [];
    const range = rangeFromApplied(effectiveApplied);
    const isInRange = (dateStr: string) => {
      const d = new Date(dateStr);
      return d >= range.start && d < range.endExclusive;
    };
    const staffFilter = effectiveApplied.selectedStaffId;

    return staff
      .map((s) => {
        if (staffFilter !== "all" && String(s.id) !== staffFilter) {
          return null;
        }

        const staffInvoices = invoices.filter((inv) => {
          const invStaffId = getInvoiceStaffId(inv);
          return invStaffId === s.id;
        });

        let totalBilled = 0;
        let totalPaid = 0;
        let totalUnpaid = 0;
        let unpaidCount = 0;
        let totalCostExTax = 0;
        const invoicesInPeriod: typeof staffInvoices = [];

        staffInvoices.forEach((inv) => {
          const payments = getPaymentsByInvoiceId(inv.id);
          const paidInPeriod = payments
            .filter((p) => isInRange(p.payment_date))
            .reduce((sum, p) => sum + p.amount, 0);

          if (paidInPeriod === 0 && !isInRange(inv.created_at)) {
            return;
          }

          invoicesInPeriod.push(inv);
          totalBilled += inv.amount;
          totalPaid += paidInPeriod;
          totalCostExTax += inv.cost_amount_excluding_tax ?? 0;
          const remaining = inv.amount - getTotalPaidAmount(inv.id);
          totalUnpaid += remaining;
          const status = calculateInvoiceStatus(inv);
          if (status !== "入金済み") {
            unpaidCount += 1;
          }
        });

        const profitMarginOnPaid =
          totalPaid > 0 ? (totalPaid - totalCostExTax) / totalPaid : undefined;

        return {
          staff: s,
          invoices: invoicesInPeriod,
          totalBilled,
          totalPaid,
          totalUnpaid,
          unpaidCount,
          totalCostExTax,
          profitMarginOnPaid,
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null);
  }, [effectiveApplied]);

  const aggregatePrimary = applied === null || isDirty;

  const activeRange = effectiveApplied ? rangeFromApplied(effectiveApplied) : null;
  const isInRange = (dateStr: string) => {
    if (!activeRange) return false;
    const d = new Date(dateStr);
    return d >= activeRange.start && d < activeRange.endExclusive;
  };

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
        <div>
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            担当者別集計
          </h1>
          <p className="text-gray-600 mt-2 text-sm md:text-base">
            担当者と集計期間を指定し、「集計」で結果を表示します。条件を変えた場合はもう一度「集計」を押してください。
          </p>
        </div>

        {/* フィルター */}
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">
                  担当者:
                </span>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="flex-1 px-2 md:px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="all">全担当者</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">
                  集計:
                </span>
                <select
                  value={periodMode}
                  onChange={(e) =>
                    setPeriodMode(e.target.value as "monthly" | "half" | "year")
                  }
                  className="px-2 md:px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="monthly">月次</option>
                  <option value="half">半期</option>
                  <option value="year">通期</option>
                </select>
              </div>
              <div className="flex items-center gap-2 flex-1">
                <span className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">
                  年:
                </span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="flex-1 px-2 md:px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  {Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i).map(
                    (year) => (
                      <option key={year} value={year}>
                        {year}年
                      </option>
                    )
                  )}
                </select>
              </div>
              {periodMode === "monthly" && (
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">
                    月:
                  </span>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="flex-1 px-2 md:px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <option key={month} value={month}>
                        {month}月
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {periodMode === "half" && (
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">
                    半期:
                  </span>
                  <select
                    value={selectedHalf}
                    onChange={(e) =>
                      setSelectedHalf(e.target.value as "H1" | "H2")
                    }
                    className="flex-1 px-2 md:px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                  >
                    <option value="H1">上期（6〜11月）</option>
                    <option value="H2">下期（12〜5月）</option>
                  </select>
                </div>
              )}
              <div className="w-full md:w-auto md:ml-auto">
                <Button
                  type="button"
                  size="lg"
                  variant={aggregatePrimary ? "default" : "outline"}
                  disabled={isAggregating}
                  className={
                    aggregatePrimary
                      ? "w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg font-semibold"
                      : "w-full md:w-auto font-semibold"
                  }
                  onClick={() => {
                    if (isAggregating) return;
                    setIsAggregating(true);
                    window.setTimeout(() => {
                      setApplied({
                        selectedStaffId,
                        periodMode,
                        selectedYear,
                        selectedMonth,
                        selectedHalf,
                      });
                      setIsAggregating(false);
                    }, 600);
                  }}
                >
                  <Calculator className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                  集計
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              選択中の条件: {periodLabel}
              {selectedStaffId === "all" ? " / 全担当者" : ` / 担当者を指定`}
            </p>
            {applied && isDirty && (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                担当者または集計条件が変わりました。「集計」を押すと結果が更新されます。
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="text-base md:text-lg">担当者別サマリー</CardTitle>
            {effectiveApplied && (
              <p className="text-xs text-gray-500 font-normal mt-1">
                表示中: {periodLabelFromApplied(effectiveApplied)}
                {effectiveApplied.selectedStaffId === "all"
                  ? " · 全担当者"
                  : ` · ${staff.find((s) => String(s.id) === effectiveApplied.selectedStaffId)?.name ?? ""}`}
                <span className="block mt-1 text-[11px] text-gray-400">
                  原価は税抜。担当者別の利益率は (期間内入金合計 − 原価合計) ÷ 期間内入金合計（集計画面と同じ考え方）。
                </span>
              </p>
            )}
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {!effectiveApplied ? (
              <p className="px-4 py-8 text-sm text-gray-500 text-center">
                条件を選んで「集計」を押すと、ここにサマリーが表示されます。
              </p>
            ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="font-semibold text-xs md:text-sm whitespace-nowrap">
                    担当者
                  </TableHead>
                  <TableHead className="font-semibold text-xs md:text-sm whitespace-nowrap text-right">
                    請求件数
                  </TableHead>
                  <TableHead className="font-semibold text-xs md:text-sm whitespace-nowrap text-right">
                    請求金額合計
                  </TableHead>
                  <TableHead className="font-semibold text-xs md:text-sm whitespace-nowrap text-right">
                    入金額合計
                  </TableHead>
                  <TableHead className="font-semibold text-xs md:text-sm whitespace-nowrap text-right">
                    原価額（税抜）
                  </TableHead>
                  <TableHead className="font-semibold text-xs md:text-sm whitespace-nowrap text-right">
                    利益率
                  </TableHead>
                  <TableHead className="font-semibold text-xs md:text-sm whitespace-nowrap text-right">
                    未入金残高
                  </TableHead>
                  <TableHead className="font-semibold text-xs md:text-sm whitespace-nowrap text-right">
                    未入金件数
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statsByStaff.map((row) => (
                  <TableRow
                    key={row.staff.id}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    <TableCell className="whitespace-nowrap">
                      <Link
                        href={`/staff/${row.staff.id}`}
                        className="text-blue-600 hover:text-blue-700 hover:underline font-medium text-xs md:text-sm"
                      >
                        {row.staff.name}
                      </Link>
                      <p className="text-[11px] text-gray-500 mt-0.5 hidden md:block">
                        {row.staff.department} / {row.staff.role}
                      </p>
                    </TableCell>
                    <TableCell className="text-right text-xs md:text-sm">
                      {row.invoices.length}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-xs md:text-sm">
                      {formatCurrency(row.totalBilled)}
                    </TableCell>
                    <TableCell className="text-right text-xs md:text-sm text-green-700">
                      {formatCurrency(row.totalPaid)}
                    </TableCell>
                    <TableCell className="text-right text-xs md:text-sm tabular-nums">
                      {formatCurrency(row.totalCostExTax)}
                    </TableCell>
                    <TableCell className="text-right text-xs md:text-sm tabular-nums">
                      {formatProfitMarginRate(row.profitMarginOnPaid)}
                    </TableCell>
                    <TableCell className="text-right text-xs md:text-sm text-orange-700">
                      {formatCurrency(row.totalUnpaid)}
                    </TableCell>
                    <TableCell className="text-right text-xs md:text-sm">
                      {row.unpaidCount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="text-base md:text-lg">
              担当者別の請求一覧
            </CardTitle>
            <p className="text-xs text-gray-500 font-normal mt-1">
              各行の利益率は税抜売上（明細合計）基準。請求詳細と同じ定義です。
            </p>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {!effectiveApplied ? (
              <p className="px-4 py-8 text-sm text-gray-500 text-center">
                条件を選んで「集計」を押すと、ここに請求一覧が表示されます。
              </p>
            ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="font-semibold text-xs md:text-sm whitespace-nowrap">
                    担当者
                  </TableHead>
                  <TableHead className="font-semibold text-xs md:text-sm whitespace-nowrap">
                    請求番号
                  </TableHead>
                  <TableHead className="font-semibold text-xs md:text-sm whitespace-nowrap">
                    請求日
                  </TableHead>
                  <TableHead className="font-semibold text-xs md:text-sm whitespace-nowrap text-right">
                    請求金額
                  </TableHead>
                  <TableHead className="font-semibold text-xs md:text-sm whitespace-nowrap text-right">
                    入金額（期間内）
                  </TableHead>
                  <TableHead className="font-semibold text-xs md:text-sm whitespace-nowrap text-right">
                    原価額（税抜）
                  </TableHead>
                  <TableHead className="font-semibold text-xs md:text-sm whitespace-nowrap text-right">
                    利益率
                  </TableHead>
                  <TableHead className="font-semibold text-xs md:text-sm whitespace-nowrap text-right">
                    残額
                  </TableHead>
                  <TableHead className="font-semibold text-xs md:text-sm whitespace-nowrap text-right">
                    入金回数（期間内）
                  </TableHead>
                  <TableHead className="font-semibold text-xs md:text-sm whitespace-nowrap">
                    最終入金日（期間内）
                  </TableHead>
                  <TableHead className="font-semibold text-xs md:text-sm whitespace-nowrap">
                    入金状況
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statsByStaff.flatMap((row) =>
                  row.invoices.map((inv) => {
                    const payments = getPaymentsByInvoiceId(inv.id);
                    const paidTotal = getTotalPaidAmount(inv.id);
                    const remaining = inv.amount - paidTotal;
                    const status = calculateInvoiceStatus(inv);
                    const paymentsInPeriod = payments.filter((p) =>
                      isInRange(p.payment_date)
                    );
                    const paidInPeriod = paymentsInPeriod.reduce(
                      (sum, p) => sum + p.amount,
                      0
                    );
                    const lastPayment =
                      paymentsInPeriod[paymentsInPeriod.length - 1];

                    return (
                      <TableRow key={`${row.staff.id}-${inv.id}`}>
                        <TableCell className="whitespace-nowrap text-xs md:text-sm">
                          <Link
                            href={`/staff/${row.staff.id}`}
                            className="text-blue-600 hover:underline"
                          >
                            {row.staff.name}
                          </Link>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs md:text-sm">
                          <Link
                            href={`/invoices/${inv.id}`}
                            className="text-blue-600 hover:underline"
                          >
                            {inv.invoice_number}
                          </Link>
                        </TableCell>
                        <TableCell className="text-xs md:text-sm">
                          {inv.created_at}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-xs md:text-sm">
                          {formatCurrency(inv.amount)}
                        </TableCell>
                        <TableCell className="text-right text-xs md:text-sm text-green-700">
                          {formatCurrency(paidInPeriod)}
                        </TableCell>
                        <TableCell className="text-right text-xs md:text-sm tabular-nums">
                          {inv.cost_amount_excluding_tax != null
                            ? formatCurrency(inv.cost_amount_excluding_tax)
                            : "未入力"}
                        </TableCell>
                        <TableCell className="text-right text-xs md:text-sm tabular-nums">
                          {formatProfitMarginRate(invoiceProfitMarginRateForDisplay(inv))}
                        </TableCell>
                        <TableCell className="text-right text-xs md:text-sm text-orange-700">
                          {formatCurrency(remaining)}
                        </TableCell>
                        <TableCell className="text-right text-xs md:text-sm">
                          {paymentsInPeriod.length}
                        </TableCell>
                        <TableCell className="text-xs md:text-sm">
                          {lastPayment ? lastPayment.payment_date : "-"}
                        </TableCell>
                        <TableCell className="text-xs md:text-sm">
                          <span
                            className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-yellow-100 text-yellow-800"
                          >
                            {status}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

