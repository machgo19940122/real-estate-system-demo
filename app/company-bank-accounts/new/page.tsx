"use client";

import { useMemo, useState } from "react";
import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addCompanyBankAccount } from "@/lib/transfer-store";
import { type BankAccountType } from "@/src/data/mock";

const INPUT =
  "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white";

export default function NewCompanyBankAccountPage() {
  const router = useRouter();
  const [bank_name, setBankName] = useState("");
  const [bank_code, setBankCode] = useState("");
  const [bank_name_kana, setBankNameKana] = useState("");
  const [branch_code, setBranchCode] = useState("");
  const [branch_name_kana, setBranchNameKana] = useState("");
  const [account_type, setAccountType] = useState<BankAccountType>("普通");
  const [account_number, setAccountNumber] = useState("");
  const [account_name_kana, setAccountNameKana] = useState("");
  const [client_code, setClientCode] = useState("");

  const canSave = useMemo(() => {
    return (
      bank_name.trim().length > 0 &&
      bank_code.trim().length > 0 &&
      branch_code.trim().length > 0 &&
      account_number.trim().length > 0 &&
      account_name_kana.trim().length > 0 &&
      client_code.trim().length > 0
    );
  }, [bank_name, bank_code, branch_code, account_number, account_name_kana, client_code]);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;

    const created = addCompanyBankAccount({
      bank_name: bank_name.trim(),
      bank_code: bank_code.trim(),
      bank_name_kana: bank_name_kana.trim() || undefined,
      branch_code: branch_code.trim(),
      branch_name_kana: branch_name_kana.trim() || undefined,
      account_type,
      account_number: account_number.trim(),
      account_name_kana: account_name_kana.trim(),
      client_code: client_code.trim(),
    });

    router.push(`/company-bank-accounts/${created.id}`);
  };

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
              振込元口座登録
            </h1>
            <p className="text-gray-600 mt-1">自社口座を登録します（全銀出力で使用）</p>
          </div>
        </div>

        <form onSubmit={save} className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b">
              <CardTitle>口座情報</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">銀行名</label>
                  <input className={INPUT} value={bank_name} onChange={(e) => setBankName(e.target.value)} placeholder="西日本シティ銀行" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">銀行コード（4桁）</label>
                  <input className={INPUT} value={bank_code} onChange={(e) => setBankCode(e.target.value)} placeholder="0190" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">銀行名（カナ）</label>
                  <input className={INPUT} value={bank_name_kana} onChange={(e) => setBankNameKana(e.target.value)} placeholder="ﾆｼﾆﾎﾝｼﾃｲ" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">支店コード（3桁）</label>
                  <input className={INPUT} value={branch_code} onChange={(e) => setBranchCode(e.target.value)} placeholder="101" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">支店名（カナ）</label>
                  <input className={INPUT} value={branch_name_kana} onChange={(e) => setBranchNameKana(e.target.value)} placeholder="ﾃﾝｼﾞﾝ" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">口座種別</label>
                  <select className={INPUT} value={account_type} onChange={(e) => setAccountType(e.target.value as BankAccountType)}>
                    <option value="普通">普通</option>
                    <option value="当座">当座</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">口座番号（7桁）</label>
                  <input className={INPUT} value={account_number} onChange={(e) => setAccountNumber(e.target.value)} placeholder="7654321" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">口座名義（カナ）</label>
                  <input className={INPUT} value={account_name_kana} onChange={(e) => setAccountNameKana(e.target.value)} placeholder="ｶﾌﾞ)ﾃﾞﾓﾌﾄﾞｳｻﾝ" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">委託者コード（10桁）</label>
                  <input className={INPUT} value={client_code} onChange={(e) => setClientCode(e.target.value)} placeholder="0007654321" />
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t">
                <Button
                  type="submit"
                  disabled={!canSave}
                  className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                >
                  <Save className="h-4 w-4 mr-2" />
                  登録
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </AppLayout>
  );
}

