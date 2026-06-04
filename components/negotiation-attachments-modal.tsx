"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { NegotiationAttachment, NegotiationHistory } from "@/src/data/mock";
import {
  formatFileSize,
  formatStorageGb,
  isPreviewableMime,
  NEGOTIATION_STORAGE_QUOTA_BYTES,
  nextAttachmentId,
  fileToAttachment,
} from "@/lib/negotiation-attachments";
import { FileText, Paperclip, X, Download, Trash2 } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  history: NegotiationHistory | null;
  attachments: NegotiationAttachment[];
  onAttachmentsChange: (attachments: NegotiationAttachment[]) => void;
};

export function NegotiationAttachmentsModal({
  open,
  onOpenChange,
  history,
  attachments,
  onAttachmentsChange,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const selected = useMemo(
    () => attachments.find((a) => a.id === selectedId) ?? attachments[0],
    [attachments, selectedId]
  );

  const usedBytes = useMemo(
    () => attachments.reduce((sum, a) => sum + a.size_bytes, 0),
    [attachments]
  );

  useEffect(() => {
    if (!open) return;
    setSelectedId(attachments[0]?.id ?? null);
  }, [open, history?.id, attachments]);

  if (!open || !history) return null;

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    let next = [...attachments];
    for (const file of Array.from(files)) {
      const att = await fileToAttachment(file, nextAttachmentId(next));
      next = [...next, att];
    }
    onAttachmentsChange(next);
    setSelectedId(next[next.length - 1]?.id ?? null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (id: number) => {
    if (!confirm("このファイルを削除しますか？")) return;
    const next = attachments.filter((a) => a.id !== id);
    onAttachmentsChange(next);
    if (selectedId === id) setSelectedId(next[0]?.id ?? null);
  };

  const downloadAttachment = (att: NegotiationAttachment) => {
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
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-5xl max-h-[90vh] flex flex-col border-0 shadow-xl overflow-hidden">
        <CardHeader className="border-b shrink-0 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-lg">添付ファイル</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                空き容量 {formatStorageGb(NEGOTIATION_STORAGE_QUOTA_BYTES - usedBytes)} /{" "}
                {formatStorageGb(NEGOTIATION_STORAGE_QUOTA_BYTES)}GB
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0"
              onClick={() => onOpenChange(false)}
              aria-label="閉じる"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            画像・PDF・テキストは右側でプレビューできます（デモ環境ではブラウザ上のみ保持）
          </p>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-4 pt-4">
          <div className="grid h-full min-h-[420px] gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <div className="flex flex-col gap-3 min-h-0">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => void handleFiles(e.target.files)}
              />
              <Button
                type="button"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-4 w-4 mr-2" />
                添付する
              </Button>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {attachments.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">
                    ファイルがありません。「添付する」から追加してください。
                  </p>
                ) : (
                  attachments.map((att) => {
                    const isSelected = selected?.id === att.id;
                    return (
                      <div
                        key={att.id}
                        className={`rounded-lg border p-3 bg-white transition-colors ${
                          isSelected
                            ? "border-blue-500 ring-1 ring-blue-500"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <button
                          type="button"
                          className="w-full text-left"
                          onClick={() => setSelectedId(att.id)}
                        >
                          <div className="flex items-start gap-2">
                            <FileText className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {att.file_name}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {att.mime_type} · {formatFileSize(att.size_bytes)} ·{" "}
                                {att.uploaded_at}
                              </p>
                              {att.tag ? (
                                <span className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                                  {att.tag}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </button>
                        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-100">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => removeAttachment(att.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            削除
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => downloadAttachment(att)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            ダウンロード
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex flex-col min-h-0 border border-gray-200 rounded-lg overflow-hidden bg-gray-50/50">
              <div className="px-3 py-2 border-b bg-white text-sm font-medium text-gray-700">
                プレビュー
              </div>
              <div className="flex-1 overflow-auto p-4 min-h-[280px]">
                {!selected ? (
                  <p className="text-sm text-gray-500 text-center py-12">
                    ファイルを選択するとプレビューが表示されます
                  </p>
                ) : (
                  <AttachmentPreview attachment={selected} history={history} />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AttachmentPreview({
  attachment,
  history,
}: {
  attachment: NegotiationAttachment;
  history: NegotiationHistory;
}) {
  if (!isPreviewableMime(attachment.mime_type)) {
    return (
      <div className="text-sm text-gray-600 text-center py-12">
        <p className="font-medium">{attachment.file_name}</p>
        <p className="mt-2 text-gray-500">この形式はプレビューできません。ダウンロードしてください。</p>
      </div>
    );
  }

  if (attachment.mime_type.startsWith("image/") && attachment.data_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={attachment.data_url}
        alt={attachment.file_name}
        className="max-w-full h-auto mx-auto rounded border border-gray-200 bg-white"
      />
    );
  }

  if (attachment.mime_type === "application/pdf" && attachment.data_url) {
    return (
      <iframe
        src={attachment.data_url}
        title={attachment.file_name}
        className="w-full h-[360px] rounded border border-gray-200 bg-white"
      />
    );
  }

  if (attachment.preview_text) {
    return (
      <pre className="text-xs text-gray-800 whitespace-pre-wrap font-mono bg-white p-4 rounded border border-gray-200">
        {attachment.preview_text}
      </pre>
    );
  }

  return (
    <div className="bg-sky-100 rounded-lg p-8 text-center text-gray-800 min-h-[200px] flex flex-col items-center justify-center">
      <p className="text-lg font-medium">添付サンプル画像</p>
      <p className="text-sm mt-3 text-gray-600">
        顧客ID: {history.customer_id} / 履歴ID: {history.id}
      </p>
      <p className="text-sm text-gray-600">ノルビー事務局（デモ）</p>
    </div>
  );
}
