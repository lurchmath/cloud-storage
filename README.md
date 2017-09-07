
# Cloud Storage Module

This module creates a very small API for interacting with cloud storage
providers in a way that's simple, from the point of view of a developer
writing an editor application.  That is, if all you need to support are the
standard dialogs for "File > Open" and "File > Save as..." and "File > Save"
then this is the module for you.  If you have more advanced needs, you will
need a different toolkit.

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
[dropbox-backend.js](dropbox-backend.js) and create your own backend.

## Example

See the [simple test
page](http://lurchmath.github.io/cloud-storage/test.html) for an example of
how the various storage options and functions work.

The source code for that page [is documented with comments](test.html).

## Usage

Import [cloud-storage.js](cloud-storage.js) into your page.  If you want to
use the Dropbox backend, you'll need to also import
[the Dropbox SDK](https://unpkg.com/dropbox/dist/Dropbox-sdk.min.js) and
[dropbox-backend.js](dropbox-backend.js) (in that order).

Call `openFile()` or `saveFile()`.  That's it!  Obviously, you'll want to
pass parameters to those functions to customize what to save or what to do
with opened files, so you should see the documented source code for those
two functions, about half way through [cloud-storage.js](cloud-storage.js).

## Status

There are a few things that need to be improved about this project.
See [the to-do list](TODO.md) for details.

## License

[![LGPLv3](https://www.gnu.org/graphics/lgplv3-147x51.png)](https://www.gnu.org/licenses/lgpl-3.0.en.html)
