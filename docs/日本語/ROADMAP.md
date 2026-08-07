# AI Business Concierge – ロードマップ

要件とロードマップは相互に関連しています。`docs/REQUIREMENTS.md`に要件が、このドキュメントにフェーズと計画があります。

> 2026-08-07更新。現在状態: [STATUS.md](STATUS.md)。Active tasks: [PLAN.md](PLAN.md)。

---

## 現在の作業地点（2026-08-07 docs snapshot）

- Phase 0、Phase 1、Phase 1.5は完了
- Phase 2進行中: landing、4言語15 templates、draft pipelineは完成
- 現在の作業: AI polishing、実PDF/DOCX、private StorageでAI書類メーカーを完了
- HR Candidate Analysisはskeletonのまま、endpointは`501 NOT_IMPLEMENTED`
- Phase 3 billing/paymentsとPhase 4 advanced Admin AIは未開始

---

## フェーズ1: 基盤（完了）✅

- 認証、ロール、テナント
- すべてのコアモジュール（Reports、Inbox、Tasks、HR、Docs、Integrations）
- AI Concierge
- Settings

---

## フェーズ2: AI書類メーカー + Landing（進行中）

| Slice | Status | 要件ID |
|------|--------|--------|
| Landing、FAQ、SEO、responsive UI | Done | — |
| 15 templates、4言語、draft pipeline | Done | R-021 |
| AI polishing、PDF/DOCX、private Storage、signed URL | Active | R-021 |
| Telegram document wizard/送信 | Next | R-021 |
| HR Candidate Analysis full implementation | 書類メーカー完了後 | R-016 |

---

## フェーズ3: Sales Bot + Monetization

| Slice | 要件ID |
|------|--------|
| AI Sales Bot、catalog、order flow | — |
| Click/Paymeとsubscription lifecycle | R-003 |
| Plan limits、usage billing、grace period | R-018 |
| Resend idempotencyとretry queue | R-001 |

---

## フェーズ4: Advanced Admin AI + Quality

| Slice | 要件ID |
|------|--------|
| Billing/MRR/churnとAI cost monitoring | R-020 |
| KB、Support、Analytics、Health agents | R-020 |
| Playwright E2Eとtenant-isolation tests | — |
| Export/delete、SSO/2FA、branding、advanced analytics | R-005、R-011–R-013 |

## フェーズ5: Scale

- Performance/code splittingとobservability。
- Web Pushと深いPWA/offline flows。
- Regional expansionとexternal business integrations。

---

## 使い方

### 1. 新しい要件を追加する際
1. `docs/REQUIREMENTS.md`に新しい行を追加（ID、説明、モジュール、優先度）
2. `docs/ROADMAP.md`の該当フェーズに追加
3. 優先度が変わった場合 – ロードマップを更新

### 2. スプリント計画時
1. ロードマップからフェーズを選択
2. Requirementsから該当IDを取得
3. Backend → Frontendの順で作業

### 3. 変更について
- RequirementsとRoadmapはドキュメントのみ
- コアコードは`frontend/`と`supabase/`にある
- 新しい要件が来たら – まずRequirementsに書き、次にコードへ

---

## 変更履歴

| 日付 | 変更内容 |
|------|----------|
| 2026-08-07 | Phase 2の完了/残作業を分離しCandidate skeletonとactive planを明確化 |
| 2026-07-24 | Phase 1.5完了とPhase 2開始地点をコードおよびDEVLOGと同期 |
| 2026-02-05 | 初期ロードマップ、フェーズ1完了 |
