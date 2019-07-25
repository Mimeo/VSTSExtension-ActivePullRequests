import * as React from "react";
import { Panel } from "azure-devops-ui/Panel";
import { Toggle } from "azure-devops-ui/Toggle";
import { SettingsPanelProps, ISettingsPanelState, SettingsColumn } from "./SettingsPanel.models";
import * as styles from "./SettingsPanel.scss";

export default class SettingsPanel extends React.Component<SettingsPanelProps, ISettingsPanelState> {
  constructor(props: SettingsPanelProps) {
    super(props);
    this.state = { 
      dataManager: props.dataManager,
      settings: props.settings,
      projectName: props.projectName
    };
  }

  public render(): JSX.Element {
    return (
      <div>
        <Panel
          onDismiss={() => this.props.closeSettings()}
          titleProps={{ text: "Extension Settings" }}
          description={"Modify settings for the All Active Pull Requests extension. Settings only affect your user account for this project."}
          footerButtonProps={[
              { text: "Save Changes", primary: true, onClick: () => this.saveSettings(), className:`${styles.panelPrimaryButton}` },
              { text: "Cancel", onClick: () => this.props.closeSettings() }
          ]}
          >
          <div className="flex-grow rhythm-vertical-8">
            <div className="flex-column">
              <div className={`font-size-l font-weight-semibold flex-noshrink flex-grow ${styles.settingTitle}`}>Column Display</div>
                <div className="body-m secondary-text">
                  Toggle display of pull request table columns
                </div>
            </div>
                    
            <div className={`flex-row ${styles.settingItem}`}>
              <div className="font-size-mm font-weight-semibold flex-noshrink flex-grow">Author</div>
              <Toggle
                offText={"Hide"}
                onText={"Show"}
                checked={this.state.settings.AuthorColumnEnabled}
                onChange={(event, value) => { this.updateSetting(value, SettingsColumn.author);}}
                />
            </div>

            <div className={`flex-row ${styles.settingItem}`}>
              <div className="font-size-mm font-weight-semibold flex-noshrink flex-grow">Created</div>
              <Toggle
                offText={"Hide"}
                onText={"Show"}
                checked={this.state.settings.CreatedColumnEnabled}
                onChange={(event, value) => { this.updateSetting(value, SettingsColumn.created);}}
                />
            </div>

            <div className={`flex-row ${styles.settingItem}`}>
              <div className="font-size-mm font-weight-semibold flex-noshrink flex-grow">Details</div>
              <Toggle
                offText={"Hide"}
                onText={"Show"}
                checked={this.state.settings.DetailsColumnEnabled}
                onChange={(event, value) => { this.updateSetting(value, SettingsColumn.details);}}
                />
            </div>

            <div className={`flex-row ${styles.settingItem}`}>
              <div className="font-size-mm font-weight-semibold flex-noshrink flex-grow">Repository</div>
              <Toggle
                offText={"Hide"}
                onText={"Show"}
                checked={this.state.settings.RepositoryColumnEnabled}
                onChange={(event, value) => { this.updateSetting(value, SettingsColumn.repository);}}
                />
            </div>

            <div className={`flex-row ${styles.settingItem}`}>
                <div className="font-size-mm font-weight-semibold flex-noshrink flex-grow">Comments</div>
                <Toggle
                  offText={"Hide"}
                  onText={"Show"}
                  checked={this.state.settings.CommentsColumnEnabled}
                  onChange={(event, value) => { this.updateSetting(value, SettingsColumn.comments);}}
                  />
            </div>

            <div className={`flex-row ${styles.settingItem}`}>
                <div className="font-size-mm font-weight-semibold flex-noshrink flex-grow">Build Status</div>
                <Toggle
                  offText={"Hide"}
                  onText={"Show"}
                  checked={this.state.settings.BuildStatusColumnEnabled}
                  onChange={(event, value) => { this.updateSetting(value, SettingsColumn.buildStatus);}}
                  />
            </div>

            <div className={`flex-row ${styles.settingItem}`}>
                <div className="font-size-mm font-weight-semibold flex-noshrink flex-grow">My Vote</div>
                <Toggle
                  offText={"Hide"}
                  onText={"Show"}
                  checked={this.state.settings.MyVoteColumnEnabled}
                  onChange={(event, value) => { this.updateSetting(value, SettingsColumn.myVote);}}
                  />
            </div>

            <div className={`flex-row ${styles.settingItem}`}>
                <div className="font-size-mm font-weight-semibold flex-noshrink flex-grow">Reviewers</div>
                <Toggle
                  offText={"Hide"}
                  onText={"Show"}
                  checked={this.state.settings.ReviewersColumnEnabled}
                  onChange={(event, value) => { this.updateSetting(value, SettingsColumn.reviewers);}}
                  />
            </div>
          </div>
        </Panel>
      </div>
    );
  }

  private updateSetting(value: boolean, name: SettingsColumn) {
    var settings = this.state.settings;
    settings[name] = value;

    this.setState({
      settings: settings
    });
  }

  private saveSettings() {
    this.state.dataManager!.setValue<string>(`${this.state.projectName}-extension-settings`, JSON.stringify(this.state.settings) || "", { scopeType: "User" }).then(() => {
      window.location.reload()
    });
  }
}