import "es6-promise/auto";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as SDK from "azure-devops-extension-sdk";
import { App } from "./app";

SDK.init();
SDK.ready().then(_ => ReactDOM.render(<App />, document.getElementById("root")));