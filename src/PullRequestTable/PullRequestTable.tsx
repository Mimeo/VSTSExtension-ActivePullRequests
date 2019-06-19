import { Card } from "azure-devops-ui/Card";
import { ObservableArray, ObservableValue } from "azure-devops-ui/Core/Observable";
import { Table } from "azure-devops-ui/Table";
import { ZeroData, ZeroDataActionType } from "azure-devops-ui/ZeroData";
import * as React from "react";
import * as zeroImage from "./../../static/images/pullRequest.png";
import { getColumnTemplate as getColumns } from "./PullRequestTable.columns";
import { PullRequestTableItem, PullRequestTableProps, PullRequestTableState } from "./PullRequestTable.models";

export class PullRequestTable extends React.Component<PullRequestTableProps, PullRequestTableState> {
  constructor(props: PullRequestTableProps) {
    super(props);
    this.state = { pullRequestProvider: new ObservableArray<PullRequestTableItem | ObservableValue<PullRequestTableItem | undefined>>(
      this.filterItems(this.props.pullRequests) || new Array(5).fill(new ObservableValue<PullRequestTableItem | undefined>(undefined))
    )};
  }

  componentDidUpdate(prevProps: PullRequestTableProps, prevState: PullRequestTableState) {
    if (prevProps !== this.props && ((prevState.pullRequestProvider.value !== this.props.pullRequests && this.props.pullRequests !== undefined)
      || prevProps.filter.getState() !== this.props.filter.getState())) {
      console.log(this.props.filter.getState());
      this.setState({
        pullRequestProvider: new ObservableArray<PullRequestTableItem | ObservableValue<PullRequestTableItem | undefined>>(
          this.filterItems(this.props.pullRequests) || new Array(5).fill(new ObservableValue<PullRequestTableItem | undefined>(undefined))
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
        <Table columns={getColumns(this.props.hostUrl)} itemProvider={this.state.pullRequestProvider} role="table" />
      </Card>
    );
  }

  private filterItems(prs: PullRequestTableItem[]) {
    if (prs == null) { return prs; }
    const nullSafe = (obj, key) => obj[key] ? obj[key].value : "";
    const filterState = this.props.filter.getState();
    return prs.filter(x => x.title.includes(nullSafe(filterState, "keyword")) || x.author.displayName.includes(nullSafe(filterState, "keyword")));
  }
}