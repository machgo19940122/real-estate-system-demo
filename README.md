# 不動産見積・請求システム（ダミー）

中古不動産・新築売買・リフォーム案件の案件管理＋見積＋請求のダミー画面作成。モックデータでUI確認・デモ用。

## 技術スタック

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS**
- **shadcn/ui**
- **Vercel デプロイ対応**
- **モックデータ使用（DBなし）**

## 機能

### 業務フロー
顧客 → 物件 → 案件 → 見積 → 請求

### 案件タイプ
- 新築売買
- 中古売買
- 仲介
- リフォーム

### 画面一覧

1. **ダッシュボード** (`/dashboard`)
   - 今月売上、未請求件数、未入金件数
   - 最近の案件テーブル

2. **顧客一覧** (`/customers`)
   - 顧客名、電話、メール、住所、登録日
   - 新規顧客追加ボタン

3. **物件一覧** (`/properties`)
   - 物件名、住所、所有者、登録日

4. **案件一覧** (`/projects`)
   - 案件名、顧客、物件、タイプ、ステータス
   - ステータス: 見積中 / 契約済 / 工事中 / 完了

5. **見積一覧** (`/estimates`)
   - 見積番号、案件名、金額、作成日
   - 見積詳細: 項目、数量、単価、金額
   - PDF出力（ダミー）

6. **請求一覧** (`/invoices`)
   - 請求番号、案件名、金額、支払期限、ステータス
   - ステータス: 未請求 / 未入金 / 入金済

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## ビルド

```bash
npm run build
npm start
```

## デプロイ

Vercelにデプロイする場合:

```bash
# Vercel CLIを使用
npm i -g vercel
vercel
```

または、GitHubリポジトリをVercelに接続して自動デプロイを設定できます。

## プロジェクト構造

```
├── app/
│   ├── dashboard/      # ダッシュボード
│   ├── customers/      # 顧客一覧
│   ├── properties/     # 物件一覧
│   ├── projects/       # 案件一覧
│   ├── estimates/      # 見積一覧
│   └── invoices/       # 請求一覧
├── components/
│   ├── layout.tsx      # レイアウトコンポーネント
│   ├── sidebar.tsx     # サイドバー
│   └── ui/             # shadcn/uiコンポーネント
├── src/
│   └── data/
│       └── mock.ts     # モックデータ
└── lib/
    └── utils.ts        # ユーティリティ関数
```

## 将来の拡張予定

- Supabase DB接続
- 認証機能
- PDF生成機能
- 工事・原価・業者管理

## ライセンス

MIT
# real-estate-system-demo
