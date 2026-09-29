/**
 * 受付キオスクの色・文言・秒数・入力上限の変更箇所。
 * 画面や API に同じ値を直書きしない。
 *
 * 秘密情報（Slack トークン、Slack User ID）はここには置かない。
 * `.env.example` をコピーした `.env` で渡す。
 * タブレット APK の接続先 URL は `android/config.properties`。
 */
export const theme = {
  background: "#FFF4C8",
  backgroundDeep: "#FFE08A",
  amber: "#F5A524",
  amberDeep: "#E09412",
  white: "#FFFFFF",
  ink: "#4A3728",
  inkSoft: "#7A6552",
  line: "#F0D48A",
  danger: "#B85C38",
  fontFamily: '"Noto Sans JP", sans-serif',
} as const;

export const network = {
  /** Docker と開発サーバーの待受ポート。docker-compose.yml の ports と揃える。 */
  port: 8787,
} as const;

export const timings = {
  /** 無操作で WELCOME へ戻す。入力中も計測し、戻るときに入力は捨てる。 */
  inactivityMs: 60_000,
  /** 送信成功の完了画面を出してから WELCOME へ戻す。 */
  completeReturnMs: 8_000,
  /**
   * 受付 API の待ち時間。超えたら失敗にする。
   * 自動再送はしない。利用者が「再試行」したときだけ同じ内容を送る。
   */
  requestTimeoutMs: 10_000,
  /** 成功済みの同一内容を、別キーでも再通知しない時間。失敗した送信は対象外。 */
  dedupWindowMs: 30_000,
  /** サーバーが Slack API を待つ上限。 */
  slackTimeoutMs: 8_000,
  /** 同じ idempotency key の成功結果を覚えておく時間。再起動で消える。 */
  idempotencyTtlMs: 10 * 60_000,
} as const;

export const limits = {
  minVisitorCount: 1,
  maxVisitorCount: 30,
  maxNameLength: 80,
  maxCompanyLength: 120,
  maxIdempotencyKeyLength: 80,
} as const;

/** 面接・研修と配達のメンションに使える人。この三択以外は設定できない。 */
export const mentionChoices = [
  { id: "nosaka", name: "野坂 星司" },
  { id: "yanase", name: "梁瀬 星太" },
  { id: "ito", name: "伊藤 功" },
] as const;

export type MentionChoiceId = (typeof mentionChoices)[number]["id"];

export const copy = {
  appTitle: "受付",
  welcomeTitle: "WELCOME",
  welcomeSubtitle: "画面をタッチしてください",
  menuTitle: "ご用件を選択してください",
  general: "総合受付",
  generalHint: "打ち合わせ・ご訪問",
  interview: "面接・研修",
  interviewHint: "面接・研修でお越しの方",
  other: "その他",
  otherHint: "配達など",
  home: "最初の画面へ",
  homeFromError: "最初の画面へ戻る",
  companyName: "会社名",
  companyPlaceholder: "株式会社あおぞら",
  visitorName: "氏名",
  visitorPlaceholder: "山田 花",
  visitorCount: "来社人数",
  visitorCountPlaceholder: "1",
  generalTitle: "総合受付",
  generalRequired: "会社名・氏名・人数はすべて必須です",
  destinationTitle: "訪問先を選択してください",
  destinationLoading: "訪問先を読み込んでいます",
  destinationError: "訪問先一覧を取得できませんでした",
  destinationEmpty: "訪問先が登録されていません",
  reload: "再読み込み",
  interviewTitle: "面接・研修",
  interviewRequired: "氏名は必須です",
  back: "戻る",
  next: "次へ",
  send: "送信する",
  sending: "送信しています",
  thanks: "入力ありがとうございます！",
  thanksHint: "まもなく最初の画面に戻ります",
  errorTitle: "送信できませんでした",
  errorBody: "通信に失敗しました。入力内容は残っています。もう一度送信できます。",
  retry: "再試行",
  slack: {
    generalTitle: "【総合受付】来客がありました",
    interviewTitle: "【面接・研修】来客がありました",
    otherTitle: "【その他】配達の受付がありました",
    companyLabel: "会社名",
    nameLabel: "お名前",
    countLabel: "人数",
    destinationLabel: "訪問先",
    countSuffix: "名",
  },
} as const;
