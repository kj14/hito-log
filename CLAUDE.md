# CLAUDE.md

このファイルは、このリポジトリでClaude Code (claude.ai/code)が作業する際のガイダンスを提供します。

## プロジェクト概要

**人生タイマー** - 人生や家族との「残り時間」を可視化し、今を大切にできるPWA対応のWebアプリケーション

### 主な機能
- 残り寿命のリアルタイムカウントダウン（1/100秒単位）
- 家族メンバーや大切な人との「会える残り回数」グラフ化
- やりたいことリストと残り実行可能回数の計算
- 人生で出会える人数や親孝行チャンス等のインサイト表示
- PWA対応（スマホでホーム画面追加・オフライン対応）

## 技術スタック

### フロントエンド
- **Next.js** (App Router, TypeScript)
- **PWA対応** (next-pwa)
- **UIフレームワーク** (shadcn/ui, MUI, Chakra UI等)
- **グラフ描画** (Recharts, Chart.js, Visx)

### バックエンド/データベース
- **Supabase** (PostgreSQL, Auth, Storage, Edge Functions)
- Row Level Security対応

### インフラ・運用
- **Vercel** (CI/CD, 本番ホスティング)
- **Cloudflare** (DNS, CDN, WAF, セキュリティ強化)
- **GitHub** (パブリックリポジトリ管理)

## 開発環境

### 前提条件
- Node.js (v18以上)
- Git
- GitHubアカウント
- Supabaseアカウント
- Vercelアカウント
- Cloudflareアカウント（独自ドメイン利用時）

### ローカル開発起動
```bash
npm run dev
```

### 主要コマンド
- `npm run build` - 本番ビルド
- `npm run start` - 本番サーバー起動
- `npm run lint` - ESLintチェック
- `npm run type-check` - TypeScript型チェック

## 開発ルール

### ファイル構成
- `app/` - Next.js App Router対応のページ・レイアウト
- `components/` - 再利用可能なReactコンポーネント
- `lib/` - ユーティリティ関数・設定
- `public/` - 静的ファイル（PWA manifest、アイコン等）

### 環境変数
```env
NEXT_PUBLIC_SUPABASE_URL=xxxxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
```

### 開発時の注意点
- `.env.local`はgit管理除外
- PWA対応のため、manifest.jsonとアイコン画像を適切に設定
- Supabaseの認証・セキュリティ設定に注意
- レスポンシブデザイン対応必須
- アクセシビリティ配慮

## デプロイ

### 本番環境
- **Vercel**: メインホスティング
- **Cloudflare**: DNS・CDN・セキュリティ
- 独自ドメイン対応

### 開発フロー
1. GitHubでfeatureブランチ作成
2. ローカル開発・テスト
3. PRでコードレビュー
4. masterブランチマージ後、Vercelで自動デプロイ