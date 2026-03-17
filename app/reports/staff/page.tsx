"use client";

import { useMemo, useState } from "react";
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
  staff,
  invoices,
  getTotalPaidAmount,
  calculateInvoiceStatus,
  getPaymentsByInvoiceId,
  getInvoiceStaffId,
} from "@/src/data/mock";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default function StaffReportsPage() {
  const currentDate = new Date();
  const [selectedStaffId, setSelectedStaffId] = useState<string>("all");
  const [periodMode, setPeriodMode] = useState<"monthly" | "half" | "year">("monthly");
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedHalf, setSelectedHalf] = useState<"H1" | "H2">("H1");

  // 期の開始月（6〜翌5月が1期）
  const fiscalStartMonth = 6;

  const periodLabel = useMemo(() => {
    if (periodMode === "monthly") return `${selectedYear}年${selectedMonth}月`;
    if (periodMode === "half") {
      return selectedHalf === "H1"
        ? `${selectedYear}年度 上期（6〜11月）`
        : `${selectedYear}年度 下期（12〜5月）`;
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

    // 会計年度: [selectedYear-06-01, selectedYear+1-06-01)
    const fiscalStart = new Date(selectedYear, fiscalStartMonth - 1, 1); // 6/1
    const fiscalEndExclusive = new Date(selectedYear + 1, fiscalStartMonth - 1, 1); // 翌年6/1

    if (periodMode === "year") {
      return { start: fiscalStart, endExclusive: fiscalEndExclusive };
    }

    // 半期
    if (selectedHalf === "H1") {
      // 上期: 6〜11月 → [6/1, 12/1)
      return { start: fiscalStart, endExclusive: new Date(selectedYear, 12, 1) };
    }
    // 下期: 12〜翌5月 → [12/1, 翌年6/1)
    return { start: new Date(selectedYear, 11, 1), endExclusive: fiscalEndExclusive };
  }, [periodMode, selectedYear, selectedMonth, selectedHalf]);

  const isInRange = (dateStr: string) => {
    const d = new Date(dateStr);
    return d >= range.start && d < range.endExclusive;
  };

  const statsByStaff = useMemo(() => {
    return staff.map((s) => {
      if (selectedStaffId !== "all" && String(s.id) !== selectedStaffId) {
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
        const remaining = inv.amount - getTotalPaidAmount(inv.id);
        totalUnpaid += remaining;
        const status = calculateInvoiceStatus(inv);
        if (status !== "入金済み") {
          unpaidCount += 1;
        }
      });

      if (invoicesInPeriod.length === 0 && selectedStaffId !== "all") {
        // 選択担当者で期間中データなしの場合も行は出す（0表示）
      }

      return {
        staff: s,
        invoices: invoicesInPeriod,
        totalBilled,
        totalPaid,
        totalUnpaid,
        unpaidCount,
      };
    }).filter((row): row is NonNullable<typeof row> => row !== null);
  }, [selectedStaffId, periodMode, selectedYear, selectedMonth, selectedHalf]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            担当者別集計
          </h1>
          <p className="text-gray-600 mt-2 text-sm md:text-base">
            担当者と集計期間を指定して、案件数・売上・入金状況を確認できます。
          </p>
        </div>

        {/* フィルター */}
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
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
            </div>
            <p className="text-xs text-gray-500">
              現在の集計期間: {periodLabel}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="text-base md:text-lg">担当者別サマリー</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
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
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="text-base md:text-lg">
              担当者別の請求一覧
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
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
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

