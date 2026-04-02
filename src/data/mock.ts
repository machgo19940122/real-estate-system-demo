export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  /** 郵便番号（例: 150-0041）。封筒ラベル等で使用 */
  postal_code?: string;
  address: string;
  // 請求関連設定（ダミー）
  billing_contact_name?: string; // 請求先担当者
  billing_contact_email?: string; // 請求先メール
  billing_closing_day?: string; // 締め日（末締め / 20日締め など）
  billing_payment_site?: string; // 支払サイト（翌月末払い など）
  billing_payment_method?: string; // 支払方法（振込 / 口座振替 など）
  created_at?: string;
}

// 交渉履歴（顧客に複数紐づく想定）
export interface NegotiationHistory {
  id: number;
  customer_id: number;
  date: string; // YYYY-MM-DD
  memo: string;
  entered_by: string;
}

export type PropertyCategory = "新築" | "土地";

export interface Property {
  id: number;
  name: string;
  address: string;
  owner: string;
  category?: PropertyCategory;
  created_at?: string;
}

export interface Estimate {
  id: number;
  customer_id?: number;
  property_id?: number;
  /** 案件ID（未廃止時はこちらで顧客・物件を紐づけ） */
  project_id?: number;
  estimate_number: string;
  staff_id?: number;
  revenue_category?: RevenueCategory;
  note?: string;
  subtotal: number;
  tax: number;
  total: number;
  created_at: string;
  items?: EstimateItem[];
}

