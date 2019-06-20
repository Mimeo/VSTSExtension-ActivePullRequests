import { Card } from "azure-devops-ui/Card";
import { ObservableArray, ObservableValue } from "azure-devops-ui/Core/Observable";
import { Table } from "azure-devops-ui/Table";
import { ZeroData, ZeroDataActionType } from "azure-devops-ui/ZeroData";
import * as React from "react";
import * as zeroImage from "./../../static/images/pullRequest.png";
import { getColumnTemplate as getColumns } from "./PullRequestTable.columns";
import { PullRequestTableItem, PullRequestTableProps, PullRequestTableState } from "./PullRequestTable.models";

function areArraysEqual(arr1: any[], arr2: any[]): boolean {
  if (arr1 == null || arr2 == null) { return false; }
  if (arr1.length !== arr2.length) { return false; }
  for (let i = arr1.length; i--;) {
    if (arr1[i] !== arr2[i]) { return false; }
  }
  return true;
}

export class PullRequestTable extends React.Component<PullRequestTableProps, PullRequestTableState> {
  constructor(props: PullRequestTableProps) {
    super(props);
    this.state = {
      columns: getColumns(this.props.hostUrl),
      filteredPrs: [],
      pullRequestProvider: new ObservableArray<ObservableValue<PullRequestTableItem>>(
        this.filterItems(this.props.pullRequests) || new Array(5).fill(new ObservableValue<PullRequestTableItem>(undefined))
      )
    };
  }

  componentDidUpdate(prevProps: PullRequestTableProps, prevState: PullRequestTableState) {
    if (prevProps.hostUrl == null && this.props.hostUrl != null) {
      this.setState({ columns: getColumns(this.props.hostUrl) });
    }
    if (!areArraysEqual(prevProps.pullRequests, this.props.pullRequests) || prevProps.filter !== this.props.filter) {
      this.setState({
        pullRequestProvider: new ObservableArray<ObservableValue<PullRequestTableItem>>(
          this.filterItems(this.props.pullRequests) || new Array(5).fill(new ObservableValue<PullRequestTableItem>(undefined))
        )
      });
    }
  }

  render() {
    if (this.state.pullRequestProvider.length === 0) {
      return <ZeroData
        primaryText="No pull requests"
        secondaryText={
          <span>No pull requests could be found.</span>
        }
        imageAltText="Bars"
        imagePath={zeroImage}
        actionText="Refresh"
        actionType={ZeroDataActionType.ctaButton}
        onActionClick={(event, item) =>
          window.location.reload()
        } />;
    }
    return (
      <Card className="flex-grow bolt-table-card" contentProps={{ contentPadding: false }}>
        <Table columns={this.state.columns} itemProvider={this.state.pullRequestProvider} role="table" />
      </Card>
    );
  }

  private nullSafeOrDefault = (obj, key, def: any = "") => obj[key] ? obj[key].value : def;
  private filterItems(prs: PullRequestTableItem[]): ObservableValue<PullRequestTableItem>[] {
    if (prs == null) { return undefined; }
    const filteredPrs = prs.filter(x => this.filterKeyword(x) && this.filterRepository(x));
    this.setState({ filteredPrs: filteredPrs });
    return filteredPrs.map(x => new ObservableValue(x));
  }
  private filterKeyword(pr: PullRequestTableItem) {
    return pr.title.toLowerCase().includes(this.nullSafeOrDefault(this.props.filter, "keyword").toLowerCase()) ||
      pr.author.displayName.toLowerCase().includes(this.nullSafeOrDefault(this.props.filter, "keyword").toLowerCase());
  }
  private filterRepository(pr: PullRequestTableItem) {
    const selectedRepos: string[] = this.nullSafeOrDefault(this.props.filter, "repo", []);
    return selectedRepos.length > 0 ? selectedRepos.includes(pr.repo.id) : true;
  }
}