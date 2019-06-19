import { PullRequestTableItem } from "./PullRequestTable/PullRequestTable.models";

export interface AppState {
  hostUrl: string;
  pullRequests: PullRequestTableItem[];
  selectedTabId: string;
  activePrBadge: number;
  draftPrBadge: number;
}