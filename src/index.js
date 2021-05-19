/* MAIN ELECTRON.JS PROCESS */
/* MOST OF THIS IS BOILERPLATE FROM THE CREATE-ELECTRON-APP COMMAND */
const { app, BrowserWindow, ipcMain: ipc, dialog } = require('electron');
const { v4: uuid } = require('uuid');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const FILESERVER = 'http://epiclabs.tk';
const http = require('http'); //MAKE SURE TO UPDATE WHEN UPDATING FILESERVER

// set up projects folder
const PROJ_LOC = path.join(app.getPath('userData'), 'projects');
const PROJ_JSON = path.join(PROJ_LOC, 'projects.json');
if (!fs.existsSync(PROJ_LOC)){
  console.log("[i] Creating data folder"); //TEMP
  fs.mkdirSync(PROJ_LOC);
}
if (!fs.existsSync(PROJ_JSON)){
  console.log("[i] Creating project json file"); //TEMP
  // create blank projects.json file
  fs.writeFileSync(PROJ_JSON, JSON.stringify({}));
}
//ANCHOR: ensure all projects have a proper folder and repair if needed
fs.readFile(PROJ_JSON, (err, data) => {
  data = JSON.parse(data);
  Object.keys(data).forEach(id => {
    if (!fs.existsSync(path.join(PROJ_LOC, id))){
      console.log("[i] Recreating project folder for "+data[id].name); //TEMP
      fs.mkdirSync(path.join(PROJ_LOC, id));
    }
  });
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: "src/icons/epicollab.ico",
    // to enable node.js functions like the filesystem module
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

/* ACTUAL ORIGINAL STUFF STARTS HERE */
// interprocess communication stuffs
//TODO: Maybe replace some of the synchronous stuff with async functions to speed it up a bit

const dlFile = function(url, dest, cb) { //thanks stackoverflow :]
  var file = fs.createWriteStream(dest);
  var request = http.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);  // close() is async, call cb after close completes.
    });
  }).on('error', function(err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (cb) cb(err.message);
  });
};

const sync = function(proj_id, callback) {
  fs.readFile(PROJ_JSON, (err, data) => {
    data = JSON.parse(data);
    data = data[proj_id];
    var form_data = new FormData();
    form_data.append('proj_id', proj_id);
    form_data.append('proj_json', JSON.stringify(data));//TODO: FIX ERROR
    form_data.submit(FILESERVER+'/project', (err, res) => {
      if (err) console.error(err);
      // Get data in parts
      var _data = '';
      res.on('readable', () => {
        _data += res.read();
      });
      res.on('end', () => {
        console.log(_data)//TEMP
        _data = JSON.parse(_data);
        var old_json = fs.readFileSync(PROJ_JSON);  // get old project contents
        var new_json = JSON.parse(old_json);
        new_json[proj_id] = _data;
        // CALLBACK
        if (callback) {callback(_data['name'])}
        // write new json to file
        fs.writeFileSync(PROJ_JSON, JSON.stringify(new_json));

        to_dl = _data.files;
        console.log(to_dl)//TEMP
        let c = 0;
        if (!fs.existsSync(path.join(PROJ_LOC, proj_id))){
          console.log("[i] Recreating project folder for "+_data['name']); //TEMP
          fs.mkdirSync(path.join(PROJ_LOC, proj_id));
        }
        Object.keys(to_dl).forEach(file => {
          //TODO: For each file, download if not already downloaded
          if (fs.existsSync(path.join(PROJ_LOC, proj_id, file))) {
            console.log('[i] '+file+' exists!')
            return;
          }
          dlFile(FILESERVER+'/uploads/'+proj_id+'/'+file, path.join(PROJ_LOC, proj_id, file), () => {console.log('[+] '+file+' done');});
        });
      });
    });
  }); 
}

//ANCHOR: new project signal
ipc.on('newProject', (event, arg) => {
  const proj_id = uuid(); // create a UUID for the project
  console.log(arg + ' ' + proj_id); // log project name + uuid
  var old_json = fs.readFileSync(PROJ_JSON);  // get old project contents
  var new_json = JSON.parse(old_json);

  new_json[proj_id] = {
    name: arg,
    files: {}
  };

  console.log("[i] sending new project json to server");
  var form_data = new FormData();
  form_data.append('proj_id', proj_id);
  form_data.append('proj_json', JSON.stringify(new_json[proj_id]));
  form_data.submit(FILESERVER+'/project', (err, res) => {
    if (err) console.error(err);
    // Get data in parts
    _data = '';
    res.on('readable', () => {
      _data += res.read();
    });
    res.on('end', () => {
      //console.log("[i]" + _data);
    });
  });

  //console.log(JSON.parse(old_json));  //TEMP
  //console.log(new_json);  //TEMP
  // write new json to file
  fs.writeFileSync(PROJ_JSON, JSON.stringify(new_json));

  // create project folder for sounds
  if (!fs.existsSync(path.join(PROJ_LOC, proj_id))){
    console.log("[i] Creating data folder"); //TEMP
    fs.mkdirSync(path.join(PROJ_LOC, proj_id));
  }
});

