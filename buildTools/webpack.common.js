const path = require('path'),
  //plugins
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  MiniCssExtractPlugin = require('mini-css-extract-plugin'),
  EsLintPlugin = require('eslint-webpack-plugin'),
  {
    DefinePlugin,
    Compilation,
    sources: { RawSource },
    container: { ModuleFederationPlugin },
  } = require('webpack'),
  //constants
  {
    devServer,
    jsSubDirectory,
    isCssModules,
    remotes,
    metaInfo: { title, description, url, keywords },
  } = require('./constants'),
  PATHS = require('./paths'),
  { devDependencies, dependencies } = require(PATHS.packageJson),
  /*shared dependencies must be configured the same way in the host and all the remote apps
  requiredVersion is a range of the major version, so an app can be deployed with a newer minor/patch version
  without breaking the other apps (an exact version would make strictVersion reject any mismatch)*/
  majorVersionRange = (packageName) =>
    `^${{ ...devDependencies, ...dependencies }[packageName].split('.')[0]}.0.0`;

module.exports = (env, options) => {
  // the mode variable is passed in package.json scripts (development, production)
  const isDevelopment = options.mode === 'development',
    //origins of the remote apps (defined in buildTools/constants.js) for the current mode
    remotesOrigins = Object.fromEntries(
      Object.entries(remotes).map(([name, { devUrl, prodUrl }]) => [
        name,
        isDevelopment ? devUrl : prodUrl,
      ])
    );

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
          test: /\.(jpe?g|svg|png|gif|ico|ttf|woff2?)(\?v=\d+\.\d+\.\d+)?$/i,
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
                postcssOptions: async () => {
                  const postcssPresetEnv = (await import('postcss-preset-env')).default;

                  return {
                    ident: 'postcss',
                    plugins: [
                      postcssPresetEnv({
                        stage: 0,
                      }),
                    ],
                  };
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
        /*remote apps are not listed in "remotes" because webpack caches a failed remote until the page is refreshed,
        instead they are loaded at runtime (src/js/constants/LoadRemote.js) so they can be retried*/
        //It defines how modules are shared in the share scope
        shared: {
          //not eager: the host provides these packages, so the remote app doesn't download its own copy
          //(it still works standalone because index.jsx imports bootstrap.js asynchronously)
          //singleton: Allows only a single version of the shared module in the shared scope
          //strictVersion: Allows Webpack to reject the shared module if its version is not valid
          react: { singleton: true, requiredVersion: majorVersionRange('react') },
          'react-dom': {
            singleton: true,
            strictVersion: true,
            requiredVersion: majorVersionRange('react-dom'),
          },
        },
      }),
      //remote apps urls (defined in buildTools/constants.js) used by src/js/constants/LoadRemote.js
      new DefinePlugin({
        MF_REMOTES: JSON.stringify(
          Object.fromEntries(
            Object.entries(remotesOrigins).map(([name, origin]) => [
              name,
              `${origin}/remoteEntry.js`,
            ])
          )
        ),
      }),
      /*emits remotes.json next to index.html, it's loaded at runtime by src/js/constants/LoadRemote.js
      so the urls of the remote apps can be changed after the build (the docker image overwrites it from REMOTE_* variables)*/
      {
        apply: (compiler) => {
          compiler.hooks.thisCompilation.tap('RemotesJsonPlugin', (compilation) => {
            compilation.hooks.processAssets.tap(
              { name: 'RemotesJsonPlugin', stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL },
              () => {
                compilation.emitAsset(
                  'remotes.json',
                  new RawSource(JSON.stringify(remotesOrigins, null, 2))
                );
              }
            );
          });
        },
      },
      new EsLintPlugin({
        extensions: ['.js', '.jsx', '.json'],
        context: PATHS.src,
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
        /*absolute urls for the files injected into index.html (output.publicPath is "auto", which makes them relative),
        otherwise a nested route like /carousel/second would request /carousel/js/bundle.js*/
        publicPath: '/',
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
