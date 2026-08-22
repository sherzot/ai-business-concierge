# AI Business Concierge — Active Plan

> Version 6.5 · 更新 2026-08-22
> Active/next taskのみを置く。旧master plan: [../archive/日本語/PLAN_LEGACY_2026-07-24.md](../archive/日本語/PLAN_LEGACY_2026-07-24.md)。

## P0 — 安全なsession開始

- [x] User changesを保持しdocumentation workflowを`55ec941`でcommit。
- [x] P0 commitsを`origin/main`へpushし、commit `06b5756`のCI run `31188866507`がfully greenと確認。
- [x] Node 22 install、type-check、96 tests、build、security checkを実行。
- [x] Scoped production audit: high/critical 0件。Temporary GHSA-qwww metadata exceptionは2026-08-11に削除。
- [x] Production health `200`とunauthenticated protected route `401`を確認。
- [x] DEVLOGとSTATUSへ証跡を記録。

## P1 — Portfolio-inspired frontend redesignをdelivery

- [x] Portfolio visual languageをauditしwarm canvas、ink typography、Sher-blue、divider、restrained-motion foundationを作成。
- [x] Landing/public forms、auth flows、product shell/dashboard、Inbox、Tasks、Docs、Settings、admin shellをredesign。
- [x] Light/dark、reduced motion、focus-visibleを維持しlegacy modulesをsemantic compatibilityで統一。
- [x] TypeScript、101/101 tests、production build、security gate、dependency audit成功。
- [x] Browser-enabled environmentでdesktop/mobile landing、login、forgot-password、contact routesをbrowser acceptance。Overlay、browser errors、horizontal overflowなし。
- [x] Findingsなしのredesignを`83bc7e0`でcommit/push、PR #2を作成しGitHub CIとNetlify previewを確認、`65abe2f`として`main`へmerge。

## P1 — Supabase/Netlify security handoff完了

- [x] Production publishable keyを確認し、temporary rollout fallbackを保持してconfig、env type/example、CIを移行。
- [x] Publishable-key commit `35d4b91`をpushし、GitHub CI run `31192041119` greenとNetlify production deploy readyを確認。Bundleがlegacy fallbackを使うことを特定。
- [x] Netlify production publishable envを設定しredeploy、Auth `200`/Realtime `OPEN` smoke tests成功後、legacy frontend envを削除。
- [x] Direct browser SupabaseをAuth/Realtimeだけに限定し`from/rpc/storage/functions` regression gateを追加。
- [x] Public RLS/grants/views/functionsをinventory: 32/32 tablesでRLS、8/8 viewsが`security_invoker`、6/6 `SECURITY DEFINER` functionsはbrowser EXECUTE不可。
- [x] Risk scannerのserver-only boundaryを強化しbrowser CRUD grants/policiesを削除、production migration適用。
- [x] 5-state membership lifecycleを統合し、active membership/tenant helper、read-only browser grants、21-case rollback pgTAP fixtureを追加。
- [x] Real DB role `authenticated`でcross-tenant SELECTとbrowser INSERT/UPDATE/DELETE denialを検証。Fix前4/21 fail、fix後21/21 pass。
- [x] Tenant-protected service-role routesをDB-canonical contextへ移行し、JWT role/tenant bypassを閉じ、全`/admin/*` routesへactive-admin middlewareを追加。
- [x] Local non-production Auth fixtures/tokensでactive/blocked/terminated、super-admin cross-tenant/admin、role-`403` Edge integration testsを実行: 8/8 pass、production users/dataなし。
- [x] Fresh local migration stackを修復・実行: core baselineとhistorical PL/pgSQL replay fix後、32/32 migrationsとpgTAP 21/21 pass。
- [x] Supabase CLIを`v2.101.0`から`v2.112.0`へupgradeしfresh/full-stack regressionを再実行: 32/32 migrations、pgTAP 21/21、Edge 8/8、Storage/Auth/Studio `200`。
- [x] Delivery architectureを決定: Netlify + Supabaseのみ。Productionはproduction Supabase、preview/branch/devは別staging projectを使用し、Vercelをactive architectureから除外。
- [x] Fail-closed `validate:deploy-env` guard、10 Node tests、dynamic Supabase CSP、CI/security gate wiringを追加。
- [x] `sherzot's Org`のstaging cost `$0/month`を提示し、2段階user確認後に`ap-southeast-1`でproject作成。
- [x] Stagingへ32/32 migrationsを適用し、`bright-api` v1をdeploy、health/Auth-settings/security-advisor smoke testsをpass。
- [x] Staging Auth redirectsをNetlify preview wildcard/local Vite URLsへ制限し、email confirmation、8-digit/1-minute OTP、TOTPをexplicit pin。
- [x] Netlify productionとdeploy-preview/branch-deploy/dev envを分離し、optional URL envを削除、authoritative CLI read-back 4/4 contextsをpass。Personalではbrowser-public `VITE_*`のみ`All` scopeを使用。
- [x] External Vercel Git integrationを切断しproject/deployment historyを保持。CLIが作成したOIDC `.env.local`と`.vercel` metadataを直ちに削除。

## P1 — Phase 2 AI文書作成を完了

- [ ] `ANTHROPIC_API_KEY`をstaging Edge secretsへ安全に設定し、authenticated real-provider preview/save smokeをgreenにする。
- [ ] Green staging smoke後、production migration `20260821000000` + `bright-api`をdeployし、public/protected smoke testsを行う。
- [ ] Web flow安定後、Telegram wizardとfile送信を追加。

## P2 — Operational integrations

- [ ] Production v15 fail-closed `503`後、新しい`TELEGRAM_WEBHOOK_SECRET`を設定し、同じ値でTelegram `setWebhook`を再接続する。
- [ ] Resend receiving、signature、tenant mapping、deliveryをE2E検証。
- [ ] **BLOCKED — paid plan:** Supabase organizationはFree。承認済みPro+ upgrade後にLeaked Password Protectionを有効化。
- [ ] Netlify preview protectionを選択。

## P2 — HR Candidate Analysis

- [ ] **BLOCKED — `ANTHROPIC_API_KEY`:** Real CV semantic structuringとSonnet scoring/report LLM Router callを準備済みstrict-output・account-before-validation contractへ接続。
- [ ] LLM integration後、準備済みquota lifecycle boundary経由でactive routeを接続し、`501`を削除してfull-flow integration/manual acceptanceを実施。

## Later phases

- Phase 3: AI Sales Bot、Click/Payme、subscriptions、usage billing、idempotency。
- Phase 4: billing/analytics agents、E2E、export/delete、push、performance。

Canonical詳細plan: [Uzbek PLAN](../PLAN.md)。
