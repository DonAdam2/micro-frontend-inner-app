const path = require('path'),
  //plugins
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  MiniCssExtractPlugin = require('mini-css-extract-plugin'),
  EsLintPlugin = require('eslint-webpack-plugin'),
  { ModuleFederationPlugin } = require('webpack').container,
  ExternalTemplateRemotesPlugin = require('external-remotes-plugin'),
  //constants
  {
    devServer,
    jsSubDirectory,
    isCssModules,
    remoteDevUrl,
    remoteProdUrl,
    metaInfo: { title, description, url, keywords },
  } = require('./constants'),
  PATHS = require('./paths'),
  { devDependencies } = require(PATHS.packageJson);

module.exports = (env, options) => {
  // the mode variable is passed in package.json scripts (development, production)
  const isDevelopment = options.mode === 'development';

  return {
    entry: `${PATHS.src}/index.jsx`,
    output: {
      path: PATHS.outputSrc,
      // hashes are very important in production for caching purposes
      filename: jsSubDirectory + 'bundle.[contenthash:8].js',
      // used for the lazy loaded component
      chunkFilename: jsSubDirectory + '[name].[contenthash:8].js',
      publicPath: 'auto',
      assetModuleFilename: (pathData) => {
        //allows us to have the same folder structure of assets as we have it in /public
        const filepath = path.dirname(pathData.filename).split('/').slice(1).join('/');
        return `${filepath}/[name].[hash][ext][query]`;
      },
    },
    resolve: {
      extensions: ['.js', '.jsx', '.json'],
      // declaring aliases to reduce the use of relative path
      alias: {
        '@/js': `${PATHS.src}/js`,
        '@/scss': `${PATHS.src}/scss`,
        '@/public': PATHS.public,
      },
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          options: {
            // This is a feature of `babel-loader` for webpack (not Babel itself).
            // It enables caching results in ./node_modules/.cache/babel-loader/
            // directory for faster rebuilds.
            cacheDirectory: true,
            cacheCompression: false,
            compact: !isDevelopment,
          },
        },
        {
          test: /\.(jpe?g|svg|png|gif|ico|eot|ttf|woff2?)(\?v=\d+\.\d+\.\d+)?$/i,
          type: 'asset/resource',
        },
        {
          test: /\.s?[ac]ss$/,
          //removed (exclude: /node_modules/) to enable using external styles
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
                ...(isCssModules
                  ? {
                      modules: {
                        //exclude external styles from css modules transformation
                        auto: (resourcePath) => !resourcePath.includes('node_modules'),
                        mode: (resourcePath) => {
                          if (/global.scss$/i.test(resourcePath)) {
                            return 'global';
                          }

                          return 'local';
                        },
                        localIdentName: isDevelopment ? '[name]_[local]' : '[contenthash:base64]',
                        localIdentContext: PATHS.src,
                        localIdentHashSalt: 'react-boilerplate',
                        exportLocalsConvention: 'camel-case-only',
                        namedExport: false,
                      },
                    }
                  : {}),
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  ident: 'postcss',
                  plugins: [
                    'postcss-flexbugs-fixes',
                    [
                      'postcss-preset-env',
                      {
                        stage: 0,
                        //uncomment the following if you want to prefix grid properties
                        // autoprefixer: { grid: true },
                      },
                    ],
                    // Adds PostCSS Normalize as the reset css with default options,
                    // so that it honors browserslist config in package.json
                    // which in turn let's users customize the target behavior as per their needs.
                    'postcss-normalize',
                  ],
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
      new ModuleFederationPlugin({
        //name of the current project
        name: 'inner_app',
        /*It defines the exposed filename, remoteEntry.js, using relative
        path inside the output.path directory*/
        filename: 'remoteEntry.js',
        //It defines modules to be exposed
        exposes: {
          './App': path.join(PATHS.src, 'RemoteApp'),
        },
        //list of apps that will be hosted in the current app
        remotes: {
          second_inner_app: `second_inner_app@${
            isDevelopment ? remoteDevUrl : remoteProdUrl
          }/remoteEntry.js`,
        },
        //It defines how modules are shared in the share scope
        shared: {
          //eager: Allows Webpack to include the shared packages directly instead of fetching the library via an asynchronous request
          //singleton: Allows only a single version of the shared module in the shared scope
          //strictVersion: Allows Webpack to reject the shared module if its version is not valid
          react: { eager: true, singleton: true, requiredVersion: devDependencies['react'] },
          'react-dom': {
            eager: true,
            singleton: true,
            strictVersion: true,
            requiredVersion: devDependencies['react-dom'],
          },
        },
      }),
      //used to make sure that remote modules are loaded before the main bundle
      new ExternalTemplateRemotesPlugin(),
      new EsLintPlugin({
        extensions: ['.js', '.jsx', '.json'],
        context: PATHS.src,
        cache: true,
        cacheLocation: path.resolve('node_modules/.cache/.eslintcache'),
        // Development-specific options
        failOnError: !isDevelopment,
        failOnWarning: false,
        emitError: true,
        emitWarning: true,
        // Only display errors/warnings on the overlay, don't block compilation in dev
        ...(isDevelopment && {
          quiet: false,
          fix: false,
        }),
      }),
      new HtmlWebpackPlugin({
        title,
        template: `${PATHS.public}/index.html`,
        filename: 'index.html',
        inject: 'body',
        favicon: `${PATHS.public}/assets/images/favicon.png`,
        meta: {
          description,
          keywords,
          //coming from scripts/start.js file
          url: isDevelopment ? `${devServer}:${options.port}` : url,
          'apple-mobile-web-app-capable': 'yes',
          'mobile-web-app-capable': 'yes',
        },
      }),
    ],
  };
};
