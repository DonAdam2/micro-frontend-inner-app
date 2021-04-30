import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
//root reducer
import { reducerSlices } from './js/store/rootReducer';
//app
import App from './App';
//components
import LoadingIcon from './js/components/shared/loadingIcon/LoadingIcon';

//wrapper for the parent app
const RemoteInnerApp = ({ store }) => {
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		store.injectReducer(reducerSlices);
	}, [store]);

	useEffect(() => {
		const state = store.getState ? store.getState() : {};
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
