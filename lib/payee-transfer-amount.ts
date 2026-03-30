import type { Payee } from "@/src/data/mock";

/** 社内固定：保険として差し引く率（マスタでは変更しない） */
export const INSURANCE_DEDUCTION_RATE = 0.003;

/** 振込先マスタで「保険として差し引いて振り込み」が有効か */
export function isInsuranceDeductionEnabled(payee: Payee): boolean {
  return Boolean(payee.insurance_deduction_enabled);
}

/**
 * 請求ベース金額から振込額を求める。
 * 有効時: 保険として差し引く額 = ⌊請求額 × 0.003⌋（切り捨て）、振込額 = 請求額 − その額
 */
export function transferAmountFromBillingGross(payee: Payee, billingGrossYen: number): {
  transferAmount: number;
  billingGrossAmount?: number;
} {
  const gross = Math.max(0, Math.floor(Number(billingGrossYen) || 0));
  if (!isInsuranceDeductionEnabled(payee)) {
    return { transferAmount: gross, billingGrossAmount: undefined };
  }
  const deduction = Math.floor(gross * INSURANCE_DEDUCTION_RATE);
  const transferAmount = Math.max(0, gross - deduction);
  return { transferAmount, billingGrossAmount: gross };
}

/** 明細フォームの入力（請求ベース）から、画面上の振込額プレビュー */
export function previewTransferAmount(payee: Payee | undefined, billingInputYen: number): number {
  if (!payee) return Math.max(0, Math.floor(Number(billingInputYen) || 0));
  return transferAmountFromBillingGross(payee, billingInputYen).transferAmount;
}
