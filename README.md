
# Cloud Storage Module

This module creates a very small API for interacting with cloud storage
providers in a way that's simple, from the point of view of a developer
writing an editor application.  That is, if all you need to support are the
standard dialogs for "File > Open" and "File > Save as..." and "File > Save"
then this is the module for you.  If you have more advanced needs, you will
need a different toolkit.

## Usage

 1. Import the relevant files into your page.  You need at least the main
    file, `cloud-storage.js`.  You can use a CDN, like so:
```html
<script src='https://cdn.jsdelivr.net/gh/lurchmath/cloud-storage@v2.0.1/release/cloud-storage.js'></script>
```
 2. Import whatever back-ends you want to use for storage.  Here are the
    two that are currently supported.
```html
<!-- In-browser storage (yes, OK, that's not cloud storage): -->
<script src='https://cdn.jsdelivr.net/gh/lurchmath/cloud-storage@v2/release/localstorage-backend.js'></script>
<!-- Dropbox storage, which requires two files: -->
<script src='https://unpkg.com/dropbox/dist/Dropbox-sdk.min.js'></script>
<script src='https://cdn.jsdelivr.net/gh/lurchmath/cloud-storage@v2/release/dropbox-backend.js'></script>
```
 3. If you imported the Dropbox backend, then you need to take these
    additional steps:
     * Place a copy of [this file](release/dropbox-login.html) in the same
       folder as your page.
     * Permit your Dropbox app to redirect to that page, using
       [the Dropbox Developer app dashboard](https://www.dropbox.com/developers/apps).
 4. Write scripts that make calls to `openFile()` or `saveFile()` when you
    want them to.  For help in figuring out how to do so:
     * View the [simple example
       page](http://lurchmath.github.io/cloud-storage/example/example.html)
       showcasing this module's functionality
     * View that example's [source code](https://github.com/lurchmath/cloud-storage/blob/master/example/example.html)
       (liberally commented)
     * View [the source code for `cloud-storage.js`](https://github.com/lurchmath/cloud-storage/blob/master/source/cloud-storage.js),
       also liberally commented.  See `openFile()` and `saveFile()` about
       half way through.

## Status

Right now three data storage backends are supported.

 1. [Dropbox](http://dropbox.com) (this is the only one that's actually
    *cloud* storage)

    Its source code is [here](source/dropbox-backend.js).

    To add a new backend, mimic the work done in that file.  Cloud storage
    providers other than Dropbox are very welcome!
 2. A LocalStorage-based filesystem that does persist across page loads, but
    is only one flat folder (no ability to create subfolders) due to the
    simple API exposed by this library.  (This module does not expose folder
    manipulation tools, because cloud storage platforms already do so.
    Consequently, this non-cloud-storage-based filesystem has no folders.)

    Its source code is [here](source/localstorage-backend.js).
 3. A JSON-based filesystem that is of little use in applications (because
    it exists only in memory while the page is loaded, and thus is not
    persistent) but is a nice example for developers and testers.

    Its source code is inside [the `cloud-storage.js` file](source/cloud-storage.js).

Desired future enhancements appear on [the to-do list](TODO.md).

## License

[![LGPLv3](https://www.gnu.org/graphics/lgplv3-147x51.png)](https://www.gnu.org/licenses/lgpl-3.0.en.html)
