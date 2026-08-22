# HR_CANDIDATE_ANALYSIS.md

> **Status: PARTIAL IMPLEMENTATION / DESIGN.** Public GitHub/cache、bounded local PDF/DOCXとsanitized raw-CV in-memory seam、request/role/plan policy、PostgreSQL quota/finally-release、bounded multipart、atomic usage accounting、minimized prompt、strict output/account-before-validation付きinjectable Haiku/Sonnet provider stages、tenant/request-scoped server composition、deterministic merge/scoring/report、provider-stage orchestrator、application execution、frontendはreal/tested。Global deadline、live smoke、full HTTP wiringが残り、canonical endpointは`501 NOT_IMPLEMENTED`を返す。現在状態: [STATUS.md](STATUS.md)。

> **AI Business Concierge — `hr_candidate_analysis` モジュール設計パッケージ**
> バージョン: 1.0 (MVP設計) · 日付: 2026-04-29
> オーナー: Sher · モジュール場所: `features/hr/candidates/` (サブモジュール)

---

## 0. このドキュメントについて

このドキュメントは `hr_candidate_analysis` モジュールの **MVP設計仕様**です。アーキテクチャ、フォルダ構造、APIコントラクト、JSONスキーマ、バックエンド実装計画、スケーリング戦略、v2ロードマップを網羅しています。本番コードは含まず — 実装は次のセッションで4つの専門エンジニアリングエージェントに委任されます。

---

## 1. モジュールの目的

HRマネージャーがGitHubユーザー名（またはURL）、履歴書（PDF/DOCX）、オプションの求人票を送信します。システムは4つのアナライザーを並行して実行し、6つの次元でスコアを算出し、強み・弱み・不一致フラグ・AIサマリー・カスタマイズされた面接質問・採用推奨を含む構造化JSONレポートを返します。**セッションのみ** — MVPでは永続化なし。

**スコープ外（MVP）：**
- GitHub OAuth / プライベートリポジトリアクセス
- LinkedInスクレイピング
- ATS / カレンダー統合
- 候補者の永続データベース
- 一括バッチ処理（1リクエストあたり1候補者超）
- ビデオ・音声面接分析

---

## 2. アーキテクチャ

### 2.1 高レベルフロー

```
┌─────────────────────────────────────────────────────────────────┐
│  Frontend — features/hr/candidates/                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ CandidateUploadForm                                      │   │
│  │   • GitHubユーザー名/URL入力                              │   │
│  │   • 履歴書ファイル選択 (PDF/DOCX, ≤ 5 MB)                │   │
│  │   • オプションの求人票テキストエリア                       │   │
│  │   • ロケール選択 (uz / ja / en)                           │   │
│  └────────────────────────┬─────────────────────────────────┘   │
└───────────────────────────┼─────────────────────────────────────┘
                            │ POST multipart/form-data
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  Backend — supabase/functions/server                            │
│  routes/hr-candidate.ts → POST /v1/hr/candidates/analyze        │
│                            ↓                                    │
│  services/hr-candidate/index.ts  (オーケストレーター)             │
│  ┌────────────┬────────────┬───────────────┬────────────────┐   │
│  │ github-    │ cv-parser  │ candidate-    │ report-        │   │
│  │ analyzer   │            │ scorer        │ generator      │   │
│  │ (REST API) │ (PDF/DOCX) │ (Claude       │ (Claude        │   │
│  │            │            │  Sonnet 4)    │  Sonnet 4)     │   │
│  └────────────┴────────────┴───────────────┴────────────────┘   │
│        │            │             │                  │          │
│        └─Promise.all┘             └─sequential──────┘           │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
                      JSONレスポンス
                  (CandidateAnalysisResult)
```

### 2.2 コンポーネント

| コンポーネント | 責任 | 技術 |
|---|---|---|
| **github_analyzer** | 公開プロフィール → リポジトリ統計、スタック、活動量、README/CI/テストシグナル | `fetch` → GitHub REST v3 |
| **cv_parser** | PDF/DOCX → 構造化テキスト → 経験年数、役職、スタック、学歴 | `pdfjs-dist`, `docx`, Claude Haiku |
| **candidate_scorer** | GitHub + 履歴書シグナル → 6カテゴリで0〜100スコア算出 | Claude Sonnet 4（構造化出力） |
| **report_generator** | スコア + シグナル → ナラティブサマリー + 面接質問 + 推奨 | Claude Sonnet 4、ロケール対応 |
| **orchestrator** | 並行/逐次ツール実行、タイムアウト、部分障害処理 | Promise.all + AbortController |

