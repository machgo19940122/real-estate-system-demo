import type { BankAccountType, CompanyBankAccount, TransferBatchItem } from "@/src/data/mock";

function padRight(value: string, len: number, fill = " "): string {
  const s = value ?? "";
  if (s.length >= len) return s.slice(0, len);
  return s + fill.repeat(len - s.length);
}

function padLeft(value: string, len: number, fill = "0"): string {
  const s = value ?? "";
  if (s.length >= len) return s.slice(-len);
  return fill.repeat(len - s.length) + s;
}

function toAccountTypeCode(t: BankAccountType): string {
  // 全銀: 1=普通, 2=当座, 9=その他
  return t === "当座" ? "2" : "1";
}

function mmdd(date: string): string {
  // YYYY-MM-DD -> MMDD
  const m = date.slice(5, 7);
  const d = date.slice(8, 10);
  return `${m}${d}`;
}

function ensure120(record: string): string {
  if (record.length !== 120) {
    throw new Error(`Zengin record length must be 120, got ${record.length}`);
  }
  return record;
}

export function buildZenginTransferFile(params: {
  transferDate: string; // YYYY-MM-DD
  companyAccount: CompanyBankAccount;
  items: TransferBatchItem[];
}): { fileName: string; content: string } {
  const { transferDate, companyAccount, items } = params;

  const totalCount = items.length;
  const totalAmount = items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);

  const header =
    "1" +
    "21" + // 総合振込
    "0" + // コード区分（0=JIS）
    padLeft(companyAccount.client_code.replaceAll(/\D/g, ""), 10, "0") +
    padRight(companyAccount.account_name_kana ?? "", 40, " ") +
    padLeft(mmdd(transferDate), 4, "0") +
    padLeft(companyAccount.bank_code.replaceAll(/\D/g, ""), 4, "0") +
    padRight(companyAccount.bank_name_kana ?? "", 15, " ") +
    padLeft(companyAccount.branch_code.replaceAll(/\D/g, ""), 3, "0") +
    padRight(companyAccount.branch_name_kana ?? "", 15, " ") +
    toAccountTypeCode(companyAccount.account_type) +
    padLeft(companyAccount.account_number.replaceAll(/\D/g, ""), 7, "0") +
    padRight("", 17, " ");

  const detailRecords = items.map((it) => {
    const detail =
      "2" +
      padLeft(it.bank_code.replaceAll(/\D/g, ""), 4, "0") +
      padRight(it.bank_name_kana ?? "", 15, " ") +
      padLeft(it.branch_code.replaceAll(/\D/g, ""), 3, "0") +
      padRight(it.branch_name_kana ?? "", 15, " ") +
      "0000" + // 手形交換所番号
      toAccountTypeCode(it.account_type) +
      padLeft(it.account_number.replaceAll(/\D/g, ""), 7, "0") +
      padRight(it.account_name_kana ?? "", 30, " ") +
      padLeft(String(Number(it.amount) || 0), 10, "0") +
      "0" + // 新規コード
      padRight("", 20, " ") + // 顧客コード/EDI情報
      "7" + // 振込区分（電信振込）
      " " + // 識別表示
      padRight("", 7, " ");
    return ensure120(detail);
  });

  const trailer =
    "8" +
    padLeft(String(totalCount), 6, "0") +
    padLeft(String(totalAmount), 12, "0") +
    padRight("", 101, " ");

  const end = "9" + padRight("", 119, " ");

  const records = [
    ensure120(header),
    ...detailRecords,
    ensure120(trailer),
    ensure120(end),
  ];

  const content = records.join("\r\n") + "\r\n";
  const fileName = `ZENGIN_総合振込_${transferDate.replaceAll("-", "")}_${companyAccount.bank_code}.txt`;
  return { fileName, content };
}

