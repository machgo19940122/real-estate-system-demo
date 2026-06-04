import { formatInvoiceCostAmountUpdatedAtLine } from "@/lib/invoice-cost-metrics";

type Props = {
  updatedAt?: string | null;
  /** 原価未更新時に表示する説明 */
  baseText?: string;
};

export function InvoiceCostAmountHint({
  updatedAt,
  baseText = "請求合計（税込）に対して入力します",
}: Props) {
  const updatedLine = formatInvoiceCostAmountUpdatedAtLine(updatedAt);

  return (
    <p className="text-[11px] text-gray-500 mt-1">
      {baseText}
      {updatedLine && (
        <>
          <br />
          <span className="text-gray-600">{updatedLine}</span>
        </>
      )}
    </p>
  );
}
