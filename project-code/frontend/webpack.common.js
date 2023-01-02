const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/index.tsx',
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        alias: {
            '@auth': path.resolve(__dirname, 'src/auth/'),
            '@components': path.resolve(__dirname, 'src/components/'),
            '@config': path.resolve(__dirname, 'src/config'),
            '@hooks': path.resolve(__dirname, 'src/hooks'),
            '@pages': path.resolve(__dirname, 'src/pages'),
            '@responses': path.resolve(__dirname, 'src/responses'),
            '@role': path.resolve(__dirname, 'src/role'),
            '@slices': path.resolve(__dirname, 'src/slices'),
            '@store': path.resolve(__dirname, 'src/store'),
            '@tests': path.resolve(__dirname, 'src/tests'),
            '@root': path.resolve(__dirname, 'src/'),
            '@services': path.resolve(__dirname, 'src/services'),
            '@assets': path.resolve(__dirname, 'src/assets')
        }
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.(png|jpg)$/,
                loader: 'file-loader'
            }
        ]
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/'
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Production',
            template: 'public/index.html',
            favicon: 'public/favicon.ico'
        })
    ],
    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    }
};