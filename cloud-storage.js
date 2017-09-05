
var fileSystemBackEnd;
var messageHandler;
var popupDialog;
var lastVisitedPath = [ ];

function updatePath ( browseIntoThis ) {
    if ( browseIntoThis == '..' )
        lastVisitedPath.pop();
    else
        lastVisitedPath.push( browseIntoThis );
}

window.addEventListener( 'message', function ( event ) {
    if ( !( event.data instanceof Array ) ) return;
    var command = event.data.shift();
    var args = event.data;
    if ( messageHandler ) messageHandler( command, args );
} );

function tellChild () {
    var args = Array.prototype.slice.apply( arguments );
    popupDialog.contentWindow.postMessage( args, '*' );
}
function showDialog () { popupDialog.style.display = 'block'; }
function hideDialog () { popupDialog.style.display = 'none'; }

function setFileSystem ( fileSystem )
{
    fileSystemBackEnd = fileSystem;
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

function successDebug () {
    console.log( 'Success callback:',
                 Array.prototype.slice.apply( arguments ) );
}
function failureDebug () {
    console.log( 'Failure callback:',
                 Array.prototype.slice.apply( arguments ) );
}

/*
 * Failure callback will have reason as a string parameter.
 * Success callback will have an object with file metadata, and a method
 * for fetching the file, get(successCB,failureCB), in which the first
 * callback will have the file contents, and the second will have an error
 * message.
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
 * In a JSON filesystem, a file is an object with `type:'file'` and
 * `contents:'some text'` and any other metadata you wish to add.
 * A folder is an object with `type:'folder'` and `contents` mapping to an
 * object whose keys are names and whose values are files or folders.
 * A JSON filesystem is a folder object serving as the root.
 * JSON filesystems are static, just used for testing; no need to be fancy.
 */
function JSONFileSystem ( jsonObject )
{
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
        getAccess : function ( successCB, failureCB ) { successCB(); },
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
        readFile : function ( fullPath, successCB, failureCB ) {
            try { successCB( find( fullPath, 'file' ) ); }
            catch ( error ) { failureCB( error ); }
        },
        writeFile : function ( fullPath, content, successCB, failureCB ) {
            failureCB( 'Cannot write to a static filesystem' );
        }
    }
}
