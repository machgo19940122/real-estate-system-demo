"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PropertyCombobox } from "@/components/property-combobox";
import { normalizeInvoicePropertyIds } from "@/lib/invoice-properties";
import { getPropertyById, type Property } from "@/src/data/mock";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  properties: Property[];
  value: number[];
  onChange: (ids: number[]) => void;
  disabled?: boolean;
  /** 指定時はその顧客の物件のみ追加候補にする */
  customerId?: number;
};

export function InvoicePropertiesEditor({
  properties,
  value,
  onChange,
  disabled = false,
  customerId,
}: Props) {
  const [pickId, setPickId] = useState("");

  const normalized = useMemo(() => normalizeInvoicePropertyIds(value), [value]);

  const selected = useMemo(
    () =>
      normalized
        .map((id) => getPropertyById(id))
        .filter((p): p is Property => p != null),
    [normalized]
  );

  const addCandidates = useMemo(() => {
    let list = properties.filter((p) => !normalized.includes(p.id));
    if (customerId != null && customerId > 0) {
      list = list.filter((p) => p.owner_customer_id === customerId);
    }
    return list;
  }, [properties, normalized, customerId]);

  const addProperty = (idStr: string) => {
    if (!idStr || disabled) return;
    const id = Number(idStr);
    if (!Number.isFinite(id) || normalized.includes(id)) {
      setPickId("");
      return;
    }
    onChange([...normalized, id]);
    setPickId("");
  };

  const removeProperty = (id: number) => {
    if (disabled) return;
    onChange(normalized.filter((x) => x !== id));
  };

  return (
    <div className="space-y-2">
      {!disabled && (
        <div className="flex flex-col sm:flex-row gap-2 sm:items-end max-w-xl">
          <div className="flex-1 min-w-0">
            <PropertyCombobox
              properties={addCandidates}
              value={pickId}
              onChange={(next) => {
                setPickId(next);
                if (next) addProperty(next);
              }}
              placeholder="物件を検索して追加"
              ariaLabel="請求に紐づける物件を追加"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            disabled={!pickId}
            onClick={() => addProperty(pickId)}
          >
            <Plus className="h-4 w-4 mr-1" />
            追加
          </Button>
        </div>
      )}

      {selected.length === 0 ? (
        <p className="text-sm text-gray-500">物件が未選択です</p>
      ) : (
        <ul className="space-y-1.5 rounded-lg border border-gray-200 bg-gray-50/80 p-2">
          {selected.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-2 text-sm bg-white rounded-md px-2.5 py-1.5 border border-gray-100"
            >
              <Link
                href={`/properties/${p.id}`}
                className="font-medium text-gray-900 hover:text-blue-600 hover:underline truncate min-w-0"
              >
                {p.name}
              </Link>
              {!disabled && (
                <button
                  type="button"
                  className="shrink-0 p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50"
                  aria-label={`${p.name}を外す`}
                  onClick={() => removeProperty(p.id)}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      <p className="text-[11px] text-gray-500">
        1件の請求に複数の物件を紐づけできます。請求書に載せる物件名として使用します。
      </p>
    </div>
  );
}