### 2.3 データフロー

```
1. 入力検証（Zod）
2. 並行フェッチ（最大10秒、AbortController）：
     ├── github_analyzer.fetch(username)
     └── cv_parser.parse(file)
3. 生シグナル収集 → CandidateRawSignals
4. candidate_scorer.score(signals, jobDescription?, locale)
   → CategoryScores + inconsistency_flags
5. report_generator.generate(signals, scores, locale)
   → AIサマリー + interview_questions + hiring_recommendation
6. CandidateAnalysisResult を組み立て → JSON返却
7. （永続化なし） — request_id はログ用に返される
```

### 2.4 SLAとタイムアウト戦略

| ステージ | 目標 | ハードタイムアウト | フォールバック |
|---|---|---|---|
| GitHubフェッチ | < 4秒 | 6秒 | 継続、`github_status: "partial"` |
| 履歴書パース | < 3秒 | 5秒 | エラー返却、スコアリング不可 |
| スコアリング（Sonnet） | < 8秒 | 12秒 | 3回リトライ、その後 `degraded: true` |
| レポート（Sonnet） | < 10秒 | 14秒 | スコア返却、`report_status: "failed"` |
| **合計** | **< 25秒** | **30秒（全体）** | 504 + `request_id` |

---

## 3. フォルダ構造

### 3.1 バックエンド

```
supabase/functions/server/
├── index.ts                              # 既存 — 新ルートをマウント
├── routes/
│   └── hr-candidate.ts                   # 新規 — POST /v1/hr/candidates/analyze
└── services/
    └── hr-candidate/                     # 新規サブフォルダ
        ├── index.ts                      # オーケストレーター
        ├── github-analyzer.ts            # ツール1
        ├── cv-parser.ts                  # ツール2
        ├── candidate-scorer.ts           # ツール3
        ├── report-generator.ts           # ツール4
        ├── types.ts                      # 共有TSタイプ
        ├── prompts.ts                    # Sonnetシステムプロンプト（uz/ja/en）
        ├── schemas/
        │   └── candidate-analysis.schema.json
        └── __tests__/
            ├── github-analyzer.test.ts
            ├── cv-parser.test.ts
            └── candidate-scorer.test.ts
```

### 3.2 フロントエンド

```
frontend/src/features/hr/
└── candidates/                           # 新規サブモジュール
    ├── api/
    │   └── candidatesApi.ts              # POST /v1/hr/candidates/analyze
    ├── components/
    │   ├── CandidateUploadForm.tsx       # メインフォーム
    │   ├── CandidateScoreCard.tsx        # 6カテゴリスコアゲージ
    │   ├── CandidateSummaryCard.tsx      # AIサマリー + 推奨
    │   ├── InconsistencyAlert.tsx        # 履歴書 ↔ GitHub 不一致フラグ
    │   ├── InterviewQuestionsList.tsx    # 面接質問リスト
    │   └── GithubProfileBlock.tsx        # GitHub生シグナル
    ├── hooks/
    │   ├── useCandidateAnalysis.ts       # React Query mutation
    │   └── useCandidateLocale.ts         # uz/ja/en 切り替え
    ├── pages/
    │   └── CandidateAnalysisPage.tsx     # /hr/candidates
    ├── types.ts                          # スキーマミラー
    └── i18n/
        ├── uz.json
        ├── ja.json
        └── en.json
```

---

## 4. APIコントラクト

### 4.1 エンドポイント

```
POST /v1/hr/candidates/analyze
Content-Type: multipart/form-data
Authorization: Bearer <jwt>
X-Tenant-Id: <tenant_uuid>
Accept-Language: uz | ja | en   （デフォルト: uz）
```

### 4.2 リクエストボディ（multipart）

