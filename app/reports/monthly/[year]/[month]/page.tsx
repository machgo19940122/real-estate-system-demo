import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  invoices,
  getRevenueCategory,
  getProjectById,
  getCustomerById,
  getPaymentsByInvoiceId,
  getTotalPaidAmount,
  type RevenueCategory,
} from "@/src/data/mock";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, Download, Lock, CheckCircle } from "lucide-react";
import Link from "next/link";
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

