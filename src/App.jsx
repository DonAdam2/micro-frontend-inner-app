import { lazy, Suspense } from 'react';
//error boundary
import { ErrorBoundary } from 'react-error-boundary';
//error boundary fallback
import ErrorBoundaryFallback from './js/generic/ErrorBoundaryFallback';
//styles
import './scss/global.scss';
//constants
import { slides } from './js/constants/AppConstants';
//components
import Carousel from './js/components/shared/carousel/Carousel';
import TestComponent from './js/containers/TestComponent';
import LoadingIcon from './js/components/shared/loadingIcon/LoadingIcon';
//import remote micro frontend lazily
const RemoteApp = lazy(() => import('second_inner_app/App'));

const App = () => (
  <ErrorBoundary
    FallbackComponent={ErrorBoundaryFallback}
    onReset={() => {
      //Reset the state of your app so the error doesn't happen again
      console.log('Try again clicked');
    }}
  >
    <Suspense
      fallback={
        <div className="loader-wrapper">
          <LoadingIcon />
        </div>
      }
    >
      <RemoteApp />
    </Suspense>
    <Carousel slides={slides} isPageBackground />
    <TestComponent />
  </ErrorBoundary>
);

export default App;
