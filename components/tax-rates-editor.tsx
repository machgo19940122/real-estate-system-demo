"use client";

import { Button } from "@/components/ui/button";
import type { TaxRateStep } from "@/lib/system-settings";
import { createTaxRateStep, percentToRate, rateToPercentInput } from "@/lib/system-settings";
import { Plus, Trash2 } from "lucide-react";

type Props = {
  rates: TaxRateStep[];
  onChange: (next: TaxRateStep[]) => void;
};

export function TaxRatesEditor({ rates, onChange }: Props) {
  const updateRow = (id: string, patch: Partial<TaxRateStep>) => {
    onChange(rates.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const removeRow = (id: string) => {
    if (rates.length <= 1) {
      alert("税率は1件以上必要です。");
      return;
    }
    onChange(rates.filter((r) => r.id !== id));
  };

  const addRow = () => {
    onChange([...rates, createTaxRateStep()]);
  };

  return (
    <div className="space-y-3">
      {rates.map((row, index) => (
        <div
          key={row.id}
          className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-gray-50/60 p-3"
        >
          <span className="text-xs text-gray-500 w-full sm:w-auto sm:mb-2">
            {index + 1}件目
          </span>
          <div className="space-y-1 flex-1 min-w-[100px]">
            <label className="text-xs font-medium text-gray-700">税率（%）</label>
            <input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={rateToPercentInput(row.rate)}
              onChange={(e) => updateRow(row.id, { rate: percentToRate(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-1 flex-1 min-w-[160px]">
            <label className="text-xs font-medium text-gray-700">適用開始日</label>
            <input
              type="date"
              value={row.effective_from}
              onChange={(e) => updateRow(row.id, { effective_from: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => removeRow(row.id)}
            aria-label="この税率を削除"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addRow}>
        <Plus className="h-4 w-4 mr-2" />
        税率を追加
      </Button>
    </div>
  );
}
