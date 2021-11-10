const path = require('path'),
	//used to check if the given file exists
	fs = require('fs'),
	//dotenv
	dotenv = require('dotenv'),
	//plugins
	{ DefinePlugin } = require('webpack'),
	HtmlWebpackPlugin = require('html-webpack-plugin'),
	MiniCssExtractPlugin = require('mini-css-extract-plugin'),
	autoprefixer = require('autoprefixer'),
	EsLintPlugin = require('eslint-webpack-plugin'),
	{ ModuleFederationPlugin } = require('webpack').container,
	{ MFLiveReloadPlugin } = require('@module-federation/fmr'),
	//constants
	{
		port,
		devServer,
		jsSubDirectory,
		metaInfo: { title, description, url, keywords },
	} = require('./constants'),
	PATHS = require('./paths'),
	fullDevServerUrl = `${devServer}:${port}`;

module.exports = (env, options) => {
	// the mode variable is passed in package.json scripts (development, production)
	const isDevelopment = options.mode === 'development',
		/*================ setup environments variables ===================*/
		// create a fallback path (the production .env)
		basePath = `${PATHS.environments}/.env`,
		// concatenate the environment name to the base path to specify the correct env file!
		envPath = `${basePath}.${options.mode}`,
		// check if the file exists, otherwise fall back to the production .env
		finalPath = fs.existsSync(envPath) ? envPath : basePath,
		// set the path parameter in the dotenv config
		fileEnv = dotenv.config({ path: finalPath }).parsed,
		// create an object from the current env file with all keys
		envKeys = Object.keys(fileEnv).reduce((prev, next) => {
			prev[`process.env.${next}`] = JSON.stringify(fileEnv[next]);
			return prev;
		}, {});
	/*================ finish setup environments variables ===================*/
	return {
		entry: `${PATHS.src}/index.js`,
		output: {
			// __dirname is the absolute path to the root directory of our app
			path: PATHS.outputSrc,
			// hashes are very important in production for caching purposes
			filename: jsSubDirectory + 'bundle.[contenthash:8].js',
			// used for the lazy loaded component
			chunkFilename: jsSubDirectory + '[name].[contenthash:8].js',
			publicPath: 'auto',
			assetModuleFilename: (pathData) => {
				//allows us to have the same folder structure of assets as we have it in /src
				const filepath = path.dirname(pathData.filename).split('/').slice(1).join('/');
				return `${filepath}/[name].[hash][ext][query]`;
			},
		},
		resolve: {
			extensions: ['*', '.js', '.jsx'],
		},
		module: {
			rules: [
				{
					test: /\.js|jsx$/,
					exclude: /node_modules/,
					use: {
						loader: 'babel-loader',
						options: { cacheDirectory: true },
					},
				},
				{
					test: /\.(jpe?g|svg|png|gif|ico|eot|ttf|woff2?)(\?v=\d+\.\d+\.\d+)?$/i,
					type: 'asset/resource',
				},
				{
					test: /\.s?[ac]ss$/,
					exclude: /node_modules/,
					use: [
						{
							// style-loader => insert styles in the head of the HTML as style tags or in blob links
							// MiniCssExtractPlugin => extract styles to a file
							loader: isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
							//if source map is set to true from previous loaders => this loader will be true as well
						},
						{
							//Resolves @import statements
							loader: 'css-loader',
							options: {
								// used for debugging the app (to see from which component styles are applied)
								sourceMap: isDevelopment,
								// Number of loaders applied before CSS loader (which is postcss-loader)
								importLoaders: 3,
								// the following is used to enable CSS modules
								/*modules: {
									mode: (resourcePath) => {
										if (/global.scss$/i.test(resourcePath)) {
											return 'global';
										}

										return 'local';
									},
									localIdentName: isDevelopment ? '[name]_[local]' : '[contenthash:base64]',
									localIdentContext: PATHS.src,
									localIdentHashSalt: 'react-boilerplate',
									exportLocalsConvention: 'camelCaseOnly',
								},*/
							},
						},
						{
							loader: 'postcss-loader',
							options: {
								postcssOptions: {
									ident: 'postcss',
									plugins: [autoprefixer()],
								},
								sourceMap: isDevelopment,
							},
						},
						{
							//Rewrites relative paths in url() statements based on the original source file
							loader: 'resolve-url-loader',
							options: {
								//needs sourcemaps to resolve urls (images)
								sourceMap: true,
							},
						},
						{
							//Compiles Sass to CSS
							loader: 'sass-loader',
							options: {
								sourceMap: true,
							},
						},
					],
				},
			],
		},
		plugins: [
			...(isDevelopment
				? [
						//required for module federation hot reload
						new MFLiveReloadPlugin({
							port, // the port your app runs on
							container: 'inner_app', // the name of your app, must be unique
							standalone: false, // false uses chrome extension
						}),
				  ]
				: []),
			new ModuleFederationPlugin({
				//name of the current project
				name: 'inner_app',
				/*library.type: It defines the library type, var. The available
	            options are var, module, assign, this, window, self, global,
		        commonjs, commonjs2, commonjs-module, amd, amd-require, umd,
		        umd2, jsonp, and system.*/
				//library.name: it defines the library name
				library: { type: 'var', name: 'inner_app' },
				/*It defines the exposed filename, remoteEntry.js, using relative
				path inside the output.path directory*/
				filename: 'remoteEntry.js',
				//It defines modules to be exposed
				exposes: {
					'./App': path.join(PATHS.src, 'RemoteApp'),
				},
				//It defines how modules are shared in the share scope
				shared: ['react', 'react-dom'],
			}),
			new EsLintPlugin({
				extensions: ['.js', '.jsx'],
			}),
			new HtmlWebpackPlugin({
				title,
				template: `${PATHS.src}/index.html`,
				filename: 'index.html',
				inject: 'body',
				favicon: `${PATHS.src}/assets/images/favicon.png`,
				meta: {
					description,
					keywords,
					url: isDevelopment ? fullDevServerUrl : url,
					'apple-mobile-web-app-capable': 'yes',
					'mobile-web-app-capable': 'yes',
				},
			}),
			new DefinePlugin(envKeys),
		],
	};
};
