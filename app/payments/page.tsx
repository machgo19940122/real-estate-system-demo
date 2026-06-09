"use client";

import { Suspense, useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { isWithinYmdRange, rangeForMonth } from "@/lib/date-range";
import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  payments,
  getInvoiceById,
  getProjectById,
  getCustomerById,
  calculateInvoiceStatus,
} from "@/src/data/mock";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Search, X } from "lucide-react";
import Link from "next/link";

type PaymentDateMode = "all" | "month";

function PaymentsPageContent() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "unpaid" | "paid">("all");
  const [paymentDateMode, setPaymentDateMode] = useState<PaymentDateMode>("all");
  const [paymentDateYear, setPaymentDateYear] = useState(() => new Date().getFullYear());
  const [paymentDateMonth, setPaymentDateMonth] = useState(() => new Date().getMonth() + 1);
  useEffect(() => {
    const year = Number(searchParams.get("year"));
    const month = Number(searchParams.get("month"));
    if (Number.isFinite(year) && Number.isFinite(month) && month >= 1 && month <= 12) {
      setPaymentDateMode("month");
      setPaymentDateYear(year);
      setPaymentDateMonth(month);
    }
  }, [searchParams]);

  const jumpToThisMonth = () => {
    const d = new Date();
    setPaymentDateMode("month");
    setPaymentDateYear(d.getFullYear());
    setPaymentDateMonth(d.getMonth() + 1);
  };

  const jumpToLastMonth = () => {
    const d = new Date();
    const ym = new Date(d.getFullYear(), d.getMonth() - 1, 1);
    setPaymentDateMode("month");
    setPaymentDateYear(ym.getFullYear());
    setPaymentDateMonth(ym.getMonth() + 1);
  };

  const clearPaymentDateFilter = () => {
    setPaymentDateMode("all");
  };

  const filteredPayments = useMemo(() => {
    let list = payments;
    if (paymentDateMode === "month") {
      const range = rangeForMonth(paymentDateYear, paymentDateMonth);
      list = list.filter((payment) =>
        isWithinYmdRange(payment.payment_date.slice(0, 10), range)
      );
    }

    const bySearch = !searchQuery.trim()
      ? list
      : list.filter((payment) => {
          const invoice = getInvoiceById(payment.invoice_id);
          const project =
            invoice && invoice.project_id != null
              ? getProjectById(invoice.project_id)
              : undefined;
          const customer = project ? getCustomerById(project.customer_id) : undefined;
          const query = searchQuery.toLowerCase();
          return (
            invoice?.invoice_number.toLowerCase().includes(query) ||
            project?.name.toLowerCase().includes(query) ||
            customer?.name.toLowerCase().includes(query) ||
            payment.payment_method.includes(query)
          );
        });

    if (statusFilter === "all") {
      return bySearch;
    }

    return bySearch.filter((payment) => {
      const invoice = getInvoiceById(payment.invoice_id);
      if (!invoice) return false;
      const status = calculateInvoiceStatus(invoice);
      const isPaid = status === "入金済み";
      return statusFilter === "paid" ? isPaid : !isPaid;
    });
  }, [searchQuery, statusFilter, paymentDateMode, paymentDateYear, paymentDateMonth]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    statusFilter !== "all" ||
    paymentDateMode === "month";

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              入金管理
            </h1>
            <p className="text-gray-600 mt-2">すべての入金を管理します</p>
          </div>
        </div>

        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="請求番号、案件名、顧客名、入金方法で検索..."
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
                <div className="flex items-center gap-2 md:w-64">
                  <span className="text-sm text-gray-600 whitespace-nowrap">請求の入金状況</span>
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value as "all" | "unpaid" | "paid")
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                  >
                    <option value="all">すべて</option>
                    <option value="unpaid">未入金</option>
                    <option value="paid">入金済</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center pt-1 border-t border-gray-100">
                <span className="text-sm font-medium text-gray-700">入金日</span>
                <select
                  value={paymentDateMode}
                  onChange={(e) => setPaymentDateMode(e.target.value as PaymentDateMode)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="all">すべて</option>
                  <option value="month">月を指定</option>
                </select>
                {paymentDateMode === "month" && (
                  <>
                    <select
                      value={paymentDateYear}
                      onChange={(e) => setPaymentDateYear(Number(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                    >
                      {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(
                        (y) => (
                          <option key={y} value={y}>
                            {y}年
                          </option>
                        )
                      )}
                    </select>
                    <select
                      value={paymentDateMonth}
                      onChange={(e) => setPaymentDateMonth(Number(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m}>
                          {m}月
                        </option>
                      ))}
                    </select>
                  </>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary">
                    {paymentDateMode === "all"
                      ? "入金日: すべて"
                      : `入金日: ${paymentDateYear}年${paymentDateMonth}月`}
                  </Badge>
                  <Button type="button" variant="outline" size="sm" onClick={jumpToThisMonth}>
                    今月
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={jumpToLastMonth}>
                    先月
                  </Button>
                  {paymentDateMode === "month" && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearPaymentDateFilter}
                      className="text-gray-600"
                    >
                      入金日をクリア
                    </Button>
                  )}
                </div>
              </div>

              {hasActiveFilters && (
                <p className="text-sm text-gray-500">
                  {filteredPayments.length}件の結果が見つかりました
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b">
            <CardTitle>入金一覧</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="font-semibold">入金日</TableHead>
                  <TableHead className="font-semibold">請求番号</TableHead>
                  <TableHead className="font-semibold">案件名</TableHead>
                  <TableHead className="font-semibold">顧客名</TableHead>
                  <TableHead className="font-semibold">入金額</TableHead>
                  <TableHead className="font-semibold">入金方法</TableHead>
                  <TableHead className="font-semibold">備考</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length > 0 ? (
                  filteredPayments
                    .sort(
                      (a, b) =>
                        new Date(b.payment_date).getTime() -
                        new Date(a.payment_date).getTime()
                    )
                    .map((payment) => {
                      const invoice = getInvoiceById(payment.invoice_id);
                      const project =
                        invoice && invoice.project_id != null
                          ? getProjectById(invoice.project_id)
                          : undefined;
                      const customer = project
                        ? getCustomerById(project.customer_id)
                        : undefined;
                      return (
                        <TableRow
                          key={payment.id}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <TableCell className="font-medium">
                            {formatDate(payment.payment_date)}
                          </TableCell>
                          <TableCell>
                            {invoice ? (
                              <Link
                                href={`/invoices/${invoice.id}`}
                                className="text-blue-600 hover:text-blue-700 hover:underline"
                              >
                                {invoice.invoice_number}
                              </Link>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
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
                          <TableCell>{customer?.name || "-"}</TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(payment.amount)}
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                              {payment.payment_method}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {payment.note || "-"}
                          </TableCell>
                        </TableRow>
                      );
                    })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
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

export default function PaymentsPage() {
  return (
    <Suspense
      fallback={
        <AppLayout>
          <div className="flex items-center justify-center min-h-[40vh] text-gray-500">
            読み込み中...
          </div>
        </AppLayout>
      }
    >
      <PaymentsPageContent />
    </Suspense>
  );
}
