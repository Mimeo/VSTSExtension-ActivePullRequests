import * as API from "azure-devops-extension-api";
import { CommonServiceIds, IProjectPageService } from "azure-devops-extension-api";
import { BuildReason, BuildRestClient } from "azure-devops-extension-api/Build";
import { GitRestClient, PullRequestStatus } from "azure-devops-extension-api/Git";
import * as SDK from "azure-devops-extension-sdk";
import { IUserContext } from "azure-devops-extension-sdk";
import { ConditionalChildren } from "azure-devops-ui/ConditionalChildren";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { DropdownFilterBarItem } from "azure-devops-ui/Dropdown";
import { FilterBar } from "azure-devops-ui/FilterBar";
import { Header, TitleSize } from "azure-devops-ui/Header";
import { HeaderCommandBarWithFilter } from "azure-devops-ui/HeaderCommandBar";
import { Page } from "azure-devops-ui/Page";
import { Surface, SurfaceBackground } from "azure-devops-ui/Surface";
import { Tab, TabBar } from "azure-devops-ui/Tabs";
import { KeywordFilterBarItem } from "azure-devops-ui/TextFilterBarItem";
import { Filter, FILTER_CHANGE_EVENT, IFilter } from "azure-devops-ui/Utilities/Filter";
import * as React from "react";
import { AppState } from "./app.models";
import * as styles from "./app.scss";
import { PullRequestTable } from "./PullRequestTable/PullRequestTable";
import { getStatusFromBuild, getVoteStatus } from "./PullRequestTable/PullRequestTable.helpers";
import { DropdownMultiSelection } from "azure-devops-ui/Utilities/DropdownSelection";
import { PullRequestTableItem } from "./PullRequestTable/PullRequestTable.models";

enum TabType {
  active = "active",
  drafts = "drafts"
}

export class App extends React.Component<{}, AppState> {
  private showFilter = new ObservableValue<boolean>(false);
  private gitClient: GitRestClient;
  private buildClient: BuildRestClient;
  private userContext: IUserContext;
  private filter: IFilter;
  private repoFilterSelection = new DropdownMultiSelection();
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
    this.state = { filter: {}, repositories: [], pullRequests: undefined, hostUrl: undefined, selectedTabId: TabType.active, activePrBadge: undefined, draftPrBadge: undefined };
    this.filter.subscribe(() => this.setState({ filter: this.filter.getState() }), FILTER_CHANGE_EVENT);
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
              <DropdownFilterBarItem
                filterItemKey="repo"
                filter={this.filter}
                items={this.state.repositories.map(repo => {
                  return {
                    id: repo.id,
                    text: repo.name
                  };
                })}
                selection={this.repoFilterSelection}
                placeholder="Repositories" />
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
          const currentUserReview = pr.reviewers.find(x => x.id === this.userContext.id);
          const latestBuild = builds.find(x => x.triggerInfo["pr.number"] != null && x.triggerInfo["pr.number"] === pr.pullRequestId.toString());
          return {
            id: pr.pullRequestId,
            isDraft: pr.isDraft,
            author: pr.createdBy,
            title: pr.title,
            repo: pr.repository,
            baseBranch: pr.sourceRefName.replace("refs/heads/", ""),
            targetBranch: pr.targetRefName.replace("refs/heads/", ""),
            vote: getVoteStatus(currentUserReview ? currentUserReview.vote : -1),
            buildDetails: {
              build: latestBuild,
              status: getStatusFromBuild(latestBuild)
            },
            reviewers: pr.reviewers,
            link: pr.url
          };
        });
      this.setState({
        hostUrl: `https://dev.azure.com/${encodeURIComponent(hostContext.name)}/${encodeURIComponent(project.name)}`,
        pullRequests: pullRequests.sort(this.defaultSortPrs),
        activePrBadge: pullRequests.filter(x => !x.isDraft).length,
        draftPrBadge: pullRequests.filter(x => x.isDraft && x.author.id === this.userContext.id).length
      });
      const repos = await this.gitClient.getRepositories(project.name);
      this.setState({ repositories: repos });
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
        } hostUrl={this.state.hostUrl} filter={this.state.filter} />
      </section>;
    } else if (this.state.selectedTabId === TabType.drafts) {
      return <section className="page-content page-content-top">
        <PullRequestTable pullRequests={
          this.state.pullRequests ? this.state.pullRequests.filter(x => x.isDraft && x.author.id === this.userContext.id) : undefined
        } hostUrl={this.state.hostUrl} filter={this.state.filter} />
      </section>;
    }
    return <div></div>;
  }

  private defaultSortPrs(a: PullRequestTableItem, b: PullRequestTableItem) {
    if (a.id > b.id) {
        return 1;
    } else if (a.id < b.id) {
        return -1;
    }
    return 0;
  }
}