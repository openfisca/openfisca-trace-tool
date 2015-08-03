var webpack = require("webpack")
var WebpackDevServer = require("webpack-dev-server")

var config = require("./webpack.config")


const PORT = process.env.npm_package_config_port


new WebpackDevServer(webpack(config), {
  historyApiFallback: true,
  hot: true,
  stats: {colors: true},
}).listen(PORT, "localhost", function(err/*, result*/) {
  if (err) {
    console.log(err)
  }

  console.log(`Listening at http://localhost:${PORT}`)
})
