import { IdentityRef } from "azure-devops-extension-api/WebApi/WebApi";
import { IdentityRefWithVote } from "azure-devops-extension-api/Git";
import { ISimpleTableCell } from "azure-devops-ui/Table";
import { ISimpleListCell } from "azure-devops-ui/List";

export interface PullRequest {
  author: IdentityRef;
  id: number;
  title: string;
  repo: string;
  baseBranch: string;
  targetBranch: string;
  buildStatus: any;
  vote: number;
  reviewers: IdentityRefWithVote[];
}

export interface PullRequestTableItem extends ISimpleTableCell {
  author: string;
  title: string;
  reviewers: ISimpleListCell;
}