export interface EstimateItem {
  id: number;
  name: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export type InvoiceStatus = "有" | "無し";

// 入金状況（入金額から自動判定）
export type PaymentStatus = "未入金" | "一部入金" | "入金済み";

// 請求書の明細行
export interface InvoiceItem {
  id: number;
  name: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface Invoice {
  id: number;
  customer_id?: number;
  property_id?: number;
  /** 案件ID（未廃止時はこちらで顧客・物件を紐づけ） */
  project_id?: number;
  staff_id?: number;
  revenue_category?: RevenueCategory;
  invoice_number: string;
  note?: string;
  amount: number;
  due_date: string;
  status: InvoiceStatus;
  created_at: string;
  items?: InvoiceItem[];
  /**
   * 原価額（税込・円）。請求合計（税込）と同じ土俵で利益額・利益率を算出する。
   * デモでは税込原価を入力する運用に変更。
   */
  cost_amount_including_tax?: number;
  /**
   * 旧: 原価額（税抜・円）。互換のため残す（表示・計算は税込を優先）。
   */
  cost_amount_excluding_tax?: number;
  /**
   * 原価率（税抜売上に対する原価の割合）。0〜1 の小数（例: 0.65 は 65%）。
   * 税抜売上 > 0 のとき 原価額÷税抜売上 で算出して保持する想定。
   */
  cost_rate?: number;
  /**
   * 利益率（税抜売上に対する粗利益率）。0〜1 の小数（例: 0.35 は 35%）。
   * 税抜売上 > 0 のとき (税抜売上−原価額)÷税抜売上 で算出して保持する想定。
   */
  profit_margin_rate?: number;
}

// 入金レコード（1つの請求に対して複数可能）
export type PaymentMethod = "振込" | "現金" | "小切手" | "その他";

export interface Payment {
  id: number;
  invoice_id: number;
  amount: number;
  payment_date: string;
  payment_method: PaymentMethod;
  note?: string;
  created_at: string;
}

// 売上区分
export type RevenueCategory = "新築" | "リフォーム" | "土地" | "仲介料";

// 案件（見積・請求の紐づけ用。顧客・物件・担当者・区分をまとめる）
export type ProjectType = "新築売買" | "中古売買" | "仲介" | "リフォーム";
export interface Project {
  id: number;
  name: string;
  type: ProjectType;
  status: string;
  customer_id: number;
  property_id: number;
  staff_id?: number;
  price: number;
  created_at?: string;
}

// 月次集計
export interface MonthlySummary {
  id: number;
  year: number;
  month: number; // 1-12
  category: RevenueCategory;
  amount: number;
  invoice_count: number;
  created_at: string;
  closed_at?: string;
  is_closed: boolean;
}

export type StaffRole = "管理者" | "営業" | "事務" | "現場監督";

// 請求書から売上区分を取得（請求の revenue_category を優先、なければ案件から算出）
export function getInvoiceRevenueCategory(invoice: Invoice): RevenueCategory {
  if (invoice.revenue_category) return invoice.revenue_category;
  const project = projects.find((p) => p.id === invoice.project_id);
  if (!project) return "新築";
  return getRevenueCategory(project.type);
}

// 請求書から担当者IDを取得（請求の staff_id を優先、なければ案件から）
export function getInvoiceStaffId(invoice: Invoice): number | undefined {
  if (invoice.staff_id != null) return invoice.staff_id;
  const project = projects.find((p) => p.id === invoice.project_id);
  return project?.staff_id;
}

export interface Staff {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  department: string;
  created_at?: string;
}

// 顧客：個人・法人、請求情報あり/なし、取引多/少など様々なパターン
export const customers: Customer[] = [
  {
    id: 1,
    name: "田中太郎",
    phone: "090-1234-5678",
    email: "taro@test.com",
    postal_code: "150-0041",
    address: "東京都渋谷区神南1-1-1",
    billing_contact_name: "田中 経理担当",
    billing_contact_email: "billing-tanaka@test.com",
    billing_closing_day: "毎月末締め",
    billing_payment_site: "翌月末払い",
    billing_payment_method: "銀行振込",
    created_at: "2025-01-15",
  },
  {
    id: 2,
    name: "株式会社サンプル",
    phone: "03-1234-5678",
    email: "info@sample.co.jp",
    postal_code: "154-0004",
    address: "東京都世田谷区三軒茶屋2-2-2",
    billing_contact_name: "総務部 経理ご担当者様",
    billing_contact_email: "keiri@sample.co.jp",
    billing_closing_day: "20日締め",
    billing_payment_site: "翌々月10日払い",
    billing_payment_method: "銀行振込",
    created_at: "2025-02-01",
  },
  {
    id: 3,
    name: "佐藤花子",
    phone: "080-9876-5432",
    email: "hanako@example.com",
    postal_code: "160-0023",
    address: "東京都新宿区西新宿3-3-3",
    created_at: "2025-02-10",
  },
  {
    id: 4,
    name: "鈴木一郎",
    phone: "090-1111-2222",
    email: "ichiro@test.com",
    postal_code: "106-0032",
    address: "東京都港区六本木4-4-4",
    billing_contact_name: "鈴木",
    billing_payment_method: "振込",
    created_at: "2025-02-20",
  },
  {
    id: 5,
    name: "高橋美咲",
    phone: "070-3333-4444",
    email: "misaki@example.com",
    postal_code: "153-0063",
    address: "東京都目黒区目黒5-5-5",
    created_at: "2025-03-01",
  },
  {
    id: 6,
    name: "株式会社建設丸",
    phone: "03-5555-6666",
    email: "info@kensetsumaru.co.jp",
    postal_code: "141-0032",
    address: "東京都品川区大崎6-6-6",
    billing_contact_name: "経理部",
    billing_closing_day: "25日締め",
    billing_payment_site: "翌月25日払い",
    created_at: "2025-03-10",
  },
];

// 交渉履歴：顧客ごとに複数件（デモ用）
export const negotiationHistories: NegotiationHistory[] = [
  {
    id: 1,
    customer_id: 1,
    date: "2026-02-12",
    memo: "リフォーム内容のヒアリング。キッチン・浴室の優先度が高い。概算希望。",
    entered_by: "佐藤花子",
  },
  {
    id: 2,
    customer_id: 1,
    date: "2026-02-15",
    memo: "概算見積を送付。予算感の確認待ち。",
    entered_by: "佐藤花子",
  },
  {
    id: 3,
    customer_id: 2,
    date: "2026-03-02",
    memo: "土地仲介手数料の条件確認。契約時期と支払い条件を調整中。",
    entered_by: "田中次郎",
  },
  {
    id: 4,
    customer_id: 3,
    date: "2026-03-10",
    memo: "購入希望条件の整理。エリアは新宿近辺、予算上限9,500万。",
    entered_by: "鈴木一郎",
  },
  {
    id: 5,
    customer_id: 4,
    date: "2026-03-06",
    memo: "物件内覧を実施。内覧後その場で申込、契約手続きへ。",
    entered_by: "佐藤花子",
  },
];

export function getNegotiationHistoriesByCustomerId(customerId: number): NegotiationHistory[] {
  return negotiationHistories
    .filter((h) => h.customer_id === customerId)
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.id - a.id));
}

