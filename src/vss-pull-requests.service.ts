/// <reference types="vss-web-extension-sdk" />
import GitRestClient = require("TFS/VersionControl/GitRestClient");
import BuildRestClient = require("TFS/Build/RestClient");
import { Vote, PullRequest, PullRequestWithBuild } from "./app.models";
import { PullRequestStatus, GitPullRequestSearchCriteria, GitRepository } from "TFS/VersionControl/Contracts";
import { Build, BuildStatus, BuildResult, BuildReason } from "TFS/Build/Contracts";

export class VssPullRequests {
    private gitClient: GitRestClient.GitHttpClient3_1;
    private buildClient: BuildRestClient.BuildHttpClient4_1;
    private projectName: string;
    private hostUri: string;
    private user: UserContext;

    constructor() {
        this.gitClient = GitRestClient.getClient();
        this.buildClient = BuildRestClient.getClient();
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
            return this.gitClient.getPullRequests(repo.id, search).then(prs => {
                return prs.filter(pr => !pr.isDraft).map(pr => {
                    let userVote = -1;
                    const userAsReviewer = pr.reviewers.filter(reviewer => reviewer.id === this.user.id);
                    if (userAsReviewer.length === 1) {
                        userVote = userAsReviewer[0].vote;
                    }
                    const pullRequest: PullRequest = {
                        createdBy: pr.createdBy,
                        id: pr.pullRequestId,
                        baseUri: this.hostUri,
                        projectName: this.projectName,
                        title: pr.title,
                        repo: repo.name,
                        vote: userVote,
                        reviewers: pr.reviewers,
                        baseBranch: pr.sourceRefName.replace("refs/heads/", ""),
                        targetBranch: pr.targetRefName.replace("refs/heads/", "")
                    };
                    return pullRequest;
                });
            });
        }));
    }

    applyLatestBuilds(prs: PullRequest[]): PromiseLike<PullRequestWithBuild[]> {
        return this.buildClient.getBuilds(this.projectName, undefined, undefined, undefined, undefined, undefined, undefined, BuildReason.PullRequest)
            .then(builds => Promise.all(prs.map(pr => {
                const sorted = builds.sort((a, b) => {
                    if (a.queueTime.getTime() < b.queueTime.getTime()) {
                        return 1;
                    } else if (a.queueTime.getTime() > b.queueTime.getTime()) {
                        return -1;
                    }
                    return 0;
                });
                return {
                    pr: pr,
                    build: sorted.find(build => build.triggerInfo["pr.number"] != null && build.triggerInfo["pr.number"] === pr.id.toString())
                };
            })));
    }

    getPullRequests(): PromiseLike<PullRequest[]> {
        return this.gitClient.getRepositories(this.projectName, true)
            .then(repos => this.getPullRequestData(repos)).then(prs => {
                let unwrappedPrs: PullRequest[] = [];
                prs.map(repoPrGroup => {
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

    buildStatusToString(build: Build) {
        let text: string;
        switch (build.status) {
            case BuildStatus.NotStarted:
                text = "Not Started";
                break;
            case BuildStatus.InProgress:
                text = "In Progress";
                break;
            case BuildStatus.Postponed:
                text = "Postponed";
                break;
            case BuildStatus.Cancelling:
                text = "Cancelling";
                break;
            case BuildStatus.Completed:
                switch (build.result) {
                    case BuildResult.Succeeded:
                        text = "Succeeded";
                        break;
                    case BuildResult.PartiallySucceeded:
                        text = "Partially Succeeded";
                        break;
                    case BuildResult.Canceled:
                        text = "Canceled";
                        break;
                    case BuildResult.Failed:
                        text = "Failed";
                        break;
                    default:
                        text = "Completed";
                        break;
                }
                break;
            default:
                text = "N/A";
                break;
        }
        return text;
    }
}