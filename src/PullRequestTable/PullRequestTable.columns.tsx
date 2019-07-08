import { TableColumnLayout, ITableColumn, TwoLineTableCell, SimpleTableCell } from "azure-devops-ui/Table";
import { PullRequestTableItem } from "./PullRequestTable.models";
import * as React from "react";
import { Tooltip } from "azure-devops-ui/TooltipEx";
import { Link } from "azure-devops-ui/Link";
import { Icon, IconSize } from "azure-devops-ui/Icon";
import { VssPersona, IIdentityDetailsProvider } from "azure-devops-ui/VssPersona";
import { Status, StatusSize } from "azure-devops-ui/Status";
import { IdentityRef } from "azure-devops-extension-api/WebApi/WebApi";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { getVoteStatus } from "./PullRequestTable.helpers";
import * as styles from "./PullRequestTable.columns.scss";

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

export function getColumnTemplate(hostUri: string): ITableColumn<PullRequestTableItem>[] {
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
    const repoUri = `${hostUri}/_git/${encodeURIComponent(tableItem.repo.name)}`;
    return (
      <TwoLineTableCell
        columnIndex={columnIndex}
        tableColumn={tableColumn}
        key={"col-" + columnIndex}
        line1={
          <div className="fontWeightSemiBold font-weight-semibold fontSizeM font-size-m flex-row scroll-hidden">
            <Tooltip overflowOnly={true}>
              <Link href={`${repoUri}/pullRequest/${encodeURIComponent(tableItem.id)}`}
                className="text-ellipsis" subtle={true} target="_top">#{tableItem.id}: {tableItem.title}</Link>
            </Tooltip>
          </div>
        } line2={
          <div className="fontSize font-size secondary-text flex-row flex-baseline text-ellipsis">
            <Link href={`${repoUri}?version=GB${encodeURIComponent(tableItem.baseBranch)}`}
              className="monospaced-text text-ellipsis flex-row flex-center bolt-table-link bolt-table-inline-link" subtle={true} target="_top">
              <Icon iconName="OpenSource" />
              <Tooltip overflowOnly={true}>
                <span className="text-ellipsis">{tableItem.baseBranch}</span>
              </Tooltip>
            </Link>
            <Icon iconName="ChevronRightSmall" size={IconSize.small} />
            <Link href={`${repoUri}?version=GB${encodeURIComponent(tableItem.targetBranch)}`}
              className="monospaced-text text-ellipsis flex-row flex-center bolt-table-link bolt-table-inline-link" subtle={true} target="_top">
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

  const renderBuildStatusColumn = (rowIndex: number, columnIndex: number, tableColumn: ITableColumn<PullRequestTableItem>, tableItem: PullRequestTableItem) => {
    if (tableItem.buildDetails.build == null) {
      return (
        <SimpleTableCell
          columnIndex={columnIndex}
          tableColumn={tableColumn}
          key={"col-" + columnIndex}>
        </SimpleTableCell>
      );
    }
    return (
      <SimpleTableCell
        columnIndex={columnIndex}
        tableColumn={tableColumn}
        key={"col-" + columnIndex}>
        <Status {...tableItem.buildDetails.status.icon} size={StatusSize.m} className="icon-margin" />
        <div className="flex-row scroll-hidden">
          <Tooltip overflowOnly={true}>
            <span className="text-ellipsis">{tableItem.buildDetails.status.message}</span>
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
            <span className={`${styles.personaWithVote} icon-margin`}>
              <VssPersona identityDetailsProvider={summonPersona(reviewer)} size={"small"} />
              {Math.abs(reviewer.vote) > 1 ? (
                <span className={styles.voteIcon}><Status {...getVoteStatus(reviewer.vote).status} size={StatusSize.s} /></span>
              ) : ""}
            </span>
          )
        }
      </SimpleTableCell>
    );
  };

  let columns = [
    {
      columnLayout: TableColumnLayout.singleLinePrefix,
      id: "author",
      name: "Author",
      readonly: true,
      renderCell: renderAuthorColumn,
      onSize: onSize,
      width: new ObservableValue(-25),
      minWidth: 56
    },
    {
      columnLayout: TableColumnLayout.twoLine,
      id: "details",
      name: "Details",
      readonly: true,
      renderCell: renderDetailsColumn,
      onSize: onSize,
      width: new ObservableValue(-50),
      minWidth: 150
    },
    {
      id: "repository",
      name: "Repository",
      readonly: true,
      renderCell: renderRepositoryColumn,
      onSize: onSize,
      width: new ObservableValue(-25),
      minWidth: 75
    },
    {
      columnLayout: TableColumnLayout.singleLinePrefix,
      id: "build-status",
      name: "Build Status",
      readonly: true,
      renderCell: renderBuildStatusColumn,
      onSize: onSize,
      width: new ObservableValue(-25),
      minWidth: 150
    },
    {
      columnLayout: TableColumnLayout.singleLinePrefix,
      id: "my-vote",
      name: "My Vote",
      readonly: true,
      renderCell: renderMyVoteColumn,
      onSize: onSize,
      width: new ObservableValue(-25),
      minWidth: 150
    },
    {
      columnLayout: TableColumnLayout.none,
      id: "reviewers",
      name: "Reviewers",
      readonly: true,
      renderCell: renderReviewersColumn,
      width: new ObservableValue(-33),
      minWidth: 150
    }
  ];

  function onSize(event: MouseEvent, index: number, width: number) {
    (columns[index].width as ObservableValue<number>).value = width;
  }

  return columns;
}