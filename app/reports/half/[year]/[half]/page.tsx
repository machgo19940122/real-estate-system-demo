import { MonthlyReportDetailClient } from "@/app/reports/monthly/[year]/[month]/client";

export default async function HalfReportPage({
  params,
}: {
  params: Promise<{ year: string; half: string }>;
}) {
  const { year, half } = await params;
  const numericYear = parseInt(year, 10);
  const isSecondHalf = half === "H2";
  const title = isSecondHalf
    ? `${numericYear}年度 下期 集計`
    : `${numericYear}年度 上期 集計`;

  // 代表月は UI 上の表示用にのみ利用（実集計は今後専用クライアントに差し替え予定）
  const month = isSecondHalf ? 3 : 9;

  return (
    <MonthlyReportDetailClient
      year={numericYear}
      month={month}
      title={title}
      showClosingAndCsv={false}
    />
  );
}

