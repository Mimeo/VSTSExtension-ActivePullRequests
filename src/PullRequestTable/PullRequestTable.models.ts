import { GitPullRequestSearchCriteria, IdentityRefWithVote } from "azure-devops-extension-api/Git";
import { IdentityRef } from "azure-devops-extension-api/WebApi/WebApi";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";

export interface PullRequestTableProps {
  project: string;
}

export interface PullRequestTableState {
  searchFilter: GitPullRequestSearchCriteria;
  pullRequests?: ArrayItemProvider<PullRequestTableItem>;
}

export interface PullRequestTableItem {
  author: IdentityRef;
  title: string;
  reviewers: IdentityRefWithVote[];
}