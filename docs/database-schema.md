# データベース設計

このドキュメントでは、人生可視化ダッシュボードの永続化を支える PostgreSQL / Supabase スキーマを整理します。

## 全体像

アプリは 1 つの「プロフィール」を起点に、関係性データと目標データを紐付けて管理します。認証を導入する前提で、各ブラウザには `profile_token` を払い出して cookie で保持し、API 経由で同じプロフィール行を参照します。

```
life_profiles (1) ────< relationships (N)
      │
      └────< goals (N) ────< goal_logs (N)
```

## テーブル詳細

### `life_profiles`
- **主キー**: `id (uuid)`
- **識別子**: `profile_token (uuid)` – cookie に保存し、API 側で一致チェック
- **属性**:
  - `name` – 表示名
  - `birth_date` – 生年月日 (date)
  - `life_expectancy_years` – 想定寿命 (numeric)
  - `sex` – `sex` enum (`male` / `female` / `other` / `unspecified`)
  - `created_at`, `updated_at`

### `relationships`
- **主キー**: `id (uuid)`
- **外部キー**: `profile_id` → `life_profiles.id`
- **属性**:
  - `name`, `birth_date`, `life_expectancy_years`
  - `meeting_interval_days` – 会う頻度
  - `average_session_minutes` – 平均セッション時間
  - `note`
  - `created_at`, `updated_at`

### `goals`
- **主キー**: `id (uuid)`
- **外部キー**: `profile_id` → `life_profiles.id`
- **属性**:
  - `title`, `category`
  - `target_effort_hours`
  - `target_date`
  - `motivation_note`
  - `created_at`, `updated_at`

### `goal_logs`
- **主キー**: `id (uuid)`
- **外部キー**: `goal_id` → `goals.id` (ON DELETE CASCADE)
- **属性**:
  - `logged_at`
  - `minutes`
  - `note`

## トリガーと補助

- `pgcrypto` 拡張を有効化し `gen_random_uuid()` を利用。
- `sex` enum を定義。
- `set_updated_at` トリガーを `life_profiles` / `relationships` / `goals` に設定し、`updated_at` を自動更新。

## API との連携

- `/api/dashboard` GET: cookie の `profile_token` で参照し、存在しなければ初期データを作成。
- `/api/dashboard` POST: 受け取った配列を `profile_id` ごとに全差し替え (delete → insert) し、`goal_logs` は `goals` にぶら下げて再投入。
- cookie は 1 年間有効で HTTP only。

## 今後の拡張案

- 認証導入後は `life_profiles` に `user_id` を持たせ、RLS を設定する。
- 操作監査用の `activity_logs` テーブルを追加し、保存履歴を可視化する。
- 複数プロフィール（家族など）を扱えるよう、`profiles` ↔ `life_profiles` の 1:N 関係を検討する。