// 物件：新築・土地、複数顧客に紐づけ
export const properties: Property[] = [
  {
    id: 1,
    name: "渋谷マンションA",
    address: "東京都渋谷区神南1-1-1",
    owner: "田中太郎",
    category: "新築",
    created_at: "2025-01-20",
  },
  {
    id: 2,
    name: "世田谷戸建",
    address: "東京都世田谷区三軒茶屋2-2-2",
    owner: "株式会社サンプル",
    category: "新築",
    created_at: "2025-02-05",
  },
  {
    id: 3,
    name: "新宿アパート",
    address: "東京都新宿区西新宿3-3-3",
    owner: "佐藤花子",
    category: "新築",
    created_at: "2025-02-15",
  },
  {
    id: 4,
    name: "港区タワーマンション",
    address: "東京都港区六本木4-4-4",
    owner: "鈴木一郎",
    category: "土地",
    created_at: "2025-02-25",
  },
  {
    id: 5,
    name: "目黒区新築一戸建",
    address: "東京都目黒区目黒5-5-5",
    owner: "高橋美咲",
    category: "新築",
    created_at: "2025-03-05",
  },
  {
    id: 6,
    name: "品川オフィスビル",
    address: "東京都品川区大崎6-6-6",
    owner: "株式会社建設丸",
    category: "新築",
    created_at: "2025-03-10",
  },
  {
    id: 7,
    name: "渋谷マンションB",
    address: "東京都渋谷区道玄坂1-2-3",
    owner: "田中太郎",
    category: "新築",
    created_at: "2025-03-15",
  },
  {
    id: 8,
    name: "千代田区地番123",
    address: "東京都千代田区丸の内7-7-7",
    owner: "株式会社サンプル",
    category: "土地",
    created_at: "2025-03-20",
  },
];

// 案件：顧客・物件・担当者・区分を紐づけ（見積・請求は project_id で参照）
export const projects: Project[] = [
  { id: 1, name: "渋谷リフォーム", type: "リフォーム", status: "契約済", customer_id: 1, property_id: 1, staff_id: 2, price: 500000, created_at: "2025-03-01" },
  { id: 2, name: "世田谷戸建売買", type: "新築売買", status: "契約済", customer_id: 2, property_id: 2, staff_id: 2, price: 180000000, created_at: "2025-03-05" },
  { id: 3, name: "新宿アパート仲介", type: "仲介", status: "契約済", customer_id: 3, property_id: 3, staff_id: 3, price: 25000000, created_at: "2025-03-10" },
  { id: 4, name: "港区タワー売買", type: "中古売買", status: "完了", customer_id: 4, property_id: 4, staff_id: 2, price: 350000000, created_at: "2025-02-28" },
  { id: 5, name: "渋谷キッチンリフォーム", type: "リフォーム", status: "契約済", customer_id: 1, property_id: 1, staff_id: 5, price: 800000, created_at: "2025-03-15" },
  { id: 6, name: "目黒区新築一戸建", type: "新築売買", status: "契約済", customer_id: 5, property_id: 5, staff_id: 2, price: 49500000, created_at: "2026-02-10" },
  { id: 7, name: "品川オフィスリノベ", type: "リフォーム", status: "完了", customer_id: 6, property_id: 6, staff_id: 5, price: 1200000, created_at: "2026-02-20" },
  { id: 8, name: "千代田区土地売買", type: "中古売買", status: "契約済", customer_id: 3, property_id: 3, staff_id: 3, price: 95000000, created_at: "2026-02-25" },
  { id: 9, name: "港区マンション仲介", type: "仲介", status: "完了", customer_id: 4, property_id: 4, staff_id: 3, price: 18000000, created_at: "2026-03-01" },
  { id: 10, name: "渋谷マンションB新築", type: "新築売買", status: "見積中", customer_id: 1, property_id: 7, staff_id: 2, price: 60000000, created_at: "2026-03-05" },
  { id: 11, name: "千代田区土地仲介", type: "仲介", status: "契約済", customer_id: 2, property_id: 8, staff_id: 3, price: 12000000, created_at: "2026-03-10" },
  { id: 12, name: "目黒区外装リフォーム", type: "リフォーム", status: "見積中", customer_id: 5, property_id: 5, staff_id: 5, price: 350000, created_at: "2026-03-15" },
];

