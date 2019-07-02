/// <reference types="vss-web-extension-sdk" />
import GitRestClient = require("TFS/VersionControl/GitRestClient");
import BuildRestClient = require("TFS/Build/RestClient");
import { Vote, PullRequest, PullRequestWithBuild, BuildDisplay, CommentDisplay } from "./app.models";
import { PullRequestStatus, GitPullRequestSearchCriteria } from "TFS/VersionControl/Contracts";
import { Build, BuildStatus, BuildResult, BuildReason } from "TFS/Build/Contracts";

export class VssPullRequests {
    private gitClient: GitRestClient.GitHttpClient3_1;
    private buildClient: BuildRestClient.BuildHttpClient4_1;
    private projectName: string;
    private hostUri: string;
    private user: UserContext;
    private search: GitPullRequestSearchCriteria = {
        creatorId: undefined,
        includeLinks: undefined,
        repositoryId: undefined,
        reviewerId: undefined,
        sourceRefName: undefined,
        sourceRepositoryId: undefined,
        status: PullRequestStatus.Active,
        targetRefName: undefined
    };

    constructor() {
        this.gitClient = GitRestClient.getClient();
        this.buildClient = BuildRestClient.getClient();
        const context = VSS.getWebContext();
        this.projectName = context.project.name;
        this.hostUri = context.host.uri;
        this.user = context.user;
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
                const build = sorted.find(build => build.triggerInfo["pr.number"] != null && build.triggerInfo["pr.number"] === pr.id.toString());
                return {
                    pr: pr,
                    build: build
                };
            })));
    }

    applyCommentStatus(prs: PullRequestWithBuild[]): Promise<PullRequestWithBuild[]> {
        return Promise.all(prs.map(prb => {
            return this.gitClient.getThreads(prb.pr.repoId, prb.pr.id).then(threads => {
                threads.forEach((thread) => {
                    const threadStatus = JSON.stringify(thread.status);
                    if (threadStatus) {
                        prb.pr.totalComments++;
                        // thread status of 1 is 'active'
                        if (threadStatus !== "1") {
                            prb.pr.inactiveComments++;
                        }
                    }
                });
                return prb;
            });
        }));
    }

    getPullRequests(): PromiseLike<PullRequest[]> {
        return this.gitClient.getPullRequestsByProject(this.projectName, this.search).then(prs => {
            return prs.filter(pr => !pr.isDraft).map(pr => {
                let userVote = -1;
                const userAsReviewer = pr.reviewers.filter(reviewer => reviewer.id === this.user.id);
                if (userAsReviewer.length === 1) {
                    userVote = userAsReviewer[0].vote;
                }
                const pullRequest: PullRequest = {
                    createdBy: pr.createdBy,
                    creationDate: pr.creationDate,
                    id: pr.pullRequestId,
                    repoId: pr.repository.id,
                    baseUri: this.hostUri,
                    projectName: this.projectName,
                    title: pr.title,
                    repo: pr.repository.name,
                    vote: userVote,
                    reviewers: pr.reviewers,
                    baseBranch: pr.sourceRefName.replace("refs/heads/", ""),
                    targetBranch: pr.targetRefName.replace("refs/heads/", ""),
                    totalComments: 0,
                    inactiveComments: 0
                };
                return pullRequest;
            });
        });
    }

    voteNumberToVote(vote: number): Vote {
        let voteObj: Vote;
        switch (vote) {
            case -10:
                voteObj = {
                    icon: "<span class='bowtie-icon bowtie-status-failure'></span>",
                    message: "Rejected",
                    showIconInList: true,
                    order: 0
                };
                break;
            case -5:
                voteObj = {
                    icon: "<span class='bowtie-icon bowtie-status-waiting-fill'></span>",
                    message: "Waiting for the author",
                    showIconInList: true,
                    order: 1
                };
                break;
            case -1:
                voteObj = {
                    icon: "<span class='icon bowtie-icon bowtie-status-waiting bowtie-status-waiting-response'></span>",
                    message: "No Response (not required)",
                    color: "#808080",
                    showIconInList: false,
                    order: 4
                };
                break;
            case 0:
                voteObj = {
                    icon: "<span class='icon bowtie-icon bowtie-status-waiting bowtie-status-waiting-response'></span>",
                    message: "Response Required",
                    color: "rgba(var(--palette-accent1,218, 10, 0),1)",
                    showIconInList: false,
                    order: 3
                };
                break;
            case 5:
                voteObj = {
                    icon: "<span class='bowtie-icon bowtie-status-success'></span>",
                    message: "Approved with suggestions",
                    showIconInList: true,
                    order: 2
                };
                break;
            case 10:
                voteObj = {
                    icon: "<span class='bowtie-icon bowtie-status-success'></span>",
                    message: "Approved",
                    showIconInList: true,
                    order: 2
                };
                break;
        }
        return voteObj;
    }

    commentStatusToDisplay(totalComments: number, inactiveComments: number): CommentDisplay {
        let statusResult: CommentDisplay = {
            message: "",
            icon: null,
            color: null
        };

        if (totalComments > 0) {
            statusResult.message = `${inactiveComments}/${totalComments}`;
            if (totalComments === inactiveComments) {
                statusResult.icon = "status-success";
                statusResult.color = "rgba(var(--palette-accent2-dark,16, 124, 16),1)";
            } else {
                statusResult.icon = "status-failure";
                statusResult.color = "rgba(var(--palette-accent1,218, 10, 0),1)";
            }
        }
        return statusResult;
    }
    buildStatusToBuildDisplay(build: Build): BuildDisplay {
        if (build == null) {
            return { message: "" };
        }
        let buildDisplay: BuildDisplay;
        switch (build.status) {
            case BuildStatus.NotStarted:
                buildDisplay = {
                    message: "Not Started",
                    icon: "status-waiting"
                };
                break;
            case BuildStatus.InProgress:
                buildDisplay = {
                    message: "In Progress",
                    icon: "status-waiting"
                };
                break;
            case BuildStatus.Postponed:
                buildDisplay = {
                    message: "Postponed",
                    icon: "status-waiting"
                };
                break;
            case BuildStatus.Cancelling:
                buildDisplay = {
                    message: "Cancelling",
                    icon: "status-error"
                };
                break;
            case BuildStatus.Completed:
                switch (build.result) {
                    case BuildResult.Succeeded:
                        buildDisplay = {
                            message: "Succeeded",
                            icon: "status-success",
                            color: "rgba(var(--palette-accent2-dark,16, 124, 16),1)"
                        };
                        break;
                    case BuildResult.PartiallySucceeded:
                        buildDisplay = {
                            message: "Partially Succeeded",
                            icon: "status-success",
                            color: "rgba(var(--palette-accent2-dark,16, 124, 16),1)"
                        };
                        break;
                    case BuildResult.Canceled:
                        buildDisplay = {
                            message: "Canceled",
                            icon: "status-error",
                            color: "rgba(var(--palette-accent1,218, 10, 0),1)"
                        };
                        break;
                    case BuildResult.Failed:
                        buildDisplay = {
                            message: "Failed",
                            icon: "status-failure",
                            color: "rgba(var(--palette-accent1,218, 10, 0),1)"
                        };
                        break;
                    default:
                        buildDisplay = {
                            message: "Completed",
                            icon: "status-success",
                            color: "rgba(var(--palette-accent2-dark,16, 124, 16),1)"
                        };
                        break;
                }
                break;
            default:
                buildDisplay = { message: "" };
                break;
        }
        return buildDisplay;
    }
}