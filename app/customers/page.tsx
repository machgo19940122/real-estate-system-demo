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
import { customers } from "@/src/data/mock";
import { formatDate } from "@/lib/utils";
import { Plus, Search, X } from "lucide-react";
import Link from "next/link";

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    const query = searchQuery.toLowerCase();
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.phone.includes(query) ||
        customer.address.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              顧客一覧
            </h1>
            <p className="text-gray-600 mt-2">すべての顧客を管理します</p>
          </div>
          <Link href="/customers/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新規顧客追加
            </Button>
          </Link>
        </div>

        {/* 検索バー */}
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="顧客名、メール、電話、住所で検索..."
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
                {filteredCustomers.length}件の結果が見つかりました
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b">
            <CardTitle>顧客一覧</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="font-semibold">顧客名</TableHead>
                  <TableHead className="font-semibold">電話番号</TableHead>
                  <TableHead className="font-semibold">メールアドレス</TableHead>
                  <TableHead className="font-semibold">住所</TableHead>
                  <TableHead className="font-semibold">登録日</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                  <TableRow
                    key={customer.id}
                    className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                  >
                    <TableCell className="font-medium">
                      <Link
                        href={`/customers/${customer.id}`}
                        className="text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        {customer.name}
                      </Link>
                    </TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.address}</TableCell>
                    <TableCell>
                      {customer.created_at
                        ? formatDate(customer.created_at)
                        : "-"}
                    </TableCell>
                  </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
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

