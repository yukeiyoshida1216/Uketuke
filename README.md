# 受付キオスク

来客がタブレットで受付し、サーバーが Slack へ通知するアプリです。画面は総合受付、面接・研修、その他（配達）の3種類です。

## 画面

1. **WELCOME** — 画面をタッチすると受付メニューへ進みます。
2. **総合受付** — 会社名・氏名を入力し、来社人数（1人、2人、3人、4人以上）と、その下の担当者名を選びます。未入力では送信できません。前後の空白は除きます。戻ると入力は残ります。
3. **面接・研修** — 面接か研修を選び、氏名を入力して通知します。
4. **その他** — メニューを選ぶだけで配達として通知します。
5. 送信に成功したときだけ「受付ありがとうございます！」を表示し、しばらくすると WELCOME に戻ります。
6. 通信に失敗したときは完了画面を出さず、「再試行」と「最初の画面へ戻る」を出します。再試行は入力を保持したまま同じ内容を送ります。
7. 操作がないと WELCOME に戻り、入力は捨てます。アプリを開き直したときも WELCOME から始まります。

## 構成

- 画面と API は Next.js の1つのアプリです。
- 色、文言、秒数、入力上限は `src/config/reception.ts` だけを変更します。
- 訪問先の追加・変更は `config/destinations.json` です。画面の改修は不要です。
- Slack トークンと Slack User ID は環境変数です。Git には入れません。
- タブレット用 APK は、このサーバーの URL を全画面で開くキオスクシェルです。

## 必要なもの

- Node.js 22
- 本番相当の起動には Docker
- APK を作るときだけ JDK 17 以上と Android SDK（compileSdk 35）

## 設定

```bash
cp .env.example .env
```

| 変数 | 意味 |
| --- | --- |
| `DRY_RUN` | `true` のあいだは Slack に投稿しません。本番だけ `false` にします。 |
| `SLACK_BOT_TOKEN` | Bot トークン。`chat:write` が必要です。 |
| `SLACK_CHANNEL_ID` | 通知先チャンネル ID |
| `SLACK_USER_IDS` | 訪問先 ID から Slack User ID への JSON。画面の API には返しません。 |
| `INTERVIEW_MENTION_IDS` | 面接・研修のメンション。`nosaka` `yanase` `ito` の三択 |
| `DELIVERY_MENTION_IDS` | その他（配達）のメンション。同じ三択 |
| `DESTINATIONS_FILE` | 訪問先一覧の JSON |
| `PORT` | 待受ポート。標準は 8787 |

メンションの対応は次のとおりです。

| ID | 名前 |
| --- | --- |
| `nosaka` | 野坂 星司 |
| `yanase` | 梁瀬 星太 |
| `ito` | 伊藤 功 |

総合受付は、選ばれた訪問先本人だけをメンションします。面接・研修とその他（配達）は、上の設定に書いた人へメンションします。Slack の本文はサーバーが作ります。画面から本文やメンション先は指定できません。

担当者を足すときは、アプリを改修せずに次の2つを更新します。

```json
{ "id": "suzuki", "name": "鈴木 葵" }
```

```bash
SLACK_USER_IDS={"nosaka":"U0123456789","yanase":"U1234567890","ito":"U2345678901","suzuki":"U3456789012"}
```

`config/destinations.json` はリクエストのたびに読みます。コンテナの再起動は不要です。環境変数を変えたときは再起動します。面接・研修と配達のメンションに使う人は、訪問先一覧にも同じ ID で載せてください。

## 開発

```bash
npm ci
npm test
npm run dev
```

ブラウザで http://127.0.0.1:8787 を開きます。`DRY_RUN` 未設定時は Slack に送りません。

## テスト

```bash
npm test
```

確認していることは次のとおりです。

