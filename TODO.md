
# To-Do List for Cloud Storage Dialogs

This project was put together rather quickly, and there are many polishing
tasks that should be done to improve the overall quality of this module.
I list them in this file.

## Code style

 * The [cloud-storage.js file](cloud-storage.js) define functions at global
   scope.  Use IIFEs to hide all but the few functions that the module
   should be exposing as its interface.

## Aesthetics

 * The open/save dialogs are extremely ugly, because near-zero CSS styling
   has been done to them.  Update [dialog.css](dialog.css) to make them more
   beautiful.  Useful notes:
    * Each file/folder in the dialog is a `div` with class `filesListItem`.
    * Each file in the dialog has the attribute `data-type="file"`.
    * Each folder in the dialog has the attribute `data-type="folder"`.
    * The Open, Save, and Cancel buttons are defined in
      [dialog.html](dialog.html), and you can see their element types and
      IDs there.
    * In that same HTML file you will find the IDs for the files list and
      buttons footer.
    * Other tidbits appear in the existing [dialog.css](dialog.css) file.

## Missing pieces

 * Add a `LocalStorage` option in a new file, `localstorage-backend.js`,
   much like `dropbox-backend.js`, but less complex.
 * The [Dropbox back end](dropbox-backend.js) does not call the failure
   callback if the user cancels the login.  I don't yet know how to do this.
   Figure out how and call the failure callback in such cases.

## New features

 * Make it so that the user can provide his or her own iframe to use for
   the popup dialogs, rather than having
   [cloud-storage.js](cloud-storage.js) use its own.  The user should be
   able to specify the iframe as many times as they like, so that they can
   provide a new iframe immediately before each call to `openFile()` or
   `saveFile()`, for example.  This will work well for integration into
   TinyMCE.
