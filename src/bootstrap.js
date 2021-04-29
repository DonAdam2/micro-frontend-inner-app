import React from 'react';
import ReactDOM from 'react-dom';
//import meta image
import './assets/images/metaImage.jpg';
// required for babel polyfills
import 'regenerator-runtime/runtime';
//root component
import App from './App';
//styles
import './scss/global.scss';

ReactDOM.render(<App />, document.getElementById('root'));
