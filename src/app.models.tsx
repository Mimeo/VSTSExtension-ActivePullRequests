import { PullRequestTableItem } from "./PullRequestTable/PullRequestTable.models";
import { IFilterState } from "azure-devops-ui/Utilities/Filter";

export interface AppState {
  hostUrl: string;
  pullRequests: PullRequestTableItem[];
  selectedTabId: string;
  activePrBadge: number;
  draftPrBadge: number;
  filter: IFilterState;
}