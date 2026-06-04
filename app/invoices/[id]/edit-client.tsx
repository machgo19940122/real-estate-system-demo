"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EstimateLineItemsEditor } from "@/components/estimate-line-items-editor";
import { DocumentLineItemsReadonlyTable } from "@/components/document-line-items-readonly";
import {
  EditableFooterTotalsView,
  FooterTotalsReadonly,
} from "@/components/editable-footer-totals";
import { Save, X, Pencil, Receipt, AlertCircle } from "lucide-react";
import { formatCurrency, formatDate, getPaymentStatusChipClassName } from "@/lib/utils";
import {
  formToInvoiceItem,
  persistedLineToForm,
} from "@/lib/document-line-items";
import { calcEstimateTaxableSubtotal, type EstimateLineItemForm } from "@/lib/estimate-units";
import { useEditableFooterTotals } from "@/lib/use-editable-footer-totals";
import {
  getBillingAddresseeName,
  getInvoiceBillingAddresseeDisplayName,
} from "@/lib/customer-billing";
import {
  type Customer,
  type Invoice,
  type RevenueCategory,
  type PaymentStatus,
  customers,
  estimates,
  projects,
  updateInvoice,
} from "@/src/data/mock";
import { EstimateSelect } from "@/components/estimate-select";
import {
  formatProfitMarginRate,
  invoiceCostPatchFromForm,
  invoiceCostIncludingTaxForDisplay,
  invoiceProfitAmountIncludingTaxForDisplay,
  previewProfitMarginRate,
  previewProfitAmountIncludingTax,
} from "@/lib/invoice-cost-metrics";
import { InvoiceCostAmountHint } from "@/components/invoice-cost-amount-hint";
import { InvoiceRelatedEstimate } from "@/components/invoice-related-estimate";
import { InvoicePdfClient } from "./pdf-client";
import { ReceiptClient } from "./receipt-client";

const TAX_RATE = 0.1;

