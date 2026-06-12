# trajectory.md — プロジェクト文脈・意思決定・進捗（AI参照用）

> **AIへの指示**: コード変更・設計判断の前に必ず本ファイルを読むこと。重要な決定・進捗更新は本ファイルへ追記すること。

最終更新: 2026-06-12

---

## 1. プロジェクト概要

- **名称**: 生態学フィールドノート（電子野帳）
- **目的**: 野外調査で地点・写真・出現種を記録し、地図上で振り返る個人ツール
- **対象生物**: 植物・昆虫・哺乳類
- **開発者**: 学生1名 / 経験浅め / 2ヶ月MVP
- **最終形**: PCブラウザ → スマホ（PWA / Web）

---

## 2. 確定した方針

| 項目 | 決定 |
|------|------|
| 形態 | Web PWA（デスクトップアプリは作らない） |
| データ保存 | **ローカルファースト**（IndexedDB / Dexie） |
| 認証・クラウド | MVPでは不要。フェーズ2で Supabase を検討 |
| 言語 | TypeScript のみ（Go/PHP/Python は使わない） |
| インフラ | Docker/Nix 不要。Node.js + Vite のみ |
| コスト | 無料・クレカ不要を優先 |
| 公開設定 | MVPは非公開（端末内のみ）。公開/非公開切替はフェーズ2 |
| UI | シンプル・研究者っぽい・機能重視 |

---

## 3. 技術スタックと選定理由

| 技術 | 採用理由 |
|------|----------|
| React + Vite + TS | 学習コスト低・スマホ展開しやすい |
| Tailwind + shadcn風UI | 研究者向けシンプルUIを素早く構築 |
| Zustand | 軽量な状態管理 |
| Dexie (IndexedDB) | オフライン・写真Blob保存・サーバー不要 |
| Leaflet + OpenStreetMap | **APIキー不要・完全無料** |
| iNaturalist API | 種名検索（キー不要・CORS対応） |
| Wikipedia REST API | 種の詳細（キー不要） |
| vite-plugin-pwa | スマホホーム画面追加・オフライン |

### 不採用にした選択肢

| 技術 | 不採用理由 |
|------|------------|
| Google Maps | クレカ登録必須 |
| Wails / Electron | スマホ移行で作り直し |
| Cloudflare D1 (MVP) | 認証・画像保存を自前実装が必要 |
| Supabase (MVP) | 学習量増。フェーズ2で導入 |

---

## 4. 意思決定ログ

| 日付 | 決定 | 理由 |
|------|------|------|
| 2026-06-12 | Web PWA + ローカルファースト | 無料・オフライン・スマホ移行容易 |
| 2026-06-12 | Leaflet + OSM | キー不要・無料 |
| 2026-06-12 | trajectory.md をルートに配置 | どのAIでも文脈復元可能にする |
| 2026-06-12 | MVP 実装完了 | 全画面・DB・API・PWA ビルド成功 |

---

## 5. 現在の進捗と TODO

- [x] プロジェクト初期化（Vite + React + TS）
- [x] trajectory.md / AGENTS.md / ARCHITECTURE.md / README.md
- [x] 地図（Leaflet + 現在地 + ピン）
- [x] IndexedDB スキーマ + CRUD
- [x] 記録フォーム（写真・Zod検証）
- [x] 一覧・詳細・地図ピン連携
- [x] iNaturalist + Wikipedia 連携
- [x] 全フィールド（天気・気温・個体数・季節自動判定等）
- [x] PWA + ビルド成功（Cloudflare Pages デプロイ準備完了）

---

## 6. データモデル要約

### records（観察記録）
`id`, `created_at`, `observed_at`, `observed_time`, `lat`, `lng`, `location_accuracy`, `species_name_ja`, `species_name_sci`, `inat_taxon_id`, `individual_count`, `individual_state`, `taxon_group`, `habitat_memo`, `observer_name`, `weather`, `temperature`, `season`

### photos
`id`, `record_id`, `blob`, `thumbnail_blob`, `created_at`（1記録1〜3枚）

### settings
`key`, `value`（例: `observer_name` 既定値）

---

## 7. 外部 API と制約

| API | 用途 | 制約 |
|-----|------|------|
| iNaturalist `/v1/taxa/autocomplete` | 種名検索 | 60 req/分以下・デバウンス300ms |
| Wikipedia REST `/page/summary/` | 種詳細 | レート制限に注意 |
| OSM タイル | 地図 | [利用ポリシー](https://operations.osmfoundation.org/policies/tiles/) 遵守 |

---

## 8. コーディング規約要点

- 変数名: **snake_case**
- コメント: **Why** を日本語で記述
- エラー: `console.error` に操作名・引数・原因を構造化出力
- DB/API: try/catch + sonner トースト
- ページ: `src/pages/` に1ファイル1画面

---

## 9. 既知の課題・フェーズ2

- 調査エリアのポリゴン描画（Leaflet.draw）
- Supabase 同期 + ログイン + 公開/非公開
- 写真 EXIF 位置自動補完
- CSV エクスポート

---

## 10. 関連ドキュメント

- [ARCHITECTURE.md](./ARCHITECTURE.md) — 確定設計仕様
- [AGENTS.md](./AGENTS.md) — AI 作業ガイド
- [README.md](./README.md) — 人間向けセットアップ
