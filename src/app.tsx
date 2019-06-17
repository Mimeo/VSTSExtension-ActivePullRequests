import { CommonServiceIds, IProjectPageService } from "azure-devops-extension-api";
import * as SDK from "azure-devops-extension-sdk";
import { Header, TitleSize } from "azure-devops-ui/Header";
import { Page } from "azure-devops-ui/Page";
import { Surface, SurfaceBackground } from "azure-devops-ui/Surface";
import * as React from "react";
import { PullRequestTable } from "./PullRequestTable/PullRequestTable";
import { IHeaderCommandBarItem } from "azure-devops-ui/HeaderCommandBar";
import { TabBar, Tab } from "azure-devops-ui/Tabs";
import { ConditionalChildren } from "azure-devops-ui/ConditionalChildren";
import { FilterBar } from "azure-devops-ui/FilterBar";
import { KeywordFilterBarItem } from "azure-devops-ui/TextFilterBarItem";

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

export class App extends React.Component<{}, { projectName: string, selectedTabId: string, showFilter: boolean }> {
  constructor(props) {
    super(props);
    this.state = { projectName: undefined, selectedTabId: "active", showFilter: false };
  }

  componentDidMount() {
    this.initialize();
  }

  render() {
    return (<Surface background={SurfaceBackground.normal}>
      <Page>
        <Header title="All Repositories"
          titleSize={TitleSize.Large}
          commandBarItems={headerCommands} />
        <TabBar selectedTabId={this.state.selectedTabId} onSelectedTabChanged={this.onSelectedTabChanged}>
          <Tab id="active" name="Active Pull Requests" />
          <Tab id="drafts" name="My Drafts" />
        </TabBar>
        <ConditionalChildren renderChildren={this.state.showFilter}>
          <div className="page-content-left page-content-right page-content-top">
            <FilterBar>
              <KeywordFilterBarItem filterItemKey="keyword" />
            </FilterBar>
          </div>
        </ConditionalChildren>
        <section className="page-content page-content-top">
          {this.state.projectName && <PullRequestTable project={this.state.projectName} />}
        </section>
      </Page>
    </Surface>);
  }

  private async initialize() {
    await SDK.ready();
    const projectService = await SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService);
    const project = await projectService.getProject();
    if (project) {
      console.log(project);
      this.setState({ projectName: project.name });
    }
  }

  private onSelectedTabChanged = (newTabId: string) => {
    this.setState({ selectedTabId: newTabId });
  }
}