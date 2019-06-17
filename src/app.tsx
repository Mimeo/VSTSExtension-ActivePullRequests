import { CommonServiceIds, IProjectPageService } from "azure-devops-extension-api";
import * as SDK from "azure-devops-extension-sdk";
import { Header, TitleSize } from "azure-devops-ui/Header";
import { Page } from "azure-devops-ui/Page";
import { Surface, SurfaceBackground } from "azure-devops-ui/Surface";
import * as React from "react";
import { PullRequestTable } from "./PullRequestTable/PullRequestTable";
import { IHeaderCommandBarItem } from "azure-devops-ui/HeaderCommandBar";

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

export class App extends React.Component<{}, { projectName: string }> {
  constructor(props) {
    super(props);
    this.state = { projectName: undefined };
  }

  componentDidMount() {
    this.initialize();
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

  render() {
    return (<Surface background={SurfaceBackground.normal}>
      <Page>
        <Header title="All Repositories"
          titleSize={TitleSize.Large}
          commandBarItems={headerCommands} />
        <section className="page-content page-content-top">
          {this.state.projectName && <PullRequestTable project={this.state.projectName} />}
        </section>
      </Page>
    </Surface>);
  }
}