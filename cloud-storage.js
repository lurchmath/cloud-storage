
/*
 * This file defines the main interface for this module.  It allows the
 * client to specify what storage method will be used (e.g., Dropbox).
 * The user can then make calls to `openFile()` or `saveFile()` from the
 * standard event handlers in their editor.
 */

/*
 * Global variable to store the filesystem object that will permit reading
 * of folders, and reading and writing of files.  It must be an object
 * with four methods:
 *     getAccess ( successCB, failureCB ) -- to log in to the service, if
 *         needed (or just call the success callback immediately if not)
 *     readFolder ( fullPath, successCB, failureCB ) -- pass the contents
 *         of the given folder, as an array of objects with attributes
 *         `type` (one of "file"/"folder") and `name` (the usual on-disk
 *         name as a string) and any other metadata, or call the failure
 *         callback with error details
 *     readFile ( fullPath, successCB, failureCB ) -- reads a file and
 *         calls the success callback with its contents as text on success,
 *         or the failure callback with error details on failure.
 *     writeFile ( fullPath, successCB, failureCB ) -- writes a file and
 *         calls one of the callbacks, optionally passing details.
 *
 * An example of an object providing these four methods in a simple context
 * is the `JSONFileSystem` defined at the end of this file.
 *
 * Do not change this variable directly.  Call `setFileSystem()`, defined
 * below.
 */
var fileSystemBackEnd;
/*
 * Stores the iframe element that will be used to represent the popup dialog
 * containing a file open/save UI.
 */
var popupDialog;
/*
 * Convenience functions for hiding or showing the dialog.
 */
function showDialog () { popupDialog.style.display = 'block'; }
function hideDialog () { popupDialog.style.display = 'none'; }
/*
 * Convenience function for passing a message to the popupDialog iframe
 */
function tellChild () {
    var args = Array.prototype.slice.apply( arguments );
    popupDialog.contentWindow.postMessage( args, '*' );
}
/*
 * Function to specify the filesystem object, whose format is defined above.
 * In addition to creating the filesystem, if the `popupDialog` has not yet
 * been initialized, this initializes it.  We do that here because (a) we
 * cannot do it at the global scope, since the document body won't be
 * initialized yet, and (b) this function must be called before any dialog
 * can be shown anyway.
 */
function setFileSystem ( fileSystem )
{
    fileSystemBackEnd = fileSystem;
    if ( !popupDialog ) {
        popupDialog = document.createElement( 'iframe' );
        popupDialog.setAttribute( 'src', './dialog.html' );
        popupDialog.style.position = 'absolute';
        popupDialog.style.top = '50%';
        popupDialog.style.left = '50%';
        popupDialog.style.width = '600px';
        popupDialog.style.height = '400px';
        popupDialog.style.marginTop = '-200px';
        popupDialog.style.marginLeft = '-300px';
        popupDialog.style.border = '2px solid black';
        popupDialog.style.zIndex = '100';
        hideDialog();
        document.body.appendChild( popupDialog );
    }
}

/*
 * The last path the user visited using the file open/save dialog window.
 * This will be an array of strings rather than a single string separated
 * by some kind of slashes.
 */
var lastVisitedPath = [ ];
/*
 * If the user browses into a folder, update the `lastVisitedPath` to
 * reflect it.  Handle `..` specially by going up one level.
 */
function updatePath ( browseIntoThis ) {
    if ( browseIntoThis == '..' )
        lastVisitedPath.pop();
    else
        lastVisitedPath.push( browseIntoThis );
}

/*
 * This will be initialized later to an event handler for messages from the
 * file open/save dialog iframe.  Each of the two workhorse functions in
 * this module (`openFile()` and `saveFile()`) installs a different handler
 * in this global variable to respond differently to messages from the
 * dialog.  This handler is referenced in the event listener installed
 * next.
 */
var messageHandler;
/*
 * Receive messages from related windows (most notably the `popupDialog`)
 * and if they are an array, treat it as a LISP-style expression, that is,
 * of the form [command,arg1,arg2,...,argN], and pass it that way to the
 * message handler, if there is one.
 */
window.addEventListener( 'message', function ( event ) {
    if ( !( event.data instanceof Array ) ) return;
    var command = event.data.shift();
    var args = event.data;
    if ( messageHandler ) messageHandler( command, args );
} );

