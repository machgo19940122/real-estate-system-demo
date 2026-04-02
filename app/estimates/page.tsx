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
import { Button } from "@/components/ui/button";
import {
  estimates,
  projects,
  getCustomerById,
  getPropertyById,
  getStaffById,
  type RevenueCategory,
} from "@/src/data/mock";
import { isWithinYmdRange, rangeForHalf, rangeForMonth, rangeForYear, type HalfKey, type PeriodMode } from "@/lib/date-range";
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

export default function EstimatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<RevenueCategory | "">("");
  const [periodMode, setPeriodMode] = useState<PeriodMode>("all");
  const [periodYear, setPeriodYear] = useState<number>(new Date().getFullYear());
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
    const d = new Date();
    setPeriodMode("year");
    setPeriodYear(d.getFullYear());
  };

  const formatYmdJa = (ymd: string): string => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
    if (!m) return ymd;
    return `${Number(m[1])}・${Number(m[2])}・${Number(m[3])}`;
  };

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    for (const e of estimates) years.add(Number(e.created_at.slice(0, 4)));
    const arr = Array.from(years).filter((y) => Number.isFinite(y));
    arr.sort((a, b) => b - a);
    return arr.length ? arr : [new Date().getFullYear()];
  }, []);

  const periodRange = useMemo(() => {
    if (periodMode === "all") return null;
    if (periodMode === "month") return rangeForMonth(periodYear, periodMonth);
    if (periodMode === "half") return rangeForHalf(periodYear, periodHalf);
    if (periodMode === "year") return rangeForYear(periodYear);
    if (!customFrom || !customTo) return null;
    if (customFrom > customTo) return { start: customTo, end: customFrom };
    return { start: customFrom, end: customTo };
  }, [periodMode, periodYear, periodMonth, periodHalf, customFrom, customTo]);

  const filteredEstimates = useMemo(() => {
    let list = estimates;
    if (periodRange) {
      list = list.filter((e) => isWithinYmdRange(e.created_at, periodRange));
    }
    if (categoryFilter) {
      list = list.filter((e) => (e as any).revenue_category === categoryFilter);
    }
    if (!searchQuery.trim()) return list;
    const query = searchQuery.toLowerCase();
    return list.filter((estimate) => {
      const project = projects.find((p) => p.id === (estimate as any).project_id);
      const customer = project ? getCustomerById(project.customer_id) : undefined;
      const property = project ? getPropertyById(project.property_id) : undefined;
      const staff = estimate.staff_id ? getStaffById(estimate.staff_id) : undefined;
      return (
        estimate.estimate_number.toLowerCase().includes(query) ||
        customer?.name.toLowerCase().includes(query) ||
        property?.name.toLowerCase().includes(query) ||
        staff?.name.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, categoryFilter, periodRange]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              見積一覧
            </h1>
            <p className="text-gray-600 mt-2">すべての見積を管理します</p>
          </div>
          <Link href="/estimates/new">
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold">
              <Plus className="h-4 w-4 mr-2" />
              新規見積登録
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
                    placeholder="見積番号、顧客名、物件名、担当者名で検索..."
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
                      <option key={y} value={y}>
                        {y}年
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
                    <span className="text-sm text-gray-600">見積日</span>
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
                  今年
                </Button>
                {(searchQuery || categoryFilter || periodRange || periodMode === "all") && (
                  <span className="text-sm text-gray-500">{filteredEstimates.length}件</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b">
            <CardTitle>見積一覧</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="font-semibold">見積番号</TableHead>
                  <TableHead className="font-semibold">顧客</TableHead>
                  <TableHead className="font-semibold">物件</TableHead>
                  <TableHead className="font-semibold">担当者</TableHead>
                  <TableHead className="font-semibold">区分</TableHead>
                  <TableHead className="font-semibold">小計</TableHead>
                  <TableHead className="font-semibold">消費税</TableHead>
                  <TableHead className="font-semibold">合計</TableHead>
                  <TableHead className="font-semibold">見積日</TableHead>
                  <TableHead className="font-semibold">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEstimates.length > 0 ? (
                  filteredEstimates.map((estimate) => {
                  const project = projects.find((p) => p.id === (estimate as any).project_id);
                  const customer = project ? getCustomerById(project.customer_id) : undefined;
                  const property = project ? getPropertyById(project.property_id) : undefined;
                  const staff = estimate.staff_id ? getStaffById(estimate.staff_id) : undefined;
                  return (
                    <TableRow
                      key={estimate.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        <Link
                          href={`/estimates/${estimate.id}`}
                          className="text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          {estimate.estimate_number}
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
                      <TableCell>{(estimate as any).revenue_category ?? "-"}</TableCell>
                      <TableCell>{formatCurrency(estimate.subtotal)}</TableCell>
                      <TableCell>{formatCurrency(estimate.tax)}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(estimate.total)}
                      </TableCell>
                      <TableCell>{formatDate(estimate.created_at)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // PDF出力（ダミー）
                            alert("PDF出力機能（ダミー）");
                          }}
                        >
                          <FileDown className="h-4 w-4 mr-2" />
                          見積書PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
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

