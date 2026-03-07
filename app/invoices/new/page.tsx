"use client";

import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { projects } from "@/src/data/mock";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewInvoicePage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("新規請求登録機能（ダミー）");
  };

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
              新規請求登録
            </h1>
            <p className="text-gray-600 mt-1">新しい請求情報を登録します</p>
          </div>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b">
            <CardTitle>請求情報</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="project" className="text-sm font-medium text-gray-700">
                    案件 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="project"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                  >
                    <option value="">選択してください</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="amount" className="text-sm font-medium text-gray-700">
                    請求金額 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="amount"
                    type="number"
                    required
                    min="0"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="550000"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="due_date" className="text-sm font-medium text-gray-700">
                    支払期限 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="due_date"
                    type="date"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="status" className="text-sm font-medium text-gray-700">
                    ステータス <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="status"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                  >
                    <option value="">選択してください</option>
                    <option value="未請求">未請求</option>
                    <option value="未入金">未入金</option>
                    <option value="入金済">入金済</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Link href="/invoices">
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