/*
 * We define two placeholder functions that are useful when testing and
 * debugging.  These are used as the default success/failure callbacks in
 * many of the functions below.  This way, if you wish to call `openFile()`
 * or `saveFile()` from the browser console, for example, you do not need
 * to specify callbacks; these debugging callbacks will be used by default,
 * and are useful in such testing/debugging contexts.
 */
function successDebug () {
    console.log( 'Success callback:',
                 Array.prototype.slice.apply( arguments ) );
}
function failureDebug () {
    console.log( 'Failure callback:',
                 Array.prototype.slice.apply( arguments ) );
}

/*
 * Show a "File > Open" dialog box.
 *
 * If the user chooses a file to open, call the success callback with an
 * object containing some file metadata including its full `path`, and a
 * `get ( successCB, failureCB )` method the user can call thereafter.  That
 * method will either call the success callback with the file contents as
 * text, or will call the failure callback with error details.
 *
 * If the user doesn't log in to the service or cancels the dialog, the
 * failure callback will be called.
 *
 * Example use:
 *
 * // prompt the user with a File > Open dialog
 * openFile ( function ( chosenFile ) {
 *     console.log( 'The user chose this file:', chosenFile.path );
 *     // now try to get the file contents from the storage provider
 *     chosenFile.get( function ( contents ) {
 *         // success!
 *         console.log( 'File contents:', contents );
 *     }, function ( error ) { console.log( 'Fetch error:', error ); } );
 * }, function ( error ) { console.log( 'No file chosen:', error ); } );
 */
function openFile ( successCB, failureCB )
{
    if ( !successCB ) successCB = successDebug;
    if ( !failureCB ) failureCB = failureDebug;
    fileSystemBackEnd.getAccess( function () {
        tellChild( 'setDialogType', 'open' );
        messageHandler = function ( command, args ) {
            if ( command == 'dialogBrowse' ) {
                updatePath( args[0] );
                openFile( successCB, failureCB );
            } else if ( command == 'dialogOpen' ) {
                hideDialog();
                var path = lastVisitedPath.concat( [ args[0] ] );
                successCB( {
                    path : path,
                    get : function ( succ, fail ) {
                        if ( !succ ) succ = successDebug;
                        if ( !fail ) fail = failureDebug;
                        fileSystemBackEnd.readFile( path, succ, fail );
                    }
                } );
            } else {
                hideDialog();
                failureCB( 'User canceled dialog.' );
            }
        };
        fileSystemBackEnd.readFolder( lastVisitedPath, function ( list ) {
            list.unshift( 'showList' );
            tellChild.apply( null, list );
        }, failureCB );
        showDialog();
    }, failureCB );
}

/*
 * Failure callback will have reason as a string parameter.
 * Success callback will have an object with file metadata, and a method
 * for resaving the file, update(newContent,successCB,failureCB), in which
 * the first callback will yield a new object to replace the old, and the
 * second will have an error message.
 */
/*
 * Show a "File > Save" dialog box.
 *
 * If the user chooses a destination to save, call the success callback
 * with an object containing some file metadata including its full `path`,
 * and an `update ( content, successCB, failureCB )` method the user can
 * call thereafter to write content to the storage provider at the user's
 * chosen location.  That method will either call the success callback with
 * storage-provider-specific details about the successful write operation,
 * or will call the failure callback with error details.  The content to
 * write must be text data.  Arbitrary JSON data can be saved by first
 * applying `JSON.stringify()` to it, and saving the results as text.
 *
 * The application may retain the object given to the first success callback
 * for longer than is needed to call `update()` once.  Thus, for instance,
 * if the user later chooses to "Save" (rather than "Save as...") the same
 * `update()` function can be called again with new file contents, to save
 * new data at the same chosen location.
 *
 * If the user doesn't log in to the service or cancels the dialog, the
 * failure callback will be called.
 *
 * Example use:
 *
 * // prompt the user with a File > Save dialog
 * saveFile ( function ( saveHere ) {
 *     console.log( 'The user chose to save here:', saveHere.path );
 *     // now try to write the file contents to the storage provider
 *     saveHere.update( stringToSave, function ( optionalData ) {
 *         // success!
 *         console.log( 'File saved.', optionalData );
 *     }, function ( error ) { console.log( 'Write error:', error ); } );
 * }, function ( error ) { console.log( 'No destination chosen:', error ); } );
 */
