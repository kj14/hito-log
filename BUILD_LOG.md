# 人生タイマー ローカル開発環境構築ログ

このドキュメントは実際の構築作業のログです。

## 構築日時
2025年7月8日

## 構築環境
- macOS Darwin 24.5.0
- Node.js v20.13.1
- npm 10.5.2
- Docker version 28.2.2
- Docker Compose version 2.29.7

## 構築手順

### 1. プロジェクト初期状態
- GitHubリポジトリ: hito-log
- 初期ファイル: README.md, SETUP.md, TECH_STACK.md, CLAUDE.md

### 2. Supabase CLIインストール (Homebrew使用)
```bash
brew install supabase/tap/supabase
# インストール結果: supabase version 2.30.4
```

### 3. Supabaseローカル環境初期化
```bash
supabase init
# supabase/config.tomlが作成される
```

### 4. Supabaseローカル環境起動
```bash
supabase start
# 初回起動時: Dockerイメージのダウンロード（約5分）
# 起動完了後の接続情報:
# - API URL: http://127.0.0.1:54321
# - Studio URL: http://127.0.0.1:54323
# - DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
# - anon key: [ローカル開発用のanon key]
```

### 5. Next.jsプロジェクト初期化
```bash
# 一時フォルダで作成（既存ファイルとの競合回避）
mkdir temp-next && cd temp-next
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack

# プロジェクト名: temp-next
# ファイルをメインディレクトリにコピー
cp -r temp-next/temp-next/* .
rm -rf temp-next
```

### 6. 必要パッケージインストール
```bash
npm install @supabase/supabase-js next-pwa recharts
# 追加されたパッケージ:
# - @supabase/supabase-js: Supabase SDK
# - next-pwa: PWA対応
# - recharts: グラフ描画ライブラリ
```

### 7. 環境変数設定
`.env.local`ファイル作成:
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ローカル開発用のanon key]
```

### 8. PWA設定
- `next.config.ts`にPWA設定追加
- `public/manifest.json`作成
- **注意**: 初回起動時にPWAプラグインのエラーが発生したため、一時的に無効化

### 9. 起動確認とトラブルシューティング

#### 問題1: Next.js起動エラー
- 症状: プロセスが起動しているように見えるが、ポート3000にアクセスできない
- 原因: PWA設定との競合
- 解決: next.config.tsからPWA設定を一時的に削除

#### 問題2: プロセス管理
- 症状: 通常の`npm run dev`ではプロセスが正しく起動しない
- 解決: バックグラウンドプロセスとして起動
```bash
npm run dev > /tmp/nextjs.log 2>&1 &
```

### 10. 最終確認
- Next.js: http://localhost:3000 ✅
- Supabase API: http://127.0.0.1:54321 ✅
- Supabase Studio: http://127.0.0.1:54323 ✅
- 環境変数連携: ✅

## 構築完了時のプロジェクト構成
```
hito-log/
├── .env.local              # 環境変数（Git管理外）
├── .gitignore             # Git除外設定
├── BUILD_LOG.md           # このファイル
├── CLAUDE.md              # AI作業ガイド
├── README.md              # プロジェクト概要
├── SETUP.md               # セットアップ手順
├── TECH_STACK.md          # 技術スタック
├── eslint.config.mjs      # ESLint設定
├── next-env.d.ts          # Next.js型定義
├── next.config.ts         # Next.js設定
├── node_modules/          # パッケージ
├── package-lock.json      # パッケージロック
├── package.json           # パッケージ定義
├── postcss.config.mjs     # PostCSS設定
├── public/                # 静的ファイル
│   ├── manifest.json      # PWAマニフェスト
│   └── ...               # その他アイコン等
├── src/                   # ソースコード
│   └── app/              # App Router
│       ├── favicon.ico
│       ├── globals.css
│       ├── layout.tsx
│       └── page.tsx
├── supabase/              # Supabase設定
│   └── config.toml
└── tsconfig.json          # TypeScript設定
```

## ハイブリッド構成の採用理由
- Supabase: Dockerで完全なローカル環境を実現
- Next.js: ローカルNode.jsで高速な開発体験を維持
- この構成により、開発効率とデータベース環境の再現性を両立

## 今後の作業
1. Supabaseデータベーススキーマ設計
2. 認証機能の実装
3. PWA設定の修正と有効化
4. 基本機能の実装開始