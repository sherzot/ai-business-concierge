# AI Business Concierge — 現在の状態

> 最終確認済みcode/platform snapshot: **2026-08-11**
> ドキュメント整理日: **2026-08-07**
> 2026-08-07にlocal runtime、production health/auth、remote GitHub Actions baselineを再確認。P0 commitsをpushし、new CI runはfully greenで完了。
> 2026-08-08: publishable-key commitをpushしCI/Netlify deploy成功。ただしproduction bundleはまだlegacy fallbackを使用。Risk scanner tablesへのdirect browser Data API accessをproductionで閉鎖。
> 2026-08-08: Realtime tenant isolationをproductionで強化し、active membership/tenant確認とservice-role Edge authorizationを集中化。
> 2026-08-08: fresh local replayは32/32 migrations、pgTAPは21/21、real local Auth-token Edge acceptanceは8/8成功。
> 2026-08-08: production migration historyをlocalと整合。Local Storage/Auth pin driftを解消しenabled full-stack healthを確認。
> 2026-08-08: Supabase CLIを`v2.112.0`へupgrade。新local key/grant contractでfresh replayと全acceptance/regression gatesが成功。
> 2026-08-08: Portfolio-inspired frontend redesignはbrowser acceptance成功、commit `83bc7e0`/`509bc2d`をpush済み、PR #2 open、CI green。
> 2026-08-10: PR #3を`79be466`として`main`へmergeし、Codex review hotfix `aee6692`も`main`へpush。Netlify production deploy `6a79d69c9aa5a6bcf326e83c`はready、`bright-api` v75はACTIVE。Authenticated 2-role smoke-testが残る。
> 2026-08-10: UserがLeader Company ProfileとSuper Admin dashboardのauthenticated production checks成功を確認。PR #4のLanding Why Us fixとPR #5のCompany Dashboard fixは`main`へmergeし、Netlify production deploy `6a79e664a453161423131204`でship済み。Authenticated dashboard visual recheckが残る。
> 2026-08-11: Netlify productionをmodern `sb_publishable_...` keyへ移行し、Auth `200`とRealtime `OPEN` smoke tests成功。Legacy frontend envを削除。Source fallback removalは`agent/remove-legacy-supabase-anon-fallback`で準備し、GitHub CLI authをkeyringで確認。
> 2026-08-11: No-fallback sourceをPR #6経由で`2b71a49`として`main`へmerge。GitHub CI green、final Netlify deploy `6a7ab5474835d660f21249cd` ready。Production bundle/Auth/Realtime recheck成功、publishable-key handoff完了。
> 2026-08-11: UserがLeaderとしてauthenticated production sessionを開き、Company Dashboard Business Status panelをcomputed contrastとvisual screenshotでdark mode完全確認。Textは可読、overlap/overflow/browser errorなし、acceptance完了。
> 2026-08-11: Raw npm production auditはvulnerability 0件。Temporary GHSA-qwww metadata exceptionを削除し、exceptionなしのproduction audit gate成功を確認。
> 2026-08-11: GHSA exception removalを`1fb6c0c`として`main`へdirect push。GitHub CI run `31466592524`は全security-gate steps greenで完了。
> 2026-08-11: 有効なdelivery platformをNetlify + Supabaseのみに確定し、Vercel Git integrationを切断。`$0/month` staging Supabase projectを2段階user確認後に作成し、32/32 migrations、`bright-api` v1、Auth hardening、Netlify context isolationは4/4 green。
> 2026-08-11: Isolation PR #7を`3fb1592`として`main`へmerge。PR/main CIはgreen。Netlify preview/production smoke testsで適切なstaging/production ref、Auth/health `200`、Realtime `OPEN`、CSP、preview noindex/no-storeを確認し、Vercel新規deploymentは0。
> 2026-08-11: PR #7 Codex `.env`/CSP hotfixをPR #8経由で`e2b3e78`としてmain/productionへship。CI `31479695709`/`31479985070`とpreview/production smokeはgreen。PR #8 Codex mode/STATUS follow-upは`agent/fix-security-check-build-mode`でactive。
> 2026-08-11: PR #9 Codex endpoint-drift P2 findingをmerge前に修正。Security gateはgenerated CSP refを全bundled Supabase HTTPS/WSS endpoint refsと比較する。Deployment/security environment tests 14/14、mismatched fixtureは期待通りblock。
> 2026-08-11: PR #9を`c00362a`としてmain/productionへmerge。PR/main CI green。Preview/production CSP/bundle isolation、Auth/health、production Realtime smoke tests成功。
> 2026-08-11: Stagingをmodern Edge key overridesへ移行しlegacy anon/service-role keysをdisable。Real synthetic authenticated Edge acceptanceは8/8成功し、2 tenants/5 Auth usersのmandatory cleanupとfinal fixture count 0/0を確認。
> 2026-08-11: Acceptance changesを`cc31fe7`としてdraft PR #10へpush。GitHub CI run `31485875838`とNetlify deploy-preview `6a7b047d3150bc00088fc18d`はgreen。
> 2026-08-11: AI文書作成の実PDF/DOCX、embedded Noto Sans JP、private Storage contractをstagingで完了。pgTAP 12/12とbinary/frontend gatesはgreen、`bright-api` v5 ACTIVE。Productionは意図的に未変更。
> 2026-08-11: PR #10を`55d1468`としてmainへmerge。PR #11をmainへretarget/rebaseしCI/Netlify preview成功。Codexの2件P2 partial-failureをimmutable UUID-versioned objectsとDB-first deleteで修正。Stagingは34/34 migrations、`bright-api` v6、health `200`。

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
| Git | PR #10は`55d1468`としてmerged。PR #11は`main`へretarget/rebase、head `50a46c2` MERGEABLE。Local Codex follow-up fixesはpush/re-review待ち |
| Runtime | Node.js `22.18.0`; `.nvmrc`とpackage engine `22.x` |
| Supabase CLI | Official Homebrew tap `v2.112.0`; fresh local volumeで確認済み |
| Backend | Supabase Edge Function `bright-api` v75、`ACTIVE`、`verify_jwt=false` |
| Health | `200` |
| Staging Supabase | `piqsyfwrjtormrlenjix`、`ap-southeast-1`、`$0/month`、`ACTIVE_HEALTHY`。34/34 migrations、`bright-api` v6 ACTIVE、health `200` |
| Staging Auth/API keys | Netlify preview wildcard + local Vite redirect allow-list。Email confirmation ON、8-digit/1-minute OTP、TOTP ON。Auth settings HTTP `200`、autoconfirm false。Edgeはmodern `SB_ANON_KEY`/`SB_SERVICE_ROLE_KEY` overridesを使用しlegacy anon/service-role API keysはdisabled |
| Type-check | 成功 |
| Unit tests | Frontend 23/23 files、109/109 tests。Deno document binary/lifecycle 5/5 |
| Deployment environment guard | Node tests 14/14: isolation contract 10件 + Vite `.env` fallback/runtime-precedence 2件 + bundled-endpoint extraction regressions 2件 |
| Production build/security check | Synthetic non-production refでbuild pass。CSPはそのrefから生成、10 build/Netlify filesを検査 |
| Production dependency audit | Raw audit: vulnerability合計0件; scoped gateはexceptionなしでhigh/critical 0件 |
| Frontend design system | Portfolio-inspired warm/ink/Sher-blue。Landing、public/auth、product core、admin shell redesignをlocal完了 |
| Visual browser acceptance | Landing Why Us 6/6 inverse text green。Authenticated Company Dashboard dark mode: Business Status background `rgb(17,19,24)`、title/percentage contrast `16.73:1`、muted text `7.5:1`、success signal `10.66:1`。12/12 text nodesがpanel内、overlap/overflow/console error `0` |
| Delivery platform | Netlifyのみ。RepositoryにVercel config/dependencyなし。External Vercel projectは保持し、`gitRepositoryConnected=false`を確認 |
| Environment isolation | Authoritative Netlify CLI read-back 4/4: `production` -> production Supabase、`deploy-preview`/`branch-deploy`/`dev` -> staging。Optional URL envなし。Personalではbrowser-public `VITE_*`のみ`All` scopeを使用 |
| Staging security advisor | Error `0`、既知`vector` public-schema warning `1`、server-only RLS/no-policy info `11` |
| Remote GitHub Actions | PR #11 run `31500547178`、commit `50a46c2`: success。Codex follow-up push後のnew run待ち |
| Netlify preview | PR #11 deploy `6a7b2e774d8b4a00084583b0` ready。`/`と`/dashboard/docs` `200`、staging-only CSP/noindex green。Follow-up deploy待ち |
| Production frontend | Deploy `6a7af6d8233dfa000954ac24` ready、build `6a7af6d8233dfa000954ac22`、32s、plugin success、87,166 filesでsecret match 0。Production-only CSP/bundle、page/Auth/health `200`、Realtime `OPEN` |
| Frontend Supabase key contract | Code/productionはmodern publishable keyのみ許可。Bundleはmodern key 1、JWT-like key 0、legacy env nameなし、format guardあり。Auth settings `200`、Realtime `OPEN`。Netlify legacy frontend env削除済み |
| DB/Edge security acceptance | Fresh migration replay 32/32、local pgTAP 21/21、local real Auth-token Edge tests 8/8。Staging modern-key remote Edge 8/8、2 tenants/5 Auth users cleanup、final fixture 0/0。Realtime tablesはSELECT-onlyでactive membership/tenant必須 |
| Document binary/Storage acceptance | 実4-language PDF/DOCX baseline green。Immutable same-format re-exportはDeno 5/5内でPASS。Staging schema/constraint/private buckets green、fixture residue 0。New remote Auth acceptanceはCloudflare IP `403`でBLOCKED |
| Migration history | Local/staging 34/34。Productionは32 migrations、document buckets/new `doc_generated` columns `0`のまま。Preflightはlegacy rows 2、`storage_path`/incompatible rows `0`。PR #11 merge待ち |
| Local Supabase services | Last full-stack snapshot: Storage `v1.68.1`、Auth `v2.195.0`、enabled containers healthy、Storage/Auth/Studio HTTP `200`。2026-08-11 closeout時はstack stoppedで、remote staging acceptanceは非依存 |

