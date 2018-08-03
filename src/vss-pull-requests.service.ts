 /// <reference types="vss-web-extension-sdk" />
import GitRestClient = require("TFS/VersionControl/GitRestClient");
import { Vote, PullRequest } from "./app.models";
import { PullRequestStatus, GitPullRequestSearchCriteria, GitRepository } from "TFS/VersionControl/Contracts";

export class VssPullRequests {
    private client: GitRestClient.GitHttpClient3_1;
    private projectName: string;
    private hostUri: string;
    private user: UserContext;

    constructor() {
        this.client = GitRestClient.getClient();
        const context = VSS.getWebContext();
        this.projectName = context.project.name;
        this.hostUri = context.host.uri;
        this.user = context.user;
    }

    private getPullRequestData(repos: GitRepository[]) {
        const search: GitPullRequestSearchCriteria = {
            creatorId: undefined,
            includeLinks: undefined,
            repositoryId: undefined,
            reviewerId: undefined,
            sourceRefName: undefined,
            sourceRepositoryId: undefined,
            status: PullRequestStatus.Active,
            targetRefName: undefined
        };
        return Promise.all(repos.map(repo => {
            return this.client.getPullRequests(repo.id, search).then(prs => {
                return prs.map(pr => {
                    let userVote = -1;
                    const userAsReviewer = pr.reviewers.filter(reviewer => reviewer.id === this.user.id);
                    if (userAsReviewer.length === 1) {
                        userVote = userAsReviewer[0].vote;
                    }
                    const pullRequest: PullRequest = {
                        createdBy: pr.createdBy,
                        id: pr.pullRequestId,
                        url: this.hostUri + this.projectName + "/_git/" + repo.name + "/pullRequest/" + pr.pullRequestId,
                        title: pr.title,
                        repo: repo.name,
                        vote: userVote,
                        reviewers: pr.reviewers
                    };
                    return pullRequest;
                });
            });
        }));
    }

    getPullRequests(): PromiseLike<PullRequest[]> {
        return this.client.getRepositories(this.projectName, true)
            .then(repos => this.getPullRequestData(repos)).then(prs => {
                let unwrappedPrs: PullRequest[] = [];
                prs.forEach(repoPrGroup => {
                    unwrappedPrs = unwrappedPrs.concat(repoPrGroup);
                });
                return unwrappedPrs;
            });
    }

    voteNumberToVote(vote: number): Vote {
        let voteObj: Vote;
        switch (vote) {
            case -10:
                voteObj = {
                    icon: "<span class='bowtie-icon bowtie-status-failure'></span>",
                    message: "Rejected"
                };
                break;
            case -5:
                voteObj = {
                    icon: "<span class='bowtie-icon bowtie-status-waiting-fill'></span>",
                    message: "Waiting for the author"
                };
                break;
            case -1:
                voteObj = {
                    icon: "<span class='icon bowtie-icon bowtie-status-waiting bowtie-status-waiting-response'></span>",
                    message: "No Response (not required)",
                    color: "#808080"
                };
                break;
            case 0:
                voteObj = {
                    icon: "<span class='icon bowtie-icon bowtie-status-waiting bowtie-status-waiting-response'></span>",
                    message: "Response Required",
                    color: "#ff0000"
                };
                break;
            case 5:
                voteObj = {
                    icon: "<span class='bowtie-icon bowtie-status-success'></span>",
                    message: "Approved with suggestions"
                };
                break;
            case 10:
                voteObj = {
                    icon: "<span class='bowtie-icon bowtie-status-success'></span>",
                    message: "Approved"
                };
                break;
        }
        return voteObj;
    }
}