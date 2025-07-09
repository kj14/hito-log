# 技術スタック & 開発方針

## フロントエンド

- **Next.js (TypeScript, App Router)**
- **PWA対応** (`next-pwa`)
- **UIフレームワーク**（shadcn/ui, MUI, Chakra UIなど）
- **グラフ描画**（Recharts, Chart.js, Visx）
- **AI UIプロトタイピング**（v0.dev）

## バックエンド/データベース

- **Supabase**
  - PostgreSQLベースのBaaS
  - 認証・ストレージ・Edge Functions・リアルタイム・Row Level Security
  - ローカル版はSupabase CLIで起動

## インフラ・運用

- **Vercel**
  - Next.jsに最適なサーバーレスホスティング
  - CI/CD、Preview Deploy、無料枠あり

- **Cloudflare**
  - DNS、WAF、CDN、SSL/TLS、Bot対策
  - 本番用独自ドメインの高速・セキュア配信

## ソース管理・CI

- **GitHub（パブリック）**
  - イシュー＆PR運用、ドキュメント管理

---

## 推奨開発フロー

1. GitHubリポジトリ作成・ローカルclone
2. Next.js新規作成、主要パッケージ導入
3. Supabaseプロジェクト作成（クラウド or ローカルCLI）
4. ローカル開発環境（Docker/Compose）整備
5. PWA対応・グラフ・UI実装
6. Vercelデプロイ、Cloudflareドメイン設定