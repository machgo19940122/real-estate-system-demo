"use client";

import { useMemo, useRef, useState, useEffect, Suspense } from "react";
import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EstimateLineItemsEditor } from "@/components/estimate-line-items-editor";
import {
  customers,
  properties,
  projects,
  estimates,
  staff,
  invoices,
  getStaffById,
  getPropertyById,
} from "@/src/data/mock";
import { nextInvoiceNumber } from "@/lib/invoice-number";
import { useSystemSettings } from "@/lib/use-system-settings";
import { formatTaxRateLabel } from "@/lib/system-settings";
import { EditableFooterTotalsView } from "@/components/editable-footer-totals";
import { formatCurrency } from "@/lib/utils";
import {
  formatProfitMarginRate,
  previewProfitAmountIncludingTax,
  previewProfitMarginRate,
} from "@/lib/invoice-cost-metrics";
import { buildLineItemsFromEstimateItems } from "@/lib/document-line-items";
import { type EstimateLineItemForm } from "@/lib/estimate-units";
import { useEditableFooterTotals } from "@/lib/use-editable-footer-totals";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CustomerCombobox } from "@/components/customer-combobox";
import { InvoicePropertiesEditor } from "@/components/invoice-properties-editor";
import { normalizeInvoicePropertyIds } from "@/lib/invoice-properties";
import { dueDateFromInvoiceDate, todayYmd } from "@/lib/invoice-dates";
import { EstimateSelect } from "@/components/estimate-select";

