import { TableColumnLayout, ITableColumn, TwoLineTableCell, SimpleTableCell } from "azure-devops-ui/Table";
import { PullRequestTableItem } from "./PullRequestTable.models";
import * as React from "react";
import { Ago } from "azure-devops-ui/Ago";
import { AgoFormat } from "azure-devops-ui/Utilities/Date";
import { Tooltip } from "azure-devops-ui/TooltipEx";
import { Link } from "azure-devops-ui/Link";
import { Icon, IconSize } from "azure-devops-ui/Icon";
import { VssPersona, IIdentityDetailsProvider } from "azure-devops-ui/VssPersona";
import { Status, StatusSize } from "azure-devops-ui/Status";
import { IdentityRef } from "azure-devops-extension-api/WebApi/WebApi";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { getVoteStatus, getCommentStatus } from "./PullRequestTable.helpers";
import * as styles from "./PullRequestTable.columns.scss";
import { Settings } from "../SettingsPanel/SettingsPanel.models";

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

export function getColumnTemplate(hostUri: string, settings: Settings): ITableColumn<PullRequestTableItem>[] {
  if(!settings) {
    settings = {
      AuthorColumnEnabled: true,
      BuildStatusColumnEnabled: true,
      CommentsColumnEnabled: true,
      CreatedColumnEnabled: true,
      DetailsColumnEnabled: true,
      MyVoteColumnEnabled: true,
      RepositoryColumnEnabled: true,
      ReviewersColumnEnabled: true
    }
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

  const renderCreationDateColumn = (rowIndex: number, columnIndex: number, tableColumn: ITableColumn<PullRequestTableItem>, tableItem: PullRequestTableItem) => {
    return (
      <SimpleTableCell
        columnIndex={columnIndex}
        tableColumn={tableColumn}
        key={"col-" + columnIndex}
        contentClassName="fontWeightSemiBold font-weight-semibold fontSizeM font-size-m scroll-hidden">
        <div className="flex-row scroll-hidden">
          <Tooltip overflowOnly={true}>
            <span className="text-ellipsis"><Ago date={tableItem.creationDate} format={AgoFormat.Compact} /></span>
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

  const renderCommentStatusColumn = (rowIndex: number, columnIndex: number, tableColumn: ITableColumn<PullRequestTableItem>, tableItem: PullRequestTableItem) => {
    if (tableItem.totalComments == 0) {
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
        <Status {...getCommentStatus(tableItem.totalComments, tableItem.inactiveComments).icon} size={StatusSize.m} className="icon-margin" />
        <div className="flex-row scroll-hidden">
          <Tooltip overflowOnly={true}>
            <span className="text-ellipsis">{getCommentStatus(tableItem.totalComments, tableItem.inactiveComments).message}</span>
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
  
  let columns = [];

  if(settings.AuthorColumnEnabled) {
    columns.push({
      columnLayout: TableColumnLayout.singleLinePrefix,
      id: "author",
      name: "Author",
      readonly: true,
      renderCell: renderAuthorColumn,
      onSize: onSize,
      width: new ObservableValue(-25),
      minWidth: 56
    });
  }
    
  if(settings.CreatedColumnEnabled) {
    columns.push({
      columnLayout: TableColumnLayout.singleLinePrefix,
      id: "creationDate",
      name: "Created",
      readonly: true,
      renderCell: renderCreationDateColumn,
      onSize: onSize,
      width: new ObservableValue(130),
      minWidth: 130
    });
  }
  
  if(settings.DetailsColumnEnabled) {
    columns.push({
      columnLayout: TableColumnLayout.twoLine,
      id: "details",
      name: "Details",
      readonly: true,
      renderCell: renderDetailsColumn,
      onSize: onSize,
      width: new ObservableValue(-50),
      minWidth: 150
    });
  }
  
  if(settings.RepositoryColumnEnabled) {
    columns.push({
      id: "repository",
      name: "Repository",
      readonly: true,
      renderCell: renderRepositoryColumn,
      onSize: onSize,
      width: new ObservableValue(-25),
      minWidth: 75
    });
  }

  if(settings.CommentsColumnEnabled) {
    columns.push({
      columnLayout: TableColumnLayout.singleLinePrefix,
      id: "comment-status",
      name: "Comments",
      readonly: true,
      renderCell: renderCommentStatusColumn,
      onSize: onSize,
      width: new ObservableValue(100),
      minWidth: 100
    });
  }

  if(settings.BuildStatusColumnEnabled) {
    columns.push({
      columnLayout: TableColumnLayout.singleLinePrefix,
      id: "build-status",
      name: "Build Status",
      readonly: true,
      renderCell: renderBuildStatusColumn,
      onSize: onSize,
      width: new ObservableValue(-25),
      minWidth: 150
    });
  }

  if(settings.MyVoteColumnEnabled) {
    columns.push({
        columnLayout: TableColumnLayout.singleLinePrefix,
        id: "my-vote",
        name: "My Vote",
        readonly: true,
        renderCell: renderMyVoteColumn,
        onSize: onSize,
        width: new ObservableValue(-25),
        minWidth: 150
    });
  }

  if(settings.ReviewersColumnEnabled) {
    columns.push({
      columnLayout: TableColumnLayout.none,
      id: "reviewers",
      name: "Reviewers",
      readonly: true,
      renderCell: renderReviewersColumn,
      width: new ObservableValue(-33),
      minWidth: 150
    });
  }

  function onSize(event: MouseEvent, index: number, width: number) {
    (columns[index].width as ObservableValue<number>).value = width;
  }

  return columns;
}