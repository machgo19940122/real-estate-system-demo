"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Pencil, Save, X, Loader, Printer } from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  CUSTOMER_CATEGORIES,
  staff,
  getStaffById,
  type Customer,
  type CustomerCategory,
} from "@/src/data/mock";
import { CustomerEnvelopeLabelModal } from "@/components/customer-envelope-label-modal";

export function CustomerDetailClient({ initialCustomer }: { initialCustomer: Customer }) {
  const [customer, setCustomer] = useState<Customer>(initialCustomer);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<Customer>(initialCustomer);
  const [labelModalOpen, setLabelModalOpen] = useState(false);

  // 住所編集用
  const [postalCode, setPostalCode] = useState("");
  const [prefecture, setPrefecture] = useState("");
  const [address, setAddress] = useState("");
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [addressError, setAddressError] = useState("");

  const canSave = useMemo(() => {
    return (
      draft.name.trim().length > 0 &&
      draft.phone.trim().length > 0 &&
      draft.address.trim().length > 0
    );
  }, [draft]);

  const handleFetchAddress = async () => {
    if (!postalCode.trim()) {
      setAddressError("郵便番号を入力してください");
      return;
    }

    setIsLoadingAddress(true);
    setAddressError("");

    try {
      const response = await fetch(
        `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${postalCode}`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const newPrefecture = result.address1;
        const newAddress = `${result.address2}${result.address3}`;
        setPrefecture(newPrefecture);
        setAddress(newAddress);
        // draftのaddressも更新
        setDraft({ ...draft, address: newPrefecture + newAddress });
      } else {
        setAddressError("郵便番号が見つかりません");
      }
    } catch (err) {
      setAddressError("住所の取得に失敗しました");
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const startEdit = () => {
    setDraft(customer);
    setPostalCode("");
    setPrefecture("");
    setAddress(customer.address || "");
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraft(customer);
    setAddressError("");
    setIsEditing(false);
  };

  const save = () => {
    const updated: Customer = {
      ...customer,
      name: draft.name.trim(),
      phone: draft.phone.trim(),
      email: (draft.email ?? "").trim(),
      phone2: draft.phone2?.trim() || undefined,
      honorific: draft.honorific?.trim() || undefined,
      category: draft.category || undefined,
      address: draft.address.trim(),
      postal_code: draft.postal_code?.trim() || undefined,
      staff_id: draft.staff_id,
      memo: draft.memo?.trim() || undefined,
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
            <div className="flex items-center gap-2">
              <Button onClick={() => setLabelModalOpen(true)} variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                封筒ラベル印刷
              </Button>
              <Button onClick={startEdit} variant="outline" size="sm">
                <Pencil className="h-4 w-4 mr-2" />
                編集
              </Button>
            </div>
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
      <CardContent className="pt-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500 mb-2">カテゴリ</p>
            {isEditing ? (
              <select
                value={draft.category ?? ""}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    category: (e.target.value || undefined) as CustomerCategory | undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              >
                <option value="">選択してください</option>
                {CUSTOMER_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            ) : (
              <p className="font-medium">{customer.category || "-"}</p>
            )}
          </div>
          <div className="hidden md:block" aria-hidden="true" />

          {/* 顧客名・宛先 */}
          <div>
            <p className="text-sm text-gray-500 mb-2">顧客名</p>
            {isEditing ? (
              <input
                type="text"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              />
            ) : (
              <p className="font-medium">{customer.name}</p>
            )}
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-2">宛先</p>
            {isEditing ? (
              <select
                value={draft.honorific ?? ""}
                onChange={(e) => setDraft({ ...draft, honorific: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              >
                <option value="">選択してください</option>
                <option value="様">様</option>
                <option value="御中">御中</option>
              </select>
            ) : (
              <p className="font-medium">{customer.honorific || "-"}</p>
            )}
          </div>

          {/* Row 2: 電話番号・電話番号２ */}
          <div>
            <p className="text-sm text-gray-500 mb-2">電話番号</p>
            {isEditing ? (
              <input
                type="tel"
                value={draft.phone}
                onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              />
            ) : (
              <p className="font-medium">{customer.phone}</p>
            )}
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-2">電話番号２</p>
            {isEditing ? (
              <input
                type="tel"
                value={draft.phone2 ?? ""}
                onChange={(e) => setDraft({ ...draft, phone2: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              />
            ) : (
              <p className="font-medium">{customer.phone2 || "-"}</p>
            )}
          </div>

          {/* Row 3: メールアドレス・担当者 */}
          <div>
            <p className="text-sm text-gray-500 mb-2">メールアドレス</p>
            {isEditing ? (
              <input
                type="email"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              />
            ) : (
              <p className="font-medium">{customer.email}</p>
            )}
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-2">担当者</p>
            {isEditing ? (
              <select
                value={draft.staff_id ?? ""}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    staff_id: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white"
              >
                <option value="">選択してください</option>
                {staff.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="font-medium">
                {customer.staff_id != null
                  ? getStaffById(customer.staff_id)?.name ?? "-"
                  : "-"}
              </p>
            )}
          </div>

          {/* Row 4: 郵便番号・都道府県 */}
          <div>
            <p className="text-sm text-gray-500 mb-2">郵便番号</p>
            {isEditing ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                  placeholder="150-0041"
                />
                <Button
                  type="button"
                  onClick={handleFetchAddress}
                  disabled={isLoadingAddress}
                  variant="outline"
                  size="sm"
                >
                  {isLoadingAddress ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    "取得"
                  )}
                </Button>
              </div>
            ) : (
              <p className="font-medium">{customer.postal_code || "-"}</p>
            )}
            {addressError && isEditing && <p className="text-sm text-red-500 mt-1">{addressError}</p>}
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-2">都道府県</p>
            {isEditing ? (
              <select
                value={prefecture}
                onChange={(e) => {
                  setPrefecture(e.target.value);
                  setDraft({ ...draft, address: e.target.value + address });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              >
                <option value="">選択してください</option>
                <option value="北海道">北海道</option>
                <option value="青森県">青森県</option>
                <option value="岩手県">岩手県</option>
                <option value="宮城県">宮城県</option>
                <option value="秋田県">秋田県</option>
                <option value="山形県">山形県</option>
                <option value="福島県">福島県</option>
                <option value="茨城県">茨城県</option>
                <option value="栃木県">栃木県</option>
                <option value="群馬県">群馬県</option>
                <option value="埼玉県">埼玉県</option>
                <option value="千葉県">千葉県</option>
                <option value="東京都">東京都</option>
                <option value="神奈川県">神奈川県</option>
                <option value="新潟県">新潟県</option>
                <option value="富山県">富山県</option>
                <option value="石川県">石川県</option>
                <option value="福井県">福井県</option>
                <option value="山梨県">山梨県</option>
                <option value="長野県">長野県</option>
                <option value="岐阜県">岐阜県</option>
                <option value="静岡県">静岡県</option>
                <option value="愛知県">愛知県</option>
                <option value="三重県">三重県</option>
                <option value="滋賀県">滋賀県</option>
                <option value="京都府">京都府</option>
                <option value="大阪府">大阪府</option>
                <option value="兵庫県">兵庫県</option>
                <option value="奈良県">奈良県</option>
                <option value="和歌山県">和歌山県</option>
                <option value="鳥取県">鳥取県</option>
                <option value="島根県">島根県</option>
                <option value="岡山県">岡山県</option>
                <option value="広島県">広島県</option>
                <option value="山口県">山口県</option>
                <option value="徳島県">徳島県</option>
                <option value="香川県">香川県</option>
                <option value="愛媛県">愛媛県</option>
                <option value="高知県">高知県</option>
                <option value="福岡県">福岡県</option>
                <option value="佐賀県">佐賀県</option>
                <option value="長崎県">長崎県</option>
                <option value="熊本県">熊本県</option>
                <option value="大分県">大分県</option>
                <option value="宮崎県">宮崎県</option>
                <option value="鹿児島県">鹿児島県</option>
                <option value="沖縄県">沖縄県</option>
              </select>
            ) : (
              <p className="font-medium">
                {customer.address?.split(/([^ ])/)[0] || "-"}
              </p>
            )}
          </div>

          {/* Row 5: 住所 */}
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500 mb-2">住所</p>
            {isEditing ? (
              <textarea
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setDraft({ ...draft, address: prefecture + e.target.value });
                }}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                placeholder="市区町村以降"
              />
            ) : (
              <p className="font-medium">{customer.address}</p>
            )}
          </div>

          {/* Row 6: 備考 */}
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500 mb-2">備考</p>
            {isEditing ? (
              <textarea
                value={draft.memo ?? ""}
                onChange={(e) => setDraft({ ...draft, memo: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                placeholder="追加の説明や注意事項"
              />
            ) : (
              <p className="font-medium whitespace-pre-wrap">{customer.memo || "-"}</p>
            )}
          </div>

          {/* 監査ログ */}
          <div className="md:col-span-2 pt-3 border-t text-xs text-gray-600">
            <div>登録: {customer.created_at ? formatDate(customer.created_at) : "-"} ({customer.created_by || "-"}) | 更新: {customer.updated_at ? formatDate(customer.updated_at) : "-"} ({customer.updated_by || "-"})</div>
          </div>
        </div>
      </CardContent>

      <CustomerEnvelopeLabelModal
        open={labelModalOpen}
        onOpenChange={setLabelModalOpen}
        customers={[customer]}
        enableQuantity
        defaultQuantity={1}
      />
    </Card>
  );
}

