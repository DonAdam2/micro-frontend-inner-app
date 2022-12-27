import { createRoot } from 'react-dom/client';
//import meta image
import '@/public/assets/images/metaImage.jpg';
//root component
import App from './App';
import { Provider } from 'react-redux';
import store from '@/js/store/store';

const container = document.getElementById('root'),
  root = createRoot(container);

root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
