import type { NegotiationAttachment } from "@/src/data/mock";

export const NEGOTIATION_STORAGE_QUOTA_BYTES = 2 * 1024 * 1024 * 1024; // 2GB

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function formatStorageGb(bytes: number): string {
  const gb = bytes / (1024 * 1024 * 1024);
  return gb < 0.1 ? gb.toFixed(1) : gb.toFixed(1);
}

export function isPreviewableMime(mime: string): boolean {
  return (
    mime.startsWith("image/") ||
    mime === "application/pdf" ||
    mime.startsWith("text/")
  );
}

export function buildDemoSvgDataUrl(
  customerId: number,
  historyId: number,
  sampleIndex: number
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="240" viewBox="0 0 480 240">
    <rect width="100%" height="100%" fill="#e0f2fe"/>
    <text x="24" y="48" font-family="sans-serif" font-size="20" fill="#0f172a">添付サンプル画像</text>
    <text x="24" y="88" font-family="sans-serif" font-size="14" fill="#334155">顧客ID: ${customerId} / 履歴ID: ${historyId} / サンプル ${sampleIndex}</text>
    <text x="24" y="120" font-family="sans-serif" font-size="14" fill="#334155">ノルビー事務局（デモ）</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function createDemoAttachments(
  customerId: number,
  historyId: number
): NegotiationAttachment[] {
  return [
    {
      id: 1,
      file_name: "添付サンプル画像 1.svg",
      mime_type: "image/svg+xml",
      size_bytes: 747,
      uploaded_at: "2026-03-04",
      tag: "ノルビー一号",
      data_url: buildDemoSvgDataUrl(customerId, historyId, 1),
    },
    {
      id: 2,
      file_name: "添付サンプル画像 2.svg",
      mime_type: "image/svg+xml",
      size_bytes: 752,
      uploaded_at: "2026-03-04",
      tag: "ノルビー一号",
      data_url: buildDemoSvgDataUrl(customerId, historyId, 2),
    },
  ];
}

export function nextAttachmentId(items: NegotiationAttachment[]): number {
  return items.length ? Math.max(...items.map((a) => a.id)) + 1 : 1;
}

export async function fileToAttachment(
  file: File,
  nextId: number
): Promise<NegotiationAttachment> {
  const uploaded_at = new Date().toISOString().slice(0, 10);
  const base: NegotiationAttachment = {
    id: nextId,
    file_name: file.name,
    mime_type: file.type || "application/octet-stream",
    size_bytes: file.size,
    uploaded_at,
  };

  if (file.type.startsWith("image/")) {
    const data_url = await readAsDataURL(file);
    return { ...base, data_url };
  }
  if (file.type.startsWith("text/") || file.name.endsWith(".txt") || file.name.endsWith(".csv")) {
    const preview_text = await readAsText(file);
    return { ...base, preview_text };
  }
  if (file.type === "application/pdf") {
    const data_url = await readAsDataURL(file);
    return { ...base, data_url };
  }
  return base;
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
