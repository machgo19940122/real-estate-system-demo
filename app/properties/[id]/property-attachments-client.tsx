"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { PropertyAttachment } from "@/src/data/mock";
import {
  buildPropertyDemoSvgDataUrl,
  createDemoPropertyAttachments,
  enrichPropertyAttachments,
  fileToAttachment,
  formatFileSize,
  isPreviewableMime,
  nextAttachmentId,
  PROPERTY_ATTACHMENT_MAX_COUNT,
  storageKeyForPropertyAttachments,
} from "@/lib/property-attachments";
import { Download, FileText, Image as ImageIcon, Paperclip, Trash2 } from "lucide-react";

function loadStored(propertyId: number): PropertyAttachment[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKeyForPropertyAttachments(propertyId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PropertyAttachment[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function attachmentIcon(mime: string) {
  if (mime.startsWith("image/"))
    return <ImageIcon className="h-3.5 w-3.5 text-blue-600 shrink-0" />;
  if (mime === "application/pdf")
    return <FileText className="h-3.5 w-3.5 text-red-600 shrink-0" />;
  return <FileText className="h-3.5 w-3.5 text-gray-500 shrink-0" />;
}

function downloadAttachment(att: PropertyAttachment) {
  if (att.data_url) {
    const a = document.createElement("a");
    a.href = att.data_url;
    a.download = att.file_name;
    a.click();
    return;
  }
  if (att.preview_text) {
    const blob = new Blob([att.preview_text], { type: att.mime_type || "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = att.file_name;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }
  alert(`ダウンロード（デモ）: ${att.file_name}`);
}

function AttachmentPreview({
  attachment,
  propertyId,
}: {
  attachment: PropertyAttachment;
  propertyId: number;
}) {
  if (!isPreviewableMime(attachment.mime_type)) {
    return (
      <p className="text-xs text-gray-500 text-center py-6">
        プレビュー不可 — ダウンロードしてください
      </p>
    );
  }

  if (attachment.mime_type.startsWith("image/") && attachment.data_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={attachment.data_url}
        alt={attachment.file_name}
        className="max-w-full max-h-[180px] h-auto mx-auto rounded border border-gray-200 bg-white object-contain"
      />
    );
  }

  if (attachment.mime_type === "application/pdf" && attachment.data_url) {
    return (
      <iframe
        src={attachment.data_url}
        title={attachment.file_name}
        className="w-full h-[180px] rounded border border-gray-200 bg-white"
      />
    );
  }

  if (attachment.preview_text) {
    return (
      <pre className="text-[11px] text-gray-800 whitespace-pre-wrap font-mono bg-white p-2 rounded border border-gray-200 max-h-[180px] overflow-auto">
        {attachment.preview_text}
      </pre>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={buildPropertyDemoSvgDataUrl(propertyId, attachment.id)}
      alt={attachment.file_name}
      className="max-w-full max-h-[180px] h-auto mx-auto rounded border border-gray-200 bg-white object-contain"
    />
  );
}

export function PropertyAttachmentsClient({
  propertyId,
  initialAttachments,
}: {
  propertyId: number;
  initialAttachments?: PropertyAttachment[];
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<PropertyAttachment[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadStored(propertyId);
    let base: PropertyAttachment[];
    if (stored) {
      base = stored;
    } else if (initialAttachments?.length) {
      base = initialAttachments;
    } else if (propertyId === 1) {
      base = createDemoPropertyAttachments(propertyId);
    } else {
      base = [];
    }
    const enriched = enrichPropertyAttachments(propertyId, base);
    setAttachments(enriched);
    setSelectedId(enriched[0]?.id ?? null);
    setHydrated(true);
  }, [propertyId, initialAttachments]);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    window.localStorage.setItem(
      storageKeyForPropertyAttachments(propertyId),
      JSON.stringify(attachments)
    );
  }, [attachments, propertyId, hydrated]);

  const selected = useMemo(
    () => attachments.find((a) => a.id === selectedId) ?? attachments[0],
    [attachments, selectedId]
  );

  const atLimit = attachments.length >= PROPERTY_ATTACHMENT_MAX_COUNT;

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const slots = PROPERTY_ATTACHMENT_MAX_COUNT - attachments.length;
    if (slots <= 0) {
      alert(`添付資料は最大${PROPERTY_ATTACHMENT_MAX_COUNT}件までです`);
      return;
    }
    const toAdd = Array.from(files).slice(0, slots);
    if (toAdd.length < files.length) {
      alert(`最大${PROPERTY_ATTACHMENT_MAX_COUNT}件のため、${toAdd.length}件のみ追加しました`);
    }
    let next = [...attachments];
    for (const file of toAdd) {
      const att = await fileToAttachment(file, nextAttachmentId(next));
      next = [...next, att as PropertyAttachment];
    }
    setAttachments(next);
    setSelectedId(next[next.length - 1]?.id ?? null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (id: number) => {
    if (!confirm("この添付資料を削除しますか？")) return;
    const next = attachments.filter((a) => a.id !== id);
    setAttachments(next);
    if (selectedId === id) setSelectedId(next[0]?.id ?? null);
  };

  if (!hydrated) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b py-3">
          <CardTitle className="text-base">添付資料</CardTitle>
        </CardHeader>
        <CardContent className="py-6 text-center text-xs text-gray-500">読み込み中…</CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b py-3 flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <CardTitle className="text-base shrink-0">添付資料</CardTitle>
          <span className="text-xs text-gray-500 tabular-nums shrink-0">
            {attachments.length}/{PROPERTY_ATTACHMENT_MAX_COUNT}
          </span>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => void handleFiles(e.target.files)}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={atLimit}
          className="h-8 shrink-0"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="h-3.5 w-3.5 mr-1.5" />
          追加
        </Button>
      </CardHeader>
      <CardContent className="pt-3 pb-4">
        {attachments.length === 0 ? (
          <div className="flex items-center justify-between gap-3 rounded-md border border-dashed border-gray-200 bg-gray-50/80 px-4 py-3">
            <p className="text-xs text-gray-500">添付資料はまだありません（最大10件）</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 shrink-0"
              onClick={() => fileInputRef.current?.click()}
            >
              追加
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-[1fr_minmax(200px,280px)]">
            <div className="min-w-0 border border-gray-200 rounded-md overflow-hidden">
              <div className="max-h-[220px] overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0 z-[1]">
                    <tr className="text-gray-500 border-b border-gray-200">
                      <th className="text-left font-medium px-2 py-1.5">ファイル名</th>
                      <th className="text-right font-medium px-2 py-1.5 w-14 hidden sm:table-cell">
                        サイズ
                      </th>
                      <th className="text-right font-medium px-2 py-1.5 w-20 hidden md:table-cell">
                        登録日
                      </th>
                      <th className="w-[72px] px-1 py-1.5" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {attachments.map((att) => {
                      const isSelected = selected?.id === att.id;
                      return (
                        <tr
                          key={att.id}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? "bg-blue-50" : "hover:bg-gray-50/80"
                          }`}
                          onClick={() => setSelectedId(att.id)}
                        >
                          <td className="px-2 py-1.5">
                            <div className="flex items-center gap-1.5 min-w-0">
                              {attachmentIcon(att.mime_type)}
                              <span className="font-medium text-gray-900 truncate">
                                {att.file_name}
                              </span>
                            </div>
                          </td>
                          <td className="px-2 py-1.5 text-right text-gray-500 hidden sm:table-cell">
                            {formatFileSize(att.size_bytes)}
                          </td>
                          <td className="px-2 py-1.5 text-right text-gray-500 hidden md:table-cell">
                            {att.uploaded_at}
                          </td>
                          <td className="px-1 py-0.5" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-0.5">
                              <button
                                type="button"
                                title="ダウンロード"
                                className="p-1 rounded text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                                onClick={() => downloadAttachment(att)}
                              >
                                <Download className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                title="削除"
                                className="p-1 rounded text-gray-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => removeAttachment(att.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col border border-gray-200 rounded-md overflow-hidden bg-gray-50/50 min-h-0">
              <div className="px-2 py-1 border-b bg-white text-xs font-medium text-gray-600 truncate">
                {selected ? selected.file_name : "プレビュー"}
              </div>
              <div className="flex-1 overflow-auto p-2 min-h-[120px] max-h-[220px]">
                {selected ? (
                  <AttachmentPreview attachment={selected} propertyId={propertyId} />
                ) : (
                  <p className="text-xs text-gray-400 text-center py-8">行を選択</p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