| フィールド | 型 | 必須 | 制約 |
|---|---|---|---|
| `github_input` | string | はい | ユーザー名（`octocat`）またはURL（`https://github.com/octocat`） |
| `cv_file` | file | はい | PDF または DOCX、≤ 5 MB |
| `job_description` | string | いいえ | ≤ 5,000文字（プレーンテキスト） |
| `locale` | string | いいえ | `uz` \| `ja` \| `en`、デフォルト `uz` |
| `analysis_depth` | string | いいえ | `fast`（Haikuスコアリング）\| `deep`（Sonnetスコアリング）、デフォルト `deep` |

### 4.3 成功レスポンス — `200 OK`

```json
{
  "request_id": "01JS9XK4ZE3R5NQ2H7P8M6V1WQ",
  "status": "ok",
  "duration_ms": 18432,
  "locale": "ja",
  "result": {
    "overall_score": 78,
    "grade": "B+",
    "category_scores": {
      "tech_depth": 82,
      "project_quality": 74,
      "activity": 70,
      "communication_docs": 68,
      "cv_github_consistency": 90,
      "role_fit": 76
    },
    "strengths": ["..."],
    "weaknesses": ["..."],
    "inconsistency_flags": [],
    "summary": "候補者は4年間のバックエンド経験を持ち...",
    "interview_questions": [
      {
        "category": "tech_depth",
        "question": "リポジトリXの並行処理問題をどのように解決しましたか？",
        "expected_signal": "..."
      }
    ],
    "hiring_recommendation": {
      "decision": "interview",
      "confidence": 0.78,
      "rationale": "..."
    },
    "raw_signals": { "github": {}, "cv": {} }
  }
}
```

### 4.4 エラーレスポンス

| ステータス | コード | 原因 |
|---|---|---|
| 400 | `INVALID_GITHUB_INPUT` | ユーザー名/URLが無効 |
| 400 | `CV_PARSE_FAILED` | PDF/DOCXを読み取れない |
| 400 | `CV_TOO_LARGE` | 5MBを超過 |
| 400 | `UNSUPPORTED_FILE_TYPE` | PDFまたはDOCX以外 |
| 401 | `UNAUTHENTICATED` | JWTが欠落または無効 |
| 403 | `FORBIDDEN_ROLE` | ユーザーロールがHR/マネージャー/管理者ではない |
| 404 | `GITHUB_USER_NOT_FOUND` | GitHubユーザーが存在しない |
| 429 | `RATE_LIMITED` | プランの制限に達した |
| 504 | `TIMEOUT` | 30秒の全体ハードタイムアウト超過 |

---

## 5. JSONスキーマ

### 5.1 `CandidateAnalysisPayload`

```jsonc
{
  "overall_score": 0-100,
  "grade": "A+" | "A" | "B+" | "B" | "C+" | "C" | "D" | "F",
  "category_scores": {
    "tech_depth": 0-100,
    "project_quality": 0-100,
    "activity": 0-100,
    "communication_docs": 0-100,
    "cv_github_consistency": 0-100,
    "role_fit": 0-100
  },
  "strengths": ["string"],           // 最大8件
  "weaknesses": ["string"],          // 最大8件
  "inconsistency_flags": [
    {
      "type": "stack_mismatch" | "experience_gap" | "title_inflation" | "education_unverified" | "other",
      "severity": "low" | "medium" | "high",
      "explanation": "string"
    }
  ],
  "summary": "string",               // 最大1500文字
  "interview_questions": [           // 5-12件
    {
      "category": "tech_depth" | "project_quality" | "activity" | "communication_docs" | "consistency" | "role_fit" | "behavioral",
      "question": "string",
      "expected_signal": "string"
    }
  ],
  "hiring_recommendation": {
    "decision": "strong_hire" | "interview" | "borderline" | "do_not_proceed",
    "confidence": 0.0-1.0,
    "rationale": "string"
  }
}
```

---

## 6. バックエンド実装計画

### 6.1 ツール1 — `github_analyzer.ts`

