const path = require('path');

module.exports = {
    entry: "./app/assets/scripts/main.js",
    output: {
        path: path.resolve(__dirname, './public/scripts'),
        filename: "main.js"
    },
    module: {
        loaders: [
            {
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                },
                test: /\.js$/,
                exclude: /node_modules/
            }
        ]
    }
}