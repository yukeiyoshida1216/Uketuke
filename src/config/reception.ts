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
  /** グラデーションの下端。backgroundDeep より少し薄い。 */
  backgroundBottom: "#FFE9A8",
  /** ロゴ中央の山吹色。 */
  yamabuki: "#F8B828",
  /** 「画面をタッチしてください」が表示されているときの色。山吹色より少し濃い。 */
  hintClear: "#E9A41A",
  amber: "#F5A524",
  amberDeep: "#E09412",
  /** WELCOME の文字色。ロゴと同じ山吹色で、背景の上ではっきり読める。 */
  welcomeSoft: "#F8B828",
  /** 会社名・氏名をタップしたときの枠。山吹色より少し濃い。 */
  fieldFocus: "#E09412",
  white: "#FFFFFF",
  ink: "#4A3728",
  /** タイトル画面の日付・時刻。WELCOME より目立たない薄い色。 */
  clock: "#C4B6A6",
  inkSoft: "#7A6552",
  /** 会社名・氏名の入力例。本文より少し薄い。 */
  placeholder: "#A39890",
  line: "#F0D48A",
  danger: "#B85C38",
  fontFamily: '"Noto Sans JP", sans-serif',
} as const;

/** 画面全体の背景。上は明るく、下へ濃くなる。 */
export const backgroundGradient = `linear-gradient(180deg, ${theme.white} 0%, ${theme.background} 46%, ${theme.backgroundBottom} 100%)`;

export const network = {
  /** Docker と開発サーバーの待受ポート。docker-compose.yml の ports と揃える。 */
  port: 8787,
} as const;

export const timings = {
  /** 「画面をタッチしてください」が消えて戻るまでの周期。 */
  hintBlinkMs: 4_000,
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
  maxVisitorCount: 3,
  orMoreVisitorCount: 4,
  maxNameLength: 80,
  maxCompanyLength: 120,
  maxIdempotencyKeyLength: 80,
} as const;

/** 来社人数の選択肢。4人以上だけ orMore を立てて送る。 */
export const visitorCountChoices = [
  { id: "1", label: "1人", count: 1, orMore: false },
  { id: "2", label: "2人", count: 2, orMore: false },
  { id: "3", label: "3人", count: 3, orMore: false },
  { id: "4plus", label: "4人以上", count: 4, orMore: true },
] as const;

export type VisitorCountChoiceId = (typeof visitorCountChoices)[number]["id"];

/** 面接・会社説明で選ぶ用件。通知見出しは copy.slack 側。 */
export const interviewPurposes = [
  { id: "interview", label: "面接", photo: "/purpose/interview.png" },
  { id: "briefing", label: "会社説明", photo: "/purpose/briefing.png" },
] as const;

export type InterviewPurpose = (typeof interviewPurposes)[number]["id"];

/** 面接・会社説明と配達のメンションに使える人。この三択以外は設定できない。 */
export const mentionChoices = [
  { id: "nosaka", name: "野坂 星司", photo: "/staff/nosaka.png" },
  { id: "yanase", name: "梁瀬 聖太", photo: "/staff/yanase.png" },
  { id: "ito", name: "伊藤 功", photo: "/staff/ito.png" },
] as const;

export type MentionChoiceId = (typeof mentionChoices)[number]["id"];

const staffCopyKey: Record<MentionChoiceId, "staffNosaka" | "staffYanase" | "staffIto"> = {
  nosaka: "staffNosaka",
  yanase: "staffYanase",
  ito: "staffIto",
};

/** 画面に出す担当者名。Slack 通知の氏名は mentionChoices の日本語のまま。 */
export function staffDisplayName(id: string, copy: UiCopy, fallback: string): string {
  const key = staffCopyKey[id as MentionChoiceId];
  return key ? copy[key] : fallback;
}

/** 用件選択のアイコン。最初の画面のうちに読み終えて、切り替わり時の待ちをなくす。 */
export const menuIcons = {
  general: "/menu/general.png",
  interview: "/menu/interview.png",
  other: "/menu/other.png",
} as const;

/** 最初の画面のうちに読み込んでおく写真とアイコン。選択時の待ちをなくす。 */
export const preloadedPhotos = [
  ...mentionChoices.map((person) => person.photo),
  ...interviewPurposes.map((item) => item.photo),
  ...Object.values(menuIcons),
] as const;

export type UiCopy = {
  appTitle: string;
  welcomeCompany: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  menuTitle: string;
  general: string;
  generalHint: string;
  interview: string;
  interviewHint: string;
  other: string;
  otherHint: string;
  home: string;
  homeFromError: string;
  companyName: string;
  companyPlaceholder: string;
  visitorName: string;
  visitorPlaceholder: string;
  visitorCount: string;
  count1: string;
  count2: string;
  count3: string;
  count4plus: string;
  generalTitle: string;
  generalRequired: string;
  mentionTarget: string;
  mentionPlaceholder: string;
  destinationTitle: string;
  destinationLoading: string;
  destinationError: string;
  destinationEmpty: string;
  reload: string;
  interviewTitle: string;
  purposeInterview: string;
  purposeBriefing: string;
  interviewRequired: string;
  back: string;
  next: string;
  send: string;
  sending: string;
  thanks: string;
  thanksWait: readonly string[];
  thanksHint: string;
  errorTitle: string;
  errorBody: string;
  retry: string;
  delivery: string;
  staffNosaka: string;
  staffYanase: string;
  staffIto: string;
};

