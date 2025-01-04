const path = require('path');

module.exports = {
  entry: './index.js', // Entry point to your JavaScript file
  output: {
    filename: 'bundle.js', // Output bundled file
    path: path.resolve(__dirname, 'dist'), // Output directory
    library: 'LinkHierarchyExtractor', // Expose the class as a global object
    libraryTarget: 'umd', // Supports multiple module systems
    globalObject: 'this', // For proper global scope handling in browsers
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', // Transpile JavaScript with Babel
        },
      },
    ],
  },
  resolve: {
    fallback: {
      "https": false,  // Disable https in the browser
    },
  },
  target: 'web', // Build for the browser environment
};
