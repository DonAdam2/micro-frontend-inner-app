import { configureStore } from '@reduxjs/toolkit';
//root reducer
import { reducerSlices } from './reducerSlices';
//custom middlewares
import loggingMiddleware from '@/js/store/middlewares/loggingMiddleWare';

const isDevelopment = process.env.NODE_ENV === 'development';

export default configureStore({
  reducer: reducerSlices,
  devTools: isDevelopment,
  middleware: (getDefaultMiddleware) => {
    if (isDevelopment) {
      const { logger } = require('redux-logger'),
        middlewares = [logger, loggingMiddleware];

      return getDefaultMiddleware().concat(middlewares);
    }

    return getDefaultMiddleware();
  },
});
