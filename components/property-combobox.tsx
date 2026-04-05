"use client";

import { useMemo, useState } from "react";
import { Combobox } from "@base-ui/react/combobox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Property } from "@/src/data/mock";

const INPUT_CLASS =
  "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white";

type PropertyOption = { value: string; label: string };

export function PropertyCombobox({
  properties,
  value,
  onChange,
  placeholder = "物件名で検索",
  ariaLabel = "物件を検索して選択",
  disabled = false,
}: {
  properties: Property[];
  value: string; // property.id の文字列
  onChange: (nextValue: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  disabled?: boolean;
}) {
  const [inputValue, setInputValue] = useState("");

  const options = useMemo<PropertyOption[]>(
    () => properties.map((p) => ({ value: String(p.id), label: p.name })),
    [properties]
  );

  const selected = useMemo(() => {
    if (!value) return null;
    return options.find((o) => o.value === value) ?? null;
  }, [options, value]);

  const filtered = useMemo(() => {
    const q = inputValue.trim().toLowerCase();
    if (!q) return options;

    const normalize = (s: string) =>
      s
        .toLowerCase()
        .replaceAll(" ", "")
        .replaceAll("　", "")
        .replaceAll("-", "");

    const nq = normalize(q);
    return options.filter((o) => normalize(o.label).includes(nq));
  }, [options, inputValue]);

  return (
    <Combobox.Root
      value={selected}
      onValueChange={(next) => {
        onChange(next ? next.value : "");
        setInputValue("");
      }}
      onInputValueChange={(next) => setInputValue(next)}
      itemToStringLabel={(item) => item.label}
      itemToStringValue={(item) => item.value}
      isItemEqualToValue={(item, v) => item.value === v.value}
      disabled={disabled}
    >
      <Combobox.Input
        aria-label={ariaLabel}
        placeholder={placeholder}
        className={cn(INPUT_CLASS, disabled && "disabled:bg-gray-50 disabled:text-gray-500")}
      />

      <Combobox.Portal>
        <Combobox.Positioner className="z-50">
          <Combobox.Popup className="mt-2 w-[var(--anchor-width)] max-h-72 overflow-auto rounded-xl border border-gray-200 bg-white shadow-xl">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">該当する物件がありません</div>
            ) : (
              <Combobox.List className="py-1">
                {filtered.map((o) => (
                  <Combobox.Item
                    key={o.value}
                    value={o}
                    className={cn(
                      "px-3 py-2 text-sm cursor-pointer select-none",
                      "data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-900",
                      "data-[selected]:bg-blue-50/60"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600">
                        <Combobox.ItemIndicator>
                          <Check className="h-4 w-4" />
                        </Combobox.ItemIndicator>
                      </span>
                      <div className="min-w-0 flex-1 font-medium text-gray-900 truncate">
                        {o.label}
                      </div>
                    </div>
                  </Combobox.Item>
                ))}
              </Combobox.List>
            )}
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}

