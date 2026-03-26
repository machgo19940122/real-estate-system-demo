import { CompanyBankAccountDetailClient } from "./company-bank-account-detail-client";

export default async function CompanyBankAccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CompanyBankAccountDetailClient id={Number(id)} />;
}

