const path = require("path");
const webpack = require('webpack');

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
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    configure: (webpackConfig, { env }) => {
      webpackConfig.watchOptions = {
        ...webpackConfig.watchOptions,
        ignored: [
          "**/node_modules/**",
          "**/.git/**",
          "**/build/**",
          "**/dist/**",
        ],
      };

      // ✅ FIX IMPORT ERROR - Remove ModuleScopePlugin
      webpackConfig.resolve.plugins = webpackConfig.resolve.plugins?.filter(
        plugin => !plugin.appSrcs
      ) || [];

      // 🔥 RENDER.COM STATIC SITE FIX - RELATIVE PATHS!
      webpackConfig.output.publicPath = './';  // ← CHANGED FROM '/'
      
      // ✅ DEVELOPMENT keeps absolute path, PRODUCTION uses relative
      if (env === 'development') {
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
};
