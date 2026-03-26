import { PayeeDetailClient } from "./payee-detail-client";

export default async function PayeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PayeeDetailClient id={Number(id)} />;
}

