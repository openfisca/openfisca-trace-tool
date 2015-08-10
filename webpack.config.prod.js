// Webpack config for creating the production bundle.

// Register babel to have ES6 support for the prod build.
require("babel/register")

var HtmlPlugin = require("html-webpack-plugin")
var path = require("path")
var webpack = require("webpack")

var assetsPath = path.join(__dirname, "./public")
var writeStats = require("./write-stats")


module.exports = {
  devtool: "source-map",
  entry: {
    "main": "./src/index.jsx",
  },
  output: {
    path: assetsPath,
    filename: "[name]-[chunkhash].js",
    chunkFilename: "[name]-[chunkhash].js",
    publicPath: "/",
  },
  module: {
    loaders: [
      {
        exclude: /node_modules/,
        loaders: ["babel"],
        test: /\.jsx?$/,
      },
    ],
  },
  resolve: {
    extensions: ["", ".js", ".jsx"],
  },
  progress: true,
  plugins: [
    // set global vars
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production"), // clean up some react stuff
      },
    }),
    new HtmlPlugin({
      inject: true,
      template: path.join(__dirname, "index_tmpl.html"),
    }),
    new webpack.ProvidePlugin({
      React: "react", // For babel JSX transformation which generates React.createElement.
    }),

    // optimizations
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      },
    }),

    // stats
    function() { this.plugin("done", writeStats) },
  ],
}
