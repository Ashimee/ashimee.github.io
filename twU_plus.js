// ==UserScript==
// @name TW-Unlocked (Console)
// @namespace https://github.com/Ashimee/userscripts
// @description THIS WILL NOT WORK AS YOU ARE USING THE CONSOLE VERSION
// @version -1
// @icon https://turbowarp.org/favicon.ico
// @match *://*/*
// @match *://turbowarp.org/*
// @match *://www.turbowarp.org/*
// @grant GM_log
// @grant unsafeWindow
// @run-at document-end
// ==/UserScript==

/*!
 *  ==IMPORT VIA BOOKMARKLET OR CONSOLE==
 * TW-Unlocked
 * Other-scripts: https://github.com/Ashimee/userscripts
 * Adds some useful functions to turbowarp that are disabled due to security issues.
 * version below
 * Made By Ashimee.
 */

// if your in here to find the easter eggs fuck off <3
(async function() {
    /* Checks if this is a userscript */
    if (typeof GM_log !== 'undefined') {
        if (unsafeWindow) var window = unsafeWindow;
        window.alert('Please use the userscript version of TWunlocked.');
        throw new Error('Not a userscript.');
    }

    /* Checks for window :sob: */
    if (typeof globalThis !== 'object') {
        console.error('Please load on a valid page.');
        throw new Error('Missing window');
    }
    var window = globalThis;

    /* Honestly it was a funny project, */
    /* This sends trace data if true .-. */
    const collectData = false;
    const VERSION = '1.1-indev';

    var twuInject = /**
     * IIFE To load TWUnlocked
     * @param {VM} vm VM instance
     */ async function (vm) {
        /**
         * Console.log wrapper
         * @param {String} logType ?['log', 'warn', 'error']
         * @param {Any} logs
         */
        function log(logType, ...logs) {
            logType = logType ?? 'log';
            console[logType]('[TWU] |', ...logs);
        }

        let de_injected = false;

        /* Some constants */

        const docHref = document.location.href;

        /**
         * A list of blocked and default turbowarp or related pages
         */
        const pages = {
            /*!
             * Reasons:
             *   GandiIDE:   Dangerous data collection.
             *   Scratch:    This just wont work.
             *   PenguinMod: I am not risking it, as this already does not work on penguinmod on some aspects.
             */
            blocked: ['studio.penguinmod.site', 'penguinmod.site', 'studio.penguinmod.com', 'penguinmod.com', 'cocrea.world', 'getgandi.com', 'scratch.mit.edu'],
            defaults: ['experiments.turbowarp.org', 'turbowarp.org', 'staging.turbowarp.org', 'unsandboxed.org', 'twplus.pages.dev'],
        };

        /**
         * Some prepend constants for stuff like localStorage and id's
         */
        const prepend = {
            localStorage: 'twU:',
            ids: 'twU_',
        };

        const onDesktopApp = docHref.includes('TurboWarp/resources/app.asar');

        const CORE_EXTENSIONS = [
            'motion',
            'looks',
            'sound',
            'events',
            'control',
            'sensing',
            'operators',
            'variables',
            'myBlocks'
        ];

        /**
         * Returns weather or not the user is in the editor
         * @returns {Boolean}
         */
        const inEditor = () => {
            const state = window?.ReduxStore?.getState();
            if (!state) return false;
            return !state.scratchGui.mode.isPlayerOnly;
        };

        /**
         * Gets all values that may become unusable is some states
         * @returns Some stuff
         */
        function getAllPossibleNulls() { try {
            const ReduxStore = window?.ReduxStore;
            const ScratchBlocks = window?.ScratchBlocks;
            const fileGroupBar = document.querySelector('[class^=menu-bar_file-group]');
            const buttonHoverClasses = fileGroupBar.querySelector('[class^=menu-bar_menu-bar-item]');
            const toolboxDiv = document.querySelector('[class^=blocklyToolboxDiv]');
            const blocklyWorkspace = document.querySelector('div[class^=injectionDiv]');
            const workspace = ScratchBlocks ? ScratchBlocks.getMainWorkspace() : undefined;
            const allLabels = Array.from(document.querySelectorAll('.scratchCategoryMenuItemLabel'));
            const allBubbles = [...Array.from(document.querySelectorAll('[class=scratchCategoryItemBubble]')), ...Array.from(document.querySelectorAll('[class=scratchCategoryItemIcon]'))];
            return {
                fileGroupBar,
                buttonHoverClasses,
                ReduxStore,
                ScratchBlocks,
                toolboxDiv,
                workspace,
                blocklyWorkspace,
                allBubbles,
                allLabels,
            };
        } catch { return {fail: true} }}
        let queries = getAllPossibleNulls();

        /**
         * Updates the queries object
         */
        function updateQueries() {
            queries = getAllPossibleNulls();
        }

        // https://github.com/TurboWarp/scratch-vm/blob/develop/src/util/uid.js#L11-L12
        const blocklyIdSoup = '!#%()*+,-./:;=?@[]^_`{|}~ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        /* Utility functions */

        /**
         * Throw a error cause im lazy
         */
        const err = () => {
            throw new Error();
        };

        /**
         *
         * @param {Object} object Object to check the key on
         * @param {String} key The key to check for
         * @returns {Boolean}
         */
        const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

        /**
         * Deletes an element without producing an error
         * @param {HTMLElement} element Element to delete
         */
        const removeElement = (element) => {
            try {
                element.remove();
            } catch {
                log('warn', 'Failed to remove element!');
            }
        };

        /**
         * Checks if the current page could be turbowarp
         * @returns {Boolean}
         */
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

        /**
         * Do some domain checks
         */
        function domainChecks() {
            if (onDesktopApp) return;
            if (pages.blocked.includes(docHref)) {
                log('error', 'This page has been blocked.');
                err();
            }
        }

        /**
         * Id generator (Simple)
         */
        function* idGen() {
            let index = 0;
            while (true) {
                index += 1;
                yield index;
            }
        }

        /**
         * Copy one of the classes from one element to the other
         * @param {HTMLElement} element Element with the initial classes
         * @param {HTMLElement} copyToElement Element to copy the classes to
         * @param {Number} idx The class idx to copy
         */
        function copyClass(element, copyToElement, idx) {
            copyToElement.classList.add(element.classList[idx]);
        }

        /**
         * Copy's all the classes from one element to the other
         * @param {HTMLElement} element Element with the initial classes
         * @param {HTMLElement} copyToElement Element to copy the classes to
         */
        function cloneClasses(element, copyToElement) {
            element.classList.forEach((className) => copyToElement.classList.add(className));
        }

        /**
         * Escape a string to be safe to use in XML content.
         * CC-BY-SA: hgoebl
         * https://stackoverflow.com/questions/7918868/
         * how-to-escape-xml-entities-in-javascript
         * @param {!string | !Array.<string>} unsafe Unsafe string.
         * @return {string} XML-escaped string, for use within an XML tag.
         * https://github.com/TurboWarp/scratch-vm/blob/develop/src/util/xml-escape.js
         */
        const xmlEscape = function (unsafe) {
            if (typeof unsafe !== 'string') {
                if (Array.isArray(unsafe)) {
                    unsafe = String(unsafe);
                } else {
                    log('warn', 'Recived invalid input in xmlEscape.');
                    return unsafe;
                }
            }
            return unsafe.replace(/[<>&'"]/g, c => {
                switch (c) {
                    case '<': return '&lt;';
                    case '>': return '&gt;';
                    case '&': return '&amp;';
                    case '\'': return '&apos;';
                    case '"': return '&quot;';
                }
            });
        }

        /**
         * https://stackoverflow.com/a/29263753
         * @param {String} selector Full CSS Selector
         * @returns {CSSStyleSheet} Style sheet
         */
        function getRuleWithSelector(selector) {
            var numSheets = document.styleSheets.length, numRules, sheetIndex, ruleIndex;
            for (sheetIndex = 0; sheetIndex < numSheets; sheetIndex++) {
                try {
                    numRules = document.styleSheets[sheetIndex].cssRules.length;
                    for (ruleIndex = 0; ruleIndex < numRules; ruleIndex += 1) {
                        if (document.styleSheets[sheetIndex].cssRules[ruleIndex].selectorText === selector) {
                            return document.styleSheets[sheetIndex].cssRules[ruleIndex];
                        }
                    }
                } catch {
                    continue;
                }
            }
        }

        /* Extension gallery thing */
        if (hasOwn(window, 'TWUextensionPage')) {
            log('log', 'This is a supported extension page.\nLoading as gallery modifier.');
            document.querySelectorAll('a.open')?.forEach?.(lnk => {
                lnk.style.display = '';
                lnk.href = lnk.href.replace('extension=', 'twu-ext=');
            });
            return Promise.resolve();
        }

        if (!vm) throw new Error('VM not found?????');

        /* My own eventemitter thing */
        class EventEmitter extends EventTarget {
            constructor() {
                super();
                this.events = {};
            }

            /**
             * Register a new kind of event
             * @param {String} eventName Event name
             */
            register(eventName) {
                this.events[eventName] = [];
            }

            /**
             * Calls every event with the event name
             * @param {String} eventName Event name
             * @param {Any} data Data to pass to the event handlers
             */
            emit(eventName, ...data) {
                if (!hasOwn(this.events, eventName)) return;
                const events = this.events[eventName];
                let popped = 0;
                for (let i = 0; i < events.length; i++) {
                    const event = events[i - popped];
                    event.callback(...data);
                    if (event.deleteWhenCalled) {
                        events.pop(i - popped);
                        popped++;
                    }
                }
            }

            /**
             * When an event happens call this
             * @param {String} eventName Event name
             * @param {Function} callback Function to run when the event is received
             */
            on(eventName, callback) {
                if (!hasOwn(this.events, eventName)) return;
                this.events[eventName].push({
                    deleteWhenCalled: false,
                    callback,
                });
            }

            /**
             * When an event happens call this but only let it happen once
             * @param {String} eventName Event name
             * @param {Function} callback Function to run when the event is received
             */
            once(eventName, callback) {
                if (!hasOwn(this.events, eventName)) return;
                this.events[eventName].push({
                    deleteWhenCalled: true,
                    callback,
                });
            }

            /**
             * Clears all the events
             */
            wipe() {
                for (const event in events) {
                    events[event] = [];
                }
            }
        }

        /**
         * Utilities for cookie management
         */
        const cookies = {
            /**
             * Sets a cookie
             * @param cname Cookie name
             * @param cvalue Cookie value
             * @param exdays Expiration day count
             */
            set(cname, cvalue, exdays) {
                const d = new Date();
                d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
                let expires = 'expires=' + d.toUTCString();
                document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
            },

            /**
             * Gets the value of a cookie
             * @param cname Cookie name
             * @returns {String} Cookie value
             */
            get(cname) {
                let name = cname + '=';
                let decodedCookie = decodeURIComponent(document.cookie);
                let ca = decodedCookie.split(';');
                for (let i = 0; i < ca.length; i++) {
                    let c = ca[i];
                    while (c.charAt(0) == ' ') {
                        c = c.substring(1);
                    }
                    if (c.indexOf(name) == 0) {
                        return c.substring(name.length, c.length);
                    }
                }
                return '';
            },
        };

        /**
         * Makes a new blockScoped fetch function to bypass turbowarps blocker
         * @param {String} url The url to request to
         * @param {('GET'|'POST')} method The method of requesting
         * @param {(String|Object)} body The body of the POST request
         * @param {Boolean} skipFetchFormat Skips formatting the XMLHttpRequest like what fetch returns
         * @returns {Promise} Promise event that resolves when it errors, or finishes
         */
        function fetch(url, method, body, skipFetchFormat) {
            try {
                url && 1;
            } catch {
                throw new Error('Fetch missing URL');
            }
            method = method ?? 'GET';
            const ogBody = body;
            body = body ?? {};
            skipFetchFormat = skipFetchFormat ?? false;
            return new Promise((resolve) => {
                var f = new XMLHttpRequest();
                f.open(method, url);
                f.onerror = (e) => {
                    resolve(new Error(e));
                };
                f.onload = (e) => {
                    if (skipFetchFormat) {
                        resolve(e);
                        return;
                    }
                    var t = {
                        text() {
                            return e.currentTarget.responseText;
                        },
                        xml() {
                            return e.currentTarget.responseXML;
                        },
                        json() {
                            return JSON.parse(t.text());
                        },
                        url,
                        body,
                        bodyUsed: !!ogBody,
                        headers: new Headers(),
                        xmlhttpreq: e,
                    };
                    resolve(t);
                };
                f.send(body);
            });
        }

        /**
         * Utilities for random stuff
         */
        const random = {
            /**
             * Generates a random floating point number
             * @param {Number} min Minimum
             * @param {Number} max Maximum
             * @returns {Number} Random float
             */
            float(min, max) {
                return Math.random() * (max - min) + min;
            },

            /**
             * Generates a random integer
             * @param {Number} min Minimum
             * @param {Number} max Maximum
             * @returns {Number} Random integer
             */
            integer(min, max) {
                return Math.round(this.float(min, max));
            },

            /**
             * Generates a random number from Smallest to Biggest possible numbers
             * @param {Boolean} min Minimum
             * @returns {Number} Random float or integer
             */
            bigNumber(float) {
                const minMax = [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER];
                float = float ?? false;
                if (float) return this.float(...minMax);
                return this.integer(...minMax);
            },

            /**
             * Generates a random ID using blockly's format
             * @param length Length of the ID
             * @returns {String} Blockly ID
             * https://github.com/TurboWarp/scratch-vm/blob/develop/src/util/uid.js
             */
            blocklyId(length) {
                length = length ?? 20;
                const soup_ = '!#%()*+,-./:;=?@[]^_`{|}~ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                const soupLength = soup_.length;
                const id = [];
                for (let i = 0; i < length; i++) {
                    id[i] = soup_.charAt(Math.random() * soupLength);
                }
                return id.join('');
            },
        };

        /**
         * Some random conversion utilities
         */
        const conversions = {
            CSS_rgbToHex(rgb) {
                const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
                if (match) {
                    return (
                        '#' +
                        match
                            .slice(1)
                            .map((x) => parseInt(x).toString(16).padStart(2, '0'))
                            .join('')
                    );
                }
                return rgb;
            },
        };

        /**
         * Makes a button
         */
        class MenuBarButton {
            /**
             * Constructor
             * @param {String} html
             * @param {String} image An image url, this is not required
             * @param {Boolean} isDropdown Weather or not this has a dropdown attached to it
             */
            constructor(html, image, isDropdown) {
                const newButton = document.querySelector('div[class^=menu-bar_menu-bar-item]').cloneNode(true);
                this.node = newButton;
                this.isDropdown = isDropdown ?? false;
                this.image = image ?? undefined;
                queries.fileGroupBar.appendChild(newButton);
                this.hide();
                const images = newButton.querySelectorAll('img');
                if (!this.isDropdown) {
                    images[1].remove();
                    newButton.querySelector('div[class^=menu-bar_menu-bar-menu]').remove();
                }
                if (!this.image) images[0].remove();
                this.setLabel(html);
            }

            /**
             * Sets the label to the specified HTML
             * @param {String} html The HTML of the label
             */
            setLabel(html) {
                this.node.querySelector('span[class^=settings-menu_dropdown-label]').innerHTML = html;
            }

            /**
             * Shows the button
             */
            show() {
                this.node.style.display = '';
            }

            /**
             * Hides the button
             */
            hide() {
                this.node.style.display = 'none';
            }

            /**
             * Removes the button
             */
            remove() {
                this.node.remove();
            }
        }

        /**
         * Editor stuff
         */
        const editor = {
            events: new EventEmitter(),
            /**
             * @type {MenuBarButton}
             */
            menuButton: null,

            /**
             * A boolean of if the user was in the editor before the update
             */
            wasInEditor: inEditor(),

            /**
             * Setup event registers and handlers
             */
            setupEvents() {
                const events = this.events;
                events.register('ReduxUpdated');
                events.register('close+open');
                events.register('opened');
                events.register('closed');
                events.register('gotBlocksXML');
                events.register('workspace_contextmenu');
                events.register('block_contextmenu');
                events.register('handle_child_mutation');
                events.register('modal_opened');

                events.on('ReduxUpdated', () => {
                    if (inEditor() !== this.wasInEditor) {
                        this.wasInEditor = inEditor();
                        events.emit('close+open', inEditor());
                        if (inEditor()) events.emit('opened');
                        else events.emit('closed');
                    }
                });
            },

            /**
             * Change the users theme
             * @param {String} theme Theme to change to
             * @param {Boolean} persistent If this is true it will set it in localStorage also
             */
            setTheme(theme, persistent) {
                persistent = persistent ?? false;
                if (queries.ReduxStore) {
                    ReduxStore.getState().scratchGui.theme.theme = theme;
                    ReduxStore.dispatch({
                        type: 'theme',
                    });
                    if (persistent) localStorage['tw:theme'] = theme;
                }
            },

            /**
             * Makes a visual report box at the specified X and Y coords (page wise)
             * @param {String} text What to say
             * @param {Number} x X Position
             * @param {Number} y Y Position
             * @returns {HTMLElement} The node, you have to setup deletion yourself
             */
            visualReportXY(text, x, y) {
                var target = vm.editingTarget,
                    flyout = vm.runtime.flyoutBlocks,
                    blocks = target.blocks;
                var block = structuredClone(flyout._blocks.timer);
                block.id = 'visualReport';
                block.shadow = false;
                block.x, (block.y = 0);
                blocks._blocks['visualReport'] = block;
                blocks._addScript('visualReport');
                vm.emitWorkspaceUpdate();
                vm.runtime.visualReport('visualReport', text);
                var node = document.querySelector('div.blocklyDropDownDiv').cloneNode(true);
                blocks._deleteScript('visualReport');
                vm.emitWorkspaceUpdate();
                document.body.appendChild(node);
                node.style.position = 'absolute !important';
                node.style.zIndex = '21471836';
                node.style.left = `${x}px`;
                node.style.top = `${y}px`;
                return node;
            },

            /**
             * Adds a item to a pre-existing context menu
             * @param {String} text Text for the item
             * @param {Function} callback Callback that is called when the item is clicked
             * @param {Boolean} separator Does this item have a separator
             * @returns {Object}
             */
            addItemToPreExistingContextMenu(text, callback, disabled, separator) {
                disabled = disabled ?? false;
                separator = separator ?? false;
                const widgit = ScratchBlocks.WidgetDiv.DIV;
                const items = widgit.childNodes[0];
                const newItem = document.createElement('div');
                if (!widgit.dataset.fakeItems) {
                    widgit.dataset.fakeItems = 0;
                } else widgit.dataset.fakeItems = parseInt(widgit.dataset.fakeItems) + 1;
                newItem.id = random.blocklyId(20);
                const RTL = ScratchBlocks.mainWorkspace.RTL;
                newItem.classList.add(`goog-menuitem${RTL ? '-rtl' : ''}`);
                if (RTL) {
                    newItem.style['padding-right'] = '28px';
                    newItem.style['padding-left'] = '7em';
                }
                newItem.style['user-select'] = 'none';
                newItem.setAttribute('role', 'menuitem');
                newItem.setAttribute('aria-disabled', disabled);
                newItem.addEventListener('mousedown', (event) => {
                    callback(event);
                    ScratchBlocks.WidgetDiv.hide();
                    widgit.dataset.fakeItems = 0;
                });
                newItem.addEventListener('mouseover', (event) => {
                    newItem.classList.add('goog-menuitem-highlight');
                });
                newItem.addEventListener('mouseout', (event) => {
                    newItem.classList.remove('goog-menuitem-highlight');
                });

                if (separator) {
                    newItem.style['padding-top'] = '2px';
                    newItem.style['border-top'] = '1px solid var(--ui-black-transparent)';
                }
                const itemContent = document.createElement('div');
                itemContent.classList.add('goog-menuitem-content');
                itemContent.style['user-select'] = 'none';
                itemContent.textContent = text;
                newItem.appendChild(itemContent);
                const offsetHeight = (separator ? 2 : 0) + Number(widgit.dataset.fakeItems);
                const baseHeight = Number(widgit.style.height.replace('px', '')) + 16;
                const newHeight = `${baseHeight + offsetHeight}px`;
                return { items, newItem, widgit, offsetHeight, baseHeight };
            },

            addItemsToContextMenu(items) {
                let i = 0,
                    height = 0,
                    obj0 = {};
                for (const itemObject of items) {
                    const off = itemObject.offsetHeight;
                    if (i === 0) (obj0 = itemObject), (height = itemObject.baseHeight + itemObject.offsetHeight + 1);
                    else height += 17 + itemObject.offsetHeight;
                    itemObject.items.appendChild(itemObject.newItem);
                    i++;
                }
                height += 16;
                obj0.widgit.style.height = `${height}px`;
            },

            createExtensionDiv: function (data) {
                const hasCreator = data.hasOwnProperty('creator');
                if (!hasCreator) data['creator'] = { link: '', name: '' };
                const fullWrap = document.createElement('div');
                const imageWrap = document.createElement('div');
                const extImg = document.createElement('img');
                extImg.loading = 'lazy';
                extImg.draggable = false;
                extImg.src = data.image;
                const textWrapper = document.createElement('div');
                const title = document.createElement('span');
                title.innerHTML = data.title;
                const description = document.createElement('span');
                description.innerHTML = data.description;
                const linkWrapper = document.createElement('div');
                const linkDiv = document.createElement('div');
                const creatorLink = document.createElement('a');
                creatorLink.target = '_blank';
                creatorLink.rel = 'noreferrer';
                creatorLink.href = data.creator.link;
                creatorLink.innerHTML = data.creator.name;
                linkDiv.appendChild(creatorLink);
                linkWrapper.appendChild(linkDiv);
                cloneClasses(document.querySelector('div[class^=library-item_library-item]'), fullWrap);
                cloneClasses(document.querySelector('div[class^=library-item_featured-extension-text]'), textWrapper);
                copyClass(document.querySelector('div[class^=library-item_featured-image-container]'), imageWrap, 0);
                copyClass(document.querySelector('div[class^=library-item_featured-image]'), extImg, 0);
                copyClass(document.querySelector('span[class^=library-item_library-item-name]'), title, 0);
                copyClass(document.querySelector('span[class^=library-item_featured-description]'), description, 0);
                imageWrap.appendChild(extImg);
                if (!TWunlocked.isDesktop) {
                    copyClass(document.querySelector('div[class^=library-item_extension-links]'), linkWrapper, 0);
                }
                textWrapper.appendChild(title);
                textWrapper.appendChild(document.createElement('br'));
                textWrapper.appendChild(description);
                fullWrap.appendChild(imageWrap);
                fullWrap.appendChild(textWrapper);
                if (hasCreator) fullWrap.appendChild(linkWrapper);
                if (TWunlocked.isDesktop) {
                    const incompatibleTextWrap = document.createElement('div');
                    copyClass(document.querySelector('div[class^=library-item_incompatible-with-scratch]'), incompatibleTextWrap, 0);
                    const incompatibleText = document.createElement('span');
                    incompatibleText.innerHTML = 'Not compatible with Scratch.';
                    incompatibleTextWrap.appendChild(incompatibleText);
                    fullWrap.appendChild(incompatibleTextWrap);
                    extImg.width = 296;
                    extImg.height = 184;
                }
                return fullWrap;
            },
        };

        /**
         * Sprite asset related functions
         */
        const sprites = {};

        /**
         * Id and class name stuff
         */
        const classAndIdNames = {
            modal: `${prepend.ids}_modal`,
            menuButton: `${prepend.ids}_menuButton`,
            button: `${prepend.ids}_button`,
            checkbox: `${prepend.ids}_checkbox`,
        };

        /**
         * Styling element
         */
        const styles = document.createElement('style');
        styles.textContent = `
    * {
        --mbBg: #ff4c4c;
        --mbHover: #ff6565;
        --mbActive: #ff5353;
        --mtColor: #ffffff;
    }
    .${classAndIdNames.button} {
        background-color: var(--mbBg);
        border-radius: 7px;
        border: 1px solid var(--mbBg);
        display: inline-block;
        cursor: pointer;
        color: var(--mtColor);
        font-family: Trebuchet MS;
        font-size: 12px;
        padding: 4px 6px;
        text-decoration: none;
    }
    .${classAndIdNames.button}:hover {
        background-color: var(--mbHover);
    }
    .${classAndIdNames.button}:active {
        background-color: var(--mbActive);
        position: relative;
        top: 1px;
    }
    `;
        document.documentElement.appendChild(styles);

        /* Events */
        editor.setupEvents();
        const events = new EventEmitter();
        events.register('ReduxUpdated');
        events.register('addonsAccessible');

        if (queries.ReduxStore) {
            const ReduxStore = queries.ReduxStore;
            ReduxStore.subscribe(() => {
                events.emit('ReduxUpdated');
                editor.events.emit('ReduxUpdated');
            });
        }

        events.on('ReduxUpdated', () => {
            const ReduxStore = queries.ReduxStore;
            const state = ReduxStore.getState();
        });

        /**
         * Data for some bindings
         */
        const bindings_data = {
            /**
             * Data relating to pinned blocks
             */
            pinnedBlocks: {
                opcodes: {},
                xml: '',
                /**
                 * Update the XML of the fake pinned blocks category
                 */
                updateXML() {
                    const opcodeData = Object.values(this.opcodes);
                    this.xml = `<category name="Pinned Blocks" id="pinned_blocks" colour="#331C05" secondaryColour="#FF8C1A">
                    ${opcodeData}
                </category>`;
                    if (opcodeData.length < 1) {
                        this.xml = '';
                    }
                    vm.extensionManager.refreshBlocks();
                },
            },
        };

        /**
         * Other data
         */
        const store = {
            bubbleAddon: {
                /**
                 * Gets all the rows
                 * @returns {Array[HTMLElement]}
                 */
                allRows() {
                    return Array.from(document.querySelectorAll('div.scratchCategoryMenuRow'));
                },

                /**
                 * Extracts the extension id from the rowNode
                 * @param {HTMLElement} rowNode Row node
                 * @returns {String} Returns the extension id
                 */
                extractExtensionId(rowNode) {
                    return Array.from(rowNode.querySelector('[class^=scratchCategoryMenuItem]').classList)
                        .filter((class_) => class_.startsWith('scratchCategoryId-'))[0]
                        .replace('scratchCategoryId-', '');
                },

                /**
                 * All the extension id's in order
                 * @returns {Array} An array of every extension name in order of the toolbox
                 */
                getAllExtensionIdsInOrder() {
                    return this.allRows().map((rowNode) => this.extractExtensionId(rowNode));
                },

                /**
                 * Gets all the hidden labels
                 */
                hiddenLabels() {
                    const hidden = [],
                        extensionIDs = this.getAllExtensionIdsInOrder();
                    for (let i = 0; i < queries.allLabels.length; i++) {
                        const label = queries.allLabels[i],
                            extensionID = extensionIDs[i];
                        if (label.hidden) hidden.push(extensionID);
                    }
                    return hidden;
                },

                /**
                 * Gets all the hidden bubbles
                 */
                hiddenBubbles() {
                    const hidden = [],
                        extensionIDs = this.getAllExtensionIdsInOrder();
                    for (let i = 0; i < queries.allBubbles.length; i++) {
                        const label = queries.allBubbles[i],
                            extensionID = extensionIDs[i];
                        if (label.hidden) hidden.push(extensionID);
                    }
                    return hidden;
                },

                /**
                 * Gets the category div from the toolbox
                 * @param category Category name
                 * @returns {HTMLElement} Returns the category div
                 */
                getToolboxCategory(category) {
                    return document.querySelector(`[class*=scratchCategoryId-${category}]`);
                },
            },

            miniToolbox: {
                wasMinimized: false,

                /**
                 * Minimizes the toolbox
                 */
                hide() {
                    const categoryMenu = document.querySelector('.scratchCategoryMenu');
                    const flyout = document.querySelector('svg.blocklyFlyout');
                    categoryMenu.setAttribute('data-minimized', '');
                    categoryMenu.style['clip-path'] = 'circle(0)';
                    categoryMenu.style['width'] = '46px';
                    flyout.style['transform'] = 'translate(45px, 0px)';
                    flyout.style['width'] = '102%';
                    this.wasMinimized = true;
                },

                /**
                 * Removes minimization status
                 */
                show() {
                    const categoryMenu = document.querySelector('.scratchCategoryMenu');
                    const flyout = document.querySelector('svg.blocklyFlyout');
                    categoryMenu.removeAttribute('data-minimized');
                    categoryMenu.style.removeProperty('width');
                    categoryMenu.style.removeProperty('clip-path');
                    flyout.style['transform'] = 'translate(60px, 0px)';
                    flyout.style['width'] = '100%';
                    this.wasMinimized = false;
                },
            },

            devtools: {
                autoAdd(itemObject) {
                    const widgitStyle = itemObject.widgit.style;
                    itemObject.items.appendChild(itemObject.newItem);
                    widgitStyle.height = itemObject.newHeight;
                },
            },

            oneTime: {
                hideSandboxBtn: false,
                hideSecurityBtn: false,
                bi: true,
            },

            lilyEgg() {
                if (!vm.extensionManager._loadedExtensions.has('lmsclonesplus')) return false;
                if (!vm.extensionManager._loadedExtensions.has('lmsDictionaries')) return false;
                if (vm.runtime.ioDevices.userData._username !== 'LilyMakesThings') return false;
                return true;
            }
        };

        const extensions = {
            securityManager: vm.extensionManager.securityManager,

            /**
             * Makes every extension load unsandboxed
             */
            disableSandboxPermanently() {
                this.securityManager.getSandboxMode = () => 'unsandboxed';
            },

            /**
             * Loads a extension from URL unsandboxed
             * @param {String} url URL of the extension
             */
            async loadExtensionUnsandboxed(url) {
                const oldSandbox = this.securityManager.getSandboxMode;
                this.disableSandboxPermanently();
                await vm.extensionManager.loadExtensionURL(url);
                this.securityManager.getSandboxMode = oldSandbox;
            },

            /**
             * For removes an extension
             * @param {String} extensionID ID of the extension
             * Note you have to reload to be able to add the extension back 👍
             */
            forceRemoveExtension(extensionID) {
                log('log', `Removing extension: ${extensionID}`);
                const { runtime, extensionManager } = vm;
                const { targets, _blockInfo } = runtime;
                const workerPosition = Array.from(extensionManager._loadedExtensions).map(worker => worker[0]).indexOf(extensionID);
                const extInfo = _blockInfo.find(extension => extension.id === extensionID);
                extInfo.removeMe = true;
                if (workerPosition < 0) {
                    log('error', `Unable to remove extension: ${extensionID} as it was not found`);
                    return false;
                }
                const toDelete = [];
                targets.forEach(target => {
                const blocks = target.blocks;
                    toDelete.push([
                        Object.values(blocks._blocks).filter(block => block.opcode.startsWith(`${extensionID}_`)).map(block => block.id),
                        target
                    ]);
                });
                toDelete.forEach(blockData => {
                    const deleteMe = blockData[0];
                    const blockContainer = blockData[1].blocks;
                    deleteMe.forEach(blockId => blockContainer.deleteBlock(blockId));
                });
                vm.emitWorkspaceUpdate();
                extensionManager._loadedExtensions.delete(extensionID);
                if (!extensionManager.isBuiltinExtension(extensionID)) extensionManager.workerURLs.pop(workerPosition);
                runtime._blockInfo = _blockInfo.filter(ext => !hasOwn(ext, 'removeMe'));
                extensionManager.refreshBlocks();
                runtime.emit('TOOLBOX_EXTENSIONS_NEED_UPDATE');
                runtime.emit('BLOCKS_NEED_UPDATE');
                return true;
            },

            toLoad: Array.from(new URLSearchParams(window.location.href.split('?')[1]).entries()).filter(query => query[0] === 'twu-ext').map(query => query[1])
        };

        /**
         * Bindings for overrode functions
         */
        const bindings = {
            getBlocksXML: vm.runtime.getBlocksXML.bind(vm.runtime),
            visualReport: vm.runtime.visualReport.bind(vm.runtime),
        };

        /**
         * Context menus
         */
        class ContextMenu {
            /**
             * Constructor
             * @param {Function} creation Function that has access to all the function in this class
             */
            constructor(oldThis, creation, afterShow) {
                /**
                 * @type {Any}
                 */
                this.data = {};
                this.items = [];
                Object.keys(oldThis).forEach((key) => {
                    this[key] = oldThis[key];
                });
                this.creation = creation.bind(this);
                this.afterShow = afterShow ?? (() => {});
            }

            /**
             * Function for making menu items faster
             * @param {String} text Text of the item
             * @param {Function} callback What to call when the item is clicked
             * @param {Boolean} enabled Weather or not the user can click this option
             * @param {Boolean} separator This will add a little separator line above the option if true
             */
            addItem(text, callback, enabled, separator) {
                callback = callback ?? (() => {});
                enabled = enabled ?? true;
                separator = separator ?? false;
                this.items.push({
                    text,
                    enabled,
                    separator,
                    callback,
                });
            }

            /**
             * Fakes a mouse position event
             */
            fakeXY() {
                /**
                 * @type {HTMLElement}
                 */
                const WidgitDiv = ScratchBlocks.WidgetDiv.DIV;
                return {
                    clientX: parseFloat(WidgitDiv.style['left']),
                    clientY: parseFloat(WidgitDiv.style['top']),
                };
            }

            /**
             * Shows a new context menu
             * @param {MouseEvent} event A mouse event
             * @param {Array} items Items in the context menu
             * @param {Boolean} isRTL Weather or not it is right to left
             */
            show(event, isRTL) {
                this.event = event;
                isRTL = isRTL ?? Blockly.getMainWorkspace().RTL;
                const oldGesture = ScratchBlocks.mainWorkspace.currentGesture_;
                ScratchBlocks.mainWorkspace.currentGesture_ = { currentBlock_: {}, startBubble_: {} };
                this.items = [];
                this.creation();
                ScratchBlocks.ContextMenu.show(event, this.items, isRTL);
                ScratchBlocks.ContextMenu.currentBlock = null;
                ScratchBlocks.mainWorkspace.currentGesture_ = oldGesture;
                const widgitItems = ScratchBlocks.WidgetDiv.DIV.childNodes[0];
                if (!widgitItems) return;
                widgitItems.style.background = 'var(--sa-contextmenu-bg)';
                widgitItems.style.borderColor = 'var(--sa-contextmenu-border)';
                widgitItems.style.color = 'var(--sa-contextmenu-text)';
                this.afterShow(event);
            }
        }

        /**
         * List of banned flyout category's
         */
        const bannedFlyoutCategorys = {
            pin_block: ['data', 'more', 'data_lists', 'procedures'],
        };

        /**
         * Funny answers for whats on your mind
         * Contributed to by other users.
         */
        const whatsOnYourMindCategory = {
            /**
             * @type {HTMLElement}
             */
            reportNode: null,
            motion: ['Why does the stage not like me :(', 'I got thoes groovy moves man'],
            operators: ['I am a surgeon'],
            myBlocks: ['I am the most unused used category', 'If only I was global 🤔'],
            tw: ['No funny in this repository', 'I am prolly the best ScratchMod out there', '🍡🍡🍡🍡🍡🍡'],
            looks: ["You're only here for the show/hide blocks *hmph*", 'Lookin gud ;) 💖'],
            pen: ['I am the greatest category of all time >:)'],
            microbit: ['You dont actually have a micro:bit do you?'],
            makeymakey: ['I serve ZERO purpose', 'or do I?'],
            sound: ['why does nobody use pitch :(', 'My effects are limited, but funny'],
            events: ['You need me bud :)', 'green flag asked where stop sign went'],
            sensing: ["I am the reason platformer's can exist :]", 'I sense a dark presence among us'],
            control: ['My mom was a very big control freak', '*cough* clones+ use it *cough*'],
            variables: ['I am the core of life!!! jk'],
            lists: ['Im basically variables, but better 😎'],
        };

        /**
         * These are "mixins" that add to pre-existing context menus
         */
        const addToContextMenus = {
            devtools: {
                copyId() {
                    navigator.clipboard.writeText(ScratchBlocks.ContextMenu.currentBlock.id);
                },
                copyOpcode() {
                    navigator.clipboard.writeText(ScratchBlocks.ContextMenu.currentBlock.type);
                },
                menu() {
                    return (addons.data.devtools.enabled ? [
                        editor.addItemToPreExistingContextMenu(
                            'copy opcode',
                            () => {
                                this.copyOpcode();
                            },
                            true,
                            true,
                        ),
                        editor.addItemToPreExistingContextMenu('copy block id', () => {
                            this.copyId();
                        }),
                    ] : false);
                },
            },
            workspace_devtools: {
                menu() {
                    const workspace = Blockly.getMainWorkspace();
                    return (addons.data.rtl.enabled ? [
                        editor.addItemToPreExistingContextMenu(`${workspace.RTL ? 'disable' : 'enable'} RTL mode`, () => {
                            workspace.RTL = !workspace.RTL;
                            vm.emitWorkspaceUpdate();
                        }),
                    ] : false);
                },
            },
            collapseBlocks: {
                menu() {
                    const workspace = Blockly.getMainWorkspace(),
                        block = ScratchBlocks.ContextMenu.currentBlock;
                    return (addons.data.collapseableBlocks.enabled ? [
                        editor.addItemToPreExistingContextMenu(
                            `${block.collapsed_ ? 'un' : ''}collapse block`,
                            () => {
                                block.setCollapsed(!block.collapsed_);
                            },
                            true,
                            true,
                        ),
                    ] : false);
                },
            },
        };

        /**
         * Context menus used are stored here
         */
        const contextMenus = {
            toolbox: new ContextMenu(
                {
                    /**
                     * Climbs parent node until we find a div with the class "scratchCategoryMenuRow"
                     * @param {MouseEvent} event Mouse event
                     * @returns {HTMLElement | null}
                     */
                    getMenuRow(event) {
                        const elements = document.elementsFromPoint(event.clientX, event.clientY);
                        const row = elements.filter((element) => element.classList.contains('scratchCategoryMenuRow'));
                        if (row.length > 0) return row[0];
                        return null;
                    },

                    /**
                     * Extracts the extension id from a row
                     */
                    getExtensionId(rowNode) {
                        return store.bubbleAddon.extractExtensionId(rowNode);
                    },
                },
                /** @this {ContextMenu} */ function () {
                    if (!addons.data.toolboxTools.enabled) return;
                    /**
                     * @type {HTMLElement}
                     */
                    const categoryRow = this.getMenuRow(this.event);
                    const onCatRow = !!categoryRow;
                    (this.categoryRow = categoryRow), (this.onCatRow = onCatRow);
                    if (!onCatRow) {
                        const categoryMenu = document.querySelector('.scratchCategoryMenu');
                        const minimizedMenu = categoryMenu.hasAttribute('data-minimized');
                        this.addItem(
                            `${minimizedMenu ? 'maximize' : 'minimize'} toolbox`,
                            () => {
                                if (minimizedMenu) {
                                    store.miniToolbox.show();
                                } else {
                                    store.miniToolbox.hide();
                                }
                            },
                            true,
                        );
                        this.addItem(
                            `show all bubbles`,
                            () => {
                                queries.allBubbles.forEach((bubble) => (bubble.hidden = true));
                            },
                            true,
                            true,
                        );
                        this.addItem(
                            `hide all bubbles`,
                            () => {
                                queries.allBubbles.forEach((bubble) => (bubble.hidden = false));
                            },
                            true,
                        );
                        this.addItem(
                            `show all labels`,
                            () => {
                                queries.allLabels.forEach((label) => (label.hidden = true));
                            },
                            true,
                            true,
                        );
                        this.addItem(
                            `hide all labels`,
                            () => {
                                queries.allLabels.forEach((label) => (label.hidden = false));
                            },
                            true,
                        );
                        return;
                    }
                    const extensionID = this.getExtensionId(categoryRow);
                    this.extensionID = extensionID;
                    const bubble = categoryRow.querySelector('[class=scratchCategoryItemBubble]') ?? categoryRow.querySelector('[class=scratchCategoryItemIcon]');
                    this.bubble = bubble;
                    const label = categoryRow.querySelector('[class=scratchCategoryMenuItemLabel]');
                    if (!bubble || !label) {
                        log('warn', 'Unable to find bubble or label');
                        return;
                    }
                    if (extensionID === 'pinned_blocks') {
                        const pinnedData = bindings_data.pinnedBlocks,
                            opcodes = Object.keys(pinnedData.opcodes);
                        this.addItem(
                            `delete all pinned`,
                            () => {
                                opcodes.forEach((opcode) => delete pinnedData.opcodes[opcode]);
                                pinnedData.updateXML();
                            },
                            opcodes.length > 0,
                        );
                    }
                    this.addItem(
                        `Remove extension`,
                        () => {
                            if (!confirm('This will remove all the blocks!!')) return;
                            if (extensions.forceRemoveExtension(extensionID)) alert('Done.\nYou must reload if you want to add this extension back.');
                            else alert('Failed to remove extension :(');
                        },
                        !CORE_EXTENSIONS.includes(extensionID),
                        this.items.length > 0,
                    );
                    this.addItem(
                        `${bubble.hidden ? 'show' : 'hide'} bubble`,
                        () => {
                            bubble.hidden = !bubble.hidden;
                        },
                        undefined,
                        this.items.length > 0,
                    );
                    this.addItem(`${label.hidden ? 'show' : 'hide'} text`, () => {
                        label.hidden = !label.hidden;
                    });
                    const categoryMind = whatsOnYourMindCategory[extensionID];
                    if (!!whatsOnYourMindCategory.reportNode) {
                        whatsOnYourMindCategory.reportNode.remove();
                        whatsOnYourMindCategory.reportNode = null;
                    }
                    this.addItem(
                        `whats on your mind ${label.textContent}?`,
                        () => {
                            const speak = categoryMind[random.integer(1, categoryMind.length) - 1],
                                boundingRect = categoryRow.getBoundingClientRect();
                            const visualNode = editor.visualReportXY(speak + '  ', boundingRect.left, boundingRect.top + boundingRect.height / 2 + 10);
                            const oldLeft = parseFloat(visualNode.style.left),
                                arrow = visualNode.querySelector('div.arrowTop');
                            visualNode.style.left = `${oldLeft + boundingRect.width / 2 - 15}px`;
                            arrow.style.transform = 'translate(8px, -9px) rotate(45deg)';
                            whatsOnYourMindCategory.reportNode = visualNode;
                            setTimeout(() => {
                                try {
                                    visualNode.remove();
                                    whatsOnYourMindCategory.reportNode = null;
                                } catch {}
                            }, 2250);
                        },
                        !!categoryMind,
                        true,
                    );
                },
                function () {
                    if (!this.onCatRow) return;
                    function getColors() {
                        const SbColors = ScratchBlocks.Colours[this.extensionID];
                        if (SbColors) {
                            return {
                                color1: SbColors.primary,
                                color2: SbColors.secondary,
                                color3: SbColors.tertiary,
                                color4: SbColors.quaternary,
                            };
                        }
                        const colors = vm.runtime._blockInfo.filter((extension) => extension.id === this.extensionID)[0];
                        if (colors) {
                            const { color1, color2, color3 } = colors;
                            if (color1 && color2 && color3) return { color1, color2, color3 };
                        }
                        const style = this.bubble.style;
                        const color1 = conversions.CSS_rgbToHex(style['background-color']),
                            color2 = conversions.CSS_rgbToHex(style['border-color']);
                        return { color1, color2, color3: color2 };
                    }
                    const { color1, color2, color3 } = getColors.call(this);
                    const widgitItems = ScratchBlocks.WidgetDiv.DIV.childNodes[0];
                    widgitItems.style.background = color1;
                    widgitItems.style.borderColor = color3;
                },
            ),
            flyout: new ContextMenu(
                {},
                /** @this {ContextMenu} */ function () {
                    const selected = ScratchBlocks.ContextMenu.currentBlock;
                    const flyoutBlocks = vm.runtime.flyoutBlocks,
                        opcode = selected.type;
                    if (!opcode) return;
                    const extensionID = opcode.split('_')[0];
                    const pinnedData = bindings_data.pinnedBlocks,
                        alreadyPinned = Object.keys(pinnedData.opcodes),
                        blockXML = flyoutBlocks.blockToXML(opcode);
                    const amIpinned = alreadyPinned.includes(opcode);
                    if (!blockXML) {
                        log('error', blockXML);
                        return;
                    }
                    this.addItem(
                        `${amIpinned ? 'un' : ''}pin block`,
                        () => {
                            if (amIpinned) {
                                delete pinnedData.opcodes[opcode];
                                pinnedData.updateXML();
                                return;
                            }
                            pinnedData.opcodes[opcode] = blockXML.replace('<block', '<block pinned="true"');
                            pinnedData.updateXML();
                        },
                        !bannedFlyoutCategorys.pin_block.includes(extensionID),
                    );
                    this.addItem(
                        'copy opcode',
                        () => {
                            navigator.clipboard.writeText(selected.type);
                        },
                        true,
                        true,
                    );
                    this.addItem('copy block id', () => {
                        navigator.clipboard.writeText(selected.id);
                    });
                },
            ),
        };

        function longVisualReportConfirm(id, confirm, report) {
            const Blockly = ScratchBlocks;
            const workspace = Blockly.getMainWorkspace();
            var block = workspace.getBlockById(id);
            if (!block) {
                throw 'Tried to report value on block that does not exist.';
            }
            Blockly.DropDownDiv.hideWithoutAnimation();
            Blockly.DropDownDiv.clearContent();
            var contentDiv = Blockly.DropDownDiv.getContentDiv();
            var valueReportBox = document.createElement('div');
            var yesNoDiv = document.createElement('div');
            var separator = document.createElement('span');
            valueReportBox.innerHTML = xmlEscape(confirm).replaceAll('\n', '<br>');
            var yes = document.createElement('span');
            var no = document.createElement('span');
            yes.textContent = 'yes';
            yes.style['text-shadow'] = '#00FF00 1px 0 10px';
            no.textContent = 'no';
            no.style['text-shadow'] = '#FF0000 1px 0 10px';
            separator.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;';
            yesNoDiv.appendChild(yes);
            yesNoDiv.appendChild(separator);
            yesNoDiv.appendChild(no);
            yes.onclick = () => {
                Blockly.DropDownDiv.hide();
                bindings.visualReport(id, report);
            }
            no.onclick = () => {
                Blockly.DropDownDiv.hide();
            }
            valueReportBox.appendChild(yesNoDiv);
            contentDiv.appendChild(valueReportBox);
            Blockly.DropDownDiv.setColour(Blockly.Colours.valueReportBackground, Blockly.Colours.valueReportBorder);
            Blockly.DropDownDiv.showPositionedByBlock(workspace, block);
        }
        

        editor.events.on('block_contextmenu', (args) => {
            ScratchBlocks.WidgetDiv.DIV.dataset.fakeItems = 0;
            if (!ScratchBlocks.WidgetDiv.isVisible()) return;
            if (!ScratchBlocks.ContextMenu.currentBlock) return;
            let add = [];
            const devtools = addToContextMenus.devtools.menu();
            const collapseBlocks = addToContextMenus.collapseBlocks.menu();
            if (devtools) add = [...add, ...devtools];
            if (collapseBlocks) add = [...add, ...collapseBlocks];
            if (add.length > 0) editor.addItemsToContextMenu(add);
        });

        editor.events.on('workspace_contextmenu', (args) => {
            ScratchBlocks.WidgetDiv.DIV.dataset.fakeItems = 0;
            if (!ScratchBlocks.WidgetDiv.isVisible()) return;
            let add = [];
            const workspaceDevtools = addToContextMenus.workspace_devtools.menu();
            if (workspaceDevtools) add = [...add, ...workspaceDevtools];
            if (add.length > 0) editor.addItemsToContextMenu(add);
        });

        /* Registering some shit that happens when this is called */
        editor.events.on('opened', () =>
            setTimeout(() => {
                updateQueries();
                const runtime = vm.runtime;
                const BlockSvg = ScratchBlocks.BlockSvg.prototype;
                const WorkspaceSvg = ScratchBlocks.WorkspaceSvg.prototype;
                const workspace = ScratchBlocks.getMainWorkspace();
                const injectionDiv = workspace.getInjectionDiv();
                bindings.showContextMenu_ = workspace.showContextMenu_.bind(workspace);
                BlockSvg.showContextMenu_old = BlockSvg.showContextMenu_;
                workspace.showContextMenu_ = function (...args) {
                    bindings.showContextMenu_(...args);
                    editor.events.emit('workspace_contextmenu');
                };
                BlockSvg.showContextMenu_ = function (...args) {
                    if (de_injected) return;
                    this.showContextMenu_old(...args);
                    editor.events.emit('block_contextmenu', [...args]);
                };
                queries.toolboxDiv.addEventListener('mousedown', (event) => {
                    if (de_injected) return;
                    if (!ScratchBlocks.utils.isRightButton(event)) return;
                    contextMenus.toolbox.show(event);
                });
                injectionDiv.addEventListener('contextmenu', (event) => {
                    if (!ScratchBlocks.ContextMenu.currentBlock?.isInFlyout) return;
                    if (ScratchBlocks.WidgetDiv.isVisible()) return;
                    event.stopPropagation();
                    contextMenus.flyout.show(event);
                });
                WorkspaceSvg.reportValue = function(id, value, inject) {
                    const Blockly = ScratchBlocks;
                    const workspace = Blockly.getMainWorkspace();
                    inject = Boolean(inject) ?? false;
                    var block = workspace.getBlockById(id);
                    if (!block) {
                        throw 'Tried to report value on block that does not exist.';
                    }
                    Blockly.DropDownDiv.hideWithoutAnimation();
                    Blockly.DropDownDiv.clearContent();
                    var contentDiv = Blockly.DropDownDiv.getContentDiv();
                    var valueReportBox = document.createElement('div');
                    valueReportBox[inject ? 'innerHTML' : 'textContent'] = value;
                    contentDiv.appendChild(valueReportBox);
                    Blockly.DropDownDiv.setColour(
                        Blockly.Colours.valueReportBackground,
                        Blockly.Colours.valueReportBorder
                    );
                    Blockly.DropDownDiv.showPositionedByBlock(workspace, block);
                };
                BlockSvg.getPlacedInput = function () {
                    if (!this.parentBlock_) return;
                    return this.parentBlock_.getInputWithBlock(this);
                };
                BlockSvg.renderAsInputType = function (failSafe) {
                    var input = this.getPlacedInput();
                    if (input) this.setOutputShape(input.type);
                    else this.setOutputShape(failSafe);
                    this.render();
                };
                const shapeMap = {
                    Boolean: ScratchBlocks.OUTPUT_SHAPE_HEXAGONAL,
                    Number: ScratchBlocks.OUTPUT_SHAPE_ROUND,
                    String: ScratchBlocks.OUTPUT_SHAPE_SQUARE
                }
                BlockSvg.renderAsInputCheck = function (failSafe, fancy) {
                    var input = this.getPlacedInput(), checks = input?.connection?.check_ ?? [], shape = failSafe;
                    const orphaned = (this.workspace && !this.getParent());
                    shape = shapeMap[checks[0]];
                    if (!fancy && shape === shapeMap.String) shape = shapeMap.Number;
                    if (!shape) shape = failSafe;
                    if (input) this.setOutputShape(shape);
                    if (!input && !orphaned) this.setOutputShape(failSafe);
                    if (!input && orphaned) this.setOutputShape(failSafe ?? shapeMap[this.outputConnection?.check_[0]]);
                    console.log(fancy, input);
                    if (fancy && input) {
                        console.log(input.shadowDom, '1');
                        // i fucking hate you, the ppl you love and all your dumbass bullshit >:(
                        this.setOutputShape(shapeMap[input.targetConnection?.check_?.[0] ?? failSafe]);
                    }
                    this.render();
                };
                ScratchBlocks.Workspace.prototype.getBlocksByType = function (type) {
                    return this.getAllBlocks().filter((block) => block.type == type);
                };
                const lrwAddon = addons.data.longreportwarning;
                if (lrwAddon.enabled && !lrwAddon.ran) {
                    lrwAddon.ran = true;
                    runtime.visualReport = function(blockId, text) {
                        if (text.length > 3000) {
                            return longVisualReportConfirm(blockId, 'This text is long and may crash your tab, causing lost progress.\nAre you sure you want to do this?\n', text);
                        }
                        return bindings.visualReport(blockId, text);
                    }
                }

                if (store.oneTime.bi) {
                    const mtAddon = addons.data.minorTweaks;
                    const avAddon = addons.data.anarchyVariables;
                    store.oneTime.bi = false;
                    avAddon.ran = true;
                    const cast = avAddon.toCast;
                    runtime.addListener('BLOCK_DRAG_UPDATE', () => {
                        workspace.getAllBlocks().forEach((block) => {
                            if (avAddon.enabled) {
                            const entry = avAddon.doFunny.find(entry => entry.opcode === block.type);
                            block.didAv = false;
                            if (!entry) return;
                            block.didAv = true;
                            block.outputConnection.check_ = ['Boolean'];
                            const myInput = block.getPlacedInput();
                            const checks = myInput?.connection?.check_ ?? [];
                            const casted = cast.filter(arr => arr[0] === block.id)?.[0];
                            if (checks.includes('Boolean')) {
                                if (!casted) cast.push([block.id, vm.editingTarget, myInput.name, entry.castTo]);
                            } else {
                                if (casted) cast.pop(cast.indexOf(casted));
                            }}
                            //if (mtAddon.enabled) block.renderAsInputCheck(ScratchBlocks.OUTPUT_SHAPE_SQUARE, true);
                        });
                    });
                    vm.on('workspaceUpdate', () => {
                        for (const toCast of cast) {
                            const blocks = toCast[1].blocks;
                            const myBlock = blocks.getBlock(toCast[0]);
                            if (!myBlock) {
                                cast.pop(cast.indexOf(toCast));
                                return;
                            }
                            const parent = blocks.getBlock(myBlock.parent);
                            const myInput = parent.inputs[toCast[2]], textId = random.blocklyId(20);
                            switch (toCast[3]) {
                                case 'boolean':
                                    const gtId = random.blocklyId(20);
                                    const gtBlock = {
                                        fields: {},
                                        next: null,
                                        shadow: false,
                                        topLevel: false,
                                        id: gtId,
                                        inputs: {
                                            OPERAND1: {
                                                name: 'OPERAND1',
                                                block: myBlock.id,
                                                shadow: null
                                            },
                                            OPERAND2: {
                                                name: 'OPERAND2',
                                                block: textId,
                                                shadow: textId
                                            }
                                        },
                                        opcode: 'operator_gt',
                                        parent: parent.id
                                    }
                                    const textBlockGT = {
                                        id: textId,
                                        opcode: 'text',
                                        inputs: {},
                                        next: null,
                                        topLevel: false,
                                        shadow: true,
                                        parent: gtId,
                                        fields: {
                                            TEXT: {
                                                name: 'TEXT',
                                                id: null,
                                                value: '0'
                                            }
                                        }
                                    }
                                    blocks.createBlock(gtBlock);
                                    blocks.createBlock(textBlockGT);
                                    myBlock.parent = gtId;
                                    myInput.block = gtId;
                                    break;
                                case 'number':
                                    const addId = random.blocklyId(20);
                                    const addBlock = {
                                        fields: {},
                                        next: null,
                                        shadow: false,
                                        topLevel: false,
                                        id: gtId,
                                        inputs: {
                                            NUM1: {
                                                name: 'NUM1',
                                                block: myBlock.id,
                                                shadow: null
                                            },
                                            NUM2: {
                                                name: 'NUM2',
                                                block: textId,
                                                shadow: textId
                                            }
                                        },
                                        opcode: 'operator_add',
                                        parent: parent.id
                                    }
                                    const textBlockADD = {
                                        id: textId,
                                        opcode: 'text',
                                        inputs: {},
                                        next: null,
                                        topLevel: false,
                                        shadow: true,
                                        parent: addId,
                                        fields: {
                                            TEXT: {
                                                name: 'TEXT',
                                                id: null,
                                                value: '0'
                                            }
                                        }
                                    }
                                    blocks.createBlock(addBlock);
                                    blocks.createBlock(textBlockADD);
                                    myBlock.parent = addId;
                                    myInput.block = addId;
                                    break;
                                case 'string':
                                    const joinId = random.blocklyId(20);
                                    const joinBlock = {
                                        fields: {},
                                        next: null,
                                        shadow: false,
                                        topLevel: false,
                                        id: gtId,
                                        inputs: {
                                            NUM1: {
                                                name: 'NUM1',
                                                block: myBlock.id,
                                                shadow: null
                                            },
                                            NUM2: {
                                                name: 'NUM2',
                                                block: textId,
                                                shadow: textId
                                            }
                                        },
                                        opcode: 'operator_join',
                                        parent: parent.id
                                    }
                                    const textBlockJOIN = {
                                        id: textId,
                                        opcode: 'text',
                                        inputs: {},
                                        next: null,
                                        topLevel: false,
                                        shadow: true,
                                        parent: joinId,
                                        fields: {
                                            TEXT: {
                                                name: 'TEXT',
                                                id: null,
                                                value: '0'
                                            }
                                        }
                                    }
                                    blocks.createBlock(joinBlock);
                                    blocks.createBlock(textBlockJOIN);
                                    myBlock.parent = joinId;
                                    myInput.block = joinId;
                                    break;
                            }
                            myInput.shadow = null;
                            blocks.resetCache();
                            cast.pop(cast.indexOf(toCast));
                        }
                    });
                }
            }, 500),
        );

        /* GUI */
        const GUIUtils = {
            findModal() {
                return document.querySelector(`[class*="${classAndIdNames.modal}"]`);
            },
            forceKillModal() {
                const preExisting = this.findModal();
                if (preExisting) preExisting.remove();
            },
            base_modal() {
                this.forceKillModal();
                const modal = document.createElement('dialog');
                modal.classList.add(classAndIdNames.modal);
                const Xbtn = this.button('', 'X', () => {
                    modal.close();
                });
                Xbtn.style.right = 0;
                Xbtn.style.top = 0;
                Xbtn.style.zIndex = 32767;
                Xbtn.style.position = 'absolute';
                Xbtn.style.marginRight = '10px';
                Xbtn.style.marginTop = '10px';
                modal.appendChild(Xbtn);
                document.body.appendChild(modal);
                return modal;
            },
            br() {
                return document.createElement('br');
            },

            /**
             * Creates a button
             * @param {String} label Label text
             * @param {String} text Button text
             * @param {Function} mousedown Callback for when the mouse is down on the button
             * @returns {HTMLElement} The button in its wrapper
             */
            button(label, text, mousedown) {
                const wrap = document.createElement('label');
                const lText = document.createElement('span');
                label = label ?? '';
                lText.textContent = label;
                wrap.appendChild(lText);
                const button = document.createElement('button');
                button.addEventListener('mouseup', (event) => {
                    mousedown(event);
                });
                button.textContent = text;
                button.classList.add(classAndIdNames.button);
                wrap.appendChild(button);
                return wrap;
            },

            /**
             * Creates a checkbox
             * @param {String} label Label text
             * @param {Boolean} after Weather or not to put the text after or before the checkbox
             * @param {Function} mousedown Callback for when the mouse clicks the checkbox
             * @param {Boolean} active Weather or not the checkbox is already active
             * @returns {HTMLElement} The checkbox in its wrapper
             */
            checkbox(label, after, mouseup, active) {
                const wrap = document.createElement('label');
                const lText = document.createElement('span');
                label = label ?? '';
                lText.textContent = label;
                if (!after) wrap.appendChild(lText);
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                wrap.addEventListener('mouseup', (event) => {
                    mouseup(event);
                });
                checkbox.classList.add(classAndIdNames.checkbox);
                wrap.appendChild(checkbox);
                if (after) wrap.appendChild(lText);
                return wrap;
            },

            /**
             * Creates a basic input
             * @param {String} label Label text
             * @param {Boolean} after Weather or not to put the text after or before the input
             * @returns {HTMLElement} The input in its wrapper
             */
            input(label, after) {
                const wrap = document.createElement('label');
                const lText = document.createElement('span');
                label = label ?? '';
                lText.textContent = label;
                if (!after) wrap.appendChild(lText);
                const input = document.createElement('input');
                wrap.appendChild(input);
                if (after) wrap.appendChild(lText);
                return wrap;
            },

            header(text) {
                const head = document.createElement('h3');
                head.textContent = text;
                return head;
            },
            subheader(text) {
                const sub = document.createElement('div');
                const content = document.createElement('span');
                content.textContent = text;
                sub.appendChild(content);
                return sub;
            },
        };

        const addons = {
            // TODO: care
            handle(addon, event) {
                const checkbox = event.target.parentElement.querySelector('input[type="checkbox"]');
                this.data[addon].enabled = !checkbox.checked;
                // log('debug', `Missing addon data: ${addon}`, event);
            },
            local: null,
            data: {
                stupid: {
                    enabled: false,
                    after: true,
                    label: ' Stupid',
                    desc: 'Very stupid'
                },
                pinnableBlocks: {
                    enabled: false,
                    after: true,
                    label: ' Pinnable Blocks (WIP)',
                    desc: 'Allows you to pin blocks'
                },
                devtools: {
                    enabled: false,
                    after: true,
                    label: ' Editor Devtools',
                    desc: 'Devtools for extension developers'
                },
                toolboxTools: {
                    enabled: false,
                    after: true,
                    label: ' Toolbox Tools',
                    desc: 'Customize the toolbox a little more and some cool tools'
                },
                rtl: {
                    enabled: false,
                    after: true,
                    label: ' RTL Workspace',
                    desc: 'Make the blocks display in reverse'
                },
                collapseableBlocks: {
                    enabled: false,
                    after: true,
                    label: ' Collapsable Blocks (WIP)',
                    desc: 'Collapse blocks to save space'
                },
                longreportwarning: {
                    enabled: false,
                    after: true,
                    ran: false,
                    label: ' Long VisualReport Warning',
                    desc: 'Warning for long text in visual report'
                },
                anarchyVariables: {
                    enabled: false,
                    after: true,
                    toCast: [],
                    ran: false,
                    label: ' Anarchy Variables',
                    desc: 'Place variables anywhere (auto casts w/ scratch support, may)',
                    doFunny: [{
                        opcode: 'data_variable',
                        castTo: 'boolean'
                    }, {
                        opcode: 'utilities_ternaryOperator',
                        castTo: 'boolean'
                    }, ]
                },
                minorTweaks: {
                    enabled: false,
                    after: true,
                    label: ' Minor shit',
                    desc: 'A bunch of minor tweaks'
                }
            },
            getLocal() {
                return JSON.parse(localStorage[`${prepend.localStorage}addons`] ?? '{"fail":true}');
            },
            saveLocal() {
                const addonNames = Object.keys(this.data), enabled = {};
                for (const addonName of addonNames) {
                    enabled[addonName] = {on: this.data[addonName].enabled};
                }
                localStorage[`${prepend.localStorage}addons`] = JSON.stringify(enabled);
            },
            loadEnabled() {
                this.local = this.getLocal();
                if (this.local?.fail) {
                    this.saveLocal();
                    this.local = this.getLocal();
                }
                const addonNames = Object.keys(this.local);
                for (const addonName of addonNames) {
                    const addon = this.local[addonName];
                    this.data[addonName].enabled = addon.on;
                }
                events.emit('addonsAccessible', addons);
            },
            fixChecked() {
                const addonNames = Object.keys(this.data);
                for (const addonName of addonNames) {
                    document.querySelector(`label[data-addon="${addonName}"] > input[type="checkbox"]`).checked = this.data[addonName].enabled;
                }
            }
        };
        addons.loadEnabled();

        var GUI = {
            mainMenu: {
                header() {
                    return GUIUtils.header('TWunlocked+');
                },
                subheader() {
                    return GUIUtils.subheader('press ESC to exit the modal :P');
                },
                buttons() {
                    const MD = new Date();
                    const wrap = document.createElement('div');
                    const ihom = MD.getMonth() === 6 && MD.getDate() === 21;
                    wrap.appendChild(
                        GUIUtils.button('', 'Open "addons"', () => {
                            GUI.addons.menu();
                        }),
                    );
                    wrap.appendChild(GUIUtils.br()); wrap.appendChild(GUIUtils.br());
                    wrap.appendChild(
                        GUIUtils.button('', 'Management', () => {
                            GUI.management.menu();
                        }),
                    );
                    wrap.appendChild(GUIUtils.br()); wrap.appendChild(GUIUtils.br());
                    wrap.appendChild(
                        GUIUtils.button('', 'Extension Stuff', () => {
                            GUI.customExtensions.menu();
                        }),
                    );
                    if (ihom) {
                        wrap.appendChild(GUIUtils.br());
                        wrap.appendChild(GUIUtils.br());
                        wrap.appendChild(
                            GUIUtils.button('', 'in honor of mako', () => {
                                const nd = window.open('about:blank', '', 'scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=650,height=500');
                                nd.onload = () => {
                                    nd.document.write(atob(`PCFET0NUWVBFIGh0bWw+PGh0bWw+PGhlYWQ+PHN0eWxlPip7YmFja2dyb3VuZDojMDAwMDAwO2NvbG9yOiNmZmZmZmY7fTwvc3R5bGU+PHRpdGxlPkluIEhvbm9yIE9mIE1ha288L3RpdGxlPjwvaGVhZD48Ym9keT4KPGlmcmFtZSB3aWR0aD0iNTYwIiBoZWlnaHQ9IjMxNSIgc3JjPSJodHRwczovL3d3dy55b3V0dWJlLW5vY29va2llLmNvbS9lbWJlZC9mNTZDYmp3d3YtRT9zaT1iQWY1Vjg5QkI0N3psMGdKJmxvb3AiIHRpdGxlPSJZb3VUdWJlIHZpZGVvIHBsYXllciIgZnJhbWVib3JkZXI9IjAiIGFsbG93PSJhY2NlbGVyb21ldGVyOyBhdXRvcGxheTsgY2xpcGJvYXJkLXdyaXRlOyBlbmNyeXB0ZWQtbWVkaWE7IGd5cm9zY29wZTsgcGljdHVyZS1pbi1waWN0dXJlOyB3ZWItc2hhcmUiIGFsbG93ZnVsbHNjcmVlbj48L2lmcmFtZT4KPGEgaHJlZj0iaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTWFrb18oYWN0b3IpIj5odHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9NYWtvXyhhY3Rvcik8L2E+CjxzY3JpcHQ+PC9zY3JpcHQ+PC9ib2R5PjwvaHRtbD4=`));
                                };
                            }),
                        );
                    }
                    return wrap;
                },
                ad() {
                    const wrap = document.createElement('div');
                    wrap.appendChild(document.createElement('hr'));
                    const lnk = document.createElement('a');
                    lnk.href = 'https://github.com/Ashimee/survs-gallery';
                    lnk.textContent = 'Submit an extension that wont get accepted here (pls)';
                    wrap.appendChild(lnk);
                    return wrap;
                },
            },
            addons: {
                header() {
                    return GUIUtils.header('Meh "Addons"');
                },
                subheader() {
                    return GUIUtils.subheader("Yeah I stole the title, what'cha gonna do about it :D");
                },
                reload() {
                    const wrap = document.createElement('div');
                    wrap.appendChild(
                        GUIUtils.button('Some addons may require a reload: ', 'RELOAD', () => {
                            document.location.reload();
                        }),
                    );
                    return wrap;
                },
                generate() {
                    const wrap = document.createElement('div');
                    for (const addonName in addons.data) {
                        const addon = addons.data[addonName];
                        const addonBox = GUIUtils.checkbox(
                            addon.label,
                            addon.after,
                            (event) => {
                                addons.handle(addonName, event);
                            },
                            addon.enabled,
                        );
                        addonBox.title = addon.desc ?? 'No description provided';
                        wrap.appendChild(addonBox);
                        wrap.appendChild(GUIUtils.br());
                        addonBox.dataset.addon = addonName;
                    }
                    return wrap;
                },
                menu() {
                    const modal = GUIUtils.base_modal();
                    modal.showModal();
                    modal.appendChild(this.header());
                    modal.appendChild(this.subheader());
                    modal.appendChild(GUIUtils.br());
                    modal.appendChild(this.generate());
                    modal.appendChild(GUIUtils.br());
                    modal.appendChild(
                        GUIUtils.button('', 'Save', () => {
                            addons.saveLocal();
                        }),
                    );
                    addons.fixChecked();
                    modal.appendChild(this.reload());
                },
            },
            customExtensions: {
                header() {
                    return GUIUtils.header('Custom Extensions');
                },
                subheader() {
                    return GUIUtils.subheader('Manage custom extension related stuff here');
                },
                menu() {
                    const modal = GUIUtils.base_modal();
                    modal.showModal();
                    modal.appendChild(this.header());
                    modal.appendChild(this.subheader());
                    modal.appendChild(GUIUtils.br());
                    modal.appendChild(this.loadFromUrl());
                    modal.appendChild(GUIUtils.br()); modal.appendChild(GUIUtils.br());
                    modal.appendChild(this.disableManager());
                    modal.appendChild(
                        GUIUtils.button('', 'Load from my gallery', () => {
                            this.mygallery_load();
                        }),
                    );
                },
                disableManager() {
                    const wrap = document.createElement('div');
                    if (!store.oneTime.hideSandboxBtn) {
                        const wrap_ = document.createElement('div');
                        wrap_.appendChild(
                            GUIUtils.button('', 'Disable sandbox', (event) => {
                                extensions.disableSandboxPermanently();
                                alert('You must reload to re-enable the sandbox');
                                wrap_.remove();
                                store.oneTime.hideSandboxBtn = true;
                                vm.securityManager.getSandboxMode = () => 'unsandboxed';
                            }),
                        )
                        wrap_.appendChild(GUIUtils.br()); wrap_.appendChild(GUIUtils.br());
                        wrap.appendChild(wrap_);
                    }
                    if (!store.oneTime.hideSecurityBtn) {
                        const wrap_ = document.createElement('div');
                        wrap_.appendChild(
                            GUIUtils.button('', 'Disable security manager', (event) => {
                                alert('You must reload to re-enable the security manager');
                                wrap_.remove();
                                store.oneTime.hideSecurityBtn = true;
                            }),
                        )
                        wrap_.appendChild(GUIUtils.br()); wrap_.appendChild(GUIUtils.br());
                        wrap.appendChild(wrap_);
                    }
                    if (wrap.childElementCount > 0) return wrap;
                    else return document.createElement('span');
                },
                loadFromUrl() {
                    const modal = GUIUtils.input('Load extension from URL: ');
                    modal.appendChild(
                        GUIUtils.button(' ', 'Load', (event) => {
                            const self = event.srcElement;
                            const input = self.parentElement.parentElement.querySelector('input');
                            extensions.loadExtensionUnsandboxed(input.value);
                            input.value = '';
                        }),
                    );
                    return modal;
                },
                mygallery_load() {
                    const modal = GUIUtils.base_modal();
                    const wrap = document.createElement('div');
                    wrap.textContent = 'vvv Iframe to load extensions dw!';
                    wrap.appendChild(GUIUtils.br());
                    this.frame = document.createElement('iframe');
                    this.frame.src = 'https://surv.is-a.dev/survs-gallery/_tests/postMessage.html?auth=';
                    wrap.appendChild(this.frame);
                    modal.appendChild(wrap);
                    modal.showModal();
                },
            },
            management: {
                header() {
                    return GUIUtils.header('Management');
                },
                subheader() {
                    return GUIUtils.subheader('Manage some random stuff here');
                },
                menu() {
                    const modal = GUIUtils.base_modal();
                    modal.showModal();
                    modal.appendChild(this.header());
                    modal.appendChild(this.subheader());
                    modal.appendChild(GUIUtils.br());
                    modal.appendChild(
                        GUIUtils.button('', 'Refresh blocks', () => {
                            vm.extensionManager.refreshBlocks();
                        }),
                    );
                    modal.appendChild(GUIUtils.br()); modal.appendChild(GUIUtils.br());
                    modal.appendChild(
                        GUIUtils.button('', 'Refresh workspace', () => {
                            vm.emitWorkspaceUpdate();
                        }),
                    );
                },
            },
            main_menu() {
                const modal = GUIUtils.base_modal();
                modal.showModal();
                const main = this.mainMenu;
                modal.appendChild(main.header());
                modal.appendChild(main.subheader());
                modal.appendChild(GUIUtils.br());
                modal.appendChild(main.buttons());
                modal.appendChild(GUIUtils.br());
                modal.appendChild(this.mainMenu.ad());
            },
            menuButtonClick(event) {
                this.main_menu();
            },
        };

        window.addEventListener('message', (event) => {
            const obj = event.data;
            if (typeof obj !== 'object') {
                console.warn('Received invalid data in POST-MESSAGE.', event);
                return;
            }
            if (!obj.postTo || obj.postTo !== 'twu') {
                console.warn('Simple trust was not granted.');
                return;
            }
            if (!obj.url) {
                alert('Extension URL was missing, wat?');
                return;
            }
            extensions.loadExtensionUnsandboxed(obj.url);
        });

        /* Button registration */
        editor.events.on(
            'close+open',
            /** Is the user in the editor?
             *  @param {Boolean} inEditor Boolean
             */ (inEditor) => {
                setTimeout(() => {
                    updateQueries();
                    if (editor.menuButton) editor.menuButton.remove();
                    const menuButton = new MenuBarButton('TWUnlocked');
                    editor.menuButton = menuButton;
                    menuButton.node.addEventListener('mousedown', () => {
                        GUI.menuButtonClick();
                    });
                    menuButton.show();
                    menuButton.id = classAndIdNames.menuButton;
                }, 500);
            },
        );
        editor.events.emit('close+open');
        if (inEditor()) editor.events.emit('opened');

        let gbxIdx = 0;
        editor.events.on('gotBlocksXML', () => {
            if (gbxIdx === 1) {
                gbxIdx--;
                return;
            }
            gbxIdx++;
            updateQueries();
            const hiddenLabels = store.bubbleAddon.hiddenLabels(),
                hiddenBubbles = store.bubbleAddon.hiddenBubbles();
            setTimeout(() => {
                if (store.miniToolbox.wasMinimized) store.miniToolbox.hide();
                const extensionIDs = store.bubbleAddon.getAllExtensionIdsInOrder();
                for (let i = 0; i < extensionIDs.length; i++) {
                    const extensionID = extensionIDs[i];
                    const hideBubble = hiddenBubbles.includes(extensionID),
                        hideLabel = hiddenLabels.includes(extensionID);
                    const categoryRow = store.bubbleAddon.getToolboxCategory(extensionID);
                    const bubble = categoryRow.querySelector('[class=scratchCategoryItemBubble]') ?? categoryRow.querySelector('[class=scratchCategoryItemIcon]');
                    const label = categoryRow.querySelector('[class=scratchCategoryMenuItemLabel]');
                    if (hideBubble) bubble.hidden = hideBubble;
                    if (hideLabel) label.hidden = hideLabel;
                }
                if (store.lilyEgg()) {
                    const controlAfter = getRuleWithSelector('.scratchCategoryId-control .scratchCategoryItemBubble::after').style;
                    controlAfter.backgroundImage = 'url(data:image/webp;base64,UklGRpwGAABXRUJQVlA4IJAGAAAQHACdASpQAFAAPm0ukkYkIqGhL1VacIANiWYBBgGJ0oUIOTRZf8Bu5J14W+2y8wHnYekn/Cb6BvNX99sFj8z4X+Yr1rJxJa38drzd7wAbrmmD0AP0Z6LWgR6j9gz9dOtZ6NzWZMzzfkeR8mePC+Om4PQdSDa9T+3aXQimSxXhlPxGQ/mWgkZkFEmwSf8J8aDcHhMk9DUJjzBPCtE1ShqlEQSxmHUgTImFKwiseBz841u/Esb7cGU+4Yn69I32dBJ4V1ICvc5tgg/OjsegmpBeZ04kLbuu0nXxDUJ7cdEXO+44LjkK86iCIAD+/FxCJk7eutDP7hzcnJ41KCTbri/9GdWeK1I4JluUE5CI45c03KgNArYE2NsHxT+vOjeJoHA+3APR7hQzXTeNq0r0RTR8080wP6sxCQPZFyKd2Hd6E+dixoHHjtMdoEmNUvmXu4zb84TUfSCG643c9sKVTORFb9tnE+tqhlR7P57jJB/O5otDw13C6pBbwn4VKHOYY2FUQOmwq0x78Y274AQiNxcn4BWF8FJriK4wzzlDTWaEZM/KRC73fHkdAEm1/A0gUuKIWchD/JbIREV6RljAEXCh0qnbOcrJ7riNXVcmHWST2w9XRGiwnwaWLr/UOUBudS0UB/b71cxDwTbAKhiryma7VoXX3va8uLDwH7WvgoMNW36z7VUJ9if5wtCWRPcwux+4z/3+3DYXtUV8kZB2M+4xcfizkVEKR//TseibyikaKeNGDJr3EBIb8hqeZbOgbpAb+If46Oc/GlNTdI0DGmxitmDbk8/rcCyLosy1EyhVp45hIE3eOxXI0SXIBbe3VHF+8uzJtQ+3FgGwwQccFcVXDfgO9YvHu3oslwv8Wd9MSaxsqidYMtI+b9ztOpnR94WaJWEFTlX9hhzEwRn5AHOdGnxpLIMlVte+t05i3BhDkdqSU1R/cIhnrFOwP/9UvUOWbyBtlqeVdw1QvRlwUPEKqwfwAKjInZ5yIA8hUa4DDK8J54PXExWy8zmhPKV8sxrLXaS2fY74XiiIfUUk3c3pFEwsfqRUQz7mUY4WveLhaGPjAO8hb5/MysGTBBRBd99cy+RHC4q949wtbbtoC9T+xvSF9lc/0/yDq1SpawFWsdEGbuysPl2y7hWI4Hs9nxhtNo0Vu4W1kLI/vr92fqxZfuEnIA8qfMLG+yKdKSVa6533oogGtfi9sxz7ciFBx0SlVss/VKWDnSKlf42nYWCOxjayVGYYiGCEvTGQNQS91VrouHvr2MIE5TOU1AgLGYoQ/tPjrKMJPGV0HlPa8HJ3HtyuZHHFUfJaHtx2CHVtWiHXl9mOWrbfleQ+VbQwq1cjyBgqwxRI5K1lB0InrcuUKhuzqyWDFY5uS5YHuXH0NFsmfBk9Aaou4rfHBylM1BmU/xNjn4b6aOdxEnHV4D5x3vZOxVGfcW809bET3mr15HhNX/t958emH0nCIi8mVPK/jTBwF/LPd+x3keKBYz7OKdY9c6h4jjKi/jmY3uZjPtAwn58IdxJA6/scUTHkP8bC+tCfqn1M3lrE2TL9O2ogvkXxki8tmgyBC4qq3A5YucyugZwCIwSydirUS5ofHH71BlP+euad86E4OM9SmKUnlORHKbsPj4BJlPhrZ9mJkkL1uiXiGVzb7KZfM+SILf+WPbcplkvkjzbV2J79P5PU5HgJ83VEWheEDBtPV/x8Co49YNLb8ckp0N1e+EKDUHt3/V42w5Lfqcfl/9ticrtjM6bTFvNxh73+lsnvKBd0jB4+jupe+b58Dpc7bVjr64zTsmC7OZe9Huj5/QsVswI8e/h/jTq/2GFu5/yA9qSoa+zQEk3NYMpFsWdf0bTZfbn/J9SlZsrhR5wGyx0q8tXzHnnOwKaxnHyE8PuNrEJYgqPAqPCqf7R3xuYk9Lmh5/XE6k7k+9zUOm2rkIeVe10JxsdjhCh1b+UmDJvROgO8MoeFjhIsu5L/K51eRthfTbUDwCR3CoeBRVBbbJfurFnHAV6MgQbIfl3FbBQA9lL4dItoFtvMSLGsBJYoQV0vwK6hRrDuRp0IP2kTZPjvhPd/RdxGJsI56GlPourm4/ZQO3/JXmKOqMHJ1R48f6yij/djt17fWsrDt5JcjWdbvx4bsSMYdyp+GQTPQd1jjV2tEvjAZZP/yN6UsivkX2VkYJ6/ejR/9kPcTjBlpi/IyaWAqU7mmjKklxT9xOalXnKji3LPzH2/xkIIeHkunNIAAAA=)';
                    controlAfter.borderRadius = '100%';
                    controlAfter.backgroundSize = 'cover';
                    document.querySelector('.scratchCategoryId-control .scratchCategoryItemBubble').style = 'background-color: rgb(30, 20, 51); border-color: rgb(153, 102, 255);';
                }
            }, 50);
        });

        /**
         * Setup of getBlocksXML override
         */
        vm.runtime.getBlocksXML = function (...args) {
            const categories = bindings.getBlocksXML(...args);
            for (let i = 0; i < categories.length; i++) {
                const category = categories[i];
                switch(category.id) {
                    case 'data':
                        category.xml += bindings_data.pinnedBlocks.xml;
                        break;
                    case 'pen':
                        if (!addons.data.minorTweaks.enabled) break;
                        // https://github.com/TurboWarp/scratch-vm/pull/189
                        category.xml = category.xml.replace('<block', `${(vm.editingTarget.isStage ? 
                            '<label text=\'Stage selected: less pen blocks\'></label>' : ''
                        )}<block`);
                        break;
                    default:
                        break;
                }
            }
            setTimeout(() => {
                editor.events.emit('gotBlocksXML', categories);
            }, 0);
            return categories;
        };

        /* Modal related stuff for custom images and alike */
        editor.events.on(
            'modal_opened',
            /**
             * @param {HTMLElement} header The header element of the modal
             */ (header) => {
                const headerTitle = header.textContent;
                const modalType = headerTitle.replace(/(Choose a(n{0,}) )/gi, '').toLowerCase();
                switch (modalType) {
                    case 'sprite':
                        break;
                    case 'costume':
                        break;
                    case 'extension':
                        break;
                    case 'Load Custom Extension':
                        break;
                    case 'Advanced Settings':
                        break;
                    default:
                        log('debug', `Unknown modal opened: ${headerTitle}`);
                        return;
                }
            },
        );

        editor.events.on('handle_child_mutation', (mutation) => {
            if (mutation.addedNodes.length < 1) return;
            if (!mutation.addedNodes[0].classList.contains('ReactModalPortal')) return;
            const modalHeader = document.querySelector('[class^=modal_header-item]');
            editor.events.emit('modal_opened', modalHeader);
        });

        const myObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                editor.events.emit('handle_child_mutation', mutation);
            });
        });
        myObserver.observe(document.body, {
            childList: true,
        });

        extensions.toLoad.forEach(extUrl => extensions.loadExtensionUnsandboxed(extUrl));

        /**
         * Un-injects TWunlocked
         */
        function un_inject() {
            de_injected = true;
            window.TWunlocked = {};
            removeElement(GUIUtils.findModal());
            editor.menuButton.remove();
            editor.events.wipe();
            events.wipe();
            myObserver.disconnect();
            vm.runtime.getBlocksXML = bindings.getBlocksXML;
            if (window?.ScratchBlocks) {
                const BlockSvg = ScratchBlocks.BlockSvg.prototype;
                const workspace = ScratchBlocks.getMainWorkspace();
                if (hasOwn(bindings, 'showContextMenu_')) workspace.showContextMenu_ = bindings.showContextMenu_;
                if (hasOwn(BlockSvg, 'showContextMenu_old')) BlockSvg.showContextMenu_ = BlockSvg.showContextMenu_old;
            }
        }

        /**
         * Anelytics
         */
        const anelytics = {
            trace: (await fetch('https://turbowarp.org/cdn-cgi/trace')).text(),
            username: vm.runtime.ioDevices.userData._username,
        };

        try {
            if (!collectData) throw new Error();
            const tmp = window.onerror ?? undefined;
            window.onerror = () => {
                window.onerror = tmp;
                return !0;
            };
            const r = await fetch(`https://corsproxy.io/?https://twulytics.000webhostapp.com/%3Falyc%3D${encodeURIComponent(btoa(JSON.stringify(anelytics)))}`, 'GET');
            throw new Error();
        } catch {}

        /**
         * Exports so anyone can use this stuff
         * (TODO: Sort this bitch)
         */
        const TWunlocked = {
            VERSION,
            constants: {
                vm,
                prepend,
                onDesktopApp,
                blocklyIdSoup,
                whatsOnYourMindCategory,
                bannedFlyoutCategorys,
                CORE_EXTENSIONS
            },
            utilities: {
                random,
                cookies,
                idGen,
                log,
                fetch,
                conversions,
                extensions,
            },
            checks: {
                assumeTurbowarp,
                hasOwn,
            },
            networking: {
                domainChecks,
                pages,
                // anelytics,
            },
            GUI: {
                contextMenus,
                full: GUI,
                addons,
                addToContextMenus,
                utils: GUIUtils,
            },
            nodeWork: {
                removeElement,
                styles,
            },
            query: {
                getAllPossibleNulls,
                queries,
                updateQueries,
                bindings,
                bindings_data,
            },
            classes: {
                EventEmitter,
                ContextMenu,
                MenuBarButton,
            },
            events: {
                events,
                myObserver,
                un_inject,
            },
            wip: {
                sprites,
            },
            editor,
        };
        log('log', '-----------------------------------');
        log('log', `　     TWUnlocked v${VERSION}       |`);
        log('log', '　  Thanks for using TWunlocked <3 |');
        log('log', '　            -Ashime              |');
        log('log', '-----------------------------------');
        return TWunlocked;
    };
    if (window?.TWunlocked?.events?.un_inject) TWunlocked.events.un_inject();
    window./** @type {twuInject(vm)} */ TWunlocked = await twuInject(window?.vm);
})();

// Made with love 💖, -Ashime