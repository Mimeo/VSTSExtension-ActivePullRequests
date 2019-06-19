import * as API from "azure-devops-extension-api";
import { CommonServiceIds, IProjectPageService } from "azure-devops-extension-api";
import { Build, BuildReason, BuildRestClient, BuildResult, BuildStatus } from "azure-devops-extension-api/Build";
import { GitRestClient, PullRequestStatus } from "azure-devops-extension-api/Git";
import * as SDK from "azure-devops-extension-sdk";
import { IUserContext } from "azure-devops-extension-sdk";
import { ConditionalChildren } from "azure-devops-ui/ConditionalChildren";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { FilterBar } from "azure-devops-ui/FilterBar";
import { Header, TitleSize } from "azure-devops-ui/Header";
import { HeaderCommandBarWithFilter } from "azure-devops-ui/HeaderCommandBar";
import { Page } from "azure-devops-ui/Page";
import { Statuses } from "azure-devops-ui/Status";
import { Surface, SurfaceBackground } from "azure-devops-ui/Surface";
import { Tab, TabBar } from "azure-devops-ui/Tabs";
import { KeywordFilterBarItem } from "azure-devops-ui/TextFilterBarItem";
import { Filter, IFilter } from "azure-devops-ui/Utilities/Filter";
import * as React from "react";
import { AppState } from "./app.models";
import * as styles from "./app.scss";
import { PullRequestTable } from "./PullRequestTable/PullRequestTable";
import { Vote, BuildDisplayStatus } from "./PullRequestTable/PullRequestTable.models";

enum TabType {
  active = "active",
  drafts = "drafts"
}

function getVoteStatus(vote: number): Vote {
  let voteObj: Vote;
  switch (vote) {
    case -10:
      voteObj = {
        status: Statuses.Failed,
        message: "Rejected",
        order: 0
      };
      break;
    case -5:
      voteObj = {
        status: Object.assign(Statuses.Waiting, { color: Statuses.Warning.color }),
        message: "Waiting for the author",
        order: 1
      };
      break;
    case -1:
      voteObj = {
        status: Statuses.Queued,
        message: "No Response (not required)",
        order: 4
      };
      break;
    case 0:
      voteObj = {
        status: Object.assign(Statuses.Waiting, { color: Statuses.Failed.color }),
        message: "Response Required",
        order: 3
      };
      break;
    case 5:
      voteObj = {
        status: Statuses.Success,
        message: "Approved with suggestions",
        order: 2
      };
      break;
    case 10:
      voteObj = {
        status: Statuses.Success,
        message: "Approved",
        order: 2
      };
      break;
  }
  return voteObj;
}

function getStatusFromBuild(build: Build): BuildDisplayStatus {
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

export class App extends React.Component<{}, AppState> {
  private showFilter = new ObservableValue<boolean>(false);
  private gitClient: GitRestClient;
  private buildClient: BuildRestClient;
  private userContext: IUserContext;
  private filter: IFilter;
  private searchFilter: {
    creatorId: undefined,
    includeLinks: undefined,
    repositoryId: undefined,
    reviewerId: undefined,
    sourceRefName: undefined,
    sourceRepositoryId: undefined,
    status: PullRequestStatus.Active,
    targetRefName: undefined
  };

  constructor(props) {
    super(props);
    this.gitClient = API.getClient(GitRestClient);
    this.buildClient = API.getClient(BuildRestClient);
    this.filter = new Filter();
    this.state = { pullRequests: undefined, hostUrl: undefined, selectedTabId: TabType.active, activePrBadge: undefined, draftPrBadge: undefined };
  }

  componentDidMount() {
    this.initialize();
  }

  render() {
    return (<Surface background={SurfaceBackground.neutral}>
      <Page className={`flex-grow ${styles.fullHeight}`}>
        <Header title="All Repositories"
          titleSize={TitleSize.Large}
          commandBarItems={[]} />
        <TabBar selectedTabId={this.state.selectedTabId} onSelectedTabChanged={this.onSelectedTabChanged} renderAdditionalContent={this.renderTabBarCommands}>
          <Tab id={TabType.active} name="Active Pull Requests" badgeCount={this.state.activePrBadge} />
          <Tab id={TabType.drafts} name="My Drafts" badgeCount={this.state.draftPrBadge} />
        </TabBar>
        <ConditionalChildren renderChildren={this.showFilter}>
          <div className="page-content-left page-content-right page-content-top">
            <FilterBar filter={this.filter}>
              <KeywordFilterBarItem filterItemKey="keyword" />
            </FilterBar>
          </div>
        </ConditionalChildren>
        {this.renderTabContents()}
      </Page>
    </Surface>);
  }

  private async initialize() {
    await SDK.ready();
    const hostContext = SDK.getHost();
    this.userContext = SDK.getUser();
    const projectService = await SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService);
    const project = await projectService.getProject();
    if (project) {
      const builds = await this.buildClient.getBuilds(project.name, null, null, null, null, null, null, BuildReason.PullRequest);
      const pullRequests = (await this.gitClient.getPullRequestsByProject(project.name, this.searchFilter))
        .map(pr => {
          const selfWithVote = pr.reviewers.find(x => x.id === pr.createdBy.id);
          const latestBuild = builds.find(x => x.triggerInfo["pr.number"] != null && x.triggerInfo["pr.number"] === pr.pullRequestId.toString());
          return {
            id: pr.pullRequestId,
            isDraft: pr.isDraft,
            author: pr.createdBy,
            title: pr.title,
            repo: pr.repository,
            baseBranch: pr.sourceRefName.replace("refs/heads/", ""),
            targetBranch: pr.targetRefName.replace("refs/heads/", ""),
            vote: getVoteStatus(selfWithVote ? selfWithVote.vote : -1),
            buildDetails: {
              build: latestBuild,
              status: getStatusFromBuild(latestBuild)
            },
            reviewers: pr.reviewers,
            link: pr.url
          };
        });
      this.setState({
        hostUrl: `https://dev.azure.com/${hostContext.name}/${project.name}`,
        pullRequests: pullRequests,
        activePrBadge: pullRequests.filter(x => !x.isDraft).length,
        draftPrBadge: pullRequests.filter(x => x.isDraft && x.author.id === this.userContext.id).length
      });
    }
  }

  private renderTabBarCommands = () => {
    return <HeaderCommandBarWithFilter filter={this.filter} filterToggled={this.showFilter} items={[]} />;
  }

  private onSelectedTabChanged = (newTabId: string) => {
    this.setState({ selectedTabId: newTabId });
  }

  private renderTabContents() {
    if (this.state.selectedTabId === TabType.active) {
      return <section className="page-content page-content-top">
        <PullRequestTable pullRequests={
          this.state.pullRequests ? this.state.pullRequests.filter(x => !x.isDraft) : undefined
        } hostUrl={this.state.hostUrl} filter={this.filter} />
      </section>;
    } else if (this.state.selectedTabId === TabType.drafts) {
      return <section className="page-content page-content-top">
        <PullRequestTable pullRequests={
          this.state.pullRequests ? this.state.pullRequests.filter(x => x.isDraft && x.author.id === this.userContext.id) : undefined
        } hostUrl={this.state.hostUrl} filter={this.filter} />
      </section>;
    }
    return <div></div>;
  }
}