```
入力:  { input: string }     // ユーザー名またはURL
出力: RawSignals.github

手順:
  1. 入力を正規化 → ユーザー名（regex）
  2. fetch /users/:username → プロフィールコア
  3. fetch /users/:username/repos?per_page=100 → repos[]
  4. 集計値計算: primary_languages, total_stars, repo_signals, forkレシオ
  5. ピン留めリポジトリ: GraphQL または星数トップ6（RESTフォールバック）
  6. ピン留めリポジトリの品質スコア:
        +20 README, +20 テスト, +15 CI, +15 最終コミット < 6ヶ月,
        +15 星数 > 5, +15 説明 > 30文字
  7. { ...signals, fetch_status } を返す

レート制限: GitHub 匿名 = 60リクエスト/時.
キャッシュ: TTL 10分、キー = username.
```

### 6.2 ツール2 — `cv-parser.ts`

```
入力:  { file: Uint8Array, mime: string }
出力: RawSignals.cv

手順:
  1. PDF       → pdfjs-dist テキスト抽出
     DOCX      → mammoth.js テキスト抽出
     その他    → UNSUPPORTED_FILE_TYPE をスロー
  2. テキスト正規化（空白、unicode NFKC）
  3. ヒューリスティックregex抽出: 日付範囲、セクションヘッダー
  4. Claude Haikuポスト処理（~500トークン）:
        入力:  生テキスト
        出力: 構造化JSON（役職、学歴、スキル） — Zod検証済み
  5. 役職期間から experience_years_total を計算
  6. { ...cv, parse_status } を返す

注記:
  - 2列PDFは文字がずれる可能性あり — < 200文字の場合はparse_status = "partial"でフラグ
  - 非ラテン文字（キリル、日本語）— pdfjsが処理、UTF-8を検証
```

### 6.3 ツール3 — `candidate-scorer.ts`

> 現行実装はprovider-independent rubric、bounded weighted overall/grade、completeかつ比較可能なGitHub evidenceだけに基づくconservative UZ/JA/EN flagsを提供する。Injectable Sonnet/Haiku stageはmodel/budget/cache policy、private sanitized-CV seam、minimized prompt、account-before-validation、strict validationを統合し、tenant/request server compositionがkeyとatomic accounting closureをinject、application boundaryがquota lifecycleとtyped HTTP mappingを所有、deterministic finalizeが再計算したoverall/gradeとlocal flagsを保持する。Global deadline、live smokeが残る。

```
モデル:  Claude Sonnet 4（深層）または Haiku（高速）
モード:  構造化出力（JSONモード）

スコアリングルーブリック:
  tech_depth:           +30 言語マッチ, +25 ピン品質, +20 星数/リポジトリ, +15 多言語対応, +10 モダンスタック
  project_quality:      +35 README%, +30 テスト%, +20 CI%, +15 星数分布
  activity:             +40 アクティブ月数, +30 コミット/年, +30 アカウント年齢
  communication_docs:   +50 READMEの質, +30 コミットメッセージ, +20 PR説明
  cv_github_consistency: +50 スタック重複, +30 タイムライン一致, +20 誇張なし
  role_fit:             Sonnetセマンティックマッチ（job_description必須）

不一致検出:
  stack_mismatch:    履歴書に「Senior Go」とあるがGitHubのGo% < 5
  experience_gap:    履歴書で5年とあるがGitHubの年齢 < 2年
  title_inflation:   履歴書に「Senior」とあるがリーダーシップシグナルなし
```

### 6.4 ツール4 — `report-generator.ts`

> 現行実装はbounded UZ/JA/EN evidence-linked strengths/gaps/summary、全non-null categoryとbehavioral evidenceを覆う6–7問、deterministic recommendationを提供する。Sonnet narrative refinementはkey-dependentな次層として残る。

```
モデル:  Claude Sonnet 4
モード:  構造化JSON出力

入力:  スコア + シグナル + jobDescription? + locale
出力: { strengths, weaknesses, summary, interview_questions, hiring_recommendation }

面接質問ルール:
  - 5〜12問
  - 各カテゴリ最低1問（6カテゴリ + 行動評価）
  - 各問は特定のリポジトリ/履歴書エントリに紐づける
  - クローズドな（はい/いいえ）質問は不可

採用推奨ロジック:
  overall_score >= 85  → strong_hire
  70 <= score < 85     → interview
  55 <= score < 70     → borderline
  score < 55           → do_not_proceed
  高severity不一致     → 1ランク降格
```

