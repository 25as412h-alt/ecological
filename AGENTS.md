# AGENTS.md — AI 作業ガイド

## 最初に読むファイル

**必ず [trajectory.md](./trajectory.md) を最初に読んでください。**

プロジェクトの背景・確定方針・進捗・意思決定の経緯はすべて trajectory.md に集約されています。

## 作業ルール

1. コード変更前に `trajectory.md` と `ARCHITECTURE.md` を確認する
2. 重要な設計変更・タスク完了時に `trajectory.md` の進捗セクションを更新する
3. 変数名は `snake_case`、コメントは Why を日本語で書く
4. エラーは構造化ログ + sonner トーストで通知する
5. 計画ファイル（`.cursor/plans/`）は編集しない

## ディレクトリ

```
src/pages/       — 1ファイル = 1画面
src/components/  — UI コンポーネント（map/, record/, ui/）
src/db/          — Dexie スキーマと CRUD
src/api/         — 外部 API ラッパー
src/hooks/       — React フック
src/store/       — Zustand
src/lib/         — ユーティリティ
```
