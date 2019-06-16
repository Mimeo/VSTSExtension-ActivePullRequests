import * as API from "azure-devops-extension-api";
import { Card } from "azure-devops-ui/Card";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { ColumnFill, renderSimpleCell, Table, TableColumnLayout } from "azure-devops-ui/Table";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import { PullRequestTableItem, PullRequest } from "./PullRequestTable.models";
import * as React from "react";
import { GitRestClient, GitPullRequestSearchCriteria, PullRequestStatus } from "azure-devops-extension-api/Git";

const fixedColumns = [
  {
    columnLayout: TableColumnLayout.singleLinePrefix,
    id: "author",
    name: "Author",
    readonly: true,
    renderCell: renderSimpleCell,
    width: new ObservableValue(200)
  },
  {
    id: "title",
    name: "Title",
    readonly: true,
    renderCell: renderSimpleCell,
    width: new ObservableValue(100)
  },
  {
    columnLayout: TableColumnLayout.none,
    id: "reviewers",
    name: "Reviewers",
    readonly: true,
    renderCell: renderSimpleCell,
    width: new ObservableValue(100)
  },
  ColumnFill
];

interface PullRequestTableProps {
  project: string;
}

interface PullRequestTableState {
  searchFilter: GitPullRequestSearchCriteria;
  pullRequests?: ArrayItemProvider<PullRequestTableItem>;
}

export class PullRequestTable extends React.Component<PullRequestTableProps, PullRequestTableState> {
  private gitClient: GitRestClient;

  constructor(props) {
    super(props);
    this.gitClient = API.getClient(GitRestClient);
    this.state = {
      searchFilter: {
        creatorId: undefined,
        includeLinks: undefined,
        repositoryId: undefined,
        reviewerId: undefined,
        sourceRefName: undefined,
        sourceRepositoryId: undefined,
        status: PullRequestStatus.Active,
        targetRefName: undefined
      }
    }
  }

  componentDidMount() {
    this.initialize();
  }

  private async initialize() {
    const pullRequests = await this.gitClient.getPullRequestsByProject(this.props.project, this.state.searchFilter);
    this.setState({
      pullRequests: new ArrayItemProvider<PullRequestTableItem>(pullRequests.map(pr => {
        return {
          author: pr.createdBy.displayName,
          title: pr.title,
          reviewers: { text: pr.reviewers.map(reviewer => reviewer.displayName).join(", ") }
        };
      }))
    });
  }

  render() {
    return (
      <Card className="flex-grow bolt-table-card" contentProps={{ contentPadding: false }}>
        { this.state.pullRequests && <Table columns={fixedColumns} itemProvider={this.state.pullRequests} /> }
      </Card>
    );
  }
}