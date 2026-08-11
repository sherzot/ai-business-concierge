# FIRST_PUSH.md — Phase 0 完了デプロイガイド

> **目的:** 2026-04-29 に作成した Phase 0 のファイルを GitHub → Supabase → Netlify にデプロイする。
> **所要時間:** ~30-45分（CLIが準備済みの場合）。
> **対象:** Sher（PM/PL）— コピーペーストで実行できる手順書。

---

## 0. 今日プッシュするもの（サニティチェック）

| # | ファイル | タイプ | デプロイ先 |
|---|---|---|---|
| 1 | `supabase/migrations/20260429_phase0_rls_complete.sql` | DBマイグレーション | Supabase DB |
| 2 | `supabase/functions/server/services/usage-tracking.ts` | Edge Function | Supabase Functions |
| 3 | `supabase/functions/server/services/hr-candidate/*`（8ファイル）| Edge Function | Supabase Functions |
| 4 | `supabase/functions/server/routes/hr-candidate.ts` | Edge Function | Supabase Functions |
| 5 | `supabase/functions/server/index.ts`（更新済み）| Edge Function | Supabase Functions |
| 6 | `supabase/.env.example` | ドキュメント | GitHub only |
| 7 | `frontend/.env.example`（更新済み）| ドキュメント | GitHub only |
| 8 | `frontend/src/styles/theme-indigo-slate.css` | CSS | Netlify build |
| 9 | `frontend/src/shared/lib/aiFeedbackApi.ts` | TypeScript | Netlify build |
| 10 | `frontend/src/shared/components/AIFeedbackButtons.tsx` | React | Netlify build |
| 11 | `frontend/src/features/hr/candidates/*`（12ファイル）| React | Netlify build |
| 12 | `docs/CONNECTIONS.md`、`docs/HR_CANDIDATE_ANALYSIS.md`、`docs/FIRST_PUSH.md` | ドキュメント | GitHub only |

**セキュリティチェック:** どのファイルにも実際のAPIキーは含まれていない — すべて `*.env.example` プレースホルダー。

---

## 1. プリフライトチェック

### 1.1 ローカルターミナルでプロジェクトフォルダに移動

```bash
cd ~/Documents/GitHub/Projects/ai-business-concierge
```

### 1.2 以下を実行して状態を確認:

```bash
# git状態 — 新規/変更されたファイル
git status

# ブランチとリモート
git branch
git remote -v

# Supabase CLIバージョン（v2.75で十分、v2.95+推奨）
supabase --version

# Node + npm
node --version    # v20+であること
npm --version
```

**期待される結果:**
- `git status` → "modified: supabase/functions/server/index.ts" + 30以上の "Untracked files"
- `git remote -v` → `github.com/sherzot/ai-business-concierge.git` が表示される
- `supabase --version` → `2.75.0`（以上）

### 1.3 （オプション）Supabase CLIを更新

```bash
# macOS
brew upgrade supabase
# または
brew install supabase/tap/supabase
```

> 注意: v2.75.0で全て対応できます。更新は必須ではありませんが推奨します。

### 1.4 ローカルフロントエンドビルド（テスト）

プッシュ前にフロントエンドが動作することを確認:

```bash
cd frontend
npm install        # 新しいパッケージが追加された場合
npm run build
cd ..
```

**期待される結果:** エラーなし。TypeScriptエラーが出た場合 — 修正してからプッシュ。

---

## 2. GitHubにプッシュ

### 2.1 新規/変更されたファイルをステージング

```bash
# 全てを確認（監査）
git status

# 全てをステージング
git add .

# 再度確認 — どのファイルがコミットに含まれるか
git status
```

**注意点:**
- `frontend/.env`（実際のキーあり）はコミットに含めてはいけない — `.gitignore`に入っていること
- `node_modules/` も含めてはいけない

`.env` が見える場合:

```bash
git rm --cached frontend/.env
echo "frontend/.env" >> .gitignore
git add .gitignore
```

### 2.2 コミット

CLAUDE.mdのコミットルールに従い `type(scope): description` フォーマットを使用:

```bash
git commit -m "feat(phase0): 完了 — 完全RLS、Indigoテーマ、AIフィードバック、HR candidatesスケルトン

- db: 20260429_phase0_rls_complete.sql (12テーブル × 4 RLSポリシー + 5インデックス)
- backend: services/usage-tracking.ts、services/hr-candidate/* スケルトン
- backend: POST /v1/ai/feedback と /v1/hr/candidates/analyze（501スタブ）
- frontend: theme-indigo-slate.css、AIFeedbackButtons、hr/candidates UIスケルトン
- docs: HR_CANDIDATE_ANALYSIS.md（UZ+JP+EN）、CONNECTIONS.md、FIRST_PUSH.md
- infra: .env.example 完全版（frontend + supabase）"
```

