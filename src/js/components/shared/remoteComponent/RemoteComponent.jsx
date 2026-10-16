import { lazy, Suspense, useState } from 'react';
//error boundary
import { ErrorBoundary } from 'react-error-boundary';
//error boundary fallback
import RemoteEntryErrorBoundaryFallback from '@/js/generic/RemoteEntryErrorBoundaryFallback';
//helpers
import loadRemote from '@/js/constants/LoadRemote';
//components
import LoadingIcon from '@/js/components/shared/loadingIcon/LoadingIcon';

/*remote components are cached, so each remote is loaded only once (e.g. it is not loaded again when switching routes)
a remote that failed to load is loaded again on the next mount or when clicking try again*/
const remoteComponents = new Map();

const getRemoteComponent = (remote) => {
  const cached = remoteComponents.get(remote);
  if (cached && !cached.hasFailed) {
    return cached.Component;
  }

  const entry = { hasFailed: false };
  //React.lazy caches failed imports, that's why a new lazy component is created after a failure
  entry.Component = lazy(() =>
    loadRemote(remote).catch((error) => {
      entry.hasFailed = true;
      throw error;
    })
  );
  remoteComponents.set(remote, entry);
  return entry.Component;
};

//remote: "remote_name/ExposedModule" (e.g. "second_inner_app/App"), any other prop is passed to the remote component
const RemoteComponent = ({ remote, ...props }) => {
  const [Component, setComponent] = useState(() => getRemoteComponent(remote));

  return (
    <ErrorBoundary
      FallbackComponent={RemoteEntryErrorBoundaryFallback}
      onReset={() => {
        //retry loading the remote app
        setComponent(() => getRemoteComponent(remote));
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
