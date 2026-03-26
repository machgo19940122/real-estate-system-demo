"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Calendar, MapPin, Pencil, Save, User, X } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { type Property, type PropertyCategory } from "@/src/data/mock";

export function PropertyDetailClient({ initialProperty }: { initialProperty: Property }) {
  const [property, setProperty] = useState<Property>(initialProperty);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<Property>(initialProperty);

  const canSave = useMemo(() => {
    return draft.name.trim().length > 0 && draft.address.trim().length > 0 && draft.owner.trim().length > 0;
  }, [draft]);

  const startEdit = () => {
    setDraft(property);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraft(property);
    setIsEditing(false);
  };

  const save = () => {
    const updated: Property = {
      ...property,
      name: draft.name.trim(),
      address: draft.address.trim(),
      owner: draft.owner.trim(),
      category: draft.category,
    };
    setProperty(updated);
    setDraft(updated);
    setIsEditing(false);
    alert("物件情報を更新しました（デモ / 保存処理は未実装）");
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            基本情報
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
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-start gap-3">
          <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
          <div className="w-full">
            <p className="text-sm text-gray-500">物件名</p>
            {isEditing ? (
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            ) : (
              <p className="font-medium">{property.name}</p>
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
              <p className="font-medium">{property.address}</p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <User className="h-5 w-5 text-gray-400 mt-0.5" />
          <div className="w-full">
            <p className="text-sm text-gray-500">所有者</p>
            {isEditing ? (
              <input
                value={draft.owner}
                onChange={(e) => setDraft({ ...draft, owner: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            ) : (
              <p className="font-medium">{property.owner}</p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
          <div className="w-full">
            <p className="text-sm text-gray-500">区分</p>
            {isEditing ? (
              <select
                value={draft.category ?? ""}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    category: (e.target.value || undefined) as PropertyCategory | undefined,
                  })
                }
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
              >
                <option value="">選択してください</option>
                <option value="新築">新築</option>
                <option value="土地">土地</option>
              </select>
            ) : (
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium bg-blue-50 text-blue-800">
                {property.category ?? "-"}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm text-gray-500">登録日</p>
            <p className="font-medium">
              {property.created_at ? formatDate(property.created_at) : "-"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

