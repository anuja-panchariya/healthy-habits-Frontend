const path = require("path");
const webpack = require('webpack');  // ← ADD

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

  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    configure: (webpackConfig) => {
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

      // ✅ CRITICAL: VITE_API_URL client-side expose!
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
