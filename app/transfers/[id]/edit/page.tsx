import { TransferBatchEditClient } from "./transfer-batch-edit-client";

export default async function TransferBatchEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TransferBatchEditClient id={Number(id)} />;
}

