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
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { loadPayees } from "@/lib/transfer-store";
import { Plus, Search, X } from "lucide-react";
import Link from "next/link";

export default function PayeesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [payees, setPayees] = useState(() => loadPayees());

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return payees;
    const q = searchQuery.trim().toLowerCase();
    return payees.filter((p) => {
      const normalize = (s: string) => s.toLowerCase().replaceAll(" ", "").replaceAll("　", "");
      return (
        normalize(p.name).includes(normalize(q)) ||
        (p.memo ? normalize(p.memo).includes(normalize(q)) : false) ||
        `${p.bank_code}${p.branch_code}`.includes(q) ||
        p.account_number.includes(q)
      );
    });
  }, [payees, searchQuery]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              振込先マスタ
            </h1>
            <p className="text-gray-600 mt-2">総合振込（全銀）で使用する振込先口座を管理します</p>
          </div>
          <div className="flex gap-2">
            <Link href="/payees/new">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold">
                <Plus className="h-4 w-4 mr-2" />
                新規振込先登録
              </Button>
            </Link>
          </div>
        </div>

        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="支払先名、メモ、銀行/支店コード、口座番号で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="検索条件をクリア"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="text-sm text-gray-500 mt-2">{filtered.length}件の結果が見つかりました</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b">
            <CardTitle>振込先一覧</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="font-semibold">支払先</TableHead>
                  <TableHead className="font-semibold">銀行/支店</TableHead>
                  <TableHead className="font-semibold">種目</TableHead>
                  <TableHead className="font-semibold">口座番号</TableHead>
                  <TableHead className="font-semibold">名義（カナ）</TableHead>
                  <TableHead className="font-semibold min-w-[8rem]">
                    保険として差し引いて振り込み
                  </TableHead>
                  <TableHead className="font-semibold">登録日</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length > 0 ? (
                  filtered.map((p) => (
                    <TableRow key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell className="font-medium">
                        <div className="min-w-0">
                          <Link
                            href={`/payees/${p.id}`}
                            className="text-blue-600 hover:text-blue-700 hover:underline truncate inline-block max-w-full"
                          >
                            {p.name}
                          </Link>
                          {p.memo && <div className="text-xs text-gray-500 truncate">{p.memo}</div>}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-700">
                        {p.bank_code}/{p.branch_code}
                      </TableCell>
                      <TableCell>{p.account_type}</TableCell>
                      <TableCell className="tabular-nums">{p.account_number}</TableCell>
                      <TableCell className="text-sm text-gray-700">{p.account_name_kana}</TableCell>
                      <TableCell className="text-sm">
                        {p.insurance_deduction_enabled ? (
                          <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-xs font-medium">
                            差引あり
                          </span>
                        ) : (
                          <span className="text-gray-500 text-xs">差引なし</span>
                        )}
                      </TableCell>
                      <TableCell>{p.created_at ? formatDate(p.created_at) : "-"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      表示するデータがありません
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