export function InvoiceEditClient({
  initialInvoice,
  customer,
  customerName,
  propertyName,
  relatedEstimateId,
  relatedEstimateNumber,
  paymentStatus,
  totalPaid,
  isOverdue,
}: {
  initialInvoice: Invoice;
  customer?: Customer;
  customerName?: string;
  propertyName?: string;
  relatedEstimateId?: number;
  relatedEstimateNumber?: string;
  paymentStatus: PaymentStatus;
  totalPaid: number;
  isOverdue?: boolean;
}) {
  const [invoice, setInvoice] = useState<Invoice>(initialInvoice);
  const [isEditing, setIsEditing] = useState(false);

  const [draftDueDate, setDraftDueDate] = useState(initialInvoice.due_date);
  const [draftCategory, setDraftCategory] = useState<RevenueCategory | "">(
    (initialInvoice.revenue_category as RevenueCategory | undefined) ?? ""
  );
  const [draftManualStatus, setDraftManualStatus] = useState<"有" | "無し">(initialInvoice.status);
  const [draftNote, setDraftNote] = useState(initialInvoice.note ?? "");
  const [draftItems, setDraftItems] = useState<EstimateLineItemForm[]>(
    initialInvoice.items?.map(persistedLineToForm) ?? []
  );
  const [draftCostStr, setDraftCostStr] = useState(() =>
    initialInvoice.cost_amount_including_tax != null
      ? String(initialInvoice.cost_amount_including_tax)
      : ""
  );
  const [draftEstimateIdStr, setDraftEstimateIdStr] = useState(
    initialInvoice.estimate_id != null ? String(initialInvoice.estimate_id) : ""
  );
  const [draftBillingAddresseeName, setDraftBillingAddresseeName] = useState(
    initialInvoice.billing_addressee_name ?? ""
  );
  const [draftSubject, setDraftSubject] = useState(initialInvoice.subject ?? "");

  const footerTotals = useEditableFooterTotals(draftItems);
  const { subtotal, tax, total } = footerTotals;

  const { viewSubtotal, viewTax, viewTotal } = useMemo(() => {
    const forms = (invoice.items ?? []).map(persistedLineToForm);
    const sub = calcEstimateTaxableSubtotal(forms);
    const taxAmount = Math.floor(sub * TAX_RATE);
    return { viewSubtotal: sub, viewTax: taxAmount, viewTotal: sub + taxAmount };
  }, [invoice.items]);

  const editProfitMarginPreview = useMemo(
    () => previewProfitMarginRate(total, draftCostStr),
    [total, draftCostStr]
  );

  const editProfitAmountPreview = useMemo(
    () => previewProfitAmountIncludingTax(total, draftCostStr),
    [total, draftCostStr]
  );

  const viewProfitMarginRate = useMemo(() => {
    if (invoice.profit_margin_rate != null) return invoice.profit_margin_rate;
    const c = invoiceCostIncludingTaxForDisplay(invoice);
    if (c != null && invoice.amount > 0) return (invoice.amount - c) / invoice.amount;
    return undefined;
  }, [invoice, invoice.profit_margin_rate]);

  const viewProfitAmount = useMemo(() => {
    return invoiceProfitAmountIncludingTaxForDisplay(invoice);
  }, [invoice]);

  const startEdit = () => {
    setDraftDueDate(invoice.due_date);
    setDraftCategory((invoice.revenue_category as RevenueCategory | undefined) ?? "");
    setDraftManualStatus(invoice.status);
    setDraftNote(invoice.note ?? "");
    setDraftItems(invoice.items?.map(persistedLineToForm) ?? []);
    setDraftCostStr(
      invoice.cost_amount_including_tax != null ? String(invoice.cost_amount_including_tax) : ""
    );
    setDraftEstimateIdStr(
      invoice.estimate_id != null ? String(invoice.estimate_id) : ""
    );
    setDraftBillingAddresseeName(invoice.billing_addressee_name ?? "");
    setDraftSubject(invoice.subject ?? "");
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraftDueDate(invoice.due_date);
    setDraftCategory((invoice.revenue_category as RevenueCategory | undefined) ?? "");
    setDraftManualStatus(invoice.status);
    setDraftNote(invoice.note ?? "");
    setDraftItems(invoice.items?.map(persistedLineToForm) ?? []);
    setDraftCostStr(
      invoice.cost_amount_including_tax != null ? String(invoice.cost_amount_including_tax) : ""
    );
    setDraftEstimateIdStr(
      invoice.estimate_id != null ? String(invoice.estimate_id) : ""
    );
    setDraftBillingAddresseeName(invoice.billing_addressee_name ?? "");
    setDraftSubject(invoice.subject ?? "");
    setIsEditing(false);
  };

  const customerBillingFallback = getBillingAddresseeName(customer) || customerName || "—";

  const save = () => {
    const items = draftItems.map(formToInvoiceItem);
    const costPatch = invoiceCostPatchFromForm(
      total,
      draftCostStr,
      invoice.cost_amount_including_tax
    );
    const saved = updateInvoice(invoice.id, {
      due_date: draftDueDate,
      revenue_category: (draftCategory || undefined) as RevenueCategory | undefined,
      status: draftManualStatus,
      note: draftNote.trim() ? draftNote.trim() : undefined,
      estimate_id: draftEstimateIdStr ? Number(draftEstimateIdStr) : undefined,
      billing_addressee_name: draftBillingAddresseeName.trim()
        ? draftBillingAddresseeName.trim()
        : undefined,
      subject: draftSubject.trim() ? draftSubject.trim() : undefined,
      items,
      amount: total,
      ...costPatch,
    });
    setInvoice(saved);
    setIsEditing(false);
  };

  const amountForDisplay = isEditing && draftItems.length > 0 ? total : invoice.amount;
  const remaining = amountForDisplay - totalPaid;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-blue-600" />
            請求情報・請求明細
            {isOverdue && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 text-red-700 px-2 py-0.5 text-xs font-medium border border-red-200">
                <AlertCircle className="h-3.5 w-3.5" />
                支払期限超過（{formatDate(invoice.due_date)}）
              </span>
            )}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            {!isEditing && (
              <>
                <InvoicePdfClient invoiceNumber={invoice.invoice_number} size="sm" />
                <ReceiptClient
                  invoiceId={invoice.id}
                  invoiceAmount={invoice.amount}
                  totalPaid={totalPaid}
                  size="sm"
                />
              </>
            )}
            {!isEditing ? (
              <Button onClick={startEdit} variant="outline" size="sm">
                <Pencil className="h-4 w-4 mr-2" />
                編集
              </Button>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <Button onClick={cancelEdit} variant="outline" size="sm">
                  <X className="h-4 w-4 mr-2" />
                  キャンセル
                </Button>
                <Button
                  onClick={save}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  更新
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-3 md:col-span-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">請求番号</p>
                <p className="font-semibold text-sm md:text-base">{invoice.invoice_number}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">請求日</p>
                <p className="font-medium text-sm md:text-base">{formatDate(invoice.created_at)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">顧客</p>
                <p className="font-medium text-gray-900 text-sm md:text-base">{customerName || "-"}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-gray-500 mb-1">請求宛先名</p>
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={draftBillingAddresseeName}
                      onChange={(e) => setDraftBillingAddresseeName(e.target.value)}
                      placeholder={`未入力時: ${customerBillingFallback}`}
                      className="mt-1 w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">
                      請求宛先名を入力している場合、請求書にはこちらの名称を使用します。未入力の場合は顧客マスタの宛名（{customerBillingFallback}）を使用します。
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-gray-900 text-sm md:text-base">
                      {getInvoiceBillingAddresseeDisplayName(invoice, customer) || "—"}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      請求宛先名を入力している場合、請求書にはこちらの名称を使用します。未入力の場合は顧客マスタの宛名を使用します。
                    </p>
                  </>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">区分</p>
                {isEditing ? (
                  <select
                    value={draftCategory}
                    onChange={(e) => setDraftCategory((e.target.value || "") as RevenueCategory | "")}
                    className="mt-1 w-full max-w-[220px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                  >
                    <option value="">選択してください</option>
                    <option value="注文">注文</option>
                    <option value="建売">建売</option>
                    <option value="リフォーム">リフォーム</option>
                    <option value="土地">土地</option>
                    <option value="仲介料">仲介料</option>
                  </select>
                ) : (
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-blue-50 text-blue-800">
                    {invoice.revenue_category || "-"}
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">物件</p>
                <p className="font-medium text-gray-900 text-sm md:text-base">{propertyName || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">関連見積</p>
                {isEditing ? (
                  <EstimateSelect
                    estimates={estimates}
                    projects={projects}
                    customers={customers}
                    value={draftEstimateIdStr}
                    onChange={setDraftEstimateIdStr}
                  />
                ) : (
                  <InvoiceRelatedEstimate
                    estimateId={relatedEstimateId ?? invoice.estimate_id}
                    estimateNumber={relatedEstimateNumber}
                  />
                )}
              </div>
            </div>

            <div className="pt-2">
              <p className="text-xs text-gray-500 mb-1">件名</p>
              {isEditing ? (
                <input
                  type="text"
                  value={draftSubject}
                  onChange={(e) => setDraftSubject(e.target.value)}
                  placeholder="請求書の件名を入力"
                  className="w-full max-w-2xl px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                />
              ) : (
                <p className="text-sm text-gray-900">{invoice.subject?.trim() ? invoice.subject : "—"}</p>
              )}
            </div>

            <div className="pt-2">
              <p className="text-xs text-gray-500 mb-1">備考</p>
              {isEditing ? (
                <textarea
                  value={draftNote}
                  onChange={(e) => setDraftNote(e.target.value)}
                  rows={3}
                  placeholder="備考を入力"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                />
              ) : (
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {invoice.note?.trim() ? invoice.note : "-"}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 pt-2">
              <div>
                <p className="text-xs text-gray-500 mb-1">請求金額</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">
                  {formatCurrency(amountForDisplay)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">入金済み</p>
                <p className="font-semibold text-sm md:text-base text-gray-900">{formatCurrency(totalPaid)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">残額</p>
                <p className="font-semibold text-sm md:text-base text-gray-900">{formatCurrency(remaining)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500 mb-1">原価金額（税込）</p>
                {isEditing ? (
                  <input
                    type="text"
                    inputMode="numeric"
                    value={draftCostStr}
                    onChange={(e) => setDraftCostStr(e.target.value)}
                    placeholder="例: 300000"
                    className="mt-1 w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white tabular-nums"
                  />
                ) : (
                  <p className="font-semibold text-sm md:text-base text-gray-900 tabular-nums">
                    {invoice.cost_amount_including_tax != null
                      ? formatCurrency(invoice.cost_amount_including_tax)
                      : "—"}
                  </p>
                )}
                <InvoiceCostAmountHint updatedAt={invoice.cost_amount_updated_at} />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">利益額（税込）</p>
                <p className="font-semibold text-sm md:text-base text-gray-900 tabular-nums">
                  {isEditing
                    ? editProfitAmountPreview != null
                      ? formatCurrency(editProfitAmountPreview)
                      : "—"
                    : viewProfitAmount != null
                      ? formatCurrency(viewProfitAmount)
                      : "—"}
                </p>
                <p className="text-[11px] text-gray-500 mt-1">請求合計（税込）− 原価（税込）</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">利益率</p>
                <p className="font-semibold text-sm md:text-base text-gray-900 tabular-nums">
                  {formatProfitMarginRate(isEditing ? editProfitMarginPreview : viewProfitMarginRate)}
                </p>
                <p className="text-[11px] text-gray-500 mt-1">(請求合計 − 原価) ÷ 請求合計</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">ステータス</p>
              {isEditing ? (
                <select
                  value={draftManualStatus}
                  onChange={(e) => setDraftManualStatus(e.target.value as "有" | "無し")}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="有">黄色有</option>
                  <option value="無し">黄色無し</option>
                </select>
              ) : (
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs md:text-sm font-medium ${
                    invoice.status === "有" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {invoice.status === "有" ? "黄色有" : "黄色無し"}
                </span>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">入金状況</p>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs md:text-sm font-medium ${getPaymentStatusChipClassName(paymentStatus)}`}
              >
                {paymentStatus}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">支払期限</p>
              {isEditing ? (
                <input
                  type="date"
                  value={draftDueDate}
                  onChange={(e) => setDraftDueDate(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              ) : (
                <p className="font-semibold text-sm md:text-base text-gray-900">{formatDate(invoice.due_date)}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-700">請求明細</p>

          {isEditing ? (
            <EstimateLineItemsEditor items={draftItems} onChange={setDraftItems} minRows={0} />
          ) : (
            <DocumentLineItemsReadonlyTable
              items={invoice.items ?? []}
              emptyMessage="請求明細は登録されていません。"
            />
          )}

          {!isEditing && (invoice.items?.length ?? 0) > 0 && (
            <FooterTotalsReadonly
              subtotal={viewSubtotal}
              tax={viewTax}
              total={invoice.amount}
              labels={{
                subtotal: "税抜き合計",
                tax: "消費税（10%）",
                total: "請求合計",
              }}
            />
          )}

          {isEditing && (
            <EditableFooterTotalsView
              items={draftItems}
              totals={footerTotals}
              labels={{
                subtotal: "税抜き合計",
                tax: "消費税（10%）",
                total: "請求合計",
              }}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

