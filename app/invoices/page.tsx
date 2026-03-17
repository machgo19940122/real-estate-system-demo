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
  getInvoiceRevenueCategory,
  calculateInvoiceStatus,
  type RevenueCategory,
} from "@/src/data/mock";

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

  const filteredInvoices = useMemo(() => {
    let list = invoices;
    if (categoryFilter) {
      list = list.filter((inv) => getInvoiceRevenueCategory(inv) === categoryFilter);
    }
    if (!searchQuery.trim()) return list;
    const query = searchQuery.toLowerCase();
    return list.filter((invoice) => {
      const project = projects.find((p) => p.id === (invoice as any).project_id);
      const customer = project ? getCustomerById(project.customer_id) : undefined;
      const property = project ? getPropertyById(project.property_id) : undefined;
      const status = calculateInvoiceStatus(invoice);
      return (
        invoice.invoice_number.toLowerCase().includes(query) ||
        customer?.name.toLowerCase().includes(query) ||
        property?.name.toLowerCase().includes(query) ||
        status.includes(query)
      );
    });
  }, [searchQuery, categoryFilter]);

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
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新規請求登録
            </Button>
          </Link>
        </div>

        {/* 検索バー */}
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex gap-3 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="請求番号、顧客名、物件名、ステータスで検索..."
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
                onChange={(e) => setCategoryFilter((e.target.value || "") as RevenueCategory | "")}
                className="py-3 px-4 min-w-[140px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm bg-white"
              >
                {REVENUE_CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value || "all"} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            {(searchQuery || categoryFilter) && (
              <p className="text-sm text-gray-500 mt-2">
                {filteredInvoices.length}件の結果が見つかりました
              </p>
            )}
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
                  <TableHead className="font-semibold">区分</TableHead>
                  <TableHead className="font-semibold">金額</TableHead>
                  <TableHead className="font-semibold">支払期限</TableHead>
                  <TableHead className="font-semibold">入金ステータス</TableHead>
                  <TableHead className="font-semibold">作成日</TableHead>
                  <TableHead className="font-semibold">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice) => {
                  const project = projects.find((p) => p.id === (invoice as any).project_id);
                  const customer = project ? getCustomerById(project.customer_id) : undefined;
                  const property = project ? getPropertyById(project.property_id) : undefined;
                  const status = calculateInvoiceStatus(invoice);
                  const isOverdue =
                    status === "無し" &&
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
                          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800"
                        >
                          {status}
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

