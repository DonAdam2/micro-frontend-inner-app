const RemoteEntryErrorBoundaryFallback = ({ resetErrorBoundary }) => (
  <div>
    <h3>This feature is not working right now, please try again later</h3>
    <button onClick={resetErrorBoundary}>Try Again</button>
  </div>
);

export default RemoteEntryErrorBoundaryFallback;
