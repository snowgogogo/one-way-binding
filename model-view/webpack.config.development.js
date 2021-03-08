const path = require('path');

console.log('*** enter development mode ***\n');

module.exports = {
  mode: "development",
  entry: './modules',
  output: {
    filename: 'dev.js'
  },
  devServer: {
    contentBase: './dev'
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, 'modules')
        ],
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
};