// 見積：全区分・複数顧客・複数担当者。revenue_category を明示。
export const estimates: Estimate[] = [
  { id: 1, project_id: 1, estimate_number: "EST-001", staff_id: 2, revenue_category: "リフォーム", note: "現地調査は完了。色味はグレー系希望。", subtotal: 500000, tax: 50000, total: 550000, created_at: "2025-03-07", items: [{ id: 1, name: "内装リフォーム工事", quantity: 1, unit_price: 300000, amount: 300000 }, { id: 2, name: "キッチン交換", quantity: 1, unit_price: 200000, amount: 200000 }] },
  { id: 2, project_id: 2, estimate_number: "EST-002", staff_id: 2, revenue_category: "新築", note: "重要事項説明の予定調整中。", subtotal: 180000000, tax: 18000000, total: 198000000, created_at: "2025-03-08", items: [{ id: 3, name: "新築戸建売買", quantity: 1, unit_price: 180000000, amount: 180000000 }] },
  { id: 3, project_id: 3, estimate_number: "EST-003", staff_id: 3, revenue_category: "仲介料", subtotal: 25000000, tax: 2500000, total: 27500000, created_at: "2025-03-12", items: [{ id: 4, name: "仲介手数料", quantity: 1, unit_price: 25000000, amount: 25000000 }] },
  { id: 4, project_id: 5, estimate_number: "EST-004", staff_id: 5, revenue_category: "リフォーム", note: "既存設備の撤去範囲は別途確定。", subtotal: 800000, tax: 80000, total: 880000, created_at: "2025-03-16", items: [{ id: 5, name: "キッチンリフォーム工事", quantity: 1, unit_price: 800000, amount: 800000 }] },
  { id: 5, project_id: 4, estimate_number: "EST-005", staff_id: 2, revenue_category: "土地", subtotal: 350000000, tax: 35000000, total: 385000000, created_at: "2025-03-01", items: [{ id: 6, name: "中古マンション売買", quantity: 1, unit_price: 350000000, amount: 350000000 }] },
  { id: 6, project_id: 6, estimate_number: "EST-006", staff_id: 2, revenue_category: "新築", subtotal: 45000000, tax: 4500000, total: 49500000, created_at: "2026-02-15", items: [{ id: 7, name: "新築一戸建", quantity: 1, unit_price: 45000000, amount: 45000000 }] },
  { id: 7, project_id: 7, estimate_number: "EST-007", staff_id: 5, revenue_category: "リフォーム", subtotal: 1200000, tax: 120000, total: 1320000, created_at: "2026-02-25", items: [{ id: 8, name: "オフィスリノベーション", quantity: 1, unit_price: 1200000, amount: 1200000 }] },
  { id: 8, project_id: 8, estimate_number: "EST-008", staff_id: 3, revenue_category: "土地", note: "測量図の受領待ち。", subtotal: 95000000, tax: 9500000, total: 104500000, created_at: "2026-03-01", items: [{ id: 9, name: "土地売買", quantity: 1, unit_price: 95000000, amount: 95000000 }] },
  { id: 9, project_id: 9, estimate_number: "EST-009", staff_id: 3, revenue_category: "仲介料", subtotal: 18000000, tax: 1800000, total: 19800000, created_at: "2026-03-05", items: [{ id: 10, name: "仲介手数料", quantity: 1, unit_price: 18000000, amount: 18000000 }] },
  { id: 10, project_id: 10, estimate_number: "EST-010", staff_id: 2, revenue_category: "新築", note: "住宅ローン事前審査中。", subtotal: 60000000, tax: 6000000, total: 66000000, created_at: "2026-03-08", items: [{ id: 11, name: "新築マンション", quantity: 1, unit_price: 60000000, amount: 60000000 }] },
  { id: 11, project_id: 11, estimate_number: "EST-011", staff_id: 3, revenue_category: "仲介料", subtotal: 12000000, tax: 1200000, total: 13200000, created_at: "2026-03-12", items: [{ id: 12, name: "土地仲介手数料", quantity: 1, unit_price: 12000000, amount: 12000000 }] },
  { id: 12, project_id: 12, estimate_number: "EST-012", staff_id: 5, revenue_category: "リフォーム", note: "雨天時は日程再調整。", subtotal: 350000, tax: 35000, total: 385000, created_at: "2026-03-18", items: [{ id: 13, name: "外装リフォーム", quantity: 1, unit_price: 350000, amount: 350000 }] },
];

