import {
  companyBankAccounts,
  payees,
  type CompanyBankAccount,
  type Payee,
  type TransferBatch,
  type TransferBatchItem,
} from "@/src/data/mock";
import { transferAmountFromBillingGross } from "@/lib/payee-transfer-amount";

const COMPANY_ACCOUNTS_KEY = "demo_company_bank_accounts_v1";
/** 旧デモ: 振込先を localStorage に保存していた名残を削除 */
const LEGACY_PAYEES_KEY = "demo_payees_v1";
const BATCHES_KEY = "demo_transfer_batches_v1";
const ITEMS_KEY = "demo_transfer_batch_items_v1";
const BATCHES_SEEDED_KEY = "demo_transfer_batches_seeded_v1";

const DEMO_BATCHES_SEED: TransferBatch[] = [
  {
    id: 1,
    batch_number: "ZFB-20260315-0001",
    company_bank_account_id: 1,
    transfer_date: "2026-03-25",
    status: "confirmed",
    total_count: 2,
    total_amount: 638000,
    created_at: "2026-03-15",
    created_by: "田中次郎",
  },
  {
    id: 2,
    batch_number: "ZFB-20260310-0002",
    company_bank_account_id: 2,
    transfer_date: "2026-03-18",
    status: "exported",
    total_count: 1,
    total_amount: 385000,
    created_at: "2026-03-10",
    created_by: "佐藤花子",
    exported_at: "2026-03-11",
    file_name: "zengin_sample_0002.txt",
  },
];

const DEMO_ITEMS_SEED: TransferBatchItem[] = [
  {
    id: 1,
    batch_id: 1,
    payee_id: 1,
    amount: 550000,
    description_kana: "ｹﾝｾﾂ",
    bank_code: "0177",
    bank_name_kana: "ﾌｸｵｶ",
    branch_code: "201",
    branch_name_kana: "ﾊｶﾀ",
    account_type: "普通",
    account_number: "0001234",
    account_name_kana: "ｶﾌﾞ)ｹﾝｾﾂﾏﾙ",
  },
  {
    id: 2,
    batch_id: 1,
    payee_id: 2,
    amount: 88000,
    description_kana: "ﾃﾞﾝｷ",
    bank_code: "0190",
    bank_name_kana: "ﾆｼﾆﾎﾝｼﾃｲ",
    branch_code: "301",
    branch_name_kana: "ﾖｶﾞ",
    account_type: "当座",
    account_number: "1230000",
    account_name_kana: "ﾔﾏﾀﾞﾃﾞﾝｷｺｳｼﾞ",
  },
  {
    id: 3,
    batch_id: 2,
    payee_id: 3,
    amount: 385000,
    description_kana: "ｼﾞﾙｮｳ",
    bank_code: "0177",
    bank_name_kana: "ﾌｸｵｶ",
    branch_code: "105",
    branch_name_kana: "ﾅｶｽ",
    account_type: "普通",
    account_number: "5555555",
    account_name_kana: "ｶﾌﾞ)ｼｲﾚｻｷ",
  },
];

function ensureDemoBatchesSeeded() {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(BATCHES_SEEDED_KEY) === "true") return;

  const batches = safeParseJSON<TransferBatch[]>(window.localStorage.getItem(BATCHES_KEY)) ?? [];
  const items = safeParseJSON<TransferBatchItem[]>(window.localStorage.getItem(ITEMS_KEY)) ?? [];
  if (batches.length === 0 && items.length === 0) {
    window.localStorage.setItem(BATCHES_KEY, JSON.stringify(DEMO_BATCHES_SEED));
    window.localStorage.setItem(ITEMS_KEY, JSON.stringify(DEMO_ITEMS_SEED));
  }
  window.localStorage.setItem(BATCHES_SEEDED_KEY, "true");
}

