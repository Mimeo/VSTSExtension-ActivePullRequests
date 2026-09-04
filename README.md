![Pull Request](/static/images/pullRequest.png)
# VSTSExtension-ActivePullRequests

An Azure DevOps extension to view all active pull requests across all repositories for a team project.

![Screenshot](/static/images/Screenshot.png)

## Compiling

This extension can be compiled by running `npm run build`. This will automatically compile the TypeScript, increment the extension's version number, and package it up.

## Publishing

The build uses the Microsoft TFS Cross Platform CLI (`tfx-cli`) to create the VSIX. Install dependencies, then run:

```powershell
npm install
npm run build
```

Create an Azure DevOps PAT with Marketplace **Publish** scope. You can authenticate once from PowerShell, keeping the token in an environment variable rather than committing it or putting it directly in shell history:

```powershell
$env:AZDO_MARKETPLACE_PAT = "<your PAT>"
npx tfx login --service-url https://marketplace.visualstudio.com/ --token $env:AZDO_MARKETPLACE_PAT
```

For repeatable local publishing, copy `.env.example` to `.env` and set `AZDO_MARKETPLACE_PAT`. `.env` is ignored by Git. The publish script loads that file automatically:

```powershell
Copy-Item .env.example .env
# Edit .env and replace the placeholder PAT
npm run gallery-publish
```

Publish the extension from the repository root:

```powershell
npm run gallery-publish
```

To publish the private test extension, specify its manifest and the organization to share it with:

```powershell
npm run gallery-publish -- --manifest mimeo-devops-extension-test.json --share-with your-test-organization
```

The manifest publisher is `mimeo-vs-marketplace` and the extension ID is `mimeo-active-pull-requests`. The publisher account and release history are managed at the [Visual Studio Marketplace publisher portal](https://marketplace.visualstudio.com/manage/publishers/mimeo-vs-marketplace/extensions/mimeo-active-pull-requests/hub).

## Contribute
Check out the [contribution guidelines](CONTRIBUTING.md) if you want to contribute to this project.

## License
[MIT](LICENSE)

### Credits
Icon - pull request by Richard Slater from the Noun Project [Richard Slater](https://thenounproject.com/term/pull-request/116189/)
