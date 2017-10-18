
# Cloud Storage Module

This module creates a very small API for interacting with cloud storage
providers in a way that's simple, from the point of view of a developer
writing an editor application.  That is, if all you need to support are the
standard dialogs for "File > Open" and "File > Save as..." and "File > Save"
then this is the module for you.  If you have more advanced needs, you will
need a different toolkit.

## Usage

Import the relevant files into your page.  You can use a CDN, like so:
```html
<!-- The main file, essential: -->
<script src='https://cdn.jsdelivr.net/gh/lurchmath/cloud-storage@v2.0.1/release/cloud-storage.js'></script>
<!-- If you want the Dropbox backend, which you probably do: -->
<script src='https://unpkg.com/dropbox/dist/Dropbox-sdk.min.js'></script>
<script src='https://cdn.jsdelivr.net/gh/lurchmath/cloud-storage@v2/release/dropbox-backend.js'></script>
<!-- If you want the LocalStorage backend also: -->
<script src='https://cdn.jsdelivr.net/gh/lurchmath/cloud-storage@v2/release/localstorage-backend.js'></script>
```

Call `openFile()` or `saveFile()`.  That's it!  Obviously, you'll want to
pass parameters to those functions to customize what to save or what to do
with opened files, so you should see the example in the next section, or the
documented source code for those two functions, about half way through
[cloud-storage.js](https://github.com/lurchmath/cloud-storage/blob/master/source/cloud-storage.js).

Furthermore, if you import the Dropbox backend, you will *need* to copy
[the login handler page](release/dropbox-login.html) into the same folder as
the page including the scripts.  Furthermore, you'll need to permit your
Dropbox app to redirect to that page, using [the Dropbox Developer app
dashboard](https://www.dropbox.com/developers/apps).

## Example

See the [simple example
page](http://lurchmath.github.io/cloud-storage/example/example.html) for an
example of how the various storage options and functions work.

The source code for that page [is documented with
comments](https://github.com/lurchmath/cloud-storage/blob/master/example/example.html).

## Status

Right now three data storage backends are supported.

 * [Dropbox](http://dropbox.com)
 * A JSON-based filesystem that is of little use in applications (because it
   exists only in memory while the page is loaded, and thus is not
   persistent) but is a nice example for developers and testers.
 * A LocalStorage-based filesystem that does persist across page loads, but
   is only one flat folder (no ability to create subfolders) due to the
   simple API exposed by this library.  (The intent is not to expose folder
   manipulation tools, because cloud storage platforms already do so, thus
   keeping the API here very simple.)

To add a new backend, mimic the work done in
[dropbox-backend.js](https://github.com/lurchmath/cloud-storage/blob/master/source/dropbox-backend.js) and create your own backend.
Cloud storage providers besides Dropbox are welcome!

There are other things that could be improved about this project.
See [the to-do list](TODO.md) for details.

## License

[![LGPLv3](https://www.gnu.org/graphics/lgplv3-147x51.png)](https://www.gnu.org/licenses/lgpl-3.0.en.html)
