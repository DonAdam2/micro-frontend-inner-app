# Table of Contents:
- [Overview](#micro-frontend-inner)
- [Prerequisites](#prerequisites)
- [Installing & getting started](#installing--getting-started)
- [How to create injectable module and expose it to host sites](#how-to-create-injectable-module-and-expose-it-to-host-sites)
- [How to import a remote module and use it](#how-to-import-a-remote-module-and-use-it)
- [How to add a new remote app](#how-to-add-a-new-remote-app)
- [How to inject current redux store slices into the parent site redux store](#how-to-inject-current-redux-store-slices-into-the-parent-site-redux-store)
- [Available scripts](#available-scripts)

## Micro frontend inner

- Uses ***module federation plugin*** from webpack to create injectable ***module***.
- This app is the remote entry of [Micro frontend container app](https://github.com/DonAdam2/micro-frontend-container-app)
- And the host of [Micro frontend second inner app](https://github.com/DonAdam2/micro-frontend-second-inner-app)

**_Note:_** This app uses live reloading for local development.

## Prerequisites

- nodeJS ^22.18.0 or >=24.11.0, or Docker

## Installing / Getting Started

### Development (locally):

- Clone repo => `git clone git@github.com:DonAdam2/micro-frontend-inner-app.git`
- Navigate to project directory `cd micro-frontend-inner-app`
- Install dependencies => `yarn install`
- Start the development server => `yarn start`

### Development (using Docker):

- Clone repo => `git clone git@github.com:DonAdam2/micro-frontend-inner-app.git`
- Navigate to project directory `cd micro-frontend-inner-app`
- Install dependencies (required for prettier) => `yarn install`
- Start the development server => `docker-compose up web-dev`

## Docker for production (_basic setup_) (modify it to your needs):
- Update the **_production_** section of the **_Dockerfile_** to meet your needs
- Run the following command to build your image => `docker-compose up web-prod`
- The app must be served from the root of its origin (e.g. `https://app.example.com/`), the files of `index.html` use `publicPath: '/'`
  (**/buildTools/webpack.common.js**), change it to serve the app under a sub-path (e.g. `/app/`).
- `yarn install --frozen-lockfile` installs exactly the versions of `yarn.lock`, the build fails if it is out of date.
- The production image serves the app with **nginx** (**/docker/nginx.conf**):
  - unknown routes fall back to `index.html` (react router handles them).
  - `Access-Control-Allow-Origin: *` so the host apps can load the files of the current app (fonts, `remotes.json`, ...).
  - hashed js/css files are cached forever, `index.html`, `remoteEntry.js` and `remotes.json` are revalidated on every request
    (otherwise the host apps would keep loading an old version of the current app after a deploy).
- The urls of the remote apps can be changed **without rebuilding the image** using `REMOTE_<APP_NAME>` environment variables,
  they are written to `remotes.json` when the container starts (**/docker/40-remotes-json.sh**), e.g.:

  ```
  docker run -p 8081:80 -e REMOTE_SECOND_INNER_APP=https://second-inner-app.example.com <image>
  ```

## How to create injectable _module_ and expose it to host sites

- Open **webpack.common.js** file.<br>
    1- Import ***ModuleFederationPlugin***:
        
    ```
    const { ModuleFederationPlugin } = require('webpack').container
    ```
    
    2- Pass ***ModuleFederationPlugin*** to the ***plugins*** array:
        
    ```
    plugins: [
                new ModuleFederationPlugin({
    ```
                
    3- Specify the name of the current app (must be unique) in ***ModuleFederationPlugin***:
        
    ```
    new ModuleFederationPlugin({
        name: 'inner_app',
    ```

    4- Set the exposed file name in ***ModuleFederationPlugin***:
        
    ```
    filename: 'remoteEntry.js',
    ```
    
    5- Define the modules you want to expose from the current app in ***ModuleFederationPlugin***:
    
    ```
    exposes: {
        './App': path.join(PATHS.src, 'RemoteApp'),
    },
    ```
    
    **_Note:_** The key you specify for each module you expose in `exposes` object
     will be used in the host app to import that module: `inner_app/App`, e.g. `<RemoteComponent remote="inner_app/App" />`.

    6- Add the shared dependencies in ***ModuleFederationPlugin***:<br>
       
    ```
    new ModuleFederationPlugin({
        shared: {
          react: { singleton: true, requiredVersion: majorVersionRange('react') },
          'react-dom': {
            singleton: true,
            strictVersion: true,
            requiredVersion: majorVersionRange('react-dom'),
          },
          'react-redux': { singleton: true, requiredVersion: majorVersionRange('react-redux') },
          '@reduxjs/toolkit': { singleton: true, requiredVersion: majorVersionRange('@reduxjs/toolkit') },
        },
    }),
    ```

    **_Notes:_**
    - The `shared` configuration must match in the host app and all the remote apps (`react` and `react-dom` must be singletons).
    - `majorVersionRange('react')` returns `^19.0.0`, so an app can be deployed with a newer minor/patch version without breaking the other apps
      (an exact version would make `strictVersion` reject any mismatch).
    - Remote apps are **not** `eager` (only the host app is), so they use the host copy of the shared packages instead of downloading their own.
 	
- Create the component you want to expose.
- Create `bootstrap.js` file and move into it all the code from `index.jsx` file.
- Import `bootstrap.js` inside `index.jsx` file.<br>
    
  ```
    import('./bootstrap');
  ```

## How to import a _remote module_ and use it

Remote apps are **not** added to the `remotes` object of ***ModuleFederationPlugin***. Webpack caches a remote that failed to load
until the page is refreshed, so the **Try again** button of the error boundary would never work.
Instead, remote apps are loaded at runtime, which allows retrying without refreshing the page:

- **/buildTools/constants.js** => `remotes` object contains the name and the urls of every remote app.
- **/buildTools/webpack.common.js** => injects the remote apps urls into the code as `MF_REMOTES` (using ***DefinePlugin***).
- **/src/js/constants/LoadRemote.js** => loads the `remoteEntry.js` of the remote app, shares the dependencies (react, react-dom, ...) with it and returns the requested module.
- **remotes.json** (emitted next to `index.html` by **/buildTools/webpack.common.js**) => the urls of the remote apps loaded at runtime,
  so they can be changed after the build without rebuilding the current app, e.g. `{ "inner_app": "https://inner-app.example.com" }`
  (the docker image overwrites it from `REMOTE_<APP_NAME>` environment variables, `MF_REMOTES` is used if it can't be loaded).
- **/src/js/components/shared/remoteComponent/RemoteComponent.jsx** => renders the remote module lazily inside an error boundary (with a loader and a **Try again** button).

Usage:

```
import RemoteComponent from '@/js/components/shared/remoteComponent/RemoteComponent';

<RemoteComponent remote="second_inner_app/App" />
```

**_Notes:_**
- `remote` format is `remote_app_name/ExposedModule`.
- Any other prop passed to `RemoteComponent` is passed to the remote module, e.g. `<RemoteComponent remote="second_inner_app/App" store={store} />`.
- Each remote app is loaded only once, even when it is requested by several components at the same time.
- Each remote module is loaded only once, it is not loaded again when `RemoteComponent` is mounted again (e.g. when switching routes), so its state is kept.
- If a remote module fails to load, the fallback UI with a **Try again** button is shown, it is loaded again when clicking **Try again** or when `RemoteComponent` is mounted again.

## How to add a new remote app

1- In the **remote app**, expose the module you want in its ***ModuleFederationPlugin*** and make sure its `shared` dependencies match the current app:

```
new ModuleFederationPlugin({
  name: 'new_remote_app',
  filename: 'remoteEntry.js',
  exposes: {
    './App': path.join(PATHS.src, 'App'),
  },
  shared: { ... },
}),
```

2- In the **current app**, add the remote app to the `remotes` object of **/buildTools/constants.js**:

```
remotes: {
  second_inner_app: {
    devUrl: 'http://localhost:3002',
    prodUrl: 'http://localhost:8082',
  },
  new_remote_app: {
    devUrl: 'http://localhost:3003',
    prodUrl: 'https://new-remote-app.example.com',
  },
},
```

**_Notes:_**
- The key must be the same as the `name` of the remote app ***ModuleFederationPlugin***.
- The urls are the origins of the remote app (without `/remoteEntry.js`).
- The remote app must allow CORS requests from the current app.

3- Restart the development server (webpack configuration changes are not reloaded automatically).

4- Use the remote module anywhere in the app:

```
<RemoteComponent remote="new_remote_app/App" />
```

## How to inject current redux store slices into the parent site redux store
    
- Create RemoteApp component:<br>
    1- Import current store slices:
    
    ```
      import { reducerSlices } from './js/store/reducerSlices';
    ```
         
    2- Import app:
    
    ```
    import App from './App';
    ```
         
    3- Import middle wares if any:
 
    ```
    import loggingMiddleware from '@/js/store/middlewares/loggingMiddleWare';
    ```
    
    4- Pass injectSlices, store and injectMiddleWares as props:
        
    ```
    const RemoteApp = ({ injectSlices, store, injectMiddleWares }) => {
    ```

  **_Notes:_** 
    - **injectSlices**: function used to inject current app redux slices into the host app store
    - **store**: host app store
    - **injectMiddleWares**: function used to inject current app redux middlewares into the host app

    5- Create a boolean state which is used to indicate whether the current store slices have been injected into the host store or not
    (it starts as `true` if the slices were injected before, e.g. when switching routes in the host app, to avoid showing the loader again):
        
    ```
    const [isSlicesInjected, setIsSlicesInjected] = useState(() => Boolean(store.getState().innerApp));
    ```

    6- Create refs to store `injectSlices` and `injectMiddleWares` functions:

    ```
    const _injectSlices = useRef(injectSlices),
      _injectMiddleWares = useRef(injectMiddleWares);
    ```

    7- Use `injectSlices` and `injectMiddleWares` functions:
        
    ```
    useEffect(() => {
      _injectSlices.current(reducerSlices);
      _injectMiddleWares.current([loggingMiddleware]);
    }, []);
    ```
    
    8- Set isLoaded flag to true when current redux slices have been injected successfully into the host store:
        
    ```
    useEffect(() => {
        //remove loader once our first redux slice has been injected into the parent store
        if (store.getState().innerApp) {
          setIsSlicesInjected(true);
        }
    }, [store]);
    ```

    **_Notes:_**
    - Every slice of the current app is **prefixed with `inner`** (store key and `createSlice` name, e.g. `innerApp`),
      the host app uses `container` and the second inner app `secondInner`, so slices and action types never collide in the host store
      (the host app ignores a slice whose name is already used, as a safety net)
  
    9- Show the app:
        
    ```
    <Provider store={store}>
        {isSlicesInjected ? (
            <App />
        ) : (
            <div className="d-flex justify-content-center">
                <LoadingIcon />
            </div>
        )}
    </Provider>
    ```

    10- Hosts without redux (or that don't pass `store` and `injectSlices`) get the store of the current app
    (in **/src/RemoteApp.jsx** the steps above are in the `HostStoreApp` component):

    ```
    const RemoteApp = ({ store, injectSlices, ...props }) =>
      store?.getState && injectSlices ? (
        <HostStoreApp store={store} injectSlices={injectSlices} {...props} />
      ) : (
        <Provider store={localStore}>
          <App />
        </Provider>
      );
    ```
    

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br>
It will open [http://localhost:3001](http://localhost:3001) automatically in the browser to see your app.

The page will reload automatically when you make changes (live reloading).<br>

You will see in the console the following:

- All redux store related changes
- Any of the following errors:
  1. Linting errors.
  2. Code format errors (because of [prettier](https://prettier.io/))

### `yarn build`

Builds the app for production to the `dist` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

### `yarn build:serve`

Serves the app on [http://localhost:8081](http://localhost:8081) from the `dist` folder to check the production version.

**_Note:_** Use this script only if you ran the build script `yarn build`.

### `yarn analyze-bundle`

It allows you to analyze the bundle size.
