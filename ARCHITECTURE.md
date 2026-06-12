# ARCHITECTURE.md — 設計仕様

## 概要

生態学フィールドノートは、ローカルファーストの Web PWA です。バックエンドサーバーは存在せず、すべてのデータはブラウザ内 IndexedDB に保存されます。

## アーキテクチャ

```
React UI (PWA)
  ├── Zustand (UI状態)
  ├── Dexie / IndexedDB (永続化)
  ├── Leaflet + OSM (地図)
  ├── navigator.geolocation (現在地)
  ├── iNaturalist API (種名検索)
  └── Wikipedia API (種詳細)
```

## ディレクトリ構成

```
src/
  pages/           MapPage, RecordFormPage, RecordDetailPage, RecordListPage
  components/
    map/           MapView, LocationPicker, CurrentLocationButton
    record/        PhotoPicker, SpeciesAutocomplete, WeatherField
    ui/            Button, Input, Card 等
  hooks/           useRecords, useSpeciesSearch, useGeolocation
  store/           recordStore.ts
  db/              schema.ts, records_repo.ts
  api/             inaturalist.ts, wikipedia.ts
  lib/             utils, image_utils, season_utils, logger
```

## データモデル

### records

| カラム | 型 | 説明 |
|--------|-----|------|
| id | string (UUID) | 主キー |
| created_at | ISO string | 作成日時 |
| observed_at | string (YYYY-MM-DD) | 観察日 |
| observed_time | string (HH:mm) | 観察時刻（自動） |
| lat, lng | number | 緯度・経度 |
| location_accuracy | number \| null | GPS精度(m) |
| species_name_ja | string | 和名 |
| species_name_sci | string | 学名 |
| inat_taxon_id | number \| null | iNaturalist ID |
| individual_count | number \| null | 個体数 |
| individual_state | string | 個体の状態 |
| taxon_group | 'plant' \| 'insect' \| 'mammal' | 分類群 |
| habitat_memo | string | 生息環境メモ |
| observer_name | string | 調査者名 |
| weather | string | 天気 |
| temperature | number \| null | 気温(℃) |
| season | string | 季節（自動判定） |

### photos

| カラム | 型 | 説明 |
|--------|-----|------|
| id | string | 主キー |
| record_id | string | 外部キー |
| blob | Blob | 原画像 |
| thumbnail_blob | Blob | サムネイル |
| created_at | ISO string | 作成日時 |

### settings

| カラム | 型 | 説明 |
|--------|-----|------|
| key | string | 設定キー |
| value | string | 設定値 |

## セキュリティ（MVP）

- データは端末内のみ。外部送信なし（API呼び出しは種名検索のみ）
- 入力は Zod で検証
- APIキーは使用しない

## エラー処理

- DB/API: try/catch → `log_error()` → sonner トースト
- React Error Boundary でクラッシュ捕捉

## ルーティング

| パス | ページ |
|------|--------|
| `/` | MapPage（ホーム） |
| `/records` | RecordListPage |
| `/records/new` | RecordFormPage（新規） |
| `/records/:id` | RecordDetailPage |
| `/records/:id/edit` | RecordFormPage（編集） |
