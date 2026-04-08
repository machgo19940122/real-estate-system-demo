"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { type NegotiationHistory } from "@/src/data/mock";
import { Paperclip, Download, Eye, Trash2, X, FileText, Image as ImageIcon, File } from "lucide-react";

type Draft = Pick<NegotiationHistory, "date" | "memo" | "entered_by">;

function nextId(items: NegotiationHistory[]): number {
  return items.length ? Math.max(...items.map((x) => x.id)) + 1 : 1;
}

type Attachment = {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  created_at: string; // YYYY-MM-DD
};

const ATTACHMENTS_KEY = "demo_negotiation_attachments_v1";

function safeParseJSON<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function todayYmd(): string {
  return new Date().toISOString().slice(0, 10);
}

function sampleImageDataUrl(label: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#EEF2FF"/>
      <stop offset="1" stop-color="#ECFEFF"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <rect x="48" y="48" width="864" height="444" rx="24" fill="#FFFFFF" stroke="#E5E7EB"/>
  <text x="96" y="150" font-size="44" font-family="system-ui, -apple-system, Segoe UI, Roboto" fill="#0F172A">添付サンプル画像</text>
  <text x="96" y="220" font-size="26" font-family="system-ui, -apple-system, Segoe UI, Roboto" fill="#334155">${label}</text>
  <text x="96" y="290" font-size="20" font-family="system-ui, -apple-system, Segoe UI, Roboto" fill="#64748B">プレビュー確認用（デモ）</text>
</svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

function downloadDataUrl(filename: string, dataUrl: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

function isPreviewable(a: Attachment): boolean {
  return a.type.startsWith("image/") || a.type === "application/pdf" || a.type.startsWith("text/");
}

function attachmentIcon(a: Attachment) {
  if (a.type.startsWith("image/")) return <ImageIcon className="h-4 w-4 text-blue-600" />;
  if (a.type === "application/pdf") return <FileText className="h-4 w-4 text-red-600" />;
  if (a.type.startsWith("text/")) return <FileText className="h-4 w-4 text-gray-700" />;
  return <File className="h-4 w-4 text-gray-500" />;
}

export function NegotiationHistoryClient({
  initialHistories,
}: {
  initialHistories: NegotiationHistory[];
}) {
  const [items, setItems] = useState<NegotiationHistory[]>(initialHistories);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // 添付ファイル（デモ: localStorage）
  const [attachmentsByHistoryId, setAttachmentsByHistoryId] = useState<Record<string, Attachment[]>>({});
  const [attachModalHistoryId, setAttachModalHistoryId] = useState<number | null>(null);
  const [viewing, setViewing] = useState<Attachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = safeParseJSON<Record<string, Attachment[]>>(window.localStorage.getItem(ATTACHMENTS_KEY));
    const base = stored && typeof stored === "object" ? stored : {};

    // デモ用シード：各顧客で「複数添付できる」が伝わるよう、最低2件は添付がある状態にする（既存データは上書きしない）
    const seeded = { ...base };
    const byCustomer = new Map<number, NegotiationHistory[]>();
    for (const h of initialHistories) {
      if (!byCustomer.has(h.customer_id)) byCustomer.set(h.customer_id, []);
      byCustomer.get(h.customer_id)!.push(h);
    }
    for (const [customerId, histories] of byCustomer.entries()) {
      const existingCount = histories.reduce((sum, h) => sum + (seeded[String(h.id)] ?? []).length, 0);
      if (existingCount >= 2) continue;
      const target = histories
        .slice()
        .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.id - a.id))[0];
      if (!target) continue;
      const historyKey = String(target.id);
      const current = seeded[historyKey] ?? [];

      const makeSeed = (idx: number): Attachment => {
        const dataUrl = sampleImageDataUrl(`顧客ID: ${customerId} / 履歴ID: ${target.id} / サンプル${idx}`);
        return {
          id: `seed_${target.id}_${idx}`,
          name: `添付サンプル画像_${idx}.svg`,
          type: "image/svg+xml",
          size: dataUrl.length,
          dataUrl,
          created_at: todayYmd(),
        };
      };

      const need = 2 - existingCount;
      const seeds = Array.from({ length: need }, (_, i) => makeSeed(existingCount + i + 1));
      seeded[historyKey] = [...seeds, ...current];
    }

    setAttachmentsByHistoryId(seeded);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ATTACHMENTS_KEY, JSON.stringify(attachmentsByHistoryId));
  }, [attachmentsByHistoryId]);

  const sorted = useMemo(() => {
    return items
      .slice()
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.id - a.id));
  }, [items]);

  const [addDraft, setAddDraft] = useState<Draft>({
    date: new Date().toISOString().slice(0, 10),
    memo: "",
    entered_by: "",
  });

  const [editDraft, setEditDraft] = useState<Draft>({
    date: "",
    memo: "",
    entered_by: "",
  });

  const startAdd = () => {
    setAddDraft({
      date: new Date().toISOString().slice(0, 10),
      memo: "",
      entered_by: "",
    });
    setIsAdding(true);
    setEditingId(null);
  };

  const cancelAdd = () => setIsAdding(false);

  const commitAdd = () => {
    const memo = addDraft.memo.trim();
    const enteredBy = addDraft.entered_by.trim();
    if (!addDraft.date || memo.length === 0 || enteredBy.length === 0) return;

    setItems((prev) => [
      {
        id: nextId(prev),
        customer_id: prev[0]?.customer_id ?? 0,
        date: addDraft.date,
        memo,
        entered_by: enteredBy,
      },
      ...prev,
    ]);
    setIsAdding(false);
  };

  const startEdit = (row: NegotiationHistory) => {
    setEditingId(row.id);
    setIsAdding(false);
    setEditDraft({ date: row.date, memo: row.memo, entered_by: row.entered_by });
  };

  const cancelEdit = () => setEditingId(null);

  const commitEdit = () => {
    if (editingId == null) return;
    const memo = editDraft.memo.trim();
    const enteredBy = editDraft.entered_by.trim();
    if (!editDraft.date || memo.length === 0 || enteredBy.length === 0) return;

    setItems((prev) =>
      prev.map((x) =>
        x.id === editingId
          ? { ...x, date: editDraft.date, memo, entered_by: enteredBy }
          : x
      )
    );
    setEditingId(null);
  };

  const remove = (id: number) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
    if (editingId === id) setEditingId(null);
    setAttachmentsByHistoryId((prev) => {
      const next = { ...prev };
      delete next[String(id)];
      return next;
    });
    if (attachModalHistoryId === id) setAttachModalHistoryId(null);
    if (viewing && attachModalHistoryId === id) setViewing(null);
  };

  const addDisabled =
    !addDraft.date || addDraft.memo.trim().length === 0 || addDraft.entered_by.trim().length === 0;
  const editDisabled =
    !editDraft.date || editDraft.memo.trim().length === 0 || editDraft.entered_by.trim().length === 0;

  const activeHistoryId = attachModalHistoryId;
  const activeAttachments = useMemo(() => {
    if (activeHistoryId == null) return [];
    return attachmentsByHistoryId[String(activeHistoryId)] ?? [];
  }, [attachmentsByHistoryId, activeHistoryId]);

  const openAttachModal = (historyId: number) => {
    setAttachModalHistoryId(historyId);
    setViewing(null);
  };

  const closeAttachModal = () => {
    setAttachModalHistoryId(null);
    setViewing(null);
  };

  const handlePickFiles = () => fileInputRef.current?.click();

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || activeHistoryId == null) return;
    const historyKey = String(activeHistoryId);

    const readOne = (file: File) =>
      new Promise<Attachment>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("File read error"));
        reader.onload = () => {
          resolve({
            id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
            name: file.name,
            type: file.type || "application/octet-stream",
            size: file.size,
            dataUrl: String(reader.result || ""),
            created_at: todayYmd(),
          });
        };
        reader.readAsDataURL(file);
      });

    // 1履歴に複数ファイル添付できる。今回選んだ分を追加（先頭に積む）。
    const nextAttachments: Attachment[] = [];
    for (const f of Array.from(files)) {
      try {
        nextAttachments.push(await readOne(f));
      } catch {
        // ignore
      }
    }
    if (nextAttachments.length > 0) {
      setAttachmentsByHistoryId((prev) => {
        const current = prev[historyKey] ?? [];
        return { ...prev, [historyKey]: [...nextAttachments, ...current] };
      });
    }

    // 同じファイルを連続で選べるようにクリア
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (attachmentId: string) => {
    if (activeHistoryId == null) return;
    const historyKey = String(activeHistoryId);
    const target = (attachmentsByHistoryId[historyKey] ?? []).find((a) => a.id === attachmentId);
    const ok = window.confirm(`添付ファイルを削除しますか？\n\n${target?.name ?? ""}`);
    if (!ok) return;
    setAttachmentsByHistoryId((prev) => {
      const current = prev[historyKey] ?? [];
      const nextList = current.filter((a) => a.id !== attachmentId);
      const next = { ...prev, [historyKey]: nextList };
      return next;
    });
    if (viewing?.id === attachmentId) setViewing(null);
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b flex items-center justify-between">
        <CardTitle>交渉履歴</CardTitle>
        {!isAdding ? (
          <Button variant="outline" size="sm" type="button" onClick={startAdd}>
            追加
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" type="button" onClick={cancelAdd}>
              キャンセル
            </Button>
            <Button size="sm" type="button" onClick={commitAdd} disabled={addDisabled}>
              追加する
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {isAdding && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">日付</p>
                <input
                  type="date"
                  value={addDraft.date}
                  onChange={(e) => setAddDraft((p) => ({ ...p, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                />
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-gray-500 mb-1">入力者</p>
                <input
                  value={addDraft.entered_by}
                  onChange={(e) => setAddDraft((p) => ({ ...p, entered_by: e.target.value }))}
                  placeholder="例: 佐藤花子"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">メモ</p>
              <textarea
                value={addDraft.memo}
                onChange={(e) => setAddDraft((p) => ({ ...p, memo: e.target.value }))}
                rows={3}
                placeholder="交渉の内容を入力"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
              />
            </div>
          </div>
        )}

        {sorted.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/60">
                <TableHead className="text-xs md:text-sm font-semibold">日付</TableHead>
                <TableHead className="text-xs md:text-sm font-semibold">メモ</TableHead>
                <TableHead className="text-xs md:text-sm font-semibold">入力者</TableHead>
                <TableHead className="text-xs md:text-sm font-semibold">添付</TableHead>
                <TableHead className="text-xs md:text-sm font-semibold text-right">
                  操作
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((row) => {
                const isEditing = editingId === row.id;
                const attachCount = (attachmentsByHistoryId[String(row.id)] ?? []).length;
                return (
                  <TableRow key={row.id} className="hover:bg-gray-50/60">
                    <TableCell className="text-xs md:text-sm">
                      {isEditing ? (
                        <input
                          type="date"
                          value={editDraft.date}
                          onChange={(e) =>
                            setEditDraft((p) => ({ ...p, date: e.target.value }))
                          }
                          className="w-[160px] px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                        />
                      ) : (
                        formatDate(row.date)
                      )}
                    </TableCell>
                    <TableCell className="text-xs md:text-sm text-gray-700 whitespace-normal">
                      {isEditing ? (
                        <textarea
                          value={editDraft.memo}
                          onChange={(e) =>
                            setEditDraft((p) => ({ ...p, memo: e.target.value }))
                          }
                          rows={2}
                          className="w-full min-w-[240px] px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                        />
                      ) : (
                        row.memo
                      )}
                    </TableCell>
                    <TableCell className="text-xs md:text-sm">
                      {isEditing ? (
                        <input
                          value={editDraft.entered_by}
                          onChange={(e) =>
                            setEditDraft((p) => ({ ...p, entered_by: e.target.value }))
                          }
                          className="w-[160px] px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                        />
                      ) : (
                        row.entered_by
                      )}
                    </TableCell>
                    <TableCell className="text-xs md:text-sm">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openAttachModal(row.id)}
                        className="h-8"
                      >
                        <Paperclip className="h-4 w-4 mr-2" />
                        添付{attachCount > 0 ? `（${attachCount}）` : ""}
                      </Button>
                      <p className="mt-1 text-[11px] text-gray-500">
                        複数ファイル添付OK。画像・PDFはモーダルでプレビューできます
                      </p>
                    </TableCell>
                    <TableCell className="text-xs md:text-sm text-right">
                      {!isEditing ? (
                        <div className="inline-flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            onClick={() => startEdit(row)}
                          >
                            編集
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            onClick={() => remove(row.id)}
                          >
                            削除
                          </Button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2">
                          <Button variant="outline" size="sm" type="button" onClick={cancelEdit}>
                            キャンセル
                          </Button>
                          <Button size="sm" type="button" onClick={commitEdit} disabled={editDisabled}>
                            保存
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <p className="text-gray-500 text-center py-4">交渉履歴はまだありません</p>
        )}

        {/* 添付ファイルモーダル */}
        {activeHistoryId != null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="flex max-h-[90vh] w-full max-w-[min(1100px,96vw)] flex-col overflow-hidden rounded-xl bg-white shadow-xl">
              <div className="flex items-start justify-between border-b px-4 py-3">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-gray-900">添付ファイル</h2>
                  <p className="text-sm text-gray-500">
                    交渉履歴ID: {activeHistoryId} · {activeAttachments.length}件
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    画像・PDF・テキストはこの画面内でプレビューできます（その他はダウンロード）。
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeAttachModal}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  aria-label="閉じる"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex min-h-0 flex-1 flex-col md:flex-row">
                <div className="w-full md:w-[360px] border-b md:border-b-0 md:border-r">
                  <div className="p-4 flex items-center justify-between gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      multiple
                      onChange={(e) => handleFilesSelected(e.target.files)}
                    />
                    <Button type="button" onClick={handlePickFiles} className="bg-blue-600 hover:bg-blue-700">
                      <Paperclip className="h-4 w-4 mr-2" />
                      添付する
                    </Button>
                  </div>

                  <div className="px-4 pb-4 space-y-2 overflow-auto max-h-[50vh] md:max-h-[calc(90vh-120px)]">
                    {activeAttachments.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4">
                        <p className="text-sm font-medium text-gray-900">添付ファイルはまだありません</p>
                        <p className="text-xs text-gray-500 mt-1">
                          「添付する」から追加できます。
                        </p>
                      </div>
                    ) : (
                      activeAttachments.map((a) => (
                        <div
                          key={a.id}
                          className={`rounded-lg border px-3 py-2 cursor-pointer ${viewing?.id === a.id ? "border-blue-400 bg-blue-50/50" : "border-gray-200 hover:bg-gray-50"}`}
                          role="button"
                          tabIndex={0}
                          onClick={() => setViewing(a)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") setViewing(a);
                          }}
                        >
                          <div className="flex items-start gap-2 min-w-0">
                            <div className="mt-0.5 shrink-0">{attachmentIcon(a)}</div>
                            <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">{a.name}</p>
                            <p className="text-[11px] text-gray-500 truncate">
                              {a.type} · {Math.ceil(a.size / 1024)}KB · {a.created_at}
                            </p>
                            {isPreviewable(a) && (
                              <span className="mt-1 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                                プレビュー可
                              </span>
                            )}
                            </div>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <Button type="button" size="sm" variant="outline" onClick={() => setViewing(a)}>
                              <Eye className="h-4 w-4 mr-2" />
                              閲覧
                            </Button>
                            <Button type="button" size="sm" variant="outline" onClick={() => downloadDataUrl(a.name, a.dataUrl)}>
                              <Download className="h-4 w-4 mr-2" />
                              ダウンロード
                            </Button>
                            <Button type="button" size="sm" variant="outline" onClick={() => removeAttachment(a.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              削除…
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="min-h-0 flex-1">
                  <div className="p-4 border-b">
                    <p className="text-sm font-semibold text-gray-900">プレビュー</p>
                    <p className="text-xs text-gray-500 mt-1">
                      画像・PDFはモーダル内で表示します。その他の形式はダウンロードして確認してください。
                    </p>
                  </div>
                  <div className="p-4 overflow-auto max-h-[50vh] md:max-h-[calc(90vh-140px)]">
                    {!viewing ? (
                      <p className="text-sm text-gray-500">
                        左のファイル一覧で、表示したいファイルをクリック（または「閲覧」）するとここに表示されます。
                      </p>
                    ) : viewing.type.startsWith("image/") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={viewing.dataUrl} alt={viewing.name} className="max-w-full h-auto rounded-lg border" />
                    ) : viewing.type === "application/pdf" ? (
                      <iframe title={viewing.name} src={viewing.dataUrl} className="w-full h-[60vh] rounded-lg border" />
                    ) : viewing.type.startsWith("text/") ? (
                      <iframe title={viewing.name} src={viewing.dataUrl} className="w-full h-[60vh] rounded-lg border" />
                    ) : (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                        このファイル形式はプレビューできません。右上の「ダウンロード」から確認してください。
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

