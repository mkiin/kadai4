# Chrome DevTools MCP エラーレポート

## 日時
2025-10-05

## 環境
- OS: Linux (WSL2)
- WSLバージョン: 5.15.153.1-microsoft-standard-WSL2
- 作業ディレクトリ: `/home/yaruha/project-dev/web-app/jisou-app/kadai4`
- Chrome実行ファイル: `/mnt/c/Program Files/Google/Chrome/Application/chrome.exe` (Windows側)

## 目的
Chrome DevTools MCPを使用して https://developers.chrome.com のパフォーマンス測定を実施する

## 試行した設定の変遷

### 1. 初期設定（失敗）
```json
"chrome-devtools": {
  "command": "npx",
  "args": [
    "chrome-devtools-mcp@latest",
    "--channel=canary",
    "--headless=true",
    "--isolated=true"
  ]
}
```
**エラー**: `Could not find Google Chrome executable for channel 'canary' at '/opt/google/chrome-canary/chrome'.`

### 2. channelオプション削除（失敗）
```json
"chrome-devtools": {
  "command": "npx",
  "args": [
    "chrome-devtools-mcp@latest",
    "--headless=true",
    "--isolated=true"
  ]
}
```
**エラー**: `Could not find Google Chrome executable for channel 'stable' at '/opt/google/chrome/chrome'.`

### 3. Windows側Chromeパス指定（誤ったオプション名、失敗）
```json
"chrome-devtools": {
  "command": "npx",
  "args": [
    "chrome-devtools-mcp@latest",
    "--chrome-path=/mnt/c/Program Files/Google/Chrome/Application/chrome.exe",
    "--headless=true",
    "--isolated=true"
  ]
}
```
**エラー**: `Could not find Google Chrome executable for channel 'stable' at '/opt/google/chrome/chrome'.`
**原因**: オプション名が誤っていた（`--chrome-path`ではなく`--executablePath`が正しい）

### 4. 正しいオプション名で指定（プロトコルエラー発生）
```json
"chrome-devtools": {
  "command": "npx",
  "args": [
    "chrome-devtools-mcp@latest",
    "--executablePath=/mnt/c/Program Files/Google/Chrome/Application/chrome.exe",
    "--headless=true",
    "--isolated=true"
  ]
}
```
**エラー**: `Protocol error (Target.setDiscoverTargets): Target closed`
**発生箇所**: `mcp__chrome-devtools__new_page` および `mcp__chrome-devtools__list_pages`

### 5. headlessオプション削除（現在の設定、依然として失敗）
```json
"chrome-devtools": {
  "command": "npx",
  "args": [
    "chrome-devtools-mcp@latest",
    "--executablePath=/mnt/c/Program Files/Google/Chrome/Application/chrome.exe",
    "--isolated=true"
  ]
}
```
**エラー**: `Protocol error (Target.setDiscoverTargets): Target closed`

## 現在のエラー詳細

### エラーメッセージ
```
Protocol error (Target.setDiscoverTargets): Target closed
```

### 発生するツール呼び出し
- `mcp__chrome-devtools__new_page`
- `mcp__chrome-devtools__list_pages`

### 推測される原因
WSL2環境からWindows側のChrome実行ファイルを直接起動する際に、プロセス間通信やプロトコルの初期化に問題が発生している可能性がある。

## 提案された解決策

### リモートデバッグモードでの接続
Windows側で事前にChromeをリモートデバッグモードで起動し、WSL側からそのインスタンスに接続する方法：

1. WindowsのコマンドプロンプトまたはPowerShellで実行：
```cmd
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222
```

2. `.mcp.json`を以下のように変更：
```json
"chrome-devtools": {
  "command": "npx",
  "args": [
    "chrome-devtools-mcp@latest",
    "--browserUrl=http://127.0.0.1:9222"
  ]
}
```

### その他の代替案
1. **WSL内にChromiumをインストール**：
   ```bash
   sudo apt update && sudo apt install -y chromium-browser
   ```
   その後、`--executablePath`を削除してデフォルト設定を使用

2. **X11フォワーディングを設定**してWSL内でGUIアプリケーションを動作させる

## 次のアクション
リモートデバッグモードでの接続方法を試行予定
