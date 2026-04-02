import { formatCurrency } from "@/lib/utils";
import { formatProfitMarginRate } from "@/lib/invoice-cost-metrics";

export function ReportSalesSummaryStats({
  totalSales,
  totalCost,
  profitMarginRate,
}: {
  totalSales: number;
  totalCost: number;
  profitMarginRate: number | undefined;
}) {
  const profit = totalSales - totalCost;
  return (
    <div className="mt-3 grid grid-cols-1 sm:grid-cols-4 gap-4 pt-3 border-t border-indigo-100/80">
      <div>
        <p className="text-[11px] font-medium text-gray-500">合計売上金額</p>
        <p className="text-xl sm:text-2xl font-bold text-gray-900 tabular-nums mt-0.5">
          {formatCurrency(totalSales)}
        </p>
        <p className="text-[10px] text-gray-400 mt-1">期間内入金の合計</p>
      </div>
      <div>
        <p className="text-[11px] font-medium text-gray-500">原価金額（税込）</p>
        <p className="text-xl sm:text-2xl font-bold text-gray-900 tabular-nums mt-0.5">
          {formatCurrency(totalCost)}
        </p>
        <p className="text-[10px] text-gray-400 mt-1">対象請求の原価の合計</p>
      </div>
      <div>
        <p className="text-[11px] font-medium text-gray-500">利益額</p>
        <p className="text-xl sm:text-2xl font-bold text-gray-900 tabular-nums mt-0.5">
          {formatCurrency(profit)}
        </p>
        <p className="text-[10px] text-gray-400 mt-1">売上合計 − 原価合計</p>
      </div>
      <div>
        <p className="text-[11px] font-medium text-gray-500">利益率</p>
        <p className="text-xl sm:text-2xl font-bold text-gray-900 tabular-nums mt-0.5">
          {formatProfitMarginRate(profitMarginRate)}
        </p>
        <p className="text-[10px] text-gray-400 mt-1">(売上合計 − 原価合計) ÷ 売上合計</p>
      </div>
    </div>
  );
}
