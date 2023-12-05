const HtmlWebpackPlugin = require("html-webpack-plugin");
const {join} = require("path");

module.exports = {
    module: {
        rules: [{
            test: /\.(html)$/,
            use: ['html-loader']
        }]
    },
    output: {
        clean: false
    },
    devServer: {
        static: {
            directory: join(__dirname, 'dist'),
        },
        port: 9000,
        open: true,
        hot: true,
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'My App',
            template: 'src/index.html'
        })
    ]
};