// 請求：status は入金合計から算出（calculateInvoiceStatus）するため、ここは表示用に一致させておく
export const invoices: Invoice[] = [
  {
    id: 1,
    project_id: 1,
    invoice_number: "INV-001",
    note: "見積EST-001に基づく請求。",
    amount: 550000,
    due_date: "2025-04-30",
    status: "有",
    created_at: "2025-03-07",
    revenue_category: "リフォーム",
    cost_amount_including_tax: 330000,
    cost_amount_excluding_tax: 300000,
    cost_rate: 330000 / 550000,
    profit_margin_rate: (550000 - 330000) / 550000,
    items: [
      { id: 1, name: "内装リフォーム工事", quantity: 1, unit_price: 300000, amount: 300000 },
      { id: 2, name: "キッチン交換", quantity: 1, unit_price: 200000, amount: 200000 },
    ],
  },
  {
    id: 2,
    project_id: 2,
    invoice_number: "INV-002",
    note: "契約締結後に請求書PDF送付予定。",
    amount: 198000000,
    due_date: "2025-05-10",
    status: "無し",
    created_at: "2025-03-08",
    revenue_category: "新築",
    cost_amount_including_tax: 165000000,
    cost_amount_excluding_tax: 150000000,
    cost_rate: 165000000 / 198000000,
    profit_margin_rate: (198000000 - 165000000) / 198000000,
    items: [{ id: 1, name: "新築戸建売買", quantity: 1, unit_price: 180000000, amount: 180000000 }],
  },
  {
    id: 3,
    project_id: 3,
    invoice_number: "INV-003",
    amount: 27500000,
    due_date: "2025-05-15",
    status: "無し",
    created_at: "2025-03-12",
    revenue_category: "仲介料",
    cost_amount_including_tax: 22000000,
    cost_amount_excluding_tax: 20000000,
    cost_rate: 22000000 / 27500000,
    profit_margin_rate: (27500000 - 22000000) / 27500000,
    items: [{ id: 1, name: "仲介手数料", quantity: 1, unit_price: 25000000, amount: 25000000 }],
  },
  {
    id: 4,
    project_id: 4,
    invoice_number: "INV-004",
    amount: 385000000,
    due_date: "2025-04-20",
    status: "有",
    created_at: "2025-03-01",
    revenue_category: "土地",
    cost_amount_including_tax: 341000000,
    cost_amount_excluding_tax: 310000000,
    cost_rate: 341000000 / 385000000,
    profit_margin_rate: (385000000 - 341000000) / 385000000,
    items: [{ id: 1, name: "中古マンション売買", quantity: 1, unit_price: 350000000, amount: 350000000 }],
  },
  {
    id: 5,
    project_id: 5,
    invoice_number: "INV-005",
    amount: 880000,
    due_date: "2025-05-20",
    status: "無し",
    created_at: "2025-03-16",
    revenue_category: "リフォーム",
    cost_amount_including_tax: 572000,
    cost_amount_excluding_tax: 520000,
    cost_rate: 572000 / 880000,
    profit_margin_rate: (880000 - 572000) / 880000,
    items: [{ id: 1, name: "キッチンリフォーム工事", quantity: 1, unit_price: 800000, amount: 800000 }],
  },
  {
    id: 6,
    project_id: 6,
    invoice_number: "INV-006",
    note: "入金確認済み（振込）。",
    amount: 49500000,
    due_date: "2026-04-10",
    status: "有",
    created_at: "2026-02-15",
    revenue_category: "新築",
    cost_amount_including_tax: 41800000,
    cost_amount_excluding_tax: 38000000,
    cost_rate: 41800000 / 49500000,
    profit_margin_rate: (49500000 - 41800000) / 49500000,
    items: [{ id: 1, name: "新築一戸建", quantity: 1, unit_price: 45000000, amount: 45000000 }],
  },
  {
    id: 7,
    project_id: 7,
    invoice_number: "INV-007",
    amount: 1320000,
    due_date: "2026-04-15",
    status: "有",
    created_at: "2026-02-25",
    revenue_category: "リフォーム",
    cost_amount_including_tax: 880000,
    cost_amount_excluding_tax: 800000,
    cost_rate: 880000 / 1320000,
    profit_margin_rate: (1320000 - 880000) / 1320000,
    items: [{ id: 1, name: "オフィスリノベーション", quantity: 1, unit_price: 1200000, amount: 1200000 }],
  },
  {
    id: 8,
    project_id: 8,
    invoice_number: "INV-008",
    amount: 104500000,
    due_date: "2026-04-20",
    status: "有",
    created_at: "2026-03-01",
    revenue_category: "土地",
    // 原価未入力の例（担当者別一覧では「未入力」表示）
    items: [{ id: 1, name: "土地売買", quantity: 1, unit_price: 95000000, amount: 95000000 }],
  },
  {
    id: 9,
    project_id: 9,
    invoice_number: "INV-009",
    amount: 19800000,
    due_date: "2026-04-25",
    status: "有",
    created_at: "2026-03-05",
    revenue_category: "仲介料",
    cost_amount_including_tax: 13200000,
    cost_amount_excluding_tax: 12000000,
    cost_rate: 13200000 / 19800000,
    profit_margin_rate: (19800000 - 13200000) / 19800000,
    items: [{ id: 1, name: "仲介手数料", quantity: 1, unit_price: 18000000, amount: 18000000 }],
  },
  {
    id: 10,
    project_id: 11,
    invoice_number: "INV-010",
    amount: 13200000,
    due_date: "2026-05-10",
    status: "無し",
    created_at: "2026-03-15",
    revenue_category: "仲介料",
    cost_amount_including_tax: 8800000,
    cost_amount_excluding_tax: 8000000,
    cost_rate: 8800000 / 13200000,
    profit_margin_rate: (13200000 - 8800000) / 13200000,
    items: [{ id: 1, name: "土地仲介手数料", quantity: 1, unit_price: 12000000, amount: 12000000 }],
  },
];

