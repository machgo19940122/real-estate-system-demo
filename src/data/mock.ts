export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  created_at?: string;
}

export interface Property {
  id: number;
  name: string;
  address: string;
  owner: string;
  created_at?: string;
}

export type ProjectType = "新築売買" | "中古売買" | "仲介" | "リフォーム";
export type ProjectStatus = "見積中" | "契約済" | "工事中" | "完了";

export interface Project {
  id: number;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  customer_id: number;
  property_id: number;
  staff_id?: number;
  price: number;
  created_at?: string;
}

export interface Estimate {
  id: number;
  project_id: number;
  estimate_number: string;
  staff_id?: number;
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

export type InvoiceStatus = "未請求" | "未入金" | "一部入金" | "入金済";

export interface Invoice {
  id: number;
  project_id: number;
  invoice_number: string;
  amount: number;
  due_date: string;
  status: InvoiceStatus;
  created_at: string;
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

export interface Staff {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  department: string;
  created_at?: string;
}

export const customers: Customer[] = [
  {
    id: 1,
    name: "田中太郎",
    phone: "090-1234-5678",
    email: "taro@test.com",
    address: "東京都渋谷区1-1-1",
    created_at: "2025-01-15",
  },
  {
    id: 2,
    name: "株式会社サンプル",
    phone: "03-1234-5678",
    email: "info@sample.co.jp",
    address: "東京都世田谷区2-2-2",
    created_at: "2025-02-01",
  },
  {
    id: 3,
    name: "佐藤花子",
    phone: "080-9876-5432",
    email: "hanako@example.com",
    address: "東京都新宿区3-3-3",
    created_at: "2025-02-10",
  },
  {
    id: 4,
    name: "鈴木一郎",
    phone: "090-1111-2222",
    email: "ichiro@test.com",
    address: "東京都港区4-4-4",
    created_at: "2025-02-20",
  },
];

export const properties: Property[] = [
  {
    id: 1,
    name: "渋谷マンション",
    address: "東京都渋谷区1-1-1",
    owner: "田中太郎",
    created_at: "2025-01-20",
  },
  {
    id: 2,
    name: "世田谷戸建",
    address: "東京都世田谷区2-2-2",
    owner: "株式会社サンプル",
    created_at: "2025-02-05",
  },
  {
    id: 3,
    name: "新宿アパート",
    address: "東京都新宿区3-3-3",
    owner: "佐藤花子",
    created_at: "2025-02-15",
  },
  {
    id: 4,
    name: "港区タワーマンション",
    address: "東京都港区4-4-4",
    owner: "鈴木一郎",
    created_at: "2025-02-25",
  },
];

export const projects: Project[] = [
  {
    id: 1,
    name: "渋谷リフォーム",
    type: "リフォーム",
    status: "見積中",
    customer_id: 1,
    property_id: 1,
    staff_id: 2,
    price: 500000,
    created_at: "2025-03-01",
  },
  {
    id: 2,
    name: "世田谷戸建売買",
    type: "新築売買",
    status: "契約済",
    customer_id: 2,
    property_id: 2,
    staff_id: 2,
    price: 180000000,
    created_at: "2025-03-05",
  },
  {
    id: 3,
    name: "新宿アパート仲介",
    type: "仲介",
    status: "工事中",
    customer_id: 3,
    property_id: 3,
    staff_id: 3,
    price: 25000000,
    created_at: "2025-03-10",
  },
  {
    id: 4,
    name: "港区タワーマンション売買",
    type: "中古売買",
    status: "完了",
    customer_id: 4,
    property_id: 4,
    staff_id: 2,
    price: 350000000,
    created_at: "2025-02-28",
  },
  {
    id: 5,
    name: "渋谷キッチンリフォーム",
    type: "リフォーム",
    status: "契約済",
    customer_id: 1,
    property_id: 1,
    staff_id: 5,
    price: 800000,
    created_at: "2025-03-15",
  },
  {
    id: 6,
    name: "目黒区新築マンション",
    type: "新築売買",
    status: "契約済",
    customer_id: 1,
    property_id: 1,
    staff_id: 2,
    price: 45000000,
    created_at: "2026-02-10",
  },
  {
    id: 7,
    name: "品川区リノベーション",
    type: "リフォーム",
    status: "完了",
    customer_id: 2,
    property_id: 2,
    staff_id: 5,
    price: 1200000,
    created_at: "2026-02-20",
  },
  {
    id: 8,
    name: "千代田区土地売買",
    type: "中古売買",
    status: "契約済",
    customer_id: 3,
    property_id: 3,
    staff_id: 3,
    price: 95000000,
    created_at: "2026-02-25",
  },
  {
    id: 9,
    name: "中央区マンション仲介",
    type: "仲介",
    status: "完了",
    customer_id: 4,
    property_id: 4,
    staff_id: 3,
    price: 18000000,
    created_at: "2026-03-01",
  },
];

export const estimates: Estimate[] = [
  {
    id: 1,
    project_id: 1,
    estimate_number: "EST-001",
    staff_id: 2,
    subtotal: 500000,
    tax: 50000,
    total: 550000,
    created_at: "2025-03-07",
    items: [
      {
        id: 1,
        name: "内装リフォーム工事",
        quantity: 1,
        unit_price: 300000,
        amount: 300000,
      },
      {
        id: 2,
        name: "キッチン交換",
        quantity: 1,
        unit_price: 200000,
        amount: 200000,
      },
    ],
  },
  {
    id: 2,
    project_id: 2,
    estimate_number: "EST-002",
    staff_id: 2,
    subtotal: 180000000,
    tax: 18000000,
    total: 198000000,
    created_at: "2025-03-08",
    items: [
      {
        id: 3,
        name: "新築戸建売買",
        quantity: 1,
        unit_price: 180000000,
        amount: 180000000,
      },
    ],
  },
  {
    id: 3,
    project_id: 3,
    estimate_number: "EST-003",
    staff_id: 3,
    subtotal: 25000000,
    tax: 2500000,
    total: 27500000,
    created_at: "2025-03-12",
    items: [
      {
        id: 4,
        name: "仲介手数料",
        quantity: 1,
        unit_price: 25000000,
        amount: 25000000,
      },
    ],
  },
  {
    id: 4,
    project_id: 5,
    estimate_number: "EST-004",
    staff_id: 5,
    subtotal: 800000,
    tax: 80000,
    total: 880000,
    created_at: "2025-03-16",
    items: [
      {
        id: 5,
        name: "キッチンリフォーム工事",
        quantity: 1,
        unit_price: 800000,
        amount: 800000,
      },
    ],
  },
];

export const invoices: Invoice[] = [
  {
    id: 1,
    project_id: 1,
    invoice_number: "INV-001",
    amount: 550000,
    due_date: "2025-03-31",
    status: "未入金",
    created_at: "2025-03-07",
  },
  {
    id: 2,
    project_id: 2,
    invoice_number: "INV-002",
    amount: 198000000,
    due_date: "2025-04-10",
    status: "未入金",
    created_at: "2025-03-08",
  },
  {
    id: 3,
    project_id: 3,
    invoice_number: "INV-003",
    amount: 27500000,
    due_date: "2025-04-15",
    status: "未請求",
    created_at: "2025-03-12",
  },
  {
    id: 4,
    project_id: 4,
    invoice_number: "INV-004",
    amount: 385000000,
    due_date: "2025-03-20",
    status: "入金済",
    created_at: "2025-03-01",
  },
  {
    id: 5,
    project_id: 5,
    invoice_number: "INV-005",
    amount: 880000,
    due_date: "2025-04-20",
    status: "未請求",
    created_at: "2025-03-16",
  },
  {
    id: 6,
    project_id: 6,
    invoice_number: "INV-006",
    amount: 49500000,
    due_date: "2026-04-10",
    status: "未入金",
    created_at: "2026-02-15",
  },
  {
    id: 7,
    project_id: 7,
    invoice_number: "INV-007",
    amount: 1320000,
    due_date: "2026-04-15",
    status: "未入金",
    created_at: "2026-02-25",
  },
  {
    id: 8,
    project_id: 8,
    invoice_number: "INV-008",
    amount: 104500000,
    due_date: "2026-04-20",
    status: "未入金",
    created_at: "2026-03-01",
  },
  {
    id: 9,
    project_id: 9,
    invoice_number: "INV-009",
    amount: 19800000,
    due_date: "2026-04-25",
    status: "未入金",
    created_at: "2026-03-05",
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

// 入金モックデータ
export const payments: Payment[] = [
  {
    id: 1,
    invoice_id: 4,
    amount: 385000000,
    payment_date: "2025-03-15",
    payment_method: "振込",
    note: "全額入金",
    created_at: "2025-03-15",
  },
  {
    id: 2,
    invoice_id: 1,
    amount: 300000,
    payment_date: "2025-03-20",
    payment_method: "振込",
    note: "一部入金",
    created_at: "2025-03-20",
  },
  {
    id: 3,
    invoice_id: 1,
    amount: 250000,
    payment_date: "2025-03-25",
    payment_method: "振込",
    note: "残額入金",
    created_at: "2025-03-25",
  },
  {
    id: 4,
    invoice_id: 6,
    amount: 49500000,
    payment_date: "2026-03-10",
    payment_method: "振込",
    note: "全額入金",
    created_at: "2026-03-10",
  },
  {
    id: 5,
    invoice_id: 7,
    amount: 800000,
    payment_date: "2026-03-15",
    payment_method: "振込",
    note: "一部入金",
    created_at: "2026-03-15",
  },
  {
    id: 6,
    invoice_id: 7,
    amount: 520000,
    payment_date: "2026-03-20",
    payment_method: "振込",
    note: "残額入金",
    created_at: "2026-03-20",
  },
  {
    id: 7,
    invoice_id: 8,
    amount: 104500000,
    payment_date: "2026-03-18",
    payment_method: "振込",
    note: "全額入金",
    created_at: "2026-03-18",
  },
  {
    id: 8,
    invoice_id: 9,
    amount: 19800000,
    payment_date: "2026-03-25",
    payment_method: "振込",
    note: "全額入金",
    created_at: "2026-03-25",
  },
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
export function calculateInvoiceStatus(invoice: Invoice): InvoiceStatus {
  const totalPaid = getTotalPaidAmount(invoice.id);
  if (totalPaid === 0) {
    return invoice.status === "未請求" ? "未請求" : "未入金";
  } else if (totalPaid >= invoice.amount) {
    return "入金済";
  } else {
    return "一部入金";
  }
}

// 月次集計モックデータ
export const monthlySummaries: MonthlySummary[] = [
  {
    id: 1,
    year: 2025,
    month: 3,
    category: "新築",
    amount: 198000000,
    invoice_count: 1,
    created_at: "2025-03-31",
    closed_at: "2025-03-31",
    is_closed: true,
  },
  {
    id: 2,
    year: 2025,
    month: 3,
    category: "リフォーム",
    amount: 550000,
    invoice_count: 1,
    created_at: "2025-03-31",
    closed_at: "2025-03-31",
    is_closed: true,
  },
  {
    id: 3,
    year: 2025,
    month: 3,
    category: "土地",
    amount: 385000000,
    invoice_count: 1,
    created_at: "2025-03-31",
    closed_at: "2025-03-31",
    is_closed: true,
  },
  {
    id: 4,
    year: 2025,
    month: 3,
    category: "仲介料",
    amount: 0,
    invoice_count: 0,
    created_at: "2025-03-31",
    is_closed: false,
  },
];

