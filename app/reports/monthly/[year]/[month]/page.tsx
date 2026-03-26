import { MonthlyReportDetailClient } from "./client";

export default async function MonthlyReportDetailPage({
  params,
}: {
  params: Promise<{ year: string; month: string }>;
}) {
  const { year: yearStr, month: monthStr } = await params;
  const year = parseInt(yearStr);
  const month = parseInt(monthStr);

  return <MonthlyReportDetailClient year={year} month={month} />;
}
