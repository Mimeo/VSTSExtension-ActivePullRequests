import { PullRequestTableItem } from "./PullRequestTable/PullRequestTable.models";
import { IStatusProps } from "azure-devops-ui/Status";

export interface Vote {
  status: IStatusProps;
  message: string;
  order: number;
}

export interface AppState {
  hostUrl: string;
  pullRequests: PullRequestTableItem[];
  selectedTabId: string;
  activePrBadge: number;
  draftPrBadge: number;
}