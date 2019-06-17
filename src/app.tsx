import * as API from "azure-devops-extension-api";
import { CommonServiceIds, IProjectPageService } from "azure-devops-extension-api";
import { GitRestClient, PullRequestStatus } from "azure-devops-extension-api/Git";
import * as SDK from "azure-devops-extension-sdk";
import { ConditionalChildren } from "azure-devops-ui/ConditionalChildren";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { FilterBar } from "azure-devops-ui/FilterBar";
import { Header, TitleSize } from "azure-devops-ui/Header";
import { HeaderCommandBarWithFilter, IHeaderCommandBarItem } from "azure-devops-ui/HeaderCommandBar";
import { Page } from "azure-devops-ui/Page";
import { Surface, SurfaceBackground } from "azure-devops-ui/Surface";
import { Tab, TabBar } from "azure-devops-ui/Tabs";
import { KeywordFilterBarItem } from "azure-devops-ui/TextFilterBarItem";
import { Filter, IFilter } from "azure-devops-ui/Utilities/Filter";
import * as React from "react";
import { PullRequestTable } from "./PullRequestTable/PullRequestTable";
import { PullRequestTableItem } from "./PullRequestTable/PullRequestTable.models";
import { IUserContext } from "azure-devops-extension-sdk";
import * as styles from "./app.scss";

enum TabType {
  active = "active",
  drafts = "drafts"
}

const headerCommands: IHeaderCommandBarItem[] = [
  {
    id: "new-pull-request",
    text: "New pull request",
    onActivate: () => {
      alert("new pr button clicked");
    },
    isPrimary: true,
    important: true
  }
];

interface AppState {
  hostUrl: string;
  pullRequests: PullRequestTableItem[];
  selectedTabId: string;
  activePrBadge: number;
  draftPrBadge: number;
}

export class App extends React.Component<{}, AppState> {
  private showFilter = new ObservableValue<boolean>(false);
  private gitClient: GitRestClient;
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
    this.filter = new Filter();
    this.state = { pullRequests: [], hostUrl: undefined, selectedTabId: TabType.active, activePrBadge: 0, draftPrBadge: 0 };
  }

  componentDidMount() {
    this.initialize();
  }

  render() {
    console.log(styles);
    return (<Surface background={SurfaceBackground.neutral}>
      <Page className={`flex-grow ${styles.fullHeight}`}>
        <Header title="All Repositories"
          titleSize={TitleSize.Large}
          commandBarItems={headerCommands} />
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
      const pullRequests = (await this.gitClient.getPullRequestsByProject(project.name, this.searchFilter))
        .map(pr => {
          return {
            id: pr.pullRequestId,
            isDraft: pr.isDraft,
            author: pr.createdBy,
            title: pr.title,
            repo: pr.repository,
            baseBranch: pr.sourceRefName.replace("refs/heads/", ""),
            targetBranch: pr.targetRefName.replace("refs/heads/", ""),
            reviewers: pr.reviewers,
            link: pr.url
          };
        });
      this.setState({ hostUrl: `https://dev.azure.com/${hostContext.name}/${project.name}`,
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
    if (this.state.pullRequests && this.state.hostUrl) {
      if (this.state.selectedTabId === TabType.active) {
        return <section className="page-content page-content-top">
          <PullRequestTable pullRequests={this.state.pullRequests.filter(x => !x.isDraft)} hostUrl={this.state.hostUrl} />
        </section>;
      } else if (this.state.selectedTabId === TabType.drafts) {
        return <section className="page-content page-content-top">
          <PullRequestTable pullRequests={this.state.pullRequests.filter(x => x.isDraft && x.author.id === this.userContext.id)} hostUrl={this.state.hostUrl} />
        </section>;
      }
    }
    return <div></div>;
  }
}