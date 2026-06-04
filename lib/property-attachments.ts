import type { PropertyAttachment } from "@/src/data/mock";
import {
  fileToAttachment,
  formatFileSize,
  isPreviewableMime,
  nextAttachmentId,
} from "@/lib/negotiation-attachments";

export const PROPERTY_ATTACHMENT_MAX_COUNT = 10;

export { formatFileSize, isPreviewableMime, fileToAttachment, nextAttachmentId };

export function buildPropertyDemoSvgDataUrl(
  propertyId: number,
  sampleIndex: number
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="240" viewBox="0 0 480 240">
    <rect width="100%" height="100%" fill="#ecfdf5"/>
    <text x="24" y="48" font-family="sans-serif" font-size="20" fill="#0f172a">物件添付サンプル</text>
    <text x="24" y="88" font-family="sans-serif" font-size="14" fill="#334155">物件ID: ${propertyId} / 資料 ${sampleIndex}</text>
    <text x="24" y="120" font-family="sans-serif" font-size="14" fill="#334155">新築物件（デモ）</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function createDemoPropertyAttachments(propertyId: number): PropertyAttachment[] {
  const uploaded_at = "2026-03-01";
  return [1, 2].map((index) => ({
    id: index,
    file_name: `物件資料サンプル_${index}.svg`,
    mime_type: "image/svg+xml",
    size_bytes: 720 + index,
    uploaded_at,
    data_url: buildPropertyDemoSvgDataUrl(propertyId, index),
  }));
}

export function enrichPropertyAttachments(
  propertyId: number,
  attachments: PropertyAttachment[]
): PropertyAttachment[] {
  return attachments.map((att, index) => {
    if (att.data_url || att.preview_text) return att;
    if (att.mime_type.startsWith("image/")) {
      return {
        ...att,
        data_url: buildPropertyDemoSvgDataUrl(propertyId, index + 1),
      };
    }
    return att;
  });
}

export function storageKeyForPropertyAttachments(propertyId: number): string {
  return `demo_property_attachments_v1_${propertyId}`;
}
