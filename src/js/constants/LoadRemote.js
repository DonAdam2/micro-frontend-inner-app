/*Loads a module exposed by a remote app at runtime, e.g. loadRemote('second_inner_app/App').
  Webpack caches a failed static remote (ModuleFederationPlugin "remotes") until the page is refreshed,
  loading the remote manually allows retrying after a failure.
  Same signature as loadRemote of @module-federation/enhanced/runtime, so it can be swapped later.*/

const loadRemoteEntry = (url, scope) =>
  new Promise((resolve, reject) => {
    //remote entry is already loaded
    if (window[scope]) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.onload = () => {
      script.remove();
      if (window[scope]) {
        resolve();
      } else {
        reject(new Error(`Remote app "${scope}" was not found in ${url}`));
      }
    };
    script.onerror = () => {
      //remove the failed script so the next attempt creates a fresh request
      script.remove();
      reject(new Error(`Failed to load remote entry of "${scope}" from ${url}`));
    };
    document.head.appendChild(script);
  });

const loadRemote = async (request) => {
  //"second_inner_app/App" => scope: "second_inner_app", module: "./App"
  const [scope, ...modulePath] = request.split('/'),
    //MF_REMOTES is injected by webpack from buildTools/constants.js
    url = MF_REMOTES[scope];

  if (!url) {
    throw new Error(`Remote app "${scope}" is not defined in buildTools/constants.js`);
  }

  await loadRemoteEntry(url, scope);
  //initialize the shared scope (react, react-dom, ...) and pass it to the remote app
  await __webpack_init_sharing__('default');
  const container = window[scope];
  await container.init(__webpack_share_scopes__.default);
  const factory = await container.get(`./${modulePath.join('/')}`);
  return factory();
};

export default loadRemote;
