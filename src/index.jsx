/*We need this extra layer of indirection because it gives Webpack a chance to load all the imports it needs to render the remote app.

  Otherwise, you would see an error along the lines of:

  Shared module is not available for eager consumption*/

// Note: It is important to import bootstrap dynamically using import() otherwise you will also see the same error.
import('./bootstrap');
