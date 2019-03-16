const HtmlWebpackPlugin = require('html-webpack-plugin')

console.log(process.env.NODE_ENV)

module.exports = {
    target: 'web',
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html'
        })
    ]
}
