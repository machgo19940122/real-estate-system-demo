"use client";

import { useMemo, useState } from "react";
import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Download, Pencil } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  getBatchById,
  getBatchItemsByBatchId,
  getCompanyBankAccounts,
  getTransferBatchDisplayNumber,
  markBatchExported,
  loadPayees,
} from "@/lib/transfer-store";
import { buildZenginTransferFile } from "@/lib/zengin";

export function TransferBatchDetailClient({ id }: { id: number }) {
  const accounts = getCompanyBankAccounts();
  const [batch, setBatch] = useState(() => getBatchById(id));
  const [items, setItems] = useState(() => getBatchItemsByBatchId(id));

  const payees = loadPayees();

  const account = useMemo(() => {
    if (!batch) return undefined;
    return accounts.find((a) => a.id === batch.company_bank_account_id);
  }, [accounts, batch]);

  const refresh = () => {
    setBatch(getBatchById(id));
    setItems(getBatchItemsByBatchId(id));
  };

  const handleExport = () => {
    if (!batch || !account) return;
    const { fileName, content } = buildZenginTransferFile({
      transferDate: batch.transfer_date,
      companyAccount: account,
      items,
    });

    // ダウンロード
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);

    markBatchExported(batch.id, fileName);
    refresh();
  };

  if (!batch) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/transfers">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                戻る
              </Button>
            </Link>
          </div>
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <p className="text-gray-700">バッチが見つかりませんでした。</p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/transfers">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              総合振込バッチ詳細
            </h1>
            <p className="text-gray-600 mt-1">
              {getTransferBatchDisplayNumber(batch)} の内容を確認し、全銀（Zengin）ファイルを出力します
            </p>
          </div>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <CardTitle>総合振込バッチ</CardTitle>
              <div className="flex flex-col items-stretch sm:items-end gap-2">
                <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                  {batch.status === "exported" ? (
                    <Button variant="outline" disabled title="出力済みのため編集できません">
                      <Pencil className="h-4 w-4 mr-2" />
                      編集
                    </Button>
                  ) : (
                    <Link href={`/transfers/${batch.id}/edit`}>
                      <Button variant="outline">
                        <Pencil className="h-4 w-4 mr-2" />
                        編集
                      </Button>
                    </Link>
                  )}
                  <Button
                    onClick={handleExport}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
                    disabled={!account || items.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    全銀ファイル出力
                  </Button>
                </div>
                {batch.status === "exported" && (
                  <p className="text-xs text-gray-500 text-right">出力済みのため編集できません</p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <section className="space-y-2">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <h2 className="text-sm font-semibold text-gray-900">バッチ情報</h2>
                <p className="text-xs text-gray-500">
                  振込元（銀行）・振込指定日・作成担当者を確認します
                </p>
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 lg:grid-cols-5 text-sm">
                <div className="min-w-0">
                  <dt className="text-xs text-gray-500">バッチ番号</dt>
                  <dd className="font-medium text-gray-900 truncate">
                    {getTransferBatchDisplayNumber(batch)}
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-xs text-gray-500">状態</dt>
                  <dd className="font-medium text-gray-900">
                    {batch.status === "exported" ? "出力済" : batch.status === "confirmed" ? "確定" : "下書き"}
                  </dd>
                  {batch.exported_at && (
                    <dd className="text-[11px] text-gray-500 leading-snug mt-0.5">
                      出力 {formatDate(batch.exported_at)}
                      {batch.file_name ? ` / ${batch.file_name}` : ""}
                    </dd>
                  )}
                </div>
                <div className="min-w-0 col-span-2 sm:col-span-1">
                  <dt className="text-xs text-gray-500">振込元（銀行）</dt>
                  <dd className="font-medium text-gray-900 truncate">
                    {account?.bank_name ?? `口座ID:${batch.company_bank_account_id}`}
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-xs text-gray-500">振込指定日</dt>
                  <dd className="font-medium text-gray-900 tabular-nums">
                    {batch.transfer_date ? formatDate(batch.transfer_date) : "-"}
                  </dd>
                </div>
                <div className="min-w-0 col-span-2 sm:col-span-1 lg:col-span-1">
                  <dt className="text-xs text-gray-500">作成担当者</dt>
                  <dd className="font-medium text-gray-900 truncate">{batch.created_by}</dd>
                </div>
              </dl>
            </section>

            <div className="border-t pt-4">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <h2 className="text-sm font-semibold text-gray-900">振込明細</h2>
                <p className="text-xs text-gray-500">振込先・金額・摘要（カナ）を確認します</p>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                表示するデータがありません
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {items.map((it) => {
                  const payeeName = payees.find((p) => p.id === it.payee_id)?.name ?? `ID:${it.payee_id}`;
                  return (
                    <div key={it.id} className="py-4 first:pt-0">
                      <div className="grid gap-3 md:grid-cols-12 items-end">
                        <div className="md:col-span-5 space-y-2">
                          <label className="text-xs font-medium text-gray-700">振込先</label>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{payeeName}</p>
                            <p className="text-xs text-gray-500 truncate">
                              {it.bank_code}/{it.branch_code} / {it.account_type} / {it.account_number} / {it.account_name_kana}
                            </p>
                          </div>
                        </div>
                        <div className="md:col-span-3 space-y-2">
                          <label className="text-xs font-medium text-gray-700">金額</label>
                          <p className="font-medium text-gray-900 tabular-nums">{formatCurrency(it.amount)}</p>
                          {it.billing_gross_amount != null && it.billing_gross_amount !== it.amount && (
                            <p className="text-[11px] text-gray-500 tabular-nums">
                              請求額 {formatCurrency(it.billing_gross_amount)}（保険として差し引き{" "}
                              {formatCurrency(it.billing_gross_amount - it.amount)}）
                            </p>
                          )}
                        </div>
                        <div className="md:col-span-4 space-y-2">
                          <label className="text-xs font-medium text-gray-700">摘要（カナ）</label>
                          <p className="font-medium text-gray-900 break-all">{it.description_kana || "-"}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-700">
                <span className="font-medium tabular-nums">
                  合計 {batch.total_count}件 / {formatCurrency(batch.total_amount)}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

