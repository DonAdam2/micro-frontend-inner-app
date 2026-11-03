// slices
import innerApp from './app/slices/AppSlice';
/* PLOP_INJECT_IMPORT */

/*every slice name (key and createSlice name) starts with the prefix of the current app: "inner",
so it never collides with the slices of the host app ("container") or the other remote apps ("secondInner")
when they are injected into the same store, and its action types are unique too (e.g. innerApp/updateTestString)*/
export const reducerSlices = {
  innerApp,
  /* PLOP_INJECT_REDUCER_SLICE */
};
