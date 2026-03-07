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
import { projects, getCustomerById, getPropertyById, getStaffById } from "@/src/data/mock";
import { formatCurrency } from "@/lib/utils";
import { Search, X, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const query = searchQuery.toLowerCase();
    return projects.filter((project) => {
      const customer = getCustomerById(project.customer_id);
      const property = getPropertyById(project.property_id);
      const staff = project.staff_id ? getStaffById(project.staff_id) : undefined;
      return (
        project.name.toLowerCase().includes(query) ||
        customer?.name.toLowerCase().includes(query) ||
        property?.name.toLowerCase().includes(query) ||
        staff?.name.toLowerCase().includes(query) ||
        project.type.includes(query) ||
        project.status.includes(query)
      );
    });
  }, [searchQuery]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              案件一覧
            </h1>
            <p className="text-gray-600 mt-2">すべての案件を管理します</p>
          </div>
          <Link href="/projects/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新規案件登録
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
                placeholder="案件名、顧客名、物件名、担当者名で検索..."
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
                {filteredProjects.length}件の結果が見つかりました
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b">
            <CardTitle>案件一覧</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="font-semibold">案件名</TableHead>
                  <TableHead className="font-semibold">顧客</TableHead>
                  <TableHead className="font-semibold">物件</TableHead>
                  <TableHead className="font-semibold">担当者</TableHead>
                  <TableHead className="font-semibold">タイプ</TableHead>
                  <TableHead className="font-semibold">金額</TableHead>
                  <TableHead className="font-semibold">ステータス</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => {
                  const customer = getCustomerById(project.customer_id);
                  const property = getPropertyById(project.property_id);
                  const staff = project.staff_id ? getStaffById(project.staff_id) : undefined;
                  return (
                    <TableRow
                      key={project.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        <Link
                          href={`/projects/${project.id}`}
                          className="text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          {project.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/customers/${customer?.id}`}
                          className="text-gray-700 hover:text-blue-600 hover:underline"
                        >
                          {customer?.name || "-"}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/properties/${property?.id}`}
                          className="text-gray-700 hover:text-blue-600 hover:underline"
                        >
                          {property?.name || "-"}
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
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            project.type === "新築売買"
                              ? "bg-blue-100 text-blue-800"
                              : project.type === "中古売買"
                              ? "bg-purple-100 text-purple-800"
                              : project.type === "仲介"
                              ? "bg-indigo-100 text-indigo-800"
                              : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {project.type}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(project.price)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            project.status === "完了"
                              ? "bg-green-100 text-green-800"
                              : project.status === "契約済"
                              ? "bg-blue-100 text-blue-800"
                              : project.status === "工事中"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {project.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
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

