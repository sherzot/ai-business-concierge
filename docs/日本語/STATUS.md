# AI Business Concierge — 現在の状態

> 最終確認済みcode/platform snapshot: **2026-08-10**
> ドキュメント整理日: **2026-08-07**
> 2026-08-07にlocal runtime、production health/auth、remote GitHub Actions baselineを再確認。P0 commitsをpushし、new CI runはfully greenで完了。
> 2026-08-08: publishable-key commitをpushしCI/Netlify deploy成功。ただしproduction bundleはまだlegacy fallbackを使用。Risk scanner tablesへのdirect browser Data API accessをproductionで閉鎖。
> 2026-08-08: Realtime tenant isolationをproductionで強化し、active membership/tenant確認とservice-role Edge authorizationを集中化。
> 2026-08-08: fresh local replayは32/32 migrations、pgTAPは21/21、real local Auth-token Edge acceptanceは8/8成功。
> 2026-08-08: production migration historyをlocalと整合。Local Storage/Auth pin driftを解消しenabled full-stack healthを確認。
> 2026-08-08: Supabase CLIを`v2.112.0`へupgrade。新local key/grant contractでfresh replayと全acceptance/regression gatesが成功。
> 2026-08-08: Portfolio-inspired frontend redesignはbrowser acceptance成功、commit `83bc7e0`/`509bc2d`をpush済み、PR #2 open、CI green。
> 2026-08-10: PR #3を`79be466`として`main`へmergeし、Codex review hotfix `aee6692`も`main`へpush。Netlify production deploy `6a79d69c9aa5a6bcf326e83c`はready、`bright-api` v75はACTIVE。Authenticated 2-role smoke-testが残る。
> 2026-08-10: UserがLeader Company ProfileとSuper Admin dashboardのauthenticated production checks成功を確認。Landing Why Us contrast fixはPR #4経由で`main`済み。Company Dashboard contrast fixとregression testはPR #5でgreen、production rollout pending。

## 現在のPhase

- Phase 0 Foundation: **完了**。
- Phase 1 Telegram MVP: **機能は完了、secret/webhookの運用確認が残る**。
- Phase 1.5 Company Auth & Management: **完了**。
- Phase 2 AI文書作成 + Landing: **進行中**。
- Phase 3 Sales Bot + Billing: **未着手**。
- Phase 4 Advanced Admin AI: **基盤のみ、完全なPhaseは未着手**。

## 最終確認済み技術snapshot

| Check | 状態 |
|---|---|
| Git | PR #4を`700483d`として`main`へsquash-merge。Company Dashboard contrast fix `4184ddb`はPR #5でremote gates green |
| Runtime | Node.js `22.18.0`; `.nvmrc`とpackage engine `22.x` |
| Supabase CLI | Official Homebrew tap `v2.112.0`; fresh local volumeで確認済み |
| Backend | Supabase Edge Function `bright-api` v75、`ACTIVE`、`verify_jwt=false` |
| Health | `200` |
| Type-check | 成功 |
| Unit tests | 23/23 files、108/108 tests |
| Production build/security check | 成功 |
| Production dependency audit | Scoped gate: unexcepted high/critical 0; GHSA-qwww exceptionは2026-08-21まで |
| Frontend design system | Portfolio-inspired warm/ink/Sher-blue。Landing、public/auth、product core、admin shell redesignをlocal完了 |
| Visual browser acceptance | Why Us 6/6 reasonsはdark/light modeでinverse text表示。Title `rgb(244,243,239)`、background `rgb(17,19,24)`、overflow `0`、console/overlay errorなし。Dashboard inverse markupはregression testで保護 |
| Preview CI | PR #3 Netlify preview deploy `6a79d24ae3c42e00088b058f` ready、Vercel ready |
| Remote GitHub Actions | PR #3 run `31393176016`、commit `be047c4`: success。全`frontend-security-gate` stepがgreen |
| Production frontend | Netlify deploy `6a79d69c9aa5a6bcf326e83c` ready、2026-08-10T13:50:02.498Zにpublished |
| Frontend Supabase key contract | Code/deployはpublishable primary + temporary fallback。Production bundleはlegacy anon fallback使用、Netlify env/login pending |
| DB/Edge security acceptance | Fresh migration replay 32/32、local pgTAP 21/21、real Auth-token Edge tests 8/8。Realtime tablesはSELECT-onlyでactive membership/tenant必須 |
| Migration history | Local/remote 32/32整合、production `db push --dry-run`: up to date |
| Local Supabase services | Storage `v1.68.1`、Auth `v2.195.0`。全enabled containers healthy、Storage/Auth/Studio HTTP `200`、transformations無効のため`imgproxy` stopped |

## Capability状態

| Area | Status | Note |
|---|---|---|
| Auth、multi-tenant、RBAC、主要web modules | Done | 基盤は動作 |
| Realtimeとtask notifications | Done | Inbox、Tasks、Notifications、acknowledge |
| Admin platform | Partial | 基本管理/monitoringあり。Userがtenant-profile/AI-stats authenticated smoke testsを確認済み。Dashboard dark-contrast rollout pending |
| Telegram | Partial / operational block | `TELEGRAM_WEBHOOK_SECRET`とwebhook確認が必要 |
| Resend inbox | Partial | Codeあり、receiving/delivery E2E未確認 |
| AI Concierge/RAGとcost tracking | Partial | 基盤あり、citation UX、plan enforcement、smoke-testが残る |
| AI文書作成 | Partial — active | 15 templates/4言語/draft pipelineあり、PDF/DOCXとStorageなし |
| HR Candidate Analysis | Skeleton | Scaffoldあり、production endpointは`501 NOT_IMPLEMENTED` |
| Billing / Click / Payme と AI Sales Bot | Planned | Phase 3 |

## 直近の順序

1. PR #5をmergeし、landing + Company Dashboard dark-contrast hotfixをNetlify productionへdeployして再smoke-test。
2. Netlify CLI login、production publishable env、redeploy、Auth/Realtime smoke-test後にlegacy fallbackを削除。
3. 2026-08-21までにGHSA-qwwwを再確認し、その後Document Assistant PDF/DOCX/Storageを継続。

詳細: [PLAN.md](PLAN.md)。Canonical: [Uzbek STATUS](../STATUS.md)。
