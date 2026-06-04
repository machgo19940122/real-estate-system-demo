"use client";

import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  title: string;
  message: string;
  onYes: () => void;
  onNo: () => void;
};

/** はい / いいえ の確認ダイアログ */
export function YesNoDialog({ open, title, message, onYes, onNo }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="yes-no-dialog-title"
    >
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl border border-gray-200 p-5 space-y-4">
        <h2 id="yes-no-dialog-title" className="text-lg font-semibold text-gray-900">
          {title}
        </h2>
        <p className="text-sm text-gray-600 whitespace-pre-wrap">{message}</p>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onNo}>
            いいえ
          </Button>
          <Button type="button" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={onYes}>
            はい
          </Button>
        </div>
      </div>
    </div>
  );
}
