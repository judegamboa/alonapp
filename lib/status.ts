export const PROJECT_STATUSES = [
  "not_started",
  "in_progress",
  "in_review",
  "done",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  in_review: "In review",
  done: "Done",
};
