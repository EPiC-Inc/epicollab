/* MAIN ELECTRON.JS PROCESS */
/* MOST OF THIS IS BOILERPLATE FROM THE CREATE-ELECTRON-APP COMMAND */
const { app, BrowserWindow, ipcMain: ipc } = require('electron');
const { v1: uuid, v1 } = require('uuid');
const path = require('path');
const fs = require('fs');

// set up projects folder
var proj_loc = app.getPath('userData') + '/projects';
var proj_json = proj_loc + '/projects.json'
if (!fs.existsSync(proj_loc)){
  console.log("Creating data folder"); //TEMP
  fs.mkdirSync(proj_loc);
}
if (!fs.existsSync(proj_json)){
  console.log("Creating project json file"); //TEMP
  // create blank projects.json file
  fs.writeFileSync(proj_json, JSON.stringify({}));
}

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
  mainWindow.webContents.openDevTools();
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

//ANCHOR: new project signal
ipc.on('newProject', (event, arg) => {
  var proj_uuid = uuid(); // create a UUID for the project
  console.log(arg + ' ' + proj_uuid); // log project name + uuid
  var old_json = fs.readFileSync(proj_json);  // get old project contents
  var new_json = JSON.parse(old_json);

  new_json[proj_uuid] = {
    name: arg,
    files: []
  };
  console.log(JSON.parse(old_json));  //TEMP
  console.log(new_json);  //TEMP

  // write new json to file
  fs.writeFileSync(proj_json, JSON.stringify(new_json));

  // create project folder for sounds
  if (!fs.existsSync(proj_loc+'/'+proj_uuid)){
    console.log("Creating data folder"); //TEMP
    fs.mkdirSync(proj_loc);
  }
});

//ANCHOR: list projects signal
ipc.on('listProjects', (event) => {
  // res = response
  var res = fs.readFileSync(proj_json);
  res = JSON.parse(res);
  event.reply('projects', res);
});