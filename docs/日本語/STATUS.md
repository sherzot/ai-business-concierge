# AI Business Concierge — 現在の状態

> 最終確認済みcode/platform snapshot: **2026-08-07**
> ドキュメント整理日: **2026-08-07**
> 2026-08-07にlocal runtime、production health/auth、remote GitHub Actions baselineを再確認。P0 commitsをpushし、new CI runはfully greenで完了。
> 2026-08-08: publishable-key frontend contractをlocal実装・検証。Production deploy/smoke verificationはpending。

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
| Git | P0 commit set `55ec941` → `a088fef` → `06b5756`を`origin/main`へpush済み |
| Runtime | Node.js `22.18.0`; `.nvmrc`とpackage engine `22.x` |
| Backend | Supabase Edge Function `bright-api` v72 |
| Health | `200` |
| Type-check | 成功 |
| Unit tests | 19/19 files、96/96 tests |
| Production build/security check | 成功 |
| Production dependency audit | Scoped gate: unexcepted high/critical 0; GHSA-qwww exceptionは2026-08-21まで |
| Remote GitHub Actions | Run `31188866507`、commit `06b5756`: success。全`frontend-security-gate` stepがgreen |
| Frontend Supabase key contract | Local: publishable primary + temporary legacy fallback。Production rollout pending |

## Capability状態

| Area | Status | Note |
|---|---|---|
| Auth、multi-tenant、RBAC、主要web modules | Done | 基盤は動作 |
| Realtimeとtask notifications | Done | Inbox、Tasks、Notifications、acknowledge |
| Admin platform | Partial | 基本管理/monitoringあり、advanced agents/billingなし |
| Telegram | Partial / operational block | `TELEGRAM_WEBHOOK_SECRET`とwebhook確認が必要 |
| Resend inbox | Partial | Codeあり、receiving/delivery E2E未確認 |
| AI Concierge/RAGとcost tracking | Partial | 基盤あり、citation UX、plan enforcement、smoke-testが残る |
| AI文書作成 | Partial — active | 15 templates/4言語/draft pipelineあり、PDF/DOCXとStorageなし |
| HR Candidate Analysis | Skeleton | Scaffoldあり、production endpointは`501 NOT_IMPLEMENTED` |
| Billing / Click / Payme と AI Sales Bot | Planned | Phase 3 |

## 直近の順序

1. Publishable-key changeをpushし、GitHub CI/Netlify deployとproduction bundle/Auth/Realtimeを確認後、legacy frontend env/fallbackを削除。
2. 2026-08-21までにGHSA-qwww metadata exceptionを再確認/削除。
3. RLS/grants、cross-tenant authorization auditを完了。
4. 文書作成のPDF/DOCX、private Storage、signed URLを完了。
5. Telegram/Resend verification後、HR Candidate Analysisを実装。

詳細: [PLAN.md](PLAN.md)。Canonical: [Uzbek STATUS](../STATUS.md)。
