const ipcRenderer = require('electron').ipcRenderer;

const pathButton = document.getElementById('path');

var select_memory = 0;

ipcRenderer.on('settings-open', (evt, memory, path) =>
{
    // document.getElementsByClassName('range')[0].value = memory;
    select_memory = memory;
    updateMemory();

    var path_value = path;

    if(path.length > 40)
    {
        path_value = path.substring(0, 37) + '...';
    }

    pathButton.innerHTML = path_value;
    pathButton.title = path;
});

const closeButton = document.getElementById('btn-close');

closeButton.onclick = () =>
{
    var div = document.getElementsByClassName('main')[0];
    var animation = div.animate([{ opacity: '1' }, { opacity: '0' }], 300);
    animation.addEventListener('finish', function() {
        setTimeout( ipcRenderer.send('settings-close', select_memory), parseInt(deleteTime), div);
    });   
}

pathButton.onclick = () => {

    ipcRenderer.send('select-game-path');
};

function setMemory(mem) {
    select_memory = mem;
    updateMemory();
}

function updateMemory()
{
    // var memory = document.getElementsByClassName('range')[0].value;
    var index = 0;
    if(select_memory === 1024) { index = 0; }
    if(select_memory === 1536) { index = 1; }
    if(select_memory === 2048) { index = 2; }
    for(var i = 0; i < document.getElementsByClassName('btn-memory').length; i++) {
        if(i === index) { document.getElementsByClassName('btn-memory')[index].className = "btn-memory active"; continue; }
        document.getElementsByClassName('btn-memory')[i].className = "btn-memory";
    }
    document.getElementById('now_memory').innerHTML = `${select_memory} MB`;
}