# AI Business Concierge — Active Plan

> Version 4.9 · 更新 2026-08-10
> Active/next taskのみを置く。旧master plan: [../archive/日本語/PLAN_LEGACY_2026-07-24.md](../archive/日本語/PLAN_LEGACY_2026-07-24.md)。

## P0 — 安全なsession開始

- [x] User changesを保持しdocumentation workflowを`55ec941`でcommit。
- [x] P0 commitsを`origin/main`へpushし、commit `06b5756`のCI run `31188866507`がfully greenと確認。
- [x] Node 22 install、type-check、96 tests、build、security checkを実行。
- [x] Scoped production audit: unexcepted high/critical 0; GHSA-qwww exceptionは2026-08-21まで。
- [x] Production health `200`とunauthenticated protected route `401`を確認。
- [x] DEVLOGとSTATUSへ証跡を記録。

## P1 — Portfolio-inspired frontend redesignをdelivery

- [x] Portfolio visual languageをauditしwarm canvas、ink typography、Sher-blue、divider、restrained-motion foundationを作成。
- [x] Landing/public forms、auth flows、product shell/dashboard、Inbox、Tasks、Docs、Settings、admin shellをredesign。
- [x] Light/dark、reduced motion、focus-visibleを維持しlegacy modulesをsemantic compatibilityで統一。
- [x] TypeScript、101/101 tests、production build、security gate、dependency audit成功。
- [x] Browser-enabled environmentでdesktop/mobile landing、login、forgot-password、contact routesをbrowser acceptance。Overlay、browser errors、horizontal overflowなし。
- [x] Findingsなしのredesignを`83bc7e0`でcommit/push、PR #2を作成しGitHub CI/Vercel/Netlify previewを確認、`65abe2f`として`main`へmerge。
- [ ] `main`へmerged済みのPR #4/PR #5 landing・Company Dashboard inverse-contrast fixesをNetlify productionへdeployし、dark-mode smoke-test。

## P1 — Supabase/Netlify security handoff完了

- [ ] 2026-08-21までにGHSA-qwww metadata exceptionを再確認/削除。
- [x] Production publishable keyを確認し、temporary rollout fallbackを保持してconfig、env type/example、CIを移行。
- [x] Publishable-key commit `35d4b91`をpushし、GitHub CI run `31192041119` greenとNetlify production deploy readyを確認。Bundleがlegacy fallbackを使うことを特定。
- [ ] Netlify CLI login後、production publishable envを設定してredeploy、Auth/Realtime smoke-test後にlegacy frontend env/fallbackを削除。
- [x] Direct browser SupabaseをAuth/Realtimeだけに限定し`from/rpc/storage/functions` regression gateを追加。
- [x] Public RLS/grants/views/functionsをinventory: 32/32 tablesでRLS、8/8 viewsが`security_invoker`、6/6 `SECURITY DEFINER` functionsはbrowser EXECUTE不可。
- [x] Risk scannerのserver-only boundaryを強化しbrowser CRUD grants/policiesを削除、production migration適用。
- [x] 5-state membership lifecycleを統合し、active membership/tenant helper、read-only browser grants、21-case rollback pgTAP fixtureを追加。
- [x] Real DB role `authenticated`でcross-tenant SELECTとbrowser INSERT/UPDATE/DELETE denialを検証。Fix前4/21 fail、fix後21/21 pass。
- [x] Tenant-protected service-role routesをDB-canonical contextへ移行し、JWT role/tenant bypassを閉じ、全`/admin/*` routesへactive-admin middlewareを追加。
- [x] Local non-production Auth fixtures/tokensでactive/blocked/terminated、super-admin cross-tenant/admin、role-`403` Edge integration testsを実行: 8/8 pass、production users/dataなし。
- [x] Fresh local migration stackを修復・実行: core baselineとhistorical PL/pgSQL replay fix後、32/32 migrationsとpgTAP 21/21 pass。
- [x] Supabase CLIを`v2.101.0`から`v2.112.0`へupgradeしfresh/full-stack regressionを再実行: 32/32 migrations、pgTAP 21/21、Edge 8/8、Storage/Auth/Studio `200`。
- [ ] Production/preview envとsecret分離を決定。

## P1 — Phase 2 AI文書作成を完了

- [ ] LLM質問/polishingを追加。
- [ ] Noto Sans対応の実PDF/DOCXを生成。
- [ ] Private Storage、tenant/user path、RLS、file validation、signed URLを追加。
- [ ] Testsと4-language/theme smoke-testを追加。
- [ ] Web flow安定後、Telegram wizardとfile送信を追加。

## P2 — Operational integrations

- [ ] `TELEGRAM_WEBHOOK_SECRET`を確認/設定し、webhookとbot flowを検証。
- [ ] Resend receiving、signature、tenant mapping、deliveryをE2E検証。
- [ ] Leaked Password Protectionを有効化しNetlify preview protectionを選択。

## P2 — HR Candidate Analysis

- [ ] GitHub analysis/cacheとPDF/DOCX parserを実装。
- [ ] LLM Router経由でSonnet structured scoring/reportingを接続。
- [ ] Auth、roles、rate limit、cost log、Zod validationを追加。
- [ ] Frontendを完了し`501` stubを削除、full flowをtest。

## Later phases

- Phase 3: AI Sales Bot、Click/Payme、subscriptions、usage billing、idempotency。
- Phase 4: billing/analytics agents、E2E、export/delete、push、performance。

Canonical詳細plan: [Uzbek PLAN](../PLAN.md)。
