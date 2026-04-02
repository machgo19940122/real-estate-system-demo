"use client";

import { useMemo, useState } from "react";
import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Landmark, Pencil, Save, X } from "lucide-react";
import Link from "next/link";
import type { BankAccountType, Payee } from "@/src/data/mock";
import { formatDate } from "@/lib/utils";
import { INSURANCE_DEDUCTION_RATE } from "@/lib/payee-transfer-amount";
import { getPayeeById, updatePayee } from "@/lib/transfer-store";

const INPUT =
  "mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none";

export function PayeeDetailClient({ id }: { id: number }) {
  const initial = getPayeeById(id);
  const [payee, setPayee] = useState<Payee | null>(initial ?? null);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<Payee | null>(initial ?? null);

  const canSave = useMemo(() => {
    if (!draft) return false;
    return (
      draft.name.trim().length > 0 &&
      draft.bank_code.trim().length > 0 &&
      draft.branch_code.trim().length > 0 &&
      draft.account_number.trim().length > 0 &&
      draft.account_name_kana.trim().length > 0
    );
  }, [draft]);

  const startEdit = () => {
    if (!payee) return;
    setDraft(payee);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraft(payee);
    setIsEditing(false);
  };

  const save = () => {
    if (!draft) return;
    const next = updatePayee(id, {
      name: draft.name.trim(),
      bank_code: draft.bank_code.trim(),
      bank_name_kana: draft.bank_name_kana?.trim() || undefined,
      branch_code: draft.branch_code.trim(),
      branch_name_kana: draft.branch_name_kana?.trim() || undefined,
      account_type: draft.account_type as BankAccountType,
      account_number: draft.account_number.trim(),
      account_name_kana: draft.account_name_kana.trim(),
      memo: draft.memo?.trim() || undefined,
      is_active: Boolean(draft.is_active),
      insurance_deduction_enabled: draft.insurance_deduction_enabled || undefined,
    });
    setPayee(next);
    setDraft(next);
    setIsEditing(false);
  };

  if (!payee || !draft) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/payees">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                戻る
              </Button>
            </Link>
          </div>
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <p className="text-gray-700">振込先が見つかりませんでした。</p>
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
          <Link href="/payees">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {payee.name}
            </h1>
            <p className="text-gray-600 mt-1">振込先口座の詳細</p>
          </div>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2">
                <Landmark className="h-5 w-5 text-blue-600" />
                基本情報
              </CardTitle>
              {!isEditing ? (
                <Button onClick={startEdit} variant="outline" size="sm">
                  <Pencil className="h-4 w-4 mr-2" />
                  編集
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button onClick={cancelEdit} variant="outline" size="sm">
                    <X className="h-4 w-4 mr-2" />
                    キャンセル
                  </Button>
                  <Button
                    onClick={save}
                    size="sm"
                    disabled={!canSave}
                    className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    更新
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">支払先名</p>
                {isEditing ? (
                  <input
                    className={INPUT}
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  />
                ) : (
                  <p className="font-medium mt-1">{payee.name}</p>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-500">登録日</p>
                <p className="font-medium mt-1">
                  {payee.created_at ? formatDate(payee.created_at) : "-"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">銀行コード（4桁）</p>
                {isEditing ? (
                  <input
                    className={INPUT}
                    value={draft.bank_code}
                    onChange={(e) => setDraft({ ...draft, bank_code: e.target.value })}
                  />
                ) : (
                  <p className="font-medium mt-1">{payee.bank_code}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">銀行名（カナ）</p>
                {isEditing ? (
                  <input
                    className={INPUT}
                    value={draft.bank_name_kana ?? ""}
                    onChange={(e) => setDraft({ ...draft, bank_name_kana: e.target.value })}
                  />
                ) : (
                  <p className="font-medium mt-1">{payee.bank_name_kana || "-"}</p>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-500">支店コード（3桁）</p>
                {isEditing ? (
                  <input
                    className={INPUT}
                    value={draft.branch_code}
                    onChange={(e) => setDraft({ ...draft, branch_code: e.target.value })}
                  />
                ) : (
                  <p className="font-medium mt-1">{payee.branch_code}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">支店名（カナ）</p>
                {isEditing ? (
                  <input
                    className={INPUT}
                    value={draft.branch_name_kana ?? ""}
                    onChange={(e) => setDraft({ ...draft, branch_name_kana: e.target.value })}
                  />
                ) : (
                  <p className="font-medium mt-1">{payee.branch_name_kana || "-"}</p>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-500">預金種目</p>
                {isEditing ? (
                  <select
                    className={INPUT}
                    value={draft.account_type}
                    onChange={(e) =>
                      setDraft({ ...draft, account_type: e.target.value as BankAccountType })
                    }
                  >
                    <option value="普通">普通</option>
                    <option value="当座">当座</option>
                  </select>
                ) : (
                  <p className="font-medium mt-1">{payee.account_type}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">口座番号</p>
                {isEditing ? (
                  <input
                    className={INPUT}
                    value={draft.account_number}
                    onChange={(e) => setDraft({ ...draft, account_number: e.target.value })}
                  />
                ) : (
                  <p className="font-medium mt-1 tabular-nums">{payee.account_number}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">口座名義（カナ）</p>
                {isEditing ? (
                  <input
                    className={INPUT}
                    value={draft.account_name_kana}
                    onChange={(e) => setDraft({ ...draft, account_name_kana: e.target.value })}
                  />
                ) : (
                  <p className="font-medium mt-1">{payee.account_name_kana}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">メモ</p>
                {isEditing ? (
                  <input
                    className={INPUT}
                    value={draft.memo ?? ""}
                    onChange={(e) => setDraft({ ...draft, memo: e.target.value })}
                  />
                ) : (
                  <p className="font-medium mt-1">{payee.memo || "-"}</p>
                )}
              </div>

              <div className="md:col-span-2 rounded-lg border border-gray-200 bg-gray-50/80 p-4">
                <p className="text-sm text-gray-500 mb-2">
                  保険として差し引いて振り込み（率 {INSURANCE_DEDUCTION_RATE} 固定）
                </p>
                {isEditing ? (
                  <div className="flex items-start gap-2">
                    <input
                      id="insurance_deduction"
                      type="checkbox"
                      checked={Boolean(draft.insurance_deduction_enabled)}
                      onChange={(e) =>
                        setDraft({ ...draft, insurance_deduction_enabled: e.target.checked })
                      }
                      className="mt-1 size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="insurance_deduction" className="text-sm text-gray-800">
                      この振込先で保険として差し引いて振り込みを行う（⌊請求額×率⌋を切り捨て）
                    </label>
                  </div>
                ) : (
                  <p className="font-medium text-gray-900">
                    {payee.insurance_deduction_enabled ? "差引あり" : "差引なし"}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 md:col-span-2">
                <input
                  id="is_active"
                  type="checkbox"
                  checked={draft.is_active}
                  onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })}
                  disabled={!isEditing}
                  className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                />
                <div className="min-w-0">
                  <label htmlFor="is_active" className="text-sm text-gray-700">
                    有効
                  </label>
                  <p className="text-xs text-gray-500 mt-0.5">
                    有効な振込先のみ、総合振込の振込先候補として表示されます。使用しなくなった振込先は有効チェックを外してください。
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

