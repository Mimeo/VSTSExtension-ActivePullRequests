import { TableColumnLayout, ITableColumn, TwoLineTableCell, SimpleTableCell } from "azure-devops-ui/Table";
import { PullRequestTableItem } from "./PullRequestTable.models";
import * as React from "react";
import { Tooltip } from "azure-devops-ui/TooltipEx";
import { Link } from "azure-devops-ui/Link";
import { Icon, IconSize } from "azure-devops-ui/Icon";
import { VssPersona, IIdentityDetailsProvider } from "azure-devops-ui/VssPersona";
import { Status, StatusSize } from "azure-devops-ui/Status";
import { IdentityRef } from "azure-devops-extension-api/WebApi/WebApi";

export function getColumnTemplate(hostUri: string): ITableColumn<PullRequestTableItem>[] {
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

  const renderAuthorColumn = (rowIndex: number, columnIndex: number, tableColumn: ITableColumn<PullRequestTableItem>, tableItem: PullRequestTableItem) => {
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
  };

  const renderDetailsColumn = (rowIndex: number, columnIndex: number, tableColumn: ITableColumn<PullRequestTableItem>, tableItem: PullRequestTableItem) => {
    return (
      <TwoLineTableCell
        columnIndex={columnIndex}
        tableColumn={tableColumn}
        key={"col-" + columnIndex}
        line1={
          <div className="fontWeightSemiBold font-weight-semibold fontSizeM font-size-m flex-row scroll-hidden">
            <Tooltip overflowOnly={true}>
              <Link href={`${hostUri}/_git/${tableItem.repo.name}/pullRequest/${tableItem.id}`}
                className="text-ellipsis" subtle={true}>#{tableItem.id}: {tableItem.title}</Link>
            </Tooltip>
          </div>
        } line2={
          <div className="fontSize font-size secondary-text flex-row flex-baseline text-ellipsis">
            <Link href={`${hostUri}/_git/${tableItem.repo.name}?version=GB${tableItem.baseBranch}`}
              className="monospaced-text text-ellipsis flex-row flex-baseline bolt-table-link bolt-table-inline-link" subtle={true}>
              <Icon iconName="OpenSource" />
              <Tooltip overflowOnly={true}>
                <span className="text-ellipsis">{tableItem.baseBranch}</span>
              </Tooltip>
            </Link>
            <Icon iconName="ChevronRightSmall" size={IconSize.small} />
            <Link href={`${hostUri}/_git/${tableItem.repo.name}?version=GB${tableItem.targetBranch}`}
              className="monospaced-text text-ellipsis flex-row flex-baseline bolt-table-link bolt-table-inline-link" subtle={true}>
              <Icon iconName="OpenSource" />
              <Tooltip overflowOnly={true}>
                <span className="text-ellipsis">{tableItem.targetBranch}</span>
              </Tooltip>
            </Link>
          </div>} />
    );
  };

  const renderRepositoryColumn = (rowIndex: number, columnIndex: number, tableColumn: ITableColumn<PullRequestTableItem>, tableItem: PullRequestTableItem) => {
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
  };

  const renderMyVoteColumn = (rowIndex: number, columnIndex: number, tableColumn: ITableColumn<PullRequestTableItem>, tableItem: PullRequestTableItem) => {
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
  };

  const renderReviewersColumn = (rowIndex: number, columnIndex: number, tableColumn: ITableColumn<PullRequestTableItem>, tableItem: PullRequestTableItem) => {
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
  };

  return [
    {
      columnLayout: TableColumnLayout.singleLinePrefix,
      id: "author",
      name: "Author",
      readonly: true,
      renderCell: renderAuthorColumn,
      width: 200
    },
    {
      columnLayout: TableColumnLayout.twoLine,
      id: "details",
      name: "Details",
      readonly: true,
      renderCell: renderDetailsColumn,
      width: -50
    },
    {
      id: "repository",
      name: "Repository",
      readonly: true,
      renderCell: renderRepositoryColumn,
      width: 200
    },
    {
      columnLayout: TableColumnLayout.singleLinePrefix,
      id: "build-status",
      name: "Build Status",
      readonly: true,
      renderCell: renderMyVoteColumn,
      width: 200
    },
    {
      columnLayout: TableColumnLayout.singleLinePrefix,
      id: "my-vote",
      name: "My Vote",
      readonly: true,
      renderCell: renderMyVoteColumn,
      width: 225
    },
    {
      columnLayout: TableColumnLayout.none,
      id: "reviewers",
      name: "Reviewers",
      readonly: true,
      renderCell: renderReviewersColumn,
      width: -33
    }
  ];
}