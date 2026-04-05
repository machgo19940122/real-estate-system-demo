/**
 * 振込先マスタで「メイン利用」の銀行として絞り込み表示するための定義。
 * コードはデモデータ（mock）の companyBankAccounts / payees と揃えています。
 */
export const PAYEE_MAIN_BANK_CODES = {
  /** 福岡銀行 */
  fukuoka: "0177",
  /** 西日本シティ銀行（通称: 西銀） */
  nishigin: "0190",
} as const;

export type PayeeBankFilterValue = "all" | (typeof PAYEE_MAIN_BANK_CODES)[keyof typeof PAYEE_MAIN_BANK_CODES];

/** 一覧の銀行セレクト用（見積一覧の「区分」と同様のプルダウン） */
export const PAYEE_BANK_SELECT_OPTIONS: {
  value: PayeeBankFilterValue;
  label: string;
}[] = [
  { value: "all", label: "全銀行" },
  { value: PAYEE_MAIN_BANK_CODES.fukuoka, label: "福岡銀行" },
  { value: PAYEE_MAIN_BANK_CODES.nishigin, label: "西銀（西日本シティ）" },
];

export function isPayeeMainBankCode(code: string): boolean {
  return (
    code === PAYEE_MAIN_BANK_CODES.fukuoka || code === PAYEE_MAIN_BANK_CODES.nishigin
  );
}
