import * as API from "azure-devops-extension-api";
import { GitRestClient, PullRequestStatus } from "azure-devops-extension-api/Git";
import { IdentityRef } from "azure-devops-extension-api/WebApi/WebApi";
import { Card } from "azure-devops-ui/Card";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { ColumnFill, ITableColumn, renderSimpleCell, SimpleTableCell, Table, TableColumnLayout } from "azure-devops-ui/Table";
import { Tooltip } from "azure-devops-ui/TooltipEx";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import { IIdentityDetailsProvider, VssPersona } from "azure-devops-ui/VssPersona";
import * as React from "react";
import { PullRequestTableItem, PullRequestTableProps, PullRequestTableState } from "./PullRequestTable.models";

function summonPersona(identityRef: IdentityRef): IIdentityDetailsProvider {
  return {
    getDisplayName() {
      return identityRef.displayName;
    },
    getIdentityImageUrl(size: number) {
      return identityRef._links["avatar"].href;
    }
  };
}

export class PullRequestTable extends React.Component<PullRequestTableProps, PullRequestTableState> {
  private gitClient: GitRestClient;
  private fixedColumns = [
    {
      columnLayout: TableColumnLayout.singleLinePrefix,
      id: "author",
      name: "Author",
      readonly: true,
      renderCell: this.renderAuthorColumn,
      width: new ObservableValue(200)
    },
    {
      id: "title",
      name: "Title",
      readonly: true,
      renderCell: renderSimpleCell,
      width: -33
    },
    {
      columnLayout: TableColumnLayout.none,
      id: "reviewers",
      name: "Reviewers",
      readonly: true,
      renderCell: this.renderReviewersColumn,
      width: -33
    },
    ColumnFill
  ];

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
          author: pr.createdBy,
          title: pr.title,
          reviewers: pr.reviewers
        };
      }))
    });
  }

  render() {
    return (
      <Card className="flex-grow bolt-table-card" contentProps={{ contentPadding: false }}>
        {this.state.pullRequests && <Table columns={this.fixedColumns} itemProvider={this.state.pullRequests} role="table" />}
      </Card>
    );
  }

  private renderAuthorColumn(
    rowIndex: number,
    columnIndex: number,
    tableColumn: ITableColumn<PullRequestTableItem>,
    tableItem: PullRequestTableItem
  ): JSX.Element {
    return (
      <SimpleTableCell
        columnIndex={columnIndex}
        tableColumn={tableColumn}
        key={"col-" + columnIndex}
        contentClassName="fontWeightSemiBold font-weight-semibold fontSizeM font-size-m scroll-hidden">
        <VssPersona identityDetailsProvider={summonPersona(tableItem.author)}
          className="icon-large-margin" size={"medium"} />
        <div className="flex-row scroll-hidden">
          <Tooltip overflowOnly={true}>
            <span className="text-ellipsis">{tableItem.author.displayName}</span>
          </Tooltip>
        </div>
      </SimpleTableCell>
    );
  }

  private renderReviewersColumn(
    rowIndex: number,
    columnIndex: number,
    tableColumn: ITableColumn<PullRequestTableItem>,
    tableItem: PullRequestTableItem
  ): JSX.Element {
    return (
      <SimpleTableCell
        columnIndex={columnIndex}
        tableColumn={tableColumn}
        key={"col-" + columnIndex}
        contentClassName="fontWeightSemiBold font-weight-semibold fontSizeM font-size-m scroll-hidden">
        {
          tableItem.reviewers.map(reviewer =>
            <VssPersona identityDetailsProvider={summonPersona(reviewer)} className="icon-margin" size={"small"} />)
        }
      </SimpleTableCell>
    );
  }
}