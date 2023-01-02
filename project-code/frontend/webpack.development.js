const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');
const StringReplacePlugin = require('string-replace-webpack-plugin');

module.exports = merge(common, {
    mode: 'development',
    devServer: {
        static: path.join(__dirname, "build"),
        compress: true,
        port: 3000,
        proxy: {
            "/api": "http://localhost:8080/",
            "/socket.io": {
                "target": "ws://localhost:8080",
                "ws": true,
                onError: error => {
                    console.log(`Error proxying ws connection: ${error}`);
                }
            }
        },
        historyApiFallback: true
    },
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /SocketContext.tsx$/,
                loader: StringReplacePlugin.replace({
                    replacements: [
                        {
                            pattern: /\[SOCKET_URL\]/,
                            replacement: () => '/'
                        }
                    ]
                })
            },
            {
                test: /ErrorHandler.tsx$/,
                loader: StringReplacePlugin.replace({
                    replacements: [
                        {
                            pattern: /\[MODE\]/,
                            replacement: () => 'development'
                        }
                    ]
                })
            }
        ]
    }
});

