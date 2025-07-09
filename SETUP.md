# ローカル開発環境セットアップ

## 前提

- Git
- GitHubアカウント
- **下記いずれかの環境**
  - **Docker + Docker Compose**（推奨・再現性重視）
  - **Node.js（v18以上）**（直接インストール）
- (独自ドメインなら) Cloudflareアカウント
- Vercelアカウント

---

## 環境選択ガイド

### 🐳 Docker環境（推奨）

**メリット：**
- チーム開発で環境統一
- OS関係なく同じ環境で開発可能
- Supabaseもローカルで完全再現
- 環境汚染なし

**デメリット：**
- 初回起動が若干重い
- Dockerの基本知識が必要

### 💻 直接Node.js環境

**メリット：**
- 軽量で起動が早い
- Node.js慣れしている場合は簡単

**デメリット：**
- 環境差異が発生しやすい
- Supabaseはクラウド版を使用

---

## 🐳 Docker環境でのセットアップ

### 1. GitHubリポジトリ準備

```sh
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```

### 2. Supabase CLIインストール

```sh
# macOS (Homebrew)
brew install supabase/tap/supabase

# npm経由（全OS対応）
npm install -g supabase
```

### 3. Supabaseローカル環境初期化

```sh
# Supabaseプロジェクト初期化
supabase init

# ローカルSupabase起動（Docker使用）
supabase start
```

**起動後の接続情報：**
- API URL: `http://localhost:54321`
- Database URL: `postgresql://postgres:postgres@localhost:54322/postgres`
- Studio URL: `http://localhost:54323`

### 4. Next.jsプロジェクト初期化

```sh
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

### 5. Docker Compose設定

**docker-compose.yml** を作成：

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=[ローカル開発用のanon key]
    depends_on:
      - db
    command: npm run dev

  db:
    image: supabase/postgres:15.1.0.117
    environment:
      - POSTGRES_PASSWORD=postgres
    ports:
      - "54322:5432"
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:
```

### 6. 必要パッケージインストール

```sh
npm install @supabase/supabase-js next-pwa recharts @types/node @types/react @types/react-dom
```

### 7. 環境変数設定

**.env.local** を作成：

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ローカル開発用のanon key]
```

### 8. Docker開発起動

```sh
# Supabase起動
supabase start

# Next.jsアプリ起動
docker-compose up --build
```

**アクセス先：**
- アプリ: http://localhost:3000
- Supabase Studio: http://localhost:54323

---

## 💻 直接Node.js環境でのセットアップ

### 1. GitHubリポジトリ準備

```sh
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```

### 2. Next.jsプロジェクト初期化

```sh
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

### 3. 必要パッケージインストール

```sh
npm install @supabase/supabase-js next-pwa recharts @types/node @types/react @types/react-dom
```

### 4. Supabaseクラウド版セットアップ

- [Supabase公式](https://supabase.com/)でプロジェクト新規作成
- テーブル設計はWeb GUIでOK
- APIキーとURLを取得し、`.env.local`に設定

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. ローカル開発起動

```sh
npm run dev
```

---

## PWA設定

### next.config.js設定

```javascript
/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public'
});

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = withPWA(nextConfig);
```

### public/manifest.json作成

```json
{
  "name": "人生タイマー",
  "short_name": "HitoLog",
  "description": "人生や家族との残り時間を可視化するPWAアプリ",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## よくあるトラブル

### Docker環境
- **ポート競合**: 既存のサービスが3000番ポートを使用している
- **ボリューム権限**: `docker-compose down -v`でボリューム削除後再起動
- **Supabase接続**: `supabase status`で接続情報確認

### 直接Node.js環境
- **SupabaseのCORSエラー**: ダッシュボードでCORS許可
- **Node.jsバージョン**: `node --version`でv18以上を確認
- **Vercelの環境変数**: 本番デプロイ時の環境変数設定忘れ

---

## 開発Tips

- **VS Code拡張**: ESLint, Prettier, GitLens, Docker推奨
- **環境変数管理**: `.env.local`はgit管理除外
- **コミット時自動整形**: husky, lint-stagedも便利
- **データベース設計**: Supabase Studio（localhost:54323）で視覚的に設計
- **マイグレーション**: `supabase db reset`でローカルDB初期化可能