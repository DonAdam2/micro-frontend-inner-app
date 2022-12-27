import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
//root reducer
import { reducerSlices } from '@/js/store/reducerSlices';
//custom middlewares
import loggingMiddleware from '@/js/store/middlewares/loggingMiddleWare';
//app
import App from './App';
//components
import LoadingIcon from './js/components/shared/loadingIcon/LoadingIcon';

//wrapper for the parent app
const RemoteApp = ({ injectSlices, store, injectMiddleWares }) => {
  const [isSlicesInjected, setIsSlicesInjected] = useState(false);

  useEffect(() => {
    injectSlices(reducerSlices);
    injectMiddleWares([loggingMiddleware]);
  }, [injectSlices, injectMiddleWares]);

  useEffect(() => {
    const state = store.getState ? store.getState() : {};
    //remove loader once our first redux slice has been injected into the parent store
    if (state.innerApp) {
      setIsSlicesInjected(true);
    }
  }, [store]);

  return (
    <Provider store={store || {}}>
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

export default RemoteApp;
