# オフィス受付アプリ

オフィス入口の Android タブレット向け受付アプリと、Slack 通知 API です。来訪者が用件を選ぶと、担当者の Slack へすぐ通知されます。

```
Android 受付アプリ  →  Notification API  →  Slack
```

アプリから Slack へは直接接続しません。Webhook URL などの秘密情報は API 側だけが持ちます。

## できること

| 種別 | 来訪者の操作 | Slack のメンション |
|------|--------------|---------------------|
| 総合受付 | 会社名・氏名・人数を入力し、訪問先をプルダウンで選ぶ（一覧は API 管理） | 選んだ訪問先本人のみ |
| 面接・研修 | 面接/研修を選択し氏名を入力 | 設定した固定メンション |
| 配達員 | メニューを選ぶだけ | 設定した固定メンション |

共通の動き:

- WELCOME 画面をタップして開始
- 無操作 30 秒で WELCOME に戻る（入力中も対象。入力は破棄）
- 送信成功時のみ完了画面を表示し、5 秒後に WELCOME へ戻る
- 通信失敗時はエラー画面。再試行は入力を保持、最初の画面へ戻ることも可能
- 連打防止（送信中は操作無効、同一内容の成功後 10 秒は再送しない。失敗後の再試行は可）
- 通信タイムアウトは 10 秒。自動再試行はせず、失敗時は来訪者が再試行する

色・文言・接続先・秒数は次の 1 か所で変更できます。

- アプリ: `android/app/src/main/java/com/officereception/app/config/AppConfig.kt`
- API: `api/.env` と `api/destinations.json`

## 必要環境

- Node.js 20 以上
- JDK 17 以上
- Android Studio または Android SDK（APK ビルド用）
- Docker（任意。API をコンテナで起動する場合）
- Slack Incoming Webhook

## API の起動

### 1. 設定ファイルを用意する

Windows:

```bash
cd api
copy destinations.json.example destinations.json
copy .env.example .env
```

macOS / Linux:

```bash
cd api
cp destinations.json.example destinations.json
cp .env.example .env
```

`.env` で少なくとも次を設定します。

```
PORT=3000
DRY_RUN=true
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx/yyy/zzz
SLACK_MENTION_INTERVIEW=U012INTERVIEW
SLACK_MENTION_DELIVERY=U012DELIVERY
DESTINATIONS_PATH=./destinations.json
DUPLICATE_WINDOW_MS=10000
```

本番では `DRY_RUN=false` にし、`SLACK_WEBHOOK_URL` を必須にします。DRY RUN では Slack へ実送信しません。

`destinations.json` に訪問先を追加・変更すると、総合受付のプルダウン一覧がアプリ改修なしで変わります。アプリは起動時に `GET /destinations` で取得し、完了するまで操作できません（取得中画面を表示）。`slackUserId` は API 応答には含まれません。

```json
[
  { "id": "yamada", "displayName": "山田 太郎", "slackUserId": "U011YAMADA" }
]
```

Slack User ID はプロフィールの「メンバー ID をコピー」から取得できます。Incoming Webhook は Slack の Incoming Webhooks アプリで発行します。

`.env` と `destinations.json` は Git 管理外です。設定例だけを共有しています。

### 2. テスト

```bash
cd api
npm ci
npm test
```

### 3. ローカル起動

```bash
cd api
npm ci
npm run build
npm start
```

開発時は `npm run dev` でも起動できます。死活監視は `GET http://localhost:3000/health` です。

### 4. Docker で起動

リポジトリのルートで:

```bash
docker compose up --build
```

初期状態は `DRY_RUN=true` で、イメージ内のサンプル訪問先を使います。実運用では `api/destinations.json` を用意し、Webhook とメンション先を環境変数で渡してください。

```bash
docker compose up --build -e DRY_RUN=false -e SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx/yyy/zzz
```

訪問先ファイルを使う場合は、`docker-compose.yml` に次を追加します。

```yaml
volumes:
  - ./api/destinations.json:/app/destinations.json:ro
```

## API 仕様

- `GET /health` → `{ "status": "ok" }`
- `GET /destinations` → `{ "destinations": [{ "id", "displayName" }] }`
- `POST /notify`

総合受付:

```json
{
  "type": "general",
  "companyName": "株式会社テスト",
  "visitorName": "来訪太郎",
  "partySize": 2,
  "destinationId": "yamada"
}
```

面接・研修（`purpose` は `interview` または `training`）:

```json
{ "type": "interview", "purpose": "interview", "visitorName": "候補者" }
```

```json
{ "type": "interview", "purpose": "training", "visitorName": "受講者" }
```

配達員:

```json
{ "type": "delivery" }
```

不正な必須欠落・型・人数（1〜99 の整数以外）・未登録の訪問先 ID は `400` です。直近で成功した同一内容は `409` です。Slack 本文とメンション先はサーバーだけが生成し、アプリからは指定できません。

ログは日時・受付種別・訪問先 ID・成否のみです。氏名や会社名は出しません。

## Android アプリのビルド

1. Android SDK を入れ、`android/local.properties.example` を `android/local.properties` にコピーします。
2. `sdk.dir` を SDK のパスにします（例: `C:\\Users\\you\\AppData\\Local\\Android\\Sdk`）。
3. `API_BASE_URL` をタブレットから届く API の URL にします。
   - エミュレータ: `http://10.0.2.2:3000/`
   - 実機: `http://192.168.x.x:3000/`（PC の LAN IP）
4. ビルドします。

```bash
cd android
gradlew.bat assembleDebug
```

macOS / Linux では `./gradlew assembleDebug` です。

APK は `android/app/build/outputs/apk/debug/app-debug.apk` です。タブレットにインストールし、同じネットワークの API を向き先にしてください。

アプリ側の単体テスト:

```bash
cd android
gradlew.bat testDebugUnitTest
```

将来のキオスク固定（他アプリへ移動させない）は `ImmersiveKioskPolicy` に lock task を足す想定です。画面は全画面表示です。

## 運用メモ

- 訪問先の追加・変更は `destinations.json` の編集だけで行えます。一覧 API は毎回ファイルを読みます。
- 面接・研修と配達のメンション先は `.env` の `SLACK_MENTION_INTERVIEW` / `SLACK_MENTION_DELIVERY` です。カンマ区切りで複数指定できます。
- 無操作 30 秒、完了表示 5 秒、通信タイムアウト 10 秒は `AppConfig`、重複防止 10 秒は `AppConfig` と `DUPLICATE_WINDOW_MS` で変更します。