### 6.5 コストとレイテンシバジェット（1分析あたり）

| ステージ | 入力トークン | 出力トークン | モデル | コスト（USD） |
|---|---|---|---|---|
| 履歴書パース Haiku | ~2,000 | ~600 | Haiku 3.5 | $0.0040 |
| 候補者スコアリング（深層） | ~3,500 | ~800 | Sonnet 4 | $0.0225 |
| レポート生成 | ~3,000 | ~1,500 | Sonnet 4 | $0.0315 |
| **合計** | | | | **~$0.058** |

---

## 7. MVPスケーリング戦略

### 7.1 基本原則

1. **ステートレス** — 各リクエストは独立
2. **冪等性** — 同じGitHub + 履歴書ハッシュ → キャッシュヒット（TTL 10分）
3. **グレースフルデグラデーション** — GitHubが失敗しても履歴書のみで継続
4. **個人情報非永続化** — 履歴書はメモリのみ、パース後に削除
5. **モジュラー** — 各ツールは独自ファイル、テスト、モニタリングメトリクス

### 7.2 パフォーマンスバジェット

| メトリクス | 目標 | アクションポイント |
|---|---|---|
| p50 所要時間 | < 18秒 | OK |
| p95 所要時間 | < 28秒 | アラート |
| エラー率 | < 2% | オンコール呼び出し |
| GitHub 404率 | < 5% | UXヒント「ユーザー名を確認」 |
| 履歴書パース失敗率 | < 8% | パーサー改善、エラーUI表示 |

### 7.3 並行性とレート制限

| プラン | 同時接続 | 1分あたり | 1日あたり |
|---|---|---|---|
| 無料 | 1 | 1 | 2 |
| 起業家 | 2 | 5 | 20 |
| ビジネス | 5 | 20 | 100 |
| 企業 | 10 | 60 | 500 |

実装: service-role-only PostgreSQL RPCがtenant state rowをlockし、minute/day counterと45秒concurrency leaseをatomicにreserveする。Pure lifecycle boundaryはdenial時にoperationを開始せず、accepted leaseをsuccess/error後に`finally`でreleaseする。Cleanup failureは元のoutcomeを置換せず、bounded DB expiryがorphan leaseを解消する。Private tableはbrowserとdirect service-table accessを拒否し、DBの`free/starter/pro/company` planをこのpolicyへmapする。

---

## 8. エラー処理

### 8.1 ツールレベルの処理

| ツール | エラー種別 | フォールバック |
|---|---|---|
| github_analyzer | 404 | `INVALID_GITHUB_INPUT` |
| github_analyzer | 5xx / タイムアウト | 部分シグナル、`degraded` |
| cv_parser | 破損PDF | `CV_PARSE_FAILED` |
| cv_parser | スキャン済みPDF（画像のみ） | `CV_PARSE_FAILED` + ヒント |
| candidate_scorer | Claude 5xx | 3xバックオフ、`INTERNAL` |
| report_generator | Claude 5xx | スコア返却、`report_status: "failed"` |

### 8.2 フロントエンドUX

- 504タイムアウト → 「分析が30秒を超えました。短い履歴書で再試行するか、サポートにお問い合わせください。」
- Degraded → 青バナー：「GitHubデータが部分的にしか取得できませんでした — 結果が不完全な場合があります」
- 高不一致 → 黄バナー：「警告：重大な不一致が検出されました」

---

## 9. V2ロードマップ

| # | 機能 | 工数 |
|---|---|---|
| V2.1 | **GitHub OAuth** — プライベートリポジトリ + コントリビューショングラフ | M |
| V2.2 | **永続化**（`candidates`テーブル） | M |
| V2.3 | **一括インポート**（NユーザーのCSV） | L |
| V2.4 | **LinkedInパーサー**（PDFエクスポート） | M |
| V2.5 | **スキャン済み履歴書のOCR** | L |
| V2.6 | **カレンダー/ATS統合**（Google Calendar、Greenhouse） | L |
| V2.7 | **非同期ジョブキュー**（job_idポーリング） | M |
| V2.8 | **カスタムルーブリック**（テナントごと） | M |
| V2.9 | **事前スクリーニングTelegramボット** | S |
| V2.10 | **バイアス監査ダッシュボード** | XL |
| V2.11 | **ビデオ履歴書 / 非同期面接** | XL |
| V2.12 | **比較ランキング**（5人以上の候補者を並べて比較） | M |

