/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 859:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const config_1 = __webpack_require__(28);
const handler_1 = __webpack_require__(920);
const logger_1 = __webpack_require__(614);
const utils_1 = __webpack_require__(185);
(0, logger_1.log)(`Starting ${config_1.ADDON_NAME} add-on`);
let port = browser.runtime.connectNative(config_1.ADDON_NAME);
(0, logger_1.log)(`[${config_1.ADDON_NAME}] Connected with native application`, port);
listen(port);
function listen(port) {
    port.onMessage.addListener((payload) => {
        (0, logger_1.log)(`[${config_1.ADDON_NAME}] Got message from native application: ${JSON.stringify(payload)}`);
        const { payload: command } = payload;
        (0, handler_1.handler)(port, command);
    });
    port.onDisconnect.addListener((port) => __awaiter(this, void 0, void 0, function* () {
        (0, logger_1.log)(`[${config_1.ADDON_NAME}] Disconnected with native application`);
        (0, logger_1.log)(`[${config_1.ADDON_NAME}] Broken port ?`, port);
        const delayMs = 1000;
        (0, logger_1.log)(`[${config_1.ADDON_NAME}] Waiting ${delayMs}ms before retry...`);
        yield (0, utils_1.delay)(delayMs);
        (0, logger_1.log)(`[${config_1.ADDON_NAME}] Waited ${delayMs}ms...`);
        (0, logger_1.log)(`[${config_1.ADDON_NAME}] Trying to reconnect to native application...`);
        port = browser.runtime.connectNative(config_1.ADDON_NAME);
        (0, logger_1.log)(`[${config_1.ADDON_NAME}] Connected with native application`, port);
        listen(port);
    }));
}


/***/ }),

/***/ 28:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DEBUG = exports.ADDON_NAME = void 0;
exports.ADDON_NAME = "mozeidon";
exports.DEBUG = false;


/***/ }),

/***/ 921:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MAX_BOOKMARK_COUNT = exports.BOOKMARK_TYPE = exports.ROOT_BOOKMARK_ID = void 0;
exports.ROOT_BOOKMARK_ID = 'toolbar_____';
exports.BOOKMARK_TYPE = 'bookmark';
exports.MAX_BOOKMARK_COUNT = 100000;


/***/ }),

/***/ 920:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.handler = void 0;
const command_1 = __webpack_require__(238);
const bookmarks_1 = __webpack_require__(972);
const tabs_1 = __webpack_require__(721);
function handler(port, cmd) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (cmd.command) {
            case command_1.CommandName.GET_TABS:
                return (0, tabs_1.getTabs)(port, cmd);
            case command_1.CommandName.GET_RECENTLY_CLOSED_TABS:
                return (0, tabs_1.getRecentlyClosedTabs)(port, cmd);
            case command_1.CommandName.SWITCH_TAB:
                return (0, tabs_1.switchToTab)(port, cmd);
            case command_1.CommandName.CLOSE_TABS:
                return (0, tabs_1.closeTabs)(port, cmd);
            case command_1.CommandName.NEW_TAB:
                return yield (0, tabs_1.newTab)(port, cmd);
            case command_1.CommandName.GET_BOOKMARKS:
                return (0, bookmarks_1.getBookmarks)(port, cmd);
        }
    });
}
exports.handler = handler;


/***/ }),

/***/ 614:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.log = void 0;
const config_1 = __webpack_require__(28);
function log(...args) {
    if (config_1.DEBUG) {
        console.log.apply(console, args);
    }
}
exports.log = log;


/***/ }),

/***/ 238:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CommandName = void 0;
var CommandName;
(function (CommandName) {
    CommandName["CLOSE_TABS"] = "close-tabs";
    CommandName["GET_BOOKMARKS"] = "get-bookmarks";
    CommandName["GET_RECENTLY_CLOSED_TABS"] = "get-recently-closed-tabs";
    CommandName["GET_TABS"] = "get-tabs";
    CommandName["NEW_TAB"] = "new-tab";
    CommandName["SWITCH_TAB"] = "switch-tab";
})(CommandName || (exports.CommandName = CommandName = {}));


/***/ }),

/***/ 392:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Response = void 0;
class Response {
    constructor(payload) {
        return { data: payload };
    }
    static data(payload) {
        return new Response(payload);
    }
    static end() {
        return new Response("end");
    }
}
exports.Response = Response;


/***/ }),

