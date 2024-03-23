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
  },
  module: {
    rules: [
      { 
        test: /\.tsx?$/,
        loader: "ts-loader"
      }
    ]
  }
};