//ANCHOR: list projects signal
ipc.handle('listProjects', (event) => {
  // res = response
  res = fs.readFileSync(PROJ_JSON)
  res = JSON.parse(res);
  return res;
});

//ANCHOR: signal to list files inside project
ipc.on('listFiles', (event, proj_id) => {
  // get list of files used by project
  var proj_files = fs.readFileSync(PROJ_JSON);
  proj_files = JSON.parse(proj_files);
  proj_files = proj_files[proj_id].files;

  // compare to files stored
  var files = fs.readdirSync(PROJ_LOC+'/'+proj_id)
  //console.log(files);     //TEMP
  //console.log(proj_files);
  var file_list = {}
  Object.keys(proj_files).forEach(file => {
    file_list[file] = {
      name: proj_files[file].name,
      synced: false,
    }
    if (files.includes(file)) {
      file_list[file].location = PROJ_LOC+'/'+proj_id+'/'+file;
      file_list[file].synced = true;
    }
  });
  event.reply('files', file_list);
});

//ANCHOR: add file signal
ipc.handle('addFile', (event, arg) => {
  const proj_id = arg[0];
  var res = []
  arg[1].forEach(file => {
    if (file.mime != 'audio/wav') {return;} // Skip to the next file if the current one is not a .wav

    // make sure the id is accurate
    // this essentially just keeps the extension so that nothing dies
    var file_id = 'f' + uuid(); //need the 'f' for html ids cos they need to start with a letter
    file_id += "." + file.name.slice(file.name.indexOf('.', -1) + 1);

    //TODO: send proj_id, file_id, file.name, and file itself to remote server
    var form_data = new FormData();
    form_data.append('file', fs.createReadStream(file.path));
    form_data.append('proj_id', proj_id);
    form_data.append('file_id', file_id);
    form_data.submit(FILESERVER+'/files/new', (err, res) => {
      if (err) console.error(err);
      console.log('[i] ' + file_id + ' sent to server');
    });

    // save file to project folder
    var new_file = path.join(PROJ_LOC, proj_id, file_id);
    console.log("adding file " + file.path + " to project as " + file_id); //TEMP
    console.log("new path will be "+new_file);
    fs.copyFileSync(file.path, new_file);
    // and projects.json
    var old_json = fs.readFileSync(PROJ_JSON);  // get old project contents
    var new_json = JSON.parse(old_json);
    new_json[proj_id].files[file_id] = {
      name: file.name,
      color: 0
    };
    // write new json to file
    fs.writeFileSync(PROJ_JSON, JSON.stringify(new_json));

    res.push(file);
  });
  return res;
});

//ANCHOR: delete file signal
ipc.on('delFile', (event, arg) => {});

//ANCHOR: sync project signal
ipc.on('syncProject', (event, proj_id) => {
  console.log("[i] Syncing project with server...");
  sync(proj_id);
  event.reply('listFiles');
});

//ANCHOR: join project signal
ipc.on('joinProject', (event, proj_id) => {
  console.log("[+] Joining project " + proj_id);
  var old_json = fs.readFileSync(PROJ_JSON);  // get old project contents
  var new_json = JSON.parse(old_json);
  new_json[proj_id] = {
    name: 'ERROR, PLEASE CONTACT EPiC_LABS',
    files: {}
  };
  fs.writeFileSync(PROJ_JSON, JSON.stringify(new_json));
  sync(proj_id, (name) => {event.reply('go', proj_id, name);});
});

//ANCHOR: drag start
ipc.on('ondragstart', (event, arg) => {
  //console.log(arg);
  event.sender.startDrag({
    file: path.join(PROJ_LOC, arg[0], arg[1]),
    icon: 'src/icons/file-earmark-music.png'
  });
});

//ANCHOR: msgboxes
ipc.on('error', (event, msg) => {
  dialog.showErrorBox(msg[0], msg[1]);
});
ipc.on('info', (event, msg) => {
  var options = {
    type: 'info',
    title: msg[0],
    detail: msg[1]
  }
  dialog.showMessageBox(options);
});
ipc.on('warn', (event, msg) => {
  var options = {
    type: 'warning',
    title: msg[0],
    detail: msg[1]
  }
  dialog.showMessageBox(options);
});