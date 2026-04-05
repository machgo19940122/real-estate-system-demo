"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function ReportsAggregateHelpModal(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { open, onOpenChange } = props;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="flex max-h-[min(640px,90vh)] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reports-help-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-4 py-3 shrink-0">
          <h2 id="reports-help-title" className="text-lg font-semibold text-gray-900">
            集計画面の金額の計算
          </h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="閉じる"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-4 py-4 text-sm text-gray-700 space-y-5">
          <p className="text-xs text-gray-500 leading-relaxed">
            この画面はデモ用の集計です。実運用では会計・税務のルールに合わせて定義を確認してください。
          </p>

          <section>
            <h3 className="font-semibold text-gray-900 text-[13px] mb-2">1. 集計の期間</h3>
            <ul className="list-disc pl-4 space-y-1 text-[13px] leading-relaxed text-gray-600">
              <li>
                <strong className="text-gray-800">月次</strong>
                ：選択した暦月の1日〜末日（入金日はこの範囲で判定）。
              </li>
              <li>
                <strong className="text-gray-800">半期・通期</strong>
                ：会計年度ベース（6月〜翌5月が1期）。選択した「年度」は期首の6月が属する西暦年です。
              </li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 text-[13px] mb-2">2. どの請求が「対象」か</h3>
            <p className="text-[13px] leading-relaxed text-gray-600 mb-2">
              次の<strong>両方</strong>を満たす請求だけが集計に含まれます。
            </p>
            <ul className="list-disc pl-4 space-y-1 text-[13px] leading-relaxed text-gray-600">
              <li>これまでに一度でも入金がある（累計入金が0円の請求は除外）。</li>
              <li>
                選択した期間内に、<strong>いずれかの入金の入金日</strong>が1件でも含まれる。
              </li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 text-[13px] mb-2">3. 売上区分</h3>
            <p className="text-[13px] leading-relaxed text-gray-600">
              請求データの<strong>売上区分</strong>を優先し、未設定のときは<strong>案件タイプ</strong>から区分を決めます。
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 text-[13px] mb-2">4. 各金額の意味（この画面）</h3>
            <dl className="space-y-3 text-[13px] leading-relaxed text-gray-600">
              <div>
                <dt className="font-medium text-gray-800">期間内入金計上</dt>
                <dd className="mt-0.5 pl-0">
                  対象請求について、<strong>入金日が期間内</strong>に入る入金レコードの金額をすべて合計したものです。分割入金なら、期間内に入った分だけが加算されます。
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-800">請求金額（税込）合計</dt>
                <dd className="mt-0.5 pl-0">
                  期間内に1円でも入金があった対象請求について、それぞれの<strong>税込請求額（請求書合計）</strong>を1回ずつ足した合計です。部分入金でも請求額は丸ごと含めます。
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-800">原価金額（税込）</dt>
                <dd className="mt-0.5 pl-0">
                  上記と同じ対象請求について、請求に入力された<strong>原価（税込を優先、なければ税抜）</strong>を1回ずつ足した合計です。
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-800">利益額・利益率</dt>
                <dd className="mt-0.5 pl-0">
                  <strong>利益額</strong> ＝ 請求金額（税込）合計 − 原価合計。
                  <br />
                  <strong>利益率</strong> ＝ 利益額 ÷ 請求金額（税込）合計（請求ベースの粗利率）。
                  <br />
                  いずれも<strong>入金の金額ベースではなく、請求税込ベース</strong>でそろえています。
                </dd>
              </div>
            </dl>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 text-[13px] mb-2">5. 区分別の行（入金・請求税込・原価・利益・利益率）</h3>
            <p className="text-[13px] leading-relaxed text-gray-600">
              チェックした区分だけを合算します。各区分の「入金」は期間内入金、「請求税込」「原価」「利益」「利益率」は上記と同じ考え方で、区分ごとに集計しています。
            </p>
          </section>
        </div>

        <div className="border-t px-4 py-3 shrink-0">
          <Button type="button" variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
            閉じる
          </Button>
        </div>
      </div>
    </div>
  );
}
