"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  calcEstimateTaxableSubtotal,
  type EstimateLineItemForm,
} from "@/lib/estimate-units";
import {
  applyAmountRounding,
  loadSystemSettings,
  type AmountRoundingMode,
} from "@/lib/system-settings";

export const DEFAULT_FOOTER_TAX_RATE = 0.1;

function itemsSignature(items: EstimateLineItemForm[]): string {
  return JSON.stringify(
    items.map((it) => ({
      id: it.id,
      k: it.line_kind,
      q: it.quantity,
      p: it.unit_price,
      d: it.direct_amount,
    }))
  );
}

/** 明細から算出するフッター合計。編集モードで税抜・消費税のみ手動上書き可 */
export function useEditableFooterTotals(
  items: EstimateLineItemForm[],
  taxRate = DEFAULT_FOOTER_TAX_RATE,
  roundingMode: AmountRoundingMode = loadSystemSettings().amount_rounding
) {
  const autoSubtotal = useMemo(
    () => calcEstimateTaxableSubtotal(items),
    [items]
  );
  const autoTax = useMemo(
    () => applyAmountRounding(autoSubtotal * taxRate, roundingMode),
    [autoSubtotal, taxRate, roundingMode]
  );

  const [editUnlocked, setEditUnlocked] = useState(false);
  const [manualSubtotal, setManualSubtotal] = useState(autoSubtotal);
  const [manualTax, setManualTax] = useState(autoTax);
  const prevSig = useRef(itemsSignature(items));

  useEffect(() => {
    const sig = itemsSignature(items);
    if (sig !== prevSig.current) {
      prevSig.current = sig;
      setEditUnlocked(false);
      setManualSubtotal(calcEstimateTaxableSubtotal(items));
      setManualTax(
        applyAmountRounding(calcEstimateTaxableSubtotal(items) * taxRate, roundingMode)
      );
      return;
    }
    if (!editUnlocked) {
      setManualSubtotal(autoSubtotal);
      setManualTax(autoTax);
    }
  }, [items, autoSubtotal, autoTax, editUnlocked, taxRate, roundingMode]);

  const subtotal = editUnlocked ? manualSubtotal : autoSubtotal;
  const tax = editUnlocked ? manualTax : autoTax;
  const total = subtotal + tax;

  const unlockEdit = () => {
    setManualSubtotal(autoSubtotal);
    setManualTax(autoTax);
    setEditUnlocked(true);
  };

  const lockEdit = () => {
    setEditUnlocked(false);
  };

  return {
    autoSubtotal,
    autoTax,
    subtotal,
    tax,
    total,
    editUnlocked,
    isManual: editUnlocked,
    unlockEdit,
    lockEdit,
    setManualSubtotal: (v: number) => setManualSubtotal(Number(v) || 0),
    setManualTax: (v: number) => setManualTax(Number(v) || 0),
  };
}

export type EditableFooterTotalsState = ReturnType<typeof useEditableFooterTotals>;
