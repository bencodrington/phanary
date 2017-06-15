const path = require('path');

module.exports = {
    entry: {
        main: "./app/assets/scripts/main.js",
        system: "./app/assets/scripts/system.js"
    },
    output: {
        path: path.resolve(__dirname, './public/scripts'),
        filename: "[name].js"
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