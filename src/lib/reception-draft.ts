export type Draft = {
  companyName: string;
  visitorName: string;
  visitorCount: string;
  destinationId: string;
  interviewName: string;
  interviewPurpose: string;
};

export function emptyDraft(): Draft {
  return {
    companyName: "",
    visitorName: "",
    visitorCount: "",
    destinationId: "",
    interviewName: "",
    interviewPurpose: "",
  };
}
