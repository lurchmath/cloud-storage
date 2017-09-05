
// Requires that the Dropbox class be defined.  To ensure this, include the
// following script in your page before this one:
//     https://unpkg.com/dropbox/dist/Dropbox-sdk.min.js

function DropboxFileSystem ( clientID )
{
    this.clientID = clientID;
    var that = this;
    window.addEventListener( 'message', function ( event ) {
        try {
            var message = JSON.parse( event.data );
            if ( !( message instanceof Array ) ) return;
            var command = message.shift();
            var args = message;
            if ( command == 'dialogCancel' )
                that.dialogCancel.apply( null, args );
            if ( command == 'dialogLogin' )
                that.dialogLogin.apply( null, args );
        } catch ( e ) { }
    } );
}

DropboxFileSystem.prototype.getAccess = function ( successCB, failureCB )
{
    if ( this.dropbox ) return successCB();
    var loginWindow = window.open( './dropbox-login.html' );
    this.dialogCancel = function () {
        loginWindow.close();
        failureCB.apply( [ 'cancel' ].concat(
            Array.prototype.slice.apply( arguments ) ) );
    }
    var that = this;
    this.dialogLogin = function ( accountData ) {
        loginWindow.close();
        that.accountData = accountData;
        that.dropbox = new Dropbox( {
            accessToken : accountData.access_token
        } );
        successCB();
    }
    loginWindow.onload = function () {
        loginWindow.postMessage( [ 'setClientID', that.clientID ], '*' );
    }
}

DropboxFileSystem.prototype.readFolder =
    function ( fullPath, successCB, failureCB )
{
    if ( !this.dropbox )
        failureCB( 'The user has not logged in to Dropbox.' );
    this.dropbox
    .filesListFolder( { path : fullPath.join( '/' ) } )
    .then( function ( response ) {
        var result = [ ];
        for ( var i = 0 ; i < response.entries.length ; i++ )
            result.push( {
                type : response.entries[i]['.tag'],
                name : response.entries[i].name
            } );
        successCB( result );
    } )
    .catch( failureCB );
}

DropboxFileSystem.prototype.readFile =
    function ( fullPath, successCB, failureCB )
{
    if ( !this.dropbox )
        failureCB( 'The user has not logged in to Dropbox.' );
    this.dropbox.filesDownload( {
        path : '/' + fullPath.join( '/' )
    } )
    .then( function ( response ) {
        var savedFile = response.fileBlob;
        var reader = new FileReader();
        reader.onload = function () { successCB( reader.result ); };
        reader.onerror = function () { failureCB( reader.error ); };
        reader.readAsText( savedFile );
    } ).catch( function ( error ) {
        failureCB( error );
    } );
}

DropboxFileSystem.prototype.writeFile =
    function ( fullPath, content, successCB, failureCB )
{
    if ( !this.dropbox )
        failureCB( 'The user has not logged in to Dropbox.' );
    var mode = { };
    mode['.tag'] = 'overwrite';
    this.dropbox.filesUpload( {
        contents : content,
        path : '/' + fullPath.join( '/' ),
        mode : mode,
        autorename : false
    } )
    .then( function ( response ) {
        successCB( response );
    } ).catch( function ( error ) {
        failureCB( error );
    } );
}