- 3種類の受付が、種別どおりのメンションで Slack 本文になる
- 必須漏れ、人数の型と範囲、未登録の訪問先は 400 になり、投稿しない
- 選んだ訪問先本人以外は総合受付でメンションされない
- 画面から渡した本文やメンション先は使わない
- 連打しても投稿は1回。失敗した送信は再試行できる
- 失敗時は完了画面に進まない
- 無操作と完了後の自動復帰で WELCOME に戻り、入力は捨てる
- 訪問先 API は Slack User ID を返さない
- ログは日時、受付種別、訪問先 ID、成否だけ

## Docker

```bash
cp .env.example .env
docker compose up --build
```

http://127.0.0.1:8787 で画面、http://127.0.0.1:8787/api/health で死活監視です。応答例は `{ "status": "ok", "dryRun": true }` です。

死活監視は `GET /api/health` です。訪問先は `GET /api/destinations`、受付は `POST /api/receptions` です。

重複防止の記憶はプロセスのメモリだけです。インスタンスは1つにしてください。再起動すると記憶は消え、WELCOME から始まります。

## 通信の方針

秒数はすべて `src/config/reception.ts` の `timings` です。

- 画面は受付 API を 10 秒で打ち切ります。自動では再送しません。
- 失敗したときだけ、利用者が「再試行」を押します。同じ idempotency key と同じ入力を送ります。
- サーバーは Slack を 8 秒で打ち切ります。
- 同じ key の成功は 10 分間覚え、再送しても Slack には二度投稿しません。タイムアウト後の再試行で二重通知になりません。
- 成功した同一内容は 30 秒のあいだ、別の key でも再投稿しません。失敗した内容はこの対象外です。
- その他（配達）は入力項目がないため、30 秒以内の次の配達も同じ内容として抑止します。間隔を変えるときは `dedupWindowMs` を変えます。

## ログ

標準出力に1行 JSON で出します。項目は `at`、`type`、`destinationId`、`ok` だけです。氏名と会社名は残しません。Slack の本文も残しません。

## API

`POST /api/receptions`

総合受付:

```json
{
  "idempotencyKey": "5d1c0c3a-1111-2222-3333-444444444444",
  "type": "general",
  "companyName": "株式会社あおぞら",
  "visitorName": "山田 花",
  "visitorCount": 2,
  "visitorCountOrMore": false,
  "destinationId": "ito"
}
```

4人以上は `visitorCount: 4` と `visitorCountOrMore: true` です。面接・研修・会社説明は `type: "interview"`、`purpose: "interview"`、`"training"` または `"briefing"`、`visitorName` です。その他は `type: "other"` だけです。人数は 1、2、3、または 4人以上だけです。不正なリクエストは 400、Slack 失敗は 502 です。

`GET /api/destinations` は `{ "id", "name" }` だけを返します。

## APK

接続先は `android/config.properties` です。例は `android/config.properties.example` にあります。

```bash
cp android/config.properties.example android/config.properties
```

`kiosk.url` を、タブレットから届くサーバーの URL にします。同じ PC のエミュレータからホストを見るときは `http://10.0.2.2:8787` です。社内 LAN では `http://192.168.x.x:8787` のようにします。

```bash
cd android
./gradlew assembleDebug
```

APK は `android/app/build/outputs/apk/debug/app-debug.apk` です。

```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

シェルは全画面で、戻るボタンではアプリを終了しません。設定したホスト以外へは遷移しません。`kiosk.lockDown=false` のあいだは、ホーム操作で他のアプリへ移れます。

他アプリへ移れないようにするときは、初期化した専用端末でデバイスオーナーにし、`kiosk.lockDown=true` でビルドし直します。

```bash
adb shell dpm set-device-owner jp.reception.kiosk/.KioskDeviceAdminReceiver
```

デバイスオーナーは、アカウントのない端末でだけ設定できます。解除は端末の初期化が必要です。

## キオスクの広がり

- ブラウザでは最初のタップで全画面を要求します。拒否されても受付は続きます。
- Android の固定は `KioskController` にまとめてあります。`lockDown` が偽のときは全画面だけ、真のときはロックタスクを試みます。
- 画面の状態はメモリだけです。プロセスを開き直すと WELCOME からです。
