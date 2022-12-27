const loggingMiddleware = () => (next) => (action) => {
  // Our middleware
  console.log(`Redux Logging middleware:`, action);
  // call the next function
  next(action);
};

export default loggingMiddleware;
