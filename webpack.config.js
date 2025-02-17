/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

function generateWebpackConfig({ pkg, currentPath, alias }) {
  const depsList = Object.keys(pkg.dependencies);
  const baseConfig = {
    resolve: {
      plugins: [new TsconfigPathsPlugin()],
      alias: {
        ...(depsList.includes("bn.js") && { "bn.js": path.resolve(currentPath, "node_modules/bn.js") }),
        // ...(depsList.includes("elliptic") && { elliptic: path.resolve(currentPath, "node_modules/elliptic") }),
        // ...(depsList.includes("lodash") && { lodash: path.resolve(currentPath, "node_modules/lodash") }),
        ...alias,
      },
    },
  };
  return { baseConfig };
}

module.exports = generateWebpackConfig;
