const path = require("path");

module.exports = {
  entry: "./src/bootstrap.tsx",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js"
  },
  resolve: {
    extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js", ".scss"]
  },
  module: {
    rules: [
      {
          test: /\.scss$/,
          use: ["style-loader", { loader: "css-loader", options: { modules: true }}, "azure-devops-ui/buildScripts/css-variables-loader", "sass-loader"]
      },
      {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
      },
      {
          test: /\.woff$/,
          use: [{
              loader: 'base64-inline-loader'
          }]
      },
      {
          test: /\.png$/,
          use: [{
              loader: 'base64-inline-loader'
          }]
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: 'ts-loader'
      }
    ],
  }
};
