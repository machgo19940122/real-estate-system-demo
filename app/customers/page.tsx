"use client";

import { useState, useMemo, useRef, useEffect } from "react";
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
import { Plus, Printer, Search, X } from "lucide-react";
import Link from "next/link";
import { CustomerEnvelopeLabelModal } from "@/components/customer-envelope-label-modal";

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [labelModalOpen, setLabelModalOpen] = useState(false);
  const selectAllRef = useRef<HTMLInputElement>(null);

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

  const filteredIds = useMemo(
    () => filteredCustomers.map((c) => c.id),
    [filteredCustomers]
  );

  const allFilteredSelected =
    filteredIds.length > 0 && filteredIds.every((id) => selectedIds.includes(id));
  const someFilteredSelected =
    filteredIds.some((id) => selectedIds.includes(id)) && !allFilteredSelected;

  useEffect(() => {
    const el = selectAllRef.current;
    if (el) el.indeterminate = someFilteredSelected;
  }, [someFilteredSelected]);

  const toggleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedIds((prev) => {
        const next = [...prev];
        for (const id of filteredIds) {
          if (!next.includes(id)) next.push(id);
        }
        return next;
      });
    }
  };

  const toggleOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectedCustomers = useMemo(
    () =>
      selectedIds
        .map((id) => customers.find((c) => c.id === id))
        .filter((c): c is (typeof customers)[number] => c != null),
    [selectedIds]
  );

  const selectionCount = selectedIds.length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              顧客一覧
            </h1>
            <p className="text-gray-600 mt-2">すべての顧客を管理します</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {selectionCount > 0 && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLabelModalOpen(true)}
                  className="font-medium"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  封筒ラベル印刷（{selectionCount}件）
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setSelectedIds([])}
                  className="text-gray-600"
                >
                  選択解除
                </Button>
              </>
            )}
            <Link href="/customers/new">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold">
                <Plus className="h-4 w-4 mr-2" />
                新規顧客追加
              </Button>
            </Link>
          </div>
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
            {(searchQuery || filteredCustomers.length > 0) && (
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                {searchQuery && (
                  <span>{filteredCustomers.length}件の結果が見つかりました</span>
                )}
                {filteredCustomers.length > 0 && !allFilteredSelected && (
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedIds((prev) => {
                        const next = [...prev];
                        for (const id of filteredIds) {
                          if (!next.includes(id)) next.push(id);
                        }
                        return next;
                      })
                    }
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    表示中の{filteredCustomers.length}件をすべて選択
                  </button>
                )}
              </div>
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
                  <TableHead className="w-10 font-semibold">
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={toggleSelectAllFiltered}
                      className="h-4 w-4 rounded border-gray-300"
                      aria-label="表示中の顧客をすべて選択"
                    />
                  </TableHead>
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
                    <TableCell className="w-10" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(customer.id)}
                        onChange={() => toggleOne(customer.id)}
                        className="h-4 w-4 rounded border-gray-300"
                        aria-label={`${customer.name}を選択`}
                      />
                    </TableCell>
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
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      検索結果が見つかりませんでした
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <CustomerEnvelopeLabelModal
          open={labelModalOpen}
          onOpenChange={setLabelModalOpen}
          customers={selectedCustomers}
        />
      </div>
    </AppLayout>
  );
}

