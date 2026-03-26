"use client";

import { useMemo, useState } from "react";
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
import Link from "next/link";
import { Plus, Search, X } from "lucide-react";
import { loadCompanyBankAccounts } from "@/lib/transfer-store";

export default function CompanyBankAccountsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [accounts, setAccounts] = useState(() => loadCompanyBankAccounts());

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return accounts;
    const q = searchQuery.trim().toLowerCase().replaceAll(" ", "").replaceAll("　", "");
    const normalize = (s: string | undefined) =>
      (s ?? "").toLowerCase().replaceAll(" ", "").replaceAll("　", "");
    return accounts.filter((a) => {
      const hay = [
        a.bank_name,
        a.bank_name_kana,
        a.branch_name_kana,
        a.bank_code,
        a.branch_code,
        a.account_type,
        a.account_number,
        a.account_name_kana,
        a.client_code,
      ]
        .map(normalize)
        .join("");
      return hay.includes(q);
    });
  }, [accounts, searchQuery]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              振込元口座マスタ
            </h1>
            <p className="text-gray-600 mt-2">総合振込（全銀）で使用する自社口座を管理します</p>
          </div>
          <div className="flex gap-2">
            <Link href="/company-bank-accounts/new">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold">
                <Plus className="h-4 w-4 mr-2" />
                新規口座登録
              </Button>
            </Link>
          </div>
        </div>

        {/* 検索バー */}
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="銀行名、コード、口座番号、名義（カナ）で検索..."
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
            <CardTitle>口座一覧</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="font-semibold">銀行</TableHead>
                  <TableHead className="font-semibold">支店</TableHead>
                  <TableHead className="font-semibold">種目</TableHead>
                  <TableHead className="font-semibold">口座番号</TableHead>
                  <TableHead className="font-semibold">名義（カナ）</TableHead>
                  <TableHead className="font-semibold">委託者コード</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length > 0 ? (
                  filtered.map((a) => (
                    <TableRow key={a.id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell className="font-medium">
                        <Link
                          href={`/company-bank-accounts/${a.id}`}
                          className="text-blue-600 hover:text-blue-700 hover:underline truncate inline-block max-w-full"
                        >
                          {a.bank_name}（{a.bank_code}）
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-gray-700">
                        {a.branch_code}
                        {a.branch_name_kana ? ` / ${a.branch_name_kana}` : ""}
                      </TableCell>
                      <TableCell>{a.account_type}</TableCell>
                      <TableCell className="tabular-nums">{a.account_number}</TableCell>
                      <TableCell className="text-sm text-gray-700">{a.account_name_kana}</TableCell>
                      <TableCell className="tabular-nums">{a.client_code}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      {accounts.length > 0 ? "検索結果が見つかりませんでした" : "表示するデータがありません"}
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

