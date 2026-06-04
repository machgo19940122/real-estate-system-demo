"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout";
import { TaxRatesEditor } from "@/components/tax-rates-editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Save, RotateCcw } from "lucide-react";
import {
  AMOUNT_ROUNDING_OPTIONS,
  DEFAULT_SYSTEM_SETTINGS,
  applyAmountRounding,
  formatRoundingModeLabel,
  formatTaxRatePercent,
  getFiscalPeriodRangeForDate,
  getTaxRateForDate,
  loadSystemSettings,
  normalizeTaxRates,
  saveSystemSettings,
  validateTaxRates,
  type SystemSettings,
} from "@/lib/system-settings";
import { todayYmd } from "@/lib/invoice-dates";
import { formatInvoiceNumber } from "@/lib/invoice-number";
import { formatDate } from "@/lib/utils";

export default function SystemSettingsPage() {
  const [form, setForm] = useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    setForm(loadSystemSettings());
  }, []);

  const handleSave = () => {
    const next: SystemSettings = {
      ...form,
      tax_rates: normalizeTaxRates(form.tax_rates),
    };
    const taxError = validateTaxRates(next.tax_rates);
    if (taxError) {
      alert(taxError);
      return;
    }
    const saved = saveSystemSettings(next);
    setForm(saved);
    setSavedMessage("設定を保存しました");
    setTimeout(() => setSavedMessage(null), 3000);
  };

  const handleReset = () => {
    if (!window.confirm("システム設定を初期値に戻しますか？")) return;
    const saved = saveSystemSettings(DEFAULT_SYSTEM_SETTINGS);
    setForm(saved);
    setSavedMessage("初期値に戻しました");
    setTimeout(() => setSavedMessage(null), 3000);
  };

  const today = todayYmd();
  const previewRate = getTaxRateForDate(today, form);
  const periodRange = getFiscalPeriodRangeForDate(today, form);
  const previewTaxSample = applyAmountRounding(10000 * previewRate, form.amount_rounding);

  return (
    <AppLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent flex items-center gap-3">
            <Settings className="h-9 w-9 text-blue-600" />
            システム設定
          </h1>
          <p className="text-gray-600 mt-2">
            消費税率・会計期など、システム全体の基準値を管理します（デモではブラウザに保存）。
          </p>
        </div>

        {savedMessage && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
            {savedMessage}
          </p>
        )}

        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="text-lg">消費税</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <p className="text-sm text-gray-600">
              見積・請求の税額に使用します。請求日などの対象日に対し、その日以前で最も新しい適用開始日の税率を使います（例: 2027-01-01 から 5% なら、その日以降の請求は 5%）。
            </p>
            <TaxRatesEditor
              rates={form.tax_rates}
              onChange={(tax_rates) => setForm((f) => ({ ...f, tax_rates }))}
            />
            <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
              本日（{today}）の適用税率: <strong>{formatTaxRatePercent(previewRate)}%</strong>
              ／ 税抜10,000円の税額例:{" "}
              <strong>{previewTaxSample.toLocaleString()}円</strong>（
              {formatRoundingModeLabel(form.amount_rounding)}）
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="text-lg">端数処理</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm text-gray-600">
              見積・請求の消費税額など、計算結果の円未満の処理方法です。
            </p>
            <div className="space-y-2 max-w-md">
              <label htmlFor="amount_rounding" className="text-sm font-medium text-gray-700">
                税額・金額の端数処理
              </label>
              <select
                id="amount_rounding"
                value={form.amount_rounding}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    amount_rounding: e.target.value as SystemSettings["amount_rounding"],
                  }))
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
              >
                {AMOUNT_ROUNDING_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="text-lg">会社情報</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <p className="text-sm text-gray-600">
              請求書・見積書の印字に使用する自社情報です。
            </p>
            <div className="space-y-2">
              <label htmlFor="company_name" className="text-sm font-medium text-gray-700">
                社名
              </label>
              <input
                id="company_name"
                type="text"
                value={form.company_name}
                onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))}
                placeholder="株式会社〇〇"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="company_address" className="text-sm font-medium text-gray-700">
                住所
              </label>
              <textarea
                id="company_address"
                value={form.company_address}
                onChange={(e) => setForm((f) => ({ ...f, company_address: e.target.value }))}
                rows={2}
                placeholder="都道府県・市区町村・番地"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white resize-y"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="representative_name" className="text-sm font-medium text-gray-700">
                代表者名
              </label>
              <input
                id="representative_name"
                type="text"
                value={form.representative_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, representative_name: e.target.value }))
                }
                placeholder="代表取締役 〇〇 〇〇"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="text-lg">会計期・請求番号</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <p className="text-sm text-gray-600">
              「基準となる期」と「その開始日」を一度だけ登録すれば、毎年の期切替日から会計期を自動計算します。
            </p>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="period_anchor_number" className="text-sm font-medium text-gray-700">
                  基準となる期
                </label>
                <input
                  id="period_anchor_number"
                  type="number"
                  min={1}
                  max={99}
                  value={form.period_anchor_number}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      period_anchor_number: Math.floor(Number(e.target.value) || 1),
                    }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="period_anchor_start" className="text-sm font-medium text-gray-700">
                  その期の開始日
                </label>
                <input
                  id="period_anchor_start"
                  type="date"
                  value={form.period_anchor_start}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, period_anchor_start: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <span className="text-sm font-medium text-gray-700">毎年の期切替（期首）</span>
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={form.fiscal_year_start_month}
                    onChange={(e) => {
                      const month = Number(e.target.value);
                      setForm((f) => ({
                        ...f,
                        fiscal_year_start_month: month,
                        fiscal_year_start_day: Math.min(
                          f.fiscal_year_start_day,
                          new Date(2024, month, 0).getDate()
                        ),
                      }));
                    }}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    aria-label="期切替月"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>
                        {m}月
                      </option>
                    ))}
                  </select>
                  <select
                    value={form.fiscal_year_start_day}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        fiscal_year_start_day: Number(e.target.value),
                      }))
                    }
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    aria-label="期切替日"
                  >
                    {Array.from(
                      { length: new Date(2024, form.fiscal_year_start_month, 0).getDate() },
                      (_, i) => i + 1
                    ).map((d) => (
                      <option key={d} value={d}>
                        {d}日
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-600 bg-blue-50/60 rounded-lg px-4 py-3 border border-blue-100 space-y-1.5">
              <p>
                本日の会計期: <strong>{periodRange.period}期</strong>（
                {formatDate(periodRange.start)} 〜 {formatDate(periodRange.end)}）
              </p>
              <p>
                次期開始: {formatDate(periodRange.nextStart)} / 採番例:{" "}
                {formatInvoiceNumber(periodRange.period, 1)}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            保存
          </Button>
          <Button type="button" variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            初期値に戻す
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
