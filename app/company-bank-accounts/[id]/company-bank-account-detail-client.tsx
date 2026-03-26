"use client";

import { useMemo, useState } from "react";
import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Save, X, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  deleteCompanyBankAccount,
  getCompanyBankAccountById,
  updateCompanyBankAccount,
} from "@/lib/transfer-store";
import { type BankAccountType, type CompanyBankAccount } from "@/src/data/mock";

const INPUT =
  "mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white";

export function CompanyBankAccountDetailClient({ id }: { id: number }) {
  const router = useRouter();
  const [account, setAccount] = useState<CompanyBankAccount | undefined>(() => getCompanyBankAccountById(id));
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<CompanyBankAccount | undefined>(account);

  const canSave = useMemo(() => {
    if (!draft) return false;
    return (
      draft.bank_name.trim().length > 0 &&
      draft.bank_code.trim().length > 0 &&
      draft.branch_code.trim().length > 0 &&
      draft.account_number.trim().length > 0 &&
      draft.account_name_kana.trim().length > 0 &&
      draft.client_code.trim().length > 0
    );
  }, [draft]);

  const startEdit = () => {
    setDraft(account);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraft(account);
    setIsEditing(false);
  };

  const refresh = () => {
    setAccount(getCompanyBankAccountById(id));
  };

  const save = () => {
    if (!draft) return;
    const next = updateCompanyBankAccount(id, {
      bank_name: draft.bank_name.trim(),
      bank_code: draft.bank_code.trim(),
      bank_name_kana: draft.bank_name_kana?.trim() || undefined,
      branch_code: draft.branch_code.trim(),
      branch_name_kana: draft.branch_name_kana?.trim() || undefined,
      account_type: draft.account_type,
      account_number: draft.account_number.trim(),
      account_name_kana: draft.account_name_kana.trim(),
      client_code: draft.client_code.trim(),
    });
    setAccount(next);
    setDraft(next);
    setIsEditing(false);
    alert("振込元口座を更新しました（デモ / 保存処理は未実装）");
  };

  const remove = () => {
    if (!account) return;
    const ok = confirm("この口座を削除しますか？（デモ）");
    if (!ok) return;
    deleteCompanyBankAccount(account.id);
    router.push("/company-bank-accounts");
  };

  if (!account) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/company-bank-accounts">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                戻る
              </Button>
            </Link>
          </div>
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <p className="text-gray-700">口座が見つかりませんでした。</p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const view = isEditing ? draft! : account;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/company-bank-accounts">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              振込元口座詳細
            </h1>
            <p className="text-gray-600 mt-1">
              {account.bank_name}（{account.bank_code}） / {account.branch_code}
            </p>
          </div>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between gap-3">
              <CardTitle>口座情報</CardTitle>
              {!isEditing ? (
                <div className="flex items-center gap-2">
                  <Button onClick={startEdit} variant="outline" size="sm">
                    <Pencil className="h-4 w-4 mr-2" />
                    編集
                  </Button>
                  <Button onClick={remove} variant="outline" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    削除
                  </Button>
                </div>
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
                <p className="text-sm text-gray-500">銀行名</p>
                {isEditing ? (
                  <input
                    className={INPUT}
                    value={view.bank_name}
                    onChange={(e) => setDraft((prev) => ({ ...(prev as CompanyBankAccount), bank_name: e.target.value }))}
                  />
                ) : (
                  <p className="font-medium">{view.bank_name}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">銀行コード</p>
                {isEditing ? (
                  <input
                    className={INPUT}
                    value={view.bank_code}
                    onChange={(e) => setDraft((prev) => ({ ...(prev as CompanyBankAccount), bank_code: e.target.value }))}
                  />
                ) : (
                  <p className="font-medium tabular-nums">{view.bank_code}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">銀行名（カナ）</p>
                {isEditing ? (
                  <input
                    className={INPUT}
                    value={view.bank_name_kana ?? ""}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...(prev as CompanyBankAccount), bank_name_kana: e.target.value }))
                    }
                  />
                ) : (
                  <p className="font-medium">{view.bank_name_kana || "-"}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">支店コード</p>
                {isEditing ? (
                  <input
                    className={INPUT}
                    value={view.branch_code}
                    onChange={(e) => setDraft((prev) => ({ ...(prev as CompanyBankAccount), branch_code: e.target.value }))}
                  />
                ) : (
                  <p className="font-medium tabular-nums">{view.branch_code}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">支店名（カナ）</p>
                {isEditing ? (
                  <input
                    className={INPUT}
                    value={view.branch_name_kana ?? ""}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...(prev as CompanyBankAccount), branch_name_kana: e.target.value }))
                    }
                  />
                ) : (
                  <p className="font-medium">{view.branch_name_kana || "-"}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">口座種別</p>
                {isEditing ? (
                  <select
                    className={INPUT}
                    value={view.account_type}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...(prev as CompanyBankAccount), account_type: e.target.value as BankAccountType }))
                    }
                  >
                    <option value="普通">普通</option>
                    <option value="当座">当座</option>
                  </select>
                ) : (
                  <p className="font-medium">{view.account_type}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">口座番号</p>
                {isEditing ? (
                  <input
                    className={INPUT}
                    value={view.account_number}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...(prev as CompanyBankAccount), account_number: e.target.value }))
                    }
                  />
                ) : (
                  <p className="font-medium tabular-nums">{view.account_number}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">口座名義（カナ）</p>
                {isEditing ? (
                  <input
                    className={INPUT}
                    value={view.account_name_kana}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...(prev as CompanyBankAccount), account_name_kana: e.target.value }))
                    }
                  />
                ) : (
                  <p className="font-medium">{view.account_name_kana}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">委託者コード</p>
                {isEditing ? (
                  <input
                    className={INPUT}
                    value={view.client_code}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...(prev as CompanyBankAccount), client_code: e.target.value }))
                    }
                  />
                ) : (
                  <p className="font-medium tabular-nums">{view.client_code}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

