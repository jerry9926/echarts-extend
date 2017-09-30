/**
 * Created by zhijie.huang on 2017/7/19.
 */
const fs = require('fs');
const path = require('path');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const ENTRY_PATH = 'src/js/pages/';
const TPL_PATH = 'src/';
const OUT_PATH = 'dist/';

/**
 * 获取入口文件
 * @param aPath 入口文件路径
 * @returns {{}}
 */
function getEntry(aPath) {
    const files = fs.readdirSync(aPath, 'utf8');
    const webpackEntry = {};

    files.map(function(item) {
        console.info('call getEntry item', item);
        // const key = new RegExp(/page/);
        // if (item.match(/.\.html/)) {
            const chunks = path.basename(item, '.js');
            webpackEntry[chunks] = path.join(__dirname, ENTRY_PATH, item);
        // }
    });

    console.info('call getEntry', webpackEntry);

    return webpackEntry;
}

/**
 * 获取插件
 * @param htmlPath  模板的路径
 * @returns {Array}
 */
function getPlugin(htmlPath) {

    const webpackPlugin = [];

    getHTMLPlugin(webpackPlugin, htmlPath);

    // HMR（Hot Module Replacement）热模块替换
    webpackPlugin.push(new webpack.HotModuleReplacementPlugin());

    return webpackPlugin;
}

/**
 * 获取HTML插件
 * @param webpackPlugin 整个插件数组
 * @param aPath         模板的路径
 */
function getHTMLPlugin(webpackPlugin, aPath) {
    const files = fs.readdirSync(aPath, 'utf8');

    files.map(function(item) {
        // console.log('tml:' + item);
        // 此判断可以修改为区别是否要webpack处理的html（不需要webpack处理的直接copy，结合gulp）
        if (item.match(/.\.html/)) {
            const template = path.join(__dirname, TPL_PATH, item);
            const chunks = path.basename(item, '.html');
            const filename = item;

            webpackPlugin.push(new HtmlWebpackPlugin({
                template: template,
                chunks: [chunks],
                filename: filename
            }))
        }
    });
}

// console.info('call get webpackEntry', getEntry(ENTRY_PATH));
// console.info('webpackPlugin', getPlugin(TPL_PATH));

module.exports = {
    entry: getEntry(ENTRY_PATH),
    output: {
        filename: 'js/[name].js',
        path: path.join(__dirname, OUT_PATH)
    },
    devtool: 'eval-source-map',
    devServer: {
        contentBase: "./dist",
        historyApiFallback: true,
        hot: true
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['env']
                }
            },
            {
                test: /\.json$/,
                loader: "json-loader"
            }
        ]
    },
    plugins: getPlugin(TPL_PATH)
};