function saveFile ( successCB, failureCB )
{
    if ( !successCB ) successCB = successDebug;
    if ( !failureCB ) failureCB = failureDebug;
    fileSystemBackEnd.getAccess( function () {
        tellChild( 'setDialogType', 'save' );
        messageHandler = function ( command, args ) {
            if ( command == 'dialogBrowse' ) {
                updatePath( args[0] );
                saveFile( successCB, failureCB );
            } else if ( command == 'dialogSave' ) {
                hideDialog();
                var path = lastVisitedPath.concat( [ args[0] ] );
                successCB( {
                    path : path,
                    update : function ( content, succ, fail ) {
                        if ( !succ ) succ = successDebug;
                        if ( !fail ) fail = failureDebug;
                        fileSystemBackEnd.writeFile( path, content,
                            succ, fail );
                    }
                } );
            } else {
                hideDialog();
                failureCB( 'User canceled dialog.' );
            }
        }
        fileSystemBackEnd.readFolder( lastVisitedPath, function ( list ) {
            list.unshift( 'showList' );
            tellChild.apply( null, list );
        }, failureCB );
        showDialog();
    }, failureCB );
}

/*
 * We provide here an example implementation of a filesystem object, as
 * defined at the top of this file.  It is a read-only filesystem
 * represented by a JSON hierarchy of files and folders.
 *
 * In a JSON filesystem, a file is an object with `type:'file'` and
 * `contents:'some text'` and any other metadata you wish to add.
 * A folder is an object with `type:'folder'` and `contents` mapping to an
 * object whose keys are names and whose values are files or folders.
 * A JSON filesystem is a folder object serving as the root.
 * JSON filesystems are static, just used for testing; no need to be fancy.
 *
 * Example:
 *
 * setFileSystem( new JSONFileSystem( {
 *     type : 'folder', // filesystem root
 *     contents : {
 *         'example.txt' : {
 *             type : 'file',
 *             contents : 'This is an example text file.\nThat\'s all.'
 *         },
 *         'My Pictures' : {
 *             type : 'folder',
 *             contents : {
 *                  'README.md' : {
 *                      type : 'file',
 *                      contents : 'No photos yet.\n\n# SO SAD'
 *                  }
 *             }
 *         }
 *     }
 * } ) );
 */
function JSONFileSystem ( jsonObject )
{
    /*
     * Utility function for walking paths from the root into the filesystem
     */
    function find ( fullPath, type ) {
        var walk = jsonObject;
        for ( var i = 0 ; i < fullPath.length ; i++ ) {
            if ( !walk.hasOwnProperty( 'contents' ) )
                throw( 'Invalid JSON filesystem structure in ' + fullPath );
            if ( !walk.contents.hasOwnProperty( fullPath[i] ) )
                throw( 'Could not find the folder specified: ' + fullPath );
            walk = walk.contents[fullPath[i]];
        }
        if ( walk.type != type )
            throw( 'Path does not point to a ' + type + ': ' + fullPath );
        return walk;
    }
    return {
        contents : jsonObject,
        /*
         * No login required; just call success.
         */
        getAccess : function ( successCB, failureCB ) { successCB(); },
        /*
         * Convert JSONFileSystem format into format expected by
         * `readFolder()`
         */
        readFolder : function ( fullPath, successCB, failureCB ) {
            try {
                var folder = find( fullPath, 'folder' );
                var contents = [ ];
                for ( var key in folder.contents ) {
                    if ( folder.contents.hasOwnProperty( key ) ) {
                        contents.push( {
                            name : key,
                            type : folder.contents[key].type
                        } );
                    }
                }
                if ( folder != jsonObject )
                    contents.unshift( { name : '..', type : 'folder' } );
                successCB( contents );
            } catch ( error ) { failureCB( error ); }
        },
        /*
         * Find file and return contents if it exists
         */
        readFile : function ( fullPath, successCB, failureCB ) {
            try { successCB( find( fullPath, 'file' ) ); }
            catch ( error ) { failureCB( error ); }
        },
        /*
         * Always fail; this is a read-only filesystem
         * (It's just for testing/debugging.)
         */
        writeFile : function ( fullPath, successCB, failureCB ) {
            failureCB( 'Cannot write to a static filesystem' );
        }
    }
}
