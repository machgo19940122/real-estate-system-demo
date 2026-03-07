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
import { staff } from "@/src/data/mock";
import { formatDate } from "@/lib/utils";
import { Search, X, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function StaffPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStaff = useMemo(() => {
    if (!searchQuery.trim()) return staff;
    const query = searchQuery.toLowerCase();
    return staff.filter(
      (member) =>
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        member.department.toLowerCase().includes(query) ||
        member.role.includes(query)
    );
  }, [searchQuery]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              担当者一覧
            </h1>
            <p className="text-gray-600 mt-2">社内の担当者を管理します</p>
          </div>
          <Link href="/staff/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新規担当者登録
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
                placeholder="氏名、メール、部署、役職で検索..."
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
                {filteredStaff.length}件の結果が見つかりました
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b">
            <CardTitle>担当者一覧</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="font-semibold">氏名</TableHead>
                  <TableHead className="font-semibold">メールアドレス</TableHead>
                  <TableHead className="font-semibold">電話番号</TableHead>
                  <TableHead className="font-semibold">役職</TableHead>
                  <TableHead className="font-semibold">部署</TableHead>
                  <TableHead className="font-semibold">登録日</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.length > 0 ? (
                  filteredStaff.map((member) => (
                  <TableRow
                    key={member.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <TableCell className="font-medium">
                      <Link
                        href={`/staff/${member.id}`}
                        className="text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        {member.name}
                      </Link>
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.phone}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          member.role === "管理者"
                            ? "bg-purple-100 text-purple-800"
                            : member.role === "営業"
                            ? "bg-blue-100 text-blue-800"
                            : member.role === "現場監督"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {member.role}
                      </span>
                    </TableCell>
                    <TableCell>{member.department}</TableCell>
                    <TableCell>
                      {member.created_at ? formatDate(member.created_at) : "-"}
                    </TableCell>
                  </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
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

