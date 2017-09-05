
# Cloud Storage Module

This module creates a very small API for interacting with cloud storage
providers in a way that's simple, from the point of view of a developer
writing an editor application.  That is, if all you need to support are the
standard dialogs for "File > Open" and "File > Save as..." and "File > Save"
then this is the module for you.  If you have more advanced needs, you will
need a different toolkit.

## Status

Right now only two data storage backends are supported.

 * [Dropbox](http://dropbox.com)
 * A static, JSON-based filesystem that is of little use in applications,
   but is a nice example for developers and testers.

To add a new backend, mimic the work done in
[dropbox-backend.js](dropbox-backend.js) and create your own backend.

## Example

Clone this repository to your hard drive, serve it up with
`python -m SimpleHTTPServer 8000` in the repository folder and visit
[http://localhost:8000/test.html](http://localhost:8000/test.html).

To see how that page works, read [its documented source code](test.html).

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

There are several things that need to be improved about this project.
See [the to-do list](TODO.md) for details.

## License

[![LGPLv3](https://www.gnu.org/graphics/lgplv3-147x51.png)](https://www.gnu.org/licenses/lgpl-3.0.en.html)
