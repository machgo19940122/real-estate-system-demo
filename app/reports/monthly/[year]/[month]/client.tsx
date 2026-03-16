"use client";

import { useState, useMemo } from "react";
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
  invoices,
  getRevenueCategory,
  getProjectById,
  getCustomerById,
  getPaymentsByInvoiceId,
  getTotalPaidAmount,
  type RevenueCategory,
} from "@/src/data/mock";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, Download, Lock, CheckCircle } from "lucide-react";
import Link from "next/link";

interface MonthlyReportDetailClientProps {
  year: number;
  month: number;
}

export function MonthlyReportDetailClient({
  year,
  month,
}: MonthlyReportDetailClientProps) {
  const [isClosed, setIsClosed] = useState(false);

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

  // 顧客別にグループ化
  const invoicesByCustomer = useMemo(() => {
    const grouped = new Map<number, typeof monthlyInvoices>();

    monthlyInvoices.forEach((invoice) => {
      const project = getProjectById(invoice.project_id);
      if (!project) return;

      const customerId = project.customer_id;
      if (!grouped.has(customerId)) {
        grouped.set(customerId, []);
      }
      grouped.get(customerId)!.push(invoice);
    });

    return grouped;
  }, [monthlyInvoices]);

  // 売上区分別集計（サマリー用）
  const invoicesByCategory = useMemo(() => {
    const grouped: Record<RevenueCategory, typeof monthlyInvoices> = {
      新築: [],
      リフォーム: [],
      土地: [],
      仲介料: [],
    };

    monthlyInvoices.forEach((invoice) => {
      const project = getProjectById(invoice.project_id);
      if (!project) return;

      const category = getRevenueCategory(project.type);
      grouped[category].push(invoice);
    });

    return grouped;
  }, [monthlyInvoices]);

  // 区分別集計
  const categoryTotals = useMemo(() => {
    const totals: Record<RevenueCategory, number> = {
      新築: 0,
      リフォーム: 0,
      土地: 0,
      仲介料: 0,
    };

    Object.entries(invoicesByCategory).forEach(([category, categoryInvoices]) => {
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
        totals[category as RevenueCategory] += monthlyPaidAmount;
      });
    });

    return totals;
  }, [invoicesByCategory, year, month]);

  const totalAmount = Object.values(categoryTotals).reduce(
    (sum, amount) => sum + amount,
    0
  );

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

    monthlyInvoices.forEach((invoice) => {
      const project = getProjectById(invoice.project_id);
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
            <Link href="/reports/monthly">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                戻る
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {year}年{month}月 月次集計
              </h1>
              <p className="text-gray-600 mt-1 text-sm md:text-base">請求先別の詳細集計</p>
            </div>
          </div>
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
        </div>

        {isClosed && (
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

        {/* 合計サマリー */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-white">
          <CardHeader className="border-b">
            <CardTitle className="text-lg md:text-xl">合計売上</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
              {formatCurrency(totalAmount)}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(["新築", "リフォーム", "土地", "仲介料"] as RevenueCategory[]).map(
                (category) => (
                  <div key={category} className="text-center">
                    <p className="text-xs md:text-sm text-gray-600 mb-1">{categoryLabels[category]}</p>
                    <p className="text-lg md:text-xl font-bold text-gray-900">
                      {formatCurrency(categoryTotals[category])}
                    </p>
                  </div>
                )
              )}
            </div>
          </CardContent>
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
                  <TableHead className="font-semibold text-xs md:text-sm whitespace-nowrap">残額</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from(invoicesByCustomer.entries())
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
                  })}
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
                    const projectA = getProjectById(a.project_id);
                    const projectB = getProjectById(b.project_id);
                    const customerA = projectA ? getCustomerById(projectA.customer_id) : undefined;
                    const customerB = projectB ? getCustomerById(projectB.customer_id) : undefined;
                    return (customerA?.name || "").localeCompare(customerB?.name || "");
                  })
                  .map((invoice) => {
                    const project = getProjectById(invoice.project_id);
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

