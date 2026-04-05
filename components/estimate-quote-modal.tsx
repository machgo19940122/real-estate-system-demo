"use client";

import { useMemo, useState } from "react";
import {
  estimates,
  projects,
  getCustomerById,
  type Estimate,
} from "@/src/data/mock";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

function customerNameForEstimate(e: Estimate): string {
  const project =
    e.project_id != null ? projects.find((p) => p.id === e.project_id) : undefined;
  if (!project) return "—";
  const c = getCustomerById(project.customer_id);
  return c?.name ?? "—";
}

export function EstimateQuoteModal(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectEstimate: (estimate: Estimate) => void;
}) {
  const { open, onOpenChange, onSelectEstimate } = props;
  const [query, setQuery] = useState("");

  const sorted = useMemo(() => {
    return [...estimates].sort((a, b) => {
      const ta = new Date(a.created_at).getTime();
      const tb = new Date(b.created_at).getTime();
      return tb - ta;
    });
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((e) => {
      const num = e.estimate_number.toLowerCase();
      const cust = customerNameForEstimate(e).toLowerCase();
      return num.includes(q) || cust.includes(q);
    });
  }, [sorted, query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[min(560px,90vh)] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">見積を引用</h2>
            <p className="text-sm text-gray-500">
              内容をコピーしてフォームに反映します（保存は別途「登録する」）
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="閉じる"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b px-4 py-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="見積番号・顧客名で絞り込み"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <ul className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {filtered.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-gray-500">
              該当する見積がありません
            </li>
          ) : (
            filtered.map((e) => (
              <li key={e.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900">{e.estimate_number}</p>
                  <p className="truncate text-sm text-gray-600">
                    {customerNameForEstimate(e)} · {formatCurrency(e.total)}
                  </p>
                  <p className="text-xs text-gray-400">{formatDate(e.created_at)}</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  className="shrink-0 bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    onSelectEstimate(e);
                    onOpenChange(false);
                    setQuery("");
                  }}
                >
                  引用
                </Button>
              </li>
            ))
          )}
        </ul>

        <div className="border-t px-4 py-3">
          <Button type="button" variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
        </div>
      </div>
    </div>
  );
}
