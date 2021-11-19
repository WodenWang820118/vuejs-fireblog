const Dotenv = require("dotenv-webpack");

module.exports = {
  pluginOptions: {
    svg: {
      inline: {}, // Pass options to vue-svg-loader
      data: {}, // Pass options to url-loader
      sprite: {}, // Pass options to svg-sprite-loader
      external: {}, // Pass options to file-loader
    },
  },
  configureWebpack: {
    plugins: [new Dotenv()],
  },
  chainWebpack: (config) => {
    config.resolve.alias.set("vue$", path.resolve(__dirname, "node_modules/vue"));
  },
};
