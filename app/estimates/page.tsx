"use client";

import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { estimates, getProjectById, getStaffById } from "@/src/data/mock";
import { formatCurrency, formatDate } from "@/lib/utils";
import { FileDown, Search, X, Plus } from "lucide-react";
import Link from "next/link";

export default function EstimatesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEstimates = useMemo(() => {
    if (!searchQuery.trim()) return estimates;
    const query = searchQuery.toLowerCase();
    return estimates.filter((estimate) => {
      const project = getProjectById(estimate.project_id);
      const staff = estimate.staff_id ? getStaffById(estimate.staff_id) : undefined;
      return (
        estimate.estimate_number.toLowerCase().includes(query) ||
        project?.name.toLowerCase().includes(query) ||
        staff?.name.toLowerCase().includes(query)
      );
    });
  }, [searchQuery]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              見積一覧
            </h1>
            <p className="text-gray-600 mt-2">すべての見積を管理します</p>
          </div>
          <Link href="/estimates/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新規見積登録
            </Button>
          </Link>
        </div>

        {/* 検索バー */}
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="見積番号、案件名、担当者名で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="text-sm text-gray-500 mt-2">
                {filteredEstimates.length}件の結果が見つかりました
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b">
            <CardTitle>見積一覧</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="font-semibold">見積番号</TableHead>
                  <TableHead className="font-semibold">案件名</TableHead>
                  <TableHead className="font-semibold">担当者</TableHead>
                  <TableHead className="font-semibold">小計</TableHead>
                  <TableHead className="font-semibold">消費税</TableHead>
                  <TableHead className="font-semibold">合計</TableHead>
                  <TableHead className="font-semibold">作成日</TableHead>
                  <TableHead className="font-semibold">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEstimates.length > 0 ? (
                  filteredEstimates.map((estimate) => {
                  const project = getProjectById(estimate.project_id);
                  const staff = estimate.staff_id ? getStaffById(estimate.staff_id) : undefined;
                  return (
                    <TableRow
                      key={estimate.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        <Link
                          href={`/estimates/${estimate.id}`}
                          className="text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          {estimate.estimate_number}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/projects/${project?.id}`}
                          className="text-gray-700 hover:text-blue-600 hover:underline"
                        >
                          {project?.name || "-"}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {staff ? (
                          <Link
                            href={`/staff/${staff.id}`}
                            className="text-gray-700 hover:text-blue-600 hover:underline"
                          >
                            {staff.name}
                          </Link>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>{formatCurrency(estimate.subtotal)}</TableCell>
                      <TableCell>{formatCurrency(estimate.tax)}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(estimate.total)}
                      </TableCell>
                      <TableCell>{formatDate(estimate.created_at)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // PDF出力（ダミー）
                            alert("PDF出力機能（ダミー）");
                          }}
                        >
                          <FileDown className="h-4 w-4 mr-2" />
                          PDF出力
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      検索結果が見つかりませんでした
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

