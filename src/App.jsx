import React, { lazy, Suspense } from 'react';
import { hot } from 'react-hot-loader/root';
import { Provider } from 'react-redux';
// required for babel polyfills
import 'regenerator-runtime/runtime';
//error boundary
import { ErrorBoundary } from 'react-error-boundary';
//error boundary fallback
import ErrorBoundaryFallback from './js/generic/ErrorBoundaryFallback';
//store
import configureStore from './js/store/configureStore';
//components
import LoadingIcon from './js/components/shared/loadingIcon/LoadingIcon';
//styles
import './scss/global.scss';
//constants
import { slides } from './js/constants/AppConstants';
//components
import Carousel from './js/components/shared/carousel/Carousel';

const TestComponent = lazy(() => import('./js/containers/TestComponent'));

const store = configureStore();

const App = () => (
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
			<Carousel slides={slides} isPageBackground />
			<TestComponent />
		</ErrorBoundary>
	</Suspense>
);

//wrapper for locale development of the current app
export const InnerApp = hot(() => (
	<Provider store={store}>
		<App />
	</Provider>
));

export default App;
