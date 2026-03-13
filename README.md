# KururiDevBrowser

Web開発者向けのレスポンシブプレビュー特化ブラウザ。URLを入力するだけで複数のデバイスサイズを同時プレビューでき、スクリーンショットの一括保存も可能なElectronアプリです。

---

## 機能

- **マルチデバイスプレビュー** — URLを入力すると最大6デバイスを同時表示
- **デバイス切り替え** — iPhone / iPad / Laptop / Desktop などのプリセットから選択
- **ズームコントロール** — 各ビューポートの表示倍率を自由に調整
- **スクリーンショット一括保存** — 全ビューポートをJPEGで保存（ファイル名にデバイス名・解像度・日時を含む）
- **QRコード表示** — 現在のURLをQRコードで確認（モバイル実機確認に便利）

## 対応デバイスプリセット

| デバイス | 幅 | 高さ |
|---------|---:|---:|
| iPhone SE | 375px | 667px |
| iPhone 14 Pro | 393px | 852px |
| iPad | 768px | 1,024px |
| iPad Pro 12.9 | 1,024px | 1,366px |
| Laptop | 1,440px | 900px |
| Desktop | 1,920px | 1,080px |

---

## 技術スタック

| 役割 | 技術 |
|-----|------|
| フレームワーク | Electron 29 |
| UI | React 18 + TypeScript |
| ビルドツール | electron-vite + Vite 5 |
| パッケージ管理 | pnpm |
| スタイル | Tailwind CSS 3 |
| スクリーンショット | `webview.capturePage()` |

---

## 開発環境のセットアップ

### 前提条件

- Node.js 18以上
- pnpm（`npm install -g pnpm` でインストール）

### 手順

```bash
# 1. リポジトリをクローン
git clone <repository-url>
cd kururi-dev-browser

# 2. 依存関係をインストール
pnpm install

# 3. 開発サーバー起動
pnpm run dev
```

> **注意（pnpm v10以降）**: インストールに失敗する場合は `pnpm install --force` を試してください。

---

## ビルド方法

### ソースをビルドする（配布前の出力生成）

```bash
pnpm run build
```

`out/` ディレクトリにmain / preload / rendererの成果物が生成されます。

### インストーラーをパッケージ化する（配布用）

```bash
pnpm run dist
```

`release/` ディレクトリに以下が生成されます：

| プラットフォーム | 出力形式 |
|---------------|---------|
| macOS | `.dmg` |

---

## 自分の端末にインストールする

### macOS

1. `pnpm run build && pnpm run dist` を実行
2. `release/` フォルダ内の `KururiDevBrowser-*.dmg` を開く
3. アプリを `/Applications` フォルダにドラッグ＆ドロップ
4. 初回起動時に「開発元を確認できない」と表示される場合：
   - **システム設定 → プライバシーとセキュリティ** で「このまま開く」を選択

---

## プロジェクト構成

```
src/
├── main/
│   ├── index.ts            # アプリ起動・ウィンドウ生成
│   ├── ipc-handlers.ts     # IPC通信ハンドラ
│   └── screenshot.ts       # スクリーンショット保存ロジック
├── renderer/
│   ├── App.tsx
│   ├── components/
│   │   ├── URLBar.tsx           # URL入力・ナビゲーション
│   │   ├── ViewportContainer.tsx # ビューポート一覧
│   │   ├── ViewportPanel.tsx     # 個別ビューポート
│   │   ├── DeviceSelector.tsx    # デバイス選択UI
│   │   └── Toolbar.tsx          # スクリーンショット等のコントロール
│   ├── hooks/
│   │   └── useViewports.ts      # ビューポート状態管理
│   ├── types/
│   │   └── device.ts            # デバイスプリセット型定義
│   └── presets.ts               # デバイスプリセットデータ
└── preload/
    └── index.ts            # webview preload（contextBridge）
```

---

## スクリーンショットのファイル名規則

```
{ホスト名}_{デバイス名}_{幅}x{高さ}_{日時}.jpg

例: example.com_iPhone-SE_375x667_20260313-153000.jpg
```

---

## npm スクリプト一覧

| コマンド | 内容 |
|---------|------|
| `pnpm run dev` | 開発サーバー起動（ホットリロード対応） |
| `pnpm run build` | プロダクションビルド（`out/` に出力） |
| `pnpm run preview` | ビルド済みアプリをプレビュー |
| `pnpm run dist` | インストーラー生成（`release/` に出力） |
