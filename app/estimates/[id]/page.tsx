import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  estimates,
  projects,
  getCustomerById,
  getPropertyById,
  getStaffById,
} from "@/src/data/mock";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EstimateDetailClient } from "./client";
import { EstimateEditClient } from "./edit-client";

export default async function EstimateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const estimate = estimates.find((e) => e.id === parseInt(id));

  if (!estimate) {
    notFound();
  }

  const project = projects.find((p) => p.id === (estimate as any).project_id);
  const customer = project ? getCustomerById(project.customer_id) : undefined;
  const property = project ? getPropertyById(project.property_id) : undefined;
  const staff = estimate.staff_id ? getStaffById(estimate.staff_id) : undefined;

  return (
    <AppLayout>
      <div className="space-y-6">
          <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/estimates">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                戻る
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {estimate.estimate_number}
              </h1>
              <p className="text-gray-600 mt-1">見積詳細</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <EstimateDetailClient
              estimateId={estimate.id}
              propertyId={property?.id}
              customerId={customer?.id}
              amount={estimate.total}
              revenueCategory={estimate.revenue_category}
            />
          </div>
        </div>

        <div className="grid gap-6">
          {/* 見積詳細 */}
          <EstimateEditClient
            initialEstimate={estimate}
            customerName={customer?.name}
            propertyName={property?.name}
            staffName={staff?.name}
          />
        </div>
      </div>
    </AppLayout>
  );
}

