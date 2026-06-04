"use client";

import { useMemo } from "react";
import type { Customer, Estimate, Project } from "@/src/data/mock";

const SELECT_CLASS =
  "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white text-sm";

type Props = {
  estimates: Estimate[];
  projects: Project[];
  customers: Customer[];
  /** 見積ID（未選択は ""） */
  value: string;
  onChange: (estimateId: string) => void;
  /** 顧客ID文字列。指定時は同一顧客の見積に絞る */
  customerId?: string;
  disabled?: boolean;
  id?: string;
};

export function EstimateSelect({
  estimates,
  projects,
  customers,
  value,
  onChange,
  customerId,
  disabled = false,
  id = "estimate_id",
}: Props) {
  const options = useMemo(() => {
    let list = estimates.slice();
    if (customerId) {
      const cid = Number(customerId);
      const projectIds = new Set(
        projects.filter((p) => p.customer_id === cid).map((p) => p.id)
      );
      list = list.filter(
        (e) => e.project_id != null && projectIds.has(e.project_id)
      );
    }
    if (value && !list.some((e) => String(e.id) === value)) {
      const current = estimates.find((e) => String(e.id) === value);
      if (current) list = [current, ...list];
    }
    return list.sort((a, b) =>
      a.created_at < b.created_at ? 1 : a.created_at > b.created_at ? -1 : b.id - a.id
    );
  }, [estimates, projects, customerId, value]);

  return (
    <select
      id={id}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={SELECT_CLASS}
      aria-label="関連見積を選択"
    >
      <option value="">選択なし</option>
      {options.map((est) => {
        const project =
          est.project_id != null
            ? projects.find((p) => p.id === est.project_id)
            : undefined;
        const customer = project
          ? customers.find((c) => c.id === project.customer_id)
          : undefined;
        const suffix = customer?.name ? ` · ${customer.name}` : "";
        return (
          <option key={est.id} value={String(est.id)}>
            {est.estimate_number}
            {suffix}
          </option>
        );
      })}
    </select>
  );
}