export const copyJa = {
  appTitle: "受付",
  welcomeCompany: "株式会社ライトパス",
  welcomeTitle: "WELCOME",
  welcomeSubtitle: "画面をタッチしてください",
  menuTitle: "ご用件を選択してください",
  general: "企業様向け",
  generalHint: "打ち合わせ・ご訪問",
  interview: "面接・会社説明",
  interviewHint: "面接・会社説明でお越しの方",
  other: "その他",
  otherHint: "点検やビル関係者など",
  home: "最初の画面へ",
  homeFromError: "最初の画面へ戻る",
  companyName: "会社名",
  companyPlaceholder: "株式会社ライトパス",
  visitorName: "氏名",
  visitorPlaceholder: "ライト 一郎",
  visitorCount: "来社人数",
  count1: "1人",
  count2: "2人",
  count3: "3人",
  count4plus: "4人以上",
  generalTitle: "企業様向け",
  generalRequired: "会社名・氏名・人数・担当者名はすべて必須です",
  mentionTarget: "担当者名",
  mentionPlaceholder: "選択してください",
  destinationTitle: "訪問先を選択してください",
  destinationLoading: "訪問先を読み込んでいます",
  destinationError: "訪問先一覧を取得できませんでした",
  destinationEmpty: "訪問先が登録されていません",
  reload: "再読み込み",
  interviewTitle: "面接・会社説明",
  purposeInterview: "面接",
  purposeBriefing: "会社説明",
  interviewRequired: "氏名を入力し、面接・会社説明のいずれかを選択してください",
  back: "戻る",
  next: "次へ",
  send: "送信する",
  sending: "送信しています",
  thanks: "受付ありがとうございます！",
  thanksWait: ["只今担当の者が参りますので", "少々お待ちください"],
  thanksHint: "まもなく最初の画面に戻ります",
  errorTitle: "送信できませんでした",
  errorBody: "通信に失敗しました。入力内容は残っています。もう一度送信できます。",
  retry: "再試行",
  delivery: "宅配/郵便",
  staffNosaka: "野坂 星司",
  staffYanase: "梁瀬 聖太",
  staffIto: "伊藤 功",
} as const satisfies UiCopy;

export const copyEn = {
  appTitle: "Reception",
  welcomeCompany: "Light Path",
  welcomeTitle: "WELCOME",
  welcomeSubtitle: "Touch the screen",
  menuTitle: "Please select your purpose",
  general: "For companies",
  generalHint: "Meetings and visits",
  interview: "Interview & briefing",
  interviewHint: "For interviews and company briefings",
  other: "Other",
  otherHint: "Inspections, building staff, and more",
  home: "Home",
  homeFromError: "Back to home",
  companyName: "Company",
  companyPlaceholder: "Light Path",
  visitorName: "Name",
  visitorPlaceholder: "Ichiro Light",
  visitorCount: "Number of visitors",
  count1: "1",
  count2: "2",
  count3: "3",
  count4plus: "4+",
  generalTitle: "For companies",
  generalRequired: "Company, name, number of visitors, and contact are all required",
  mentionTarget: "Contact",
  mentionPlaceholder: "Select",
  destinationTitle: "Select who you are visiting",
  destinationLoading: "Loading contacts",
  destinationError: "Could not load the contact list",
  destinationEmpty: "No contacts are registered",
  reload: "Reload",
  interviewTitle: "Interview & briefing",
  purposeInterview: "Interview",
  purposeBriefing: "Briefing",
  interviewRequired: "Enter your name, then select interview or briefing",
  back: "Back",
  next: "Next",
  send: "Send",
  sending: "Sending",
  thanks: "Thank you for checking in!",
  thanksWait: ["A staff member will be with you shortly.", "Please wait a moment."],
  thanksHint: "Returning to the home screen soon",
  errorTitle: "Could not send",
  errorBody: "The connection failed. Your entries are still here. You can send again.",
  retry: "Try again",
  delivery: "Delivery/Mail",
  staffNosaka: "Seiji Nosaka",
  staffYanase: "Shota Yanase",
  staffIto: "Kou Ito",
} as const satisfies UiCopy;

/** 画面の初期言語。Slack 通知の文言もここを使う。 */
export const copy = {
  ...copyJa,
  slack: {
    generalTitle: "【総合受付】来客がありました",
    interviewTitle: "【面接】来客がありました",
    briefingTitle: "【会社説明】来客がありました",
    otherTitle: "【その他】配達の受付がありました",
    companyLabel: "会社名",
    nameLabel: "お名前",
    countLabel: "人数",
    destinationLabel: "訪問先",
    countSuffix: "名",
    countOrMoreSuffix: "名以上",
  },
} as const;
