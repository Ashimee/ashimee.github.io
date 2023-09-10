const { contextBridge, ipcRenderer } = require('electron')
const path = require('path');
const shell = require('electron').shell;
const child = require('child_process');
const appObj = require('electron').app;
const fsPromise = require('fs/promises');
const fs = require('fs');

function getCurrentDirectory() {
    return __dirname;
}

contextBridge.exposeInMainWorld('CD', getCurrentDirectory);

contextBridge.exposeInMainWorld('shellAPI', shell);
contextBridge.exposeInMainWorld('fileSystemPromiseAPI', fsPromise);
contextBridge.exposeInMainWorld('fileSystemAPI', fs);
contextBridge.exposeInMainWorld('pathAPI', path);
contextBridge.exposeInMainWorld('childAPI', child);
contextBridge.exposeInMainWorld('appAPI', appObj);