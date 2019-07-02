/// <reference types="vss-web-extension-sdk" />
import { IdentityRefWithVote } from "TFS/VersionControl/Contracts";
import { IdentityRef } from "VSS/WebApi/Contracts";
import { Build } from "TFS/Build/Contracts";

export interface PullRequest {
    createdBy: IdentityRef;
    creationDate: Date;
    id: number;
    baseUri: string;
    projectName: string;
    title: string;
    repoId: string;
    repo: string;
    vote: number;
    reviewers: IdentityRefWithVote[];
    baseBranch: string;
    targetBranch: string;
    totalComments: number;
    inactiveComments: number;
}

export interface PullRequestWithBuild {
    pr: PullRequest;
    build: Build;
}

export interface Vote {
    icon: string;
    message: string;
    showIconInList: boolean;
    order: number;
    color?: string;
}

export interface BuildDisplay {
    icon?: string;
    message: string;
    color?: string;
}

export interface CommentDisplay {
    icon?: string;
    message: string;
    color?: string;
}