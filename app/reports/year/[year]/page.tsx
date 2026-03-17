import { MonthlyReportDetailClient } from "@/app/reports/monthly/[year]/[month]/client";

export default async function YearReportPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = await params;
  const numericYear = parseInt(year, 10);
  const title = `${numericYear}年度 通期 集計`;

  // 通期詳細も簡易対応として、代表月を3月として既存の月次詳細コンポーネントを再利用
  const month = 3;

  return (
    <MonthlyReportDetailClient
      year={numericYear}
      month={month}
      title={title}
      showClosingAndCsv={false}
    />
  );
}