// ヘルパー関数
export function getCustomerById(id: number): Customer | undefined {
  return customers.find((c) => c.id === id);
}

export function getPropertyById(id: number): Property | undefined {
  return properties.find((p) => p.id === id);
}

export function getProjectById(id: number): Project | undefined {
  return projects.find((p) => p.id === id);
}

export const staff: Staff[] = [
  {
    id: 1,
    name: "山田太郎",
    email: "yamada@example.com",
    phone: "090-1111-1111",
    role: "管理者",
    department: "管理部",
    created_at: "2024-01-01",
  },
  {
    id: 2,
    name: "佐藤花子",
    email: "sato@example.com",
    phone: "090-2222-2222",
    role: "営業",
    department: "営業部",
    created_at: "2024-02-01",
  },
  {
    id: 3,
    name: "鈴木一郎",
    email: "suzuki@example.com",
    phone: "090-3333-3333",
    role: "営業",
    department: "営業部",
    created_at: "2024-02-15",
  },
  {
    id: 4,
    name: "田中次郎",
    email: "tanaka@example.com",
    phone: "090-4444-4444",
    role: "事務",
    department: "経理部",
    created_at: "2024-03-01",
  },
  {
    id: 5,
    name: "伊藤三郎",
    email: "ito@example.com",
    phone: "090-5555-5555",
    role: "現場監督",
    department: "工事部",
    created_at: "2024-03-15",
  },
];

export function getStaffById(id: number): Staff | undefined {
  return staff.find((s) => s.id === id);
}

export function getEstimateById(id: number): Estimate | undefined {
  return estimates.find((e) => e.id === id);
}

export function getInvoiceById(id: number): Invoice | undefined {
  return invoices.find((i) => i.id === id);
}

// -------------------------
// In-memory update helpers (demo用)
// -------------------------
export function updateCustomer(id: number, patch: Partial<Omit<Customer, "id">>): Customer {
  const idx = customers.findIndex((c) => c.id === id);
  if (idx < 0) throw new Error(`Customer not found: ${id}`);
  customers[idx] = { ...customers[idx], ...patch };
  return customers[idx];
}

export function updateProperty(id: number, patch: Partial<Omit<Property, "id">>): Property {
  const idx = properties.findIndex((p) => p.id === id);
  if (idx < 0) throw new Error(`Property not found: ${id}`);
  properties[idx] = { ...properties[idx], ...patch };
  return properties[idx];
}

function normalizeEstimateItems(items: EstimateItem[] | undefined): EstimateItem[] | undefined {
  if (!items) return items;
  return items.map((it) => ({
    ...it,
    quantity: Number(it.quantity) || 0,
    unit_price: Number(it.unit_price) || 0,
    amount: (Number(it.quantity) || 0) * (Number(it.unit_price) || 0),
  }));
}

export function updateEstimate(
  id: number,
  patch: Partial<Omit<Estimate, "id" | "estimate_number" | "created_at" | "project_id">>
): Estimate {
  const idx = estimates.findIndex((e) => e.id === id);
  if (idx < 0) throw new Error(`Estimate not found: ${id}`);
  const next: Estimate = { ...estimates[idx], ...patch };
  next.items = normalizeEstimateItems(next.items);
  const subtotal = (next.items ?? []).reduce((sum, it) => sum + (it.amount || 0), 0);
  next.subtotal = subtotal;
  next.tax = Math.floor(subtotal * 0.1);
  next.total = next.subtotal + next.tax;
  estimates[idx] = next;
  return next;
}

function normalizeInvoiceItems(items: InvoiceItem[] | undefined): InvoiceItem[] | undefined {
  if (!items) return items;
  return items.map((it) => ({
    ...it,
    quantity: Number(it.quantity) || 0,
    unit_price: Number(it.unit_price) || 0,
    amount: (Number(it.quantity) || 0) * (Number(it.unit_price) || 0),
  }));
}

export function updateInvoice(
  id: number,
  patch: Partial<Omit<Invoice, "id" | "invoice_number" | "created_at" | "project_id">>
): Invoice {
  const idx = invoices.findIndex((i) => i.id === id);
  if (idx < 0) throw new Error(`Invoice not found: ${id}`);
  const next: Invoice = { ...invoices[idx], ...patch };
  next.items = normalizeInvoiceItems(next.items);
  if (next.items && next.items.length > 0) {
    const subtotal = next.items.reduce((sum, it) => sum + (it.amount || 0), 0);
    const tax = Math.floor(subtotal * 0.1);
    next.amount = subtotal + tax;
  }
  invoices[idx] = next;
  return next;
}

