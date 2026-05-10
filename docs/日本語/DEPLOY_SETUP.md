# AI Business Concierge – プッシュ&デプロイガイド

このドキュメントは、プロジェクトをGitHub、Supabase、Netlifyにプッシュ&デプロイするための手順を説明します。

---

## 1. 前提条件

- **Node.js** 18+（20推奨）
- **Git** – バージョン管理
- **Supabase CLI** – `npm i -g supabase`または`brew install supabase/tap/supabase`
- **GitHub**アカウント
- **Supabase**アカウント – [supabase.com](https://supabase.com)
- **Netlify**アカウント – [netlify.com](https://netlify.com)

---

## 2. プロジェクトのクローンと依存関係インストール

```bash
# プロジェクトのクローン
git clone git@github.com:sherzot/ai-business-concierge.git
cd ai-business-concierge

# フロントエンドの依存関係
cd frontend && npm install && cd ..
```

---

## 3. GitHubへのログインとプッシュ

### 3.1 GitHubへのログイン

1. [github.com](https://github.com)にアクセス
2. アカウントにログイン
3. SSHまたはHTTPS経由でリポジトリに接続:
   - SSH: `git@github.com:sherzot/ai-business-concierge.git`
   - HTTPS: `https://github.com/sherzot/ai-business-concierge.git`

### 3.2 変更のプッシュ

```bash
git status
git add .
git commit -m "デプロイ準備: .env.example, DEPLOY_SETUP.md"
git push origin main
```

---

## 4. Supabaseのセットアップ

### 4.1 Supabaseへのログイン

1. [supabase.com/dashboard](https://supabase.com/dashboard)にアクセス
2. ログインまたは新規プロジェクト作成

### 4.2 既存プロジェクトへのリンク

**既存プロジェクト:**
- Project ID: `ufhepwdkjqptjvxrmpjn`
- Dashboard: `https://supabase.com/dashboard/project/ufhepwdkjqptjvxrmpjn`

### 4.3 Supabase CLIを使ったリンク

```bash
supabase login
supabase link --project-ref ufhepwdkjqptjvxrmpjn
```

### 4.4 データベース（スキーマとマイグレーション）

```bash
supabase db push
# または
supabase migration up
```

### 4.5 Edge Functionのデプロイ

```bash
supabase functions deploy bright-api
```

### 4.6 Edge Functionシークレット

| シークレット名 | 値 | 必須 |
|-------------|---|------|
| `SUPABASE_URL` | `https://ufhepwdkjqptjvxrmpjn.supabase.co` | はい |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → service_role | はい |
| `OPENAI_API_KEY` | OpenAI APIキー | はい（AI用） |
| `RESEND_WEBHOOK_SECRET` | Resend webhookの署名シークレット | いいえ |

### 4.7 デモユーザー

[DEMO_USERS.md](DEMO_USERS.md)に記載のアカウントを作成し、`user_tenants`に追加してください。

---

## 5. Netlifyのセットアップ

### 5.1 Netlifyへのログイン

1. [app.netlify.com](https://app.netlify.com)にアクセス
2. GitHubでログイン

### 5.2 新しいサイト – GitHubからインポート

1. **Add new site** → **Import an existing project**
2. **GitHub**を選択
3. リポジトリ: `sherzot/ai-business-concierge`
4. **Build settings:**
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `dist`

### 5.3 環境変数

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_PROJECT_ID` | `ufhepwdkjqptjvxrmpjn` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonキー |

### 5.4 デプロイ

- **Deploy**ボタンのクリックまたは`main`ブランチへのプッシュで自動デプロイ

---

## 6. クイックチェックリスト

| # | 手順 | 状態 |
|---|------|------|
| 1 | `cd frontend && npm install` | ✅ |
| 2 | GitHubにログイン、`git push origin main` | あなたが実行 |
| 3 | Supabase Dashboard – schema.sql、マイグレーション | あなたが実行 |
| 4 | `supabase login`と`supabase link` | あなたが実行 |
| 5 | `supabase functions deploy bright-api` | あなたが実行 |
| 6 | Supabase → bright-api → シークレット追加 | あなたが実行 |
| 7 | Netlify – GitHubリポジトリのインポート | あなたが実行 |
| 8 | Netlify → 環境変数 | あなたが実行 |
| 9 | デプロイ | 自動または手動 |

---

## 7. クイック確認

### ローカルビルド

```bash
cd frontend
npm run build
```

### Supabase Edge Function

```bash
curl "https://ufhepwdkjqptjvxrmpjn.supabase.co/functions/v1/bright-api/make-server-6c2837d6/v1/health"
```

`{"data":{"ok":true},...}`のようなレスポンスが返れば、Edge Functionは動作しています。

---

## 8. 追加ドキュメント

- [R001_EMAIL_SETUP.md](R001_EMAIL_SETUP.md) – Resend emailインボックス
- [R002_REALTIME_SETUP.md](R002_REALTIME_SETUP.md) – Supabase Realtime
- [R015_TASK_NOTIFICATIONS.md](R015_TASK_NOTIFICATIONS.md) – タスク通知
- [DEMO_USERS.md](DEMO_USERS.md) – デモアカウント
