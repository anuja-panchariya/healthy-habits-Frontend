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

  // ✅ ADD THIS devServer SECTION
  devServer: {
    historyApiFallback: true,
    static: path.join(__dirname, 'public'),
  },

  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    configure: (webpackConfig, { env, paths }) => {
      webpackConfig.watchOptions = {
        ...webpackConfig.watchOptions,
        ignored: [
          "**/node_modules/**",
          "**/.git/**",
          "**/build/**",
          "**/dist/**",
          "**/coverage/**",
          "**/public/**",
        ],
      };

      // ✅ SPA ROUTING FIX - Critical for React Router + Render
      if (env === 'production') {
        webpackConfig.output.publicPath = '/';
        webpackConfig.plugins.push(
          new webpack.DefinePlugin({
            'process.env.PUBLIC_URL': JSON.stringify('')
          })
        );
      }

      // ✅ YOUR EXISTING ENV
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
