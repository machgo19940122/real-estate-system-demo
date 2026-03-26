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
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  getCompanyBankAccounts,
  getTransferBatchDisplayNumber,
  loadBatches,
} from "@/lib/transfer-store";

export default function TransfersPage() {
  const accounts = getCompanyBankAccounts();
  const [batches, setBatches] = useState(() => loadBatches());
  const [searchQuery, setSearchQuery] = useState("");

  const enriched = useMemo(() => {
    const byId = new Map(accounts.map((a) => [a.id, a]));
    return batches.map((b) => ({ batch: b, account: byId.get(b.company_bank_account_id) }));
  }, [batches, accounts]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return enriched;
    return enriched.filter(({ batch, account }) => {
      const displayNumber = getTransferBatchDisplayNumber(batch);
      const haystack = [
        displayNumber,
        String(batch.id),
        batch.transfer_date,
        batch.created_at,
        batch.created_by,
        batch.status,
        account?.bank_name,
        account?.bank_code,
        account?.branch_code,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [enriched, searchQuery]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              総合振込
            </h1>
            <p className="text-xs text-gray-600 mt-2 leading-snug max-w-3xl">
              総合振込は、外注費など複数の支払いを一度にまとめて処理するための機能です。あらかじめ振込先マスタに口座を登録しておき、振込元の自社口座・振込日・金額と振込先を一覧で入力します。確定後、銀行のネットバンキング等に取り込む全銀（Zengin）形式の振込データをダウンロードし、実際の振込手続きに進みます。
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link href="/transfers/new">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold">
                <Plus className="h-4 w-4 mr-2" />
                新規バッチ作成
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
                placeholder="バッチ番号、銀行名、作成担当者、日付で検索..."
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
            <CardTitle>バッチ一覧</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="font-semibold">バッチ番号</TableHead>
                  <TableHead className="font-semibold">振込日</TableHead>
                  <TableHead className="font-semibold">振込元（銀行）</TableHead>
                  <TableHead className="font-semibold">件数</TableHead>
                  <TableHead className="font-semibold">金額</TableHead>
                  <TableHead className="font-semibold">状態</TableHead>
                  <TableHead className="font-semibold">作成日</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length > 0 ? (
                  filtered.map(({ batch, account }) => (
                    <TableRow key={batch.id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell className="font-medium">
                        <Link
                          href={`/transfers/${batch.id}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                        >
                          {getTransferBatchDisplayNumber(batch)}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {batch.transfer_date ? formatDate(batch.transfer_date) : "-"}
                      </TableCell>
                      <TableCell className="text-sm text-gray-700">
                        {account?.bank_name ?? `口座ID:${batch.company_bank_account_id}`}
                      </TableCell>
                      <TableCell className="tabular-nums">{batch.total_count}件</TableCell>
                      <TableCell className="font-semibold tabular-nums">
                        {formatCurrency(batch.total_amount)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            batch.status === "exported"
                              ? "bg-green-100 text-green-800"
                              : batch.status === "confirmed"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {batch.status === "exported"
                            ? "出力済"
                            : batch.status === "confirmed"
                              ? "確定"
                              : "下書き"}
                        </span>
                      </TableCell>
                      <TableCell>{batch.created_at ? formatDate(batch.created_at) : "-"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      {enriched.length > 0 ? "検索結果が見つかりませんでした" : "表示するデータがありません"}
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

