window.isPackaged = window.hasOwnProperty('scaffolding');
(function(vm) {

    if (window.hasOwnProperty('ML3')) {
        alert('Alr Injected.');
        return false
    };
    window.ML3 = {};

    let isPackaged = window.hasOwnProperty('scaffolding');

    function cloneConsole() {
        let newConsole = {};
        let functions = Object.keys(window.console);
        for (let i = 0; i < functions.length; i++) {
            let func = functions[i];
            let consoleFunc = console[func];
            if (typeof consoleFunc == 'function') consoleFunc = consoleFunc.bind(console);
            newConsole[func] = consoleFunc;
        }
        return newConsole;
    }

    const consoleProxyHandler = {
        get(target, prop, receiver) {
            consoleLogs.push({
                msg: 'New request to console.',
                attr: prop,
                reflect: Reflect.get(...arguments),
                receiver
            });
            return function() {};
        }
    }

    let console, console_;
    if (window.hasOwnProperty('clonedConsole')) {
        console,
        console_ = window.clonedConsole;
    }
    else {
        console,
        console_ = window.console;
    }
    window.clonedConsole = console;
    window.consoleLogs = [];
    window.console = new Proxy(window.console, consoleProxyHandler);

    console_.log('Console Overode to clean console.');

    const target = vm.runtime.targets[1];
    const Stage = vm.runtime.getTargetForStage();
    const overlayID = (isPackaged ? 'scratch-render-overlays' : 'stage_custom-overlays')
    const overlays = document.querySelector(`div[class^=${overlayID}]`);
    let greenflag = getBlocksByOpcode('event_whenflagclicked');
    vm.extensionManager.securityManager.getSandboxMode = function() {
        return 'unsandboxed'
    };

    console_.log('Variables created.')

    function loadExtension(url) {
        vm.extensionManager.loadExtensionURL(url);
    }

    function getBlockByID(id) {
        return (target.blocks._blocks[id]);
    }

    function getBlocksByOpcode(opcode) {
        let blocks = Object.values(target.blocks._blocks);
        let myBlocks = [];
        for (let i = 0; i < blocks.length; i++) {
            let block = blocks[i];
            if (block.opcode == opcode) myBlocks.push(block);
        }
        return myBlocks;
    }

    function setBlockByID(id, JSON) {
        target.blocks._blocks[id] = JSON;
    }

    function setExtensionKeysURL(newURL) {
        getBlockByID(getBlocksByOpcode('fetch_get')[0].inputs.URL.block).fields.TEXT.value = newURL;
    }

    function getListByName(name) {
        return Stage.lookupVariableByNameAndType(name, 'list') || target.lookupVariableByNameAndType(name, 'list');
    }

    let currentListObj = {};

    function loadList(name) {
        currentListObj = getListByName(name);
    }

    function setListItem(item, data) {
        item -= 1;
        currentListObj.value[item] = data;
    }

    function isGlobalVariable(name) {
        return (Stage.lookupVariableByNameAndType(name) !== null)
    }

    function getVariableByName(name) {
        return Stage.lookupVariableByNameAndType(name) || target.lookupVariableByNameAndType(name);
    }

    function setVariableByName(name, value) {
        const variable = getVariableByName(name);
        if (isGlobalVariable(name)) {
            vm.setVariableValue(Stage.id, variable, value);
        } else {
            vm.setVariableValue(target.id, variable, value);
        }
    }

    function isArray(obj) {
        return (typeof obj === 'object' && obj.hasOwnProperty('length'))
    };

    console_.log('Utilitie Functions loaded.');

    function ExecuteMod(MOD) {
        if (typeof MOD != 'object') throw new Error('The mod must be an object.');
        if (!MOD.hasOwnProperty('name')) throw new Error('Mods must have a name.');
        if (!MOD.hasOwnProperty('mod')) throw new Error('Mods must have a mod property.');
        if (MOD.hasOwnProperty('extensions')) {
            let extensions = MOD.extensions;
            if (!isArray(extensions)) throw new Error('Extensions property must be an array.');
            for (let i = 0; i < extensions.length; i++) {
                let extension = extensions[i];
                console_.log('Loading extension: ' + extension);
                loadExtension(extension);
            }
        }
        let MOD_name = MOD.name;
        ML3.latestMod = MOD;
        if (typeof MOD.mod != 'object') throw new Error('The mod property must be an object.');
        MOD = MOD.mod;
        let MOD_attrs = Object.keys(MOD);
        for (let i = 0; i < MOD_attrs.length; i++) {
            loadList('Additional Texts');
            let attrId = MOD_attrs[i];
            let attrObj = MOD[attrId];
            switch (attrId) {
                case 'start data':
                    if (typeof attrObj != 'object') throw new Error('The start data property must be an object.');
                    if (attrObj.hasOwnProperty('tag')) setVariableByName('Current Tag', attrObj.tag);
                    if (attrObj.hasOwnProperty('download type')) {
                        let dlType = attrObj['download type'];
                        switch (dlType) {
                            case 'download':
                                setVariableByName('File Type', 'Copied to Clipboard');
                                break;
                            case 'copy':
                                setVariableByName('File Type', 'Downloaded');
                                break;
                        }
                    }
                    break;
                case 'avatar data':
                    if (typeof attrObj != 'object') throw new Error('The avatar data property must be an object.');
                    setListItem(10, JSON.stringify(attrObj));
                    break;
                case 'svgs':
                    if (typeof attrObj != 'object') throw new Error('The svgs property must be an object.');
                    if (attrObj.hasOwnProperty('pin')) setListItem(12, attrObj.pin);
                    break;
                case 'extension data':
                    if (typeof attrObj != 'object') throw new Error('The extension data property must be an object.');
                    if (attrObj.hasOwnProperty('source images')) setListItem(6, attrObj['source images']);
                    if (attrObj.hasOwnProperty('pin order')) setListItem(8, JSON.stringify(attrObj['pin order']));
                    if (attrObj.hasOwnProperty('currently pinned')) {
                        loadList('Pinned Exts');
                        let currentlyPinnedArr = attrObj['currently pinned'];
                        if (!isArray(currentlyPinnedArr)) throw new Error('The currently pinned property must be an array.');
                        currentListObj.value = currentlyPinnedArr;
                    }
                    if (attrObj.hasOwnProperty('credits')) {
                        loadList('Extension Credits');
                        let creditsArr = attrObj.credits;
                        if (!isArray(creditsArr)) throw new Error('The credits property must be an array.');
                        currentListObj.value = creditsArr;
                    }
                    if (attrObj.hasOwnProperty('tags')) {
                        loadList('Ext Tags');
                        let tagsArr = attrObj.tags;
                        if (!isArray(tagsArr)) throw new Error('The tags property must be an array.');
                        currentListObj.value = tagsArr;
                    }
                    break;
                case 'urls':
                    if (typeof attrObj != 'object') throw new Error('The urls property must be an object.');
                    if (attrObj.hasOwnProperty('user')) setListItem(2, attrObj.user);
                    if (attrObj.hasOwnProperty('main gallery')) setListItem(1, attrObj['main gallery']);
                    if (attrObj.hasOwnProperty('alternate gallery')) setListItem(12, attrObj['alternate gallery']);
                    if (attrObj.hasOwnProperty('extension thumbnails')) setListItem(5, attrObj['extension thumbnails'].replace('%THUMB_NAME%', 'NAME'));
                    break;
                case 'text':
                    let oldAttrObj = structuredClone(attrObj);
                    if (typeof attrObj != 'object') throw new Error('The text property must be an object.');
                    if (oldAttrObj.hasOwnProperty('transition')) {
                        if (typeof oldAttrObj.transition != 'object') throw new Error('The transition property must be an object.');
                        attrObj = oldAttrObj.transition;
                        if (attrObj.hasOwnProperty('autoloaded')) setListItem(17, attrObj.autoloaded);
                        if (attrObj.hasOwnProperty('to gallery')) setListItem(15, attrObj['to gallery']);
                        if (attrObj.hasOwnProperty('to contributors')) setListItem(16, attrObj['to contributors']);
                        if (attrObj.hasOwnProperty('copy fail')) setListItem(18, attrObj['copy fail']);
                        if (attrObj.hasOwnProperty('copied')) setListItem(19, attrObj.copied);
                    }
                    if (oldAttrObj.hasOwnProperty('gallery text')) {
                        if (typeof oldAttrObj['gallery text'] != 'object') throw new Error('The gallery text property must be an object.');
                        attrObj = oldAttrObj['gallery text'];
                        if (attrObj.hasOwnProperty('title')) setListItem(3, attrObj.title);
                        if (attrObj.hasOwnProperty('description')) setListItem(4, attrObj.description);
                    }
                    break;
                default:
                    console_.error('Unknown top level property: ' + attrId);
                    break;
            }
        }
        alert('Loaded Mod: ' + MOD_name);
    }

    ML3.ExecuteMod = ExecuteMod;

    console_.log('Mod handler loaded.');

    let modModal = document.querySelector('dialog#modModal') || document.createElement('dialog');
    let modJsonInID = 'modModal_modJSONinput';
    modModal.id = 'modModal';
    modModal.innerHTML = ``;

    function modModalCloseHandler() {
        modModal.close();
    }

    function modModalLoadModHandler() {
        try {
            ML3.ExecuteMod(JSON.parse(atob(document.querySelector(`input#${modJsonInID}`).value)))
        } catch (err) {
            console_.error(err);
            alert('Mod has errored: ' + err)
        };
    }

    let modModalText = document.createElement('span');
    const defaultMod = (`eyJleHRlbnNpb25zIjpbXSwibmFtZSI6ImRlZmF1bHQgbW9kIiwibW9kIjp7InN0YXJ0IGRhdGEiOnsidGFnIjoiQWxsIiwiZG93bmxvYWQgdHlwZSI6ImRvd25sb2FkIn0sImF2YXRhciBkYXRhIjp7IjAiOnsibmFtZSI6IlNoYXJrUG9vbC1TUCIsInVybCI6Imh0dHBzOi8vYXZhdGFycy5naXRodWJ1c2VyY29udGVudC5jb20vdS8xMzkwOTczNzg/cz0zMDAmdj00In0sIjEiOnsibmFtZSI6IlN1cnZFeGUxUGMiLCJ1cmwiOiJodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTM1MDMwOTQ0P3M9MzAwJnY9NCJ9LCIyIjp7Im5hbWUiOiJNYXJ0aW5lbHBsYXl6IiwidXJsIjoiaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzU3NzY0MzkzP3M9MzAwJnY9NCJ9LCIzIjp7Im5hbWUiOiJJb25NYWtlc0dhcmJhZ2UiLCJ1cmwiOiJodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTM4NjIzMzgzP3M9MzAwJnY9NCJ9LCI0Ijp7Im5hbWUiOiJLb2pvQmFpbGV5IiwidXJsIjoiaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzUwNTA5NDIwP3M9MzAwJnY9NCJ9LCJmYWxsYmFjayI6Imh0dHBzOi8vY29yc3Byb3h5LmlvP2h0dHBzOi8vYXZhdGFycy5naXRodWJ1c2VyY29udGVudC5jb20vdS85OTE5P3M9MzAwJnY9NCJ9LCJzdmdzIjp7InBpbiI6IjxzdmcgdmVyc2lvbj1cIjEuMVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB4bWxuczp4bGluaz1cImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIiB3aWR0aD1cIjU3Ljc5MjY0XCIgaGVpZ2h0PVwiNTUuNDM3MzRcIiB2aWV3Qm94PVwiMCwwLDU3Ljc5MjY0LDU1LjQzNzM0XCI+PGcgdHJhbnNmb3JtPVwidHJhbnNsYXRlKC0yOTUuMzgwOTUsLTE3Mi44Nzc2MilcIj48ZyBkYXRhLXBhcGVyLWRhdGE9XCJ7JnF1b3Q7aXNQYWludGluZ0xheWVyJnF1b3Q7OnRydWV9XCIgZmlsbC1ydWxlPVwibm9uemVyb1wiIHN0cm9rZS1saW5lY2FwPVwiYnV0dFwiIHN0cm9rZS1saW5lam9pbj1cIm1pdGVyXCIgc3Ryb2tlLW1pdGVybGltaXQ9XCIxMFwiIHN0cm9rZS1kYXNoYXJyYXk9XCJcIiBzdHJva2UtZGFzaG9mZnNldD1cIjBcIiBzdHlsZT1cIm1peC1ibGVuZC1tb2RlOiBub3JtYWxcIj48cGF0aCBkPVwiTTMzNy40Njk0LDIwMi45NzIyNGMwLjk4NjYxLDIuNzc2MTQgMS4zOTA3OCw1LjU0Nzc5IDEuMTcxMTEsOC4wNzQzOGMtMC4xNzg2NywyLjA1NDIyIC0wLjc2NzExLDMuOTI0MiAtMS43MjY5LDUuNTIzMDJjLTAuNDY4LDAuNzc5NiAtNC45NjU0NSwxLjI4MTMzIC02LjQ0MzIxLC0wLjE5NjM0Yy0yLjQ0NjEsLTIuNDQ1OTUgLTkuNzQyNTgsLTkuNzQxOTggLTkuNzQyNTgsLTkuNzQxOThjMCwwIC0xNC43NjE3LDE0Ljc2MTc5IC0xNy45MDc3MSwxNy45MDc4MmMtMS4xMjU2NiwxLjEyNTY3IC0zLjA2Mjk4LDEuNTIyMzMgLTMuNDYxMTgsMS4xMjQxNGMtMC40MTYzNiwtMC40MTYzNiAtMC4zMDMwOSwtMi4yNTIwOCAwLjY3OTksLTMuMjM1MDhjMy4wMDA4NywtMy4wMDA4NyAxOC4yNDI4NywtMTguMjQyODcgMTguMjQyODcsLTE4LjI0Mjg3YzAsMCAtOS4yNDE0NSwtOS4yNDA4OCAtMTEuNDMzMzIsLTExLjQzMjYyYy0wLjg4NDcyLC0wLjg4NDY3IDAuOTk5MzMsLTQuNTA3MjMgMS45NTkxLC01LjAyNTljMS44NDc0MSwtMC45OTgzNyA0LjAyMDAxLC0xLjUxNTk3IDYuNDIxNjgsLTEuNTE1OTdjMi4xNjMxNCwwIDQuNDE2MzQsMC40MTMyOCA2LjcxMTc0LDEuMjI5OTFjMCwwIDkuOTcxMzQsLTguOTM3OTcgMTMuMTMxNiwtMTEuNzcwNzNjMS43ODUzMSwtMS42MDAyOSA1Ljc0NDk0LC0yLjIwMTYyIDcuNjQ5MjcsLTAuMjk2MzljMi42MDc5NSwyLjYwOTE4IDUuODcyNjYsNS44NzU0MyA2LjcwMTgyLDYuNzA0OTdjMS40OTQ1LDEuNDk1MiAxLjYxMjY2LDUuNzU3IDAuMTEwMzMsNy40MzMxN2MtMi44MDUxNywzLjEyOTc1IC0xMi4wNjQ1MiwxMy40NjA0NyAtMTIuMDY0NTIsMTMuNDYwNDd6XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCIjZmZmZmZmXCIgc3Ryb2tlLXdpZHRoPVwiNy41XCIvPjxwYXRoIGQ9XCJNMzM3LjQ2OTQsMjAyLjk3MjI0YzAuOTg2NjEsMi43NzYxNCAxLjM5MDc4LDUuNTQ3NzkgMS4xNzExMSw4LjA3NDM4Yy0wLjE3MTY3LDEuOTczNzkgLTAuNzIxNjcsMy43Nzc0NyAtMS42MTU4Nyw1LjMzMzk3Yy0wLjQ5MDIzLDAuODUzMzIgLTQuOTY2NzQsMS41ODAxMiAtNi4zOTQ2MywwLjE1MjMyYy0yLjQzODE4LC0yLjQzODAzIC05LjkwMjE5LC05LjkwMTU4IC05LjkwMjE5LC05LjkwMTU4YzAsMCAtMTQuNzYxNywxNC43NjE3OSAtMTcuOTA3NzEsMTcuOTA3ODJjLTEuMTI1NjYsMS4xMjU2NyAtMy4wNjI5OCwxLjUyMjMzIC0zLjQ2MTE4LDEuMTI0MTRjLTAuNDE2MzYsLTAuNDE2MzYgLTAuMTEwNTksLTIuNDQ0NTggMS4wMTUwNywtMy41NzAyNGMzLjE0NjAxLC0zLjE0NjAxIDE3LjkwNzcsLTE3LjkwNzcgMTcuOTA3NywtMTcuOTA3N2MwLDAgLTkuMjQxNDUsLTkuMjQwODggLTExLjQzMzMyLC0xMS40MzI2MmMtMC44ODQ3MiwtMC44ODQ2NyAxLjM4MDEyLC00Ljc4MTExIDIuNTkyMTIsLTUuMzQzMzFjMS43MDQwNywtMC43OTA0NSAzLjY1NjA1LC0xLjE5ODU2IDUuNzg4NjUsLTEuMTk4NTZjMi4xNjMxNCwwIDQuNDE2MzQsMC40MTMyOCA2LjcxMTc0LDEuMjI5OTFjMCwwIDkuODM4NTMsLTguODE4OTMgMTMuMDA3NywtMTEuNjU5NjdjMS44MjUyNCwtMS42MzYwOCA2LjA4ODM3LC0yLjA5MzA2IDcuNDM4MjIsLTAuNzQyNTdjMS40Mjk3NiwxLjQzMDQzIDQuNzIwMjMsNC43MjI0NSA3LjI2MDEyLDcuMjYzNTNjMS44NzkxLDEuODc5OTkgMS40MzI3OCw1LjMxMzMzIC0wLjI2MzM2LDcuMjA1NzJjLTIuODUxMzgsMy4xODEzMSAtMTEuOTE0MTgsMTMuNDY0NDcgLTExLjkxNDE4LDEzLjQ2NDQ3ek0zMzYuMTc4OSwxNzkuMzIzOTNjLTEuNzQ1NzUsMS41NjQ4NSAtNi40MDExMSw1LjczNzggLTkuMTc4NDgsOC4yMjczN2MtMS4yOTAwMSwxLjE1NjMzIC0xLjI2OTUyLDIuODU1MTIgLTAuMDQxNDEsNC4wODM1OWMyLjAwNjk3LDIuMDA3NTcgNC44NzU4OSw0Ljg3NzMzIDYuMDY0MDYsNi4wNjU4NWMxLjAzMzMzLDEuMDMzNjQgMy4wNDcxOCwxLjY0OTYxIDQuMDQxMSwwLjU0MDY5YzIuNDIzMTYsLTIuNzAzNTQgNi44MjU3NiwtNy42MTU1MyA4LjQ1NjcxLC05LjQzNTE5YzEuMTkxMDgsLTEuMzI4ODkgMS41NDA2OCwtNC4xOTczNiAwLjExMDA2LC01LjYyODY2Yy0xLjcyNDI4LC0xLjcyNTA5IC0zLjgyNTQ2LC0zLjgyNzI2IC00LjcwNzI1LC00LjcwOTQ2Yy0wLjc5ODY2LC0wLjc5OTA0IC0zLjQ0MDc1LC0wLjMxMzA5IC00Ljc0NDc4LDAuODU1ODF6TTMzNC4wMDEzOCwyMDMuNTcyMjFsLTEyLjY1OTA2LC0xMi42NjI3NmMtMi4wOTY3MiwtMC44MTA5OSAtNC4yMDM1OSwtMS4yMzkzOCAtNi4xMTMxNiwtMS4yMzkzOGMtMS4wMTI2LDAgLTEuOTY0MjksMC4xMTc4IC0yLjg0MjE5LDAuMzQ4NmMtMC44NjY0MywwLjIyNzc5IC0xLjY3ODUyLDEuNzAxNyAtMC41Mzg3LDIuODQxNDZjNC42MzEzMyw0LjYzMTA5IDE2LjY0MzMxLDE2LjY0MjQzIDE5LjU1MTkyLDE5LjU1MDg4YzEuMjM1NTgsMS4yMzU1MiAzLjIxODMsMS4wOTYxMiAzLjQ0NDUyLDAuMzExMTdjMC43NDMxOCwtMi41Nzg4IDAuNDczMTgsLTUuNzY2NyAtMC44NDMzMywtOS4xNDk5OHpcIiBmaWxsPVwiIzAwMDAwMFwiIHN0cm9rZT1cIiMwMDAwMDBcIiBzdHJva2Utd2lkdGg9XCIxLjVcIi8+PHBhdGggZD1cIk0zNDAuOTQ3MTUsMTc4LjQxNzQzYzAuODgxNzksMC44ODIyIDMuMDA4MTMsMy4wMDc1NyA0LjczMjQxLDQuNzMyNjZjMS40MzA2MywxLjQzMTMgMS4wODgyMSw0LjMyOTQgLTAuMTAyODYsNS42NTgyOWMtMS42MzA5NSwxLjgxOTY2IC02LjA4NTAyLDYuNzg1MiAtOC41MDgxOSw5LjQ4ODc0Yy0wLjk5MzkyLDEuMTA4OTIgLTMuMDMwNzcsMC40ODk5MSAtNC4wNjQxLC0wLjU0MzczYy0xLjE4ODE3LC0xLjE4ODUyIC00LjA5MTMsLTQuMDkyOTIgLTYuMDk4MjgsLTYuMTAwNDljLTEuMjI4MTEsLTEuMjI4NDcgLTEuMjUxMzIsLTIuOTUwNjYgMC4wMzg2OSwtNC4xMDY5OWMyLjc3NzM3LC0yLjQ4OTU3IDcuNDg3NTgsLTYuNzEyOTkgOS4yMzMzMywtOC4yNzc4NGMxLjMwNDAzLC0xLjE2ODkgMy45NzAzMywtMS42NDk2OCA0Ljc2OSwtMC44NTA2NXpcIiBkYXRhLXBhcGVyLWRhdGE9XCJ7JnF1b3Q7bm9Ib3ZlciZxdW90OzpmYWxzZSwmcXVvdDtvcmlnSXRlbSZxdW90OzpbJnF1b3Q7UGF0aCZxdW90Oyx7JnF1b3Q7YXBwbHlNYXRyaXgmcXVvdDs6dHJ1ZSwmcXVvdDtzZWdtZW50cyZxdW90OzpbW1szMzYuMTc4OSwxNzkuMzIzOTJdLFsxLjMwNDAzLC0xLjE2ODldLFstMS43NDU3NSwxLjU2NDg1XV0sW1szMjcuMDAwNDIsMTg3LjU1MTI5XSxbMi43NzczNywtMi40ODk1N10sWy0xLjI5MDAxLDEuMTU2MzNdXSxbWzMyNi45NTkwMSwxOTEuNjM0ODddLFstMS4yMjgxMSwtMS4yMjg0N10sWzIuMDA2OTcsMi4wMDc1N11dLFtbMzMzLjAyMzA3LDE5Ny43MDA3Ml0sWy0xLjE4ODE3LC0xLjE4ODUyXSxbMS4wMzMzMywxLjAzMzY0XV0sW1szMzcuMDY0MTcsMTk4LjI0MTQxXSxbLTAuOTkzOTIsMS4xMDg5Ml0sWzIuNDIzMTYsLTIuNzAzNTRdXSxbWzM0NS41MjA4NywxODguODA2MjJdLFstMS42MzA5NSwxLjgxOTY2XSxbMS4xOTEwOCwtMS4zMjg4OV1dLFtbMzQ1LjYzMDkzLDE4My4xNzc1N10sWzEuNDMwNjMsMS40MzEzXSxbLTEuNzI0MjgsLTEuNzI1MDldXSxbWzM0MC45MjM2OCwxNzguNDY4MTFdLFswLjg4MTc5LDAuODgyMl0sWy0wLjc5ODY2LC0wLjc5OTA0XV1dLCZxdW90O2Nsb3NlZCZxdW90Ozp0cnVlLCZxdW90O2ZpbGxDb2xvciZxdW90OzpbMCwwLDAsMV19XX1cIiBmaWxsPVwiI2ZmZmZmZlwiIHN0cm9rZT1cIm5vbmVcIiBzdHJva2Utd2lkdGg9XCIwLjVcIi8+PHBhdGggZD1cIk0zMzQuMDU2MjMsMjAzLjU4MjgxYzEuMzE2NSwzLjM4MzI4IDEuNTcxNzYsNi41OTk0NiAwLjgyODU4LDkuMTc4MjZjLTAuMjI2MjIsMC43ODQ5NiAtMi4yMTU2NiwwLjkzMDI1IC0zLjQ1MTI1LC0wLjMwNTI2Yy0yLjkwODYxLC0yLjkwODQ1IC0xNC45OTg1MiwtMTQuOTk4MjggLTE5LjYyOTg1LC0xOS42MjkzN2MtMS4xMzk4MiwtMS4xMzk3NiAtMC4zMjE2MSwtMi42MjA1MiAwLjU0NDgyLC0yLjg0ODMxYzAuODc3OSwtMC4yMzA4IDEuODM2NjIsLTAuMzU0MjYgMi44NDkyMiwtMC4zNTQyNmMxLjkwOTU3LDAgNC4wMzc4NCwwLjQxOTYzIDYuMTM0NTYsMS4yMzA2MWwxMi43MjM5MSwxMi43MjgzMnpcIiBkYXRhLXBhcGVyLWRhdGE9XCJ7JnF1b3Q7bm9Ib3ZlciZxdW90OzpmYWxzZSwmcXVvdDtvcmlnSXRlbSZxdW90OzpbJnF1b3Q7UGF0aCZxdW90Oyx7JnF1b3Q7YXBwbHlNYXRyaXgmcXVvdDs6dHJ1ZSwmcXVvdDtzZWdtZW50cyZxdW90OzpbWzMzNC4wMDEzOCwyMDMuNTcyMl0sW1szMjEuMzQyMzIsMTkwLjkwOTQ0XSxbMCwwXSxbLTIuMDk2NzIsLTAuODEwOTldXSxbWzMxNS4yMjkxNiwxODkuNjcwMDZdLFsxLjkwOTU3LDBdLFstMS4wMTI2LDBdXSxbWzMxMi4zODY5NywxOTAuMDE4NjZdLFswLjg3NzksLTAuMjMwOF0sWy0wLjg2NjQzLDAuMjI3NzldXSxbWzMxMS44NDgyNywxOTIuODYwMTNdLFstMS4xMzk4MiwtMS4xMzk3Nl0sWzQuNjMxMzMsNC42MzEwOV1dLFtbMzMxLjQwMDE5LDIxMi40MTEwMV0sWy0yLjkwODYxLC0yLjkwODQ1XSxbMS4yMzU1OCwxLjIzNTUyXV0sW1szMzQuODQ0NzEsMjEyLjcyMjE4XSxbLTAuMjI2MjIsMC43ODQ5Nl0sWzAuNzQzMTgsLTIuNTc4OF1dLFtbMzM0LjAwMTM4LDIwMy41NzIyXSxbMS4zMTY1LDMuMzgzMjhdLFswLDBdXV0sJnF1b3Q7Y2xvc2VkJnF1b3Q7OnRydWUsJnF1b3Q7ZmlsbENvbG9yJnF1b3Q7OlswLDAsMCwxXX1dfVwiIGZpbGw9XCIjZmZmZmZmXCIgc3Ryb2tlPVwibm9uZVwiIHN0cm9rZS13aWR0aD1cIjAuNVwiLz48L2c+PC9nPjwvc3ZnPiJ9LCJleHRlbnNpb24gZGF0YSI6eyJzb3VyY2UgaW1hZ2VzIjoiaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL1NoYXJrUG9vbC1TUC9TaGFya1Bvb2xzLUV4dGVuc2lvbnMvbWFpbi9HYWxsZXJ5JTIwRmlsZXMvU291cmNlLUltYWdlcy5qc29uIiwicGluIG9yZGVyIjpbIkV4dC5TaGFya3RpbGl0aWVzIiwiRXh0LllvdVR1YmUtT3BlcmF0aW9ucyIsIkV4dC5UaW1lLUNhbGN1bGF0aW9ucyIsIkV4dC5TY3JhdGNoLVV0aWxpdGllcyIsIkV4dC5OaWNoZS1Ub29sYm94IiwiRXh0LlNlZWRzIiwiRXh0LlR1bmUtU2hhcmsiLCJFeHQuQWRkZWQtTW90aW9uIiwiRXh0Lkdlb21ldHJ5LURhc2gtQVBJIiwiRXh0LlNvdW5kLVdhdmVzIiwiRXh0Lkh5cGVyLVNlbnNlIiwiRXh0LkJldHRlci1JbnB1dCIsIkV4dC5DYW1lcmEtU2Vuc2luZy1QbHVzIiwiRXh0LlBhcnRpY2xlLVRvb2xzIiwiRXh0LkltYWdlLUVmZmVjdHMiLCJFeHQuUmVjb3JkaW5nIiwiRXh0Lk5ld2dyb3VuZHMtQXVkaW8iLCJFeHQuU3ByaXRlLVBhcmVudGluZyIsIkV4dC5MYXp5LUNvbGxpc2lvbnMiLCJFeHQuRmlsZXMtRXhwYW5kZWQiLCJFeHQuTW9uaXRvcnMtUGx1cyIsIkV4dC5HYW1lcGFkLUV4cGFuZGVkIiwiRXh0LlRpbGUtR3JpZHMiLCJFeHQuU2luY2UtMjAwMCIsIkV4dC5BbmltYXRpb25zIiwiRXh0LlBhdXNlLVV0aWxpdGllcyIsIkV4dC5FeGFtcGxlIl0sImN1cnJlbnRseSBwaW5uZWQiOltdLCJjcmVkaXRzIjpbIkZldGNoIGFuZCBwbGF5IFlvdXR1YmUgdmlkZW9zIGFuZCBzdGF0aXN0aWNzIGluIHlvdXIgcHJvamVjdC4gTWFkZSBieSBTaGFya1Bvb2wgYW5kIGNvbnRyaWJ1dGVkIHRvIGJ5IE5la2wzMDAiLCJWYXJpb3VzIHV0aWxpdHkgYmxvY2tzIGZvciB2YXJpb3VzIG9wZXJhdGlvbnMgbWFkZSBieSBTaGFya1Bvb2wiLCJCbG9ja3MgZm9yIGNhbGN1bGF0aW5nIHRpbWUgZGlmZmVyZW5jZXMuIE1hZGUgYnkgU2hhcmtQb29sIiwiQmxvY2tzIGZvciBmZXRjaGluZyBTY3JhdGNoIHN0YXRpc3RpY3MgYW5kIGluZm8uIE1hZGUgYnkgU2hhcmtQb29sLCBpbnNwaXJlZCBieSBOZXh1c0tpdHRvbidzIFMtR3JhYiIsIlV0aWxpdHkgQmxvY2tzIG1hZGUgYnkgMHpuencuIFRoZSAnQ29sb3IgYXQgWCZZJyBhbmQgJ1NvdW5kIHRvIERhdGEuVVJJJyBleHRlbnNpb25zIHdlcmUgbWVyZ2VkIGhlcmUhIiwiR2VuZXJhdGUgcmFuZG9tIHNlZWRlZCBudW1iZXJzLCBnZW5lcmF0ZWQgdGVycmFpbiwgYW5kIG1vcmUhIE1hZGUgYnkgU2hhcmtQb29sIiwiQWR2YW5jZWQgU291bmQgRW5naW5lIGZvciBwbGF5aW5nIHlvdXIgc291bmRzIGFuZCBtb3JlLiBNYWRlIGJ5IFNoYXJrUG9vbCwgaW5zcGlyZWQgYnkgTGlseU1ha2VzVGhpbmdzIiwiTmV3IE1vdGlvbiBCbG9ja3MgbWFkZSBieSBTaGFya1Bvb2wiLCJGZXRjaCBHZW9tZXRyeSBEYXNoIHN0YXRpc3RpY3MgYW5kIGluZm9ybWF0aW9uLiBNYWRlIGJ5IFNoYXJrUG9vbC4gVGhhbmsgeW91IFJvYlRvcEdhbWVzIGFuZCBDb2xvbkdEIiwiUGxheSB2YXJpb3VzIG9zY2lsbGF0b3JzIGluIHlvdXIgcHJvamVjdC4gTWFkZSBieSBTaGFya1Bvb2wiLCJOZXcgU2Vuc2luZyBCbG9ja3MgbWFkZSBieSBTaGFya1Bvb2wiLCJFeHBhbnNpb24gb2YgdGhlICdBc2sgYW5kIFdhaXQnIGJsb2NrIHVzaW5nIENTUy4gTWFkZSBieSBTaGFya1Bvb2wiLCJCZXR0ZXIgQ2FtZXJhIFNlbnNpbmcgRXh0ZW5zaW9uIGZvciBTcHJpdGVzLiBBcHBseSBncmVlbiBzY3JlZW5zIGFuZCBtb3JlISBNYWRlIGJ5IFNoYXJrUG9vbCIsIlRvb2xzIHRoYXQgbWFrZSBjcmVhdGluZyBwYXJ0aWNsZSBzeXN0ZW1zIGVhc3khIE1hZGUgYnkgU2hhcmtQb29sIiwiQXBwbHkgbmV3LCBub24tdmFuaWxsYSBlZmZlY3RzIGFuZCBlZGl0cyB0byBJbWFnZXMgYW5kIFNwcml0ZXMhIE1hZGUgYnkgU2hhcmtQb29sIiwiVXRpbGl0eSBibG9ja3MgZm9yIHJlY29yZGluZyB5b3Vyc2VsZiB3aGlsZSB5b3VyIHByb2plY3QgcnVucy4gTWFkZSBieSBTaGFya1Bvb2wiLCJGZXRjaCBBdWRpbyBhbmQgQXVkaW8gSW5mb3JtYXRpb24gZnJvbSBOZXdncm91bmRzLiBNYWRlIGJ5IFNoYXJrUG9vbCwgd29ya3MgYmVzdCB3aXRoIFR1bmUgU2hhcmsiLCJMaW5rIHNwcml0ZXMgdG9nZXRoZXIgYW5kIG1ha2UgdGhlbSBmb2xsb3cgdGhlIHBhcmVudCdzIGRhdGEuIE1hZGUgYnkgU2hhcmtQb29sIiwiVXRpbGl0eSBibG9ja3MgdGhhdCBtYWtlIGRldGVjdGluZyBjb2xsaXNpb25zIGVhc3kgYW5kIGZhc3QuIE1hZGUgYnkgU2hhcmtQb29sIiwiTmV3IEJsb2NrcyBhZGRlZCB0byBHYXJib011ZmZpbidzIEZpbGUgRXh0ZW5zaW9uLiBNYWRlIGJ5IFNoYXJrUG9vbCwgTWFydGluZWxwbGF5eiBhbmQgMHpuencuIiwiTmV3IFZhcmlhYmxlIEJsb2NrcyBhbmQgTmV3IE1vbml0b3IgdHlwZXMuIE1hZGUgYnkgU2hhcmtQb29sIGFuZCBEb2dlSXNDdXQuIiwiTmV3IEJsb2NrcyBhZGRlZCB0byBHYXJib211ZmZpbidzIEdhbWVwYWQgRXh0ZW5zaW9uLiBNYWRlIGJ5IE1hcnRpbmVscGxheXouIiwiUGxhY2UgU3ByaXRlcyBvbiBUaWxlIEdyaWRzLiBNYWRlIGJ5IFNoYXJrUG9vbC4iLCJBbiBleHBhbnNpb24gb2YgdGhlIFNpbmNlIDIwMDAgQmxvY2tzLiBNYWRlIEJ5IElPTi4iLCJDcmVhdGUgQW5pbWF0aW9ucyBhbmQgS2V5ZnJhbWVzIGluIFlvdXIgUHJvamVjdC4gTWFkZSBieSBTaGFya1Bvb2wuIFRoZVNob3ZlbCBoZWxwZWQgbWFrZSB0aGlzIFRodW1ibmFpbCAiLCJQYXVzZSB5b3VyIFByb2plY3QgYW5kIENob3NlbiBTY3JpcHRzLiBNYWRlIGJ5IFNoYXJrUG9vbCJdLCJ0YWdzIjpbIkV4dC5Zb3VUdWJlLU9wZXJhdGlvbnMuYWxsLmZldGNoaW5nIiwiRXh0LlNoYXJrdGlsaXRpZXMuYWxsLnV0aWxpdGllcyIsIkV4dC5UaW1lLUNhbGN1bGF0aW9ucy5hbGwudXRpbGl0aWVzLmV4cGFuZGVkIiwiRXh0LlNjcmF0Y2gtVXRpbGl0aWVzLmFsbC5leHBhbmRlZC5mZXRjaGluZyIsIkV4dC5OaWNoZS1Ub29sYm94LmFsbC51dGlsaXRpZXMiLCJFeHQuU2VlZHMuYWxsLnV0aWxpdGllcyIsIkV4dC5UdW5lLVNoYXJrLmFsbC51dGlsaXRpZXMiLCJFeHQuQWRkZWQtTW90aW9uLmFsbC51dGlsaXRpZXMuZXhwYW5kZWQiLCJFeHQuR2VvbWV0cnktRGFzaC1BUEkuYWxsLnV0aWxpdGllcy5mZXRjaGluZyIsIkV4dC5Tb3VuZC1XYXZlcy5hbGwudXRpbGl0aWVzIiwiRXh0Lkh5cGVyLVNlbnNlLmFsbC51dGlsaXRpZXMuZXhwYW5kZWQiLCJFeHQuQmV0dGVyLUlucHV0LmFsbC51dGlsaXRpZXMuZXhwYW5kZWQiLCJFeHQuQ2FtZXJhLVNlbnNpbmctUGx1cy5hbGwudXRpbGl0aWVzLmV4cGFuZGVkLmZldGNoaW5nIiwiRXh0LlBhcnRpY2xlLVRvb2xzLmFsbC51dGlsaXRpZXMiLCJFeHQuSW1hZ2UtRWZmZWN0cy5hbGwudXRpbGl0aWVzLmV4cGFuZGVkIiwiRXh0LlJlY29yZGluZy5hbGwudXRpbGl0aWVzLmZldGNoaW5nIiwiRXh0Lk5ld2dyb3VuZHMtQXVkaW8uYWxsLmZldGNoaW5nIiwiRXh0LlNwcml0ZS1QYXJlbnRpbmcuYWxsLnV0aWxpdGllcyIsIkV4dC5MYXp5LUNvbGxpc2lvbnMuYWxsLnV0aWxpdGllcyIsIkV4dC5GaWxlcy1FeHBhbmRlZC5hbGwuZXhwYW5kZWQuZmV0Y2hpbmciLCJFeHQuTW9uaXRvcnMtUGx1cy5hbGwuZXhwYW5kZWQudXRpbGl0aWVzIiwiRXh0LkdhbWVwYWQtRXhwYW5kZWQuYWxsLmV4cGFuZGVkLnV0aWxpdGllcyIsIkV4dC5UaWxlLUdyaWRzLmFsbC51dGlsaXRpZXMiLCJFeHQuU2luY2UtMjAwMC5hbGwuZXhwYW5kZWQiLCJFeHQuQW5pbWF0aW9ucy5hbGwudXRpbGl0aWVzIiwiRXh0LlBhdXNlLVV0aWxpdGllcy5hbGwudXRpbGl0aWVzIiwiRXh0LkV4YW1wbGUuYWxsLnV0aWxpdGllcy5leHBhbmRlZC5mZXRjaGluZyJdfSwidXJscyI6eyJ1c2VyIjoiaHR0cHM6Ly93d3cueW91dHViZS5jb20vY2hhbm5lbC9VQzI2aHZtZXRxWWdOQjNvRmV3Vl9ndGciLCJtYWluIGdhbGxlcnkiOiJodHRwczovL3R1cmJvd2FycC5vcmciLCJhbHRlcm5hdGUgZ2FsbGVyeSI6Imh0dHBzOi8vcGVuZ3Vpbm1vZC5jb20iLCJleHRlbnNpb24gdGh1bWJuYWlscyI6Imh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9TaGFya1Bvb2wtU1AvU2hhcmtQb29scy1FeHRlbnNpb25zL21haW4vZXh0ZW5zaW9uLXRodW1icy8lVEhVTUJfTkFNRSUuc3ZnIn0sInRleHQiOnsidHJhbnNpdGlvbiI6eyJhdXRvbG9hZGVkIjoiU2VsZWN0ZWQgRXh0ZW5zaW9ucyBhcmUgQXV0by1Mb2FkZWQiLCJ0byBnYWxsZXJ5IjoiR28gYmFjayB0byB0aGUgR2FsbGVyeSIsInRvIGNvbnRyaWJ1dG9ycyI6IkdvIHRvIHRoZSBDb250cmlidXRvcnMgUGFnZSIsImNvcHkgZmFpbCI6IkNvcHkgRXJyb3I6IENvdWxkbid0IENvcHkgQ29kZSIsImNvcGllZCI6IkNvcGllZCBFeHRlbnNpb24gQ29kZSEifSwiZ2FsbGVyeSB0ZXh0Ijp7InRpdGxlIjoiU2hhcmtQb29sJ3MgRXh0ZW5zaW9uIENvbGxlY3Rpb24iLCJkZXNjcmlwdGlvbiI6IlNoYXJrUG9vbCdzIGNvbGxlY3Rpb24gb2YgVHVyYm9XYXJwIEV4dGVuc2lvbnMuIE1vc3QgRXh0ZW5zaW9ucyB3ZXJlIG1hZGUgb3IgY29udHJpYnV0ZWQgdG8gYnkgU2hhcmtQb29sLiBIb3ZlciBmb3IgRGV0YWlscy4gUGxlYXNlIExvYWQgRXh0ZW5zaW9ucyBVbnNhbmRib3hlZCwgb3RoZXJ3aXNlLCB0aGV5IHdpbGwgbm90IExvYWQuIn19fX0=`);
    modModalText.innerHTML = `Load your mod: <br><input id="${modJsonInID}" value="${defaultMod}"/><br>`;

    let modModalLoadModButton = document.createElement('button');
    modModalLoadModButton.innerText = 'Load Mod! (base64->json)';
    modModalLoadModButton.onclick = modModalLoadModHandler;

    let modModalCloseButton = document.createElement('button');
    modModalCloseButton.innerText = 'Close ML3.';
    modModalCloseButton.onclick = modModalCloseHandler;

    modModal.appendChild(modModalText);
    modModal.appendChild(modModalLoadModButton);
    modModal.appendChild(modModalCloseButton);
    //modModal.appendChild(modModalErrorSection);

    function modButtonHandler() {
        modModal.showModal();
    }

    let modButton = document.querySelector('button#modButton') || document.createElement('button');
    modButton.id = 'modButton';
    modButton.innerText = 'ML3.';
    modButton.onclick = modButtonHandler;
    modButton.style.color = '#000000';
    modButton.style.position = 'relative';

    if (modModal.parentElement == null) document.body.appendChild(modModal);
    if (modButton.parentElement == null && isPackaged) document.body.appendChild(modButton);
    if (modButton.parentElement == null && !isPackaged) overlays.appendChild(modButton);

    console_.log('Mod Loader injected.');

    return true;
})((isPackaged ? scaffolding.vm : vm));
delete window.isPackaged;