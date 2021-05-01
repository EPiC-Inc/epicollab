const dragDrop = require( 'drag-drop' );
const urlParams = new URLSearchParams(window.location.search);
const proj_id = urlParams.get('id');
if (!proj_id) {
    console.error("[X] No ID Found!");
}

function sync() {
    ipc.send('listFiles', proj_id);
}

//ANCHOR: drag in
dragDrop('#dropZone', (files) => {
    const _files = files.map( file => {
        //console.log(file.type); //TEMP
        return {
            name: file.name,
            path: file.path,
            mime: file.type
        };
    });

    //console.log(_files);    //TEMP
    if (_files == [undefined]) return;

    // send file(s) add event to the `main` process
    ipc.invoke('addFile', [proj_id, _files]).then((res) => {
        if (res.length < 1) {
            ipc.send('error', ['[!] No files could be uploaded!', 'Check that they are in .wav format.']);
        } else if (res.length < _files.length) {
            ipc.send('warn', ['File upload error', '[*] Not all files could be uploaded! Check that they are all in .wav format.']);
        } else if (res.length > _files.length) {
            ipc.send('error', ["[X] This message should never, ever show up.", "This means something is terribly wrong. Please contact EPiC_Labs#2206 on Discord to get it resolved."]);
        }
        sync();
        /* ipc.invoke('app:get-files').then( ( files = [] ) => {
            //display file
        }); */
    });
});

//ANCHOR: drag out
$('#drag').on('dragstart', (event) => {
    event.originalEvent.preventDefault();
    ipcRenderer.send('ondragstart', '/absolute/path/to/the/item');
});

ipc.on('files', (event, res) => {
    $('#files').empty();
    console.log(res);   //TEMP
    Object.keys(res).forEach(file => {
        console.log('abc123');   //TEMP
        var is_synced = res[file].synced;
        var _name = res[file].name;
        // spaghetti code assembly line :]
        var proper_class = 'file';
        if (is_synced) {
            proper_class = 'file file-synced';
        }
        $('#files').append("<div class=\"" + proper_class + "\" id=\"" + file + "\" \
        draggable=\"" + is_synced.toString() + "\"> \
        " + _name + " \
         \
        </div>");
    });
});

sync();