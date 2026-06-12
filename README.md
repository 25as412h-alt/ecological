# 生態学フィールドノート

野外調査の電子野帳。地点・写真・出現種を記録し、地図上で振り返れます。

## 機能（MVP）

- 地図上に地点ピンを立てる（Leaflet + OpenStreetMap）
- 現在地の自動取得
- 観察記録の作成（種名・個体数・天気・写真など）
- 記録一覧・詳細表示
- iNaturalist による種名検索
- Wikipedia による種の詳細表示
- オフライン対応（PWA）

## 必要環境

- Node.js 20+ (LTS 推奨)
- npm 10+

## セットアップ

```bash
npm install
npm run dev
```

ブラウザで http://localhost:5173 を開きます。

## ビルド

```bash
npm run build
npm run preview
```

## デプロイ（Cloudflare Pages）

1. GitHub にリポジトリを push
2. Cloudflare Pages でリポジトリを接続
3. ビルドコマンド: `npm run build`
4. 出力ディレクトリ: `dist`

## 技術スタック

- React + TypeScript + Vite
- Tailwind CSS
- Leaflet + OpenStreetMap
- Dexie (IndexedDB)
- Zustand / Zod / Sonner

## ドキュメント

- [trajectory.md](./trajectory.md) — プロジェクト文脈（AI参照用）
- [ARCHITECTURE.md](./ARCHITECTURE.md) — 設計仕様
- [AGENTS.md](./AGENTS.md) — AI 作業ガイド

## ライセンス

MIT
