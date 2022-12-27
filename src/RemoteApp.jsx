import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
//root reducer
import { rootReducer } from './js/store/rootReducer';
//custom middlewares
import loggingMiddleware from '@/js/store/middlewares/loggingMiddleWare';
//app
import App from './App';
//components
import LoadingIcon from './js/components/shared/loadingIcon/LoadingIcon';

//wrapper for the parent app
const RemoteInnerApp = ({ injectReducer, store, addMiddleWares }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    injectReducer(rootReducer);
    addMiddleWares([loggingMiddleware]);
  }, [injectReducer, addMiddleWares]);

  useEffect(() => {
    const state = store.getState ? store.getState() : {};
    //remove loader once our first redux slice has been injected into the parent store
    if (state.innerApp) {
      setIsLoaded(true);
    }
  }, [store]);

  return (
    <Provider store={store || {}}>
      {isLoaded ? (
        <App />
      ) : (
        <div className="d-flex justify-content-center">
          <LoadingIcon />
        </div>
      )}
    </Provider>
  );
};

export default RemoteInnerApp;
