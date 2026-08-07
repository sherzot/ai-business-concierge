# AI Business Concierge — Active Plan

> Version 4.0 · 更新 2026-08-07
> Active/next taskのみを置く。旧master plan: [../archive/日本語/PLAN_LEGACY_2026-07-24.md](../archive/日本語/PLAN_LEGACY_2026-07-24.md)。

## P0 — 安全なsession開始

- [x] User changesを保持しdocumentation workflowを`55ec941`でcommit。
- [x] `730b3bd`のlatest existing remote CI runがgreenと確認。
- [ ] Local `55ec941`と`a088fef`をpush後、new CI runをgreenまで確認。
- [x] Node 22 install、type-check、96 tests、build、security checkを実行。
- [x] Scoped production audit: unexcepted high/critical 0; GHSA-qwww exceptionは2026-08-21まで。
- [x] Production health `200`とunauthenticated protected route `401`を確認。
- [x] DEVLOGとSTATUSへ証跡を記録。

## P1 — Supabase/Netlify security handoff完了

- [ ] 2026-08-21までにGHSA-qwww metadata exceptionを再確認/削除。
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY` env contractへ安全に移行。
- [ ] Config、env example、Vitest、CI、Netlify namesを統一。
- [ ] Direct browser SupabaseをAuth/Realtimeだけに限定しregression gateを追加。
- [ ] Public RLS/grants/RPCとcross-tenant CRUD拒否を監査。
- [ ] Service-roleと`SECURITY DEFINER` authorization boundaryを確認。
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
