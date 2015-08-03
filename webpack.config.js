var path = require("path")

var ErrorNotificationPlugin = require("webpack-error-notification")
var HtmlPlugin = require("html-webpack-plugin")
var webpack = require("webpack")


const PORT = process.env.npm_package_config_port


module.exports = {
  devtool: "eval",
  entry: [
    `webpack-dev-server/client?http://localhost:${PORT}`,
    "webpack/hot/only-dev-server",
    "./src/index",
  ],
  output: {
    filename: "bundle-[hash].js",
    path: __dirname,
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.ProgressPlugin((percentage, message) => {
      const MOVE_LEFT = new Buffer("1b5b3130303044", "hex").toString()
      const CLEAR_LINE = new Buffer("1b5b304b", "hex").toString()
      process.stdout.write(`${CLEAR_LINE}${Math.round(percentage * 100)}%: ${message}${MOVE_LEFT}`)
    }),
    new ErrorNotificationPlugin(process.platform === "linux" && function(msg) {
      if (!this.lastBuildSucceeded) {
        require("child_process").exec("notify-send --hint=int:transient:1 Webpack " + msg)
      }
    }),
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("development"),
      },
    }),
    new HtmlPlugin({
      inject: true,
      template: path.join(__dirname, "index_tmpl.html"),
    }),
    new webpack.ProvidePlugin({
      React: "react", // For babel JSX transformation which generates React.createElement.
    }),
  ],
  resolve: {
    extensions: ["", ".js", ".jsx"],
  },
  module: {
    loaders: [
      {
        exclude: /node_modules/,
        loaders: ["react-hot", "babel"],
        test: /\.(js|jsx)$/,
      },
    ],
  },
}
