const dragDrop = require( 'drag-drop' );
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