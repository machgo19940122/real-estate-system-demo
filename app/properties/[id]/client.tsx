"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PropertyFormFields,
  applyPropertyFormValues,
  propertyFormCanSave,
  propertyToFormValues,
  type PropertyFormValues,
} from "@/components/property-form-fields";
import { Building2, Calendar, Pencil, Save, X } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { customers, type Property } from "@/src/data/mock";

export function PropertyDetailClient({ initialProperty }: { initialProperty: Property }) {
  const [property, setProperty] = useState<Property>(initialProperty);
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState<PropertyFormValues>(() =>
    propertyToFormValues(initialProperty, customers)
  );

  const canSave = useMemo(() => propertyFormCanSave(formValues), [formValues]);

  const startEdit = () => {
    setFormValues(propertyToFormValues(property, customers));
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setFormValues(propertyToFormValues(property, customers));
    setIsEditing(false);
  };

  const handleChange = (patch: Partial<PropertyFormValues>) => {
    setFormValues((prev) => ({ ...prev, ...patch }));
  };

  const save = () => {
    if (!canSave) return;
    const updated = applyPropertyFormValues(property, formValues, customers);
    setProperty(updated);
    setFormValues(propertyToFormValues(updated, customers));
    setIsEditing(false);
    alert("物件情報を更新しました（デモ / 保存処理は未実装）");
  };

  const displayValues = isEditing
    ? formValues
    : propertyToFormValues(property, customers);

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
      <CardContent className="pt-6 space-y-6">
        <PropertyFormFields
          values={displayValues}
          onChange={handleChange}
          customers={customers}
          readOnly={!isEditing}
        />

        <div className="flex items-start gap-3 pt-4 border-t">
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
