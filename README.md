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

- **推奨**: Docker Desktop + Dev Container（環境を統一）
- **または**: Node.js 22 LTS + npm 10+（[.nvmrc](./.nvmrc) 参照）

## セットアップ（Dev Container — 推奨）

Python の `venv` に相当する形で、Docker 内に開発環境を固定します。PC が変わっても同じ Node.js 版で動きます。

### 1. Docker Desktop の確認

```bash
docker --version
```

未インストールの場合は [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/) をインストールし、WSL 2 バックエンドを有効にしてください。

### 2. コンテナで開発開始

1. Cursor でこのプロジェクトを開く
2. コマンドパレット（`Ctrl+Shift+P`）→ **「Dev Containers: Reopen in Container」**
3. 初回はイメージ取得 + `npm install` が自動実行されます（数分）
4. コンテナ内ターミナルで:

```bash
npm run dev
```

ブラウザで http://localhost:5173 を開きます。

## セットアップ（ローカル — Docker なし）

Node.js 22 を [.nvmrc](./.nvmrc) に合わせてインストールしてください。

```bash
npm install
npm run dev
```

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