function todayYmd(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function safeParseJSON<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

let legacyPayeesStorageCleared = false;
function clearLegacyPayeesStorage() {
  if (typeof window === "undefined" || legacyPayeesStorageCleared) return;
  legacyPayeesStorageCleared = true;
  try {
    window.localStorage.removeItem(LEGACY_PAYEES_KEY);
  } catch {
    /* ignore */
  }
}

function nextId(items: { id: number }[]): number {
  return (items.reduce((max, it) => Math.max(max, it.id), 0) || 0) + 1;
}

export function getCompanyBankAccounts() {
  return loadCompanyBankAccounts();
}

export function loadCompanyBankAccounts(): CompanyBankAccount[] {
  if (typeof window === "undefined") return companyBankAccounts;
  const stored = safeParseJSON<CompanyBankAccount[]>(window.localStorage.getItem(COMPANY_ACCOUNTS_KEY));
  if (stored && Array.isArray(stored) && stored.length > 0) return stored;
  window.localStorage.setItem(COMPANY_ACCOUNTS_KEY, JSON.stringify(companyBankAccounts));
  return companyBankAccounts;
}

export function saveCompanyBankAccounts(next: CompanyBankAccount[]) {
  window.localStorage.setItem(COMPANY_ACCOUNTS_KEY, JSON.stringify(next));
}

export function getCompanyBankAccountById(id: number): CompanyBankAccount | undefined {
  return loadCompanyBankAccounts().find((a) => a.id === id);
}

export function addCompanyBankAccount(input: Omit<CompanyBankAccount, "id">): CompanyBankAccount {
  const current = loadCompanyBankAccounts();
  const created: CompanyBankAccount = {
    id: nextId(current),
    ...input,
  };
  const next = [created, ...current];
  saveCompanyBankAccounts(next);
  return created;
}

export function updateCompanyBankAccount(
  id: number,
  patch: Partial<Omit<CompanyBankAccount, "id">>
): CompanyBankAccount {
  const current = loadCompanyBankAccounts();
  const idx = current.findIndex((a) => a.id === id);
  if (idx < 0) throw new Error(`Company bank account not found: ${id}`);
  const next = [...current];
  next[idx] = { ...next[idx], ...patch };
  saveCompanyBankAccounts(next);
  return next[idx];
}

export function deleteCompanyBankAccount(id: number) {
  const current = loadCompanyBankAccounts();
  saveCompanyBankAccounts(current.filter((a) => a.id !== id));
}

export function loadPayees(): Payee[] {
  clearLegacyPayeesStorage();
  return payees;
}

export function savePayees(next: Payee[]) {
  payees.length = 0;
  for (const p of next) {
    payees.push({ ...p });
  }
}

export function addPayee(input: Omit<Payee, "id" | "created_at" | "is_active"> & { is_active?: boolean }): Payee {
  const current = loadPayees();
  const created: Payee = {
    id: nextId(current),
    created_at: todayYmd(),
    is_active: input.is_active ?? true,
    ...input,
  };
  const next = [created, ...current];
  savePayees(next);
  return created;
}

export function getPayeeById(id: number): Payee | undefined {
  return loadPayees().find((p) => p.id === id);
}

export function updatePayee(id: number, patch: Partial<Omit<Payee, "id" | "created_at">>): Payee {
  const current = loadPayees();
  const idx = current.findIndex((p) => p.id === id);
  if (idx < 0) throw new Error(`Payee not found: ${id}`);
  const next = [...current];
  next[idx] = { ...next[idx], ...patch };
  savePayees(next);
  return next[idx];
}

export function deletePayee(id: number) {
  const current = loadPayees();
  savePayees(current.filter((p) => p.id !== id));
}

/** 一覧・詳細で使う表示用バッチ番号（保存済みがなければレガシー形式） */
export function getTransferBatchDisplayNumber(batch: TransferBatch): string {
  if (batch.batch_number?.trim()) return batch.batch_number.trim();
  return `ZF-${String(batch.id).padStart(6, "0")}`;
}

export function loadBatches(): TransferBatch[] {
  if (typeof window === "undefined") return [];
  ensureDemoBatchesSeeded();
  return safeParseJSON<TransferBatch[]>(window.localStorage.getItem(BATCHES_KEY)) ?? [];
}

export function saveBatches(next: TransferBatch[]) {
  window.localStorage.setItem(BATCHES_KEY, JSON.stringify(next));
}

export function loadBatchItems(): TransferBatchItem[] {
  if (typeof window === "undefined") return [];
  ensureDemoBatchesSeeded();
  return safeParseJSON<TransferBatchItem[]>(window.localStorage.getItem(ITEMS_KEY)) ?? [];
}

export function saveBatchItems(next: TransferBatchItem[]) {
  window.localStorage.setItem(ITEMS_KEY, JSON.stringify(next));
}

export function createTransferBatch(params: {
  company_bank_account_id: number;
  transfer_date: string; // YYYY-MM-DD
  created_by: string;
  items: Array<{
    payee_id: number;
    amount: number;
    description_kana: string;
  }>;
}): { batch: TransferBatch; items: TransferBatchItem[] } {
  const payees = loadPayees();
  const batches = loadBatches();
  const allItems = loadBatchItems();

  const id = nextId(batches);
  const createdAt = todayYmd();

  const itemsCreated: TransferBatchItem[] = params.items.map((src, idx) => {
    const payee = payees.find((p) => p.id === src.payee_id);
    if (!payee) {
      throw new Error(`Payee not found: ${src.payee_id}`);
    }
    const billingGross = Number(src.amount) || 0;
    const { transferAmount, billingGrossAmount } = transferAmountFromBillingGross(payee, billingGross);
    return {
      id: nextId(allItems) + idx,
      batch_id: id,
      payee_id: payee.id,
      amount: transferAmount,
      billing_gross_amount: billingGrossAmount,
      description_kana: src.description_kana ?? "",
      bank_code: payee.bank_code,
      bank_name_kana: payee.bank_name_kana,
      branch_code: payee.branch_code,
      branch_name_kana: payee.branch_name_kana,
      account_type: payee.account_type,
      account_number: payee.account_number,
      account_name_kana: payee.account_name_kana,
    };
  });

  const total_amount = itemsCreated.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
  const total_count = itemsCreated.length;

  const batch: TransferBatch = {
    id,
    batch_number: `ZFB-${createdAt.replace(/-/g, "")}-${String(id).padStart(4, "0")}`,
    company_bank_account_id: params.company_bank_account_id,
    transfer_date: params.transfer_date,
    status: "confirmed",
    total_amount,
    total_count,
    created_at: createdAt,
    created_by: params.created_by,
  };

  const nextBatches = [batch, ...batches];
  const nextItems = [...itemsCreated, ...allItems];
  saveBatches(nextBatches);
  saveBatchItems(nextItems);

  return { batch, items: itemsCreated };
}

export function getBatchById(id: number): TransferBatch | undefined {
  return loadBatches().find((b) => b.id === id);
}

export function getBatchItemsByBatchId(batchId: number): TransferBatchItem[] {
  return loadBatchItems().filter((it) => it.batch_id === batchId);
}

export function updateTransferBatch(
  id: number,
  patch: Partial<Omit<TransferBatch, "id" | "created_at" | "exported_at" | "file_name">>
): TransferBatch {
  const batches = loadBatches();
  const idx = batches.findIndex((b) => b.id === id);
  if (idx < 0) throw new Error(`Batch not found: ${id}`);
  const next = [...batches];
  next[idx] = { ...next[idx], ...patch };
  saveBatches(next);
  return next[idx];
}

export function replaceBatchItems(params: {
  batchId: number;
  items: Array<{ payee_id: number; amount: number; description_kana: string }>;
}): TransferBatchItem[] {
  const payees = loadPayees();
  const all = loadBatchItems();
  const remaining = all.filter((it) => it.batch_id !== params.batchId);
  const startId = nextId(remaining);

  const created: TransferBatchItem[] = params.items.map((src, idx) => {
    const payee = payees.find((p) => p.id === src.payee_id);
    if (!payee) throw new Error(`Payee not found: ${src.payee_id}`);
    const billingGross = Number(src.amount) || 0;
    const { transferAmount, billingGrossAmount } = transferAmountFromBillingGross(payee, billingGross);
    return {
      id: startId + idx,
      batch_id: params.batchId,
      payee_id: payee.id,
      amount: transferAmount,
      billing_gross_amount: billingGrossAmount,
      description_kana: src.description_kana ?? "",
      bank_code: payee.bank_code,
      bank_name_kana: payee.bank_name_kana,
      branch_code: payee.branch_code,
      branch_name_kana: payee.branch_name_kana,
      account_type: payee.account_type,
      account_number: payee.account_number,
      account_name_kana: payee.account_name_kana,
    };
  });

  saveBatchItems([...created, ...remaining]);
  return created;
}

export function markBatchExported(batchId: number, fileName: string) {
  const batches = loadBatches();
  const idx = batches.findIndex((b) => b.id === batchId);
  if (idx < 0) return;
  const next = [...batches];
  next[idx] = {
    ...next[idx],
    status: "exported",
    exported_at: todayYmd(),
    file_name: fileName,
  };
  saveBatches(next);
}
