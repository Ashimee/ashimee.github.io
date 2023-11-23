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

/*!
 *  ==IMPORT VIA BOOKMARKLET OR CONSOLE==
 * TW-Unlocked
 * Other-scripts: https://github.com/SurvExe1Pc/userscripts
 * Adds some useful functions to turbowarp that are disabled due to security issues.
 * version below
 * Made By SurvExE1Pc.
 */

/*! todo:
 *       1. Make it so that the images / sounds have a custom tag and only show on it or the all tag
 *          (some code for later to get the selected tag: document.querySelector('div[class^="library_tag-wrapper"] span[class*="tag-button_active"]').querySelector('span').innerHTML )
 *       2. Support custom sounds
 *       (Testing the "TWunlocked thinks this is a TurboWarp editor" popup, will be removed if negative feedback)
 */
var ImportTWunlock = async function (deload, vm) {
  const VERSION = 5.2;

  //Disable userscript.
  var tmp = null;
  try {
    tmp = GM.info.scriptHandler;
  } catch {}
  if (tmp != null) console.log("USE THE USERSCRIPT VERSION NOT THE CONSOLE");
  if (tmp != null) return;

  var win = window;

  console.log("Loaded TW-Unlocked.");
  if (deload) {
    delete win.LoadedTWunlock;
    try {
      document.getElementById("TWunlocked-ModalDiv").remove();
    } catch {}
    try {
      document.getElementById("TWunlocked-GalleryModal").remove();
    } catch {}
    try {
      document.getElementById("TWunlocked-cosManager").remove();
    } catch {}
    try {
      document.getElementById("TWunlocked-dropManager").remove();
    } catch {}
    try {
      document.getElementById("TWunlocked-extManager").remove();
    } catch {}
    try {
      TWunlocked.attemptRemovalOfUSMscript();
    } catch {}
    try {
      TWunlocked.openButton.remove();
    } catch {}
    try {
      TWunlocked.utils.loadUriExtBtn.remove();
    } catch {}
    TWunlocked = "";
    delete TWunlocked;
  }

  if (win.LoadedTWunlock != undefined) {
    alert("TW-Unlocked Has already been loaded!!.");
    return;
  }

  win.LoadedTWunlock = true;

  if (window.TWUextensionPage == true) {
    const gallery = document.getElementsByClassName("extension-buttons");

    function TWuOverride(elm) {
      var elmx = elm.children[1];
      elmx.href = elmx.href.replace("?extension=", "?twu-extension=");
      elmx.style.display = "";
    }
    for (let i = 0; i < gallery.length; i++) {
      const elm = gallery.item(i);
      TWuOverride(elm);
    }
    return;
  }

  //do something with this
  function assumeTurbowarp() {
    var assumption = 0;
    try {
      ReduxStore.getState().scratchGui;
      assumption += 0.5;
    } catch {}
    try {
      vm.greenFlag.toString();
      assumption += 0.5;
    } catch {}
    return assumption == 1;
  }

  //old: !(new RegExp('((http(s?)\:\/\/)?)(turbowarp\.org)((\/)(editor)?)','gi').exec(document.location.href))
  let customDomains = localStorage.getItem("twu:customDomains");
  if (customDomains) {
    customDomains = JSON.parse(customDomains);
  } else {
    customDomains = [];
    localStorage.setItem("twu:customDomains", "[]");
  }
  let _isDesktop = document.location.href.includes(
    "TurboWarp/resources/app.asar"
  );
  /*!
   * Reasons:
   *   GandiIDE:   Dangerous data collection.
   *   Scratch:    This just wont work.
   *   PenguinMod: I am not risking it, as this already does not work on penguinmod on some aspects.
   */
  if (
    [
      "getgandi.com",
      "cocrea.world",
      "scratch.mit.edu",
      "studio.penguinmod.site",
      "penguinmod.site",
      "penguinmod.com",
      "studio.penguinmod.com",
    ].includes(document.location.hostname)
  ) {
    console.error(`TW-Unlocked v${VERSION} | Blocked page.`);
    return;
  }
  if (
    ![
      ...customDomains,
      "turbowarp.org",
      "staging.turbowarp.org",
      "twplus.pages.dev",
    ].includes(document.location.hostname) &&
    !_isDesktop
  ) {
    console.error(
      `TW-Unlocked v${VERSION} | Not a valid page.\nIf this is a "turbowarp editor" then run TWunlocked.allowCurrentHostname()`
    );
    if (assumeTurbowarp()) {
      var assum = document.createElement("dialog");
      assum.innerHTML =
        '<style>button{background-color:#bbbbbb}</style>TWunlocked thinks this page is a turbowarp editor.<br><button onclick="this.parentElement.remove();">Close</button><button onclick="this.parentElement.remove();try{TWunlocked.allowCurrentHostname()}catch{}">Yes it is!</button>';
      document.body.appendChild(assum);
      assum.show();
      assum.style.position = "absolute";
      assum.style.zIndex = 32767;
      assum.style.left =
        window.innerWidth - assum.getBoundingClientRect().width * 2 + "px";
    }
    window.TWunlocked = {
      allowCurrentHostname() {
        customDomains = JSON.parse(customDomains);
        customDomains.push(document.location.hostname);
        customDomains = JSON.stringify(customDomains);
        localStorage.setItem("twu:customDomains", customDomains);
        console.log("Please refresh the page for this to take effect.");
      },
      VERSION,
    };
    return;
  }

  console.log(`TW-Unlocked v${VERSION} | Loading..`);

  window.TWunlocked = {
    removeCurrentHostnameFromAllowed() {
      let host = document.location.hostname;
      if (!customDomains.includes(host)) {
        console.log('This page is not a "custom turbowarp editor".');
      }
      customDomains = JSON.parse(customDomains);
      customDomains.pop(customDomains.indexOf(host));
      customDomains = JSON.stringify(customDomains);
      localStorage.setItem("twu:customDomains", customDomains);
      console.log("Please refresh the page for this to take effect.");
    },
    VERSION,
  };
  TWunlocked.isDesktop = _isDesktop;
  TWunlocked.utils = {};

  //Utilities
  TWunlocked.utils.idGen = function* idGenerator() {
    let index = 0;
    while (true) {
      index += 1;
      yield index;
    }
  };
  TWunlocked.utils.setCookie = function (cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  };
  TWunlocked.utils.getCookie = function (cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  };
  TWunlocked.utils.aTf = async function () {
    return true;
  };
  TWunlocked.utils.oSmPv = {
    cf: vm.securityManager.canFetch,
    clefp: vm.securityManager.canLoadExtensionFromProject,
    cn: vm.securityManager.canNotify,
    cow: vm.securityManager.canOpenWindow,
    crc: vm.securityManager.canReadClipboard,
    cra: vm.securityManager.canRecordAudio,
    crv: vm.securityManager.canRecordVideo,
    cr: vm.securityManager.canRedirect,
  };
  TWunlocked.utils.optionsElm = document.createElement("dialog");
  const fetchHoverClases = document.querySelector(
    "[class^=menu-bar_menu-bar-item]"
  ).classList;
  TWunlocked.utils.fileGroup = TWunlocked.isDesktop
    ? 'div[class^="menu-bar_file-group"]'
    : 'div[class^="menu-bar_file-group"]';
  TWunlocked.utils.hoverableClass = fetchHoverClases[1];
  TWunlocked.utils.menuItemClass = fetchHoverClases[0];
  TWunlocked.twMenuBtn = class {
    #doc_elm;
    constructor() {
      const empty_div = document.createElement("div");
      this.#doc_elm = empty_div;
      this.#doc_elm.classList.add(TWunlocked.utils.menuItemClass);
      this.#doc_elm.classList.add(TWunlocked.utils.hoverableClass);
      this.#doc_elm.innerHTML = "<div><span>New Button</span></div>";
      this.#doc_elm.backup_remove = this.#doc_elm.remove;
      this.#doc_elm.remove = () => {
        return "overridden, nextime use the remove function in the class.";
      };
    }
    visibility(update) {
      const currentDisplay = this.#doc_elm.style.display;
      const isFlex = currentDisplay == "";
      if (update == "get") return isFlex;
      if (!update) {
        this.#doc_elm.style.display = "none";
        return;
      }
      if (update) {
        this.#doc_elm.style.display = "";
        return;
      }
    }
    remove() {
      this.#doc_elm.backup_remove();
    }
    setClickCallback(callback) {
      this.#doc_elm.onclick = callback;
    }
    setText(text) {
      this.#doc_elm.innerText = text;
      this.#doc_elm.innerHTML = `<div><span>${
        this.#doc_elm.innerText
      }</span></div>`;
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
      document
        .querySelector(TWunlocked.utils.fileGroup)
        .appendChild(this.#doc_elm);
    }
  };
  TWunlocked.addMenuBtn = function (button_text, callback) {
    var button = new this.twMenuBtn();
    button.setText(button_text);
    button.setClickCallback(callback);
    var tmp = button;
    button = button.exportDocElm();
    document.querySelector(TWunlocked.utils.fileGroup).appendChild(button);
    return tmp;
  };

  //Get project data
  TWunlocked.utils.getProjectMetadata = async (projectId) => {
    const response = await fetch(
      `https://trampoline.turbowarp.org/api/projects/${projectId}`
    );
    if (response.status === 404) {
      throw new Error("The project is unshared or does not exist");
    }
    if (!response.ok) {
      throw new Error(
        `HTTP error ${response.status} fetching project metadata`
      );
    }
    const json = await response.json();
    return json;
  };
  TWunlocked.getProjectData = async (projectId) => {
    const metadata = await TWunlocked.utils.getProjectMetadata(projectId);
    const token = metadata.project_token;
    const response = await fetch(
      `https://projects.scratch.mit.edu/${projectId}?token=${token}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status} fetching project data`);
    }
    const data = await response.arrayBuffer();
    return data;
  };
  TWunlocked.utils.dateStringNo = function () {
    return new Date().toJSON().replace(/-|\.|t|z|:/gi, "");
  };
  TWunlocked.utils.random = {};
  TWunlocked.utils.random.float = function (min, max) {
    return Math.random() * (max - min) + min;
  };
  TWunlocked.utils.random.int = function (min, max) {
    return Math.round(TWunlocked.utils.random.float);
  };
  TWunlocked.utils.bigno = function () {
    return TWunlocked.utils.random.int(
      Number.MIN_SAFE_INTEGER,
      Number.MAX_SAFE_INTEGER
    );
  };
  TWunlocked.utils.getCacheParams = function (url) {
    var _urlParams = new URLSearchParams(url);
    _urlParams.append("bypassCache", "");
    //COUNTER
    const storageItem = "twUnlocked-cacheId";
    if (localStorage.getItem(storageItem) == null)
      localStorage.setItem(storageItem, 1);
    localStorage.setItem(
      storageItem,
      parseFloat(localStorage.getItem(storageItem)) + 1
    );
    _urlParams.append(localStorage.getItem(storageItem), "");
    //TIME
    _urlParams.append(TWunlocked.utils.dateStringNo(), "");
    //Returning the params
    return ("?" + _urlParams.toString()).replace(encodeURIComponent(url), "");
  };

  if (!TWunlocked.isDesktop) {
    const styling = document.createElement("style");
    styling.innerHTML = `
.TWunlockedModal button {
  background-color: rgba(107, 107, 107, 1);
}`;
    document.head.appendChild(styling);
  }

  //Load Extensions Unsandboxed
  vm.extensionManager.loadUnsandboxedExtension = function (url) {
    vm.securityManager.getSandboxMode = async function () {
      return "unsandboxed";
    };
    vm.extensionManager.loadExtensionURL(
      `https://corsproxy.io/?${encodeURIComponent(url)}`
    );
    vm.securityManager.getSandboxMode = oldSandbox; // Return the sandbox to normal.
  };
  TWunlocked.loadExtensionUnsandboxed = async function (url, bypassCache) {
    bypassCache = new Boolean(bypassCache) || true;
    const set = vm.extensionManager.loadUnsandboxedExtension(
      url + (bypassCache ? TWunlocked.utils.getCacheParams(url) : "")
    );
    return set;
  };

  TWunlocked.utils.loadUextsFromUrl = function (hasParam) {
    hasParam = hasParam || 0;
    hasParam = hasParam == 0 ? false : hasParam;

    function getParams(query) {
      var tmp2 = [];
      var tmp3 = 0;
      query.forEach((v, k) => {
        tmp3 += 1;
        if (tmp3 == 1) {
          k = k.replace(document.location.href.split("?")[0] + "?", "");
        }
        tmp2.push({
          key: k,
          value: v,
        });
      });
      return tmp2;
    }
    const params = getParams(new URLSearchParams(document.location.href));
    var foundParam = false;
    params.forEach(function (param) {
      if (param.key == "twu-extension") {
        if (hasParam || foundParam) {
          foundParam = true;
          return foundParam;
        }
        var ext_link = param.value;
        if (vm.runtime.extensionManager._isValidExtensionURL(ext_link)) {
          TWunlocked.loadExtensionUnsandboxed(ext_link);
        } else console.error(`Extension url is invalid.\nURL: ${ext_link}`);
      }
    });
    if (hasParam) return foundParam;
  };

  TWunlocked.disablePermissionSecurity = async function () {
    vm.securityManager.canFetch = this.utils.aTf;
    vm.securityManager.canLoadExtensionFromProject = this.utils.aTf;
    vm.securityManager.canNotify = this.utils.aTf;
    vm.securityManager.canOpenWindow = this.utils.aTf;
    vm.securityManager.canReadClipboard = this.utils.aTf;
    vm.securityManager.canRecordAudio = this.utils.aTf;
    vm.securityManager.canRecordVideo = this.utils.aTf;
    vm.securityManager.canRedirect = this.utils.aTf;
  };

  TWunlocked.restorePermissionSecurity = function () {
    const old_perms = this.utils.oSmPv;
    vm.securityManager.canFetch = old_perms.cf;
    vm.securityManager.canLoadExtensionFromProject = old_perms.clefp;
    vm.securityManager.canNotify = old_perms.cn;
    vm.securityManager.canOpenWindow = old_perms.cow;
    vm.securityManager.canReadClipboard = old_perms.crc;
    vm.securityManager.canRecordAudio = old_perms.cra;
    vm.securityManager.canRecordVideo = old_perms.crv;
    vm.securityManager.canRedirect = old_perms.cr;
  };

  TWunlocked.ToggleOpenButton = function () {
    TWunlocked.openButton.visibility(!TWunlocked.openButton.visibility("get"));
  };

  TWunlocked.utils.createExtensionDiv = function (data) {
    const hasCreator = data.hasOwnProperty("creator");
    if (!hasCreator) data["creator"] = { link: "", name: "" };
    var br = document.createElement("br");
    var extensionDiv = document.createElement("div");
    var extensionImageContainer = document.createElement("div");
    var extensionImage = document.createElement("img");
    extensionImage.loading = "lazy";
    extensionImage.draggable = false;
    extensionImage.src = data.image;
    var extensionText = document.createElement("div");
    var extensionTextTitle = document.createElement("span");
    extensionTextTitle.innerHTML = data.title;
    var extensionTextDescription = document.createElement("span");
    extensionTextDescription.innerHTML = data.description;
    var extensionCreatorLinkOuterContainer = document.createElement("div");
    var extensionCreatorLinkInnerContainer = document.createElement("div");
    var extensionCreatorLink = document.createElement("a");
    extensionCreatorLink.target = "_blank";
    extensionCreatorLink.rel = "noreferrer";
    extensionCreatorLink.href = data.creator.link;
    extensionCreatorLink.innerHTML = data.creator.name;
    extensionCreatorLinkInnerContainer.appendChild(extensionCreatorLink);
    extensionCreatorLinkOuterContainer.appendChild(
      extensionCreatorLinkInnerContainer
    );
    document
      .querySelector("div[class^=library-item_library-item]")
      .classList.forEach((class_) => {
        extensionDiv.classList.add(class_);
      });
    document
      .querySelector("div[class^=library-item_featured-extension-text]")
      .classList.forEach((class_) => {
        extensionText.classList.add(class_);
      });
    extensionImageContainer.classList.add(
      document.querySelector(
        "div[class^=library-item_featured-image-container]"
      ).classList[0]
    );
    extensionImage.classList.add(
      document.querySelector("div[class^=library-item_featured-image]")
        .classList[0]
    );
    extensionImageContainer.appendChild(extensionImage);
    extensionTextTitle.classList.add(
      document.querySelector("span[class^=library-item_library-item-name]")
        .classList[0]
    );
    extensionTextDescription.classList.add(
      document.querySelector("span[class^=library-item_featured-description]")
        .classList[0]
    );
    if (!TWunlocked.isDesktop)
      extensionCreatorLinkOuterContainer.classList.add(
        document.querySelector("div[class^=library-item_extension-links]")
          .classList[0]
      );
    extensionText.appendChild(extensionTextTitle);
    extensionText.appendChild(br);
    extensionText.appendChild(extensionTextDescription);
    extensionDiv.appendChild(extensionImageContainer);
    extensionDiv.appendChild(extensionText);
    if (hasCreator)
      extensionDiv.appendChild(extensionCreatorLinkOuterContainer);
    if (TWunlocked.isDesktop) {
      var extensionIncompatibleTextContainer = document.createElement("div");
      extensionIncompatibleTextContainer.classList.add(
        document.querySelector(
          'div[class^="library-item_incompatible-with-scratch"]'
        ).classList[0]
      );
      var extensionIncompatibleText = document.createElement("span");
      extensionIncompatibleText.innerHTML = "Not compatible with Scratch.";
      extensionIncompatibleTextContainer.appendChild(extensionIncompatibleText);
      extensionDiv.appendChild(extensionIncompatibleTextContainer);
      extensionImage.width = 296;
      extensionImage.height = 184;
    }
    return extensionDiv;
  };

  //Add a button to load a extension in the extension page.
  TWunlocked.utils.addExtensionToFeaturedGallery = function (
    iconUrl,
    url,
    name,
    description
  ) {
    function loadExtension() {
      TWunlocked.loadExtensionUnsandboxed(url, true);
      TWunlocked.utils.extensionLibrary.parentElement.children[0].children[1].children[0].click();
      alert("Your Extension is loading, please be patient.");
    }
    const myExtension = TWunlocked.utils.createExtensionDiv({
      //creator: {link:'https://google.com/', name:'test'},
      title: name,
      description,
      image: iconUrl,
    });
    myExtension.onclick = loadExtension;
    TWunlocked.utils.extensionLibrary.insertBefore(
      myExtension,
      TWunlocked.utils.extensionLibrary.childNodes[0]
    );
  };

  TWunlocked.utils.addAllnewFeaturedToGallery = function () {
    let extensions = JSON.parse(localStorage.getItem('twu:customExtensions'));
    for (extension in extensions) {
      extension = extensions[extension];
      TWunlocked.utils.addExtensionToFeaturedGallery(
        extension.image_url,
        extension.url,
        extension.name,
        extension.description
      );
    }
  };

  TWunlocked.utils.attemptToLoadMyGallery = async function () {
    var extensions = [];
    var site = "https://surv.is-a.dev/unsafe-extensions";
    if (!TWunlocked.isDesktop)
      TWunlocked.utils.extensionLibrary.insertBefore(
        TWunlocked.utils.extensionsCategorySeparator.cloneNode(true),
        TWunlocked.utils.extensionLibrary.childNodes[0]
      );
    return Promise.resolve(
      fetch(site + "/")
        .then((text) => text.text())
        .then((text) => {
          let dom = new DOMParser().parseFromString(text, "text/html");
          dom.querySelectorAll("div.extension").forEach((ext) => {
            try {
              if (ext.style.display == "none" || ext.hasAttribute("hidden"))
                return;
            } catch {}
            const uri = (
              ext.querySelector("a.copy") || ext.querySelector("a.open")
            ).href.split("/");
            let extension = {
              name: ext.querySelector("h3").innerHTML,
              description: ext.querySelector("p").innerHTML,
              image: ext
                .querySelector("img.extension-image")
                .src.replace(document.location.origin, site),
              url: `https://surv.is-a.dev/unsafe-extensions/${
                uri[uri.length - 2]
              }/${uri[uri.length - 1]}`,
            };
            extensions.push(extension);
          });
          for (extension in extensions) {
            extension = extensions[extension];
            TWunlocked.utils.addExtensionToFeaturedGallery(
              extension.image,
              extension.url,
              extension.name,
              extension.description
            );
          }
        })
        .then(() => {
          return Promise.resolve();
        })
    );
  };

  TWunlocked.utils.attemptToLoadSPGallery = async function () {
      var keys = await fetch('https://corsproxy.io/?https://sharkpools-extensions.vercel.app/Gallery%20Files/Extension-Keys.json');
      keys = await keys.json();
      keys = keys.extensions;
      delete keys['Image-Effects'];    // Broken icon :(
      delete keys['Niche-Toolbox'];    // Nah.
      delete keys['Newgrounds-Audio']; // Legal grey area
      delete keys['Since-2000'];       //Nah.
      let extensions = Object.keys(keys);
      extensions.pop(extensions.length-1);
      for (let i = 0; i < extensions.length; i++) {
          let extension = extensions[i];
          let obj = keys[extension];
          obj.image = 'https://corsproxy.io/?https://sharkpools-extensions.vercel.app/extension-thumbs/'+extension+'.svg';
          TWunlocked.utils.addExtensionToFeaturedGallery(
            obj.image,
            obj.url,
            extension,
            obj.credits
          );
      }
      return Promise.resolve(true);
  }

  TWunlocked.addExtensionToFeaturedGallery = function (
    iconUrl,
    url,
    name,
    description
  ) {
    TWunlocked.utils.newFeaturedExtensions.push({
      iconUrl,
      url,
      name,
      description,
    });
  };

  TWunlocked.utils.extBtnAddListen = function () {
    document.querySelector('button[class^="gui_extension-button"]').onclick =
      function () {
        setTimeout(async function () {
          const modalSettings = TWunlocked.extManager.getMarks();
          let myGallery = modalSettings.myGallery, spGallery = modalSettings.spGallery;
          TWunlocked.utils.extensionsCategorySeparator =
            document.createElement("hr");
          if (!TWunlocked.isDesktop)
            TWunlocked.utils.extensionsCategorySeparator.classList.add(
              document.querySelector("hr[class^=separator_separator]")
                .classList[0]
            );
          TWunlocked.utils.extensionLibrary = document.querySelector(
            '[class^="library_library-scroll-grid"]'
          );
          if (
            myGallery ||
            spGallery
          ) {
            if (spGallery) {
              if (!TWunlocked.isDesktop)
              TWunlocked.utils.extensionLibrary.insertBefore(
                TWunlocked.utils.extensionsCategorySeparator.cloneNode(true),
                TWunlocked.utils.extensionLibrary.childNodes[0]
              );
              await TWunlocked.utils.attemptToLoadSPGallery();
            }
            if (myGallery) {
              if (!TWunlocked.isDesktop)
              TWunlocked.utils.extensionLibrary.insertBefore(
                TWunlocked.utils.extensionsCategorySeparator.cloneNode(true),
                TWunlocked.utils.extensionLibrary.childNodes[0]
              );
              await TWunlocked.utils.attemptToLoadMyGallery();
            }
            if (!TWunlocked.isDesktop)
              TWunlocked.utils.extensionLibrary.insertBefore(
                TWunlocked.utils.extensionsCategorySeparator.cloneNode(true),
                TWunlocked.utils.extensionLibrary.childNodes[0]
              );
            TWunlocked.utils.addAllnewFeaturedToGallery();
          } else {
            if (!TWunlocked.isDesktop)
              TWunlocked.utils.extensionLibrary.insertBefore(
                TWunlocked.utils.extensionsCategorySeparator.cloneNode(true),
                TWunlocked.utils.extensionLibrary.childNodes[0]
              );
            TWunlocked.utils.addAllnewFeaturedToGallery();
          }
        }, 1000);
      };
  };

  TWunlocked.utils.hasTriedToAddForI = false;
  TWunlocked.utils.addForIextension = function () {
    if (!TWunlocked.utils.hasTriedToAddForI) {
      TWunlocked.utils.hasTriedToAddForI = true;
      TWunlocked.loadExtensionUnsandboxed(
        "https://surv.is-a.dev/bringBackForI.js"
      );
      alert(
        "The for i block should appear within 10 seconds, otherwise check the console!"
      );
    }
  };

  TWunlocked.utils.curIdGen = TWunlocked.utils.idGen();
  TWunlocked.utils.hiddenBubbles = [];
  TWunlocked.utils.hiddenIcons = [];
  window.getBub = function (ext) {
    let bub = document.querySelector(
      "div.scratchCategoryId-" + ext
    ).parentElement;
    bub.icon =
      bub.querySelector("div.scratchCategoryItemBubble") ||
      bub.querySelector("div.scratchCategoryItemIcon");
    return bub;
  };
  let bound = vm.runtime.getBlocksXML.bind(vm.runtime);
  vm.runtime.getBlocksXML = function (...args) {
    setTimeout(function () {
      for (let i = 0; i < TWunlocked.utils.hiddenBubbles.length; i++) {
        try {
          let bub = getBub(TWunlocked.utils.hiddenBubbles[i]);
          bub.style.display = "none";
        } catch (err) {
          console.debug("Error when hiding bubble: " + err);
        }
      }
      for (let i = 0; i < TWunlocked.utils.hiddenIcons.length; i++) {
        try {
          let bub = getBub(TWunlocked.utils.hiddenIcons[i]);
          bub.icon.style.display = "none";
        } catch (err) {
          console.debug("Error when hiding bubble icon: " + err);
        }
      }
    }, 1000);
    return bound(...args);
  };
  function toolboxMenu(e) {
    let tmp,
      bubble = document.elementFromPoint(e.clientX, e.clientY);
    tmp = bubble.parentElement;
    if (tmp.classList.contains("scratchCategoryMenuItem")) bubble = tmp;
    tmp = bubble.querySelector("div.scratchCategoryMenuItem");
    if (tmp) bubble = tmp;
    let extension = bubble.classList[1].replace("scratchCategoryId-", "");
    const isBuiltIn = [
      "motion",
      "looks",
      "sound",
      "pen",
      "data",
      "variables",
      "dataLists",
      "lists",
      "event",
      "events",
      "control",
      "sensing",
      "operators",
      "more",
      "myBlocks",
    ].includes(extension);
    var blocks = vm.runtime.getEditingTarget().blocks;
    var deletions = [];
    bubble.icon =
      bubble.parentElement.querySelector("div.scratchCategoryItemBubble") ||
      bubble.parentElement.querySelector("div.scratchCategoryItemIcon");
    Object.values(blocks._blocks).forEach((block) => {
      if (block.opcode.startsWith(extension)) {
        let myUp = block.parent;
        let myNext = block.next;
        block.parent = null;
        block.next = null;
        try {
          blocks._blocks[myUp].next = myNext;
        } catch {}
        try {
          blocks._blocks[myNext].parent = myUp;
        } catch {}
        deletions.push(block.id);
      }
    });
    let widgit = document.createElement("div");
    widgit.classList.add("blocklyWidgetDiv");
    widgit.style.position = "absolute";
    widgit.style.display = "block";
    widgit.style.direction = "ltr";
    widgit.style.top = e.clientY + "px";
    widgit.style.left = e.clientX + "px";
    widgit.style.width = "224.2px";
    let menuHeight = 0;
    let menu = document.createElement("div");
    menu.classList.add("goog-menu");
    menu.classList.add("goog-menu-vertical");
    menu.classList.add("blocklyContextMenu");
    menu.role = "menu";
    menu.style.userSelect = "none";
    menu.tabindex = 0;
    function menuItem(text, extras, onclick) {
      let item = document.createElement("div");
      item.isDisabled = extras.isDisabled;
      if (extras.border) {
        menuHeight += 3;
        item.classList.add("sa-blockly-menu-item-border");
        item.style.paddingTop = "2px";
        item.style.borderTop = "1px solid rgba(0, 0, 0, 0.15)";
      }
      item.onclick = function (...args) {
        if (item.isDisabled) return;
        onclick(...args);
        widgit.remove();
      };
      item.onmouseover = function () {
        if (item.isDisabled) return;
        item.classList.add("goog-menuitem-highlight");
      };
      item.onmouseout = function () {
        if (item.isDisabled) return;
        if (!item.isDisabled) item.classList.remove("goog-menuitem-highlight");
      };
      item.innerHTML = `<div class="goog-menuitem-content" style="user-select: none;">${text}</div>`;
      item.classList.add("goog-menuitem");
      if (item.isDisabled) {
        item.classList.add("goog-menuitem-disabled");
      }
      item.role = "menuitem";
      item.id = `:${TWunlocked.utils.curIdGen.next().value}`;
      item.style.userSelect = "none";
      menuHeight += 23;
      return item;
    }
    const defaultSettings = {
      isDisabled: false,
      border: false,
    };
    menu.appendChild(
      menuItem(
        "remove all extension blocks",
        {
          isDisabled: isBuiltIn,
          border: false,
        },
        function () {
          if (
            confirm(
              "Are you sure about this, this will remove " +
                deletions.length +
                " blocks?"
            )
          ) {
            deletions.forEach((block) => {
              delete blocks._blocks[block];
            });
            vm.refreshWorkspace();
          }
        }
      )
    );
    menu.appendChild(
      menuItem(
        "hide bubble",
        {
          isDisabled: false,
          border: true,
        },
        function () {
          if (
            confirm(
              "Are you sure about this you wont be able to show it unless you reload?"
            )
          ) {
            TWunlocked.utils.hiddenBubbles.push(extension);
            bubble.parentElement.style.display = "none";
          }
        }
      )
    );
    if (TWunlocked.utils.hiddenIcons.includes(extension)) {
      menu.appendChild(
        menuItem("show icon", defaultSettings, function () {
          TWunlocked.utils.hiddenIcons.pop(
            TWunlocked.utils.hiddenBubbles.indexOf(extension)
          );
          bubble.icon.style.display = "";
        })
      );
    } else {
      menu.appendChild(
        menuItem("hide icon", defaultSettings, function () {
          TWunlocked.utils.hiddenIcons.push(extension);
          bubble.icon.style.display = "none";
        })
      );
    }
    widgit.style.height = menuHeight + "px";
    widgit.appendChild(menu);
    tmp = function () {
      try {
        widgit.remove();
        document.body.removeEventListener(tmp);
      } catch {}
    };
    document.querySelector("div.blocklyToolboxDiv").onmousedown = tmp;
    document.body.appendChild(widgit);
  };

  function importImage(url, costume_name) {
    const storage = vm.runtime.storage;
    function get_url_extension(uri) {
      var len = uri.split("/");
      return len[len.length - 1].split(".")[1].split(/[#?]/gi)[0];
    }
    let dataType = "",
      dataFormat = "";
    if (url.startsWith("data:image/")) {
      url = url.replace("data:image/", "");
      if (url.startsWith("svg"))
        (dataType = "svg"), (dataFormat = storage.DataFormat.SVG);
      if (url.startsWith("png"))
        (dataType = "png"), (dataFormat = storage.DataFormat.PNG);
      if (url.startsWith("jpg"))
        (dataType = "jpg"), (dataFormat = storage.DataFormat.JPG);
      if (url.startsWith("jpeg"))
        (dataType = "jpg"), (dataFormat = storage.DataFormat.JPG);
      if (dataType == "") return -1;
      url = `data:image/${url}`;
    } else {
      dataType = get_url_extension(url);
      dataType = dataType.toLowerCase();
      switch (dataType) {
        case "svg":
          dataFormat = storage.DataFormat.SVG;
          break;
        case "png":
          dataFormat = storage.DataFormat.PNG;
          break;
        default:
          // *cough* to many jpg formats
          if (["jpg", "jpeg", "jfif" /* etc, etc.. */].includes(dataType)) {
            dataFormat = storage.DataFormat.JPG;
            break;
          }
          return -2;
      }
    }
    dataType = dataType.toLowerCase();
    window
      .fetch(url)
      .then((r) => r.arrayBuffer())
      .then((arrayBuffer) => {
        const storage = vm.runtime.storage;
        //  @ts-expect-error
        vm.addCostume(costume_name + `.${dataType.toUpperCase()}`, {
          name: costume_name + "",
          asset: new storage.Asset(
            dataType == "svg"
              ? storage.AssetType.ImageVector
              : storage.AssetType.ImageBitmap,
            null,
            // @ts-expect-error YES IT IS SHUT TS lol
            dataFormat,
            new Uint8Array(arrayBuffer),
            true
          ),
        });
      });
    return 1;
  }
  function createImage(name, url, onclick) {
    var libItem = document.querySelector(
      'div[class^="library-item_library-item"]'
    );
    var wrapper = document.createElement("div");
    libItem.classList.forEach((class_) => {
      wrapper.classList.add(class_);
    });
    wrapper.role = "button";
    wrapper.tabIndex = "0";
    var imageWrapperOuter = document.createElement("div");
    var imageWrapperInner = document.createElement("div");
    libItem.childNodes[0].classList.forEach((class_) => {
      imageWrapperOuter.classList.add(class_);
    });
    libItem.childNodes[0].childNodes[0].classList.forEach((class_) => {
      imageWrapperInner.classList.add(class_);
    });
    var image = document.createElement("img");
    image.classList.add(
      document.querySelector('img[class^="library-item_library-item-image"]')
        .classList[0]
    );
    image.draggable = false;
    image.loading = "lazy";
    image.src = url;
    imageWrapperInner.appendChild(image);
    imageWrapperOuter.appendChild(imageWrapperInner);
    wrapper.appendChild(imageWrapperOuter);
    var title = document.createElement("span");
    title.classList.add(
      document.querySelector('span[class^="library-item_library-item-name"]')
        .classList[0]
    );
    title.innerHTML = name;
    wrapper.appendChild(title);
    wrapper.onclick = function (e) {
      onclick(e, this);
    };
    return wrapper;
  }
  function loadCustomCostumes(namespace) {
    setTimeout(function () {
      let library = document.querySelector(
        'div[class^="library_library-scroll-grid"]'
      );
      function add(elem) {
        library.childNodes[0].before(elem, library.childNodes[0]);
      }
      function loadImageFn(e, self) {
        importImage(
          self.querySelector("img").src,
          self.querySelector("span").innerHTML
        );
        document
          .querySelector(
            'div[class^="modal_header-item"] span[class^="button_outlined-button"]'
          )
          .click();
      }
      //you dont need to do this if you are stealing from me, which please dont do :sob:
      let found = JSON.parse(
        localStorage.getItem(namespace ?? "twu:customImages")
      );
      if (found.length == 0) return;
      for (let i = 0; i < found.length; i++) {
        let cos = found[i];
        add(createImage(cos.name, cos.url, loadImageFn));
      }
    }, 2000);
  }
  function loadCustomBackdrops() {
    loadCustomCostumes("twu:customBackdrops");
  }
  const observerConfig = {
    attributes: true,
    childList: true,
    characterData: true,
  };
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type == "attributes") return;
      if (mutation.addedNodes.length > 0) {
        if (mutation.addedNodes[0].classList.contains("ReactModalPortal")) {
          let modalTitle = document.querySelector(
            '[class^="modal_header-item"]'
          ).innerHTML;
          switch (modalTitle) {
            case "Choose a Sprite":
              loadCustomCostumes();
              break;
            case "Choose a Backdrop":
              loadCustomBackdrops();
              break;
            case "Choose a Costume":
              loadCustomCostumes();
              break;
          }
        }
      }
    });
  });
  observer.observe(document.body, observerConfig);

  //Setup options menu.
  const preAppend = "twUoM_";
  TWunlocked.utils.optionsElm.classList.add("TWunlockedModal");
  TWunlocked.utils.optionsElm.innerHTML = `<button onclick="TWunlocked.utils.optionsElm.close()">Close.</button><br>
<div>
  <h4>TW-Unlocked | v${VERSION}</h4>
  <hr>
  <label><button onclick="TWunlocked.utils.extMan()">Load extension</button> : 
    <input type="url" id="${preAppend}le"/>&emsp;<label>Unsandboxed: <input type="checkbox" id="${preAppend}leC" checked/>
  </label><br><button style="display:none;" id="${preAppend}" onclick="TWunlocked.utils.addForIextension();this.nextElementSibling.remove();this.remove();" title="#Bring Back For I">Bring back the For I block</button><br><hr>
  <button id="${preAppend}sMs">Disable</button> vm security manager<hr>
  <button onclick="TWunlocked.extManager.show();">Manage custom featured extensions</button><br>
  <button onclick="TWunlocked.cosManager.show();">Manage custom costumes</button><br>
  <button onclick="TWunlocked.dropManager.show();">Manage custom backdrops</button><br>
  <button onclick="vm.runtime.extensionManager.refreshBlocks()">Refresh Blocks</button><br>
  <button onclick="vm.refreshWorkspace()">Refresh Workspace</button>
  <hr>
  Submit an extension that cannot be on the gallery to: <a href="https://github.com/SurvExe1Pc/unsafe-extensions">HERE, Click me!!</a>
  <hr>
</div>`;
  TWunlocked.utils.optionsElm.id = "TWunlocked-ModalDiv";
  document.body.appendChild(TWunlocked.utils.optionsElm);
  // *cough* ima copy paste for backdrops, and sounds, and extensions... *cough*
  //Backdrop library adder modal
  TWunlocked.dropManager = {
    menuOpen: false,
    lsId: "twu:customBackdrops",
    elem: document.createElement("dialog"),
    pop() {
      this.elem.remove();
    },
    close() {
      this.elem.close();
      TWunlocked.utils.optionsElm.showModal();
    },
    show() {
      TWunlocked.utils.optionsElm.close();
      this.elem.showModal();
    },
    refreshMenu() {
      const menuBtn = document.querySelector(`button#${preAppend}dropMenuBtn`);
      if (TWunlocked.dropManager.elem.open && this.menuOpen) {
        menuBtn.click();
        setTimeout(() => {
          menuBtn.click();
        }, 100);
      }
    },
    add() {
      let iName = document.querySelector(`input#${preAppend}dropiName`);
      let iUrl = document.querySelector(`input#${preAppend}dropiUrl`);
      var tmp = iName.value;
      iName.value = "";
      iName = tmp;
      tmp = iUrl.value;
      iUrl.value = "";
      iUrl = tmp;
      let found = JSON.parse(localStorage.getItem(this.lsId));
      found.push({ name: iName, url: iUrl });
      localStorage.setItem(this.lsId, JSON.stringify(found));
      this.refreshMenu();
    },
    getUl() {
      let items = document.createElement("ul");
      if (!localStorage.hasOwnProperty(this.lsId))
        localStorage.setItem(this.lsId, JSON.stringify([]));
      let found = JSON.parse(localStorage.getItem(this.lsId));
      const noItems = document.createElement("span");
      noItems.innerHTML = "&nbsp;&nbsp;No backdrops found, try adding some!";
      if (found.length == 0) return noItems;
      for (let i = 0; i < found.length; i++) {
        let drop = found[i];
        var tmp2 = document.createElement("li");
        tmp2.innerHTML = `${drop.name}&nbsp;&nbsp;<button onclick="TWunlocked.dropManager.popItem(${i})">Remove</button>`;
        items.appendChild(tmp2);
      }
      return items;
    },
    popItem(num) {
      let found = JSON.parse(localStorage.getItem(this.lsId));
      found.pop(num);
      localStorage.setItem(this.lsId, JSON.stringify(found));
      this.refreshMenu();
    },
    updateMenu() {
      let menuButton = document.querySelector(`button#${preAppend}dropMenuBtn`);
      let menu = document.querySelector(`div#${preAppend}dropMenu`);
      if (menu.style.display == "none") {
        this.menuOpen = true;
        menuButton.innerHTML = "Hide menu";
        menu.style.display = "";
        while (menu.hasChildNodes()) {
          menu.firstChild.remove();
        }
        menu.appendChild(this.getUl());
      } else {
        this.menuOpen = false;
        menuButton.innerHTML = "Show menu";
        menu.style.display = "none";
      }
    },
  };
  TWunlocked.dropManager.elem.id = "TWunlocked-dropManager";
  TWunlocked.dropManager.elem.innerHTML = `<button onclick="TWunlocked.dropManager.close()">Back</button><hr>
  <h3>Add a custom backdrop image:</h3>
  <label>Image name: <input id="${preAppend}dropiName"/><br></label>
  <label>Image url: <input id="${preAppend}dropiUrl"/><br></label>
  <button onclick="TWunlocked.dropManager.add()">Add</button><hr>
  <span>Custom images: <div id="${preAppend}dropMenu" style="display:none;"></div>
  <button id="${preAppend}dropMenuBtn" onclick="TWunlocked.dropManager.updateMenu()">Show menu</button><br></span>`;
  TWunlocked.dropManager.elem.classList.add("TWunlockedModal");
  document.body.appendChild(TWunlocked.dropManager.elem);
  //Costume library adder modal
  TWunlocked.cosManager = {
    menuOpen: false,
    elem: document.createElement("dialog"),
    lsId: "twu:customImages",
    pop() {
      this.elem.remove();
    },
    close() {
      this.elem.close();
      TWunlocked.utils.optionsElm.showModal();
    },
    show() {
      TWunlocked.utils.optionsElm.close();
      this.elem.showModal();
    },
    refreshMenu() {
      const menuBtn = document.querySelector(`button#${preAppend}cosMenuBtn`);
      if (TWunlocked.cosManager.elem.open && this.menuOpen) {
        menuBtn.click();
        setTimeout(() => {
          menuBtn.click();
        }, 100);
      }
    },
    add() {
      let iName = document.querySelector(`input#${preAppend}cosiName`);
      let iUrl = document.querySelector(`input#${preAppend}cosiUrl`);
      var tmp = iName.value;
      iName.value = "";
      iName = tmp;
      tmp = iUrl.value;
      iUrl.value = "";
      iUrl = tmp;
      let found = JSON.parse(localStorage.getItem(this.lsId));
      found.push({ name: iName, url: iUrl });
      localStorage.setItem(this.lsId, JSON.stringify(found));
      this.refreshMenu();
    },
    getUl() {
      let items = document.createElement("ul");
      if (!localStorage.hasOwnProperty(this.lsId))
        localStorage.setItem(this.lsId, JSON.stringify([]));
      let found = JSON.parse(localStorage.getItem(this.lsId));
      const noItems = document.createElement("span");
      noItems.innerHTML = "&nbsp;&nbsp;No costumes found, try adding some!";
      if (found.length == 0) return noItems;
      for (let i = 0; i < found.length; i++) {
        let cos = found[i];
        var tmp2 = document.createElement("li");
        tmp2.innerHTML = `${cos.name}&nbsp;&nbsp;<button onclick="TWunlocked.cosManager.popItem(${i})">Remove</button>`;
        items.appendChild(tmp2);
      }
      return items;
    },
    popItem(num) {
      let found = JSON.parse(localStorage.getItem(this.lsId));
      found.pop(num);
      localStorage.setItem(this.lsId, JSON.stringify(found));
      this.refreshMenu();
    },
    updateMenu() {
      let menuButton = document.querySelector(`button#${preAppend}cosMenuBtn`);
      let menu = document.querySelector(`div#${preAppend}cosMenu`);
      if (menu.style.display == "none") {
        this.menuOpen = true;
        menuButton.innerHTML = "Hide menu";
        menu.style.display = "";
        while (menu.hasChildNodes()) {
          menu.firstChild.remove();
        }
        menu.appendChild(this.getUl());
      } else {
        this.menuOpen = false;
        menuButton.innerHTML = "Show menu";
        menu.style.display = "none";
      }
    },
  };
  TWunlocked.cosManager.elem.id = "TWunlocked-cosManager";
  TWunlocked.cosManager.elem.innerHTML = `<button onclick="TWunlocked.cosManager.close()">Back</button><hr>
<h3>Add a custom sprite / costume image:</h3>
<label>Image name: <input id="${preAppend}cosiName"/><br></label>
<label>Image url: <input id="${preAppend}cosiUrl"/><br></label>
<button onclick="TWunlocked.cosManager.add()">Add</button><hr>
<span>Custom images: <div id="${preAppend}cosMenu" style="display:none;"></div>
<button id="${preAppend}cosMenuBtn" onclick="TWunlocked.cosManager.updateMenu()">Show menu</button><br></span>`;
  TWunlocked.cosManager.elem.classList.add("TWunlockedModal");
  document.body.appendChild(TWunlocked.cosManager.elem);
  //extension library adder modal
  TWunlocked.extManager = {
    menuOpen: false,
    elem: document.createElement("dialog"),
    lsId: "twu:customExtensions",
    lsSId: "twu:customExtensionsSettings",
    pop() {
      this.elem.remove();
    },
    close() {
      this.elem.close();
      TWunlocked.utils.optionsElm.showModal();
    },
    show() {
      TWunlocked.utils.optionsElm.close();
      this.elem.showModal();
    },
    refreshMenu() {
      const menuBtn = document.querySelector(`button#${preAppend}extMenuBtn`);
      if (TWunlocked.extManager.elem.open && this.menuOpen) {
        menuBtn.click();
        setTimeout(() => {
          menuBtn.click();
        }, 100);
      }
    },
    add() {
      let iName = document.querySelector(`input#${preAppend}extiName`);
      let iUrl = document.querySelector(`input#${preAppend}extiUrl`);
      let aUrl = document.querySelector(`input#${preAppend}extaUrl`);
      let bUrl = document.querySelector(`textarea#${preAppend}extbUrl`);
      var tmp = iName.value;
      iName.value = "";
      iName = tmp;
      tmp = iUrl.value;
      iUrl.value = "";
      iUrl = tmp;
      tmp = aUrl.value;
      aUrl.value = "";
      aUrl = tmp;
      tmp = bUrl.value;
      bUrl.value = "";
      bUrl = tmp;
      let found = JSON.parse(localStorage.getItem(this.lsId));
      found.push({ name: iName, url: iUrl, image_url: aUrl, description: bUrl });
      localStorage.setItem(this.lsId, JSON.stringify(found));
      this.refreshMenu();
    },
    getUl() {
      let items = document.createElement("ul");
      if (!localStorage.hasOwnProperty(this.lsId))
        localStorage.setItem(this.lsId, JSON.stringify([]));
      let found = JSON.parse(localStorage.getItem(this.lsId));
      const noItems = document.createElement("span");
      noItems.innerHTML = "&nbsp;&nbsp;No extensions found, try adding some!";
      if (found.length == 0) return noItems;
      for (let i = 0; i < found.length; i++) {
        let ext = found[i];
        var tmp2 = document.createElement("li");
        tmp2.innerHTML = `${ext.name}&nbsp;&nbsp;<button onclick="TWunlocked.extManager.popItem(${i})">Remove</button>`;
        items.appendChild(tmp2);
      }
      return items;
    },
    popItem(num) {
      let found = JSON.parse(localStorage.getItem(this.lsId));
      found.pop(num);
      localStorage.setItem(this.lsId, JSON.stringify(found));
      this.refreshMenu();
    },
    updateMenu() {
      let menuButton = document.querySelector(`button#${preAppend}extMenuBtn`);
      let menu = document.querySelector(`div#${preAppend}extMenu`);
      if (menu.style.display == "none") {
        this.menuOpen = true;
        menuButton.innerHTML = "Hide menu";
        menu.style.display = "";
        while (menu.hasChildNodes()) {
          menu.firstChild.remove();
        }
        menu.appendChild(this.getUl());
      } else {
        this.menuOpen = false;
        menuButton.innerHTML = "Show menu";
        menu.style.display = "none";
      }
    },
    getMarks() {
      let found = localStorage.getItem(this.lsSId);
      if (found == undefined || found == null || found == 'undefined') found = {
        myGallery: false,
        spGallery: false
      }
      if (typeof found !== 'object') found = JSON.parse(found);
      if (!found.hasOwnProperty('myGallery')) found.myGallery = false;
      if (!found.hasOwnProperty('spGallery')) found.spGallery = false;
      localStorage.setItem(this.lsSId, JSON.stringify(found));
      return found;
    },
    updateCheckmarks() {
      let found = this.getMarks();
      found.myGallery = document.querySelector(`input#${preAppend}extgLoadMine`).checked;
      found.spGallery = document.querySelector(`input#${preAppend}extgLoadSP`).checked;
      localStorage.setItem(this.lsSId, JSON.stringify(found));
    },
    getCheck(check) {
      let found = this.getMarks();
      return found[check];
    },
  };
  TWunlocked.extManager.elem.id = "TWunlocked-extManager";
  TWunlocked.extManager.elem.innerHTML = `<button onclick="TWunlocked.extManager.close()">Back</button><hr>
<h3>Add a custom extension</h3>
<label>Extension name: <input id="${preAppend}extiName"/><br></label>
<label>Extension url: <input id="${preAppend}extiUrl"/><br></label>
<label>Extension image url: <input id="${preAppend}extaUrl"/><br></label>
<label>Extension description: <textarea id="${preAppend}extbUrl"></textarea><br></label>
<button onclick="TWunlocked.extManager.add()">Add</button><hr>
<span>Custom extensions: <div id="${preAppend}extMenu" style="display:none;"></div>
<button id="${preAppend}extMenuBtn" onclick="TWunlocked.extManager.updateMenu()">Show menu</button><br></span>
<label>auto load from <a href="https://surv.is-a.dev/unsafe-extensions/">unsafe-gallery</a>: <input id="${preAppend}extgLoadMine" type="checkbox"${(TWunlocked.extManager.getCheck('myGallery') ? ' checked' : '')} onclick="TWunlocked.extManager.updateCheckmarks()"/><br></label>
<label>auto load from <a href="https://surv.is-a.dev/unsafe-extensions/">sharkpools gallery</a>: <input id="${preAppend}extgLoadSP" type="checkbox"${(TWunlocked.extManager.getCheck('spGallery') ? ' checked' : '')} onclick="TWunlocked.extManager.updateCheckmarks()"/><br></label>`;
  TWunlocked.extManager.elem.classList.add("TWunlockedModal");
  document.body.appendChild(TWunlocked.extManager.elem);
  const loadExtensionInput = document.getElementById(preAppend + "le");
  const loadExtension_unsandboxedCheck = document.getElementById(
    preAppend + "leC"
  );
  const securityManagerSwitchBtn = document.getElementById(preAppend + "sMs");
  securityManagerSwitchBtn.onclick = function () {
    if (this.innerText == "Disable") {
      this.innerText = "Enable";
      TWunlocked.disablePermissionSecurity();
    } else {
      this.innerText = "Disable";
      TWunlocked.restorePermissionSecurity();
    }
  };
  TWunlocked.utils.extMan = function () {
    if (loadExtension_unsandboxedCheck.checked) {
      TWunlocked.loadExtensionUnsandboxed(loadExtensionInput.value);
    } else {
      vm.runtime.extensionManager.loadExtensionURL(loadExtensionInput.value);
    }
  };

  TWunlocked.utils.UpdateButton = {};
  TWunlocked.utils.UpdateButton.dontFixButton = TWunlocked.isDesktop;
  TWunlocked.utils.UpdateButton.oldHref = document.location.href;
  TWunlocked.utils.UpdateButton.update = function () {
    if (TWunlocked.utils.UpdateButton.dontFixButton) {
      clearInterval(TWunlocked.utils.UpdateButton.btnIvl);
      TWunlocked.utils.UpdateButton.btnIvl = "stopped";
      TWunlocked.utils.UpdateButton = "";
      delete TWunlocked.utils.UpdateButton;
      return;
    }
    if (
      !TWunlocked.isDesktop &&
      (document.location.href != TWunlocked.utils.UpdateButton.oldHref ||
        document.getElementById("TWunlocked-NavBtn") == null)
    ) {
      TWunlocked.openButton.addSelfToNav();
      return;
    }
  };
  TWunlocked.utils.UpdateButton.btnIvl = setInterval(
    TWunlocked.utils.UpdateButton.update,
    50
  );
  TWunlocked.utils.updateTick = function () {
    if (document.querySelector('button[class^="gui_extension-button"]'))
      TWunlocked.utils.extBtnAddListen();
    let toolbox = document.querySelector("div.blocklyToolboxDiv");
    if (toolbox && toolbox.oncontextmenu == null)
      toolbox.oncontextmenu = toolboxMenu;
  };
  TWunlocked.utils.updateIvl = setInterval(TWunlocked.utils.updateTick, 50);

  //USM
  TWunlocked.attemptRemovalOfUSMscript = function () {
    document.getElementById("TWunlocked-Script-" + TWunlocked.topLoader);
  };

  //Add the modal.
  TWunlocked.openButton = TWunlocked.addMenuBtn("TW-Unlocked", function () {
    TWunlocked.utils.optionsElm.showModal();
  });
  TWunlocked.openButton.setID("TWunlocked-NavBtn");

  //Load extensions out of url
  if (TWunlocked.utils.loadUextsFromUrl(true)) {
    TWunlocked.utils.loadUriExtBtn = TWunlocked.addMenuBtn(
      "Load URL extensions",
      function () {
        TWunlocked.utils.loadUextsFromUrl(false);
        TWunlocked.utils.loadUriExtBtn.remove();
      }
    );
  }

  console.log(
    `TW-Unlocked v${VERSION} | Loaded!\nIf this is a custom "editor" and you want it removed run TWunlocked.removeCurrentHostnameFromAllowed()`
  );
};
ImportTWunlock(true, window.vm);
