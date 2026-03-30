"use client";

import { useMemo, useState } from "react";
import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BankAccountType } from "@/src/data/mock";
import { INSURANCE_DEDUCTION_RATE } from "@/lib/payee-transfer-amount";
import { getPayeeById, updatePayee } from "@/lib/transfer-store";

const INPUT =
  "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white";

export function PayeeEditClient({ id }: { id: number }) {
  const router = useRouter();
  const initial = getPayeeById(id);

  const [name, setName] = useState(initial?.name ?? "");
  const [bankCode, setBankCode] = useState(initial?.bank_code ?? "");
  const [bankNameKana, setBankNameKana] = useState(initial?.bank_name_kana ?? "");
  const [branchCode, setBranchCode] = useState(initial?.branch_code ?? "");
  const [branchNameKana, setBranchNameKana] = useState(initial?.branch_name_kana ?? "");
  const [accountType, setAccountType] = useState<BankAccountType>(initial?.account_type ?? "普通");
  const [accountNumber, setAccountNumber] = useState(initial?.account_number ?? "");
  const [accountNameKana, setAccountNameKana] = useState(initial?.account_name_kana ?? "");
  const [memo, setMemo] = useState(initial?.memo ?? "");
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [insuranceDeductionEnabled, setInsuranceDeductionEnabled] = useState(
    Boolean(initial?.insurance_deduction_enabled)
  );

  const canSubmit = useMemo(() => {
    const hasRequired =
      name.trim().length > 0 &&
      bankCode.trim().length > 0 &&
      branchCode.trim().length > 0 &&
      accountNumber.trim().length > 0 &&
      accountNameKana.trim().length > 0;
    return hasRequired;
  }, [name, bankCode, branchCode, accountNumber, accountNameKana]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    updatePayee(id, {
      name: name.trim(),
      bank_code: bankCode.trim(),
      bank_name_kana: bankNameKana.trim() || undefined,
      branch_code: branchCode.trim(),
      branch_name_kana: branchNameKana.trim() || undefined,
      account_type: accountType,
      account_number: accountNumber.trim(),
      account_name_kana: accountNameKana.trim(),
      memo: memo.trim() || undefined,
      is_active: isActive,
      insurance_deduction_enabled: insuranceDeductionEnabled || undefined,
    });
    router.push("/payees");
  };

  if (!initial) {
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
              振込先編集
            </h1>
            <p className="text-gray-600 mt-1">振込先口座情報を編集します</p>
          </div>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b">
            <CardTitle>振込先情報</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">
                    支払先名 <span className="text-red-500">*</span>
                  </label>
                  <input className={INPUT} value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    銀行コード（4桁） <span className="text-red-500">*</span>
                  </label>
                  <input className={INPUT} value={bankCode} onChange={(e) => setBankCode(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">銀行名（カナ）</label>
                  <input className={INPUT} value={bankNameKana} onChange={(e) => setBankNameKana(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    支店コード（3桁） <span className="text-red-500">*</span>
                  </label>
                  <input className={INPUT} value={branchCode} onChange={(e) => setBranchCode(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">支店名（カナ）</label>
                  <input className={INPUT} value={branchNameKana} onChange={(e) => setBranchNameKana(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    預金種目 <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={INPUT}
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value as BankAccountType)}
                  >
                    <option value="普通">普通</option>
                    <option value="当座">当座</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    口座番号（7桁） <span className="text-red-500">*</span>
                  </label>
                  <input
                    className={INPUT}
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">
                    口座名義（カナ） <span className="text-red-500">*</span>
                  </label>
                  <input
                    className={INPUT}
                    value={accountNameKana}
                    onChange={(e) => setAccountNameKana(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">メモ</label>
                  <input className={INPUT} value={memo} onChange={(e) => setMemo(e.target.value)} />
                </div>

                <div className="md:col-span-2 rounded-lg border border-gray-200 bg-gray-50/80 p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <input
                      id="insurance_deduction"
                      type="checkbox"
                      checked={insuranceDeductionEnabled}
                      onChange={(e) => setInsuranceDeductionEnabled(e.target.checked)}
                      className="mt-1 size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="min-w-0">
                      <label htmlFor="insurance_deduction" className="text-sm font-medium text-gray-800">
                        保険として差し引いて振り込み
                      </label>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                        ⌊請求額×{INSURANCE_DEDUCTION_RATE}⌋（切り捨て）を保険として差し引いて振り込む場合のみチェックしてください。率は固定です。
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:col-span-2">
                  <input
                    id="is_active"
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="is_active" className="text-sm text-gray-700">
                    有効
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                  <Link href="/payees">
                    <Button type="button" variant="outline">
                      キャンセル
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={!canSubmit}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    保存
                  </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

