import { Vote, BuildDisplayStatus } from "./PullRequestTable.models";
import { Statuses } from "azure-devops-ui/Status";
import { Build, BuildStatus, BuildResult } from "azure-devops-extension-api/Build";

export function getVoteStatus(vote: number): Vote {
  switch (vote) {
    case -10:
      return {
        status: Statuses.Failed,
        message: "Rejected",
        order: 0
      };
    case -5:
      return {
        status: Object.assign(Statuses.Waiting, { color: Statuses.Warning.color }),
        message: "Waiting for the Author",
        order: 1
      };
    case -1:
      return {
        status: Statuses.Queued,
        message: "No Response",
        order: 4
      };
    case 0:
      return {
        status: Object.assign(Statuses.Waiting, { color: Statuses.Failed.color }),
        message: "Response Required",
        order: 3
      };
    case 5:
    case 10:
      return {
        status: Statuses.Success,
        message: "Approved",
        order: 2
      };
  }
}

export function getStatusFromBuild(build: Build): BuildDisplayStatus {
  if (build == null) {
    return { message: "" };
  }
  switch (build.status) {
    case BuildStatus.NotStarted:
      return {
        message: "Not Started",
        icon: Statuses.Waiting
      };
    case BuildStatus.InProgress:
      return {
        message: "In Progress",
        icon: Statuses.Running
      };
    case BuildStatus.Postponed:
      return {
        message: "Postponed",
        icon: Statuses.Waiting
      };
    case BuildStatus.Cancelling:
      return {
        message: "Cancelling",
        icon: Statuses.Running
      };
    case BuildStatus.Completed:
      switch (build.result) {
        case BuildResult.Succeeded:
          return {
            message: "Succeeded",
            icon: Statuses.Success
          };
        case BuildResult.PartiallySucceeded:
          return {
            message: "Partially Succeeded",
            icon: Statuses.Success
          };
        case BuildResult.Canceled:
          return {
            message: "Canceled",
            icon: Statuses.Canceled
          };
        case BuildResult.Failed:
          return {
            message: "Failed",
            icon: Statuses.Failed
          };
        default:
          return {
            message: "Completed",
            icon: Statuses.Success
          };
      }
    default:
      return { message: "" };
  }
}