"use client";

import { useState, useMemo } from "react";
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
  projects,
  getCustomerById,
  getPropertyById,
  getStaffById,
  getInvoiceRevenueCategory,
  getInvoiceStaffId,
  calculateInvoiceStatus,
  type RevenueCategory,
} from "@/src/data/mock";
import {
  isWithinYmdRange,
  rangeForHalf,
  rangeForMonth,
  rangeForFiscalYearJuneMay,
  fiscalStartYearContainingDate,
  fiscalStartYearForYmd,
  type HalfKey,
  type PeriodMode,
} from "@/lib/date-range";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const REVENUE_CATEGORY_OPTIONS: { value: RevenueCategory | ""; label: string }[] = [
  { value: "", label: "全区分" },
  { value: "新築", label: "新築" },
  { value: "リフォーム", label: "リフォーム" },
  { value: "土地", label: "土地" },
  { value: "仲介料", label: "仲介料" },
];
import { formatCurrency, formatDate } from "@/lib/utils";
import { FileDown, Search, X, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function InvoicesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<RevenueCategory | "">("");
  const [statusFilter, setStatusFilter] = useState<"" | "有" | "無し">("");
  const [periodMode, setPeriodMode] = useState<PeriodMode>("all");
  const [periodYear, setPeriodYear] = useState<number>(() =>
    fiscalStartYearContainingDate(new Date())
  );
  const [periodMonth, setPeriodMonth] = useState<number>(new Date().getMonth() + 1);
  const [periodHalf, setPeriodHalf] = useState<HalfKey>("H1");
  const [customFrom, setCustomFrom] = useState<string>("");
  const [customTo, setCustomTo] = useState<string>("");

  const jumpToThisMonth = () => {
    const d = new Date();
    setPeriodMode("month");
    setPeriodYear(d.getFullYear());
    setPeriodMonth(d.getMonth() + 1);
  };

  const jumpToLastMonth = () => {
    const d = new Date();
    const ym = new Date(d.getFullYear(), d.getMonth() - 1, 1);
    setPeriodMode("month");
    setPeriodYear(ym.getFullYear());
    setPeriodMonth(ym.getMonth() + 1);
  };

  const jumpToThisYear = () => {
    setPeriodMode("year");
    setPeriodYear(fiscalStartYearContainingDate(new Date()));
  };

  const jumpToPreviousYear = () => {
    setPeriodMode("year");
    setPeriodYear(fiscalStartYearContainingDate(new Date()) - 1);
  };

  const formatYmdJa = (ymd: string): string => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
    if (!m) return ymd;
    return `${Number(m[1])}・${Number(m[2])}・${Number(m[3])}`;
  };

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    for (const inv of invoices) years.add(fiscalStartYearForYmd(inv.created_at));
    const arr = Array.from(years).filter((y) => Number.isFinite(y));
    arr.sort((a, b) => b - a);
    return arr.length ? arr : [fiscalStartYearContainingDate(new Date())];
  }, []);

  const periodRange = useMemo(() => {
    if (periodMode === "all") return null;
    if (periodMode === "month") return rangeForMonth(periodYear, periodMonth);
    if (periodMode === "half") return rangeForHalf(periodYear, periodHalf);
    if (periodMode === "year") return rangeForFiscalYearJuneMay(periodYear);
    if (!customFrom || !customTo) return null;
    if (customFrom > customTo) return { start: customTo, end: customFrom };
    return { start: customFrom, end: customTo };
  }, [periodMode, periodYear, periodMonth, periodHalf, customFrom, customTo]);

  const filteredInvoices = useMemo(() => {
    let list = invoices;
    if (periodRange) {
      list = list.filter((inv) => isWithinYmdRange(inv.created_at, periodRange));
    }
    if (categoryFilter) {
      list = list.filter((inv) => getInvoiceRevenueCategory(inv) === categoryFilter);
    }
    if (statusFilter) {
      list = list.filter((inv) => inv.status === statusFilter);
    }
    if (!searchQuery.trim()) return list;
    const query = searchQuery.toLowerCase();
    return list.filter((invoice) => {
      const project = projects.find((p) => p.id === (invoice as any).project_id);
      const customer = project ? getCustomerById(project.customer_id) : undefined;
      const property = project ? getPropertyById(project.property_id) : undefined;
      const invoiceStaffId = getInvoiceStaffId(invoice);
      const staffMember =
        invoiceStaffId != null ? getStaffById(invoiceStaffId) : undefined;
      const paymentStatus = calculateInvoiceStatus(invoice);
      const manualStatus = invoice.status;
      const manualStatusLabel = manualStatus === "有" ? "黄色有" : "黄色無し";
      return (
        invoice.invoice_number.toLowerCase().includes(query) ||
        customer?.name.toLowerCase().includes(query) ||
        property?.name.toLowerCase().includes(query) ||
        staffMember?.name.toLowerCase().includes(query) ||
        paymentStatus.includes(query) ||
        manualStatus.includes(query) ||
        manualStatusLabel.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, categoryFilter, statusFilter, periodRange]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              請求一覧
            </h1>
            <p className="text-gray-600 mt-2">すべての請求を管理します</p>
          </div>
          <Link href="/invoices/new">
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold">
              <Plus className="h-4 w-4 mr-2" />
              新規請求登録
            </Button>
          </Link>
        </div>

        {/* 検索バー */}
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex gap-3 items-center flex-wrap">
                <div className="relative flex-1 min-w-[280px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="請求番号、顧客名、物件名、担当者名、ステータス、入金状況で検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) =>
                    setCategoryFilter((e.target.value || "") as RevenueCategory | "")
                  }
                  className="py-3 px-4 min-w-[160px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm bg-white"
                >
                  {REVENUE_CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value || "all"} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter((e.target.value || "") as "" | "有" | "無し")}
                  className="py-3 px-4 min-w-[160px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm bg-white"
                >
                  <option value="">全ステータス</option>
                  <option value="有">黄色有</option>
                  <option value="無し">黄色無し</option>
                </select>
              </div>

              <div className="flex gap-3 items-center flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">期間</span>
                  <div className="flex items-center rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <Button
                      type="button"
                      variant={periodMode === "month" ? "default" : "ghost"}
                      size="sm"
                      className="rounded-none"
                      onClick={() => setPeriodMode("month")}
                    >
                      月
                    </Button>
                    <Separator orientation="vertical" />
                    <Button
                      type="button"
                      variant={periodMode === "half" ? "default" : "ghost"}
                      size="sm"
                      className="rounded-none"
                      onClick={() => setPeriodMode("half")}
                    >
                      半期
                    </Button>
                    <Separator orientation="vertical" />
                    <Button
                      type="button"
                      variant={periodMode === "year" ? "default" : "ghost"}
                      size="sm"
                      className="rounded-none"
                      onClick={() => setPeriodMode("year")}
                    >
                      通期
                    </Button>
                    <Separator orientation="vertical" />
                    <Button
                      type="button"
                      variant={periodMode === "custom" ? "default" : "ghost"}
                      size="sm"
                      className="rounded-none"
                      onClick={() => setPeriodMode("custom")}
                    >
                      期間指定
                    </Button>
                  <Separator orientation="vertical" />
                  <Button
                    type="button"
                    variant={periodMode === "all" ? "default" : "ghost"}
                    size="sm"
                    className="rounded-none"
                    onClick={() => setPeriodMode("all")}
                  >
                    指定なし
                  </Button>
                  </div>
                </div>

                {(periodMode === "month" || periodMode === "half" || periodMode === "year") && (
                  <select
                    value={periodYear}
                    onChange={(e) => setPeriodYear(Number(e.target.value))}
                    className="py-3 px-4 min-w-[110px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm bg-white"
                  >
                    {availableYears.map((y) => (
                      <option
                        key={y}
                        value={y}
                        title={`${y}/6/1〜${y + 1}/5/31（会計年度）`}
                      >
                        {y}年6月期
                      </option>
                    ))}
                  </select>
                )}

                {periodMode === "month" && (
                  <select
                    value={periodMonth}
                    onChange={(e) => setPeriodMonth(Number(e.target.value))}
                    className="py-3 px-4 min-w-[110px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm bg-white"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>
                        {m}月
                      </option>
                    ))}
                  </select>
                )}

                {periodMode === "half" && (
                  <select
                    value={periodHalf}
                    onChange={(e) => setPeriodHalf(e.target.value as HalfKey)}
                    className="py-3 px-4 min-w-[140px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm bg-white"
                  >
                    <option value="H1">上期(1-6)</option>
                    <option value="H2">下期(7-12)</option>
                  </select>
                )}

                {periodMode === "custom" && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-gray-600">請求日</span>
                    <input
                      type="date"
                      value={customFrom}
                      onChange={(e) => setCustomFrom(e.target.value)}
                      className="py-3 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm bg-white"
                    />
                    <span className="text-gray-500">〜</span>
                    <input
                      type="date"
                      value={customTo}
                      onChange={(e) => setCustomTo(e.target.value)}
                      className="py-3 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm bg-white"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCustomFrom("");
                        setCustomTo("");
                      }}
                    >
                      クリア
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary">
                  {periodMode === "all"
                    ? "期間: 指定なし"
                    : periodRange
                      ? `${formatYmdJa(periodRange.start)}〜${formatYmdJa(periodRange.end)}`
                      : "期間指定: 未入力"}
                </Badge>
                <Button type="button" variant="outline" size="sm" onClick={jumpToThisMonth}>
                  今月
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={jumpToLastMonth}>
                  先月
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={jumpToThisYear}>
                  今期
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={jumpToPreviousYear}>
                  前期
                </Button>
                {(searchQuery ||
                  categoryFilter ||
                  statusFilter ||
                  periodRange ||
                  periodMode === "all") && (
                  <span className="text-sm text-gray-500">{filteredInvoices.length}件</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b">
            <CardTitle>請求一覧</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="font-semibold">請求番号</TableHead>
                  <TableHead className="font-semibold">顧客</TableHead>
                  <TableHead className="font-semibold">物件</TableHead>
                  <TableHead className="font-semibold">担当者</TableHead>
                  <TableHead className="font-semibold">区分</TableHead>
                  <TableHead className="font-semibold">金額</TableHead>
                  <TableHead className="font-semibold">支払期限</TableHead>
                  <TableHead className="font-semibold">ステータス</TableHead>
                  <TableHead className="font-semibold">入金状況</TableHead>
                  <TableHead className="font-semibold">請求日</TableHead>
                  <TableHead className="font-semibold">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice) => {
                  const project = projects.find((p) => p.id === (invoice as any).project_id);
                  const customer = project ? getCustomerById(project.customer_id) : undefined;
                  const property = project ? getPropertyById(project.property_id) : undefined;
                  const invoiceStaffId = getInvoiceStaffId(invoice);
                  const staffMember =
                    invoiceStaffId != null ? getStaffById(invoiceStaffId) : undefined;
                  const paymentStatus = calculateInvoiceStatus(invoice);
                  const isOverdue =
                    paymentStatus !== "入金済み" &&
                    new Date(invoice.due_date) < new Date();
                  return (
                    <TableRow
                      key={invoice.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          {invoice.invoice_number}
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
                      <TableCell>
                        {property ? (
                          <Link
                            href={`/properties/${property.id}`}
                            className="text-gray-700 hover:text-blue-600 hover:underline"
                          >
                            {property.name}
                          </Link>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {staffMember ? (
                          <Link
                            href={`/staff/${staffMember.id}`}
                            className="hover:text-blue-600 hover:underline"
                          >
                            {staffMember.name}
                          </Link>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>{getInvoiceRevenueCategory(invoice)}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(invoice.amount)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            isOverdue ? "text-red-600 font-medium" : ""
                          }
                        >
                          {formatDate(invoice.due_date)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            invoice.status === "有"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {invoice.status === "有" ? "黄色有" : "黄色無し"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {paymentStatus}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(invoice.created_at)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            alert(`請求書発行（PDF / ダミー）: ${invoice.invoice_number}`);
                          }}
                        >
                          <FileDown className="h-4 w-4 mr-2" />
                          PDF出力
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                      検索結果が見つかりませんでした
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

