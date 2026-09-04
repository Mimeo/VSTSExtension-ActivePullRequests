const { spawnSync } = require("child_process");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const args = process.argv.slice(2);
const manifestIndex = args.indexOf("--manifest");
const shareIndex = args.indexOf("--share-with");
const manifest = manifestIndex >= 0
  ? args[manifestIndex + 1]
  : "mimeo-devops-extension.json";
const shareWith = shareIndex >= 0 ? args[shareIndex + 1] : null;
const token = process.env.AZDO_MARKETPLACE_PAT;

if (!token) {
  console.error("AZDO_MARKETPLACE_PAT is missing from .env.");
  process.exit(1);
}

if (manifestIndex >= 0 && !manifest) {
  console.error("--manifest requires a manifest path.");
  process.exit(1);
}

if (shareIndex >= 0 && !shareWith) {
  console.error("--share-with requires an Azure DevOps organization.");
  process.exit(1);
}

const tfx = process.platform === "win32" ? "tfx.cmd" : "tfx";
const tfxArgs = [
  "extension",
  "publish",
  "--manifests",
  path.resolve(manifest),
  "--token",
  token,
  "--rev-version"
];

if (shareWith) {
  tfxArgs.push("--share-with", shareWith);
}

const result = spawnSync(tfx, tfxArgs, { stdio: "inherit" });
if (result.error) {
  console.error(`Unable to start tfx: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
