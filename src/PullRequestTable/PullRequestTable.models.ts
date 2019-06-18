import { GitRepository, IdentityRefWithVote } from "azure-devops-extension-api/Git";
import { IdentityRef } from "azure-devops-extension-api/WebApi/WebApi";
import { IFilter } from "azure-devops-ui/Utilities/Filter";
import { Vote } from "../app.models";
import { ObservableArray, ObservableValue } from "azure-devops-ui/Core/Observable";

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
  vote: Vote;
  reviewers: IdentityRefWithVote[];
}