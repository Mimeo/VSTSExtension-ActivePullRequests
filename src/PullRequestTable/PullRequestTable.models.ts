import { GitRepository, IdentityRefWithVote } from "azure-devops-extension-api/Git";
import { IdentityRef } from "azure-devops-extension-api/WebApi/WebApi";
import { IFilterState } from "azure-devops-ui/Utilities/Filter";
import { ObservableArray, ObservableValue } from "azure-devops-ui/Core/Observable";
import { IStatusProps } from "azure-devops-ui/Status";
import { Build } from "azure-devops-extension-api/Build";
import { ITableColumn } from "azure-devops-ui/Table";
import { Settings } from "../SettingsPanel/SettingsPanel.models";

export interface PullRequestTableProps {
  pullRequests: PullRequestTableItem[];
  hostUrl: string;
  filter: IFilterState;
  settings: Settings
}

export interface PullRequestTableState {
  columns: ITableColumn<PullRequestTableItem>[];
  filteredPrs: PullRequestTableItem[];
  pullRequestProvider: ObservableArray<ObservableValue<PullRequestTableItem>>;
  settings: Settings
}

export interface PullRequestTableItem {
  id: number;
  isDraft: boolean;
  author: IdentityRef;
  creationDate: Date;
  title: string;
  repo: GitRepository;
  baseBranch: string;
  targetBranch: string;
  buildDetails: BuildDetails;
  vote: Vote;
  reviewers: IdentityRefWithVote[];
  totalComments: number,
  inactiveComments: number
}

export interface Vote {
  status: IStatusProps;
  message: string;
  order: number;
}

export interface BuildDisplayStatus {
  icon?: IStatusProps;
  message: string;
}

export interface BuildDetails {
  build?: Build;
  status: BuildDisplayStatus;
}

export interface CommentDisplayStatus {
  icon?: IStatusProps;
  message: string;
}