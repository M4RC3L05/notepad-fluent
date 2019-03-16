const HtmlWebpackPlugin = require('html-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')

const isDev = process.env.NODE_ENV !== 'production'

module.exports = {
    target: 'web',
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html'
        })
    ],

    optimization: !isDev
        ? {
              minimizer: [new OptimizeCSSAssetsPlugin({})]
          }
        : {}
}
