export const RECEPTION_TYPES = ["general", "interview", "delivery"] as const;
export type ReceptionType = (typeof RECEPTION_TYPES)[number];

export const INTERVIEW_PURPOSES = ["interview", "training"] as const;
export type InterviewPurpose = (typeof INTERVIEW_PURPOSES)[number];

export type Destination = {
  id: string;
  displayName: string;
  slackUserId: string;
};

export type PublicDestination = {
  id: string;
  displayName: string;
};

export type GeneralNotifyRequest = {
  type: "general";
  companyName: string;
  visitorName: string;
  partySize: number;
  destinationId: string;
};

export type InterviewNotifyRequest = {
  type: "interview";
  /** 面接か研修か。Slack 本文でも区別する */
  purpose: InterviewPurpose;
  visitorName: string;
};

export type DeliveryNotifyRequest = {
  type: "delivery";
};

export type NotifyRequest =
  | GeneralNotifyRequest
  | InterviewNotifyRequest
  | DeliveryNotifyRequest;

export type NotifySuccess = {
  ok: true;
  dryRun: boolean;
};

export type ApiErrorBody = {
  error: string;
  message: string;
};

export type SlackClient = {
  send: (text: string) => Promise<void>;
};

export type AppConfig = {
  port: number;
  dryRun: boolean;
  slackWebhookUrl: string;
  destinationsPath: string;
  duplicateWindowMs: number;
  interviewMentionUserIds: string[];
  deliveryMentionUserIds: string[];
};
