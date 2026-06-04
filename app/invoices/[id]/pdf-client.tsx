"use client";

import { Button } from "@/components/ui/button";
import { issueInvoicePdfDemo } from "@/lib/invoice-pdf-demo";
import { Download } from "lucide-react";

export function InvoicePdfClient({
  invoiceNumber,
  size = "default",
}: {
  invoiceNumber: string;
  size?: "default" | "sm";
}) {
  return (
    <Button
      variant="outline"
      size={size}
      onClick={() => issueInvoicePdfDemo([invoiceNumber])}
    >
      <Download className="h-4 w-4 mr-2" />
      請求書PDF
    </Button>
  );
}

