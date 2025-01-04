const path = require('path');

module.exports = {
  entry: './index.js', // Entry point to your JavaScript file
  output: {
    filename: 'bundle.js', // Output bundled file
    path: path.resolve(__dirname, 'dist'), // Output directory
    libraryTarget: 'umd', 
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  target: 'node', // This is for Node.js
};
