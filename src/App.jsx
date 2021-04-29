import React, { lazy, Suspense } from 'react';
import { hot } from 'react-hot-loader/root';
import { Provider } from 'react-redux';
//error boundary
import { ErrorBoundary } from 'react-error-boundary';
//error boundary fallback
import ErrorBoundaryFallback from './js/generic/ErrorBoundaryFallback';
//store
import configureStore from './js/store/configureStore';
//components
import LoadingIcon from './js/components/shared/loadingIcon/LoadingIcon';

const TestComponent = lazy(() => import('./js/containers/TestComponent'));

const store = configureStore();

const App = () => {
	return (
		<Provider store={store}>
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
		</Provider>
	);
};

export default hot(App);
