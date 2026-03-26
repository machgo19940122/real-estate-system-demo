import { TransferBatchDetailClient } from "./transfer-batch-detail-client";

export default async function TransferBatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TransferBatchDetailClient id={Number(id)} />;
}

