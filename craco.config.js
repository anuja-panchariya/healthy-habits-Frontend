const path = require("path");
const webpack = require('webpack');

// ✅ DISABLE CRA MODULESCOPEPLUGIN
const CracoAlias = require('craco-alias');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const path = require('path');

module.exports = {
  eslint: {
    configure: {
      extends: ["plugin:react-hooks/recommended"],
      rules: {
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
      },
    },
  },

  devServer: {
    historyApiFallback: true,
    static: path.join(__dirname, 'public'),
  },

  webpack: {
    configure: (webpackConfig, { env }) => {
      webpackConfig.watchOptions = {
        ...webpackConfig.watchOptions,
        ignored: [
          "**/node_modules/**",
          "**/.git/**",
          "**/build/**",
        ],
      };

      // ✅ DISABLE MODULESCOPEPLUGIN - FIXES IMPORT ERROR
      webpackConfig.resolve.plugins = webpackConfig.resolve.plugins.filter(
        plugin => !(plugin instanceof ModuleScopePlugin)
      );

      if (env === 'production') {
        webpackConfig.output.publicPath = '/';
      }

      webpackConfig.plugins.push(
        new webpack.DefinePlugin({
          'window.ENV': JSON.stringify({
            VITE_API_URL: process.env.VITE_API_URL || 'https://healthy-habits-be-1.onrender.com/api'
          })
        })
      );

      return webpackConfig;
    },
  },

  alias: {
    '@': path.resolve(__dirname, 'src'),
  },
};
