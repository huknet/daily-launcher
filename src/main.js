const { app, BrowserWindow, ipcMain, dialog } = require('electron')

const { autoUpdater } = require('electron-updater');

const fs = require('fs');
const process = require('process');

const path = {
  main: `${process.resourcesPath}\\..`,
  resources: `${process.resourcesPath}`,
  settings: `${process.resourcesPath}\\settings.json`,
  logs: `${process.resourcesPath}\\logs`,
  log: `${process.resourcesPath}\\logs\\launcher.log`  
};

let mainWindow, settingsWindow;

var settings = {
  name: '',
  server: 0,
  memory: 1536,
  path: `${path.game}`
};

const createWindow = () => {
  mainWindow = new BrowserWindow(
    {
      width: 950,
      height: 580,
      transparent: true,
      webPreferences: {
        contextIsolation: false,
        nodeIntegration: true,
        nodeIntegrationInWorker: true
      },
      frame: false,
      resizable: false
    }
  );

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  mainWindow.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });

  // mainWindow.webContents.openDevTools()

  // mainWindow.on('closed', () => {
  //   check_file_stop = true;
  // });
};

const createSettings = () => {

  settingsWindow = new BrowserWindow
  (
    {
      width: 350,
      height: 250,
      transparent: true,
      frame: false,
      // icon: __dirname + '/img/icon-logo.ico',
      webPreferences: {
        contextIsolation: false,
        nodeIntegration: true,
        nodeIntegrationInWorker: true
      },
      show: false
    }
  );

  settingsWindow.loadURL(`file://${__dirname}/settings.html`);
};

app.on('ready', () => {
  createWindow();
  createSettings();

  writeLog(`Приложение запущено ${process.platform}`);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('launcher-close', function() {
  app.quit();
});

ipcMain.on('launcher-hide', function () {
  mainWindow.minimize();
});

ipcMain.on('launcher-settings', () => {
  settingsWindow.show();
  settingsWindow.webContents.send('settings-open', settings.memory, settings.path);
  // settingsWindow.webContents.openDevTools();
});

ipcMain.on('settings-close', (evt, memory) => {
  settingsWindow.hide();
  if(memory)
  {
    settings.memory = memory;
    updateSettings();
  }
});

ipcMain.on('select-game-path', () => {

  dialog.showOpenDialog(settingsWindow, {
    properties: ['openDirectory']
  }).then(result => {
    if(!result.canceled)
    {
      settings.path = result.filePaths[0];
      updateSettings();

      settingsWindow.webContents.send('settings-open', settings.memory, settings.path);
    }
  }).catch(err => {
    
  })
});

// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit();
//   }
// });

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

function writeLog(message) {

  var date = new Date();

  var time_hours = date.getHours();
  var time_minutes = date.getMinutes();
  var time_seconds = date.getSeconds();
  var time_milliseconds = date.getMilliseconds();

  if(time_hours < 10) {
    time_hours = `0${time_hours}`;
  }

  if(time_minutes < 10) {
    time_minutes = `0${time_minutes}`;
  }

  if(time_seconds < 10) {
    time_seconds = `0${time_seconds}`;
  }

  if(time_milliseconds < 10) {
    time_milliseconds = `00${time_milliseconds}`;
  }
  else if(time_milliseconds < 100) {
    time_milliseconds = `0${time_milliseconds}`;
  }

  var date_string = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
  var time_string = `${time_hours}:${time_minutes}:${time_seconds}.${time_milliseconds}`;

  fs.access(path.logs, (error) => {
    if(error) {
      fs.mkdirSync(path.logs);
    }

    fs.access(path.log, (error) => {
      if(error) {
        fs.writeFileSync(path.log, `[${date_string} ${time_string}] ${message}\n`);
      }
      else {
        fs.appendFileSync(path.log, `[${date_string} ${time_string}] ${message}\n`);
      }
    });
  });
}

function getLauncherVersion()
{
  console.log(app.getVersion());
}

function updateSettings()
{
  var json_data = JSON.stringify(settings, null, '\t');
  
  fs.writeFileSync(path.settings, json_data);
}

function loadSettings()
{
  try
  {
    var json_data = fs.readFileSync(path.settings);
    settings = JSON.parse(json_data);

    settings.name = settings.name;

    writeLog('Настройки успешно загружены');
  }
  catch(e)
  {
    writeLog(`Ошибка при открытии settings.json, создан новый фай`);
  }

  updateSettings();
}

ipcMain.on('save-name', (evt, name) => {
  settings.name = name;
  updateSettings();
});

ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', { version: app.getVersion() });
});

autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('update_available');
});
autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update_downloaded');
});


// git remote add origin https://github.com/[YOUR USERNAME]/[YOUR REPO NAME].git