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
import { properties } from "@/src/data/mock";
import { formatDate } from "@/lib/utils";
import { Search, X, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PropertiesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProperties = useMemo(() => {
    if (!searchQuery.trim()) return properties;
    const query = searchQuery.toLowerCase();
    return properties.filter(
      (property) =>
        property.name.toLowerCase().includes(query) ||
        property.address.toLowerCase().includes(query) ||
        property.owner.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              物件一覧
            </h1>
            <p className="text-gray-600 mt-2">すべての物件を管理します</p>
          </div>
          <Link href="/properties/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新規物件登録
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
                placeholder="物件名、住所、所有者で検索..."
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
                {filteredProperties.length}件の結果が見つかりました
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b">
            <CardTitle>物件一覧</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="font-semibold">物件名</TableHead>
                  <TableHead className="font-semibold">住所</TableHead>
                  <TableHead className="font-semibold">所有者</TableHead>
                  <TableHead className="font-semibold">登録日</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProperties.length > 0 ? (
                  filteredProperties.map((property) => (
                  <TableRow
                    key={property.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <TableCell className="font-medium">
                      <Link
                        href={`/properties/${property.id}`}
                        className="text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        {property.name}
                      </Link>
                    </TableCell>
                    <TableCell>{property.address}</TableCell>
                    <TableCell>{property.owner}</TableCell>
                    <TableCell>
                      {property.created_at
                        ? formatDate(property.created_at)
                        : "-"}
                    </TableCell>
                  </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
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

