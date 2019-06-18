import { IdentityRef } from "azure-devops-extension-api/WebApi/WebApi";
import { Card } from "azure-devops-ui/Card";
import { Icon, IconSize } from "azure-devops-ui/Icon";
import { Link } from "azure-devops-ui/Link";
import { ITableColumn, SimpleTableCell, Table, TableColumnLayout, TwoLineTableCell } from "azure-devops-ui/Table";
import { Tooltip } from "azure-devops-ui/TooltipEx";
import { IIdentityDetailsProvider, VssPersona } from "azure-devops-ui/VssPersona";
import * as React from "react";
import { PullRequestTableItem, PullRequestTableProps, PullRequestTableState } from "./PullRequestTable.models";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import { ZeroData, ZeroDataActionType } from "azure-devops-ui/ZeroData";
import * as zeroImage from "./../../static/images/pullRequest.png";
import { Status, StatusSize } from "azure-devops-ui/Status";

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
  private renderDetailsColumn = (rowIndex: number, columnIndex: number, tableColumn: ITableColumn<PullRequestTableItem>, tableItem: PullRequestTableItem) => {
    return (
      <TwoLineTableCell
        columnIndex={columnIndex}
        tableColumn={tableColumn}
        key={"col-" + columnIndex}
        line1={
          <div className="fontWeightSemiBold font-weight-semibold fontSizeM font-size-m flex-row scroll-hidden">
            <Tooltip overflowOnly={true}>
              <Link href={`${this.props.hostUrl}/_git/${tableItem.repo.name}/pullRequest/${tableItem.id}`}
                className="text-ellipsis" subtle={true}>#{tableItem.id}: {tableItem.title}</Link>
            </Tooltip>
          </div>
        } line2={
          <div className="fontSize font-size secondary-text flex-row flex-baseline text-ellipsis">
            <Tooltip overflowOnly={true}>
              <Link href={`${this.props.hostUrl}/_git/${tableItem.repo.name}?version=GB${tableItem.baseBranch}`}
                className="monospaced-text text-ellipsis flex-row flex-baseline bolt-table-link bolt-table-inline-link" subtle={true}>
                <Icon iconName="OpenSource" /><span className="text-ellipsis">{tableItem.baseBranch}</span>
              </Link>
            </Tooltip>
            <Icon iconName="ChevronRightSmall" size={IconSize.small} />
            <Tooltip overflowOnly={true}>
              <Link href={`${this.props.hostUrl}/_git/${tableItem.repo.name}?version=GB${tableItem.targetBranch}`}
                className="monospaced-text text-ellipsis flex-row flex-baseline bolt-table-link bolt-table-inline-link" subtle={true}>
                <Icon iconName="OpenSource" /><span className="text-ellipsis">{tableItem.targetBranch}</span>
              </Link>
            </Tooltip>
          </div>} />
    );
  }
  private fixedColumns: ITableColumn<PullRequestTableItem>[] = [
    {
      columnLayout: TableColumnLayout.singleLinePrefix,
      id: "author",
      name: "Author",
      readonly: true,
      renderCell: this.renderAuthorColumn,
      width: 200
    },
    {
      columnLayout: TableColumnLayout.twoLine,
      id: "details",
      name: "Details",
      readonly: true,
      renderCell: this.renderDetailsColumn,
      width: -50
    },
    {
      id: "repository",
      name: "Repository",
      readonly: true,
      renderCell: this.renderRepositoryColumn,
      width: 200
    },
    {
      columnLayout: TableColumnLayout.singleLinePrefix,
      id: "my-vote",
      name: "My Vote",
      readonly: true,
      renderCell: this.renderMyVoteColumn,
      width: 225
    },
    {
      columnLayout: TableColumnLayout.none,
      id: "reviewers",
      name: "Reviewers",
      readonly: true,
      renderCell: this.renderReviewersColumn,
      width: -33
    }
  ];

  constructor(props: PullRequestTableProps) {
    super(props);
  }

  render() {
    if (this.props.pullRequests.length === 0) {
      return <ZeroData
        primaryText="No pull requests"
        secondaryText={
          <span>No pull requests could be found.</span>
        }
        imageAltText="Bars"
        imagePath={zeroImage}
        actionText="Button"
        actionType={ZeroDataActionType.ctaButton}
        onActionClick={(event, item) =>
          alert("Hey, you clicked the button for " + item!.primaryText)
        } />;
    }
    return (
      <Card className="flex-grow bolt-table-card" contentProps={{ contentPadding: false }}>
        <Table columns={this.fixedColumns} itemProvider={new ArrayItemProvider<PullRequestTableItem>(this.props.pullRequests)} role="table" />
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

  private renderRepositoryColumn(
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
        <div className="flex-row scroll-hidden">
          <Tooltip overflowOnly={true}>
            <span className="text-ellipsis">{tableItem.repo.name}</span>
          </Tooltip>
        </div>
      </SimpleTableCell>
    );
  }

  private renderMyVoteColumn(
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
        <Status {...tableItem.vote.status} size={StatusSize.m} className="icon-margin" />
        <div className="flex-row scroll-hidden">
          <Tooltip overflowOnly={true}>
            <span className="text-ellipsis">{tableItem.vote.message}</span>
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