"use client";

import { useMemo, useState } from "react";
import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PropertyFormFields,
  propertyFormCanSave,
  type PropertyFormValues,
} from "@/components/property-form-fields";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { customers } from "@/src/data/mock";

const emptyValues: PropertyFormValues = {
  name: "",
  chiban: "",
  postal_code: "",
  prefecture: "",
  address: "",
  category: "",
  memo: "",
  sale_price: "",
  owner_customer_id: "",
};

export default function NewPropertyPage() {
  const [values, setValues] = useState<PropertyFormValues>(emptyValues);

  const canSubmit = useMemo(() => propertyFormCanSave(values), [values]);

  const handleChange = (patch: Partial<PropertyFormValues>) => {
    setValues((prev) => ({ ...prev, ...patch }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
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
              <PropertyFormFields
                values={values}
                onChange={handleChange}
                customers={customers}
              />

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Link href="/properties">
                  <Button type="button" variant="outline">
                    キャンセル
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={!canSubmit}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
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
