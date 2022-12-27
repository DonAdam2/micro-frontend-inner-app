import { configureStore } from '@reduxjs/toolkit';
//root reducer
import { rootReducer } from './rootReducer';
//custom middlewares
import loggingMiddleware from '@/js/store/middlewares/loggingMiddleWare';

const isDevelopment = process.env.NODE_ENV === 'development';

export default configureStore({
  reducer: rootReducer,
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
