import { useEffect, useRef, useState } from 'react';
import { Provider } from 'react-redux';
//root reducer
import { reducerSlices } from '@/js/store/reducerSlices';
//store of the current app, used when the host app doesn't pass its store
import localStore from '@/js/store/store';
//custom middlewares
import loggingMiddleware from '@/js/store/middlewares/loggingMiddleWare';
//app
import App from './App';
//components
import LoadingIcon from './js/components/shared/loadingIcon/LoadingIcon';

//injects the redux slices and middlewares of the current app into the store of the host app
const HostStoreApp = ({ injectSlices, store, injectMiddleWares }) => {
  //slices are already injected if the app was mounted before (e.g. when switching routes in the host app)
  const [isSlicesInjected, setIsSlicesInjected] = useState(() =>
      Boolean(store.getState().innerApp)
    ),
    _injectSlices = useRef(injectSlices),
    _injectMiddleWares = useRef(injectMiddleWares);

  useEffect(() => {
    _injectSlices.current(reducerSlices);
    _injectMiddleWares.current?.([loggingMiddleware]);
  }, []);

  useEffect(() => {
    //remove loader once our first redux slice has been injected into the parent store
    if (store.getState().innerApp) {
      setIsSlicesInjected(true);
    }
  }, [store]);

  return (
    <Provider store={store}>
      {isSlicesInjected ? (
        <App />
      ) : (
        <div className="d-flex justify-content-center">
          <LoadingIcon />
        </div>
      )}
    </Provider>
  );
};

//wrapper for the parent app
const RemoteApp = ({ store, injectSlices, ...props }) =>
  //hosts without redux (or that don't pass their store and injectSlices) get the store of the current app
  store?.getState && injectSlices ? (
    <HostStoreApp store={store} injectSlices={injectSlices} {...props} />
  ) : (
    <Provider store={localStore}>
      <App />
    </Provider>
  );

export default RemoteApp;