/***/ 972:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getBookmarks = void 0;
const constants_1 = __webpack_require__(921);
const logger_1 = __webpack_require__(614);
const response_1 = __webpack_require__(392);
const utils_1 = __webpack_require__(185);
const inMemoryBookmarkMap = new Map;
function getBookmarks(port, { args }) {
    if (!args) {
        (0, logger_1.log)("missing args in get-bookmarks");
        return port.postMessage(response_1.Response.end());
    }
    const receivedParams = args.split(":");
    if (receivedParams.length < 2) {
        (0, logger_1.log)(`invalid args in get-bookmarks: received ${args}, expected a string combining two integers like "0:0"`);
        return port.postMessage(response_1.Response.end());
    }
    const maxInput = parseInt(receivedParams[0]);
    const chunkSizeInput = parseInt(receivedParams[1]);
    browser.bookmarks.getRecent(maxInput ? maxInput : constants_1.MAX_BOOKMARK_COUNT)
        .then((bookmarks) => __awaiter(this, void 0, void 0, function* () {
        const startTime = Date.now();
        const chunkSize = chunkSizeInput ? chunkSizeInput : constants_1.MAX_BOOKMARK_COUNT;
        const chunks = [];
        for (let i = 0; i < bookmarks.length; i += chunkSize) {
            const chunk = bookmarks.slice(i, i + chunkSize);
            chunks.push(chunk);
        }
        for (const chunk of chunks) {
            const bms = yield processChunk(chunk);
            port.postMessage(response_1.Response.data(bms));
        }
        const endTime = Date.now();
        (0, logger_1.log)(`sending back bookmarks in ${endTime - startTime} ms`);
        yield (0, utils_1.delay)(100);
        port.postMessage(response_1.Response.end());
    }));
}
exports.getBookmarks = getBookmarks;
function processChunk(items) {
    return __awaiter(this, void 0, void 0, function* () {
        const bms = [];
        for (const p of (yield getBmParentTitles(items.filter(item => item.url && item.type === constants_1.BOOKMARK_TYPE)))) {
            bms.push({
                id: p.id,
                title: p.title,
                url: p.url,
                parent: p.parentPath,
            });
        }
        return bms;
    });
}
class BookmarksGroup {
    constructor(bm) {
        this.ok = false;
        this.bookmarks = [];
        this.parentPath = [];
        this.bookmarks.push(bm);
    }
    addNew(bm) {
        this.bookmarks.push(bm);
    }
    setOk() {
        this.ok = true;
        return this;
    }
    addParent(title) {
        this.parentPath = [title, ...this.parentPath];
    }
}
function getBmParentTitles(bms) {
    return __awaiter(this, void 0, void 0, function* () {
        const bookmarks = [];
        const reducer = (result, current) => {
            if (current.parentId !== constants_1.ROOT_BOOKMARK_ID) {
                result.uncomplete.push(current);
            }
            else {
                result.complete.push(Object.assign(Object.assign({}, current), { parentPath: "" }));
            }
            return result;
        };
        const { complete, uncomplete } = bms.reduce(reducer, { complete: [], uncomplete: [] });
        let parentIdsMap = uncomplete.reduce((bms, bm) => {
            if (bm.parentId) {
                const b = bms.get(bm.parentId);
                if (b) {
                    b.addNew(bm);
                }
                else {
                    bms.set(bm.parentId, new BookmarksGroup(bm));
                }
            }
            return bms;
        }, new Map());
        for (const [key, v] of parentIdsMap) {
            let parentId = key;
            while (!v.ok) {
                let parent = inMemoryBookmarkMap.get(parentId);
                if (!parent) {
                    const parents = yield browser.bookmarks.get(parentId);
                    parent = parents[0];
                    inMemoryBookmarkMap.set(parent.id, parent);
                }
                if (parent &&
                    (parent.parentId === undefined ||
                        parent.parentId === constants_1.ROOT_BOOKMARK_ID ||
                        parent.title === "")) {
                    v.setOk().addParent(parent.title);
                }
                else {
                    v.addParent(parent.title);
                    parentId = parent.parentId;
                }
            }
            for (const bookmark of v.bookmarks) {
                bookmarks.push(Object.assign(Object.assign({}, bookmark), { parentPath: v.parentPath.filter(path => path).join("/") }));
            }
            parentIdsMap.delete(key);
        }
        bookmarks.push(...complete);
        const sortPredicate = (a, b) => a > b ? -1 : 1;
        bookmarks.sort((a, b) => sortPredicate(a.dateAdded || 0, b.dateAdded || 0));
        return bookmarks;
    });
}


/***/ }),

