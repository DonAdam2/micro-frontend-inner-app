/*Loads a module exposed by a remote app at runtime, e.g. loadRemote('second_inner_app/App').
  Webpack caches a failed static remote (ModuleFederationPlugin "remotes") until the page is refreshed,
  loading the remote manually allows retrying after a failure.
  Same signature as loadRemote of @module-federation/enhanced/runtime, so it can be swapped later.*/

/*remote apps urls are loaded at runtime from remotes.json (next to index.html), so they can be changed without rebuilding
  the current app, e.g. { "inner_app": "https://inner-app.example.com" }
  it's emitted by webpack from buildTools/constants.js and the docker image overwrites it from the REMOTE_<APP_NAME>
  environment variables (docker/40-remotes-json.sh)*/
let remotesPromise;

const getRemotes = () => {
  if (!remotesPromise) {
    remotesPromise = fetch(`${__webpack_public_path__}remotes.json`, { cache: 'no-cache' })
      .then((response) => (response.ok ? response.json() : {}))
      //the urls of buildTools/constants.js (MF_REMOTES) are used if remotes.json can't be loaded
      .catch(() => ({}))
      .then((runtimeRemotes) => ({
        //MF_REMOTES is injected by webpack from buildTools/constants.js
        ...MF_REMOTES,
        ...Object.fromEntries(
          Object.entries(runtimeRemotes).map(([name, origin]) => [
            name,
            `${origin.replace(/\/$/, '')}/remoteEntry.js`,
          ])
        ),
      }));
  }
  return remotesPromise;
};

//pending and loaded remote entries, so a remote requested by several components at once is loaded only once
const remoteEntries = new Map();

const loadRemoteEntry = (url, scope) => {
  //remote entry is already loaded
  if (window[scope]) {
    return Promise.resolve();
  }
  if (remoteEntries.has(scope)) {
    return remoteEntries.get(scope);
  }

  const promise = new Promise((resolve, reject) => {
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
  }).catch((error) => {
    //forget the failed attempt so it can be retried
    remoteEntries.delete(scope);
    throw error;
  });

  remoteEntries.set(scope, promise);
  return promise;
};

const loadRemote = async (request) => {
  //"second_inner_app/App" => scope: "second_inner_app", module: "./App"
  const [scope, ...modulePath] = request.split('/'),
    url = (await getRemotes())[scope];

  if (!url) {
    throw new Error(
      `Remote app "${scope}" is not defined in buildTools/constants.js or remotes.json`
    );
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
