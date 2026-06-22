import type { Estimate } from "@/src/data/mock";

const ESTIMATE_NUMBER_RE = /^EST-(\d+)$/i;

/** 連番から見積番号（例: 13 → EST-013） */
export function formatEstimateNumber(sequence: number): string {
  return `EST-${String(sequence).padStart(3, "0")}`;
}

/** 見積番号から連番を取得。EST-形式以外は null */
export function parseEstimateNumber(
  estimateNumber: string
): { sequence: number } | null {
  const m = ESTIMATE_NUMBER_RE.exec(estimateNumber.trim());
  if (!m) return null;
  const sequence = Number(m[1]);
  if (!Number.isFinite(sequence) || sequence < 1) return null;
  return { sequence };
}

/** 既存見積の EST-連番の最大値 + 1（移行用の独自形式は連番計算に含めない） */
export function nextEstimateSequence(
  existing: Pick<Estimate, "estimate_number">[]
): number {
  let max = 0;
  for (const est of existing) {
    const parsed = parseEstimateNumber(est.estimate_number);
    if (!parsed) continue;
    max = Math.max(max, parsed.sequence);
  }
  return max + 1;
}

/** 次に採番する見積番号 */
export function nextEstimateNumber(
  existing: Pick<Estimate, "estimate_number">[]
): string {
  return formatEstimateNumber(nextEstimateSequence(existing));
}

export function isEstimateNumberTaken(
  existing: Pick<Estimate, "id" | "estimate_number">[],
  estimateNumber: string,
  excludeId?: number
): boolean {
  const normalized = estimateNumber.trim();
  if (!normalized) return false;
  return existing.some(
    (est) =>
      est.estimate_number.trim() === normalized &&
      (excludeId == null || est.id !== excludeId)
  );
}
