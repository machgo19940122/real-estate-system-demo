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
  payments,
  getInvoiceById,
  getProjectById,
  getCustomerById,
} from "@/src/data/mock";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Search, X } from "lucide-react";
import Link from "next/link";

export default function PaymentsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPayments = useMemo(() => {
    if (!searchQuery.trim()) return payments;
    const query = searchQuery.toLowerCase();
    return payments.filter((payment) => {
      const invoice = getInvoiceById(payment.invoice_id);
      const project = invoice ? getProjectById(invoice.project_id) : undefined;
      const customer = project ? getCustomerById(project.customer_id) : undefined;
      return (
        invoice?.invoice_number.toLowerCase().includes(query) ||
        project?.name.toLowerCase().includes(query) ||
        customer?.name.toLowerCase().includes(query) ||
        payment.payment_method.includes(query)
      );
    });
  }, [searchQuery]);

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

        {/* 検索バー */}
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="relative">
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
            {searchQuery && (
              <p className="text-sm text-gray-500 mt-2">
                {filteredPayments.length}件の結果が見つかりました
              </p>
            )}
          </CardContent>
        </Card>

        {/* 入金一覧テーブル */}
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
                      const project = invoice
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
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-gray-500"
                    >
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

