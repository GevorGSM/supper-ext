const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin'); // eslint-disable-line

module.exports = (env, argv) => ({
  mode: 'development',
  entry: {
    content: './src/content',
    popup: './src/popup',
    options: './src/options',
  },
  devtool: argv.mode === 'development' ? 'source-map' : '',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  plugins: [new CopyWebpackPlugin([
    {
      from: 'assets'
    },
    {
      from: 'node_modules/webextension-polyfill/dist/browser-polyfill.js'
    }
  ])],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: 'babel-loader',
      },
    ],
  },
});
