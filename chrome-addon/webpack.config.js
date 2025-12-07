const path = require('path');

module.exports = {
  mode: "production",
  devtool: false,
  entry: {
    main: "./src/app.ts",
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: "background.js"
  },
  resolve: {
    extensions: [".ts"],
    alias: {
      'webextension-polyfill': require.resolve('webextension-polyfill')
    }
  },
  module: {
    rules: [
      { 
        test: /\.tsx?$/,
        loader: "ts-loader"
      }
    ]
  },
  optimization: {
   minimize: true, // Enable minification to reduce bundle size
  },
  performance: {
    hints: false, // Disable performance warnings
  },
};

