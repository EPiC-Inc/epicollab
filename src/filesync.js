const dragDrop = require( 'drag-drop' );
const { clipboard } = require('electron');
const { contains } = require('jquery');
const urlParams = new URLSearchParams(window.location.search);
const proj_id = urlParams.get('id');
if (!proj_id) {
    console.error("[X] No ID found!");
}
const proj_name = urlParams.get('name');
$("#proj-name").text(proj_name);
if (!proj_name) {
    console.error("[!] No name found!");
}
var waveforms = {};
var dropDisabled = false;

function copyID() {
    clipboard.writeText(proj_id);
}

function sync() {
    ipc.send('listFiles', proj_id);
}
ipc.on('listFiles', () => {
    ipc.send('listFiles', proj_id);
    $('#sync').prop("disabled", false);
});

function dlFiles() {
    ipc.send('syncProject', proj_id);
    $('#sync').prop("disabled", true);
}

function getWaveColor(color) {
    switch(color) {
        // COLOR DETECTIONS! YAY
        case 0:
            return 'violet';
        case 1:
            return 'orange';
        default:
            return 'violet';
    }
}
function getPlayedColor(color) {
    switch(color) {
        // COLOR DETECTIONS! YAY
        case 0:
            return 'purple';
        case 1:
            return 'red';
        default:
            return 'purple';
    }
}

//ANCHOR: drag in
$('#dropZone').on('drop', (event) => {
    if (dropDisabled) {return;}
});
document.addEventListener('dragover', (event) => {
    console.log('a');
    if (dropDisabled) {$("#dropZone").removeClass('overlay');}
    event.preventDefault();
    event.stopPropagation();
});
$("#dropZone").on('dragleave', (event) => {
    $("#dropZone").removeClass('overlay');
    event.preventDefault();
    event.stopPropagation();
});

dragDrop('#dropZone', (files) => {
    if (dropDisabled) {return;}

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
            return;
        } else if (res.length < _files.length) {
            ipc.send('warn', ['File upload error', '[*] Not all files could be uploaded! Check that they are all in .wav format.']);
        } else if (res.length > _files.length) {
            ipc.send('error', ["[X] This message should never, ever show up.", "This means something is terribly wrong. Please contact EPiC_Labs#2206 on Discord to get it resolved."]);
        }
        sync();
        // TODO: check if the uploaded files have already-used names

        /* ipc.invoke('app:get-files').then( ( files = [] ) => {    //TEMP
            //display file
        }); */
    });
});

$("#dropZone").on("mouseenter", (event) => {
    dropDisabled = false;
    //$("#dropZone").removeClass("stop-blue-overlay");
});

ipc.on('files', (event, res) => {
    $('#files').empty();
    //console.log(res);   //TEMP
    Object.keys(res).forEach(file => {
        var is_synced = res[file].synced;
        var _name = res[file].name;
        // spaghetti code assembly line :]
        var proper_class = 'file';
        var name_append = ' [not synced]';
        if (is_synced) {
            proper_class = 'file file-synced';
            name_append = '';
        }
        var new_child = $("<div class=\"" + proper_class + "\" \
        draggable=\"" + is_synced.toString() + "\"> \
        " + _name + name_append + " \
        <button onclick=\"waveforms[\'"+file+"\'].pp()\" class=\"file-btn\" id=\"" + file + "btn\">Play</button> \
        </div>");
        new_child.attr('id', file);
        new_child.on('dragstart', (event) => {
            dropDisabled = true;
            //$("#dropZone").addClass("stop-blue-overlay");
            console.log('file drag started');
            event.originalEvent.preventDefault();
            ipc.send('ondragstart', [proj_id, file]);
        });
        $('#files').append(new_child);

        if (is_synced) {
            var ws = WaveSurfer.create({
                container: document.getElementById(file),
                waveColor: getWaveColor(res[file].color),
                progressColor: getPlayedColor(res[file].color),
                height: '64',
            });
            ws.load(res[file].location);
            ws.on('dblclick', () => {//STUB: NOT WORKING?
                console.log('ss')
                this.seekTo(0);
            });
            ws.on('finish', () => {
                ws.seekTo(0);
                var btn = document.getElementById(file+'btn');
                btn.innerHTML = "Play";
            });
            ws.pp = function() {
                this.playPause();
                var btn = document.getElementById(file+'btn');
                if (btn.innerHTML == "Play") {
                    btn.innerHTML = "Pause";
                } else {
                    btn.innerHTML = "Play";
                }
            }
        }
        // add to global waveforms list
        waveforms[file] = ws;
    });

    //ANCHOR: drag out
});

sync();

//ANCHOR: Search
$("#fileSearch").on("keyup", () => {
    var val = $("#fileSearch").val().toLowerCase();
    $("#files .file").filter(function() {
      $(this).toggle($(this).text().toLowerCase().indexOf(val) > -1)
    });
});