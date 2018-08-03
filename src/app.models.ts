 /// <reference types="vss-web-extension-sdk" />
import { IdentityRefWithVote } from "TFS/VersionControl/Contracts";
import { IdentityRef } from "VSS/WebApi/Contracts";

export interface PullRequest {
    createdBy: IdentityRef;
    id: number;
    url: string;
    title: string;
    repo: string;
    vote: number;
    reviewers: IdentityRefWithVote[];
}

export interface Vote {
    icon: string;
    message: string;
    color?: string;
}