import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
//root reducer
import rootReducer from './js/store/rootReducer';
//app
import App from './App';

//wrapper for the parent app
const RemoteInnerApp = ({ store }) => {
	useEffect(() => {
		store.injectReducer('innerApp', rootReducer);
	}, [store]);

	return (
		<Provider store={store || {}}>
			<App />
		</Provider>
	);
};

export default RemoteInnerApp;
