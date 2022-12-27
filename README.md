## Micro frontend inner:

- Uses ***module federation plugin*** from webpack to create injectable ***module***.

**_Note:_** You must start the container app first then inner app in order for the hot reloading to work properly.

## How to create injectable ***module*** and expose it to parent sites:

- Open **webpack.common.js** file.<br>
    1- Import ***ModuleFederationPlugin***:<br>
    `ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin')`
    
    2- Pass ***ModuleFederationPlugin*** to the ***plugins*** array:<br>
    `plugins: [
                new ModuleFederationPlugin({`
                
    3- Specify the name of the current app in ***ModuleFederationPlugin***:<br>
    `new ModuleFederationPlugin({
        name: 'inner_app',`
        
    4- Specify the library type and name by setting them in ***ModuleFederationPlugin***:<br>
    `library: { type: 'var', name: 'inner_app' },`<br>
        
     **_Notes:_** 
     - library.type: It defines the library type. The available options are var,
       module, assign, this, window, self, global, commonjs, commonjs2, commonjs-module,
       amd, amd-require, umd, umd2, jsonp, and system.
     - library.name: it defines the library name.
        
    5- Set the exposed file name in ***ModuleFederationPlugin***:<br>
    `filename: 'remoteEntry.js',`
    
    6- Define the modules you want to expose from the current app in ***ModuleFederationPlugin***:<br>
    `exposes: {
        './App': path.join(PATHS.src, 'RemoteApp'),
    },`
    
    **_Note:_** The key you specify for each module you expose in `exposes` object
     will be used in the host app to import that module: `/inner_app/App`.
    
    7- Add the shared dependencies in ***ModuleFederationPlugin***:<br>
        `new ModuleFederationPlugin({
            shared: ['react', 'react-dom'],
        }),`
 	
- Create the component you want to expose.
- Create `bootstrap.js` file and move into it all the code from `index.jsx` file.
- Import `bootstrap.js` inside `index.jsx` file.<br>
`import('./bootstrap');`


## How to inject the current redux store as a slice into the parent site redux store:

- You must have 2 exports in your app:

    1- ***Named*** export for development.
    
    2- ***Default*** export which will be used for the exposed module.
    
- Create RemoteApp component:<br>
    1- Import current store slices:<br>
         `import { reducerSlices } from './js/store/rootReducer';`
         
    2- Import app:<br>
         `import App from './App';`
         
    3- Import middle wares if any
    
    4- Pass store and addMiddleWares as props:<br>
        `const RemoteInnerApp = ({
        	store,
        	addMiddleWares
        }) => {`
        
    5- Create a boolean state which is used to indicate whither the current store slices have been injected into the host store or not:<br>
        `const [isLoaded, setIsLoaded] = useState(false);`
        
    6- Use `injectReducer` and `addMiddleWares` functions:<br>
        `useEffect(() => {
        		store.injectReducer(reducerSlices);
        		addMiddleWares([middleWare1, middleWare2]);
        	}, [store]);`<br>
        	
    **_Notes:_** 
     - `injectReducer` and `addMiddleWares` functions must be part of the host configurations.     
     - `injectReducer` function allows you to inject current store slices into the host store.     
     - `addMiddleWares` function allows you to inject current store middle wares into the host store.
    
    7- Set isLoaded flag to true when exposed module reducer slices have been injected successfully into the host store:<br>
        `useEffect(() => {
    		const state = store.getState ? store.getState() : {};
    		if (state.innerApp) {
    			setIsLoaded(true);
    		}
    	}, [store]);`
    
    8- Show the app:<br>
        `<Provider store={store || {}}>
            {isLoaded ? (
                <App />
            ) : (
                <div className="d-flex justify-content-center">
                    <LoadingIcon />
                </div>
            )}
        </Provider>`
    

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
