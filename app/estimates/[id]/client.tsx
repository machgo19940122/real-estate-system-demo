"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function EstimateDetailClient() {
  return (
    <Button
      onClick={() => {
        alert("PDF出力機能（ダミー）");
      }}
      className="bg-blue-600 hover:bg-blue-700"
    >
      <Download className="h-4 w-4 mr-2" />
      PDF出力
    </Button>
  );
}

