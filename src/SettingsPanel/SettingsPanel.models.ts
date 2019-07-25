import { IExtensionDataManager } from "azure-devops-extension-api";

export enum SettingsColumn {
  author = "AuthorColumnEnabled",
  created = "CreatedColumnEnabled",
  details = "DetailsColumnEnabled",
  repository = "RepositoryColumnEnabled",
  comments = "CommentsColumnEnabled",
  buildStatus = "BuildStatusColumnEnabled",
  myVote = "MyVoteColumnEnabled",
  reviewers = "ReviewersColumnEnabled"
}

export interface Settings {
  AuthorColumnEnabled: boolean,
  CreatedColumnEnabled: boolean,
  DetailsColumnEnabled: boolean,
  RepositoryColumnEnabled: boolean,
  CommentsColumnEnabled: boolean,
  BuildStatusColumnEnabled: boolean,
  MyVoteColumnEnabled: boolean,
  ReviewersColumnEnabled: boolean
}

export interface ISettingsPanelState {
  dataManager: IExtensionDataManager;
  settings: Settings;
  projectName: string
}

export interface SettingsPanelProps {
  closeSettings: Function
  dataManager: IExtensionDataManager;
  settings: Settings;
  projectName: string;
}
