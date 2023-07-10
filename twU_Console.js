// ==UserScript==
// @name TW-Unlocked (Console)
// @namespace https://github.com/SurvExe1Pc/userscripts
// @description THIS WILL NOT WORK AS YOU ARE USING THE CONSOLE VERSION
// @version v0.0.0.0.0.0.0.0.0.0.0.0.0.0
// @icon https://turbowarp.org/favicon.ico
// @match *://turbowarp.org/*
// @match *://www.turbowarp.org/*
// @grant *
// @run-at document-end
// ==/UserScript==
//The above is fake data

// ==IMPORT VIA BOOKMARKLET OR CONSOLE==
// TW-Unlocked
// Other-scripts: https://github.com/SurvExe1Pc/userscripts
// Adds some useful functions to turbowarp that are disabled due to security issues.
// v1.0
// Made By SurvExE1Pc.
var ImportTWunlock = (async function(deload,vm){

//Disable userscript.
var tmp = null;
try {
  tmp = GM.info.scriptHandler;
} catch {};
if (tmp!=null) console.log('USE THE USERSCRIPT VERSION NOT THE CONSOLE');
if (tmp!=null) return;

var win = window;

console.log('Loaded TW-Unlocked.');
if (deload) {
  delete win.LoadedTWunlock;
  try { document.getElementById('TWunlocked-ModalDiv').remove(); } catch {};
  try { document.getElementById('TWunlocked-GalleryModal').remove(); } catch {};
  try { TWunlocked.attemptRemovalOfUSMscript(); } catch {};
  try { TWunlocked.openButton.remove(); } catch {};
  try { TWunlocked.utils.loadUriExtBtn.remove() } catch {};
  TWunlocked = '';
  delete TWunlocked;
}

if (win.LoadedTWunlock != undefined) {
  alert('TW-Unlocked Has already been loaded!!.');
  return;
}

win.LoadedTWunlock = true;

if (window.TWUextensionPage == true) {
  const gallery = document.getElementsByClassName('extension-buttons');
  function TWuOverride(elm) {
    var elmx = elm.children[1];
    elmx.href = elmx.href.replace('?extension=','?twu-extension=');
		elmx.style.display='';
	};
  for (let i = 0; i < gallery.length; i++) {
    const elm  = gallery.item(i);
    TWuOverride(elm);
  }
  return;
}

//old: !(new RegExp('((http(s?)\:\/\/)?)(turbowarp\.org)((\/)(editor)?)','gi').exec(document.location.href))
if (document.location.hostname != 'turbowarp.org') { console.error('TW-Unlocked | Not a valid page.'); return }

window.TWunlocked = {};
TWunlocked.utils = {};

//Utilities
TWunlocked.utils.setCookie = function(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  let expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
TWunlocked.utils.getCookie = function(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
TWunlocked.utils.aTf = (async function(){ return( true ) });
TWunlocked.utils.oSmPv = {
  cf: vm.securityManager.canFetch,
  clefp: vm.securityManager.canLoadExtensionFromProject,
  cn: vm.securityManager.canNotify,
  cow: vm.securityManager.canOpenWindow,
  crc: vm.securityManager.canReadClipboard,
  cra: vm.securityManager.canRecordAudio,
  crv: vm.securityManager.canRecordVideo,
  cr: vm.securityManager.canRedirect
};
TWunlocked.utils.optionsElm = document.createElement('dialog');
TWunlocked.twMenuBtn = class {
  #doc_elm;
  constructor() {
    const empty_div = document.createElement('div');
    this.#doc_elm = empty_div;
    this.#doc_elm.classList.add('menu-bar_menu-bar-item_oLDa-');
    this.#doc_elm.classList.add('menu-bar_hoverable_c6WFB');
    this.#doc_elm.innerHTML = '<div><span>New Button</span></div>';
    this.#doc_elm.backup_remove = this.#doc_elm.remove;
    this.#doc_elm.remove = ()=>{return 'overridden, nextime use the remove function in the class.'};
  }
  visibility(update) {
    const currentDisplay = this.#doc_elm.style.display;
    const isFlex = currentDisplay == '';
    if (update == 'get') return isFlex;
    if (!update) { this.#doc_elm.style.display = 'none'; return; };
    if (update) { this.#doc_elm.style.display = ''; return; };
  }
  remove() {
    this.#doc_elm.backup_remove();
  }
  setClickCallback(callback) {
    this.#doc_elm.onclick = callback;
  }
  setText(text) {
    this.#doc_elm.innerText = text;
    this.#doc_elm.innerHTML = `<div><span>${this.#doc_elm.innerText}</span></div>`;
  }
  exportHTML() {
    return this.#doc_elm.innerHTML;
  }
  exportDocElm() {
    return this.#doc_elm;
  }
  setID(elm_id) {
    this.#doc_elm.id = elm_id;
  }
  addSelfToNav() {
    document.querySelector('div.menu-bar_file-group_1_CHX').appendChild(this.#doc_elm);
  }
}
TWunlocked.addMenuBtn = (function(button_text,callback){
  var button = new this.twMenuBtn();
  button.setText(button_text);
  button.setClickCallback(callback);
  var tmp = button;
  button = button.exportDocElm();
  document.querySelector('div.menu-bar_file-group_1_CHX').appendChild(button);
  return( tmp );
});

//Get project data
TWunlocked.utils.getProjectMetadata = async (projectId) => {
    const response = await fetch(`https://trampoline.turbowarp.org/api/projects/${projectId}`);
    if (response.status === 404) {
        throw new Error('The project is unshared or does not exist');
    }
    if (!response.ok) {
        throw new Error(`HTTP error ${response.status} fetching project metadata`);
    }
    const json = await response.json();
    return json;
};
TWunlocked.getProjectData = async (projectId) => {
    const metadata = await TWunlocked.utils.getProjectMetadata(projectId);
    const token = metadata.project_token;
    const response = await fetch(`https://projects.scratch.mit.edu/${projectId}?token=${token}`);
    if (!response.ok) {
        throw new Error(`HTTP error ${response.status} fetching project data`);
    }
    const data = await response.arrayBuffer();
    return data;
};
TWunlocked.utils.dateStringNo = (function(){
  return (new Date().toJSON().replace(/-|\.|t|z|:/gi,''));
})
TWunlocked.utils.random = {};
TWunlocked.utils.random.float = function(min, max) {
  return Math.random() * (max - min) + min;
}
TWunlocked.utils.random.int = (function(min, max){
  return Math.round(TWunlocked.utils.random.float);
})
TWunlocked.utils.bigno = (function(){return(TWunlocked.utils.random.int(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER))});
TWunlocked.utils.getCacheParams = (function(url){
  var _urlParams = new URLSearchParams(url);
  _urlParams.append('bypassCache', '');
  //COUNTER
  const storageItem = 'twUnlocked-cacheId';
  if (localStorage.getItem(storageItem) == null) localStorage.setItem(storageItem, 1);
  localStorage.setItem(storageItem, parseFloat(localStorage.getItem(storageItem))+1);
  _urlParams.append(localStorage.getItem(storageItem), '');
  //TIME
  _urlParams.append(TWunlocked.utils.dateStringNo(), '');
  //Returning the params
  return ('?'+_urlParams.toString()).replace(encodeURIComponent(url), '');
});


//Load Extensions Unsandboxed
vm.extensionManager.loadUnsandboxedExtension = (async function(url){
  (function(a){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=a();else if("function"==typeof define&&define.amd)define([],a);else{var b;b="undefined"==typeof window?"undefined"==typeof global?"undefined"==typeof self?this:self:global:window,b.base64js=a()}})(function(){return function(){function b(d,e,g){function a(j,i){if(!e[j]){if(!d[j]){var f="function"==typeof require&&require;if(!i&&f)return f(j,!0);if(h)return h(j,!0);var c=new Error("Cannot find module '"+j+"'");throw c.code="MODULE_NOT_FOUND",c}var k=e[j]={exports:{}};d[j][0].call(k.exports,function(b){var c=d[j][1][b];return a(c||b)},k,k.exports,b,d,e,g)}return e[j].exports}for(var h="function"==typeof require&&require,c=0;c<g.length;c++)a(g[c]);return a}return b}()({"/":[function(a,b,c){'use strict';function d(a){var b=a.length;if(0<b%4)throw new Error("Invalid string. Length must be a multiple of 4");var c=a.indexOf("=");-1===c&&(c=b);var d=c===b?0:4-c%4;return[c,d]}function e(a,b,c){return 3*(b+c)/4-c}function f(a){var b,c,f=d(a),g=f[0],h=f[1],j=new m(e(a,g,h)),k=0,n=0<h?g-4:g;for(c=0;c<n;c+=4)b=l[a.charCodeAt(c)]<<18|l[a.charCodeAt(c+1)]<<12|l[a.charCodeAt(c+2)]<<6|l[a.charCodeAt(c+3)],j[k++]=255&b>>16,j[k++]=255&b>>8,j[k++]=255&b;return 2===h&&(b=l[a.charCodeAt(c)]<<2|l[a.charCodeAt(c+1)]>>4,j[k++]=255&b),1===h&&(b=l[a.charCodeAt(c)]<<10|l[a.charCodeAt(c+1)]<<4|l[a.charCodeAt(c+2)]>>2,j[k++]=255&b>>8,j[k++]=255&b),j}function g(a){return k[63&a>>18]+k[63&a>>12]+k[63&a>>6]+k[63&a]}function h(a,b,c){for(var d,e=[],f=b;f<c;f+=3)d=(16711680&a[f]<<16)+(65280&a[f+1]<<8)+(255&a[f+2]),e.push(g(d));return e.join("")}function j(a){for(var b,c=a.length,d=c%3,e=[],f=16383,g=0,j=c-d;g<j;g+=f)e.push(h(a,g,g+f>j?j:g+f));return 1===d?(b=a[c-1],e.push(k[b>>2]+k[63&b<<4]+"==")):2===d&&(b=(a[c-2]<<8)+a[c-1],e.push(k[b>>10]+k[63&b>>4]+k[63&b<<2]+"=")),e.join("")}c.byteLength=function(a){var b=d(a),c=b[0],e=b[1];return 3*(c+e)/4-e},c.toByteArray=f,c.fromByteArray=j;for(var k=[],l=[],m="undefined"==typeof Uint8Array?Array:Uint8Array,n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",o=0,p=n.length;o<p;++o)k[o]=n[o],l[n.charCodeAt(o)]=o;l[45]=62,l[95]=63},{}]},{},[])("/")});
  const data = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`).then(data=>{return(data.text())});
  const program64 = Base64.encode(data);
  const final_url = `data:application/javascript;base64,${program64}`;
  const oldSandbox = vm.securityManager.getSandboxMode;
  vm.securityManager.getSandboxMode = (async function(){return 'unsandboxed'}); // BYPASS THE SANDBOX
  await vm.extensionManager.loadExtensionURL(final_url);
  vm.securityManager.getSandboxMode = oldSandbox; // Return the sandbox to normal.
  return true;
});
TWunlocked.loadExtensionUnsandboxed = (async function(url, bypassCache){
  bypassCache = new Boolean(bypassCache) || true;
  const set = await vm.extensionManager.loadUnsandboxedExtension(url+(bypassCache?TWunlocked.utils.getCacheParams(url):''));
  return set;
});
  
TWunlocked.utils.loadUextsFromUrl = (function(hasParam){
  hasParam = hasParam || 0;
  hasParam = (hasParam==0 ? false : hasParam);
  function getParams(query){var tmp2 = [];var tmp3 = 0;query.forEach((v,k)=>{tmp3+=1;if(tmp3==1){k=k.replace(document.location.href.split("?")[0]+'?','')};tmp2.push({key: k, value: v})});return( tmp2 )};
  const params = getParams(new URLSearchParams(document.location.href));
  var foundParam = false;
  params.forEach(function(param){
    if (param.key == 'twu-extension') {
      if (hasParam||foundParam) { foundParam=true; return(foundParam) };
      var ext_link = param.value;
      if (vm.runtime.extensionManager._isValidExtensionURL(ext_link)) {
        TWunlocked.loadExtensionUnsandboxed(ext_link);
      } else console.error(`Extension url is invalid.\nURL: ${ext_link}`);
    }
  });
  if (hasParam) return(foundParam);
});

TWunlocked.disablePermissionSecurity = (async function(){
  vm.securityManager.canFetch = this.utils.aTf;
  vm.securityManager.canLoadExtensionFromProject = this.utils.aTf;
  vm.securityManager.canNotify = this.utils.aTf;
  vm.securityManager.canOpenWindow = this.utils.aTf;
  vm.securityManager.canReadClipboard = this.utils.aTf;
  vm.securityManager.canRecordAudio = this.utils.aTf;
  vm.securityManager.canRecordVideo = this.utils.aTf;
  vm.securityManager.canRedirect = this.utils.aTf;
  console.log('SecurityManager disabled.');
});

TWunlocked.restorePermissionSecurity = (function(){
  const old_perms = this.utils.oSmPv;
  vm.securityManager.canFetch = old_perms.cf;
  vm.securityManager.canLoadExtensionFromProject = old_perms.clefp;
  vm.securityManager.canNotify = old_perms.cn;
  vm.securityManager.canOpenWindow = old_perms.cow;
  vm.securityManager.canReadClipboard = old_perms.crc;
  vm.securityManager.canRecordAudio = old_perms.cra;
  vm.securityManager.canRecordVideo = old_perms.crv;
  vm.securityManager.canRedirect = old_perms.cr;
  console.log('SecurityManager enabled.');
});

TWunlocked.ToggleOpenButton = (function(){
  TWunlocked.openButton.visibility( !TWunlocked.openButton.visibility('get') );
});

//Add a button to load a extension in the extension page.
TWunlocked.utils.newFeaturedExtensions = [];
TWunlocked.utils.addExtensionToFeaturedGallery = (function(iconUrl, url, name, description){
  const extensionList = document.querySelector('div.library_library-scroll-grid_1jyXm.library_withFilterBar_26Opm');
  const CustomExtensionDiv = extensionList.childNodes.item(extensionList.childElementCount-1);
  const div = CustomExtensionDiv.cloneNode(true);
  div.querySelector('div>img').src = "https://api.allorigins.win/raw?url="+encodeURIComponent(iconUrl);
  div.querySelector('div>span.library-item_library-item-name_2qMXu').innerText = name;
  div.querySelector('div>span.library-item_featured-description_MjIJw').innerText = description;
  div.onclick = function(){
    TWunlocked.loadExtensionUnsandboxed(url, true);
    document.querySelector('span.button_outlined-button_1bS__.modal_back-button_2ej6v').click();
    alert('Please click off this sprite and to another sprite to refresh the extensions.');
  };
  extensionList.appendChild(div);
  extensionList.appendChild(CustomExtensionDiv);
  return div;
});

TWunlocked.utils.addAllnewFeaturedToGallery = (function(){
  for (extension in TWunlocked.utils.newFeaturedExtensions) {
    extension = TWunlocked.utils.newFeaturedExtensions[extension];
    TWunlocked.utils.addExtensionToFeaturedGallery(extension.iconUrl, extension.url, extension.name, extension.description);
  }
});
TWunlocked.addExtensionToFeaturedGallery = (function(iconUrl, url, name, description){
  TWunlocked.utils.newFeaturedExtensions.push({
    iconUrl,
    url,
    name,
    description
  });
});

TWunlocked.utils.extBtnAddListen = (function(){
  document.querySelector('button.gui_extension-button_2T7PA').onclick = (function(){
    setTimeout(function(){TWunlocked.utils.addAllnewFeaturedToGallery()}, 1000);
    console.log('loaded extra featured extensions');
  });
});

//Setup options menu.
const preAppend = 'twUoM_';
TWunlocked.utils.optionsElm.innerHTML = `<button onclick="TWunlocked.utils.optionsElm.close()">Close.</button><br>
<div>
  <hr>
  <label><button onclick="TWunlocked.utils.extMan()">Load extension</button> : 
    <input type="url" id="${preAppend}le"/>&emsp;<label>Unsandboxed: <input type="checkbox" id="${preAppend}leC" checked/>
  </label><br><hr>
  <button id="${preAppend}sMs">Disable</button> vm security manager<hr>
  <button onclick="TWunlocked.utils.galleryModal.showModal();TWunlocked.utils.galleryUtil.updateExtensions();TWunlocked.utils.optionsElm.close()">Manage custom featured extensions</button><br>
  <button onclick="vm.runtime.extensionManager.refreshBlocks()">Refresh Blocks</button><br>
  <button onclick="vm.refreshWorkspace()">Refresh Workspace</button>
  <hr>
  Submit an extension that cannot be on the gallery to: <a href="https://github.com/SurvExe1Pc/unsafe-extensions">HERE, Click me!!</a>
  <hr>
</div>`;
TWunlocked.utils.optionsElm.id = 'TWunlocked-ModalDiv';
document.body.appendChild(TWunlocked.utils.optionsElm);
//Extension gallery adder modal
TWunlocked.utils.galleryModal = document.createElement('dialog');
TWunlocked.utils.galleryModal.id = 'TWunlocked-GalleryModal';
TWunlocked.utils.galleryUtil = {
  extensions: []
};

TWunlocked.utils.galleryUtil.updateExtensions = function() {
  const loaded = document.getElementById(preAppend+'gallery-loaded');
  const nonloaded = document.getElementById(preAppend+'no-gallery-loaded');
  if (TWunlocked.utils.galleryUtil.extensions.length == 0) {
    loaded.hidden = true;
    nonloaded.hidden = false;
    document.getElementById(preAppend+'gallery-closemenubtn').click();
    return;
  }
  loaded.hidden = false;
  nonloaded.hidden = true;
  
  var newData = '';
  function addLi(name, id) {
    return `<li>${name}&nbsp;&nbsp;<button onclick="TWunlocked.utils.galleryUtil.copyExtension(${id})" hidden>Copy JSON</button>&nbsp;&nbsp;<button onclick="TWunlocked.utils.galleryUtil.removeExtension(${id}, this)">Remove</button></li>`;
  }
  for (extension in TWunlocked.utils.galleryUtil.extensions) {
    const old_extension = extension;
    extension = TWunlocked.utils.galleryUtil.extensions[extension];
    newData += addLi(extension.name, old_extension);
  }
  document.getElementById(preAppend+'gallery-extensions').querySelector('ul').innerHTML = newData;
  localStorage.setItem('twu:extensions', JSON.stringify(TWunlocked.utils.galleryUtil.extensions));
}

TWunlocked.utils.galleryUtil.copyExtension = function(id) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(JSON.stringify(TWunlocked.utils.galleryUtil.extensions[id]));
  }
}

TWunlocked.utils.galleryUtil.removeExtension = function(id, elm) {
  elm.parentNode.remove();
  const ext_name = TWunlocked.utils.galleryUtil.extensions[parseInt(id)].name
  TWunlocked.utils.galleryUtil.extensions = TWunlocked.utils.galleryUtil.extensions.filter(function(el) { return el.name != ext_name; });
  TWunlocked.utils.galleryUtil.updateExtensions();
}

TWunlocked.utils.galleryUtil.addExtensionByData = function() {
  const div = document.getElementById(preAppend+'extension-data');
  const allInputs = div.querySelectorAll('input');
  for (extension in TWunlocked.utils.galleryUtil.extensions) {
    extension = TWunlocked.utils.galleryUtil.extensions[extension];
    if (extension.name == allInputs[2].value) return;
  }
  TWunlocked.utils.galleryUtil.extensions.push({
    iconUrl: allInputs[1].value,
    url: allInputs[0].value,
    name: allInputs[2].value,
    description: div.querySelector('textarea').value,
  });
  TWunlocked.utils.galleryUtil.updateExtensions();
}

TWunlocked.utils.galleryModal.innerHTML = `<button onclick="TWunlocked.utils.galleryModal.close();TWunlocked.utils.optionsElm.showModal()">Back.</button>
<br>
<div>
    <hr>
    <strong>
        <FONT size="4">
            Add an extension to gallery:
        </FONT>
        </strong>
        <br>
            <div id="${preAppend}extension-data">
                &nbsp;&nbsp;
                <span>
                    File Url: <input type="url"/>
                </span><br>
                &nbsp;&nbsp;
                <span>
                    Icon Url: <input type="url"/>
                </span><br>
                &nbsp;&nbsp;
                <span>
                    Name: <input type="text"/>
                </span><br>
                &nbsp;&nbsp;
                <span>
                    Description: <textarea></textarea>
                </span>
            </div><br>
        &nbsp;&nbsp;
        <button onclick="TWunlocked.utils.galleryUtil.addExtensionByData()">
            Add
        </button>
        <hr>
        <div id="${preAppend}gallery-loaded">
                <div>
                    <span>
                        Loaded extensions:&nbsp;&nbsp;
                        <button id="${preAppend}gallery-showmenubtn" onclick="document.getElementById('${preAppend}gallery-extensions').hidden=false;this.hidden=true;">
                            Show menu
                        </button>
                    </span>
                </div>
        </div>
        <div id="${preAppend}gallery-extensions" hidden>
            <ul></ul>
            <br>
            <button id="${preAppend}gallery-closemenubtn" onclick="this.parentNode.hidden=true;document.getElementById('${preAppend}gallery-showmenubtn').hidden=false;">
                Close Menu
            </button>
        </div>
        <div id="${preAppend}no-gallery-loaded" hidden>
        <span>
            <strong>No extensions added yet!</strong>
        </span>
    </div>
    </div>
</div>
<hr>
</div>`;
document.body.appendChild(TWunlocked.utils.galleryModal);

const loadExtensionInput = document.getElementById(preAppend+'le');
const loadExtension_unsandboxedCheck = document.getElementById(preAppend+'leC');
const securityManagerSwitchBtn = document.getElementById(preAppend+'sMs');
securityManagerSwitchBtn.onclick = (function(){
  if (this.innerText=='Disable') {
    this.innerText = 'Enable';
    TWunlocked.disablePermissionSecurity();
  } else {
    this.innerText = 'Disable';
    TWunlocked.restorePermissionSecurity();
  }
});
TWunlocked.utils.extMan = (function(){
  if (loadExtension_unsandboxedCheck.checked) {
    TWunlocked.loadExtensionUnsandboxed(loadExtensionInput.value);
  } else {
    vm.runtime.extensionManager.loadExtensionURL(loadExtensionInput.value);
  }
});

TWunlocked.utils.UpdateButton = {} 
TWunlocked.utils.UpdateButton.dontFixButton = false;
TWunlocked.utils.UpdateButton.oldHref = document.location.href;
TWunlocked.utils.UpdateButton.update = (function(){
  //console.log(`Checking button & href..\n\tDAT:\n\t${document.location.href}\t${TWunlocked.utils.UpdateButton.oldHref}\t`);
  if (TWunlocked.utils.UpdateButton.dontFixButton) { 
    clearInterval(TWunlocked.utils.UpdateButton.btnIvl);
    TWunlocked.utils.UpdateButton.btnIvl = 'stopped';
    TWunlocked.utils.UpdateButton = '';
    delete TWunlocked.utils.UpdateButton;
    return;
  }
  if ((document.location.href!=TWunlocked.utils.UpdateButton.oldHref)||(document.getElementById('TWunlocked-NavBtn')==null)) {
    TWunlocked.openButton.addSelfToNav();
    return;
  }
});
TWunlocked.utils.UpdateButton.btnIvl = setInterval(TWunlocked.utils.UpdateButton.update, 50);
TWunlocked.utils.updateTick = (function(){
  if (document.querySelector('button.gui_extension-button_2T7PA')) TWunlocked.utils.extBtnAddListen();
});
TWunlocked.utils.updateIvl = setInterval(TWunlocked.utils.updateTick, 50);

//USM
TWunlocked.attemptRemovalOfUSMscript = (function(){
  document.getElementById('TWunlocked-Script-'+TWunlocked.topLoader)
})

//Add the modal.
TWunlocked.openButton = TWunlocked.addMenuBtn('TW-Unlocked', (function(){TWunlocked.utils.optionsElm.showModal()}));
TWunlocked.openButton.setID('TWunlocked-NavBtn');

//Load extensions out of url
if (TWunlocked.utils.loadUextsFromUrl(true)) {
  TWunlocked.utils.loadUriExtBtn = TWunlocked.addMenuBtn('Load URL extensions', (function(){TWunlocked.utils.loadUextsFromUrl(false);TWunlocked.utils.loadUriExtBtn.remove()}));
}

//Load all the gallery extensions.
if (localStorage.getItem('twu:extensions')!=null) {
  try {
    TWunlocked.utils.newFeaturedExtensions = JSON.parse(localStorage.getItem('twu:extensions'));
    TWunlocked.utils.galleryUtil.extensions = TWunlocked.utils.newFeaturedExtensions;
  } catch {
    console.log('Invalid JSON');
    localStorage.setItem('twu:extensions', '[]');
    TWunlocked.utils.newFeaturedExtensions = [];
    TWunlocked.utils.galleryUtil.extensions = [];
  }
} else {
  localStorage.setItem('twu:extensions', '[]');
}
TWunlocked.utils.galleryUtil.updateExtensions();
});ImportTWunlock(true,window.vm);
