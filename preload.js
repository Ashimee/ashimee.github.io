const { contextBridge, ipcRenderer } = require('electron')
const fs = require('fs');
const shell = require('electron').shell;
const path = require('path');
const child = require('child_process');

contextBridge.exposeInMainWorld('shellAPI', shell);
contextBridge.exposeInMainWorld('fileSystemAPI', fs);
contextBridge.exposeInMainWorld('pathAPI', path);
contextBridge.exposeInMainWorld('childAPI', child);
