import React, { lazy, Suspense } from 'react';
import { hot } from 'react-hot-loader/root';
//error boundary
import { ErrorBoundary } from 'react-error-boundary';
//error boundary fallback
import ErrorBoundaryFallback from './js/generic/ErrorBoundaryFallback';
//components
import LoadingIcon from './js/components/shared/loadingIcon/LoadingIcon';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureStore from './js/store/configureStore';
const TestComponent = lazy(() => import('./js/containers/TestComponent'));
const store = configureStore();
const App = ({ mango }) => {
	console.log('this the parent props', mango);
	return (
		<Provider store={store}>
			<BrowserRouter>
				<Suspense
					fallback={
						<div className="loader-wrapper">
							<LoadingIcon />
						</div>
					}
				>
					<ErrorBoundary
						FallbackComponent={ErrorBoundaryFallback}
						onReset={() => {
							//Reset the state of your app so the error doesn't happen again
							console.log('Try again clicked');
						}}
					>
						<TestComponent />
					</ErrorBoundary>
				</Suspense>
			</BrowserRouter>
		</Provider>
	);
};

export default hot(App);
