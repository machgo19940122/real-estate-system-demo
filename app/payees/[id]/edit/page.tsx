import { PayeeEditClient } from "./payee-edit-client";

export default async function PayeeEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PayeeEditClient id={Number(id)} />;
}

