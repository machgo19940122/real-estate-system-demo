"use client";

import { Button } from "@/components/ui/button";
import { Copy, Download, Receipt } from "lucide-react";
import Link from "next/link";

type EstimateDetailClientProps = {
  estimateId: number;
  propertyId?: number;
  customerId?: number;
  staffId?: number;
  amount?: number;
  revenueCategory?: string;
};

export function EstimateDetailClient({
  estimateId,
  propertyId,
  customerId,
  staffId,
  amount,
  revenueCategory,
}: EstimateDetailClientProps) {
  const params = new URLSearchParams();
  params.set("estimateId", String(estimateId));
  if (propertyId != null) params.set("propertyId", String(propertyId));
  if (customerId != null) params.set("customerId", String(customerId));
  if (staffId != null) params.set("staffId", String(staffId));
  if (amount != null) params.set("amount", String(amount));
  if (revenueCategory) params.set("revenueCategory", revenueCategory);
  const invoiceNewHref = `/invoices/new?${params.toString()}`;
  const duplicateHref = `/estimates/new?fromEstimateId=${estimateId}`;

  return (
    <>
      <Link href={duplicateHref}>
        <Button variant="outline">
          <Copy className="h-4 w-4 mr-2" />
          複製
        </Button>
      </Link>
      <Link href={invoiceNewHref}>
        <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
          <Receipt className="h-4 w-4 mr-2" />
          見積書から請求書を作成
        </Button>
      </Link>
      <Button
        variant="outline"
        onClick={() => {
          alert("PDF出力機能（ダミー）");
        }}
      >
        <Download className="h-4 w-4 mr-2" />
        見積書PDF
      </Button>
    </>
  );
}

