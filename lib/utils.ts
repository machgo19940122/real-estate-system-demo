import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { PaymentStatus } from "@/src/data/mock";

/** 請求の入金状況チップ用の背景・文字色 */
export function getPaymentStatusChipClassName(status: PaymentStatus | string): string {
  switch (status) {
    case "未入金":
      return "bg-red-100 text-red-800";
    case "一部入金":
      return "bg-amber-100 text-amber-800";
    case "入金済み":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
  }).format(amount);
}

export function formatDate(dateString: string): string {
  // `YYYY-MM-DD` を Date にすると環境タイムゾーン差で日付がズレて、
  // Server/Clientで表示が一致せず hydration warning の原因になりうるため、
  // 日付のみ文字列は決め打ちで整形する。
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
  if (m) {
    const year = Number(m[1]);
    const month = Number(m[2]);
    const day = Number(m[3]);
    return `${year}年${month}月${day}日`;
  }

  return new Date(dateString).toLocaleDateString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
