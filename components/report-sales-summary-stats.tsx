import { formatCurrency } from "@/lib/utils";
import { formatProfitMarginRate } from "@/lib/invoice-cost-metrics";

export function ReportSalesSummaryStats({
  totalPaidInPeriod,
  totalInvoiceRevenue,
  totalCost,
  profitMarginRate,
}: {
  totalPaidInPeriod: number;
  totalInvoiceRevenue: number;
  totalCost: number;
  profitMarginRate: number | undefined;
}) {
  const profit = totalInvoiceRevenue - totalCost;
  return (
    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-3 border-t border-indigo-100/80">
      <div>
        <p className="text-[11px] font-medium text-gray-500">期間内入金計上</p>
        <p className="text-xl sm:text-2xl font-bold text-gray-900 tabular-nums mt-0.5">
          {formatCurrency(totalPaidInPeriod)}
        </p>
        <p className="text-[10px] text-gray-400 mt-1">対象期間に入った入金の合計</p>
      </div>
      <div>
        <p className="text-[11px] font-medium text-gray-500">請求金額（税込）合計</p>
        <p className="text-xl sm:text-2xl font-bold text-gray-900 tabular-nums mt-0.5">
          {formatCurrency(totalInvoiceRevenue)}
        </p>
        <p className="text-[10px] text-gray-400 mt-1">利益・利益率の計算に使用</p>
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
        <p className="text-[10px] text-gray-400 mt-1">請求金額（税込）合計 − 原価合計</p>
      </div>
      <div>
        <p className="text-[11px] font-medium text-gray-500">利益率</p>
        <p className="text-xl sm:text-2xl font-bold text-gray-900 tabular-nums mt-0.5">
          {formatProfitMarginRate(profitMarginRate)}
        </p>
        <p className="text-[10px] text-gray-400 mt-1">(請求税込合計 − 原価合計) ÷ 請求税込合計</p>
      </div>
    </div>
  );
}
