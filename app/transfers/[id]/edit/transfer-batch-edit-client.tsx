"use client";

import { useMemo, useState } from "react";
import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Trash2, Save, Calculator, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { PayeeCombobox } from "@/components/payee-combobox";
import {
  getBatchById,
  getBatchItemsByBatchId,
  getCompanyBankAccounts,
  getTransferBatchDisplayNumber,
  loadPayees,
  replaceBatchItems,
  updateTransferBatch,
} from "@/lib/transfer-store";
import { staff } from "@/src/data/mock";

const INPUT =
  "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white";

type DraftRow = {
  payee_id: string;
  amount: string;
  description_kana: string;
};

export function TransferBatchEditClient({ id }: { id: number }) {
  const router = useRouter();
  const accounts = getCompanyBankAccounts();
  const payees = loadPayees().filter((p) => p.is_active);

  const batch = getBatchById(id);
  const batchItems = getBatchItemsByBatchId(id);

  const [companyAccountId, setCompanyAccountId] = useState(String(batch?.company_bank_account_id ?? ""));
  const [transferDate, setTransferDate] = useState(batch?.transfer_date ?? "");
  const defaultStaffName =
    staff.find((s) => s.department === "経理部")?.name ?? staff[0]?.name ?? "";
  const [createdByStaffName, setCreatedByStaffName] = useState(
    () => batch?.created_by?.trim() || defaultStaffName
  );
  const [rows, setRows] = useState<DraftRow[]>(
    batchItems.length > 0
      ? batchItems.map((it) => ({
          payee_id: String(it.payee_id),
          amount: String(it.amount),
          description_kana: it.description_kana ?? "",
        }))
      : [{ payee_id: String(payees[0]?.id ?? ""), amount: "", description_kana: "" }]
  );

  const totals = useMemo(() => {
    const amounts = rows.map((r) => Number(r.amount) || 0);
    const totalAmount = amounts.reduce((s, v) => s + v, 0);
    const totalCount = rows.filter((r) => (Number(r.amount) || 0) > 0 && r.payee_id).length;
    return { totalAmount, totalCount };
  }, [rows]);

  const canSubmit = useMemo(() => {
    if (!batch) return false;
    if (batch.status === "exported") return false;
    if (!companyAccountId) return false;
    if (!transferDate) return false;
    if (rows.length === 0) return false;
    const hasValid = rows.some((r) => r.payee_id && (Number(r.amount) || 0) > 0);
    return hasValid;
  }, [batch, companyAccountId, transferDate, rows]);

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { payee_id: String(payees[0]?.id ?? ""), amount: "", description_kana: "" },
    ]);
  };

  const removeRow = (idx: number) => setRows((prev) => prev.filter((_, i) => i !== idx));

  const updateRow = (idx: number, patch: Partial<DraftRow>) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batch) return;
    if (batch.status === "exported") return;
    if (!canSubmit) return;

    const cleanedItems = rows
      .map((r) => ({
        payee_id: Number(r.payee_id),
        amount: Number(r.amount) || 0,
        description_kana: (r.description_kana ?? "").trim(),
      }))
      .filter((r) => r.payee_id && r.amount > 0);

    const nextItems = replaceBatchItems({ batchId: batch.id, items: cleanedItems });
    const total_amount = nextItems.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
    const total_count = nextItems.length;

    updateTransferBatch(batch.id, {
      company_bank_account_id: Number(companyAccountId),
      transfer_date: transferDate,
      total_amount,
      total_count,
      status: "confirmed",
      created_by: createdByStaffName.trim() || batch.created_by,
    });

    router.push(`/transfers/${batch.id}`);
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

  if (batch.status === "exported") {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Link href={`/transfers/${batch.id}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                戻る
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                総合振込バッチ編集
              </h1>
              <p className="text-gray-600 mt-1">出力済みのバッチは編集できません</p>
            </div>
          </div>
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <p className="text-gray-700">
                このバッチは「全銀ファイル出力」済みのため、編集不可です。
              </p>
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
          <Link href={`/transfers/${batch.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              総合振込バッチ編集
            </h1>
            <p className="text-gray-600 mt-1">
              {getTransferBatchDisplayNumber(batch)} — バッチ情報と振込明細を編集します
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>総合振込バッチ</CardTitle>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/transfers/${batch.id}`)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    キャンセル
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!canSubmit || payees.length === 0}
                    className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    更新
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div>
                <p className="text-sm font-semibold text-gray-900">バッチ情報</p>
                <p className="text-xs text-gray-500 mt-1">
                  振込元（銀行）・振込指定日・作成担当者を編集できます
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">振込元（銀行）</label>
                  <select
                    className={INPUT}
                    value={companyAccountId}
                    onChange={(e) => setCompanyAccountId(e.target.value)}
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={String(a.id)}>
                        {a.bank_name}（{a.bank_code}/{a.branch_code}）
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">振込指定日</label>
                  <input
                    type="date"
                    className={INPUT}
                    value={transferDate}
                    onChange={(e) => setTransferDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">作成担当者</label>
                  <select
                    className={INPUT}
                    value={createdByStaffName}
                    onChange={(e) => setCreatedByStaffName(e.target.value)}
                    required
                  >
                    {createdByStaffName &&
                      !staff.some((s) => s.name === createdByStaffName) && (
                        <option value={createdByStaffName}>
                          {createdByStaffName}（担当者マスタに未登録）
                        </option>
                      )}
                    {staff.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}（{s.department}）
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">振込明細</p>
                    <p className="text-xs text-gray-500 mt-1">振込先・金額・摘要（カナ）を編集できます</p>
                  </div>
                  <Button type="button" variant="outline" onClick={addRow}>
                    <Plus className="h-4 w-4 mr-2" />
                    明細追加
                  </Button>
                </div>
              </div>

              {payees.length === 0 ? (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
                  振込先が未登録です。先に{" "}
                  <Link href="/payees/new" className="underline">
                    振込先登録
                  </Link>{" "}
                  を行ってください。
                </div>
              ) : (
                <div className="space-y-4">
                  {rows.map((r, idx) => (
                    <div key={idx} className="grid gap-3 md:grid-cols-12 items-end">
                      <div className="md:col-span-5 space-y-2">
                        <label className="text-xs font-medium text-gray-700">振込先</label>
                        <PayeeCombobox
                          payees={payees}
                          value={r.payee_id}
                          onChange={(next) => updateRow(idx, { payee_id: next })}
                          placeholder="振込先名で検索"
                          ariaLabel="振込先を検索して選択"
                        />
                      </div>
                      <div className="md:col-span-3 space-y-2">
                        <label className="text-xs font-medium text-gray-700">金額</label>
                        <input
                          className={INPUT}
                          inputMode="numeric"
                          value={r.amount}
                          onChange={(e) => updateRow(idx, { amount: e.target.value })}
                          placeholder="10000"
                        />
                      </div>
                      <div className="md:col-span-3 space-y-2">
                        <label className="text-xs font-medium text-gray-700">摘要（カナ）</label>
                        <input
                          className={INPUT}
                          value={r.description_kana}
                          onChange={(e) => updateRow(idx, { description_kana: e.target.value })}
                          placeholder="ｶﾞｲﾁｭｳﾋ"
                        />
                      </div>
                      <div className="md:col-span-1 flex justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeRow(idx)}
                          aria-label="明細を削除"
                          disabled={rows.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 pt-4 border-t text-sm text-gray-700">
                <Calculator className="h-4 w-4 text-gray-500" />
                <span className="font-medium tabular-nums">
                  合計 {totals.totalCount}件 / {formatCurrency(totals.totalAmount)}
                </span>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </AppLayout>
  );
}

