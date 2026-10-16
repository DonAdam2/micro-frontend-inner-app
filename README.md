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

- Clone repo => `git clone git@github.com:react-custom-projects/webpack-react-boilerplate.git`
- Navigate to project directory `cd webpack-react-boilerplate`
- Install dependencies => `yarn install`
- Start the development server => `yarn start`

### Development (using Docker):

- Clone repo => `git clone git@github.com:react-custom-projects/webpack-react-boilerplate.git`
- Navigate to project directory `cd webpack-react-boilerplate`
- Install dependencies (required for prettier) => `yarn install`
- Start the development server => `docker-compose up web-dev`

## Docker for production (_basic setup_) (modify it to your needs):
- Update the **_production_** section of the **_Dockerfile_** to meet your needs
- Run the following command to build your image => `docker-compose up web-prod`

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
     will be used in the host app to import that module: `/inner_app/App`.

    6- Add the shared dependencies in ***ModuleFederationPlugin***:<br>
       
    ```
    new ModuleFederationPlugin({
        shared: ['react', 'react-dom'],
    }),
    ```
 	
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
- **/src/js/components/shared/remoteComponent/RemoteComponent.jsx** => renders the remote module lazily inside an error boundary (with a loader and a **Try again** button).

Usage:

```
import RemoteComponent from '@/js/components/shared/remoteComponent/RemoteComponent';

<RemoteComponent remote="second_inner_app/App" />
```

**_Notes:_**
- `remote` format is `remote_app_name/ExposedModule`.
- Any other prop passed to `RemoteComponent` is passed to the remote module, e.g. `<RemoteComponent remote="second_inner_app/App" store={store} />`.

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

    5- Create a boolean state which is used to indicate whether the current store slices have been injected into the host store or not:
        
    ```
    const [isSlicesInjected, setIsSlicesInjected] = useState(false);
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
        const state = store.getState ? store.getState() : {};
        //remove loader once our first redux slice has been injected into the parent store
        if (state.innerApp) {
          setIsSlicesInjected(true);
        }
    }, [store]);
    ```

    **_Notes:_**
    - Make sure to **prefix current redux slices** with a unique name to avoid conflicts between slices names in the host store
  
    9- Show the app:
        
    ```
    <Provider store={store || {}}>
        {isSlicesInjected ? (
            <App />
        ) : (
            <div className="d-flex justify-content-center">
                <LoadingIcon />
            </div>
        )}
    </Provider>
    ```
    

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br>
It will open [http://localhost:3001](http://localhost:3001) automatically in the browser to see your app.

All changes will be injected automatically without reloading the page.<br>

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
