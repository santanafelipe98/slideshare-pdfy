// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require("path");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  experiments: {
    topLevelAwait: true,
  },
  entry: {
    backgroundScript: path.resolve(__dirname, "src", "backgroundScript.js"),
    contentScript: path.resolve(__dirname, "src", "contentScript.js"),
    popup: path.resolve(__dirname, "src", "popup.js")
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, "dist"),
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/i,
        loader: "babel-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: "asset",
      },
    ],
  },
  resolve: {
    extensions: [ '.js' ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'styles/[name].css'
    }),
    new CopyPlugin({
      patterns: [{ from: 'static' }]
    })
  ]
};
