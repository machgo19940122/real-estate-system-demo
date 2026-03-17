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
import { ArrowLeft, Calendar, AlertCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PaymentClient } from "./payment-client";
import { ReceiptClient } from "./receipt-client";
import { InvoicePdfClient } from "./pdf-client";
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

        {isOverdue && (
          <Card className="border-0 shadow-lg bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-semibold text-red-900">支払期限を過ぎています</p>
                  <p className="text-sm text-red-700">
                    支払期限: {formatDate(invoice.due_date)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end">
          <div className="flex items-center gap-2">
            <InvoicePdfClient invoiceNumber={invoice.invoice_number} />
            <ReceiptClient invoiceId={invoice.id} invoiceAmount={invoice.amount} totalPaid={totalPaid} />
          </div>
        </div>

        <InvoiceEditClient
          initialInvoice={invoice}
          customerName={customer?.name}
          propertyName={property?.name}
          paymentStatus={currentStatus}
          totalPaid={totalPaid}
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

