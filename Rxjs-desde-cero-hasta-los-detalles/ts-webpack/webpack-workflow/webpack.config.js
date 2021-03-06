// "use strict";
/**
 * https://survivejs.com/webpack/developing/webpack-dev-server/
 * los loader iran en module
 * cada modulo tendrá una regla que se va a definir a cada objeto, un objeto para babel
 * otro para css otro para interpretar js
 */
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const postcssPresetEnv = require("postcss-preset-env");
const path = require("path");
const MinifyPlugin = require('babel-minify-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const { HotModuleReplacementPlugin ,WatchIgnorePlugin} = require('webpack')

const REGEX_JS = /^(?!.*\.{test,min}\.js$).*\.js$/i
const REGEX_STYLES = /\.(sa|sc|c)ss$/i
const env = process.env.NODE_ENV;

module.exports = {
    devtool: "source-map",
    entry: {
        app: ["@babel/polyfill", "./src/main.ts"]
    },
    resolve: {
        extensions: ['.ts','.js','.json']
    },
    // optimization: {
    //     minimizer: [ new OptimizeCssAssetsPlugin() ]
    // },
    watch : true,
    // mode: "development",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: env === 'production'?"js/[name].[hash].js" :"js/[name].js"
    },
    devServer: {
        contentBase: path.join(__dirname, "dist"),
        // stats: "errors-only",
        hot:true,
        compress: true,
        open: true,
        port: 4200,
        host: "localhost",
        overlay: true,
        watchOptions: {
            // Delay the rebuild after the first change
            aggregateTimeout: 300,
            // Poll using interval (in ms, accepts boolean too)
            poll: 1000,
        },
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: REGEX_JS,
                exclude: /(node_modules)/,
                use: [
                    {
                        loader: "babel-loader",
                        options: {
                            presets: ["@babel/preset-env"]
                        }
                    },
                    // {
                    //     loader: "eslint-loader",
                    //     options: {
                    //         cache: true,
                    //         failOnError: true,
                    //         emitWarning: true,
                    //         configFile: "./.eslintrc.json"
                    //     }
                    // }
                ]
            },
            {
                test: REGEX_STYLES ,
                exclude: /node_modules/,
                use: [
                    (env !== 'development'?
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: "../"
                        }
                    } :
                    {
                        loader:'style-loader'
                    }),
                    {
                        loader: "css-loader",
                        options: {
                            sourceMap: true,
                            // importLoaders: 2
                        }
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            sourceMap: true,
                            // importLoaders: 1
                        }
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                            ident: "postcss",
                            plugins: () => [
                                postcssPresetEnv({
                                    browsers: "last 2 versions",
                                    autoprefixer: {
                                        grid: true,
                                        cascade: false
                                    },
                                    stage: 3,
                                    features: {
                                        "nesting-rules": true
                                    }
                                })
                            ]
                        }
                    }
                ]
            },
            {
                test: /\.pug$/,
                use: "pug-loader"
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "[name].[ext]"
                        }
                    }
                ],
                exclude: path.resolve(__dirname, "./src/index.html")
            },
            {
                test: /\.(png|jpe?g|gif)$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "[name].[ext]",
                            outputPath: "img/"
                        }
                    }
                ]
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf|svg)$/,
                use: [
                    {
                        loader: "url-loader",
                        options: {
                            name: "[name].[ext]",
                            outputPath: "fonts/"
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        // new HtmlWebpackPlugin({
        //   title: 'My App',
        //   filename: 'index.html',
        //   template: 'src/index.html',

        //   minify: {
        //     collapseWhitespace: false,
        //     removeComments: true,
        //     removeRedundantAttributes: true,
        //     removeScriptTypeAttributes: true,
        //     removeStyleLinkTypeAttributes: true,
        //     useShortDoctype: true,
        //   },

        // }),
        new CleanWebpackPlugin(),
        // Ignore node_modules so CPU usage with poll
        // watching drops significantly.
        new WatchIgnorePlugin([
            path.join(__dirname, "node_modules")
        ]),
        // new HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
            title: 'Webpack Starter',
            template: './src/index.pug'
        }),
        new OptimizeCssAssetsPlugin({
            assetNameRegExp: /\.(sa|sc|c)ss$/,
            cssProcessor: require("cssnano"),
            cssProcessorPluginOptions: {
                preset: [
                    "default",
                    {
                        discardComments: { removeAll: true }
                    }
                ]
            },
            canPrint: true
        }),
        new MiniCssExtractPlugin({
            filename: env === 'production' ?"css/[name].[contenthash].css":"css/[name].css",
            chunkFilename: "[id].css"
        }),
        // new MinifyPlugin(),
    ]
};
