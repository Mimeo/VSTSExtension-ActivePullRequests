import { PullRequestTableItem } from "./PullRequestTable/PullRequestTable.models";
import { IFilterState } from "azure-devops-ui/Utilities/Filter";
import { GitRepository } from "azure-devops-extension-api/Git";

export interface AppState {
  hostUrl: string;
  pullRequests: PullRequestTableItem[];
  repositories: GitRepository[];
  selectedTabId: string;
  activePrBadge: number;
  draftPrBadge: number;
  filter: IFilterState;
}