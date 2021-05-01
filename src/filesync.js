const dragDrop = require( 'drag-drop' );
const urlParams = new URLSearchParams(window.location.search);
if (!urlParams.get('id')) {
    console.error("[X] No ID Found!");
}

dragDrop( '#dropZone', ( files ) => {
    console.log('a');
    /* const _files = files.map( file => {
        return {
            name: file.name,
            path: file.path,
        };
    } );

    // send file(s) add event to the `main` process
    ipcRenderer.invoke( 'app:on-file-add', _files ).then( () => {
        ipcRenderer.invoke( 'app:get-files' ).then( ( files = [] ) => {
            dom.displayFiles( files );
        } );
    } ); */
} );

function sync() {
    $('#files').empty();
    //
}

$('#drag').on('dragstart', (event) => {
    event.originalEvent.preventDefault();
    ipcRenderer.send('ondragstart', '/absolute/path/to/the/item');
  });