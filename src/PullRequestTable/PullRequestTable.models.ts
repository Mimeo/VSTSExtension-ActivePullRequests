import { GitRepository, IdentityRefWithVote } from "azure-devops-extension-api/Git";
import { IdentityRef } from "azure-devops-extension-api/WebApi/WebApi";
import { IFilter } from "azure-devops-ui/Utilities/Filter";
import { ObservableArray, ObservableValue } from "azure-devops-ui/Core/Observable";
import { IStatusProps } from "azure-devops-ui/Status";
import { Build } from "azure-devops-extension-api/Build";

export interface PullRequestTableProps {
  pullRequests: PullRequestTableItem[];
  hostUrl: string;
  filter?: IFilter;
}

export interface PullRequestTableState {
  pullRequestProvider: ObservableArray<PullRequestTableItem | ObservableValue<PullRequestTableItem | undefined>>;
}

export interface PullRequestTableItem {
  id: number;
  isDraft: boolean;
  author: IdentityRef;
  title: string;
  repo: GitRepository;
  baseBranch: string;
  targetBranch: string;
  buildDetails: BuildDetails;
  vote: Vote;
  reviewers: IdentityRefWithVote[];
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