### 2.3 プッシュ

```bash
# ブランチ名を確認
git branch --show-current

# プッシュ（通常はmainまたはmaster）
git push origin main
```

**認証が求められた場合:**
- HTTPS: GitHubユーザー名 + Personal Access Token（パスワードではない！）
- SSH: SSHキーのパスフレーズ

**プッシュが成功したら**、`https://github.com/sherzot/ai-business-concierge` にアクセスして新しいコミットを確認。

---

## 3. Supabaseにデプロイ

### 3.1 ログイン（まだの場合）

```bash
supabase login
```

ブラウザが開く → Supabaseにログイン → ターミナルに戻りトークンが保存される。

### 3.2 プロジェクトにリンク

```bash
supabase link --project-ref ufhepwdkjqptjvxrmpjn
```

`Database password` が求められた場合 — Dashboard → Project Settings → Database → "Reset database password" から取得。

### 3.3 マイグレーションをプッシュ

```bash
supabase db push
```

**これが行うこと:** `supabase/migrations/` の全SQLファイルを順番に実行。新しい `20260429_phase0_rls_complete.sql` がここでプッシュされる。

**コンフリクトが発生した場合**（"migration already applied" エラー）:

```bash
supabase migration list
# ローカルバージョンがリモートより進んでいれば — プッシュは成功する
```

### 3.4 マイグレーション実行を確認

```bash
supabase db remote sql --query "select * from phase0_rls_health;"
```

**期待される結果:** 12行のテーブル、各行に:
- `select_policies` ≥ 1
- `insert_policies` ≥ 1
- `update_policies` ≥ 1
- `delete_policies` ≥ 1
- `rls_enabled` = `true`

0が表示されている行がある場合 — RLSが完全にカバーされていない、再確認が必要。

### 3.5 Edge Functionをデプロイ

```bash
supabase functions deploy server --project-ref ufhepwdkjqptjvxrmpjn
```

```bash
# 正確な関数名を確認するには:
supabase functions list --project-ref ufhepwdkjqptjvxrmpjn
```

### 3.6 シークレットの設定（最も重要なステップ！）

`supabase/.env.example` の各エントリに対して実際の値を取得し、以下を実行:

```bash
# Anthropic Claude（Phase 0では必須）
supabase secrets set ANTHROPIC_API_KEY="sk-ant-api03-XXXXXX" --project-ref ufhepwdkjqptjvxrmpjn

# OpenAI embedding（KB用に必須）
supabase secrets set OPENAI_API_KEY="sk-proj-XXXXXX" --project-ref ufhepwdkjqptjvxrmpjn

# JWT（まだ設定されていない場合）
supabase secrets set JWT_SECRET="your-jwt-secret-from-dashboard" --project-ref ufhepwdkjqptjvxrmpjn
```

**Telegram、Click、Payme、Resend** — 必要な時（Phase 1+）に設定、今はスキップ可能。

### 3.7 シークレットの確認

```bash
supabase secrets list --project-ref ufhepwdkjqptjvxrmpjn
```

実際の値は表示されない（セキュリティ）、リストのみ。`ANTHROPIC_API_KEY` と `OPENAI_API_KEY` が存在すること。

### 3.8 Edge Functionスモークテスト

```bash
curl "https://ufhepwdkjqptjvxrmpjn.supabase.co/functions/v1/bright-api/make-server-6c2837d6/v1/health"
```

**期待:** `{"data":{"ok":true}}` または `{"status":"ok"}`.

---

## 4. Netlifyの更新

### 4.1 自動デプロイ

GitHubにプッシュした後、**Netlifyが自動でビルドする**（`main`ブランチに接続されている場合）。

確認:
1. https://app.netlify.com → プロジェクトを開く
2. **Deploys** ページ
3. 上部に "Deploy in progress" または "Published" が表示される

### 4.2 環境変数の更新（新しいものが追加された場合）

| Key | Value | ステータス |
|---|---|---|
| `VITE_SUPABASE_PROJECT_ID` | `ufhepwdkjqptjvxrmpjn` | ✅ 既に設定済み |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Dashboard → Settings → API Keys → Publishable key | ✅ modern public key |
| `VITE_FEATURE_HR_CANDIDATES` | `true` | 新規（スケルトンを表示するため）|
| `VITE_SENTRY_DSN` | （Phase 1）| 空のままに |
| `VITE_TELEGRAM_BOT_USERNAME` | （Phase 1）| 空のままに |

### 4.3 手動re-deploy（環境変数が更新された場合）