function NewInvoiceForm() {
  const searchParams = useSearchParams();
  const presetPropertyId = searchParams.get("propertyId") ?? "";
  const presetCustomerId = searchParams.get("customerId") ?? "";
  const presetRevenueCategory = searchParams.get("revenueCategory") ?? "";
  const presetEstimateId = searchParams.get("estimateId");
  const presetStaffId = searchParams.get("staffId") ?? "";
  const presetNote = searchParams.get("note") ?? "";

  const [customerId, setCustomerId] = useState(presetCustomerId);
  const [propertyIds, setPropertyIds] = useState<number[]>(() => {
    const id = Number(presetPropertyId);
    return presetPropertyId && Number.isFinite(id) && id > 0 ? [id] : [];
  });
  const [staffId, setStaffId] = useState(() => {
    if (presetStaffId) return presetStaffId;
    if (presetEstimateId) {
      const est = estimates.find((e) => e.id === Number(presetEstimateId));
      if (est?.staff_id != null) return String(est.staff_id);
    }
    return "";
  });
  const [revenueCategory, setRevenueCategory] = useState(presetRevenueCategory);
  const [note, setNote] = useState(presetNote);
  const [subject, setSubject] = useState("");
  const [items, setItems] = useState<EstimateLineItemForm[]>([]);
  const [costIncludingTaxStr, setCostIncludingTaxStr] = useState("");
  const [estimateIdStr, setEstimateIdStr] = useState(presetEstimateId ?? "");
  const [invoiceDate, setInvoiceDate] = useState(todayYmd);
  const [printInvoiceDate, setPrintInvoiceDate] = useState("");
  const [dueDate, setDueDate] = useState(() => dueDateFromInvoiceDate(todayYmd()));
  const dueDateManualRef = useRef(false);

  const handleInvoiceDateChange = (next: string) => {
    setInvoiceDate(next);
    if (!dueDateManualRef.current && next) {
      setDueDate(dueDateFromInvoiceDate(next));
    }
  };

  const handleDueDateChange = (next: string) => {
    dueDateManualRef.current = true;
    setDueDate(next);
  };

  const applyEstimate = (estimateId: number, fromPreset = false) => {
    const estimate = estimates.find((e) => e.id === estimateId);
    if (!estimate) return;
    setEstimateIdStr(String(estimateId));
    const estProject =
      estimate.project_id != null
        ? projects.find((p) => p.id === estimate.project_id)
        : undefined;
    if (estProject?.property_id != null) {
      setPropertyIds((prev) =>
        normalizeInvoicePropertyIds([...prev, estProject.property_id])
      );
    }
    if (estimate.items && estimate.items.length > 0) {
      setItems(buildLineItemsFromEstimateItems(estimate.items));
    }
    if (estimate.subject?.trim()) {
      setSubject(estimate.subject.trim());
    } else if (estimate.items && estimate.items.length > 0) {
      const firstLine = estimate.items.find((it) => it.name?.trim());
      if (firstLine?.name?.trim()) {
        setSubject(firstLine.name.trim());
      }
    }
    if (estimate.staff_id != null) {
      setStaffId(String(estimate.staff_id));
    }
    if (fromPreset) {
      if (!presetNote.trim() && estimate.note?.trim()) {
        setNote(estimate.note.trim());
      }
      if (!presetRevenueCategory && estimate.revenue_category) {
        setRevenueCategory(estimate.revenue_category);
      }
    }
  };

  useEffect(() => {
    if (!presetEstimateId) return;
    applyEstimate(Number(presetEstimateId), true);
    // 初回の見積プリセットのみ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEstimateChange = (next: string) => {
    setEstimateIdStr(next);
    if (!next) return;
    applyEstimate(Number(next));
  };

  const { settings, taxRateForDate } = useSystemSettings();
  const taxRate = taxRateForDate(invoiceDate);
  const footerTotals = useEditableFooterTotals(items, taxRate, settings.amount_rounding);
  const { subtotal, tax, total } = footerTotals;

  const newFormProfitMargin = useMemo(
    () => previewProfitMarginRate(total, costIncludingTaxStr),
    [total, costIncludingTaxStr]
  );

  const newFormProfitAmount = useMemo(
    () => previewProfitAmountIncludingTax(total, costIncludingTaxStr),
    [total, costIncludingTaxStr]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      alert("顧客を選択してください");
      return;
    }
    const costLine =
      costIncludingTaxStr.trim() !== ""
        ? `\n原価金額（税込）: ${costIncludingTaxStr.trim()}\n利益率: ${formatProfitMarginRate(newFormProfitMargin)}`
        : "";
    const staffLine =
      staffId !== ""
        ? `\n担当者: ${getStaffById(Number(staffId))?.name ?? staffId}`
        : "\n担当者: （未選択）";
    const linked = estimateIdStr
      ? estimates.find((e) => e.id === Number(estimateIdStr))
      : undefined;
    const estimateLine = linked
      ? `\n関連見積: ${linked.estimate_number}`
      : "";
    const propertyLine =
      propertyIds.length > 0
        ? `\n物件: ${propertyIds
            .map((id) => getPropertyById(id)?.name ?? String(id))
            .join("、")}`
        : "";
    alert(
      "新規請求登録機能（ダミー）\n請求番号: " +
        nextInvoiceNumber(invoices) +
        "\n請求日: " +
        (invoiceDate || "-") +
        (printInvoiceDate.trim()
          ? "\n印刷請求日: " + printInvoiceDate.trim()
          : "") +
        "\n支払期限: " +
        (dueDate || "-") +
        "\n件名: " +
        (subject.trim() || "-") +
        "\n備考: " +
        (note.trim() || "-") +
        staffLine +
        estimateLine +
        propertyLine +
        "\n請求明細行数: " +
        items.length +
        costLine
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/invoices">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              新規請求登録
            </h1>
            <p className="text-gray-600 mt-1">新しい請求情報を登録します</p>
          </div>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b">
            <CardTitle>請求情報</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-4">
                <div className="space-y-2 md:col-span-1">
                  <label htmlFor="customer" className="text-sm font-medium text-gray-700">
                    顧客 <span className="text-red-500">*</span>
                  </label>
                  <CustomerCombobox customers={customers} value={customerId} onChange={setCustomerId} />
                </div>

                <div className="space-y-2 md:col-span-1">
                  <label htmlFor="status" className="text-sm font-medium text-gray-700">
                    ステータス <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="status"
                    name="status"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                    defaultValue="無し"
                  >
                    <option value="有">黄色有</option>
                    <option value="無し">黄色無し</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-1">
                  <label
                    htmlFor="revenue_category"
                    className="text-sm font-medium text-gray-700"
                  >
                    区分 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="revenue_category"
                    name="revenue_category"
                    required
                    value={revenueCategory}
                    onChange={(e) => setRevenueCategory(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                  >
                    <option value="">選択してください</option>
                    <option value="注文">注文</option>
                    <option value="建売">建売</option>
                    <option value="リフォーム">リフォーム</option>
                    <option value="土地">土地</option>
                    <option value="仲介料">仲介料</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-1">
                  <label htmlFor="staff" className="text-sm font-medium text-gray-700">
                    担当者
                  </label>
                  <select
                    id="staff"
                    name="staff_id"
                    value={staffId}
                    onChange={(e) => setStaffId(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                  >
                    <option value="">選択してください</option>
                    {staff.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 md:col-span-1">
                  <label htmlFor="invoice_date" className="text-sm font-medium text-gray-700">
                    請求日 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="invoice_date"
                    type="date"
                    required
                    value={invoiceDate}
                    onChange={(e) => handleInvoiceDateChange(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                  />
                </div>

                <div className="space-y-2 md:col-span-1">
                  <label htmlFor="print_invoice_date" className="text-sm font-medium text-gray-700">
                    印刷請求日
                  </label>
                  <input
                    id="print_invoice_date"
                    type="date"
                    value={printInvoiceDate}
                    onChange={(e) => setPrintInvoiceDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                  />
                  <p className="text-[11px] text-gray-500">
                    印刷請求日に値がある場合、請求書にはこちらの日付を優先して表示します。未入力の場合は請求日を使用します。
                  </p>
                </div>

                <div className="space-y-2 md:col-span-1">
                  <label htmlFor="due_date" className="text-sm font-medium text-gray-700">
                    支払期限 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="due_date"
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => handleDueDateChange(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                  />
                  <p className="text-[11px] text-gray-500">
                    請求日から3週間後を自動入力します。変更した場合はその値を保持します。
                  </p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">物件（任意・複数可）</label>
                  <InvoicePropertiesEditor
                    properties={properties}
                    value={propertyIds}
                    onChange={setPropertyIds}
                    customerId={customerId ? Number(customerId) : undefined}
                  />
                </div>

                <div className="space-y-2 md:col-span-1">
                  <label htmlFor="estimate_id" className="text-sm font-medium text-gray-700">
                    関連見積（任意）
                  </label>
                  <EstimateSelect
                    estimates={estimates}
                    projects={projects}
                    customers={customers}
                    value={estimateIdStr}
                    onChange={handleEstimateChange}
                    customerId={customerId || undefined}
                  />
                </div>
              </div>

              <div className="space-y-2 border-t pt-4">
                <label htmlFor="invoice_subject" className="text-sm font-medium text-gray-700">
                  件名
                </label>
                <input
                  id="invoice_subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="請求書の件名を入力"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">備考</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="備考を入力"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                />
              </div>

              <div className="space-y-3 border-t pt-4">
                <h2 className="text-sm font-semibold text-gray-700">請求明細</h2>
                <EstimateLineItemsEditor items={items} onChange={setItems} minRows={0} />

                {items.length > 0 && (
                  <div className="mt-6 max-w-sm ml-auto p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <EditableFooterTotalsView
                      items={items}
                      totals={footerTotals}
                      className="space-y-2"
                      labels={{
                        subtotal: "請求税抜き合計",
                        tax: formatTaxRateLabel(taxRate),
                        total: "請求合計",
                      }}
                    />
                    <div className="pt-4 mt-2 border-t border-gray-200 space-y-3">
                      <div className="space-y-1">
                        <label
                          htmlFor="cost_ex_tax"
                          className="text-sm font-medium text-gray-700"
                        >
                          原価金額（税込）
                        </label>
                        <input
                          id="cost_ex_tax"
                          type="text"
                          inputMode="numeric"
                          value={costIncludingTaxStr}
                          onChange={(e) => setCostIncludingTaxStr(e.target.value)}
                          placeholder="未入力可"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white tabular-nums"
                        />
                        <p className="text-[11px] text-gray-500">
                          請求合計（税込）に対する原価。入力すると利益額・利益率を表示します。
                        </p>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">利益額（税込）</span>
                        <span className="font-medium tabular-nums">
                          {newFormProfitAmount != null ? formatCurrency(newFormProfitAmount) : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">利益率</span>
                        <span className="font-medium tabular-nums">
                          {formatProfitMarginRate(newFormProfitMargin)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Link href="/invoices">
                  <Button type="button" variant="outline">
                    キャンセル
                  </Button>
                </Link>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
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

export default function NewInvoicePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      }
    >
      <NewInvoiceForm />
    </Suspense>
  );
}
