const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    target: 'web',
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html'
        })
    ]
}
