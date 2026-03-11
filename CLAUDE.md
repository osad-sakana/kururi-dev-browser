# KururiDevBrowser

Web開発者向けのレスポンシブプレビュー特化ブラウザ。URLを入力すると複数デバイスサイズで同時表示し、スクロール同期・スクリーンショット保存が可能なElectronアプリ。

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| フレームワーク | Electron |
| UI | React + TypeScript |
| ビルド | Vite + electron-builder |
| パッケージマネージャー | pnpm |
| スタイル | Tailwind CSS |
| スクリーンショット | `webview.capturePage()` |

## プロジェクト構成

```
src/
├── main/                    # Electron Main Process
│   ├── index.ts             # アプリ起動、ウィンドウ生成
│   ├── ipc-handlers.ts      # IPC通信ハンドラ
│   └── screenshot.ts        # スクリーンショット保存ロジック
├── renderer/                # React UI
│   ├── App.tsx
│   ├── components/
│   │   ├── URLBar.tsx       # URL入力 + ナビゲーション
│   │   ├── ViewportContainer.tsx  # ビューポート一覧
│   │   ├── ViewportPanel.tsx      # 個別ビューポート
│   │   ├── DeviceSelector.tsx     # デバイス選択UI
│   │   └── Toolbar.tsx            # スクロール同期/SS等のコントロール
│   ├── hooks/
│   │   ├── useScrollSync.ts       # スクロール同期ロジック
│   │   └── useViewports.ts        # ビューポート状態管理
│   ├── types/
│   │   └── device.ts              # デバイスプリセット型定義
│   └── presets.ts                 # デバイスプリセットデータ
└── preload/
    └── index.ts             # webview preload（スクロール検知）
```

## アーキテクチャ

- **Main Process**: ウィンドウ管理、スクリーンショット保存、デバイスプリセット管理
- **Renderer Process (React)**: URLバー、ViewportContainer、各webview
- **IPC通信**: RendererとMain間でスクロール位置・スクリーンショット指示をやり取り

## デバイスプリセット

| デバイス名 | 幅 | 高さ |
|-----------|-----|------|
| iPhone SE | 375 | 667 |
| iPhone 14 Pro | 393 | 852 |
| iPad | 768 | 1024 |
| iPad Pro 12.9 | 1024 | 1366 |
| Laptop | 1440 | 900 |
| Desktop | 1920 | 1080 |

## 実装フェーズ

- **Phase 1**: Electron + React + Vite + TypeScript基盤、URLバー
- **Phase 2**: webviewによるマルチビューポート表示、デバイス選択
- **Phase 3**: preloadスクリプトでのスクロール同期（割合ベース）
- **Phase 4**: スクリーンショット保存（一括対応）
- **Phase 5**: UIの仕上げ、エラーハンドリング、macOSビルド確認

## 開発規約

- **パッケージマネージャー**: 必ず `pnpm` を使用すること（npm/yarn は使用禁止）
- **git commit**: 作業ごとに細かくコミットすること（まとめてコミットしない）

## 重要な技術的注意点

- **webviewセキュリティ**: `webpreferences="contextIsolation=true"` を必ず設定。preloadは最小限に
- **スクロール同期の無限ループ防止**: スクロール発火元を識別するフラグを持ち、プログラム的スクロールでは再発火しないようにする
- **スクロール位置**: ピクセルではなく**割合（%）ベース**で同期（ビューポートごとにページ高さが異なるため）
- **User-Agent**: 各webviewにデバイスに応じたUA文字列を設定し、モバイル版ページを正しく取得する
- **パフォーマンス**: v0.1では最大6ビューポートを上限とする

## スクリーンショットファイル名規則

`{URL_host}_{デバイス名}_{幅}x{高さ}_{日時}.jpg`
