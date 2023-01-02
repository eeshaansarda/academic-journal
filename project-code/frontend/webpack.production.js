const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const StringReplacePlugin = require('string-replace-webpack-plugin');

module.exports = merge(common, {
    mode: 'production',
    module: {
        rules: [
            {
                test: /SocketContext.tsx$/,
                loader: StringReplacePlugin.replace({
                    replacements: [
                        {
                            pattern: /\[SOCKET_URL\]/,
                            replacement: () => 'wss://cs3099user15.host.cs.st-andrews.ac.uk'
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
                            replacement: () => 'production'
                        }
                    ]
                })
            }
        ]
    }
});