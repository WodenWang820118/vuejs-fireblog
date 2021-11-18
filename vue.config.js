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
    config.performance.maxEntrypointSize(5000000).maxAssetSize(3000000);
  },
};
