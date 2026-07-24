# AI Business Concierge – ロードマップ

要件とロードマップは相互に関連しています。`docs/REQUIREMENTS.md`に要件が、このドキュメントにフェーズと計画があります。

---

## 現在の作業地点（2026-07-24）

- Phase 0、Phase 1、Phase 1.5は完了
- Phase 2開始済み: web landing、FAQ、SEOは完成
- 次のプロダクト作業: AI書類メーカー（文書生成）
- HR Candidate Analysisはskeletonのまま、endpointは`501 NOT_IMPLEMENTED`
- Phase 3 billing/paymentsとPhase 4 advanced Admin AIは未開始

---

## フェーズ1: 基盤（完了）✅

- 認証、ロール、テナント
- すべてのコアモジュール（Reports、Inbox、Tasks、HR、Docs、Integrations）
- AI Concierge
- Settings

---

## フェーズ2: 短期（1〜2ヶ月）

| 時期 | タスク | 要件ID |
|------|--------|--------|
| 第1〜2週 | リアルInbox: Email API（Resend/SendGrid）またはTelegram Bot | R-001 |
| 第2〜3週 | Supabase Realtime – inbox、tasksの更新 | R-002 |
| 第3〜4週 | 監査ログページ（admin） | R-004 |

---

## フェーズ3: 中期（2〜4ヶ月）

| 時期 | タスク | 要件ID |
|------|--------|--------|
| 月1 | 課金/サブスクリプション（StripeまたはSupabase Billing） | R-003 |
| 月2 | エクスポート（Excel、CSV）– Reports、Tasks | R-005 |
| 月2〜3 | プッシュ通知 | R-006 |
| 月3〜4 | PWA / モバイル最適化 | R-007 |

---

## フェーズ4: 長期（4ヶ月以降）

| 時期 | タスク | 要件ID |
|------|--------|--------|
| 月4以降 | SSO / OAuth | R-011 |
| 月4以降 | 2FA | R-012 |
| 月5以降 | カスタムブランディング | R-009 |
| 月5以降 | 高度な分析 | R-013 |

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
| 2026-07-24 | Phase 1.5完了とPhase 2開始地点をコードおよびDEVLOGと同期 |
| 2026-02-05 | 初期ロードマップ、フェーズ1完了 |
