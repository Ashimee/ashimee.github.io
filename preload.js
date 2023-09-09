const { contextBridge, ipcRenderer } = require('electron')
const fs = require('fs');
const shell = require('electron').shell;
const path = require('path');
const child = require('child_process');
consst appObj = require('electron').app;

contextBridge.exposeInMainWorld('shellAPI', shell);
contextBridge.exposeInMainWorld('fileSystemAPI', fs);
contextBridge.exposeInMainWorld('pathAPI', path);
contextBridge.exposeInMainWorld('childAPI', child);
contextBridge.exposeInMainWorld('appAPI', appObj);