工数: S（1-3日）、M（1週間）、L（2週間）、XL（1ヶ月以上）。

---

## 10. 用語集

| UZ | JP | EN | 意味 |
|---|---|---|---|
| Nomzod | 候補者 | Candidate | 履歴書を提出した人 |
| Skor | スコア | Score | 0〜100の数値 |
| Mos kelmaslik | 不一致 | Inconsistency | 履歴書とGitHub間の乖離 |
| Yollash tavsiyasi | 採用推奨 | Hiring recommendation | strong_hire / interview / borderline / do_not_proceed |
| Stack mosligi | スタック整合性 | Stack consistency | 履歴書スキル ↔ GitHub言語の重複 |
| Faollik | 活動レベル | Activity | コミット数とアクティブ月数 |

---

## 11. テスト戦略

### 11.1 ユニットテスト

- `github-analyzer.test.ts` — フィクスチャ: octocat、torvalds、ジュニアアカウント、削除済みユーザー
- `cv-parser.test.ts` — フィクスチャ: 5つのPDF（クリーン、2列、スキャン失敗、キリル、日本語）、3つのDOCX
- `candidate-scorer.test.ts` — Claudeモック、決定論的スコアリング入力

### 11.2 統合テスト

- フルフロー: 実際のGitHub（octocat）+ サンプル履歴書 → `status === 'ok'`、`overall_score` が [0, 100] の整数であることを確認
- タイムアウト: GitHubの7秒遅延をシミュレート → `status === 'degraded'` を確認
- 不良履歴書: 破損PDF → 400 `CV_PARSE_FAILED` を確認

### 11.3 受け入れテスト（手動）

実際の候補者10人 → HRが評価 → AIスコアとの相関 > 0.7

---

## 12. 実装チェックリスト（次のセッション）

### バックエンドエージェント
- [ ] `services/hr-candidate/` フォルダを作成
- [ ] GitHubフェッチ + キャッシュ配線
- [ ] 履歴書パーサー — pdfjs + mammoth統合
- [ ] Sonnet構造化出力（LLM Routerを通じて）
- [ ] Zodスキーマ + JSONスキーマ同期
- [ ] ユニット + 統合テスト

### フロントエンドエージェント
- [ ] `features/hr/candidates/` スケルトン
- [ ] アップロードフォーム + ドラッグ&ドロップ + 5MB検証
- [ ] React Queryミューテーション + ロケール切り替え
- [ ] スコアゲージコンポーネント（Radix UI Progress）
- [ ] i18n（uz.json / ja.json / en.json）

### データベースエージェント
- [ ] **何もしない**（MVP — 永続化なし）
- [ ] V2.2: `candidates` マイグレーションを準備

### インフラエージェント
- [ ] AnthropicのAPIキーをSupabaseシークレットに追加
- [ ] Sentryタグ: `module: hr_candidate`
- [ ] レート制限ミドルウェア設定

---

## 13. 未解決の質問

1. **GitHub APIクォータ** — 匿名60回/時。MVPにOAuthが必要か？Sherの判断。
2. **日本語の履歴書フォーマット** — 履歴書（PDF）— テーブルが多く別途パーサーが必要かもしれない。別チケット？
3. **バイアスガードレール** — 名前/年齢/性別データがスコアリングに影響してはならない。プロンプトに明示的なガードが必要か？
4. **ストレージ** — 後でどこに履歴書を保存するか（V2.2）？暗号化ありのSupabase Storage？
5. **レート制限** — 無料プラン: 2回/日、それとも0回/日？（HR機能 — 有料のみ？）

---

*HR_CANDIDATE_ANALYSIS.md v1.0 — 設計のみ、コードはまだ*
*次のステップ: Sherが承認 → 4エージェント（frontend/backend/db/infra）での実装セッション*