// 案件タイプから売上区分へのマッピング
export function getRevenueCategory(projectType: ProjectType): RevenueCategory {
  switch (projectType) {
    case "新築売買":
      return "新築";
    case "中古売買":
      return "土地";
    case "仲介":
      return "仲介料";
    case "リフォーム":
      return "リフォーム";
    default:
      return "リフォーム";
  }
}

// 入金：有/無し・分割入金・月別バラエティ（2025年3月・2026年3月で月次集計確認用）
export const payments: Payment[] = [
  { id: 1, invoice_id: 4, amount: 385000000, payment_date: "2025-03-15", payment_method: "振込", note: "全額入金", created_at: "2025-03-15" },
  { id: 2, invoice_id: 1, amount: 550000, payment_date: "2025-03-20", payment_method: "振込", note: "全額入金", created_at: "2025-03-20" },
  { id: 3, invoice_id: 6, amount: 49500000, payment_date: "2026-03-10", payment_method: "振込", note: "全額入金", created_at: "2026-03-10" },
  { id: 4, invoice_id: 7, amount: 800000, payment_date: "2026-03-15", payment_method: "振込", note: "一部入金", created_at: "2026-03-15" },
  { id: 5, invoice_id: 7, amount: 520000, payment_date: "2026-03-20", payment_method: "振込", note: "残額入金", created_at: "2026-03-20" },
  { id: 6, invoice_id: 8, amount: 104500000, payment_date: "2026-03-18", payment_method: "振込", note: "全額入金", created_at: "2026-03-18" },
  { id: 7, invoice_id: 9, amount: 19800000, payment_date: "2026-03-25", payment_method: "振込", note: "全額入金", created_at: "2026-03-25" },
  { id: 8, invoice_id: 2, amount: 50000000, payment_date: "2026-03-28", payment_method: "振込", note: "手付金", created_at: "2026-03-28" },
];

// 入金取得ヘルパー関数
export function getPaymentsByInvoiceId(invoiceId: number): Payment[] {
  return payments.filter((p) => p.invoice_id === invoiceId);
}

export function getPaymentById(id: number): Payment | undefined {
  return payments.find((p) => p.id === id);
}

// 請求の合計入金額を計算
export function getTotalPaidAmount(invoiceId: number): number {
  return getPaymentsByInvoiceId(invoiceId).reduce((sum, p) => sum + p.amount, 0);
}

// 請求のステータスを計算（入金額から自動判定）
export function calculateInvoiceStatus(invoice: Invoice): PaymentStatus {
  const totalPaid = getTotalPaidAmount(invoice.id);
  if (totalPaid <= 0) return "未入金";
  if (totalPaid >= invoice.amount) return "入金済み";
  return "一部入金";
}

// 月次集計モック（参照用。実際の集計は入金日ベースで算出）
export const monthlySummaries: MonthlySummary[] = [
  { id: 1, year: 2025, month: 3, category: "新築", amount: 0, invoice_count: 0, created_at: "2025-03-31", is_closed: false },
  { id: 2, year: 2025, month: 3, category: "リフォーム", amount: 550000, invoice_count: 1, created_at: "2025-03-31", closed_at: "2025-03-31", is_closed: true },
  { id: 3, year: 2025, month: 3, category: "土地", amount: 385000000, invoice_count: 1, created_at: "2025-03-31", closed_at: "2025-03-31", is_closed: true },
  { id: 4, year: 2025, month: 3, category: "仲介料", amount: 0, invoice_count: 0, created_at: "2025-03-31", is_closed: false },
];

// =========================
// 総合振込（全銀）デモ用
// =========================

export type BankAccountType = "普通" | "当座";

export interface CompanyBankAccount {
  id: number;
  bank_name: string;
  /** 4桁 */
  bank_code: string;
  /** 15バイト想定（半角カナ推奨） */
  bank_name_kana?: string;
  /** 3桁 */
  branch_code: string;
  /** 15バイト想定（半角カナ推奨） */
  branch_name_kana?: string;
  account_type: BankAccountType;
  /** 7桁（ゼロ埋め含む） */
  account_number: string;
  /** 40バイト想定（半角カナ推奨） */
  account_name_kana: string;
  /** 10桁（銀行指定想定） */
  client_code: string;
}

export interface Payee {
  id: number;
  name: string;
  bank_code: string;
  bank_name_kana?: string;
  branch_code: string;
  branch_name_kana?: string;
  account_type: BankAccountType;
  account_number: string;
  account_name_kana: string;
  memo?: string;
  is_active: boolean;
  created_at: string; // YYYY-MM-DD
  /** 総合振込で ⌊請求額×0.003⌋（切捨て）を保険として差し引いて振り込む（社内固定・振込先ごとに設定） */
  insurance_deduction_enabled?: boolean;
}

