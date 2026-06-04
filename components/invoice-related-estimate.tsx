import Link from "next/link";
import { FileText } from "lucide-react";

type Props = {
  estimateId?: number;
  estimateNumber?: string;
};

/** 請求詳細・新規フォームの「関連見積」表示 */
export function InvoiceRelatedEstimate({ estimateId, estimateNumber }: Props) {
  if (estimateId == null) {
    return <span className="text-sm text-gray-500">—</span>;
  }

  const label = estimateNumber ?? `見積 #${estimateId}`;

  return (
    <Link
      href={`/estimates/${estimateId}`}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
    >
      <FileText className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  );
}
