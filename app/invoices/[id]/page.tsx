import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  invoices,
  projects,
  getCustomerById,
  getPropertyById,
  getPaymentsByInvoiceId,
  getTotalPaidAmount,
  calculateInvoiceStatus,
} from "@/src/data/mock";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PaymentClient } from "./payment-client";
import { InvoiceEditClient } from "./edit-client";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = invoices.find((i) => i.id === parseInt(id));

  if (!invoice) {
    notFound();
  }

  const project = projects.find((p) => p.id === (invoice as any).project_id);
  const customer = project ? getCustomerById(project.customer_id) : undefined;
  const property = project ? getPropertyById(project.property_id) : undefined;
  const payments = getPaymentsByInvoiceId(invoice.id);
  const totalPaid = getTotalPaidAmount(invoice.id);
  const currentStatus = calculateInvoiceStatus(invoice);
  const isOverdue =
    currentStatus !== "入金済み" && new Date(invoice.due_date) < new Date();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/invoices">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {invoice.invoice_number}
            </h1>
            <p className="text-gray-600 mt-1">請求詳細</p>
          </div>
        </div>

        <InvoiceEditClient
          initialInvoice={invoice}
          customerName={customer?.name}
          propertyName={property?.name}
          paymentStatus={currentStatus}
          totalPaid={totalPaid}
          isOverdue={isOverdue}
        />

        {/* 入金管理 */}
        <PaymentClient
          invoiceId={invoice.id}
          invoiceAmount={invoice.amount}
          initialPayments={payments}
        />
      </div>
    </AppLayout>
  );
}