## Capability状態

| Area | Status | Note |
|---|---|---|
| Auth、multi-tenant、RBAC、主要web modules | Done | 基盤は動作 |
| Realtimeとtask notifications | Done | Inbox、Tasks、Notifications、acknowledge |
| Admin platform | Partial | 基本管理/monitoringあり。Tenant-profile/AI-stats authenticated smoke testsとCompany Dashboard dark-contrast visual acceptanceをuser sessionで確認済み |
| Telegram | Partial / operational block | `TELEGRAM_WEBHOOK_SECRET`とwebhook確認が必要 |
| Resend inbox | Partial | Codeあり、receiving/delivery E2E未確認 |
| AI Concierge/RAGとcost tracking | Partial | 基盤あり、citation UX、plan enforcement、smoke-testが残る |
| AI文書作成 | Staging-ready / production pending | 15 templates、4言語、実PDF/DOCX、embedded Noto Sans JP、private Storage、60秒signed URL、tenant-scoped export/deleteを実装済み |
| HR Candidate Analysis | Skeleton | Scaffoldあり、production endpointは`501 NOT_IMPLEMENTED` |
| Billing / Click / Payme と AI Sales Bot | Planned | Phase 3 |

## 直近の順序

1. Codex transactional follow-upをPR #11へpushし、GitHub CI/Netlify preview/Codex re-reviewを通してmergeする。
2. Merge後にproduction migrationsと`bright-api`/Netlifyをrolloutし、環境が許す最大範囲のauthenticated PDF/DOCX/Storage smoke-testを行う。
3. 次にLLM Router経由のAI questions/polishingを接続。

詳細: [PLAN.md](PLAN.md)。Canonical: [Uzbek STATUS](../STATUS.md)。
