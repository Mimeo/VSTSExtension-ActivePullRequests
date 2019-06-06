/// <reference types="vss-web-extension-sdk" />
import { IdentityRefWithVote } from "TFS/VersionControl/Contracts";
import { IdentityRef } from "VSS/WebApi/Contracts";
import { Build } from "TFS/Build/Contracts";

export interface PullRequest {
    createdBy: IdentityRef;
    id: number;
    baseUri: string;
    projectName: string;
    title: string;
    repo: string;
    vote: number;
    reviewers: IdentityRefWithVote[];
    baseBranch: string;
    targetBranch: string;
}

export interface PullRequestWithBuild {
    pr: PullRequest;
    build: Build;
}

export interface Vote {
    icon: string;
    message: string;
    color?: string;
}

export interface BuildDisplay {
    icon: string;
    message: string;
    color?: string;
}