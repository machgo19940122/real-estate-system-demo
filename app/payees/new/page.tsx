"use client";

import { useMemo, useState } from "react";
import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addPayee } from "@/lib/transfer-store";
import type { BankAccountType } from "@/src/data/mock";

const INPUT =
  "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all";

export default function NewPayeePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [bankNameKana, setBankNameKana] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [branchNameKana, setBranchNameKana] = useState("");
  const [accountType, setAccountType] = useState<BankAccountType>("普通");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountNameKana, setAccountNameKana] = useState("");
  const [memo, setMemo] = useState("");

  const canSubmit = useMemo(() => {
    const hasRequired =
      name.trim().length > 0 &&
      bankCode.trim().length > 0 &&
      branchCode.trim().length > 0 &&
      accountNumber.trim().length > 0 &&
      accountNameKana.trim().length > 0;
    return hasRequired;
  }, [name, bankCode, branchCode, accountNumber, accountNameKana]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    addPayee({
      name: name.trim(),
      bank_code: bankCode.trim(),
      bank_name_kana: bankNameKana.trim() || undefined,
      branch_code: branchCode.trim(),
      branch_name_kana: branchNameKana.trim() || undefined,
      account_type: accountType,
      account_number: accountNumber.trim(),
      account_name_kana: accountNameKana.trim(),
      memo: memo.trim() || undefined,
    });

    router.push("/payees");
  };

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
              振込先登録
            </h1>
            <p className="text-gray-600 mt-1">総合振込（全銀）で使用する振込先口座を登録します</p>
          </div>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b">
            <CardTitle>振込先情報</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">
                    支払先名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    className={INPUT}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="株式会社 建設丸"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    銀行コード（4桁） <span className="text-red-500">*</span>
                  </label>
                  <input
                    className={INPUT}
                    value={bankCode}
                    onChange={(e) => setBankCode(e.target.value)}
                    placeholder="0177"
                    inputMode="numeric"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">銀行名（カナ）</label>
                  <input
                    className={INPUT}
                    value={bankNameKana}
                    onChange={(e) => setBankNameKana(e.target.value)}
                    placeholder="ﾌｸｵｶ"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    支店コード（3桁） <span className="text-red-500">*</span>
                  </label>
                  <input
                    className={INPUT}
                    value={branchCode}
                    onChange={(e) => setBranchCode(e.target.value)}
                    placeholder="001"
                    inputMode="numeric"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">支店名（カナ）</label>
                  <input
                    className={INPUT}
                    value={branchNameKana}
                    onChange={(e) => setBranchNameKana(e.target.value)}
                    placeholder="ﾎﾝﾃﾝ"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    預金種目 <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={INPUT + " bg-white"}
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
                    placeholder="1234567"
                    inputMode="numeric"
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
                    placeholder="ｶﾌﾞ)ｹﾝｾﾂﾏﾙ"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    全銀出力では半角カナ前提です（デモのため自動変換は省略しています）。
                  </p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">メモ</label>
                  <input
                    className={INPUT}
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="材料費、外注費 など"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
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
                  <Plus className="h-4 w-4 mr-2" />
                  登録する
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

