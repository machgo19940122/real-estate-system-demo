"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Calendar, Mail, MapPin, Pencil, Phone, Save, X } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { type Customer } from "@/src/data/mock";

export function CustomerDetailClient({ initialCustomer }: { initialCustomer: Customer }) {
  const [customer, setCustomer] = useState<Customer>(initialCustomer);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<Customer>(initialCustomer);

  const canSave = useMemo(() => {
    return (
      draft.name.trim().length > 0 &&
      draft.phone.trim().length > 0 &&
      draft.email.trim().length > 0 &&
      draft.address.trim().length > 0
    );
  }, [draft]);

  const startEdit = () => {
    setDraft(customer);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraft(customer);
    setIsEditing(false);
  };

  const save = () => {
    const updated: Customer = {
      ...customer,
      name: draft.name.trim(),
      phone: draft.phone.trim(),
      email: draft.email.trim(),
      address: draft.address.trim(),
      billing_contact_name: draft.billing_contact_name?.trim() || undefined,
      billing_contact_email: draft.billing_contact_email?.trim() || undefined,
      billing_closing_day: draft.billing_closing_day?.trim() || undefined,
      billing_payment_site: draft.billing_payment_site?.trim() || undefined,
      billing_payment_method: draft.billing_payment_method?.trim() || undefined,
    };
    setCustomer(updated);
    setDraft(updated);
    setIsEditing(false);
    alert("顧客情報を更新しました（デモ / 保存処理は未実装）");
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            基本情報・請求関連
          </CardTitle>
          {!isEditing ? (
            <Button onClick={startEdit} variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-2" />
              編集
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button onClick={cancelEdit} variant="outline" size="sm">
                <X className="h-4 w-4 mr-2" />
                キャンセル
              </Button>
              <Button
                onClick={save}
                size="sm"
                disabled={!canSave}
                className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                更新
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="w-full">
                <p className="text-sm text-gray-500">電話番号</p>
                {isEditing ? (
                  <input
                    value={draft.phone}
                    onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                ) : (
                  <p className="font-medium">{customer.phone}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="w-full">
                <p className="text-sm text-gray-500">メールアドレス</p>
                {isEditing ? (
                  <input
                    value={draft.email}
                    onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                ) : (
                  <p className="font-medium">{customer.email}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="w-full">
                <p className="text-sm text-gray-500">住所</p>
                {isEditing ? (
                  <input
                    value={draft.address}
                    onChange={(e) => setDraft({ ...draft, address: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                ) : (
                  <p className="font-medium">{customer.address}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">登録日</p>
                <p className="font-medium">
                  {customer.created_at ? formatDate(customer.created_at) : "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 mb-1">請求先担当者</p>
              {isEditing ? (
                <input
                  value={draft.billing_contact_name ?? ""}
                  onChange={(e) =>
                    setDraft({ ...draft, billing_contact_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              ) : (
                <p className="font-medium">{customer.billing_contact_name || "-"}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">請求先メールアドレス</p>
              {isEditing ? (
                <input
                  value={draft.billing_contact_email ?? ""}
                  onChange={(e) =>
                    setDraft({ ...draft, billing_contact_email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              ) : (
                <p className="font-medium">{customer.billing_contact_email || "-"}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">締め条件</p>
                {isEditing ? (
                  <input
                    value={draft.billing_closing_day ?? ""}
                    onChange={(e) =>
                      setDraft({ ...draft, billing_closing_day: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                ) : (
                  <p className="font-medium">{customer.billing_closing_day || "-"}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">支払サイト</p>
                {isEditing ? (
                  <input
                    value={draft.billing_payment_site ?? ""}
                    onChange={(e) =>
                      setDraft({ ...draft, billing_payment_site: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                ) : (
                  <p className="font-medium">{customer.billing_payment_site || "-"}</p>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">支払方法</p>
              {isEditing ? (
                <input
                  value={draft.billing_payment_method ?? ""}
                  onChange={(e) =>
                    setDraft({ ...draft, billing_payment_method: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              ) : (
                <p className="font-medium">{customer.billing_payment_method || "-"}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

