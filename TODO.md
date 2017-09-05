
# To-Do List for Cloud Storage Dialogs

This project was put together rather quickly, and there are many polishing
tasks that should be done to improve the overall quality of this module.
I list them in this file.

## Code style

 * The [cloud-storage.js file](cloud-storage.js) define functions at global
   scope.  Use IIFEs to hide all but the few functions that the module
   should be exposing as its interface.

## Missing pieces

 * Add a `LocalStorage` option in a new file, `localstorage-backend.js`,
   much like `dropbox-backend.js`, but less complex.

## New features

 * Make it so that the user can provide his or her own iframe to use for
   the popup dialogs, rather than having
   [cloud-storage.js](cloud-storage.js) use its own.  The user should be
   able to specify the iframe as many times as they like, so that they can
   provide a new iframe immediately before each call to `openFile()` or
   `saveFile()`, for example.  This will work well for integration into
   TinyMCE.
