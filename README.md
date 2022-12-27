## Micro frontend inner:

- Uses ***module federation plugin*** from webpack to create injectable ***module***.
- This app is the remote entry of [Micro frontend container app](https://github.com/DonAdam2/micro-frontend-container-app)
- And the host of [Micro frontend second inner app](https://github.com/DonAdam2/micro-frontend-second-inner-app)

**_Note:_** You must start the container app first then inner app in order for the hot reloading to work properly.

## How to create injectable ***module*** and expose it to parent sites:

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


## How to inject the current redux store as a slice into the parent site redux store:
    
- Create RemoteApp component:<br>
    1- Import current store slices:
    
    ```
      import { reducerSlices } from './js/store/rootReducer';
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
    const RemoteInnerApp = ({ injectSlices, store, injectMiddleWares }) => {
    ```

  **_Notes:_** 
    - **injectSlices**: function used to inject current app redux slices into the host app
    - **store**: host app store
    - **injectMiddleWares**: function used to inject current app redux middlewares into the host app

    5- Create a boolean state which is used to indicate whither the current store slices have been injected into the host store or not:
        
    ```
    const [isSlicesInjected, setIsSlicesInjected] = useState(false);
    ```
        
    6- Use `injectSlices` and `injectMiddleWares` functions:
        
    ```
    useEffect(() => {
        injectSlices(rootReducer);
        injectMiddleWares([loggingMiddleware]);
    }, [injectReducer, addMiddleWares]);
    ```
    
    7- Set isLoaded flag to true when current redux slices have been injected successfully into the host store:
        
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
  
    8- Show the app:
        
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
