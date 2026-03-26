"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { customers, properties, staff } from "@/src/data/mock";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CustomerCombobox } from "@/components/customer-combobox";
import { PropertyCombobox } from "@/components/property-combobox";

export default function NewProjectPage() {
  const [customerId, setCustomerId] = useState("");
  const [propertyId, setPropertyId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      alert("顧客を選択してください");
      return;
    }
    if (!propertyId) {
      alert("物件を選択してください");
      return;
    }
    alert("新規案件登録機能（ダミー）");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/projects">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              新規案件登録
            </h1>
            <p className="text-gray-600 mt-1">新しい案件情報を登録します</p>
          </div>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b">
            <CardTitle>案件情報</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="name" className="text-sm font-medium text-gray-700">
                    案件名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="渋谷リフォーム"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="customer" className="text-sm font-medium text-gray-700">
                    顧客 <span className="text-red-500">*</span>
                  </label>
                  <CustomerCombobox customers={customers} value={customerId} onChange={setCustomerId} />
                </div>

                <div className="space-y-2">
                  <label htmlFor="property" className="text-sm font-medium text-gray-700">
                    物件 <span className="text-red-500">*</span>
                  </label>
                  <PropertyCombobox properties={properties} value={propertyId} onChange={setPropertyId} />
                </div>

                <div className="space-y-2">
                  <label htmlFor="staff" className="text-sm font-medium text-gray-700">
                    担当者
                  </label>
                  <select
                    id="staff"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                  >
                    <option value="">選択してください</option>
                    {staff.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="type" className="text-sm font-medium text-gray-700">
                    案件タイプ <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="type"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                  >
                    <option value="">選択してください</option>
                    <option value="新築売買">新築売買</option>
                    <option value="中古売買">中古売買</option>
                    <option value="仲介">仲介</option>
                    <option value="リフォーム">リフォーム</option>
                  </select>
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
                    <option value="見積中">見積中</option>
                    <option value="契約済">契約済</option>
                    <option value="工事中">工事中</option>
                    <option value="完了">完了</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="price" className="text-sm font-medium text-gray-700">
                    金額 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="price"
                    type="number"
                    required
                    min="0"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="500000"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Link href="/projects">
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