/***/ 721:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.closeTabs = exports.switchToTab = exports.getTabs = exports.getRecentlyClosedTabs = exports.newTab = void 0;
const logger_1 = __webpack_require__(614);
const response_1 = __webpack_require__(392);
const utils_1 = __webpack_require__(185);
function newTab(port, { args }) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!args) {
            (0, logger_1.log)("open empty tab");
            yield browser.tabs.create({});
            return port.postMessage(response_1.Response.end());
        }
        try {
            const url = new URL(args);
            (0, logger_1.log)("open tab at url: ", url);
            yield browser.tabs.create({ url: url.toString() });
        }
        catch (_) {
            const url = `https://www.google.com/search?q=${encodeURIComponent(args)}`;
            (0, logger_1.log)("open google tab");
            yield browser.tabs.create({ url });
        }
        port.postMessage(response_1.Response.end());
    });
}
exports.newTab = newTab;
function getRecentlyClosedTabs(port, { command: _cmd }) {
    browser.sessions.getRecentlyClosed()
        .then((sessions) => __awaiter(this, void 0, void 0, function* () {
        const sessionTabs = sessions
            .sort((s1, s2) => s2.lastModified - s1.lastModified)
            .filter((session) => session.tab)
            .map(i => i.tab)
            .filter((t) => !!t);
        (0, logger_1.log)("Sending back ", sessionTabs.length, " recently closed tabs");
        const tabs = sessionTabs.map(tab => {
            var _a;
            return ({
                id: (_a = tab.lastAccessed) !== null && _a !== void 0 ? _a : Math.floor(Math.random() * 1000),
                windowId: tab.windowId,
                title: tab.title,
                pinned: tab.pinned,
                url: tab.url,
                active: tab.active,
                domain: tab.url
                    ? new URL(tab.url).hostname.replace("www.", "")
                    : ''
            });
        });
        port.postMessage(response_1.Response.data(tabs));
        yield (0, utils_1.delay)(100);
        port.postMessage(response_1.Response.end());
    }));
}
exports.getRecentlyClosedTabs = getRecentlyClosedTabs;
function getTabs(port, { command: _cmd }) {
    browser.tabs.query({})
        .then((browserTabs) => __awaiter(this, void 0, void 0, function* () {
        let returnedTabs = browserTabs.slice();
        browserTabs.sort((a, b) => b.lastAccessed - a.lastAccessed);
        const firstOrderedTabs = browserTabs.slice(0, 10);
        returnedTabs = [...firstOrderedTabs, ...returnedTabs.filter(t => !firstOrderedTabs.includes(t))];
        (0, logger_1.log)("Sending back ", returnedTabs.length, " tabs");
        const tabs = returnedTabs.map(tab => ({
            id: tab.id,
            windowId: tab.windowId,
            title: tab.title,
            pinned: tab.pinned,
            url: tab.url,
            active: tab.active,
            domain: tab.url
                ? new URL(tab.url).hostname.replace("www.", "")
                : ''
        }));
        port.postMessage(response_1.Response.data(tabs));
        yield (0, utils_1.delay)(100);
        port.postMessage(response_1.Response.end());
    }));
}
exports.getTabs = getTabs;
function switchToTab(port, { args }) {
    if (!args) {
        (0, logger_1.log)("invalid args, received: ", args);
        return port.postMessage(response_1.Response.end());
    }
    let windowId, tabId;
    const ids = args.split(":");
    if (ids.length !== 2) {
        (0, logger_1.log)("invalid args, cannot find both window and tab ids. Received: ", args);
        return port.postMessage(response_1.Response.end());
    }
    try {
        windowId = Number.parseInt(ids[0]);
        tabId = Number.parseInt(ids[1]);
    }
    catch (e) {
        (0, logger_1.log)("invalid args, cannot parse both window and tab ids as int", args);
        return port.postMessage(response_1.Response.end());
    }
    browser.tabs.query({ windowId })
        .then((tabs) => {
        for (let tab of tabs) {
            if (tab.id === tabId) {
                (0, logger_1.log)("found tab to switch to", tab);
                browser.tabs.update(tab.id, { active: true });
                break;
            }
        }
    });
    port.postMessage(response_1.Response.end());
}
exports.switchToTab = switchToTab;
function closeTabs(port, { args }) {
    if (!args) {
        (0, logger_1.log)("invalid args, received: ", args);
        return port.postMessage(response_1.Response.end());
    }
    const tabToCloseIds = [];
    const tabIds = args.split(',');
    browser.tabs.query({})
        .then((tabs) => {
        for (let tab of tabs) {
            if (!tab.id)
                continue;
            if (tabIds.some(id => `${tab.windowId}:${tab.id}` === id)) {
                (0, logger_1.log)("found tab to close", tab);
                tabToCloseIds.push(tab.id);
            }
        }
        (0, logger_1.log)("closing tabs", tabToCloseIds);
        browser.tabs.remove(tabToCloseIds);
    });
    port.postMessage(response_1.Response.end());
}
exports.closeTabs = closeTabs;


/***/ }),

/***/ 185:
/***/ (function(__unused_webpack_module, exports) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.delay = void 0;
function delay(milliSeconds) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(resolve => setTimeout(resolve, milliSeconds));
    });
}
exports.delay = delay;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(859);
/******/ 	
/******/ })()
;