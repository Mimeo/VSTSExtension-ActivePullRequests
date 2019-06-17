import { GitRepository, IdentityRefWithVote } from "azure-devops-extension-api/Git";
import { IdentityRef } from "azure-devops-extension-api/WebApi/WebApi";
import { IFilter } from "azure-devops-ui/Utilities/Filter";

export interface PullRequestTableProps {
  pullRequests: PullRequestTableItem[];
  hostUrl: string;
  filter?: IFilter;
}

export interface PullRequestTableState {
}

export interface PullRequestTableItem {
  id: number;
  isDraft: boolean;
  author: IdentityRef;
  title: string;
  repo: GitRepository;
  baseBranch: string;
  targetBranch: string;
  reviewers: IdentityRefWithVote[];
}