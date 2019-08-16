import * as API from "azure-devops-extension-api";
import { CommonServiceIds, IProjectPageService, IExtensionDataManager, IExtensionDataService } from "azure-devops-extension-api";
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
import SettingsPanel from "./SettingsPanel/SettingsPanel";
import { Settings } from "./SettingsPanel/SettingsPanel.models";

enum TabType {
  active = "active",
  drafts = "drafts"
}

export class App extends React.Component<{}, AppState> {
  private showFilter = new ObservableValue<boolean>(false);
  private projectName: string;
  private isReady: boolean = false;
  private dataManager: IExtensionDataManager;
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
    this.state = { showSettings: false, filter: {}, repositories: [], pullRequests: undefined, hostUrl: undefined, selectedTabId: TabType.active, activePrBadge: undefined, draftPrBadge: undefined, settings: undefined };
    this.filter.subscribe(() => this.setState({ filter: this.filter.getState() }), FILTER_CHANGE_EVENT);
  }

  componentDidMount() {
    this.initialize();
  }

  closeSettings = () => {
    this.setState({ showSettings: false});
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
        <ConditionalChildren renderChildren={this.state.showSettings}>
          <SettingsPanel settings={this.state.settings} dataManager={this.dataManager} closeSettings={this.closeSettings} projectName={this.projectName} />
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
    this.projectName = project.name;
    const accessToken = await SDK.getAccessToken();
    const extDataService = await SDK.getService<IExtensionDataService>(CommonServiceIds.ExtensionDataService);
    this.dataManager = await extDataService.getExtensionDataManager(SDK.getExtensionContext().id, accessToken);
    const settings = await this.getCurrentSettings(this.projectName);
    
    if (project) {
      const builds = await this.buildClient.getBuilds(project.name, null, null, null, null, null, null, BuildReason.PullRequest);
      let pullRequests = (await this.gitClient.getPullRequestsByProject(project.name, this.searchFilter))
        .map(pr => {
          const currentUserReview = pr.reviewers.find(x => x.id === this.userContext.id);
          const latestBuild = builds.find(x => x.triggerInfo["pr.number"] != null && x.triggerInfo["pr.number"] === pr.pullRequestId.toString());
          return {
            id: pr.pullRequestId,
            repoId: pr.repository.id,
            isDraft: pr.isDraft,
            author: pr.createdBy,
            creationDate: pr.creationDate,
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
            link: pr.url,
            totalComments: 0,
            inactiveComments: 0
          };
        });
      
      pullRequests = await Promise.all(pullRequests.map(async pr => {
        const threads = await this.gitClient.getThreads(pr.repoId, pr.id);
        threads.forEach((thread) => {
          if (!thread.isDeleted) {
            const threadStatus = JSON.stringify(thread.status);
            if (threadStatus) {
              pr.totalComments++;
              // thread status of 1 is 'active'
              if (threadStatus !== "1" && threadStatus !== "6") {
                pr.inactiveComments++;
              }
            }
          }
        });
        return pr;
      }));

      this.setState({
        hostUrl: `https://dev.azure.com/${encodeURIComponent(hostContext.name)}/${encodeURIComponent(project.name)}`,
        pullRequests: pullRequests.sort(this.defaultSortPrs),
        activePrBadge: pullRequests.filter(x => !x.isDraft).length,
        draftPrBadge: pullRequests.filter(x => x.isDraft && x.author.id === this.userContext.id).length,
        settings: settings
      });
      const repos = await this.gitClient.getRepositories(project.name);
      this.setState({ repositories: repos });
    }

    this.isReady = true;
  }

  private async getCurrentSettings(projectName: string): Promise<Settings> {
    var settingsResult = await this.dataManager.getValue<string>(`${projectName}-extension-settings`, { scopeType: "User" });
    if(settingsResult && settingsResult !== "") {
      return JSON.parse(settingsResult);
    }
    
    // Default settings
    return {
      AuthorColumnEnabled: true,
      BuildStatusColumnEnabled: true,
      CommentsColumnEnabled: true,
      CreatedColumnEnabled: true,
      DetailsColumnEnabled: true,
      MyVoteColumnEnabled: true,
      RepositoryColumnEnabled: true,
      ReviewersColumnEnabled: true
    };
  }

  private renderTabBarCommands = () => {
    return <HeaderCommandBarWithFilter  filter={this.filter} filterToggled={this.showFilter} items={[
      {
        subtle: true,
        id: "settings",
        onActivate: () => {
          if(this.isReady) {
            this.setState({ showSettings: true});
          }
        },
        tooltipProps: { text: "Extension Settings" },
        disabled: false,
        iconProps: {
          iconName: "Settings"
        }
    },
    ]} />;
  }

  private onSelectedTabChanged = (newTabId: string) => {
    if(this.isReady) {
      this.setState({ selectedTabId: newTabId });
    }
  }

  private renderTabContents() {
    if (this.state.selectedTabId === TabType.active) {
      return <section className="page-content page-content-top">
        <PullRequestTable pullRequests={
          this.state.pullRequests ? this.state.pullRequests.filter(x => !x.isDraft) : undefined
        } hostUrl={this.state.hostUrl} filter={this.state.filter} settings={this.state.settings} />
      </section>;
    } else if (this.state.selectedTabId === TabType.drafts) {
      return <section className="page-content page-content-top">
        <PullRequestTable pullRequests={
          this.state.pullRequests ? this.state.pullRequests.filter(x => x.isDraft && x.author.id === this.userContext.id) : undefined
        } hostUrl={this.state.hostUrl} filter={this.state.filter} settings={this.state.settings} />
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