```bash
git commit --allow-empty -m "chore: trigger netlify rebuild"
git push
```

### 4.4 デプロイログの監視

**Deploys** → 最新のビルド → **Deploy log** を開く:
- "Build script completed" → ✅
- "Site is live" → ✅

典型的なエラー:
- `Module not found` → ローカルで `npm install` を実行し、package-lock.jsonをプッシュ
- `TypeScript error` → ローカルで `npm run build` で修正

---

## 5. 最終スモークテスト（5分）

### 5.1 バックエンドヘルス

```bash
curl https://ufhepwdkjqptjvxrmpjn.supabase.co/functions/v1/bright-api/make-server-6c2837d6/v1/health
# 期待: {"status":"ok"}
```

### 5.2 RLSヘルス

```bash
supabase db remote sql --query "select count(*) from phase0_rls_health where insert_policies > 0;"
# 期待: 12
```

### 5.3 AIチャット（Claudeで）

Supabase AuthからJWTを取得し:

```bash
curl -X POST https://ufhepwdkjqptjvxrmpjn.supabase.co/functions/v1/bright-api/make-server-6c2837d6/v1/ai/chat \
  -H "Authorization: Bearer <USER_JWT>" \
  -H "X-Tenant-Id: <TENANT_ID>" \
  -H "Content-Type: application/json" \
  -d '{"message":"こんにちは！あなたは誰ですか？","locale":"ja"}'
```

**期待:** `llm_provider: "claude"`、`llm_model: "claude-3-5-haiku-..."`、応答テキスト。

### 5.4 AIフィードバック

```bash
curl -X POST https://ufhepwdkjqptjvxrmpjn.supabase.co/functions/v1/bright-api/make-server-6c2837d6/v1/ai/feedback \
  -H "Authorization: Bearer <USER_JWT>" \
  -H "X-Tenant-Id: <TENANT_ID>" \
  -H "Content-Type: application/json" \
  -d '{"message_id":"<from-previous-call>","rating":1}'
```

**期待:** `{"data":{"saved":true}}`.

### 5.5 HR candidateスタブ

```bash
curl -X POST https://ufhepwdkjqptjvxrmpjn.supabase.co/functions/v1/bright-api/make-server-6c2837d6/v1/hr/candidates/analyze
```

**期待:** `501 NOT_IMPLEMENTED` エラー — これが **正しい** 結果（スケルトン接続済み、実装は後で）。

---

## 6. トラブルシューティング

### 6.1 `git push` が拒否される — "non-fast-forward"

リモートに新しいコミットがある（他の場所からプッシュされた）。

```bash
git pull --rebase origin main
git push origin main
```

### 6.2 `supabase db push` — "migration already applied"

```bash
supabase migration repair --status applied <migration_version>
```

### 6.3 Edge Functionの500エラー

```bash
supabase functions logs server --project-ref ufhepwdkjqptjvxrmpjn --tail
```

最も多い原因 — `ANTHROPIC_API_KEY` または `JWT_SECRET` が設定されていない。§3.6に戻って確認。

### 6.4 Netlifyビルド "Module not found"

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
git add package-lock.json
git commit -m "chore: refresh package-lock.json"
git push
```

### 6.5 RLSヘルスに0ポリシーが表示される

マイグレーションが実行されなかった。再実行:

```bash
supabase db push
```

---

## 7. チェックリスト — 今日中に完了

- [ ] **GitHub:** `git status` がクリーン、`git push origin main` が成功
- [ ] **Supabase DB:** `phase0_rls_health` ビューが12テーブルを表示（各テーブルに4ポリシー）
- [ ] **Supabase Functions:** `server` がデプロイ済み、`/health` が応答
- [ ] **Supabase Secrets:** `ANTHROPIC_API_KEY` と `OPENAI_API_KEY` が設定済み
- [ ] **AIチャットスモークテスト:** Claudeが応答する
- [ ] **AIフィードバックスモークテスト:** `{"saved":true}` が返る
- [ ] **Netlify:** デプロイ "Published"、URLが開ける
- [ ] **フロントエンドテーマ:** Indigoアクセントが表示される

全てグリーン — **Phase 0 LIVE！** 🎉

---

## 8. 次のステップ — Phase 1

`docs/PLAN.md §1`（Telegram MVP）— 新しいセッションで開始:
- grammY framework + botウェブフック
- `/start` 言語選択
- Telegram経由のAIアドバイザー
- 50ベータユーザー

Phase 0の成功をお祝いしましょう ☕️

---

*FIRST_PUSH.md — 今日の変更のためのデプロイジャーニー*
*DEPLOY_SETUP.md（メインドキュメント）もR001/R002のニュアンスに役立ちます*