export type TransferBatchStatus = "draft" | "confirmed" | "exported";

export interface TransferBatch {
  id: number;
  /** 表示用バッチ番号（未設定の既存データは ID から生成して表示） */
  batch_number?: string;
  company_bank_account_id: number;
  transfer_date: string; // YYYY-MM-DD
  status: TransferBatchStatus;
  total_count: number;
  total_amount: number;
  created_at: string; // YYYY-MM-DD
  created_by: string;
  exported_at?: string; // YYYY-MM-DD
  file_name?: string;
}

export interface TransferBatchItem {
  id: number;
  batch_id: number;
  payee_id: number;
  amount: number;
  /** 保険として差し引く前の請求ベース金額（再編集時に二重に差し引かないため） */
  billing_gross_amount?: number;
  /** 摘要（全銀のEDI/摘要の厳密対応はデモでは省略） */
  description_kana: string;
  // 出力再現のため、口座情報はスナップショットとして保持
  bank_code: string;
  bank_name_kana?: string;
  branch_code: string;
  branch_name_kana?: string;
  account_type: BankAccountType;
  account_number: string;
  account_name_kana: string;
}

// 振込元（自社口座）：福岡銀行・西日本シティ銀行（コードはダミー）
export const companyBankAccounts: CompanyBankAccount[] = [
  {
    id: 1,
    bank_name: "福岡銀行",
    bank_code: "0177",
    bank_name_kana: "ﾌｸｵｶ",
    branch_code: "001",
    branch_name_kana: "ﾎﾝﾃﾝ",
    account_type: "普通",
    account_number: "1234567",
    account_name_kana: "ｶﾌﾞ)ﾃﾞﾓﾌﾄﾞｳｻﾝ",
    client_code: "0001234567",
  },
  {
    id: 2,
    bank_name: "西日本シティ銀行",
    bank_code: "0190",
    bank_name_kana: "ﾆｼﾆﾎﾝｼﾃｲ",
    branch_code: "101",
    branch_name_kana: "ﾃﾝｼﾞﾝ",
    account_type: "普通",
    account_number: "7654321",
    account_name_kana: "ｶﾌﾞ)ﾃﾞﾓﾌﾄﾞｳｻﾝ",
    client_code: "0007654321",
  },
];

/** 振込先の初期データ（不変）。実行中は `payees` を更新する */
const PAYEES_SEED: Payee[] = [
  {
    id: 1,
    name: "株式会社 建設丸（外注）",
    bank_code: "0177",
    bank_name_kana: "ﾌｸｵｶ",
    branch_code: "201",
    branch_name_kana: "ﾊｶﾀ",
    account_type: "普通",
    account_number: "0001234",
    account_name_kana: "ｶﾌﾞ)ｹﾝｾﾂﾏﾙ",
    memo: "リフォーム外注費",
    is_active: true,
    created_at: "2026-03-01",
  },
  {
    id: 2,
    name: "山田電気工事（外注）",
    bank_code: "0190",
    bank_name_kana: "ﾆｼﾆﾎﾝｼﾃｲ",
    branch_code: "301",
    branch_name_kana: "ﾖｶﾞ",
    account_type: "当座",
    account_number: "1230000",
    account_name_kana: "ﾔﾏﾀﾞﾃﾞﾝｷｺｳｼﾞ",
    memo: "電気工事",
    is_active: true,
    created_at: "2026-03-05",
  },
  {
    id: 3,
    name: "株式会社 仕入先サンプル",
    bank_code: "0177",
    bank_name_kana: "ﾌｸｵｶ",
    branch_code: "105",
    branch_name_kana: "ﾅｶｽ",
    account_type: "普通",
    account_number: "5555555",
    account_name_kana: "ｶﾌﾞ)ｼｲﾚｻｷ",
    memo: "材料費",
    is_active: true,
    created_at: "2026-03-10",
  },
  {
    id: 4,
    name: "株式会社 リスク共有デモ（外注）",
    bank_code: "0177",
    bank_name_kana: "ﾌｸｵｶ",
    branch_code: "088",
    branch_name_kana: "ﾃﾝｼﾞﾝ",
    account_type: "普通",
    account_number: "9001001",
    account_name_kana: "ｶﾌﾞ)ﾘｽｸｷｮｳﾕｳﾃﾞﾓ",
    memo: "保険として差し引いて振り込みの例（0.3% 切捨て・率固定）",
    is_active: true,
    created_at: "2026-03-12",
    insurance_deduction_enabled: true,
  },
];

/** デモ用振込先（メモリ上で更新。localStorage は使わない） */
export const payees: Payee[] = PAYEES_SEED.map((p) => ({ ...p }));
