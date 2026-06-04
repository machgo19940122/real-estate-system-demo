"use client";

import Link from "next/link";
import { getInvoiceProperties } from "@/lib/invoice-properties";
import type { Invoice } from "@/src/data/mock";

type Props = {
  invoice: Invoice;
  emptyText?: string;
  className?: string;
};

/** 請求に紐づく物件名（読取専用・リンク付き） */
export function InvoicePropertiesList({
  invoice,
  emptyText = "—",
  className = "",
}: Props) {
  const list = getInvoiceProperties(invoice);

  if (list.length === 0) {
    return <span className={`text-sm text-gray-500 ${className}`}>{emptyText}</span>;
  }

  if (list.length === 1) {
    const p = list[0];
    return (
      <Link
        href={`/properties/${p.id}`}
        className={`font-medium text-gray-900 hover:text-blue-600 hover:underline text-sm md:text-base ${className}`}
      >
        {p.name}
      </Link>
    );
  }

  return (
    <ul className={`space-y-0.5 ${className}`}>
      {list.map((p) => (
        <li key={p.id}>
          <Link
            href={`/properties/${p.id}`}
            className="text-sm text-gray-800 hover:text-blue-600 hover:underline"
          >
            {p.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
