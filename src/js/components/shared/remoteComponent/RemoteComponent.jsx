import { lazy, Suspense, useState } from 'react';
//error boundary
import { ErrorBoundary } from 'react-error-boundary';
//error boundary fallback
import RemoteEntryErrorBoundaryFallback from '@/js/generic/RemoteEntryErrorBoundaryFallback';
//helpers
import loadRemote from '@/js/constants/LoadRemote';
//components
import LoadingIcon from '@/js/components/shared/loadingIcon/LoadingIcon';

//React.lazy caches failed imports, that's why a new lazy component is created on every retry
const createLazyRemote = (remote) => lazy(() => loadRemote(remote));

//remote: "remote_name/ExposedModule" (e.g. "second_inner_app/App"), any other prop is passed to the remote component
const RemoteComponent = ({ remote, ...props }) => {
  const [Component, setComponent] = useState(() => createLazyRemote(remote));

  return (
    <ErrorBoundary
      FallbackComponent={RemoteEntryErrorBoundaryFallback}
      onReset={() => {
        //retry loading the remote app
        setComponent(() => createLazyRemote(remote));
      }}
    >
      <Suspense
        fallback={
          <div className="loader-wrapper inline-loader">
            <LoadingIcon />
          </div>
        }
      >
        <Component {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};

export default RemoteComponent;
