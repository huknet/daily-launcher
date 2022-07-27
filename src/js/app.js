console.log(`app.js load with browser (index.html)`);
const ipcRenderer = require('electron').ipcRenderer;

function _element(id) { return document.getElementById(id); }

var settings = {
    name: '',
    server: 0
};
document.addEventListener('DOMContentLoaded', () => {
    ipcRenderer.send('load-settings');
});

_element('button-close').onclick = () => {
    var div = document.getElementsByClassName('main')[0];
    var animation = div.animate([{ opacity: '1' }, { opacity: '0' }], 300);
    animation.addEventListener('finish', function() {
        setTimeout(ipcRenderer.send('launcher-close'), parseInt(deleteTime), div);
    });
}

_element('button-hide').onclick = () => {
    var div = document.getElementsByClassName('main')[0];
    var animation = div.animate([{ opacity: '1' }, { opacity: '0' }], 300);
    animation.addEventListener('finish', function() {
        setTimeout(ipcRenderer.send('launcher-hide'), parseInt(deleteTime), div);
    });    
}

_element('button-setting').onclick = () => {
    ipcRenderer.send('launcher-settings');
}

ipcRenderer.on('load-settings', (evt, data) => {
    settings = data;
    loadSettings();
});

function loadSettings() { _element('playername').value = settings.name; }

getElement('playername').oninput = () => {
    var name = _element('playername').value;
    _element('playername').value = name;
    ipcRenderer.send('save-name', name);
}

const version = document.getElementById('version');
    
ipcRenderer.send('app_version');
ipcRenderer.on('app_version', (event, arg) => {
    ipcRenderer.removeAllListeners('app_version');
    version.innerText = 'Version ' + arg.version;
});

const notification = document.getElementById('notification');
const message = document.getElementById('message');
const restartButton = document.getElementById('restart-button');
ipcRenderer.on('update_available', () => {
  ipcRenderer.removeAllListeners('update_available');
  message.innerText = 'A new update is available. Downloading now...';
  notification.classList.remove('hidden');
});
ipcRenderer.on('update_downloaded', () => {
  ipcRenderer.removeAllListeners('update_downloaded');
  message.innerText = 'Update Downloaded. It will be installed on restart. Restart now?';
  restartButton.classList.remove('hidden');
  notification.classList.remove('hidden');
});

function closeNotification() {
  notification.classList.add('hidden');
}
function restartApp() {
  ipcRenderer.send('restart_app');
}

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});