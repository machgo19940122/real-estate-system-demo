"use client";

import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewPropertyPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("新規物件登録機能（ダミー）");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/properties">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              新規物件登録
            </h1>
            <p className="text-gray-600 mt-1">新しい物件情報を登録します</p>
          </div>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b">
            <CardTitle>物件情報</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="name" className="text-sm font-medium text-gray-700">
                    物件名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="渋谷マンション"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="address" className="text-sm font-medium text-gray-700">
                    住所 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="address"
                    type="text"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="東京都渋谷区1-1-1"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="owner" className="text-sm font-medium text-gray-700">
                    所有者 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="owner"
                    type="text"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="田中太郎"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="category" className="text-sm font-medium text-gray-700">
                    区分 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                  >
                    <option value="">選択してください</option>
                    <option value="注文">注文</option>
                    <option value="建売">建売</option>
                    <option value="土地">土地</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Link href="/properties">
                  <Button type="button" variant="outline">
                    キャンセル
                  </Button>
                </Link>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  登録する
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

