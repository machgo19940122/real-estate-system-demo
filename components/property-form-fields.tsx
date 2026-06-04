"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CustomerCombobox } from "@/components/customer-combobox";
import { PrefectureSelect } from "@/components/prefecture-select";
import { combinePrefectureAddress, splitPrefectureFromAddress } from "@/lib/prefectures";
import { formatCurrency } from "@/lib/utils";
import {
  PROPERTY_CATEGORIES,
  type Customer,
  type Property,
  type PropertyCategory,
} from "@/src/data/mock";
import { Loader } from "lucide-react";

const INPUT =
  "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white";

export type PropertyFormValues = {
  name: string;
  chiban: string;
  postal_code: string;
  prefecture: string;
  address: string;
  category: PropertyCategory | "";
  memo: string;
  sale_price: string;
  owner_customer_id: string;
};

export function propertyToFormValues(
  property: Property,
  customers: Customer[]
): PropertyFormValues {
  const ownerId =
    property.owner_customer_id ??
    customers.find((c) => c.name === property.owner)?.id;
  const { prefecture, addressLine } = splitPrefectureFromAddress(property.address ?? "");
  return {
    name: property.name,
    chiban: property.chiban ?? "",
    postal_code: property.postal_code ?? "",
    prefecture,
    address: addressLine,
    category: property.category ?? "",
    memo: property.memo ?? "",
    sale_price:
      property.sale_price != null ? String(property.sale_price) : "",
    owner_customer_id: ownerId != null ? String(ownerId) : "",
  };
}

export function parseSalePriceInput(value: string): number | undefined {
  const n = value.replace(/,/g, "").trim();
  if (!n) return undefined;
  const parsed = Number(n);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export function propertyFormCanSave(values: PropertyFormValues): boolean {
  return values.name.trim().length > 0 && values.category !== "";
}

export function applyPropertyFormValues(
  base: Property,
  values: PropertyFormValues,
  customers: Customer[]
): Property {
  const ownerCustomer = values.owner_customer_id
    ? customers.find((c) => String(c.id) === values.owner_customer_id)
    : undefined;
  return {
    ...base,
    name: values.name.trim(),
    chiban: values.chiban.trim() || undefined,
    postal_code: values.postal_code.trim() || undefined,
    address: combinePrefectureAddress(values.prefecture, values.address.trim()),
    category: values.category as PropertyCategory,
    memo: values.memo.trim() || undefined,
    sale_price: parseSalePriceInput(values.sale_price),
    owner_customer_id: ownerCustomer?.id,
    owner: ownerCustomer?.name ?? "",
  };
}

type Props = {
  values: PropertyFormValues;
  onChange: (patch: Partial<PropertyFormValues>) => void;
  customers: Customer[];
  readOnly?: boolean;
};

export function PropertyFormFields({
  values,
  onChange,
  customers,
  readOnly = false,
}: Props) {
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [addressError, setAddressError] = useState("");

  const handleFetchAddress = async () => {
    if (!values.postal_code.trim()) {
      setAddressError("郵便番号を入力してください");
      return;
    }
    setIsLoadingAddress(true);
    setAddressError("");
    try {
      const response = await fetch(
        `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${values.postal_code.replace(/-/g, "")}`
      );
      const data = await response.json();
      if (data.results?.length > 0) {
        const result = data.results[0];
        onChange({
          prefecture: result.address1,
          address: `${result.address2}${result.address3}`,
        });
      } else {
        setAddressError("郵便番号が見つかりません");
      }
    } catch {
      setAddressError("住所の取得に失敗しました");
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const ownerName =
    values.owner_customer_id &&
    customers.find((c) => String(c.id) === values.owner_customer_id)?.name;

  const salePriceDisplay =
    values.sale_price.trim() !== ""
      ? formatCurrency(parseSalePriceInput(values.sale_price) ?? 0)
      : "-";

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500 mb-2">
            物件名 {!readOnly && <span className="text-red-500">*</span>}
          </p>
          {readOnly ? (
            <p className="font-medium">{values.name || "-"}</p>
          ) : (
            <input
              type="text"
              value={values.name}
              onChange={(e) => onChange({ name: e.target.value })}
              className={INPUT}
              placeholder="渋谷マンション"
            />
          )}
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-2">地番</p>
          {readOnly ? (
            <p className="font-medium">{values.chiban || "-"}</p>
          ) : (
            <input
              type="text"
              value={values.chiban}
              onChange={(e) => onChange({ chiban: e.target.value })}
              className={INPUT}
              placeholder="神南1-1-1"
            />
          )}
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-2">郵便番号</p>
          {readOnly ? (
            <p className="font-medium">{values.postal_code || "-"}</p>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={values.postal_code}
                onChange={(e) => onChange({ postal_code: e.target.value })}
                className={`flex-1 ${INPUT}`}
                placeholder="150-0041"
              />
              <Button
                type="button"
                onClick={handleFetchAddress}
                disabled={isLoadingAddress}
                variant="outline"
                size="sm"
              >
                {isLoadingAddress ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  "取得"
                )}
              </Button>
            </div>
          )}
          {addressError && !readOnly && (
            <p className="text-sm text-red-500 mt-1">{addressError}</p>
          )}
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-2">都道府県</p>
          {readOnly ? (
            <p className="font-medium">{values.prefecture || "-"}</p>
          ) : (
            <PrefectureSelect
              value={values.prefecture}
              onChange={(prefecture) => onChange({ prefecture })}
              className={INPUT}
            />
          )}
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-2">住所</p>
          {readOnly ? (
            <p className="font-medium whitespace-pre-wrap">
              {combinePrefectureAddress(values.prefecture, values.address) || "-"}
            </p>
          ) : (
            <textarea
              value={values.address}
              onChange={(e) => onChange({ address: e.target.value })}
              rows={2}
              className={INPUT}
              placeholder="渋谷区神南1-1-1"
            />
          )}
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-2">
            区分 {!readOnly && <span className="text-red-500">*</span>}
          </p>
          {readOnly ? (
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium bg-blue-50 text-blue-800">
              {values.category || "-"}
            </span>
          ) : (
            <select
              value={values.category}
              onChange={(e) =>
                onChange({ category: e.target.value as PropertyCategory | "" })
              }
              className={INPUT}
            >
              <option value="">選択してください</option>
              {PROPERTY_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500 mb-2">販売金額</p>
          {readOnly ? (
            <p className="font-medium">{salePriceDisplay}</p>
          ) : (
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={values.sale_price}
                onChange={(e) => onChange({ sale_price: e.target.value })}
                className={INPUT}
                placeholder="58000000"
              />
              <p className="text-xs text-gray-500 mt-1">円（税抜想定・デモ）</p>
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-2">所有者</p>
          {readOnly ? (
            <p className="font-medium">{ownerName || "-"}</p>
          ) : (
            <CustomerCombobox
              customers={customers}
              value={values.owner_customer_id}
              onChange={(id) => onChange({ owner_customer_id: id })}
              placeholder="顧客名で検索して選択"
              ariaLabel="所有者（顧客）を選択"
            />
          )}
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-2">備考</p>
          {readOnly ? (
            <p className="font-medium whitespace-pre-wrap">{values.memo || "-"}</p>
          ) : (
            <textarea
              value={values.memo}
              onChange={(e) => onChange({ memo: e.target.value })}
              rows={3}
              className={INPUT}
              placeholder="追加の説明や注意事項"
            />
          )}
        </div>
      </div>
    </div>
  );
}
