"use client";

import { Button } from "@/components/ui/button";
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
      onClick={() => {
        alert(`請求書発行（PDF / ダミー）: ${invoiceNumber}`);
      }}
    >
      <Download className="h-4 w-4 mr-2" />
      請求書PDF
    </Button>
  );
}

