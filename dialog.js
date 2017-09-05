
var dialogType;

function tellParent ( message ) {
    parent.postMessage( message, '*' );
}

function addClass ( element, className ) {
    var classes = element.getAttribute( 'class' ).split( ' ' );
    classes.push( className );
    element.setAttribute( 'class', classes.join( ' ' ) );
}
function removeClass ( element, className ) {
    var classes = element.getAttribute( 'class' ).split( ' ' );
    for ( var i = classes.length - 1 ; i >= 0 ; i-- )
        if ( classes[i] == className )
            classes.splice( i, 1 );
    element.setAttribute( 'class', classes.join( ' ' ) );
}
function select ( element ) {
    var others = document.getElementsByClassName( 'selectedItem' );
    for ( var i = others.length - 1 ; i >= 0 ; i-- )
        removeClass( others[i], 'selectedItem' );
    if ( element ) {
        addClass( element, 'selectedItem' );
        fileNameInput.value = element.textContent;
    } else {
        fileNameInput.value = '';
    }
}

function showList ( list )
{
    filesList.innerHTML = '';
    for ( var i = 0 ; i < list.length ; i++ ) {
        filesList.innerHTML +=
            '<div class="filesListItem" data-type="' + list[i].type + '">'
          + list[i].name + '</div>';
    }
    var items = filesList.getElementsByClassName( 'filesListItem' );
    for ( var i = 0 ; i < items.length ; i++ ) {
        items[i].addEventListener( 'click', function ( event ) {
            event.preventDefault();
            select( event.target );
        } );
        items[i].addEventListener( 'dblclick', function ( event ) {
            event.preventDefault();
            var type = event.target.getAttribute( 'data-type' );
            if ( type == 'folder' )
                parent.postMessage( [ 'dialogBrowse',
                                      event.target.textContent ], '*' );
            else if ( dialogType == 'open' )
                window.openButton.click();
            else
                window.saveButton.click();
        } );
    }
}

function setDialogType ( type ) {
    dialogType = type;
    select( null );
    if ( type == 'open' ) {
        window.openButton.style.display = 'inline';
        window.saveButton.style.display = 'none';
        window.fileNameInput.style.display = 'none';
    } else {
        window.openButton.style.display = 'none';
        window.saveButton.style.display = 'inline';
        window.fileNameInput.style.display = 'inline';
    }
}

window.addEventListener( 'message', function ( event ) {
    if ( !( event.data instanceof Array ) ) return;
    var command = event.data.shift();
    var args = event.data;
    if ( command == 'setDialogType' ) {
        setDialogType( args[0] );
    } else if ( command == 'showList' ) {
        showList( args );
    }
}, false );

window.onload = function () {
    var ids = [ 'filesList', 'buttonsFooter', 'cancelButton', 'openButton',
        'saveButton', 'fileNameInput' ];
    for ( var i = 0 ; i < ids.length ; i++ )
        window[ids[i]] = document.getElementById( ids[i] );
    window.cancelButton.addEventListener( 'click', function () {
        tellParent( [ 'dialogCancel' ] );
    } );
    window.saveButton.addEventListener( 'click', function () {
        tellParent( [ 'dialogSave', fileNameInput.value ] );
    } );
    window.openButton.addEventListener( 'click', function () {
        tellParent( [ 'dialogOpen', fileNameInput.value ] );
    } );
    setDialogType( 'open' );
    tellParent( 'loaded' );
};
