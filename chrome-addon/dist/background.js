/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 151:
/***/ ((module) => {

var charenc = {
  // UTF-8 encoding
  utf8: {
    // Convert a string to a byte array
    stringToBytes: function(str) {
      return charenc.bin.stringToBytes(unescape(encodeURIComponent(str)));
    },

    // Convert a byte array to a string
    bytesToString: function(bytes) {
      return decodeURIComponent(escape(charenc.bin.bytesToString(bytes)));
    }
  },

  // Binary encoding
  bin: {
    // Convert a string to a byte array
    stringToBytes: function(str) {
      for (var bytes = [], i = 0; i < str.length; i++)
        bytes.push(str.charCodeAt(i) & 0xFF);
      return bytes;
    },

    // Convert a byte array to a string
    bytesToString: function(bytes) {
      for (var str = [], i = 0; i < bytes.length; i++)
        str.push(String.fromCharCode(bytes[i]));
      return str.join('');
    }
  }
};

module.exports = charenc;


/***/ }),

/***/ 939:
/***/ ((module) => {

(function() {
  var base64map
      = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',

  crypt = {
    // Bit-wise rotation left
    rotl: function(n, b) {
      return (n << b) | (n >>> (32 - b));
    },

    // Bit-wise rotation right
    rotr: function(n, b) {
      return (n << (32 - b)) | (n >>> b);
    },

    // Swap big-endian to little-endian and vice versa
    endian: function(n) {
      // If number given, swap endian
      if (n.constructor == Number) {
        return crypt.rotl(n, 8) & 0x00FF00FF | crypt.rotl(n, 24) & 0xFF00FF00;
      }

      // Else, assume array and swap all items
      for (var i = 0; i < n.length; i++)
        n[i] = crypt.endian(n[i]);
      return n;
    },

    // Generate an array of any length of random bytes
    randomBytes: function(n) {
      for (var bytes = []; n > 0; n--)
        bytes.push(Math.floor(Math.random() * 256));
      return bytes;
    },

    // Convert a byte array to big-endian 32-bit words
    bytesToWords: function(bytes) {
      for (var words = [], i = 0, b = 0; i < bytes.length; i++, b += 8)
        words[b >>> 5] |= bytes[i] << (24 - b % 32);
      return words;
    },

    // Convert big-endian 32-bit words to a byte array
    wordsToBytes: function(words) {
      for (var bytes = [], b = 0; b < words.length * 32; b += 8)
        bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF);
      return bytes;
    },

    // Convert a byte array to a hex string
    bytesToHex: function(bytes) {
      for (var hex = [], i = 0; i < bytes.length; i++) {
        hex.push((bytes[i] >>> 4).toString(16));
        hex.push((bytes[i] & 0xF).toString(16));
      }
      return hex.join('');
    },

    // Convert a hex string to a byte array
    hexToBytes: function(hex) {
      for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
      return bytes;
    },

    // Convert a byte array to a base-64 string
    bytesToBase64: function(bytes) {
      for (var base64 = [], i = 0; i < bytes.length; i += 3) {
        var triplet = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
        for (var j = 0; j < 4; j++)
          if (i * 8 + j * 6 <= bytes.length * 8)
            base64.push(base64map.charAt((triplet >>> 6 * (3 - j)) & 0x3F));
          else
            base64.push('=');
      }
      return base64.join('');
    },

    // Convert a base-64 string to a byte array
    base64ToBytes: function(base64) {
      // Remove non-base-64 characters
      base64 = base64.replace(/[^A-Z0-9+\/]/ig, '');

      for (var bytes = [], i = 0, imod4 = 0; i < base64.length;
          imod4 = ++i % 4) {
        if (imod4 == 0) continue;
        bytes.push(((base64map.indexOf(base64.charAt(i - 1))
            & (Math.pow(2, -2 * imod4 + 8) - 1)) << (imod4 * 2))
            | (base64map.indexOf(base64.charAt(i)) >>> (6 - imod4 * 2)));
      }
      return bytes;
    }
  };

  module.exports = crypt;
})();


/***/ }),

/***/ 206:
/***/ ((module) => {

/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}


/***/ }),

/***/ 503:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

(function(){
  var crypt = __webpack_require__(939),
      utf8 = (__webpack_require__(151).utf8),
      isBuffer = __webpack_require__(206),
      bin = (__webpack_require__(151).bin),

  // The core
  md5 = function (message, options) {
    // Convert to byte array
    if (message.constructor == String)
      if (options && options.encoding === 'binary')
        message = bin.stringToBytes(message);
      else
        message = utf8.stringToBytes(message);
    else if (isBuffer(message))
      message = Array.prototype.slice.call(message, 0);
    else if (!Array.isArray(message) && message.constructor !== Uint8Array)
      message = message.toString();
    // else, assume byte array already

    var m = crypt.bytesToWords(message),
        l = message.length * 8,
        a =  1732584193,
        b = -271733879,
        c = -1732584194,
        d =  271733878;

    // Swap endian
    for (var i = 0; i < m.length; i++) {
      m[i] = ((m[i] <<  8) | (m[i] >>> 24)) & 0x00FF00FF |
             ((m[i] << 24) | (m[i] >>>  8)) & 0xFF00FF00;
    }

    // Padding
    m[l >>> 5] |= 0x80 << (l % 32);
    m[(((l + 64) >>> 9) << 4) + 14] = l;

    // Method shortcuts
    var FF = md5._ff,
        GG = md5._gg,
        HH = md5._hh,
        II = md5._ii;

    for (var i = 0; i < m.length; i += 16) {

      var aa = a,
          bb = b,
          cc = c,
          dd = d;

      a = FF(a, b, c, d, m[i+ 0],  7, -680876936);
      d = FF(d, a, b, c, m[i+ 1], 12, -389564586);
      c = FF(c, d, a, b, m[i+ 2], 17,  606105819);
      b = FF(b, c, d, a, m[i+ 3], 22, -1044525330);
      a = FF(a, b, c, d, m[i+ 4],  7, -176418897);
      d = FF(d, a, b, c, m[i+ 5], 12,  1200080426);
      c = FF(c, d, a, b, m[i+ 6], 17, -1473231341);
      b = FF(b, c, d, a, m[i+ 7], 22, -45705983);
      a = FF(a, b, c, d, m[i+ 8],  7,  1770035416);
      d = FF(d, a, b, c, m[i+ 9], 12, -1958414417);
      c = FF(c, d, a, b, m[i+10], 17, -42063);
      b = FF(b, c, d, a, m[i+11], 22, -1990404162);
      a = FF(a, b, c, d, m[i+12],  7,  1804603682);
      d = FF(d, a, b, c, m[i+13], 12, -40341101);
      c = FF(c, d, a, b, m[i+14], 17, -1502002290);
      b = FF(b, c, d, a, m[i+15], 22,  1236535329);

      a = GG(a, b, c, d, m[i+ 1],  5, -165796510);
      d = GG(d, a, b, c, m[i+ 6],  9, -1069501632);
      c = GG(c, d, a, b, m[i+11], 14,  643717713);
      b = GG(b, c, d, a, m[i+ 0], 20, -373897302);
      a = GG(a, b, c, d, m[i+ 5],  5, -701558691);
      d = GG(d, a, b, c, m[i+10],  9,  38016083);
      c = GG(c, d, a, b, m[i+15], 14, -660478335);
      b = GG(b, c, d, a, m[i+ 4], 20, -405537848);
      a = GG(a, b, c, d, m[i+ 9],  5,  568446438);
      d = GG(d, a, b, c, m[i+14],  9, -1019803690);
      c = GG(c, d, a, b, m[i+ 3], 14, -187363961);
      b = GG(b, c, d, a, m[i+ 8], 20,  1163531501);
      a = GG(a, b, c, d, m[i+13],  5, -1444681467);
      d = GG(d, a, b, c, m[i+ 2],  9, -51403784);
      c = GG(c, d, a, b, m[i+ 7], 14,  1735328473);
      b = GG(b, c, d, a, m[i+12], 20, -1926607734);

      a = HH(a, b, c, d, m[i+ 5],  4, -378558);
      d = HH(d, a, b, c, m[i+ 8], 11, -2022574463);
      c = HH(c, d, a, b, m[i+11], 16,  1839030562);
      b = HH(b, c, d, a, m[i+14], 23, -35309556);
      a = HH(a, b, c, d, m[i+ 1],  4, -1530992060);
      d = HH(d, a, b, c, m[i+ 4], 11,  1272893353);
      c = HH(c, d, a, b, m[i+ 7], 16, -155497632);
      b = HH(b, c, d, a, m[i+10], 23, -1094730640);
      a = HH(a, b, c, d, m[i+13],  4,  681279174);
      d = HH(d, a, b, c, m[i+ 0], 11, -358537222);
      c = HH(c, d, a, b, m[i+ 3], 16, -722521979);
      b = HH(b, c, d, a, m[i+ 6], 23,  76029189);
      a = HH(a, b, c, d, m[i+ 9],  4, -640364487);
      d = HH(d, a, b, c, m[i+12], 11, -421815835);
      c = HH(c, d, a, b, m[i+15], 16,  530742520);
      b = HH(b, c, d, a, m[i+ 2], 23, -995338651);

      a = II(a, b, c, d, m[i+ 0],  6, -198630844);
      d = II(d, a, b, c, m[i+ 7], 10,  1126891415);
      c = II(c, d, a, b, m[i+14], 15, -1416354905);
      b = II(b, c, d, a, m[i+ 5], 21, -57434055);
      a = II(a, b, c, d, m[i+12],  6,  1700485571);
      d = II(d, a, b, c, m[i+ 3], 10, -1894986606);
      c = II(c, d, a, b, m[i+10], 15, -1051523);
      b = II(b, c, d, a, m[i+ 1], 21, -2054922799);
      a = II(a, b, c, d, m[i+ 8],  6,  1873313359);
      d = II(d, a, b, c, m[i+15], 10, -30611744);
      c = II(c, d, a, b, m[i+ 6], 15, -1560198380);
      b = II(b, c, d, a, m[i+13], 21,  1309151649);
      a = II(a, b, c, d, m[i+ 4],  6, -145523070);
      d = II(d, a, b, c, m[i+11], 10, -1120210379);
      c = II(c, d, a, b, m[i+ 2], 15,  718787259);
      b = II(b, c, d, a, m[i+ 9], 21, -343485551);

      a = (a + aa) >>> 0;
      b = (b + bb) >>> 0;
      c = (c + cc) >>> 0;
      d = (d + dd) >>> 0;
    }

    return crypt.endian([a, b, c, d]);
  };

  // Auxiliary functions
  md5._ff  = function (a, b, c, d, x, s, t) {
    var n = a + (b & c | ~b & d) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  };
  md5._gg  = function (a, b, c, d, x, s, t) {
    var n = a + (b & d | c & ~d) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  };
  md5._hh  = function (a, b, c, d, x, s, t) {
    var n = a + (b ^ c ^ d) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  };
  md5._ii  = function (a, b, c, d, x, s, t) {
    var n = a + (c ^ (b | ~d)) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  };

  // Package private blocksize
  md5._blocksize = 16;
  md5._digestsize = 16;

  module.exports = function (message, options) {
    if (message === undefined || message === null)
      throw new Error('Illegal argument ' + message);

    var digestbytes = crypt.wordsToBytes(md5(message, options));
    return options && options.asBytes ? digestbytes :
        options && options.asString ? bin.bytesToString(digestbytes) :
        crypt.bytesToHex(digestbytes);
  };

})();


/***/ }),

/***/ 859:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

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
let port = chrome.runtime.connectNative(config_1.ADDON_NAME);
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
        port = chrome.runtime.connectNative(config_1.ADDON_NAME);
        (0, logger_1.log)(`[${config_1.ADDON_NAME}] Connected with native application`, port);
        listen(port);
    }));
}


/***/ }),

/***/ 28:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DEBUG = exports.ADDON_NAME = void 0;
exports.ADDON_NAME = "mozeidon";
exports.DEBUG = true;


/***/ }),

/***/ 921:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MAX_HISTORY_ITEMS_COUNT = exports.MAX_BOOKMARK_COUNT = exports.BOOKMARK_TYPE = exports.ROOT_BOOKMARK_ID = void 0;
exports.ROOT_BOOKMARK_ID = "1";
exports.BOOKMARK_TYPE = "bookmark";
exports.MAX_BOOKMARK_COUNT = 100000;
exports.MAX_HISTORY_ITEMS_COUNT = 100000;


/***/ }),

/***/ 920:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

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
const logger_1 = __webpack_require__(614);
const command_1 = __webpack_require__(238);
const response_1 = __webpack_require__(392);
const bookmarks_1 = __webpack_require__(972);
const bookmarks_writer_1 = __webpack_require__(14);
const groups_1 = __webpack_require__(357);
const history_1 = __webpack_require__(677);
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
            case command_1.CommandName.UPDATE_TAB:
                return yield (0, tabs_1.updateTabs)(port, cmd);
            case command_1.CommandName.CLOSE_TABS:
                return (0, tabs_1.closeTabs)(port, cmd);
            case command_1.CommandName.NEW_TAB:
                return yield (0, tabs_1.newTab)(port, cmd);
            case command_1.CommandName.DUPLICATE_TAB:
                return yield (0, tabs_1.duplicateTab)(port, cmd);
            case command_1.CommandName.GET_BOOKMARKS:
                return (0, bookmarks_1.getBookmarks)(port, cmd);
            case command_1.CommandName.WRITE_BOOKMARK:
                yield (0, bookmarks_writer_1.writeBookmark)(port, cmd);
                return;
            case command_1.CommandName.GET_HISTORY_ITEMS:
                return (0, history_1.getHistory)(port, cmd);
            case command_1.CommandName.DELETE_HISTORY_ITEMS:
                return (0, history_1.deleteHistory)(port, cmd);
            case command_1.CommandName.GET_GROUPS:
                return (0, groups_1.getGroups)(port, cmd);
            case command_1.CommandName.UPDATE_GROUP:
                return (0, groups_1.updateGroup)(port, cmd);
            case command_1.CommandName.NEW_GROUP_TAB:
                return yield (0, tabs_1.newGroupTab)(port, cmd);
            default:
                (0, logger_1.log)("unknown command received in handler");
                return port.postMessage(response_1.Response.end());
        }
    });
}
exports.handler = handler;


/***/ }),

/***/ 614:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

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

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CommandName = void 0;
var CommandName;
(function (CommandName) {
    CommandName["CLOSE_TABS"] = "close-tabs";
    CommandName["GET_BOOKMARKS"] = "get-bookmarks";
    CommandName["WRITE_BOOKMARK"] = "write-bookmark";
    CommandName["GET_HISTORY_ITEMS"] = "get-history-items";
    CommandName["DELETE_HISTORY_ITEMS"] = "delete-history-items";
    CommandName["GET_RECENTLY_CLOSED_TABS"] = "get-recently-closed-tabs";
    CommandName["GET_TABS"] = "get-tabs";
    CommandName["NEW_TAB"] = "new-tab";
    CommandName["SWITCH_TAB"] = "switch-tab";
    CommandName["UPDATE_TAB"] = "update-tab";
    CommandName["DUPLICATE_TAB"] = "duplicate-tab";
    CommandName["GET_GROUPS"] = "get-groups";
    CommandName["UPDATE_GROUP"] = "update-group";
    CommandName["NEW_GROUP_TAB"] = "new-group-tab";
})(CommandName || (exports.CommandName = CommandName = {}));


/***/ }),

/***/ 392:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

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

/***/ 37:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WriteBookmarkRequestType = exports.WriteBookmarkRequestSchema = void 0;
const z = __importStar(__webpack_require__(415));
exports.WriteBookmarkRequestSchema = z.object({
    bookmark: z.optional(z.object({
        id: z.string(),
        title: z.optional(z.string()),
        url: z.optional(z.string()),
        folderPath: z.optional(z.string()),
    })),
    newBookmark: z.optional(z.object({
        folderPath: z.optional(z.pipe(z.string(), z.startsWith("/"), z.endsWith("/"))),
        title: z.string(),
        url: z.string(),
    })),
});
var WriteBookmarkRequestType;
(function (WriteBookmarkRequestType) {
    WriteBookmarkRequestType[WriteBookmarkRequestType["Update"] = 0] = "Update";
    WriteBookmarkRequestType[WriteBookmarkRequestType["Create"] = 1] = "Create";
    WriteBookmarkRequestType[WriteBookmarkRequestType["Delete"] = 2] = "Delete";
})(WriteBookmarkRequestType || (exports.WriteBookmarkRequestType = WriteBookmarkRequestType = {}));


/***/ }),

/***/ 14:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.writeBookmark = void 0;
const v = __importStar(__webpack_require__(415));
const logger_1 = __webpack_require__(614);
const constants_1 = __webpack_require__(921);
const utils_1 = __webpack_require__(185);
const response_1 = __webpack_require__(392);
const write_bookmark_1 = __webpack_require__(37);
function writeBookmark(port, { args }) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const startTime = Date.now();
        try {
            const validatedInput = validateBookmarkWriteRequest(args);
            if (!validatedInput) {
                return port.postMessage(response_1.Response.end());
            }
            switch (validatedInput.type) {
                case write_bookmark_1.WriteBookmarkRequestType.Delete:
                    yield deleteBookmark(validatedInput);
                    break;
                case write_bookmark_1.WriteBookmarkRequestType.Create:
                    yield createBookmark(validatedInput);
                    break;
                case write_bookmark_1.WriteBookmarkRequestType.Update:
                    yield updateBookmark(validatedInput);
                    break;
            }
            const endTime = Date.now();
            (0, logger_1.log)(`ending writeBookmark in ${endTime - startTime} ms`);
            return port.postMessage(response_1.Response.end());
        }
        catch (e) {
            const endTime = Date.now();
            (0, logger_1.log)(`error in writeBookmark in ${endTime - startTime} ms`, e);
            port.postMessage(response_1.Response.data(`[Error] ${(_a = e.message) !== null && _a !== void 0 ? _a : e.toString()}`));
            yield (0, utils_1.delay)(10);
            return port.postMessage(response_1.Response.end());
        }
    });
}
exports.writeBookmark = writeBookmark;
function validateBookmarkWriteRequest(input) {
    if (!input) {
        (0, logger_1.log)("missing args in write-bookmark");
        return;
    }
    try {
        const fromJson = JSON.parse(input);
        const { bookmark, newBookmark } = v.parse(write_bookmark_1.WriteBookmarkRequestSchema, fromJson);
        if ((0, utils_1.isDefined)(bookmark) && (0, utils_1.isDefined)(newBookmark)) {
            (0, logger_1.log)("invalid args in write-bookmark: bookmark and newBookmark cannot be both defined");
            throw new Error("bookmark and newBookmark cannot be both defined");
        }
        if (bookmark) {
            const { url, title, folderPath } = bookmark;
            if (!(0, utils_1.isDefined)(url) && !(0, utils_1.isDefined)(title) && !(0, utils_1.isDefined)(folderPath)) {
                (0, logger_1.log)("received args in write-bookmark: delete", bookmark);
                return {
                    type: write_bookmark_1.WriteBookmarkRequestType.Delete,
                    id: bookmark.id,
                };
            }
            (0, logger_1.log)("received args in write-bookmark: update", bookmark);
            return Object.assign({ type: write_bookmark_1.WriteBookmarkRequestType.Update }, bookmark);
        }
        if (newBookmark) {
            (0, logger_1.log)("received args in write-bookmark: create", newBookmark);
            return {
                type: write_bookmark_1.WriteBookmarkRequestType.Create,
                folderPath: newBookmark.folderPath,
                url: newBookmark.url,
                title: newBookmark.title,
            };
        }
        (0, logger_1.log)("invalid args in write-bookmark: bookmark or newBookmark must be defined");
        throw new Error("bookmark and newBookmark cannot be both undefined");
    }
    catch (e) {
        (0, logger_1.log)("invalid args in write-bookmark: cannot parse or validate JSON", e.toString());
        throw e;
    }
}
function deleteBookmark(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const [bookmark] = yield chrome.bookmarks.get(params.id);
        yield chrome.bookmarks.remove(params.id);
        yield deleteEmptyFolders(bookmark.parentId);
    });
}
function createBookmark(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const { folderPath, title, url } = params;
        if (!folderPath) {
            return yield chrome.bookmarks.create({ title, url });
        }
        const folders = folderPath.replace("/", "").split("/").slice(0, -1);
        const { targetFolder, targetId, toBeCreatedFolders } = yield findTargetFolder(folders);
        if (!targetFolder) {
            (0, logger_1.log)("no targetFolder found: creating bookmark (maybe with bookmark path) from parent: ", targetId, toBeCreatedFolders);
            let parentIdFolder = targetId;
            for (const toBeCreatedFolder of toBeCreatedFolders) {
                const res = yield chrome.bookmarks.create({
                    parentId: parentIdFolder,
                    title: toBeCreatedFolder,
                });
                parentIdFolder = res.id;
            }
            const created = yield chrome.bookmarks.create({
                parentId: parentIdFolder,
                title,
                url,
            });
            (0, logger_1.log)("created bookmark from parent: ", targetId, created);
            return created;
        }
        let parentIdFolder = targetFolder.id;
        for (const toBeCreatedFolder of toBeCreatedFolders) {
            const res = yield chrome.bookmarks.create({
                parentId: parentIdFolder,
                title: toBeCreatedFolder,
            });
            parentIdFolder = res.id;
        }
        return yield chrome.bookmarks.create({
            parentId: parentIdFolder,
            title,
            url,
        });
    });
}
function updateBookmark(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id, folderPath, title, url } = params;
        const [{ parentId }] = yield chrome.bookmarks.get(id);
        if (folderPath === undefined) {
            return yield chrome.bookmarks.update(id, { title, url });
        }
        const folders = folderPath.replace("/", "").split("/").slice(0, -1);
        const { targetFolder, targetId, toBeCreatedFolders } = yield findTargetFolder(folders);
        if (!targetFolder) {
            (0, logger_1.log)("no targetFolder found: updating bookmark (maybe with bookmark path creation) from parent: ", targetId, toBeCreatedFolders);
            yield chrome.bookmarks.update(id, { title, url });
            let parentIdFolder = targetId;
            for (const toBeCreatedFolder of toBeCreatedFolders) {
                const res = yield chrome.bookmarks.create({
                    parentId: parentIdFolder,
                    title: toBeCreatedFolder,
                });
                parentIdFolder = res.id;
            }
            const updated = yield chrome.bookmarks.move(id, {
                parentId: parentIdFolder,
            });
            (0, logger_1.log)("updated bookmark from parent: ", targetId, updated);
            return yield deleteEmptyFolders(parentId);
        }
        let parentIdFolder = targetFolder.id;
        for (const toBeCreatedFolder of toBeCreatedFolders) {
            const newFolder = yield chrome.bookmarks.create({
                parentId: parentIdFolder,
                title: toBeCreatedFolder,
            });
            parentIdFolder = newFolder.id;
        }
        if ((0, utils_1.isDefined)(title) || (0, utils_1.isDefined)(url)) {
            yield chrome.bookmarks.update(id, { title, url });
        }
        yield chrome.bookmarks.move(id, { parentId: parentIdFolder });
        return yield deleteEmptyFolders(parentId);
    });
}
function deleteEmptyFolders(removedBookmarkParentId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (removedBookmarkParentId === undefined) {
            return;
        }
        const [parent] = yield chrome.bookmarks.get(removedBookmarkParentId);
        const children = yield chrome.bookmarks.getChildren(removedBookmarkParentId);
        if (children.length !== 0 ||
            parent.id === constants_1.ROOT_BOOKMARK_ID) {
            return;
        }
        yield chrome.bookmarks.remove(removedBookmarkParentId);
        yield deleteEmptyFolders(parent.parentId);
    });
}
function findTargetFolder(folders) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, logger_1.log)("findTargetFolder for folders: ", folders);
        let targetId = constants_1.ROOT_BOOKMARK_ID;
        let targetFolder = undefined;
        for (const [index, folder] of folders.entries()) {
            let folderFound = false;
            const matches = yield chrome.bookmarks.search({ title: folder });
            (0, logger_1.log)(`got matches for ${folder} :`, matches);
            for (const match of matches) {
                if (match.url === undefined && match.parentId === targetId) {
                    (0, logger_1.log)("Among matches, found exact match", match.id, match.title);
                    folderFound = true;
                    targetId = match.id;
                    targetFolder = match;
                    break;
                }
            }
            if (!folderFound) {
                (0, logger_1.log)("Return with folderFound false :", targetId, targetFolder, folders.slice(index));
                return {
                    targetId,
                    targetFolder,
                    toBeCreatedFolders: folders.slice(index),
                };
            }
        }
        (0, logger_1.log)("Return with folderFound true :", targetId, targetFolder, []);
        return { targetId, targetFolder, toBeCreatedFolders: [] };
    });
}


/***/ }),

/***/ 972:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getBookmarks = void 0;
const constants_1 = __webpack_require__(921);
const logger_1 = __webpack_require__(614);
const response_1 = __webpack_require__(392);
const utils_1 = __webpack_require__(185);
const md5_1 = __importDefault(__webpack_require__(503));
const inMemoryBookmarkMap = new Map();
function getBookmarks(port, { args }) {
    var _a;
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
    const receivedHashMD5 = (_a = receivedParams[2]) !== null && _a !== void 0 ? _a : "";
    chrome.bookmarks
        .getRecent(maxInput ? maxInput : constants_1.MAX_BOOKMARK_COUNT)
        .then((bookmarks) => __awaiter(this, void 0, void 0, function* () {
        const startTime = Date.now();
        const chunkSize = chunkSizeInput ? chunkSizeInput : constants_1.MAX_BOOKMARK_COUNT;
        const chunks = [];
        for (let i = 0; i < bookmarks.length; i += chunkSize) {
            const chunk = bookmarks.slice(i, i + chunkSize);
            chunks.push(chunk);
        }
        const bookmarksProcessedChunks = [];
        for (const chunk of chunks) {
            const bms = yield processChunk(chunk);
            if (receivedHashMD5) {
                bookmarksProcessedChunks.push(bms);
            }
            else {
                port.postMessage(response_1.Response.data(bms));
            }
        }
        if (receivedHashMD5) {
            (0, logger_1.log)((0, md5_1.default)(JSON.stringify(bookmarksProcessedChunks.flat())));
            (0, logger_1.log)("hash received", receivedHashMD5);
            if (receivedHashMD5 === (0, md5_1.default)(JSON.stringify(bookmarksProcessedChunks.flat()))) {
                port.postMessage(response_1.Response.data("bookmarks_synchronized"));
                yield (0, utils_1.delay)(10);
                const endTime = Date.now();
                (0, logger_1.log)(`sending back bookmarks_synchronized in ${endTime - startTime} ms`);
                return port.postMessage(response_1.Response.end());
            }
            else {
                for (const bms of bookmarksProcessedChunks) {
                    yield (0, utils_1.delay)(1);
                    port.postMessage(response_1.Response.data(bms));
                }
            }
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
        for (const p of yield getBmParentTitles(items.filter((item) => (0, utils_1.isDefined)(item.url)))) {
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
                result.complete.push(Object.assign(Object.assign({}, current), { parentPath: "/" }));
            }
            return result;
        };
        const { complete, uncomplete } = bms.reduce(reducer, {
            complete: [],
            uncomplete: [],
        });
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
                    const parents = yield chrome.bookmarks.get(parentId);
                    parent = parents[0];
                    inMemoryBookmarkMap.set(parent.id, parent);
                }
                if (parent &&
                    (parent.parentId === undefined || parent.parentId === constants_1.ROOT_BOOKMARK_ID)) {
                    v.setOk().addParent(parent.title);
                }
                else {
                    v.addParent(parent.title);
                    parentId = parent.parentId;
                }
            }
            for (const bookmark of v.bookmarks) {
                bookmarks.push(Object.assign(Object.assign({}, bookmark), { parentPath: `/${v.parentPath.join("/")}/` }));
            }
            parentIdsMap.delete(key);
        }
        bookmarks.push(...complete);
        const sortPredicate = (a, b) => (a > b ? -1 : 1);
        bookmarks.sort((a, b) => sortPredicate(a.dateAdded || 0, b.dateAdded || 0));
        return bookmarks;
    });
}


/***/ }),

/***/ 357:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

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
exports.updateGroup = exports.getGroups = void 0;
const logger_1 = __webpack_require__(614);
const response_1 = __webpack_require__(392);
const utils_1 = __webpack_require__(185);
function getGroups(port, { command: _cmd }) {
    chrome.tabGroups.query({}).then((groups) => __awaiter(this, void 0, void 0, function* () {
        (0, logger_1.log)("Sending back ", groups.length, " groups");
        port.postMessage(response_1.Response.data(groups));
        yield (0, utils_1.delay)(40);
        return port.postMessage(response_1.Response.end());
    }));
}
exports.getGroups = getGroups;
function updateGroup(port, { args }) {
    if (!args) {
        (0, logger_1.log)("invalid args, received: ", args);
        return port.postMessage(response_1.Response.end());
    }
    const userArgs = args.split(":");
    const groupId = Number.parseInt(userArgs[0]);
    const title = userArgs[1];
    const color = userArgs[2];
    const userProvidedCollapsed = userArgs[3];
    const collapsed = userProvidedCollapsed === "none"
        ? undefined
        : userProvidedCollapsed === "true"
            ? true
            : false;
    chrome.tabGroups.update(groupId, {
        collapsed: collapsed,
        color: color ? color : undefined,
        title: title ? title : undefined
    }).then((group) => __awaiter(this, void 0, void 0, function* () {
        (0, logger_1.log)("Updated group ", JSON.stringify(group));
        return port.postMessage(response_1.Response.end());
    }));
}
exports.updateGroup = updateGroup;


/***/ }),

/***/ 677:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

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
exports.deleteHistory = exports.getHistory = void 0;
const logger_1 = __webpack_require__(614);
const response_1 = __webpack_require__(392);
const constants_1 = __webpack_require__(921);
const utils_1 = __webpack_require__(185);
function getHistory(port, { args }) {
    if (!args) {
        (0, logger_1.log)("missing args in get-history");
        return port.postMessage(response_1.Response.end());
    }
    const receivedParams = args.split(":");
    if (receivedParams.length < 2) {
        (0, logger_1.log)(`invalid args in get-history: received ${args}, expected a string combining two integers like "0:0"`);
        return port.postMessage(response_1.Response.end());
    }
    const maxInput = parseInt(receivedParams[0]);
    const chunkSizeInput = parseInt(receivedParams[1]);
    (0, logger_1.log)(`chunkSize ${chunkSizeInput}`);
    (0, logger_1.log)(`maxInput ${maxInput}`);
    chrome.history
        .search({
        text: "",
        startTime: 0,
        maxResults: maxInput ? maxInput : constants_1.MAX_HISTORY_ITEMS_COUNT,
    })
        .then((historyItems) => __awaiter(this, void 0, void 0, function* () {
        (0, logger_1.log)(`got ${historyItems.length} history items \n ${JSON.stringify(historyItems)}`);
        const startTime = Date.now();
        const chunkSize = chunkSizeInput
            ? chunkSizeInput
            : constants_1.MAX_HISTORY_ITEMS_COUNT;
        const chunks = [];
        for (let i = 0; i < historyItems.length; i += chunkSize) {
            const chunk = historyItems.slice(i, i + chunkSize);
            chunks.push(chunk);
        }
        for (const chunk of chunks) {
            const items = chunk.map((item) => {
                var _a, _b, _c, _d;
                return ({
                    id: item.id,
                    title: (_a = item.title) !== null && _a !== void 0 ? _a : "missing title",
                    url: (_b = item.url) !== null && _b !== void 0 ? _b : "https://developer.mozilla.org",
                    tc: (_c = item.typedCount) !== null && _c !== void 0 ? _c : 0,
                    vc: (_d = item.visitCount) !== null && _d !== void 0 ? _d : 0,
                    t: item.lastVisitTime ? Math.round(item.lastVisitTime) : 0,
                });
            });
            port.postMessage(response_1.Response.data(items));
        }
        const endTime = Date.now();
        (0, logger_1.log)(`sending back historyItems in ${endTime - startTime} ms`);
        yield (0, utils_1.delay)(100);
        return port.postMessage(response_1.Response.end());
    }));
}
exports.getHistory = getHistory;
function deleteHistory(port, { args }) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if (!args) {
            (0, logger_1.log)("missing args in delete-history");
            return port.postMessage(response_1.Response.end());
        }
        const startTime = Date.now();
        try {
            if (args === "all") {
                yield chrome.history.deleteAll();
                const endTime = Date.now();
                (0, logger_1.log)(`Deleted all history in ${endTime - startTime} ms`);
                return port.postMessage(response_1.Response.end());
            }
            const url = args;
            yield chrome.history.deleteUrl({ url });
            const endTime = Date.now();
            (0, logger_1.log)(`Deleted history for url ${url} in ${endTime - startTime} ms`);
            return port.postMessage(response_1.Response.end());
        }
        catch (e) {
            const endTime = Date.now();
            (0, logger_1.log)(`error in deleteHistory in ${endTime - startTime} ms`, e);
            port.postMessage(response_1.Response.data(`[Error] ${(_a = e.message) !== null && _a !== void 0 ? _a : e.toString()}`));
            yield (0, utils_1.delay)(10);
            return port.postMessage(response_1.Response.end());
        }
    });
}
exports.deleteHistory = deleteHistory;


/***/ }),

/***/ 721:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

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
exports.updateTabs = exports.closeTabs = exports.switchToTab = exports.getTabs = exports.getRecentlyClosedTabs = exports.duplicateTab = exports.newTab = exports.newGroupTab = void 0;
const logger_1 = __webpack_require__(614);
const response_1 = __webpack_require__(392);
const utils_1 = __webpack_require__(185);
function newGroupTab(port, { args }) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const startTime = Date.now();
        if (!args) {
            (0, logger_1.log)("missing args in new group tab");
            return port.postMessage(response_1.Response.end());
        }
        try {
            const userArgs = args.split(":");
            if (userArgs.length !== 4) {
                (0, logger_1.log)("missing some args in new group tab");
                return port.postMessage(response_1.Response.end());
            }
            (0, logger_1.log)(`Starting newGroupTab with args ${userArgs}`);
            const tabId = Number(userArgs[0]);
            const windowId = userArgs[1] !== "-1" ? Number(userArgs[1]) : undefined;
            const groupTitle = userArgs[2];
            const groupColor = userArgs[3];
            const groupId = yield chrome.tabs.group({ createProperties: { windowId }, tabIds: [tabId] });
            if (groupTitle !== "" || groupColor !== "") {
                yield chrome.tabGroups.update(groupId, { title: groupTitle || undefined, color: (groupColor || undefined) });
            }
            (0, logger_1.log)(`Sending back a new group Id ${groupId} for tab ${windowId}:${tabId}`);
            port.postMessage(response_1.Response.data(`${groupId}`));
            const endTime = Date.now();
            (0, logger_1.log)(`ending newGroupTab in ${endTime - startTime} ms`);
            yield (0, utils_1.delay)(10);
            return port.postMessage(response_1.Response.end());
        }
        catch (e) {
            const endTime = Date.now();
            port.postMessage(response_1.Response.data(`[Error] ${(_a = e.message) !== null && _a !== void 0 ? _a : e.toString()}`));
            (0, logger_1.log)(`ending newGroupTab in ${endTime - startTime} ms`);
            yield (0, utils_1.delay)(10);
            return port.postMessage(response_1.Response.end());
        }
    });
}
exports.newGroupTab = newGroupTab;
function newTab(port, { args }) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!args) {
            (0, logger_1.log)("open empty tab");
            yield chrome.tabs.create({});
            return port.postMessage(response_1.Response.end());
        }
        try {
            const url = new URL(args);
            (0, logger_1.log)("open tab at url: ", url);
            yield chrome.tabs.create({ url: url.toString() });
        }
        catch (_) {
            const url = `https://www.google.com/search?q=${encodeURIComponent(args)}`;
            (0, logger_1.log)("open google tab");
            yield chrome.tabs.create({ url });
        }
        return port.postMessage(response_1.Response.end());
    });
}
exports.newTab = newTab;
function duplicateTab(port, { args }) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        if (!args) {
            (0, logger_1.log)("missing args in duplicate-tab");
            return port.postMessage(response_1.Response.end());
        }
        let windowId = undefined;
        let tabIndex = undefined;
        let isTabPinned = undefined;
        try {
            const userArgs = args.split(":");
            const tabId = Number(userArgs[0]);
            windowId = userArgs[1] !== "-1" ? Number(userArgs[1]) : undefined;
            const tab = yield chrome.tabs.get(tabId);
            tabIndex = tab.index;
            isTabPinned = tab.pinned;
            (0, logger_1.log)("duplicating tab: ", JSON.stringify(tab));
            const newTab = yield chrome.tabs.create({
                active: false,
                windowId: windowId,
                url: tab.url,
                pinned: tab.pinned,
                index: tab.index + 1
            });
            (0, logger_1.log)("duplicated tab: ", JSON.stringify(newTab));
            const response = [{
                    id: newTab.id,
                    windowId: newTab.windowId,
                    title: tab.title,
                    pinned: newTab.pinned,
                    url: tab.url,
                    active: newTab.active,
                    domain: tab.url ? new URL(tab.url).hostname : "",
                    lastAccessed: 0,
                    index: (_a = newTab.index) !== null && _a !== void 0 ? _a : 0,
                    groupId: (_b = newTab.groupId) !== null && _b !== void 0 ? _b : -1,
                }];
            port.postMessage(response_1.Response.data(response));
        }
        catch (e) {
            (0, logger_1.log)("error while duplicating tab", JSON.stringify(e));
            const tab = yield chrome.tabs.create({
                active: false,
                windowId,
                index: tabIndex !== undefined ? tabIndex + 1 : undefined,
                pinned: isTabPinned,
            });
            (0, logger_1.log)("defaults to creating a new empty tab");
            const response = [{
                    id: tab.id,
                    windowId: tab.windowId,
                    title: tab.title,
                    pinned: tab.pinned,
                    url: tab.url,
                    active: tab.active,
                    domain: tab.url ? new URL(tab.url).hostname : "",
                    lastAccessed: 0,
                    index: (_c = tab.index) !== null && _c !== void 0 ? _c : 0,
                    groupId: (_d = tab.groupId) !== null && _d !== void 0 ? _d : -1,
                }];
            port.postMessage(response_1.Response.data(response));
        }
        yield (0, utils_1.delay)(10);
        return port.postMessage(response_1.Response.end());
    });
}
exports.duplicateTab = duplicateTab;
function getRecentlyClosedTabs(port, { command: _cmd }) {
    chrome.sessions
        .getRecentlyClosed()
        .then((sessions) => __awaiter(this, void 0, void 0, function* () {
        const sessionTabs = sessions
            .sort((s1, s2) => s2.lastModified - s1.lastModified)
            .filter((session) => session.tab)
            .map((i) => i.tab)
            .filter((t) => !!t);
        (0, logger_1.log)("Sending back ", sessionTabs.length, " recently closed tabs");
        const tabs = sessionTabs.map((tab) => {
            var _a, _b;
            return ({
                id: tab.lastAccessed ? Math.round(tab.lastAccessed) : Math.floor(Math.random() * 1000),
                windowId: tab.windowId,
                groupId: (_a = tab.groupId) !== null && _a !== void 0 ? _a : -1,
                title: tab.title,
                pinned: tab.pinned,
                url: tab.url,
                active: tab.active,
                domain: tab.url ? new URL(tab.url).hostname : "",
                lastAccessed: tab.lastAccessed ? Math.round(tab.lastAccessed) : 0,
                index: (_b = tab.index) !== null && _b !== void 0 ? _b : 0,
            });
        });
        port.postMessage(response_1.Response.data(tabs));
        yield (0, utils_1.delay)(100);
        return port.postMessage(response_1.Response.end());
    }));
}
exports.getRecentlyClosedTabs = getRecentlyClosedTabs;
function getTabs(port, { command: _cmd, args }) {
    chrome.tabs.query({}).then((chromeTabs) => __awaiter(this, void 0, void 0, function* () {
        let returnedTabs = chromeTabs.slice();
        if (args === "latest-10-first") {
            chromeTabs.sort((a, b) => b.lastAccessed - a.lastAccessed);
            const firstOrderedTabs = chromeTabs.slice(0, 10);
            returnedTabs = [
                ...firstOrderedTabs,
                ...returnedTabs.filter((t) => !firstOrderedTabs.includes(t)),
            ];
        }
        (0, logger_1.log)("Sending back ", returnedTabs.length, " tabs");
        const tabs = returnedTabs.map((tab) => {
            var _a;
            return ({
                id: tab.id,
                windowId: tab.windowId,
                groupId: (_a = tab.groupId) !== null && _a !== void 0 ? _a : -1,
                title: tab.title,
                pinned: tab.pinned,
                url: tab.url,
                active: tab.active,
                domain: tab.url ? new URL(tab.url).hostname : "",
                lastAccessed: tab.lastAccessed ? Math.round(tab.lastAccessed) : 0,
                index: tab.index,
            });
        });
        port.postMessage(response_1.Response.data(tabs));
        yield (0, utils_1.delay)(40);
        return port.postMessage(response_1.Response.end());
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
    chrome.tabs.query({ windowId }).then((tabs) => {
        for (let tab of tabs) {
            if (tab.id === tabId) {
                (0, logger_1.log)("found tab to switch to", tab);
                chrome.tabs.update(tab.id, { active: true });
                break;
            }
        }
    });
    return port.postMessage(response_1.Response.end());
}
exports.switchToTab = switchToTab;
function closeTabs(port, { args }) {
    if (!args) {
        (0, logger_1.log)("invalid args, received: ", args);
        return port.postMessage(response_1.Response.end());
    }
    const tabToCloseIds = [];
    const tabIds = args.split(",");
    chrome.tabs.query({}).then((tabs) => {
        for (let tab of tabs) {
            if (!tab.id)
                continue;
            if (tabIds.some((id) => `${tab.windowId}:${tab.id}` === id)) {
                (0, logger_1.log)("found tab to close", tab);
                tabToCloseIds.push(tab.id);
            }
        }
        (0, logger_1.log)("closing tabs", tabToCloseIds);
        chrome.tabs.remove(tabToCloseIds);
    });
    return port.postMessage(response_1.Response.end());
}
exports.closeTabs = closeTabs;
function updateTabs(port, { args }) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!args) {
            (0, logger_1.log)("invalid args, received: ", args);
            return port.postMessage(response_1.Response.end());
        }
        const userArgs = args.split(":");
        const tabId = Number.parseInt(userArgs[0]);
        const windowId = Number.parseInt(userArgs[1]);
        const tabIndex = Number.parseInt(userArgs[2]);
        const groupId = Number.parseInt(userArgs[3]);
        const userProvidedPin = userArgs[4];
        const shouldBeUngrouped = userArgs[5];
        if (userProvidedPin === 'true') {
            yield chrome.tabs.update(tabId, { pinned: true });
            (0, logger_1.log)("successfully pinned tab ", tabId);
        }
        if (userProvidedPin === 'false') {
            yield chrome.tabs.update(tabId, { pinned: false });
            (0, logger_1.log)("successfully unpinned tab ", tabId);
        }
        if (groupId !== -2) {
            if (groupId === -1) {
                yield chrome.tabs.ungroup([tabId]);
            }
            else {
                yield chrome.tabs.group({ tabIds: [tabId], groupId });
            }
        }
        if (tabIndex !== -2) {
            const movedTabResponse = yield chrome.tabs.move(tabId, { index: tabIndex, windowId: windowId });
            (0, logger_1.log)(`successfully moved tab ${windowId}:${tabId} to index ${tabIndex}`);
            if (shouldBeUngrouped === 'true') {
                let movedTab;
                if (Array.isArray(movedTabResponse)) {
                    movedTab = movedTabResponse[0];
                    if (movedTab)
                        yield chrome.tabs.ungroup(movedTab.id);
                }
                else {
                    movedTab = movedTabResponse;
                    yield chrome.tabs.ungroup(movedTab.id);
                }
            }
        }
        return port.postMessage(response_1.Response.end());
    });
}
exports.updateTabs = updateTabs;


/***/ }),

/***/ 185:
/***/ (function(__unused_webpack_module, exports) {

"use strict";

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
exports.isDefined = exports.delay = void 0;
function delay(milliSeconds) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => setTimeout(resolve, milliSeconds));
    });
}
exports.delay = delay;
function isDefined(input) {
    return input !== undefined;
}
exports.isDefined = isDefined;


/***/ }),

/***/ 415:
/***/ ((module) => {

"use strict";

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  BASE64_REGEX: () => BASE64_REGEX,
  BIC_REGEX: () => BIC_REGEX,
  CUID2_REGEX: () => CUID2_REGEX,
  DECIMAL_REGEX: () => DECIMAL_REGEX,
  DIGITS_REGEX: () => DIGITS_REGEX,
  EMAIL_REGEX: () => EMAIL_REGEX,
  EMOJI_REGEX: () => EMOJI_REGEX,
  HEXADECIMAL_REGEX: () => HEXADECIMAL_REGEX,
  HEX_COLOR_REGEX: () => HEX_COLOR_REGEX,
  IMEI_REGEX: () => IMEI_REGEX,
  IPV4_REGEX: () => IPV4_REGEX,
  IPV6_REGEX: () => IPV6_REGEX,
  IP_REGEX: () => IP_REGEX,
  ISO_DATE_REGEX: () => ISO_DATE_REGEX,
  ISO_DATE_TIME_REGEX: () => ISO_DATE_TIME_REGEX,
  ISO_TIMESTAMP_REGEX: () => ISO_TIMESTAMP_REGEX,
  ISO_TIME_REGEX: () => ISO_TIME_REGEX,
  ISO_TIME_SECOND_REGEX: () => ISO_TIME_SECOND_REGEX,
  ISO_WEEK_REGEX: () => ISO_WEEK_REGEX,
  MAC48_REGEX: () => MAC48_REGEX,
  MAC64_REGEX: () => MAC64_REGEX,
  MAC_REGEX: () => MAC_REGEX,
  NANO_ID_REGEX: () => NANO_ID_REGEX,
  OCTAL_REGEX: () => OCTAL_REGEX,
  RFC_EMAIL_REGEX: () => RFC_EMAIL_REGEX,
  SLUG_REGEX: () => SLUG_REGEX,
  ULID_REGEX: () => ULID_REGEX,
  UUID_REGEX: () => UUID_REGEX,
  ValiError: () => ValiError,
  _addIssue: () => _addIssue,
  _getByteCount: () => _getByteCount,
  _getGraphemeCount: () => _getGraphemeCount,
  _getLastMetadata: () => _getLastMetadata,
  _getStandardProps: () => _getStandardProps,
  _getWordCount: () => _getWordCount,
  _isLuhnAlgo: () => _isLuhnAlgo,
  _isValidObjectKey: () => _isValidObjectKey,
  _joinExpects: () => _joinExpects,
  _stringify: () => _stringify,
  any: () => any,
  args: () => args,
  argsAsync: () => argsAsync,
  array: () => array,
  arrayAsync: () => arrayAsync,
  assert: () => assert,
  awaitAsync: () => awaitAsync,
  base64: () => base64,
  bic: () => bic,
  bigint: () => bigint,
  blob: () => blob,
  boolean: () => boolean,
  brand: () => brand,
  bytes: () => bytes,
  check: () => check,
  checkAsync: () => checkAsync,
  checkItems: () => checkItems,
  checkItemsAsync: () => checkItemsAsync,
  config: () => config,
  creditCard: () => creditCard,
  cuid2: () => cuid2,
  custom: () => custom,
  customAsync: () => customAsync,
  date: () => date,
  decimal: () => decimal,
  deleteGlobalConfig: () => deleteGlobalConfig,
  deleteGlobalMessage: () => deleteGlobalMessage,
  deleteSchemaMessage: () => deleteSchemaMessage,
  deleteSpecificMessage: () => deleteSpecificMessage,
  description: () => description,
  digits: () => digits,
  email: () => email,
  emoji: () => emoji,
  empty: () => empty,
  endsWith: () => endsWith,
  entries: () => entries,
  entriesFromList: () => entriesFromList,
  entriesFromObjects: () => entriesFromObjects,
  enum: () => enum_,
  enum_: () => enum_,
  everyItem: () => everyItem,
  exactOptional: () => exactOptional,
  exactOptionalAsync: () => exactOptionalAsync,
  excludes: () => excludes,
  fallback: () => fallback,
  fallbackAsync: () => fallbackAsync,
  file: () => file,
  filterItems: () => filterItems,
  findItem: () => findItem,
  finite: () => finite,
  flatten: () => flatten,
  flavor: () => flavor,
  forward: () => forward,
  forwardAsync: () => forwardAsync,
  function: () => function_,
  function_: () => function_,
  getDefault: () => getDefault,
  getDefaults: () => getDefaults,
  getDefaultsAsync: () => getDefaultsAsync,
  getDescription: () => getDescription,
  getDotPath: () => getDotPath,
  getFallback: () => getFallback,
  getFallbacks: () => getFallbacks,
  getFallbacksAsync: () => getFallbacksAsync,
  getGlobalConfig: () => getGlobalConfig,
  getGlobalMessage: () => getGlobalMessage,
  getMetadata: () => getMetadata,
  getSchemaMessage: () => getSchemaMessage,
  getSpecificMessage: () => getSpecificMessage,
  getTitle: () => getTitle,
  graphemes: () => graphemes,
  gtValue: () => gtValue,
  hash: () => hash,
  hexColor: () => hexColor,
  hexadecimal: () => hexadecimal,
  imei: () => imei,
  includes: () => includes,
  instance: () => instance,
  integer: () => integer,
  intersect: () => intersect,
  intersectAsync: () => intersectAsync,
  ip: () => ip,
  ipv4: () => ipv4,
  ipv6: () => ipv6,
  is: () => is,
  isOfKind: () => isOfKind,
  isOfType: () => isOfType,
  isValiError: () => isValiError,
  isoDate: () => isoDate,
  isoDateTime: () => isoDateTime,
  isoTime: () => isoTime,
  isoTimeSecond: () => isoTimeSecond,
  isoTimestamp: () => isoTimestamp,
  isoWeek: () => isoWeek,
  keyof: () => keyof,
  lazy: () => lazy,
  lazyAsync: () => lazyAsync,
  length: () => length,
  literal: () => literal,
  looseObject: () => looseObject,
  looseObjectAsync: () => looseObjectAsync,
  looseTuple: () => looseTuple,
  looseTupleAsync: () => looseTupleAsync,
  ltValue: () => ltValue,
  mac: () => mac,
  mac48: () => mac48,
  mac64: () => mac64,
  map: () => map,
  mapAsync: () => mapAsync,
  mapItems: () => mapItems,
  maxBytes: () => maxBytes,
  maxEntries: () => maxEntries,
  maxGraphemes: () => maxGraphemes,
  maxLength: () => maxLength,
  maxSize: () => maxSize,
  maxValue: () => maxValue,
  maxWords: () => maxWords,
  message: () => message,
  metadata: () => metadata,
  mimeType: () => mimeType,
  minBytes: () => minBytes,
  minEntries: () => minEntries,
  minGraphemes: () => minGraphemes,
  minLength: () => minLength,
  minSize: () => minSize,
  minValue: () => minValue,
  minWords: () => minWords,
  multipleOf: () => multipleOf,
  nan: () => nan,
  nanoid: () => nanoid,
  never: () => never,
  nonEmpty: () => nonEmpty,
  nonNullable: () => nonNullable,
  nonNullableAsync: () => nonNullableAsync,
  nonNullish: () => nonNullish,
  nonNullishAsync: () => nonNullishAsync,
  nonOptional: () => nonOptional,
  nonOptionalAsync: () => nonOptionalAsync,
  normalize: () => normalize,
  notBytes: () => notBytes,
  notEntries: () => notEntries,
  notGraphemes: () => notGraphemes,
  notLength: () => notLength,
  notSize: () => notSize,
  notValue: () => notValue,
  notValues: () => notValues,
  notWords: () => notWords,
  null: () => null_,
  null_: () => null_,
  nullable: () => nullable,
  nullableAsync: () => nullableAsync,
  nullish: () => nullish,
  nullishAsync: () => nullishAsync,
  number: () => number,
  object: () => object,
  objectAsync: () => objectAsync,
  objectWithRest: () => objectWithRest,
  objectWithRestAsync: () => objectWithRestAsync,
  octal: () => octal,
  omit: () => omit,
  optional: () => optional,
  optionalAsync: () => optionalAsync,
  parse: () => parse,
  parseAsync: () => parseAsync,
  parseJson: () => parseJson,
  parser: () => parser,
  parserAsync: () => parserAsync,
  partial: () => partial,
  partialAsync: () => partialAsync,
  partialCheck: () => partialCheck,
  partialCheckAsync: () => partialCheckAsync,
  pick: () => pick,
  picklist: () => picklist,
  pipe: () => pipe,
  pipeAsync: () => pipeAsync,
  promise: () => promise,
  rawCheck: () => rawCheck,
  rawCheckAsync: () => rawCheckAsync,
  rawTransform: () => rawTransform,
  rawTransformAsync: () => rawTransformAsync,
  readonly: () => readonly,
  record: () => record,
  recordAsync: () => recordAsync,
  reduceItems: () => reduceItems,
  regex: () => regex,
  required: () => required,
  requiredAsync: () => requiredAsync,
  returns: () => returns,
  returnsAsync: () => returnsAsync,
  rfcEmail: () => rfcEmail,
  safeInteger: () => safeInteger,
  safeParse: () => safeParse,
  safeParseAsync: () => safeParseAsync,
  safeParser: () => safeParser,
  safeParserAsync: () => safeParserAsync,
  set: () => set,
  setAsync: () => setAsync,
  setGlobalConfig: () => setGlobalConfig,
  setGlobalMessage: () => setGlobalMessage,
  setSchemaMessage: () => setSchemaMessage,
  setSpecificMessage: () => setSpecificMessage,
  size: () => size,
  slug: () => slug,
  someItem: () => someItem,
  sortItems: () => sortItems,
  startsWith: () => startsWith,
  strictObject: () => strictObject,
  strictObjectAsync: () => strictObjectAsync,
  strictTuple: () => strictTuple,
  strictTupleAsync: () => strictTupleAsync,
  string: () => string,
  stringifyJson: () => stringifyJson,
  summarize: () => summarize,
  symbol: () => symbol,
  title: () => title,
  toLowerCase: () => toLowerCase,
  toMaxValue: () => toMaxValue,
  toMinValue: () => toMinValue,
  toUpperCase: () => toUpperCase,
  transform: () => transform,
  transformAsync: () => transformAsync,
  trim: () => trim,
  trimEnd: () => trimEnd,
  trimStart: () => trimStart,
  tuple: () => tuple,
  tupleAsync: () => tupleAsync,
  tupleWithRest: () => tupleWithRest,
  tupleWithRestAsync: () => tupleWithRestAsync,
  ulid: () => ulid,
  undefined: () => undefined_,
  undefined_: () => undefined_,
  undefinedable: () => undefinedable,
  undefinedableAsync: () => undefinedableAsync,
  union: () => union,
  unionAsync: () => unionAsync,
  unknown: () => unknown,
  unwrap: () => unwrap,
  url: () => url,
  uuid: () => uuid,
  value: () => value,
  values: () => values,
  variant: () => variant,
  variantAsync: () => variantAsync,
  void: () => void_,
  void_: () => void_,
  words: () => words
});
module.exports = __toCommonJS(index_exports);

// src/storages/globalConfig/globalConfig.ts
var store;
function setGlobalConfig(config2) {
  store = { ...store, ...config2 };
}
// @__NO_SIDE_EFFECTS__
function getGlobalConfig(config2) {
  return {
    lang: config2?.lang ?? store?.lang,
    message: config2?.message,
    abortEarly: config2?.abortEarly ?? store?.abortEarly,
    abortPipeEarly: config2?.abortPipeEarly ?? store?.abortPipeEarly
  };
}
function deleteGlobalConfig() {
  store = void 0;
}

// src/storages/globalMessage/globalMessage.ts
var store2;
function setGlobalMessage(message2, lang) {
  if (!store2) store2 = /* @__PURE__ */ new Map();
  store2.set(lang, message2);
}
// @__NO_SIDE_EFFECTS__
function getGlobalMessage(lang) {
  return store2?.get(lang);
}
function deleteGlobalMessage(lang) {
  store2?.delete(lang);
}

// src/storages/schemaMessage/schemaMessage.ts
var store3;
function setSchemaMessage(message2, lang) {
  if (!store3) store3 = /* @__PURE__ */ new Map();
  store3.set(lang, message2);
}
// @__NO_SIDE_EFFECTS__
function getSchemaMessage(lang) {
  return store3?.get(lang);
}
function deleteSchemaMessage(lang) {
  store3?.delete(lang);
}

// src/storages/specificMessage/specificMessage.ts
var store4;
function setSpecificMessage(reference, message2, lang) {
  if (!store4) store4 = /* @__PURE__ */ new Map();
  if (!store4.get(reference)) store4.set(reference, /* @__PURE__ */ new Map());
  store4.get(reference).set(lang, message2);
}
// @__NO_SIDE_EFFECTS__
function getSpecificMessage(reference, lang) {
  return store4?.get(reference)?.get(lang);
}
function deleteSpecificMessage(reference, lang) {
  store4?.get(reference)?.delete(lang);
}

// src/utils/_stringify/_stringify.ts
// @__NO_SIDE_EFFECTS__
function _stringify(input) {
  const type = typeof input;
  if (type === "string") {
    return `"${input}"`;
  }
  if (type === "number" || type === "bigint" || type === "boolean") {
    return `${input}`;
  }
  if (type === "object" || type === "function") {
    return (input && Object.getPrototypeOf(input)?.constructor?.name) ?? "null";
  }
  return type;
}

// src/utils/_addIssue/_addIssue.ts
function _addIssue(context, label, dataset, config2, other) {
  const input = other && "input" in other ? other.input : dataset.value;
  const expected = other?.expected ?? context.expects ?? null;
  const received = other?.received ?? _stringify(input);
  const issue = {
    kind: context.kind,
    type: context.type,
    input,
    expected,
    received,
    message: `Invalid ${label}: ${expected ? `Expected ${expected} but r` : "R"}eceived ${received}`,
    requirement: context.requirement,
    path: other?.path,
    issues: other?.issues,
    lang: config2.lang,
    abortEarly: config2.abortEarly,
    abortPipeEarly: config2.abortPipeEarly
  };
  const isSchema = context.kind === "schema";
  const message2 = other?.message ?? context.message ?? getSpecificMessage(context.reference, issue.lang) ?? (isSchema ? getSchemaMessage(issue.lang) : null) ?? config2.message ?? getGlobalMessage(issue.lang);
  if (message2 !== void 0) {
    issue.message = typeof message2 === "function" ? (
      // @ts-expect-error
      message2(issue)
    ) : message2;
  }
  if (isSchema) {
    dataset.typed = false;
  }
  if (dataset.issues) {
    dataset.issues.push(issue);
  } else {
    dataset.issues = [issue];
  }
}

// src/utils/_getByteCount/_getByteCount.ts
var textEncoder;
// @__NO_SIDE_EFFECTS__
function _getByteCount(input) {
  if (!textEncoder) {
    textEncoder = new TextEncoder();
  }
  return textEncoder.encode(input).length;
}

// src/utils/_getGraphemeCount/_getGraphemeCount.ts
var segmenter;
// @__NO_SIDE_EFFECTS__
function _getGraphemeCount(input) {
  if (!segmenter) {
    segmenter = new Intl.Segmenter();
  }
  const segments = segmenter.segment(input);
  let count = 0;
  for (const _ of segments) {
    count++;
  }
  return count;
}

// src/utils/_getLastMetadata/_getLastMetadata.ts
// @__NO_SIDE_EFFECTS__
function _getLastMetadata(schema, type) {
  if ("pipe" in schema) {
    const nestedSchemas = [];
    for (let index = schema.pipe.length - 1; index >= 0; index--) {
      const item = schema.pipe[index];
      if (item.kind === "schema" && "pipe" in item) {
        nestedSchemas.push(item);
      } else if (item.kind === "metadata" && item.type === type) {
        return item[type];
      }
    }
    for (const nestedSchema of nestedSchemas) {
      const result = /* @__PURE__ */ _getLastMetadata(nestedSchema, type);
      if (result !== void 0) {
        return result;
      }
    }
  }
}

// src/utils/_getStandardProps/_getStandardProps.ts
// @__NO_SIDE_EFFECTS__
function _getStandardProps(context) {
  return {
    version: 1,
    vendor: "valibot",
    validate(value2) {
      return context["~run"]({ value: value2 }, getGlobalConfig());
    }
  };
}

// src/utils/_getWordCount/_getWordCount.ts
var store5;
// @__NO_SIDE_EFFECTS__
function _getWordCount(locales, input) {
  if (!store5) {
    store5 = /* @__PURE__ */ new Map();
  }
  if (!store5.get(locales)) {
    store5.set(locales, new Intl.Segmenter(locales, { granularity: "word" }));
  }
  const segments = store5.get(locales).segment(input);
  let count = 0;
  for (const segment of segments) {
    if (segment.isWordLike) {
      count++;
    }
  }
  return count;
}

// src/utils/_isLuhnAlgo/_isLuhnAlgo.ts
var NON_DIGIT_REGEX = /\D/gu;
// @__NO_SIDE_EFFECTS__
function _isLuhnAlgo(input) {
  const number2 = input.replace(NON_DIGIT_REGEX, "");
  let length2 = number2.length;
  let bit = 1;
  let sum = 0;
  while (length2) {
    const value2 = +number2[--length2];
    bit ^= 1;
    sum += bit ? [0, 2, 4, 6, 8, 1, 3, 5, 7, 9][value2] : value2;
  }
  return sum % 10 === 0;
}

// src/utils/_isValidObjectKey/_isValidObjectKey.ts
// @__NO_SIDE_EFFECTS__
function _isValidObjectKey(object2, key) {
  return Object.hasOwn(object2, key) && key !== "__proto__" && key !== "prototype" && key !== "constructor";
}

// src/utils/_joinExpects/_joinExpects.ts
// @__NO_SIDE_EFFECTS__
function _joinExpects(values2, separator) {
  const list = [...new Set(values2)];
  if (list.length > 1) {
    return `(${list.join(` ${separator} `)})`;
  }
  return list[0] ?? "never";
}

// src/utils/entriesFromList/entriesFromList.ts
// @__NO_SIDE_EFFECTS__
function entriesFromList(list, schema) {
  const entries2 = {};
  for (const key of list) {
    entries2[key] = schema;
  }
  return entries2;
}

// src/utils/entriesFromObjects/entriesFromObjects.ts
// @__NO_SIDE_EFFECTS__
function entriesFromObjects(schemas) {
  const entries2 = {};
  for (const schema of schemas) {
    Object.assign(entries2, schema.entries);
  }
  return entries2;
}

// src/utils/getDotPath/getDotPath.ts
// @__NO_SIDE_EFFECTS__
function getDotPath(issue) {
  if (issue.path) {
    let key = "";
    for (const item of issue.path) {
      if (typeof item.key === "string" || typeof item.key === "number") {
        if (key) {
          key += `.${item.key}`;
        } else {
          key += item.key;
        }
      } else {
        return null;
      }
    }
    return key;
  }
  return null;
}

// src/utils/isOfKind/isOfKind.ts
// @__NO_SIDE_EFFECTS__
function isOfKind(kind, object2) {
  return object2.kind === kind;
}

// src/utils/isOfType/isOfType.ts
// @__NO_SIDE_EFFECTS__
function isOfType(type, object2) {
  return object2.type === type;
}

// src/utils/isValiError/isValiError.ts
// @__NO_SIDE_EFFECTS__
function isValiError(error) {
  return error instanceof ValiError;
}

// src/utils/ValiError/ValiError.ts
var ValiError = class extends Error {
  /**
   * Creates a Valibot error with useful information.
   *
   * @param issues The error issues.
   */
  constructor(issues) {
    super(issues[0].message);
    this.name = "ValiError";
    this.issues = issues;
  }
};

// src/actions/args/args.ts
// @__NO_SIDE_EFFECTS__
function args(schema) {
  return {
    kind: "transformation",
    type: "args",
    reference: args,
    async: false,
    schema,
    "~run"(dataset, config2) {
      const func = dataset.value;
      dataset.value = (...args_) => {
        const argsDataset = this.schema["~run"]({ value: args_ }, config2);
        if (argsDataset.issues) {
          throw new ValiError(argsDataset.issues);
        }
        return func(...argsDataset.value);
      };
      return dataset;
    }
  };
}

// src/actions/args/argsAsync.ts
// @__NO_SIDE_EFFECTS__
function argsAsync(schema) {
  return {
    kind: "transformation",
    type: "args",
    reference: argsAsync,
    async: false,
    schema,
    "~run"(dataset, config2) {
      const func = dataset.value;
      dataset.value = async (...args2) => {
        const argsDataset = await schema["~run"]({ value: args2 }, config2);
        if (argsDataset.issues) {
          throw new ValiError(argsDataset.issues);
        }
        return func(...argsDataset.value);
      };
      return dataset;
    }
  };
}

// src/actions/await/awaitAsync.ts
// @__NO_SIDE_EFFECTS__
function awaitAsync() {
  return {
    kind: "transformation",
    type: "await",
    reference: awaitAsync,
    async: true,
    async "~run"(dataset) {
      dataset.value = await dataset.value;
      return dataset;
    }
  };
}

// src/regex.ts
var BASE64_REGEX = /^(?:[\da-z+/]{4})*(?:[\da-z+/]{2}==|[\da-z+/]{3}=)?$/iu;
var BIC_REGEX = /^[A-Z]{6}(?!00)[\dA-Z]{2}(?:[\dA-Z]{3})?$/u;
var CUID2_REGEX = /^[a-z][\da-z]*$/u;
var DECIMAL_REGEX = /^[+-]?(?:\d*\.)?\d+$/u;
var DIGITS_REGEX = /^\d+$/u;
var EMAIL_REGEX = /^[\w+-]+(?:\.[\w+-]+)*@[\da-z]+(?:[.-][\da-z]+)*\.[a-z]{2,}$/iu;
var EMOJI_REGEX = (
  // eslint-disable-next-line redos-detector/no-unsafe-regex, regexp/no-dupe-disjunctions -- false positives
  /^(?:[\u{1F1E6}-\u{1F1FF}]{2}|\u{1F3F4}[\u{E0061}-\u{E007A}]{2}[\u{E0030}-\u{E0039}\u{E0061}-\u{E007A}]{1,3}\u{E007F}|(?:\p{Emoji}\uFE0F\u20E3?|\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Emoji_Presentation})(?:\u200D(?:\p{Emoji}\uFE0F\u20E3?|\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Emoji_Presentation}))*)+$/u
);
var HEXADECIMAL_REGEX = /^(?:0[hx])?[\da-fA-F]+$/u;
var HEX_COLOR_REGEX = /^#(?:[\da-fA-F]{3,4}|[\da-fA-F]{6}|[\da-fA-F]{8})$/u;
var IMEI_REGEX = /^\d{15}$|^\d{2}-\d{6}-\d{6}-\d$/u;
var IPV4_REGEX = (
  // eslint-disable-next-line redos-detector/no-unsafe-regex -- false positive
  /^(?:(?:[1-9]|1\d|2[0-4])?\d|25[0-5])(?:\.(?:(?:[1-9]|1\d|2[0-4])?\d|25[0-5])){3}$/u
);
var IPV6_REGEX = /^(?:(?:[\da-f]{1,4}:){7}[\da-f]{1,4}|(?:[\da-f]{1,4}:){1,7}:|(?:[\da-f]{1,4}:){1,6}:[\da-f]{1,4}|(?:[\da-f]{1,4}:){1,5}(?::[\da-f]{1,4}){1,2}|(?:[\da-f]{1,4}:){1,4}(?::[\da-f]{1,4}){1,3}|(?:[\da-f]{1,4}:){1,3}(?::[\da-f]{1,4}){1,4}|(?:[\da-f]{1,4}:){1,2}(?::[\da-f]{1,4}){1,5}|[\da-f]{1,4}:(?::[\da-f]{1,4}){1,6}|:(?:(?::[\da-f]{1,4}){1,7}|:)|fe80:(?::[\da-f]{0,4}){0,4}%[\da-z]+|::(?:f{4}(?::0{1,4})?:)?(?:(?:25[0-5]|(?:2[0-4]|1?\d)?\d)\.){3}(?:25[0-5]|(?:2[0-4]|1?\d)?\d)|(?:[\da-f]{1,4}:){1,4}:(?:(?:25[0-5]|(?:2[0-4]|1?\d)?\d)\.){3}(?:25[0-5]|(?:2[0-4]|1?\d)?\d))$/iu;
var IP_REGEX = /^(?:(?:[1-9]|1\d|2[0-4])?\d|25[0-5])(?:\.(?:(?:[1-9]|1\d|2[0-4])?\d|25[0-5])){3}$|^(?:(?:[\da-f]{1,4}:){7}[\da-f]{1,4}|(?:[\da-f]{1,4}:){1,7}:|(?:[\da-f]{1,4}:){1,6}:[\da-f]{1,4}|(?:[\da-f]{1,4}:){1,5}(?::[\da-f]{1,4}){1,2}|(?:[\da-f]{1,4}:){1,4}(?::[\da-f]{1,4}){1,3}|(?:[\da-f]{1,4}:){1,3}(?::[\da-f]{1,4}){1,4}|(?:[\da-f]{1,4}:){1,2}(?::[\da-f]{1,4}){1,5}|[\da-f]{1,4}:(?::[\da-f]{1,4}){1,6}|:(?:(?::[\da-f]{1,4}){1,7}|:)|fe80:(?::[\da-f]{0,4}){0,4}%[\da-z]+|::(?:f{4}(?::0{1,4})?:)?(?:(?:25[0-5]|(?:2[0-4]|1?\d)?\d)\.){3}(?:25[0-5]|(?:2[0-4]|1?\d)?\d)|(?:[\da-f]{1,4}:){1,4}:(?:(?:25[0-5]|(?:2[0-4]|1?\d)?\d)\.){3}(?:25[0-5]|(?:2[0-4]|1?\d)?\d))$/iu;
var ISO_DATE_REGEX = /^\d{4}-(?:0[1-9]|1[0-2])-(?:[12]\d|0[1-9]|3[01])$/u;
var ISO_DATE_TIME_REGEX = /^\d{4}-(?:0[1-9]|1[0-2])-(?:[12]\d|0[1-9]|3[01])[T ](?:0\d|1\d|2[0-3]):[0-5]\d$/u;
var ISO_TIME_REGEX = /^(?:0\d|1\d|2[0-3]):[0-5]\d$/u;
var ISO_TIME_SECOND_REGEX = /^(?:0\d|1\d|2[0-3])(?::[0-5]\d){2}$/u;
var ISO_TIMESTAMP_REGEX = /^\d{4}-(?:0[1-9]|1[0-2])-(?:[12]\d|0[1-9]|3[01])[T ](?:0\d|1\d|2[0-3])(?::[0-5]\d){2}(?:\.\d{1,9})?(?:Z|[+-](?:0\d|1\d|2[0-3])(?::?[0-5]\d)?)$/u;
var ISO_WEEK_REGEX = /^\d{4}-W(?:0[1-9]|[1-4]\d|5[0-3])$/u;
var MAC48_REGEX = /^(?:[\da-f]{2}:){5}[\da-f]{2}$|^(?:[\da-f]{2}-){5}[\da-f]{2}$|^(?:[\da-f]{4}\.){2}[\da-f]{4}$/iu;
var MAC64_REGEX = /^(?:[\da-f]{2}:){7}[\da-f]{2}$|^(?:[\da-f]{2}-){7}[\da-f]{2}$|^(?:[\da-f]{4}\.){3}[\da-f]{4}$|^(?:[\da-f]{4}:){3}[\da-f]{4}$/iu;
var MAC_REGEX = /^(?:[\da-f]{2}:){5}[\da-f]{2}$|^(?:[\da-f]{2}-){5}[\da-f]{2}$|^(?:[\da-f]{4}\.){2}[\da-f]{4}$|^(?:[\da-f]{2}:){7}[\da-f]{2}$|^(?:[\da-f]{2}-){7}[\da-f]{2}$|^(?:[\da-f]{4}\.){3}[\da-f]{4}$|^(?:[\da-f]{4}:){3}[\da-f]{4}$/iu;
var NANO_ID_REGEX = /^[\w-]+$/u;
var OCTAL_REGEX = /^(?:0o)?[0-7]+$/u;
var RFC_EMAIL_REGEX = (
  // eslint-disable-next-line regexp/prefer-w, no-useless-escape, regexp/no-useless-escape, regexp/require-unicode-regexp
  /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
);
var SLUG_REGEX = /^[\da-z]+(?:[-_][\da-z]+)*$/u;
var ULID_REGEX = /^[\da-hjkmnp-tv-zA-HJKMNP-TV-Z]{26}$/u;
var UUID_REGEX = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/iu;

// src/actions/base64/base64.ts
// @__NO_SIDE_EFFECTS__
function base64(message2) {
  return {
    kind: "validation",
    type: "base64",
    reference: base64,
    async: false,
    expects: null,
    requirement: BASE64_REGEX,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, "Base64", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/actions/bic/bic.ts
// @__NO_SIDE_EFFECTS__
function bic(message2) {
  return {
    kind: "validation",
    type: "bic",
    reference: bic,
    async: false,
    expects: null,
    requirement: BIC_REGEX,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, "BIC", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/actions/brand/brand.ts
// @__NO_SIDE_EFFECTS__
function brand(name) {
  return {
    kind: "transformation",
    type: "brand",
    reference: brand,
    async: false,
    name,
    "~run"(dataset) {
      return dataset;
    }
  };
}

// src/actions/bytes/bytes.ts
// @__NO_SIDE_EFFECTS__
function bytes(requirement, message2) {
  return {
    kind: "validation",
    type: "bytes",
    reference: bytes,
    async: false,
    expects: `${requirement}`,
    requirement,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed) {
        const length2 = _getByteCount(dataset.value);
        if (length2 !== this.requirement) {
          _addIssue(this, "bytes", dataset, config2, {
            received: `${length2}`
          });
        }
      }
      return dataset;
    }
  };
}

// src/actions/check/check.ts
// @__NO_SIDE_EFFECTS__
function check(requirement, message2) {
  return {
    kind: "validation",
    type: "check",
    reference: check,
    async: false,
    expects: null,
    requirement,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !this.requirement(dataset.value)) {
        _addIssue(this, "input", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/actions/check/checkAsync.ts
// @__NO_SIDE_EFFECTS__
function checkAsync(requirement, message2) {
  return {
    kind: "validation",
    type: "check",
    reference: checkAsync,
    async: true,
    expects: null,
    requirement,
    message: message2,
    async "~run"(dataset, config2) {
      if (dataset.typed && !await this.requirement(dataset.value)) {
        _addIssue(this, "input", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/actions/checkItems/checkItems.ts
// @__NO_SIDE_EFFECTS__
function checkItems(requirement, message2) {
  return {
    kind: "validation",
    type: "check_items",
    reference: checkItems,
    async: false,
    expects: null,
    requirement,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed) {
        for (let index = 0; index < dataset.value.length; index++) {
          const item = dataset.value[index];
          if (!this.requirement(item, index, dataset.value)) {
            _addIssue(this, "item", dataset, config2, {
              input: item,
              path: [
                {
                  type: "array",
                  origin: "value",
                  input: dataset.value,
                  key: index,
                  value: item
                }
              ]
            });
          }
        }
      }
      return dataset;
    }
  };
}

// src/actions/checkItems/checkItemsAsync.ts
// @__NO_SIDE_EFFECTS__
function checkItemsAsync(requirement, message2) {
  return {
    kind: "validation",
    type: "check_items",
    reference: checkItemsAsync,
    async: true,
    expects: null,
    requirement,
    message: message2,
    async "~run"(dataset, config2) {
      if (dataset.typed) {
        const requirementResults = await Promise.all(
          dataset.value.map(this.requirement)
        );
        for (let index = 0; index < dataset.value.length; index++) {
          if (!requirementResults[index]) {
            const item = dataset.value[index];
            _addIssue(this, "item", dataset, config2, {
              input: item,
              path: [
                {
                  type: "array",
                  origin: "value",
                  input: dataset.value,
                  key: index,
                  value: item
                }
              ]
            });
          }
        }
      }
      return dataset;
    }
  };
}

// src/actions/creditCard/creditCard.ts
var CREDIT_CARD_REGEX = /^(?:\d{14,19}|\d{4}(?: \d{3,6}){2,4}|\d{4}(?:-\d{3,6}){2,4})$/u;
var SANITIZE_REGEX = /[- ]/gu;
var PROVIDER_REGEX_LIST = [
  // American Express
  /^3[47]\d{13}$/u,
  // Diners Club
  /^3(?:0[0-5]|[68]\d)\d{11,13}$/u,
  // Discover
  /^6(?:011|5\d{2})\d{12,15}$/u,
  // JCB
  /^(?:2131|1800|35\d{3})\d{11}$/u,
  // Mastercard
  // eslint-disable-next-line redos-detector/no-unsafe-regex
  /^5[1-5]\d{2}|(?:222\d|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)\d{12}$/u,
  // UnionPay
  /^(?:6[27]\d{14,17}|81\d{14,17})$/u,
  // Visa
  /^4\d{12}(?:\d{3,6})?$/u
];
// @__NO_SIDE_EFFECTS__
function creditCard(message2) {
  return {
    kind: "validation",
    type: "credit_card",
    reference: creditCard,
    async: false,
    expects: null,
    requirement(input) {
      let sanitized;
      return CREDIT_CARD_REGEX.test(input) && // Remove any hyphens and blanks
      (sanitized = input.replace(SANITIZE_REGEX, "")) && // Check if it matches a provider
      PROVIDER_REGEX_LIST.some((regex2) => regex2.test(sanitized)) && // Check if passes luhn algorithm
      _isLuhnAlgo(sanitized);
    },
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !this.requirement(dataset.value)) {
        _addIssue(this, "credit card", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/actions/cuid2/cuid2.ts
// @__NO_SIDE_EFFECTS__
function cuid2(message2) {
  return {
    kind: "validation",
    type: "cuid2",
    reference: cuid2,
    async: false,
    expects: null,
    requirement: CUID2_REGEX,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, "Cuid2", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/actions/decimal/decimal.ts
// @__NO_SIDE_EFFECTS__
function decimal(message2) {
  return {
    kind: "validation",
    type: "decimal",
    reference: decimal,
    async: false,
    expects: null,
    requirement: DECIMAL_REGEX,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, "decimal", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/actions/description/description.ts
// @__NO_SIDE_EFFECTS__
function description(description_) {
  return {
    kind: "metadata",
    type: "description",
    reference: description,
    description: description_
  };
}

// src/actions/digits/digits.ts
// @__NO_SIDE_EFFECTS__
function digits(message2) {
  return {
    kind: "validation",
    type: "digits",
    reference: digits,
    async: false,
    expects: null,
    requirement: DIGITS_REGEX,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, "digits", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/actions/email/email.ts
// @__NO_SIDE_EFFECTS__
function email(message2) {
  return {
    kind: "validation",
    type: "email",
    reference: email,
    expects: null,
    async: false,
    requirement: EMAIL_REGEX,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, "email", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/actions/emoji/emoji.ts
// @__NO_SIDE_EFFECTS__
function emoji(message2) {
  return {
    kind: "validation",
    type: "emoji",
    reference: emoji,
    async: false,
    expects: null,
    requirement: EMOJI_REGEX,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, "emoji", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/actions/empty/empty.ts
// @__NO_SIDE_EFFECTS__
function empty(message2) {
  return {
    kind: "validation",
    type: "empty",
    reference: empty,
    async: false,
    expects: "0",
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && dataset.value.length > 0) {
        _addIssue(this, "length", dataset, config2, {
          received: `${dataset.value.length}`
        });
      }
      return dataset;
    }
  };
}

// src/actions/endsWith/endsWith.ts
// @__NO_SIDE_EFFECTS__
function endsWith(requirement, message2) {
  return {
    kind: "validation",
    type: "ends_with",
    reference: endsWith,
    async: false,
    expects: `"${requirement}"`,
    requirement,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !dataset.value.endsWith(this.requirement)) {
        _addIssue(this, "end", dataset, config2, {
          received: `"${dataset.value.slice(-this.requirement.length)}"`
        });
      }
      return dataset;
    }
  };
}

// src/actions/entries/entries.ts
// @__NO_SIDE_EFFECTS__
function entries(requirement, message2) {
  return {
    kind: "validation",
    type: "entries",
    reference: entries,
    async: false,
    expects: `${requirement}`,
    requirement,
    message: message2,
    "~run"(dataset, config2) {
      if (!dataset.typed) return dataset;
      const count = Object.keys(dataset.value).length;
      if (dataset.typed && count !== this.requirement) {
        _addIssue(this, "entries", dataset, config2, {
          received: `${count}`
        });
      }
      return dataset;
    }
  };
}

// src/actions/everyItem/everyItem.ts
// @__NO_SIDE_EFFECTS__
function everyItem(requirement, message2) {
  return {
    kind: "validation",
    type: "every_item",
    reference: everyItem,
    async: false,
    expects: null,
    requirement,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !dataset.value.every(this.requirement)) {
        _addIssue(this, "item", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/actions/excludes/excludes.ts
// @__NO_SIDE_EFFECTS__
function excludes(requirement, message2) {
  const received = _stringify(requirement);
  return {
    kind: "validation",
    type: "excludes",
    reference: excludes,
    async: false,
    expects: `!${received}`,
    requirement,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && dataset.value.includes(this.requirement)) {
        _addIssue(this, "content", dataset, config2, { received });
      }
      return dataset;
    }
  };
}

// src/actions/filterItems/filterItems.ts
// @__NO_SIDE_EFFECTS__
function filterItems(operation) {
  return {
    kind: "transformation",
    type: "filter_items",
    reference: filterItems,
    async: false,
    operation,
    "~run"(dataset) {
      dataset.value = dataset.value.filter(this.operation);
      return dataset;
    }
  };
}

// src/actions/findItem/findItem.ts
// @__NO_SIDE_EFFECTS__
function findItem(operation) {
  return {
    kind: "transformation",
    type: "find_item",
    reference: findItem,
    async: false,
    operation,
    "~run"(dataset) {
      dataset.value = dataset.value.find(this.operation);
      return dataset;
    }
  };
}

// src/actions/finite/finite.ts
// @__NO_SIDE_EFFECTS__
function finite(message2) {
  return {
    kind: "validation",
    type: "finite",
    reference: finite,
    async: false,
    expects: null,
    requirement: Number.isFinite,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !this.requirement(dataset.value)) {
        _addIssue(this, "finite", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/actions/flavor/flavor.ts
// @__NO_SIDE_EFFECTS__
function flavor(name) {
  return {
    kind: "transformation",
    type: "flavor",
    reference: flavor,
    async: false,
    name,
    "~run"(dataset) {
      return dataset;
    }
  };
}

// src/actions/graphemes/graphemes.ts
// @__NO_SIDE_EFFECTS__
function graphemes(requirement, message2) {
  return {
    kind: "validation",
    type: "graphemes",
    reference: graphemes,
    async: false,
    expects: `${requirement}`,
    requirement,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed) {
        const count = _getGraphemeCount(dataset.value);
        if (count !== this.requirement) {
          _addIssue(this, "graphemes", dataset, config2, {
            received: `${count}`
          });
        }
      }
      return dataset;
    }
  };
}

// src/actions/gtValue/gtValue.ts
// @__NO_SIDE_EFFECTS__
function gtValue(requirement, message2) {
  return {
    kind: "validation",
    type: "gt_value",
    reference: gtValue,
    async: false,
    expects: `>${requirement instanceof Date ? requirement.toJSON() : _stringify(requirement)}`,
    requirement,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !(dataset.value > this.requirement)) {
        _addIssue(this, "value", dataset, config2, {
          received: dataset.value instanceof Date ? dataset.value.toJSON() : _stringify(dataset.value)
        });
      }
      return dataset;
    }
  };
}

// src/actions/hash/hash.ts
var HASH_LENGTHS = {
  md4: 32,
  md5: 32,
  sha1: 40,
  sha256: 64,
  sha384: 96,
  sha512: 128,
  ripemd128: 32,
  ripemd160: 40,
  tiger128: 32,
  tiger160: 40,
  tiger192: 48,
  crc32: 8,
  crc32b: 8,
  adler32: 8
};
// @__NO_SIDE_EFFECTS__
function hash(types, message2) {
  return {
    kind: "validation",
    type: "hash",
    reference: hash,
    expects: null,
    async: false,
    requirement: RegExp(
      types.map((type) => `^[a-f0-9]{${HASH_LENGTHS[type]}}$`).join("|"),
      "iu"
    ),
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, "hash", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/actions/hexadecimal/hexadecimal.ts
// @__NO_SIDE_EFFECTS__
function hexadecimal(message2) {
  return {
    kind: "validation",
    type: "hexadecimal",
    reference: hexadecimal,
    async: false,
    expects: null,
    requirement: HEXADECIMAL_REGEX,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, "hexadecimal", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/actions/hexColor/hexColor.ts
// @__NO_SIDE_EFFECTS__
function hexColor(message2) {
  return {
    kind: "validation",
    type: "hex_color",
    reference: hexColor,
    async: false,
    expects: null,
    requirement: HEX_COLOR_REGEX,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, "hex color", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/actions/imei/imei.ts
// @__NO_SIDE_EFFECTS__
function imei(message2) {
  return {
    kind: "validation",
    type: "imei",
    reference: imei,
    async: false,
    expects: null,
    requirement(input) {
      return IMEI_REGEX.test(input) && _isLuhnAlgo(input);
    },
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !this.requirement(dataset.value)) {
        _addIssue(this, "IMEI", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/actions/includes/includes.ts
// @__NO_SIDE_EFFECTS__
function includes(requirement, message2) {
  const expects = _stringify(requirement);
  return {
    kind: "validation",
    type: "includes",
    reference: includes,
    async: false,
    expects,
    requirement,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !dataset.value.includes(this.requirement)) {
        _addIssue(this, "content", dataset, config2, {
          received: `!${expects}`
        });
      }
      return dataset;
    }
  };
}

// src/actions/integer/integer.ts
// @__NO_SIDE_EFFECTS__
function integer(message2) {
  return {
    kind: "validation",
    type: "integer",
    reference: integer,
    async: false,
    expects: null,
    requirement: Number.isInteger,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !this.requirement(dataset.value)) {
        _addIssue(this, "integer", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/actions/ip/ip.ts
// @__NO_SIDE_EFFECTS__
function ip(message2) {
  return {
    kind: "validation",
    type: "ip",
    reference: ip,
    async: false,
    expects: null,
    requirement: IP_REGEX,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, "IP", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/actions/ipv4/ipv4.ts
// @__NO_SIDE_EFFECTS__
function ipv4(message2) {
  return {
    kind: "validation",
    type: "ipv4",
    reference: ipv4,
    async: false,
    expects: null,
    requirement: IPV4_REGEX,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, "IPv4", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/actions/ipv6/ipv6.ts
// @__NO_SIDE_EFFECTS__
function ipv6(message2) {
  return {
    kind: "validation",
    type: "ipv6",
    reference: ipv6,
    async: false,
    expects: null,
    requirement: IPV6_REGEX,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, "IPv6", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/actions/isoDate/isoDate.ts
// @__NO_SIDE_EFFECTS__
function isoDate(message2) {
  return {
    kind: "validation",
    type: "iso_date",
    reference: isoDate,
    async: false,
    expects: null,
    requirement: ISO_DATE_REGEX,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, "date", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/actions/isoDateTime/isoDateTime.ts
// @__NO_SIDE_EFFECTS__
function isoDateTime(message2) {
  return {
    kind: "validation",
    type: "iso_date_time",
    reference: isoDateTime,
    async: false,
    expects: null,
    requirement: ISO_DATE_TIME_REGEX,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, "date-time", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/actions/isoTime/isoTime.ts
// @__NO_SIDE_EFFECTS__
function isoTime(message2) {
  return {
    kind: "validation",
    type: "iso_time",
    reference: isoTime,
    async: false,
    expects: null,
    requirement: ISO_TIME_REGEX,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, "time", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/actions/isoTimeSecond/isoTimeSecond.ts
// @__NO_SIDE_EFFECTS__
function isoTimeSecond(message2) {
  return {
    kind: "validation",
    type: "iso_time_second",
    reference: isoTimeSecond,
    async: false,
    expects: null,
    requirement: ISO_TIME_SECOND_REGEX,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, "time-second", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/actions/isoTimestamp/isoTimestamp.ts
// @__NO_SIDE_EFFECTS__
function isoTimestamp(message2) {
  return {
    kind: "validation",
    type: "iso_timestamp",
    reference: isoTimestamp,
    async: false,
    expects: null,
    requirement: ISO_TIMESTAMP_REGEX,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, "timestamp", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/actions/isoWeek/isoWeek.ts
// @__NO_SIDE_EFFECTS__
function isoWeek(message2) {
  return {
    kind: "validation",
    type: "iso_week",
    reference: isoWeek,
    async: false,
    expects: null,
    requirement: ISO_WEEK_REGEX,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, "week", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/actions/length/length.ts
// @__NO_SIDE_EFFECTS__
function length(requirement, message2) {
  return {
    kind: "validation",
    type: "length",
    reference: length,
    async: false,
    expects: `${requirement}`,
    requirement,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && dataset.value.length !== this.requirement) {
        _addIssue(this, "length", dataset, config2, {
          received: `${dataset.value.length}`
        });
      }
      return dataset;
    }
  };
}

// src/actions/ltValue/ltValue.ts
// @__NO_SIDE_EFFECTS__
function ltValue(requirement, message2) {
  return {
    kind: "validation",
    type: "lt_value",
    reference: ltValue,
    async: false,
    expects: `<${requirement instanceof Date ? requirement.toJSON() : _stringify(requirement)}`,
    requirement,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !(dataset.value < this.requirement)) {
        _addIssue(this, "value", dataset, config2, {
          received: dataset.value instanceof Date ? dataset.value.toJSON() : _stringify(dataset.value)
        });
      }
      return dataset;
    }
  };
}

// src/actions/mac/mac.ts
// @__NO_SIDE_EFFECTS__
function mac(message2) {
  return {
    kind: "validation",
    type: "mac",
    reference: mac,
    async: false,
    expects: null,
    requirement: MAC_REGEX,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, "MAC", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/actions/mac48/mac48.ts
// @__NO_SIDE_EFFECTS__
function mac48(message2) {
  return {
    kind: "validation",
    type: "mac48",
    reference: mac48,
    async: false,
    expects: null,
    requirement: MAC48_REGEX,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, "48-bit MAC", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/actions/mac64/mac64.ts
// @__NO_SIDE_EFFECTS__
function mac64(message2) {
  return {
    kind: "validation",
    type: "mac64",
    reference: mac64,
    async: false,
    expects: null,
    requirement: MAC64_REGEX,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, "64-bit MAC", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/actions/mapItems/mapItems.ts
// @__NO_SIDE_EFFECTS__
function mapItems(operation) {
  return {
    kind: "transformation",
    type: "map_items",
    reference: mapItems,
    async: false,
    operation,
    "~run"(dataset) {
      dataset.value = dataset.value.map(this.operation);
      return dataset;
    }
  };
}

// src/actions/maxBytes/maxBytes.ts
// @__NO_SIDE_EFFECTS__
function maxBytes(requirement, message2) {
  return {
    kind: "validation",
    type: "max_bytes",
    reference: maxBytes,
    async: false,
    expects: `<=${requirement}`,
    requirement,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed) {
        const length2 = _getByteCount(dataset.value);
        if (length2 > this.requirement) {
          _addIssue(this, "bytes", dataset, config2, {
            received: `${length2}`
          });
        }
      }
      return dataset;
    }
  };
}

// src/actions/maxEntries/maxEntries.ts
// @__NO_SIDE_EFFECTS__
function maxEntries(requirement, message2) {
  return {
    kind: "validation",
    type: "max_entries",
    reference: maxEntries,
    async: false,
    expects: `<=${requirement}`,
    requirement,
    message: message2,
    "~run"(dataset, config2) {
      if (!dataset.typed) return dataset;
      const count = Object.keys(dataset.value).length;
      if (dataset.typed && count > this.requirement) {
        _addIssue(this, "entries", dataset, config2, {
          received: `${count}`
        });
      }
      return dataset;
    }
  };
}

// src/actions/maxGraphemes/maxGraphemes.ts
// @__NO_SIDE_EFFECTS__
function maxGraphemes(requirement, message2) {
  return {
    kind: "validation",
    type: "max_graphemes",
    reference: maxGraphemes,
    async: false,
    expects: `<=${requirement}`,
    requirement,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed) {
        const count = _getGraphemeCount(dataset.value);
        if (count > this.requirement) {
          _addIssue(this, "graphemes", dataset, config2, {
            received: `${count}`
          });
        }
      }
      return dataset;
    }
  };
}

// src/actions/maxLength/maxLength.ts
// @__NO_SIDE_EFFECTS__
function maxLength(requirement, message2) {
  return {
    kind: "validation",
    type: "max_length",
    reference: maxLength,
    async: false,
    expects: `<=${requirement}`,
    requirement,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && dataset.value.length > this.requirement) {
        _addIssue(this, "length", dataset, config2, {
          received: `${dataset.value.length}`
        });
      }
      return dataset;
    }
  };
}

// src/actions/maxSize/maxSize.ts
// @__NO_SIDE_EFFECTS__
function maxSize(requirement, message2) {
  return {
    kind: "validation",
    type: "max_size",
    reference: maxSize,
    async: false,
    expects: `<=${requirement}`,
    requirement,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && dataset.value.size > this.requirement) {
        _addIssue(this, "size", dataset, config2, {
          received: `${dataset.value.size}`
        });
      }
      return dataset;
    }
  };
}

// src/actions/maxValue/maxValue.ts
// @__NO_SIDE_EFFECTS__
function maxValue(requirement, message2) {
  return {
    kind: "validation",
    type: "max_value",
    reference: maxValue,
    async: false,
    expects: `<=${requirement instanceof Date ? requirement.toJSON() : _stringify(requirement)}`,
    requirement,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !(dataset.value <= this.requirement)) {
        _addIssue(this, "value", dataset, config2, {
          received: dataset.value instanceof Date ? dataset.value.toJSON() : _stringify(dataset.value)
        });
      }
      return dataset;
    }
  };
}

// src/actions/maxWords/maxWords.ts
// @__NO_SIDE_EFFECTS__
function maxWords(locales, requirement, message2) {
  return {
    kind: "validation",
    type: "max_words",
    reference: maxWords,
    async: false,
    expects: `<=${requirement}`,
    locales,
    requirement,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed) {
        const count = _getWordCount(this.locales, dataset.value);
        if (count > this.requirement) {
          _addIssue(this, "words", dataset, config2, {
            received: `${count}`
          });
        }
      }
      return dataset;
    }
  };
}

// src/actions/metadata/metadata.ts
// @__NO_SIDE_EFFECTS__
function metadata(metadata_) {
  return {
    kind: "metadata",
    type: "metadata",
    reference: metadata,
    metadata: metadata_
  };
}

// src/actions/mimeType/mimeType.ts
// @__NO_SIDE_EFFECTS__
function mimeType(requirement, message2) {
  return {
    kind: "validation",
    type: "mime_type",
    reference: mimeType,
    async: false,
    expects: _joinExpects(
      requirement.map((option) => `"${option}"`),
      "|"
    ),
    requirement,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !this.requirement.includes(dataset.value.type)) {
        _addIssue(this, "MIME type", dataset, config2, {
          received: `"${dataset.value.type}"`
        });
      }
      return dataset;
    }
  };
}

// src/actions/minBytes/minBytes.ts
// @__NO_SIDE_EFFECTS__
function minBytes(requirement, message2) {
  return {
    kind: "validation",
    type: "min_bytes",
    reference: minBytes,
    async: false,
    expects: `>=${requirement}`,
    requirement,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed) {
        const length2 = _getByteCount(dataset.value);
        if (length2 < this.requirement) {
          _addIssue(this, "bytes", dataset, config2, {
            received: `${length2}`
          });
        }
      }
      return dataset;
    }
  };
}

// src/actions/minEntries/minEntries.ts
// @__NO_SIDE_EFFECTS__
function minEntries(requirement, message2) {
  return {
    kind: "validation",
    type: "min_entries",
    reference: minEntries,
    async: false,
    expects: `>=${requirement}`,
    requirement,
    message: message2,
    "~run"(dataset, config2) {
      if (!dataset.typed) return dataset;
      const count = Object.keys(dataset.value).length;
      if (dataset.typed && count < this.requirement) {
        _addIssue(this, "entries", dataset, config2, {
          received: `${count}`
        });
      }
      return dataset;
    }
  };
}

// src/actions/minGraphemes/minGraphemes.ts
// @__NO_SIDE_EFFECTS__
function minGraphemes(requirement, message2) {
  return {
    kind: "validation",
    type: "min_graphemes",
    reference: minGraphemes,
    async: false,
    expects: `>=${requirement}`,
    requirement,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed) {
        const count = _getGraphemeCount(dataset.value);
        if (count < this.requirement) {
          _addIssue(this, "graphemes", dataset, config2, {
            received: `${count}`
          });
        }
      }
      return dataset;
    }
  };
}

// src/actions/minLength/minLength.ts
// @__NO_SIDE_EFFECTS__
function minLength(requirement, message2) {
  return {
    kind: "validation",
    type: "min_length",
    reference: minLength,
    async: false,
    expects: `>=${requirement}`,
    requirement,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && dataset.value.length < this.requirement) {
        _addIssue(this, "length", dataset, config2, {
          received: `${dataset.value.length}`
        });
      }
      return dataset;
    }
  };
}

// src/actions/minSize/minSize.ts
// @__NO_SIDE_EFFECTS__
function minSize(requirement, message2) {
  return {
    kind: "validation",
    type: "min_size",
    reference: minSize,
    async: false,
    expects: `>=${requirement}`,
    requirement,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && dataset.value.size < this.requirement) {
        _addIssue(this, "size", dataset, config2, {
          received: `${dataset.value.size}`
        });
      }
      return dataset;
    }
  };
}

// src/actions/minValue/minValue.ts
// @__NO_SIDE_EFFECTS__
function minValue(requirement, message2) {
  return {
    kind: "validation",
    type: "min_value",
    reference: minValue,
    async: false,
    expects: `>=${requirement instanceof Date ? requirement.toJSON() : _stringify(requirement)}`,
    requirement,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !(dataset.value >= this.requirement)) {
        _addIssue(this, "value", dataset, config2, {
          received: dataset.value instanceof Date ? dataset.value.toJSON() : _stringify(dataset.value)
        });
      }
      return dataset;
    }
  };
}

// src/actions/minWords/minWords.ts
// @__NO_SIDE_EFFECTS__
function minWords(locales, requirement, message2) {
  return {
    kind: "validation",
    type: "min_words",
    reference: minWords,
    async: false,
    expects: `>=${requirement}`,
    locales,
    requirement,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed) {
        const count = _getWordCount(this.locales, dataset.value);
        if (count < this.requirement) {
          _addIssue(this, "words", dataset, config2, {
            received: `${count}`
          });
        }
      }
      return dataset;
    }
  };
}

// src/actions/multipleOf/multipleOf.ts
// @__NO_SIDE_EFFECTS__
function multipleOf(requirement, message2) {
  return {
    kind: "validation",
    type: "multiple_of",
    reference: multipleOf,
    async: false,
    expects: `%${requirement}`,
    requirement,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && dataset.value % this.requirement != 0) {
        _addIssue(this, "multiple", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/actions/nanoid/nanoid.ts
// @__NO_SIDE_EFFECTS__
function nanoid(message2) {
  return {
    kind: "validation",
    type: "nanoid",
    reference: nanoid,
    async: false,
    expects: null,
    requirement: NANO_ID_REGEX,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, "Nano ID", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/actions/nonEmpty/nonEmpty.ts
// @__NO_SIDE_EFFECTS__
function nonEmpty(message2) {
  return {
    kind: "validation",
    type: "non_empty",
    reference: nonEmpty,
    async: false,
    expects: "!0",
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && dataset.value.length === 0) {
        _addIssue(this, "length", dataset, config2, {
          received: "0"
        });
      }
      return dataset;
    }
  };
}

// src/actions/normalize/normalize.ts
// @__NO_SIDE_EFFECTS__
function normalize(form) {
  return {
    kind: "transformation",
    type: "normalize",
    reference: normalize,
    async: false,
    form,
    "~run"(dataset) {
      dataset.value = dataset.value.normalize(this.form);
      return dataset;
    }
  };
}

// src/actions/notBytes/notBytes.ts
// @__NO_SIDE_EFFECTS__
function notBytes(requirement, message2) {
  return {
    kind: "validation",
    type: "not_bytes",
    reference: notBytes,
    async: false,
    expects: `!${requirement}`,
    requirement,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed) {
        const length2 = _getByteCount(dataset.value);
        if (length2 === this.requirement) {
          _addIssue(this, "bytes", dataset, config2, {
            received: `${length2}`
          });
        }
      }
      return dataset;
    }
  };
}

// src/actions/notEntries/notEntries.ts
// @__NO_SIDE_EFFECTS__
function notEntries(requirement, message2) {
  return {
    kind: "validation",
    type: "not_entries",
    reference: notEntries,
    async: false,
    expects: `!${requirement}`,
    requirement,
    message: message2,
    "~run"(dataset, config2) {
      if (!dataset.typed) return dataset;
      const count = Object.keys(dataset.value).length;
      if (dataset.typed && count === this.requirement) {
        _addIssue(this, "entries", dataset, config2, {
          received: `${count}`
        });
      }
      return dataset;
    }
  };
}

// src/actions/notGraphemes/notGraphemes.ts
// @__NO_SIDE_EFFECTS__
function notGraphemes(requirement, message2) {
  return {
    kind: "validation",
    type: "not_graphemes",
    reference: notGraphemes,
    async: false,
    expects: `!${requirement}`,
    requirement,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed) {
        const count = _getGraphemeCount(dataset.value);
        if (count === this.requirement) {
          _addIssue(this, "graphemes", dataset, config2, {
            received: `${count}`
          });
        }
      }
      return dataset;
    }
  };
}

// src/actions/notLength/notLength.ts
// @__NO_SIDE_EFFECTS__
function notLength(requirement, message2) {
  return {
    kind: "validation",
    type: "not_length",
    reference: notLength,
    async: false,
    expects: `!${requirement}`,
    requirement,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && dataset.value.length === this.requirement) {
        _addIssue(this, "length", dataset, config2, {
          received: `${dataset.value.length}`
        });
      }
      return dataset;
    }
  };
}

// src/actions/notSize/notSize.ts
// @__NO_SIDE_EFFECTS__
function notSize(requirement, message2) {
  return {
    kind: "validation",
    type: "not_size",
    reference: notSize,
    async: false,
    expects: `!${requirement}`,
    requirement,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && dataset.value.size === this.requirement) {
        _addIssue(this, "size", dataset, config2, {
          received: `${dataset.value.size}`
        });
      }
      return dataset;
    }
  };
}

// src/actions/notValue/notValue.ts
// @__NO_SIDE_EFFECTS__
function notValue(requirement, message2) {
  return {
    kind: "validation",
    type: "not_value",
    reference: notValue,
    async: false,
    expects: requirement instanceof Date ? `!${requirement.toJSON()}` : `!${_stringify(requirement)}`,
    requirement,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && this.requirement <= dataset.value && this.requirement >= dataset.value) {
        _addIssue(this, "value", dataset, config2, {
          received: dataset.value instanceof Date ? dataset.value.toJSON() : _stringify(dataset.value)
        });
      }
      return dataset;
    }
  };
}

// src/actions/notValues/notValues.ts
// @__NO_SIDE_EFFECTS__
function notValues(requirement, message2) {
  return {
    kind: "validation",
    type: "not_values",
    reference: notValues,
    async: false,
    expects: `!${_joinExpects(
      requirement.map(
        (value2) => value2 instanceof Date ? value2.toJSON() : _stringify(value2)
      ),
      "|"
    )}`,
    requirement,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && this.requirement.some(
        (value2) => value2 <= dataset.value && value2 >= dataset.value
      )) {
        _addIssue(this, "value", dataset, config2, {
          received: dataset.value instanceof Date ? dataset.value.toJSON() : _stringify(dataset.value)
        });
      }
      return dataset;
    }
  };
}

// src/actions/notWords/notWords.ts
// @__NO_SIDE_EFFECTS__
function notWords(locales, requirement, message2) {
  return {
    kind: "validation",
    type: "not_words",
    reference: notWords,
    async: false,
    expects: `!${requirement}`,
    locales,
    requirement,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed) {
        const count = _getWordCount(this.locales, dataset.value);
        if (count === this.requirement) {
          _addIssue(this, "words", dataset, config2, {
            received: `${count}`
          });
        }
      }
      return dataset;
    }
  };
}

// src/actions/octal/octal.ts
// @__NO_SIDE_EFFECTS__
function octal(message2) {
  return {
    kind: "validation",
    type: "octal",
    reference: octal,
    async: false,
    expects: null,
    requirement: OCTAL_REGEX,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, "octal", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/actions/parseJson/parseJson.ts
// @__NO_SIDE_EFFECTS__
function parseJson(config2, message2) {
  return {
    kind: "transformation",
    type: "parse_json",
    reference: parseJson,
    config: config2,
    message: message2,
    async: false,
    "~run"(dataset, config3) {
      try {
        dataset.value = JSON.parse(dataset.value, this.config?.reviver);
      } catch (error) {
        if (error instanceof Error) {
          _addIssue(this, "JSON", dataset, config3, {
            received: `"${error.message}"`
          });
          dataset.typed = false;
        } else {
          throw error;
        }
      }
      return dataset;
    }
  };
}

// src/actions/partialCheck/utils/_isPartiallyTyped/_isPartiallyTyped.ts
// @__NO_SIDE_EFFECTS__
function _isPartiallyTyped(dataset, paths) {
  if (dataset.issues) {
    for (const path of paths) {
      for (const issue of dataset.issues) {
        let typed = false;
        const bound = Math.min(path.length, issue.path?.length ?? 0);
        for (let index = 0; index < bound; index++) {
          if (
            // @ts-expect-error
            path[index] !== issue.path[index].key && // @ts-expect-error
            (path[index] !== "$" || issue.path[index].type !== "array")
          ) {
            typed = true;
            break;
          }
        }
        if (!typed) {
          return false;
        }
      }
    }
  }
  return true;
}

// src/actions/partialCheck/partialCheck.ts
// @__NO_SIDE_EFFECTS__
function partialCheck(paths, requirement, message2) {
  return {
    kind: "validation",
    type: "partial_check",
    reference: partialCheck,
    async: false,
    expects: null,
    paths,
    requirement,
    message: message2,
    "~run"(dataset, config2) {
      if ((dataset.typed || _isPartiallyTyped(dataset, paths)) && // @ts-expect-error
      !this.requirement(dataset.value)) {
        _addIssue(this, "input", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/actions/partialCheck/partialCheckAsync.ts
// @__NO_SIDE_EFFECTS__
function partialCheckAsync(paths, requirement, message2) {
  return {
    kind: "validation",
    type: "partial_check",
    reference: partialCheckAsync,
    async: true,
    expects: null,
    paths,
    requirement,
    message: message2,
    async "~run"(dataset, config2) {
      if ((dataset.typed || _isPartiallyTyped(dataset, paths)) && // @ts-expect-error
      !await this.requirement(dataset.value)) {
        _addIssue(this, "input", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/actions/rawCheck/rawCheck.ts
// @__NO_SIDE_EFFECTS__
function rawCheck(action) {
  return {
    kind: "validation",
    type: "raw_check",
    reference: rawCheck,
    async: false,
    expects: null,
    "~run"(dataset, config2) {
      action({
        dataset,
        config: config2,
        addIssue: (info) => _addIssue(this, info?.label ?? "input", dataset, config2, info)
      });
      return dataset;
    }
  };
}

// src/actions/rawCheck/rawCheckAsync.ts
// @__NO_SIDE_EFFECTS__
function rawCheckAsync(action) {
  return {
    kind: "validation",
    type: "raw_check",
    reference: rawCheckAsync,
    async: true,
    expects: null,
    async "~run"(dataset, config2) {
      await action({
        dataset,
        config: config2,
        addIssue: (info) => _addIssue(this, info?.label ?? "input", dataset, config2, info)
      });
      return dataset;
    }
  };
}

// src/actions/rawTransform/rawTransform.ts
// @__NO_SIDE_EFFECTS__
function rawTransform(action) {
  return {
    kind: "transformation",
    type: "raw_transform",
    reference: rawTransform,
    async: false,
    "~run"(dataset, config2) {
      const output = action({
        dataset,
        config: config2,
        addIssue: (info) => _addIssue(this, info?.label ?? "input", dataset, config2, info),
        NEVER: null
      });
      if (dataset.issues) {
        dataset.typed = false;
      } else {
        dataset.value = output;
      }
      return dataset;
    }
  };
}

// src/actions/rawTransform/rawTransformAsync.ts
// @__NO_SIDE_EFFECTS__
function rawTransformAsync(action) {
  return {
    kind: "transformation",
    type: "raw_transform",
    reference: rawTransformAsync,
    async: true,
    async "~run"(dataset, config2) {
      const output = await action({
        dataset,
        config: config2,
        addIssue: (info) => _addIssue(this, info?.label ?? "input", dataset, config2, info),
        NEVER: null
      });
      if (dataset.issues) {
        dataset.typed = false;
      } else {
        dataset.value = output;
      }
      return dataset;
    }
  };
}

// src/actions/readonly/readonly.ts
// @__NO_SIDE_EFFECTS__
function readonly() {
  return {
    kind: "transformation",
    type: "readonly",
    reference: readonly,
    async: false,
    "~run"(dataset) {
      return dataset;
    }
  };
}

// src/actions/reduceItems/reduceItems.ts
// @__NO_SIDE_EFFECTS__
function reduceItems(operation, initial) {
  return {
    kind: "transformation",
    type: "reduce_items",
    reference: reduceItems,
    async: false,
    operation,
    initial,
    "~run"(dataset) {
      dataset.value = dataset.value.reduce(this.operation, this.initial);
      return dataset;
    }
  };
}

// src/actions/regex/regex.ts
// @__NO_SIDE_EFFECTS__
function regex(requirement, message2) {
  return {
    kind: "validation",
    type: "regex",
    reference: regex,
    async: false,
    expects: `${requirement}`,
    requirement,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, "format", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/actions/returns/returns.ts
// @__NO_SIDE_EFFECTS__
function returns(schema) {
  return {
    kind: "transformation",
    type: "returns",
    reference: returns,
    async: false,
    schema,
    "~run"(dataset, config2) {
      const func = dataset.value;
      dataset.value = (...args_) => {
        const returnsDataset = this.schema["~run"](
          { value: func(...args_) },
          config2
        );
        if (returnsDataset.issues) {
          throw new ValiError(returnsDataset.issues);
        }
        return returnsDataset.value;
      };
      return dataset;
    }
  };
}

// src/actions/returns/returnsAsync.ts
// @__NO_SIDE_EFFECTS__
function returnsAsync(schema) {
  return {
    kind: "transformation",
    type: "returns",
    reference: returnsAsync,
    async: false,
    schema,
    "~run"(dataset, config2) {
      const func = dataset.value;
      dataset.value = async (...args_) => {
        const returnsDataset = await this.schema["~run"](
          { value: await func(...args_) },
          config2
        );
        if (returnsDataset.issues) {
          throw new ValiError(returnsDataset.issues);
        }
        return returnsDataset.value;
      };
      return dataset;
    }
  };
}

// src/actions/rfcEmail/rfcEmail.ts
// @__NO_SIDE_EFFECTS__
function rfcEmail(message2) {
  return {
    kind: "validation",
    type: "rfc_email",
    reference: rfcEmail,
    expects: null,
    async: false,
    requirement: RFC_EMAIL_REGEX,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, "email", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/actions/safeInteger/safeInteger.ts
// @__NO_SIDE_EFFECTS__
function safeInteger(message2) {
  return {
    kind: "validation",
    type: "safe_integer",
    reference: safeInteger,
    async: false,
    expects: null,
    requirement: Number.isSafeInteger,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !this.requirement(dataset.value)) {
        _addIssue(this, "safe integer", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/actions/size/size.ts
// @__NO_SIDE_EFFECTS__
function size(requirement, message2) {
  return {
    kind: "validation",
    type: "size",
    reference: size,
    async: false,
    expects: `${requirement}`,
    requirement,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && dataset.value.size !== this.requirement) {
        _addIssue(this, "size", dataset, config2, {
          received: `${dataset.value.size}`
        });
      }
      return dataset;
    }
  };
}

// src/actions/slug/slug.ts
// @__NO_SIDE_EFFECTS__
function slug(message2) {
  return {
    kind: "validation",
    type: "slug",
    reference: slug,
    async: false,
    expects: null,
    requirement: SLUG_REGEX,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, "slug", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/actions/someItem/someItem.ts
// @__NO_SIDE_EFFECTS__
function someItem(requirement, message2) {
  return {
    kind: "validation",
    type: "some_item",
    reference: someItem,
    async: false,
    expects: null,
    requirement,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !dataset.value.some(this.requirement)) {
        _addIssue(this, "item", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/actions/sortItems/sortItems.ts
// @__NO_SIDE_EFFECTS__
function sortItems(operation) {
  return {
    kind: "transformation",
    type: "sort_items",
    reference: sortItems,
    async: false,
    operation,
    "~run"(dataset) {
      dataset.value = dataset.value.sort(this.operation);
      return dataset;
    }
  };
}

// src/actions/startsWith/startsWith.ts
// @__NO_SIDE_EFFECTS__
function startsWith(requirement, message2) {
  return {
    kind: "validation",
    type: "starts_with",
    reference: startsWith,
    async: false,
    expects: `"${requirement}"`,
    requirement,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !dataset.value.startsWith(this.requirement)) {
        _addIssue(this, "start", dataset, config2, {
          received: `"${dataset.value.slice(0, this.requirement.length)}"`
        });
      }
      return dataset;
    }
  };
}

// src/actions/stringifyJson/stringifyJson.ts
// @__NO_SIDE_EFFECTS__
function stringifyJson(config2, message2) {
  return {
    kind: "transformation",
    type: "stringify_json",
    reference: stringifyJson,
    message: message2,
    config: config2,
    async: false,
    "~run"(dataset, config3) {
      try {
        const output = JSON.stringify(
          dataset.value,
          // @ts-expect-error
          this.config?.replacer,
          this.config?.space
        );
        if (output === void 0) {
          _addIssue(this, "JSON", dataset, config3);
          dataset.typed = false;
        }
        dataset.value = output;
      } catch (error) {
        if (error instanceof Error) {
          _addIssue(this, "JSON", dataset, config3, {
            received: `"${error.message}"`
          });
          dataset.typed = false;
        } else {
          throw error;
        }
      }
      return dataset;
    }
  };
}

// src/actions/title/title.ts
// @__NO_SIDE_EFFECTS__
function title(title_) {
  return {
    kind: "metadata",
    type: "title",
    reference: title,
    title: title_
  };
}

// src/actions/toLowerCase/toLowerCase.ts
// @__NO_SIDE_EFFECTS__
function toLowerCase() {
  return {
    kind: "transformation",
    type: "to_lower_case",
    reference: toLowerCase,
    async: false,
    "~run"(dataset) {
      dataset.value = dataset.value.toLowerCase();
      return dataset;
    }
  };
}

// src/actions/toMaxValue/toMaxValue.ts
// @__NO_SIDE_EFFECTS__
function toMaxValue(requirement) {
  return {
    kind: "transformation",
    type: "to_max_value",
    reference: toMaxValue,
    async: false,
    requirement,
    "~run"(dataset) {
      dataset.value = dataset.value > this.requirement ? this.requirement : dataset.value;
      return dataset;
    }
  };
}

// src/actions/toMinValue/toMinValue.ts
// @__NO_SIDE_EFFECTS__
function toMinValue(requirement) {
  return {
    kind: "transformation",
    type: "to_min_value",
    reference: toMinValue,
    async: false,
    requirement,
    "~run"(dataset) {
      dataset.value = dataset.value < this.requirement ? this.requirement : dataset.value;
      return dataset;
    }
  };
}

// src/actions/toUpperCase/toUpperCase.ts
// @__NO_SIDE_EFFECTS__
function toUpperCase() {
  return {
    kind: "transformation",
    type: "to_upper_case",
    reference: toUpperCase,
    async: false,
    "~run"(dataset) {
      dataset.value = dataset.value.toUpperCase();
      return dataset;
    }
  };
}

// src/actions/transform/transform.ts
// @__NO_SIDE_EFFECTS__
function transform(operation) {
  return {
    kind: "transformation",
    type: "transform",
    reference: transform,
    async: false,
    operation,
    "~run"(dataset) {
      dataset.value = this.operation(dataset.value);
      return dataset;
    }
  };
}

// src/actions/transform/transformAsync.ts
// @__NO_SIDE_EFFECTS__
function transformAsync(operation) {
  return {
    kind: "transformation",
    type: "transform",
    reference: transformAsync,
    async: true,
    operation,
    async "~run"(dataset) {
      dataset.value = await this.operation(dataset.value);
      return dataset;
    }
  };
}

// src/actions/trim/trim.ts
// @__NO_SIDE_EFFECTS__
function trim() {
  return {
    kind: "transformation",
    type: "trim",
    reference: trim,
    async: false,
    "~run"(dataset) {
      dataset.value = dataset.value.trim();
      return dataset;
    }
  };
}

// src/actions/trimEnd/trimEnd.ts
// @__NO_SIDE_EFFECTS__
function trimEnd() {
  return {
    kind: "transformation",
    type: "trim_end",
    reference: trimEnd,
    async: false,
    "~run"(dataset) {
      dataset.value = dataset.value.trimEnd();
      return dataset;
    }
  };
}

// src/actions/trimStart/trimStart.ts
// @__NO_SIDE_EFFECTS__
function trimStart() {
  return {
    kind: "transformation",
    type: "trim_start",
    reference: trimStart,
    async: false,
    "~run"(dataset) {
      dataset.value = dataset.value.trimStart();
      return dataset;
    }
  };
}

// src/actions/ulid/ulid.ts
// @__NO_SIDE_EFFECTS__
function ulid(message2) {
  return {
    kind: "validation",
    type: "ulid",
    reference: ulid,
    async: false,
    expects: null,
    requirement: ULID_REGEX,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, "ULID", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/actions/url/url.ts
// @__NO_SIDE_EFFECTS__
function url(message2) {
  return {
    kind: "validation",
    type: "url",
    reference: url,
    async: false,
    expects: null,
    requirement(input) {
      try {
        new URL(input);
        return true;
      } catch {
        return false;
      }
    },
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !this.requirement(dataset.value)) {
        _addIssue(this, "URL", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/actions/uuid/uuid.ts
// @__NO_SIDE_EFFECTS__
function uuid(message2) {
  return {
    kind: "validation",
    type: "uuid",
    reference: uuid,
    async: false,
    expects: null,
    requirement: UUID_REGEX,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, "UUID", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/actions/value/value.ts
// @__NO_SIDE_EFFECTS__
function value(requirement, message2) {
  return {
    kind: "validation",
    type: "value",
    reference: value,
    async: false,
    expects: requirement instanceof Date ? requirement.toJSON() : _stringify(requirement),
    requirement,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !(this.requirement <= dataset.value && this.requirement >= dataset.value)) {
        _addIssue(this, "value", dataset, config2, {
          received: dataset.value instanceof Date ? dataset.value.toJSON() : _stringify(dataset.value)
        });
      }
      return dataset;
    }
  };
}

// src/actions/values/values.ts
// @__NO_SIDE_EFFECTS__
function values(requirement, message2) {
  return {
    kind: "validation",
    type: "values",
    reference: values,
    async: false,
    expects: `${_joinExpects(
      requirement.map(
        (value2) => value2 instanceof Date ? value2.toJSON() : _stringify(value2)
      ),
      "|"
    )}`,
    requirement,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed && !this.requirement.some(
        (value2) => value2 <= dataset.value && value2 >= dataset.value
      )) {
        _addIssue(this, "value", dataset, config2, {
          received: dataset.value instanceof Date ? dataset.value.toJSON() : _stringify(dataset.value)
        });
      }
      return dataset;
    }
  };
}

// src/actions/words/words.ts
// @__NO_SIDE_EFFECTS__
function words(locales, requirement, message2) {
  return {
    kind: "validation",
    type: "words",
    reference: words,
    async: false,
    expects: `${requirement}`,
    locales,
    requirement,
    message: message2,
    "~run"(dataset, config2) {
      if (dataset.typed) {
        const count = _getWordCount(this.locales, dataset.value);
        if (count !== this.requirement) {
          _addIssue(this, "words", dataset, config2, {
            received: `${count}`
          });
        }
      }
      return dataset;
    }
  };
}

// src/methods/assert/assert.ts
function assert(schema, input) {
  const issues = schema["~run"]({ value: input }, { abortEarly: true }).issues;
  if (issues) {
    throw new ValiError(issues);
  }
}

// src/methods/config/config.ts
// @__NO_SIDE_EFFECTS__
function config(schema, config2) {
  return {
    ...schema,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config_) {
      return schema["~run"](dataset, { ...config_, ...config2 });
    }
  };
}

// src/methods/getFallback/getFallback.ts
// @__NO_SIDE_EFFECTS__
function getFallback(schema, dataset, config2) {
  return typeof schema.fallback === "function" ? (
    // @ts-expect-error
    schema.fallback(dataset, config2)
  ) : (
    // @ts-expect-error
    schema.fallback
  );
}

// src/methods/fallback/fallback.ts
// @__NO_SIDE_EFFECTS__
function fallback(schema, fallback2) {
  return {
    ...schema,
    fallback: fallback2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      const outputDataset = schema["~run"](dataset, config2);
      return outputDataset.issues ? { typed: true, value: getFallback(this, outputDataset, config2) } : outputDataset;
    }
  };
}

// src/methods/fallback/fallbackAsync.ts
// @__NO_SIDE_EFFECTS__
function fallbackAsync(schema, fallback2) {
  return {
    ...schema,
    fallback: fallback2,
    async: true,
    get "~standard"() {
      return _getStandardProps(this);
    },
    async "~run"(dataset, config2) {
      const outputDataset = await schema["~run"](dataset, config2);
      return outputDataset.issues ? {
        typed: true,
        value: await getFallback(this, outputDataset, config2)
      } : outputDataset;
    }
  };
}

// src/methods/flatten/flatten.ts
// @__NO_SIDE_EFFECTS__
function flatten(issues) {
  const flatErrors = {};
  for (const issue of issues) {
    if (issue.path) {
      const dotPath = getDotPath(issue);
      if (dotPath) {
        if (!flatErrors.nested) {
          flatErrors.nested = {};
        }
        if (flatErrors.nested[dotPath]) {
          flatErrors.nested[dotPath].push(issue.message);
        } else {
          flatErrors.nested[dotPath] = [issue.message];
        }
      } else {
        if (flatErrors.other) {
          flatErrors.other.push(issue.message);
        } else {
          flatErrors.other = [issue.message];
        }
      }
    } else {
      if (flatErrors.root) {
        flatErrors.root.push(issue.message);
      } else {
        flatErrors.root = [issue.message];
      }
    }
  }
  return flatErrors;
}

// src/methods/forward/forward.ts
// @__NO_SIDE_EFFECTS__
function forward(action, path) {
  return {
    ...action,
    "~run"(dataset, config2) {
      const prevIssues = dataset.issues && [...dataset.issues];
      dataset = action["~run"](dataset, config2);
      if (dataset.issues) {
        for (const issue of dataset.issues) {
          if (!prevIssues?.includes(issue)) {
            let pathInput = dataset.value;
            for (const key of path) {
              const pathValue = pathInput[key];
              const pathItem = {
                type: "unknown",
                origin: "value",
                input: pathInput,
                key,
                value: pathValue
              };
              if (issue.path) {
                issue.path.push(pathItem);
              } else {
                issue.path = [pathItem];
              }
              if (!pathValue) {
                break;
              }
              pathInput = pathValue;
            }
          }
        }
      }
      return dataset;
    }
  };
}

// src/methods/forward/forwardAsync.ts
// @__NO_SIDE_EFFECTS__
function forwardAsync(action, path) {
  return {
    ...action,
    async: true,
    async "~run"(dataset, config2) {
      const prevIssues = dataset.issues && [...dataset.issues];
      dataset = await action["~run"](dataset, config2);
      if (dataset.issues) {
        for (const issue of dataset.issues) {
          if (!prevIssues?.includes(issue)) {
            let pathInput = dataset.value;
            for (const key of path) {
              const pathValue = pathInput[key];
              const pathItem = {
                type: "unknown",
                origin: "value",
                input: pathInput,
                key,
                value: pathValue
              };
              if (issue.path) {
                issue.path.push(pathItem);
              } else {
                issue.path = [pathItem];
              }
              if (!pathValue) {
                break;
              }
              pathInput = pathValue;
            }
          }
        }
      }
      return dataset;
    }
  };
}

// src/methods/getDefault/getDefault.ts
// @__NO_SIDE_EFFECTS__
function getDefault(schema, dataset, config2) {
  return typeof schema.default === "function" ? (
    // @ts-expect-error
    schema.default(dataset, config2)
  ) : (
    // @ts-expect-error
    schema.default
  );
}

// src/methods/getDefaults/getDefaults.ts
// @__NO_SIDE_EFFECTS__
function getDefaults(schema) {
  if ("entries" in schema) {
    const object2 = {};
    for (const key in schema.entries) {
      object2[key] = /* @__PURE__ */ getDefaults(schema.entries[key]);
    }
    return object2;
  }
  if ("items" in schema) {
    return schema.items.map(getDefaults);
  }
  return getDefault(schema);
}

// src/methods/getDefaults/getDefaultsAsync.ts
// @__NO_SIDE_EFFECTS__
async function getDefaultsAsync(schema) {
  if ("entries" in schema) {
    return Object.fromEntries(
      await Promise.all(
        Object.entries(schema.entries).map(async ([key, value2]) => [
          key,
          await /* @__PURE__ */ getDefaultsAsync(value2)
        ])
      )
    );
  }
  if ("items" in schema) {
    return Promise.all(schema.items.map(getDefaultsAsync));
  }
  return getDefault(schema);
}

// src/methods/getDescription/getDescription.ts
// @__NO_SIDE_EFFECTS__
function getDescription(schema) {
  return _getLastMetadata(schema, "description");
}

// src/methods/getFallbacks/getFallbacks.ts
// @__NO_SIDE_EFFECTS__
function getFallbacks(schema) {
  if ("entries" in schema) {
    const object2 = {};
    for (const key in schema.entries) {
      object2[key] = /* @__PURE__ */ getFallbacks(schema.entries[key]);
    }
    return object2;
  }
  if ("items" in schema) {
    return schema.items.map(getFallbacks);
  }
  return getFallback(schema);
}

// src/methods/getFallbacks/getFallbacksAsync.ts
// @__NO_SIDE_EFFECTS__
async function getFallbacksAsync(schema) {
  if ("entries" in schema) {
    return Object.fromEntries(
      await Promise.all(
        Object.entries(schema.entries).map(async ([key, value2]) => [
          key,
          await /* @__PURE__ */ getFallbacksAsync(value2)
        ])
      )
    );
  }
  if ("items" in schema) {
    return Promise.all(schema.items.map(getFallbacksAsync));
  }
  return getFallback(schema);
}

// src/methods/getMetadata/getMetadata.ts
// @__NO_SIDE_EFFECTS__
function getMetadata(schema) {
  const result = {};
  function depthFirstMerge(schema2) {
    if ("pipe" in schema2) {
      for (const item of schema2.pipe) {
        if (item.kind === "schema" && "pipe" in item) {
          depthFirstMerge(item);
        } else if (item.kind === "metadata" && item.type === "metadata") {
          Object.assign(result, item.metadata);
        }
      }
    }
  }
  depthFirstMerge(schema);
  return result;
}

// src/methods/getTitle/getTitle.ts
// @__NO_SIDE_EFFECTS__
function getTitle(schema) {
  return _getLastMetadata(schema, "title");
}

// src/methods/is/is.ts
// @__NO_SIDE_EFFECTS__
function is(schema, input) {
  return !schema["~run"]({ value: input }, { abortEarly: true }).issues;
}

// src/schemas/any/any.ts
// @__NO_SIDE_EFFECTS__
function any() {
  return {
    kind: "schema",
    type: "any",
    reference: any,
    expects: "any",
    async: false,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset) {
      dataset.typed = true;
      return dataset;
    }
  };
}

// src/schemas/array/array.ts
// @__NO_SIDE_EFFECTS__
function array(item, message2) {
  return {
    kind: "schema",
    type: "array",
    reference: array,
    expects: "Array",
    async: false,
    item,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      const input = dataset.value;
      if (Array.isArray(input)) {
        dataset.typed = true;
        dataset.value = [];
        for (let key = 0; key < input.length; key++) {
          const value2 = input[key];
          const itemDataset = this.item["~run"]({ value: value2 }, config2);
          if (itemDataset.issues) {
            const pathItem = {
              type: "array",
              origin: "value",
              input,
              key,
              value: value2
            };
            for (const issue of itemDataset.issues) {
              if (issue.path) {
                issue.path.unshift(pathItem);
              } else {
                issue.path = [pathItem];
              }
              dataset.issues?.push(issue);
            }
            if (!dataset.issues) {
              dataset.issues = itemDataset.issues;
            }
            if (config2.abortEarly) {
              dataset.typed = false;
              break;
            }
          }
          if (!itemDataset.typed) {
            dataset.typed = false;
          }
          dataset.value.push(itemDataset.value);
        }
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/array/arrayAsync.ts
// @__NO_SIDE_EFFECTS__
function arrayAsync(item, message2) {
  return {
    kind: "schema",
    type: "array",
    reference: arrayAsync,
    expects: "Array",
    async: true,
    item,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    async "~run"(dataset, config2) {
      const input = dataset.value;
      if (Array.isArray(input)) {
        dataset.typed = true;
        dataset.value = [];
        const itemDatasets = await Promise.all(
          input.map((value2) => this.item["~run"]({ value: value2 }, config2))
        );
        for (let key = 0; key < itemDatasets.length; key++) {
          const itemDataset = itemDatasets[key];
          if (itemDataset.issues) {
            const pathItem = {
              type: "array",
              origin: "value",
              input,
              key,
              value: input[key]
            };
            for (const issue of itemDataset.issues) {
              if (issue.path) {
                issue.path.unshift(pathItem);
              } else {
                issue.path = [pathItem];
              }
              dataset.issues?.push(issue);
            }
            if (!dataset.issues) {
              dataset.issues = itemDataset.issues;
            }
            if (config2.abortEarly) {
              dataset.typed = false;
              break;
            }
          }
          if (!itemDataset.typed) {
            dataset.typed = false;
          }
          dataset.value.push(itemDataset.value);
        }
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/bigint/bigint.ts
// @__NO_SIDE_EFFECTS__
function bigint(message2) {
  return {
    kind: "schema",
    type: "bigint",
    reference: bigint,
    expects: "bigint",
    async: false,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      if (typeof dataset.value === "bigint") {
        dataset.typed = true;
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/blob/blob.ts
// @__NO_SIDE_EFFECTS__
function blob(message2) {
  return {
    kind: "schema",
    type: "blob",
    reference: blob,
    expects: "Blob",
    async: false,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      if (dataset.value instanceof Blob) {
        dataset.typed = true;
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/boolean/boolean.ts
// @__NO_SIDE_EFFECTS__
function boolean(message2) {
  return {
    kind: "schema",
    type: "boolean",
    reference: boolean,
    expects: "boolean",
    async: false,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      if (typeof dataset.value === "boolean") {
        dataset.typed = true;
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/custom/custom.ts
// @__NO_SIDE_EFFECTS__
function custom(check2, message2) {
  return {
    kind: "schema",
    type: "custom",
    reference: custom,
    expects: "unknown",
    async: false,
    check: check2,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      if (this.check(dataset.value)) {
        dataset.typed = true;
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/custom/customAsync.ts
// @__NO_SIDE_EFFECTS__
function customAsync(check2, message2) {
  return {
    kind: "schema",
    type: "custom",
    reference: customAsync,
    expects: "unknown",
    async: true,
    check: check2,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    async "~run"(dataset, config2) {
      if (await this.check(dataset.value)) {
        dataset.typed = true;
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/date/date.ts
// @__NO_SIDE_EFFECTS__
function date(message2) {
  return {
    kind: "schema",
    type: "date",
    reference: date,
    expects: "Date",
    async: false,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      if (dataset.value instanceof Date) {
        if (!isNaN(dataset.value)) {
          dataset.typed = true;
        } else {
          _addIssue(this, "type", dataset, config2, {
            received: '"Invalid Date"'
          });
        }
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/enum/enum.ts
// @__NO_SIDE_EFFECTS__
function enum_(enum__, message2) {
  const options = [];
  for (const key in enum__) {
    if (`${+key}` !== key || typeof enum__[key] !== "string" || !Object.is(enum__[enum__[key]], +key)) {
      options.push(enum__[key]);
    }
  }
  return {
    kind: "schema",
    type: "enum",
    reference: enum_,
    expects: _joinExpects(options.map(_stringify), "|"),
    async: false,
    enum: enum__,
    options,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      if (this.options.includes(dataset.value)) {
        dataset.typed = true;
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/exactOptional/exactOptional.ts
// @__NO_SIDE_EFFECTS__
function exactOptional(wrapped, default_) {
  return {
    kind: "schema",
    type: "exact_optional",
    reference: exactOptional,
    expects: wrapped.expects,
    async: false,
    wrapped,
    default: default_,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      return this.wrapped["~run"](dataset, config2);
    }
  };
}

// src/schemas/exactOptional/exactOptionalAsync.ts
// @__NO_SIDE_EFFECTS__
function exactOptionalAsync(wrapped, default_) {
  return {
    kind: "schema",
    type: "exact_optional",
    reference: exactOptionalAsync,
    expects: wrapped.expects,
    async: true,
    wrapped,
    default: default_,
    get "~standard"() {
      return _getStandardProps(this);
    },
    async "~run"(dataset, config2) {
      return this.wrapped["~run"](dataset, config2);
    }
  };
}

// src/schemas/file/file.ts
// @__NO_SIDE_EFFECTS__
function file(message2) {
  return {
    kind: "schema",
    type: "file",
    reference: file,
    expects: "File",
    async: false,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      if (dataset.value instanceof File) {
        dataset.typed = true;
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/function/function.ts
// @__NO_SIDE_EFFECTS__
function function_(message2) {
  return {
    kind: "schema",
    type: "function",
    reference: function_,
    expects: "Function",
    async: false,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      if (typeof dataset.value === "function") {
        dataset.typed = true;
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/instance/instance.ts
// @__NO_SIDE_EFFECTS__
function instance(class_, message2) {
  return {
    kind: "schema",
    type: "instance",
    reference: instance,
    expects: class_.name,
    async: false,
    class: class_,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      if (dataset.value instanceof this.class) {
        dataset.typed = true;
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/intersect/utils/_merge/_merge.ts
// @__NO_SIDE_EFFECTS__
function _merge(value1, value2) {
  if (typeof value1 === typeof value2) {
    if (value1 === value2 || value1 instanceof Date && value2 instanceof Date && +value1 === +value2) {
      return { value: value1 };
    }
    if (value1 && value2 && value1.constructor === Object && value2.constructor === Object) {
      for (const key in value2) {
        if (key in value1) {
          const dataset = /* @__PURE__ */ _merge(value1[key], value2[key]);
          if (dataset.issue) {
            return dataset;
          }
          value1[key] = dataset.value;
        } else {
          value1[key] = value2[key];
        }
      }
      return { value: value1 };
    }
    if (Array.isArray(value1) && Array.isArray(value2)) {
      if (value1.length === value2.length) {
        for (let index = 0; index < value1.length; index++) {
          const dataset = /* @__PURE__ */ _merge(value1[index], value2[index]);
          if (dataset.issue) {
            return dataset;
          }
          value1[index] = dataset.value;
        }
        return { value: value1 };
      }
    }
  }
  return { issue: true };
}

// src/schemas/intersect/intersect.ts
// @__NO_SIDE_EFFECTS__
function intersect(options, message2) {
  return {
    kind: "schema",
    type: "intersect",
    reference: intersect,
    expects: _joinExpects(
      options.map((option) => option.expects),
      "&"
    ),
    async: false,
    options,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      if (this.options.length) {
        const input = dataset.value;
        let outputs;
        dataset.typed = true;
        for (const schema of this.options) {
          const optionDataset = schema["~run"]({ value: input }, config2);
          if (optionDataset.issues) {
            if (dataset.issues) {
              dataset.issues.push(...optionDataset.issues);
            } else {
              dataset.issues = optionDataset.issues;
            }
            if (config2.abortEarly) {
              dataset.typed = false;
              break;
            }
          }
          if (!optionDataset.typed) {
            dataset.typed = false;
          }
          if (dataset.typed) {
            if (outputs) {
              outputs.push(optionDataset.value);
            } else {
              outputs = [optionDataset.value];
            }
          }
        }
        if (dataset.typed) {
          dataset.value = outputs[0];
          for (let index = 1; index < outputs.length; index++) {
            const mergeDataset = _merge(dataset.value, outputs[index]);
            if (mergeDataset.issue) {
              _addIssue(this, "type", dataset, config2, {
                received: "unknown"
              });
              break;
            }
            dataset.value = mergeDataset.value;
          }
        }
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/intersect/intersectAsync.ts
// @__NO_SIDE_EFFECTS__
function intersectAsync(options, message2) {
  return {
    kind: "schema",
    type: "intersect",
    reference: intersectAsync,
    expects: _joinExpects(
      options.map((option) => option.expects),
      "&"
    ),
    async: true,
    options,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    async "~run"(dataset, config2) {
      if (this.options.length) {
        const input = dataset.value;
        let outputs;
        dataset.typed = true;
        const optionDatasets = await Promise.all(
          this.options.map((schema) => schema["~run"]({ value: input }, config2))
        );
        for (const optionDataset of optionDatasets) {
          if (optionDataset.issues) {
            if (dataset.issues) {
              dataset.issues.push(...optionDataset.issues);
            } else {
              dataset.issues = optionDataset.issues;
            }
            if (config2.abortEarly) {
              dataset.typed = false;
              break;
            }
          }
          if (!optionDataset.typed) {
            dataset.typed = false;
          }
          if (dataset.typed) {
            if (outputs) {
              outputs.push(optionDataset.value);
            } else {
              outputs = [optionDataset.value];
            }
          }
        }
        if (dataset.typed) {
          dataset.value = outputs[0];
          for (let index = 1; index < outputs.length; index++) {
            const mergeDataset = _merge(dataset.value, outputs[index]);
            if (mergeDataset.issue) {
              _addIssue(this, "type", dataset, config2, {
                received: "unknown"
              });
              break;
            }
            dataset.value = mergeDataset.value;
          }
        }
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/lazy/lazy.ts
// @__NO_SIDE_EFFECTS__
function lazy(getter) {
  return {
    kind: "schema",
    type: "lazy",
    reference: lazy,
    expects: "unknown",
    async: false,
    getter,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      return this.getter(dataset.value)["~run"](dataset, config2);
    }
  };
}

// src/schemas/lazy/lazyAsync.ts
// @__NO_SIDE_EFFECTS__
function lazyAsync(getter) {
  return {
    kind: "schema",
    type: "lazy",
    reference: lazyAsync,
    expects: "unknown",
    async: true,
    getter,
    get "~standard"() {
      return _getStandardProps(this);
    },
    async "~run"(dataset, config2) {
      return (await this.getter(dataset.value))["~run"](dataset, config2);
    }
  };
}

// src/schemas/literal/literal.ts
// @__NO_SIDE_EFFECTS__
function literal(literal_, message2) {
  return {
    kind: "schema",
    type: "literal",
    reference: literal,
    expects: _stringify(literal_),
    async: false,
    literal: literal_,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      if (dataset.value === this.literal) {
        dataset.typed = true;
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/looseObject/looseObject.ts
// @__NO_SIDE_EFFECTS__
function looseObject(entries2, message2) {
  return {
    kind: "schema",
    type: "loose_object",
    reference: looseObject,
    expects: "Object",
    async: false,
    entries: entries2,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      const input = dataset.value;
      if (input && typeof input === "object") {
        dataset.typed = true;
        dataset.value = {};
        for (const key in this.entries) {
          const valueSchema = this.entries[key];
          if (key in input || (valueSchema.type === "exact_optional" || valueSchema.type === "optional" || valueSchema.type === "nullish") && // @ts-expect-error
          valueSchema.default !== void 0) {
            const value2 = key in input ? (
              // @ts-expect-error
              input[key]
            ) : getDefault(valueSchema);
            const valueDataset = valueSchema["~run"]({ value: value2 }, config2);
            if (valueDataset.issues) {
              const pathItem = {
                type: "object",
                origin: "value",
                input,
                key,
                value: value2
              };
              for (const issue of valueDataset.issues) {
                if (issue.path) {
                  issue.path.unshift(pathItem);
                } else {
                  issue.path = [pathItem];
                }
                dataset.issues?.push(issue);
              }
              if (!dataset.issues) {
                dataset.issues = valueDataset.issues;
              }
              if (config2.abortEarly) {
                dataset.typed = false;
                break;
              }
            }
            if (!valueDataset.typed) {
              dataset.typed = false;
            }
            dataset.value[key] = valueDataset.value;
          } else if (valueSchema.fallback !== void 0) {
            dataset.value[key] = getFallback(valueSchema);
          } else if (valueSchema.type !== "exact_optional" && valueSchema.type !== "optional" && valueSchema.type !== "nullish") {
            _addIssue(this, "key", dataset, config2, {
              input: void 0,
              expected: `"${key}"`,
              path: [
                {
                  type: "object",
                  origin: "key",
                  input,
                  key,
                  // @ts-expect-error
                  value: input[key]
                }
              ]
            });
            if (config2.abortEarly) {
              break;
            }
          }
        }
        if (!dataset.issues || !config2.abortEarly) {
          for (const key in input) {
            if (_isValidObjectKey(input, key) && !(key in this.entries)) {
              dataset.value[key] = input[key];
            }
          }
        }
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/looseObject/looseObjectAsync.ts
// @__NO_SIDE_EFFECTS__
function looseObjectAsync(entries2, message2) {
  return {
    kind: "schema",
    type: "loose_object",
    reference: looseObjectAsync,
    expects: "Object",
    async: true,
    entries: entries2,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    async "~run"(dataset, config2) {
      const input = dataset.value;
      if (input && typeof input === "object") {
        dataset.typed = true;
        dataset.value = {};
        const valueDatasets = await Promise.all(
          Object.entries(this.entries).map(async ([key, valueSchema]) => {
            if (key in input || (valueSchema.type === "exact_optional" || valueSchema.type === "optional" || valueSchema.type === "nullish") && // @ts-expect-error
            valueSchema.default !== void 0) {
              const value2 = key in input ? (
                // @ts-expect-error
                input[key]
              ) : await getDefault(valueSchema);
              return [
                key,
                value2,
                valueSchema,
                await valueSchema["~run"]({ value: value2 }, config2)
              ];
            }
            return [
              key,
              // @ts-expect-error
              input[key],
              valueSchema,
              null
            ];
          })
        );
        for (const [key, value2, valueSchema, valueDataset] of valueDatasets) {
          if (valueDataset) {
            if (valueDataset.issues) {
              const pathItem = {
                type: "object",
                origin: "value",
                input,
                key,
                value: value2
              };
              for (const issue of valueDataset.issues) {
                if (issue.path) {
                  issue.path.unshift(pathItem);
                } else {
                  issue.path = [pathItem];
                }
                dataset.issues?.push(issue);
              }
              if (!dataset.issues) {
                dataset.issues = valueDataset.issues;
              }
              if (config2.abortEarly) {
                dataset.typed = false;
                break;
              }
            }
            if (!valueDataset.typed) {
              dataset.typed = false;
            }
            dataset.value[key] = valueDataset.value;
          } else if (valueSchema.fallback !== void 0) {
            dataset.value[key] = await getFallback(valueSchema);
          } else if (valueSchema.type !== "exact_optional" && valueSchema.type !== "optional" && valueSchema.type !== "nullish") {
            _addIssue(this, "key", dataset, config2, {
              input: void 0,
              expected: `"${key}"`,
              path: [
                {
                  type: "object",
                  origin: "key",
                  input,
                  key,
                  value: value2
                }
              ]
            });
            if (config2.abortEarly) {
              break;
            }
          }
        }
        if (!dataset.issues || !config2.abortEarly) {
          for (const key in input) {
            if (_isValidObjectKey(input, key) && !(key in this.entries)) {
              dataset.value[key] = input[key];
            }
          }
        }
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/looseTuple/looseTuple.ts
// @__NO_SIDE_EFFECTS__
function looseTuple(items, message2) {
  return {
    kind: "schema",
    type: "loose_tuple",
    reference: looseTuple,
    expects: "Array",
    async: false,
    items,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      const input = dataset.value;
      if (Array.isArray(input)) {
        dataset.typed = true;
        dataset.value = [];
        for (let key = 0; key < this.items.length; key++) {
          const value2 = input[key];
          const itemDataset = this.items[key]["~run"]({ value: value2 }, config2);
          if (itemDataset.issues) {
            const pathItem = {
              type: "array",
              origin: "value",
              input,
              key,
              value: value2
            };
            for (const issue of itemDataset.issues) {
              if (issue.path) {
                issue.path.unshift(pathItem);
              } else {
                issue.path = [pathItem];
              }
              dataset.issues?.push(issue);
            }
            if (!dataset.issues) {
              dataset.issues = itemDataset.issues;
            }
            if (config2.abortEarly) {
              dataset.typed = false;
              break;
            }
          }
          if (!itemDataset.typed) {
            dataset.typed = false;
          }
          dataset.value.push(itemDataset.value);
        }
        if (!dataset.issues || !config2.abortEarly) {
          for (let key = this.items.length; key < input.length; key++) {
            dataset.value.push(input[key]);
          }
        }
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/looseTuple/looseTupleAsync.ts
// @__NO_SIDE_EFFECTS__
function looseTupleAsync(items, message2) {
  return {
    kind: "schema",
    type: "loose_tuple",
    reference: looseTupleAsync,
    expects: "Array",
    async: true,
    items,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    async "~run"(dataset, config2) {
      const input = dataset.value;
      if (Array.isArray(input)) {
        dataset.typed = true;
        dataset.value = [];
        const itemDatasets = await Promise.all(
          this.items.map(async (item, key) => {
            const value2 = input[key];
            return [key, value2, await item["~run"]({ value: value2 }, config2)];
          })
        );
        for (const [key, value2, itemDataset] of itemDatasets) {
          if (itemDataset.issues) {
            const pathItem = {
              type: "array",
              origin: "value",
              input,
              key,
              value: value2
            };
            for (const issue of itemDataset.issues) {
              if (issue.path) {
                issue.path.unshift(pathItem);
              } else {
                issue.path = [pathItem];
              }
              dataset.issues?.push(issue);
            }
            if (!dataset.issues) {
              dataset.issues = itemDataset.issues;
            }
            if (config2.abortEarly) {
              dataset.typed = false;
              break;
            }
          }
          if (!itemDataset.typed) {
            dataset.typed = false;
          }
          dataset.value.push(itemDataset.value);
        }
        if (!dataset.issues || !config2.abortEarly) {
          for (let key = this.items.length; key < input.length; key++) {
            dataset.value.push(input[key]);
          }
        }
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/map/map.ts
// @__NO_SIDE_EFFECTS__
function map(key, value2, message2) {
  return {
    kind: "schema",
    type: "map",
    reference: map,
    expects: "Map",
    async: false,
    key,
    value: value2,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      const input = dataset.value;
      if (input instanceof Map) {
        dataset.typed = true;
        dataset.value = /* @__PURE__ */ new Map();
        for (const [inputKey, inputValue] of input) {
          const keyDataset = this.key["~run"]({ value: inputKey }, config2);
          if (keyDataset.issues) {
            const pathItem = {
              type: "map",
              origin: "key",
              input,
              key: inputKey,
              value: inputValue
            };
            for (const issue of keyDataset.issues) {
              if (issue.path) {
                issue.path.unshift(pathItem);
              } else {
                issue.path = [pathItem];
              }
              dataset.issues?.push(issue);
            }
            if (!dataset.issues) {
              dataset.issues = keyDataset.issues;
            }
            if (config2.abortEarly) {
              dataset.typed = false;
              break;
            }
          }
          const valueDataset = this.value["~run"](
            { value: inputValue },
            config2
          );
          if (valueDataset.issues) {
            const pathItem = {
              type: "map",
              origin: "value",
              input,
              key: inputKey,
              value: inputValue
            };
            for (const issue of valueDataset.issues) {
              if (issue.path) {
                issue.path.unshift(pathItem);
              } else {
                issue.path = [pathItem];
              }
              dataset.issues?.push(issue);
            }
            if (!dataset.issues) {
              dataset.issues = valueDataset.issues;
            }
            if (config2.abortEarly) {
              dataset.typed = false;
              break;
            }
          }
          if (!keyDataset.typed || !valueDataset.typed) {
            dataset.typed = false;
          }
          dataset.value.set(keyDataset.value, valueDataset.value);
        }
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/map/mapAsync.ts
// @__NO_SIDE_EFFECTS__
function mapAsync(key, value2, message2) {
  return {
    kind: "schema",
    type: "map",
    reference: mapAsync,
    expects: "Map",
    async: true,
    key,
    value: value2,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    async "~run"(dataset, config2) {
      const input = dataset.value;
      if (input instanceof Map) {
        dataset.typed = true;
        dataset.value = /* @__PURE__ */ new Map();
        const datasets = await Promise.all(
          [...input].map(
            ([inputKey, inputValue]) => Promise.all([
              inputKey,
              inputValue,
              this.key["~run"]({ value: inputKey }, config2),
              this.value["~run"]({ value: inputValue }, config2)
            ])
          )
        );
        for (const [
          inputKey,
          inputValue,
          keyDataset,
          valueDataset
        ] of datasets) {
          if (keyDataset.issues) {
            const pathItem = {
              type: "map",
              origin: "key",
              input,
              key: inputKey,
              value: inputValue
            };
            for (const issue of keyDataset.issues) {
              if (issue.path) {
                issue.path.unshift(pathItem);
              } else {
                issue.path = [pathItem];
              }
              dataset.issues?.push(issue);
            }
            if (!dataset.issues) {
              dataset.issues = keyDataset.issues;
            }
            if (config2.abortEarly) {
              dataset.typed = false;
              break;
            }
          }
          if (valueDataset.issues) {
            const pathItem = {
              type: "map",
              origin: "value",
              input,
              key: inputKey,
              value: inputValue
            };
            for (const issue of valueDataset.issues) {
              if (issue.path) {
                issue.path.unshift(pathItem);
              } else {
                issue.path = [pathItem];
              }
              dataset.issues?.push(issue);
            }
            if (!dataset.issues) {
              dataset.issues = valueDataset.issues;
            }
            if (config2.abortEarly) {
              dataset.typed = false;
              break;
            }
          }
          if (!keyDataset.typed || !valueDataset.typed) {
            dataset.typed = false;
          }
          dataset.value.set(keyDataset.value, valueDataset.value);
        }
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/nan/nan.ts
// @__NO_SIDE_EFFECTS__
function nan(message2) {
  return {
    kind: "schema",
    type: "nan",
    reference: nan,
    expects: "NaN",
    async: false,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      if (Number.isNaN(dataset.value)) {
        dataset.typed = true;
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/never/never.ts
// @__NO_SIDE_EFFECTS__
function never(message2) {
  return {
    kind: "schema",
    type: "never",
    reference: never,
    expects: "never",
    async: false,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      _addIssue(this, "type", dataset, config2);
      return dataset;
    }
  };
}

// src/schemas/nonNullable/nonNullable.ts
// @__NO_SIDE_EFFECTS__
function nonNullable(wrapped, message2) {
  return {
    kind: "schema",
    type: "non_nullable",
    reference: nonNullable,
    expects: "!null",
    async: false,
    wrapped,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      if (dataset.value !== null) {
        dataset = this.wrapped["~run"](dataset, config2);
      }
      if (dataset.value === null) {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/nonNullable/nonNullableAsync.ts
// @__NO_SIDE_EFFECTS__
function nonNullableAsync(wrapped, message2) {
  return {
    kind: "schema",
    type: "non_nullable",
    reference: nonNullableAsync,
    expects: "!null",
    async: true,
    wrapped,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    async "~run"(dataset, config2) {
      if (dataset.value !== null) {
        dataset = await this.wrapped["~run"](dataset, config2);
      }
      if (dataset.value === null) {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/nonNullish/nonNullish.ts
// @__NO_SIDE_EFFECTS__
function nonNullish(wrapped, message2) {
  return {
    kind: "schema",
    type: "non_nullish",
    reference: nonNullish,
    expects: "(!null & !undefined)",
    async: false,
    wrapped,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      if (!(dataset.value === null || dataset.value === void 0)) {
        dataset = this.wrapped["~run"](dataset, config2);
      }
      if (dataset.value === null || dataset.value === void 0) {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/nonNullish/nonNullishAsync.ts
// @__NO_SIDE_EFFECTS__
function nonNullishAsync(wrapped, message2) {
  return {
    kind: "schema",
    type: "non_nullish",
    reference: nonNullishAsync,
    expects: "(!null & !undefined)",
    async: true,
    wrapped,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    async "~run"(dataset, config2) {
      if (!(dataset.value === null || dataset.value === void 0)) {
        dataset = await this.wrapped["~run"](dataset, config2);
      }
      if (dataset.value === null || dataset.value === void 0) {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/nonOptional/nonOptional.ts
// @__NO_SIDE_EFFECTS__
function nonOptional(wrapped, message2) {
  return {
    kind: "schema",
    type: "non_optional",
    reference: nonOptional,
    expects: "!undefined",
    async: false,
    wrapped,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      if (dataset.value !== void 0) {
        dataset = this.wrapped["~run"](dataset, config2);
      }
      if (dataset.value === void 0) {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/nonOptional/nonOptionalAsync.ts
// @__NO_SIDE_EFFECTS__
function nonOptionalAsync(wrapped, message2) {
  return {
    kind: "schema",
    type: "non_optional",
    reference: nonOptionalAsync,
    expects: "!undefined",
    async: true,
    wrapped,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    async "~run"(dataset, config2) {
      if (dataset.value !== void 0) {
        dataset = await this.wrapped["~run"](dataset, config2);
      }
      if (dataset.value === void 0) {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/null/null.ts
// @__NO_SIDE_EFFECTS__
function null_(message2) {
  return {
    kind: "schema",
    type: "null",
    reference: null_,
    expects: "null",
    async: false,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      if (dataset.value === null) {
        dataset.typed = true;
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/nullable/nullable.ts
// @__NO_SIDE_EFFECTS__
function nullable(wrapped, default_) {
  return {
    kind: "schema",
    type: "nullable",
    reference: nullable,
    expects: `(${wrapped.expects} | null)`,
    async: false,
    wrapped,
    default: default_,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      if (dataset.value === null) {
        if (this.default !== void 0) {
          dataset.value = getDefault(this, dataset, config2);
        }
        if (dataset.value === null) {
          dataset.typed = true;
          return dataset;
        }
      }
      return this.wrapped["~run"](dataset, config2);
    }
  };
}

// src/schemas/nullable/nullableAsync.ts
// @__NO_SIDE_EFFECTS__
function nullableAsync(wrapped, default_) {
  return {
    kind: "schema",
    type: "nullable",
    reference: nullableAsync,
    expects: `(${wrapped.expects} | null)`,
    async: true,
    wrapped,
    default: default_,
    get "~standard"() {
      return _getStandardProps(this);
    },
    async "~run"(dataset, config2) {
      if (dataset.value === null) {
        if (this.default !== void 0) {
          dataset.value = await getDefault(this, dataset, config2);
        }
        if (dataset.value === null) {
          dataset.typed = true;
          return dataset;
        }
      }
      return this.wrapped["~run"](dataset, config2);
    }
  };
}

// src/schemas/nullish/nullish.ts
// @__NO_SIDE_EFFECTS__
function nullish(wrapped, default_) {
  return {
    kind: "schema",
    type: "nullish",
    reference: nullish,
    expects: `(${wrapped.expects} | null | undefined)`,
    async: false,
    wrapped,
    default: default_,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      if (dataset.value === null || dataset.value === void 0) {
        if (this.default !== void 0) {
          dataset.value = getDefault(this, dataset, config2);
        }
        if (dataset.value === null || dataset.value === void 0) {
          dataset.typed = true;
          return dataset;
        }
      }
      return this.wrapped["~run"](dataset, config2);
    }
  };
}

// src/schemas/nullish/nullishAsync.ts
// @__NO_SIDE_EFFECTS__
function nullishAsync(wrapped, default_) {
  return {
    kind: "schema",
    type: "nullish",
    reference: nullishAsync,
    expects: `(${wrapped.expects} | null | undefined)`,
    async: true,
    wrapped,
    default: default_,
    get "~standard"() {
      return _getStandardProps(this);
    },
    async "~run"(dataset, config2) {
      if (dataset.value === null || dataset.value === void 0) {
        if (this.default !== void 0) {
          dataset.value = await getDefault(this, dataset, config2);
        }
        if (dataset.value === null || dataset.value === void 0) {
          dataset.typed = true;
          return dataset;
        }
      }
      return this.wrapped["~run"](dataset, config2);
    }
  };
}

// src/schemas/number/number.ts
// @__NO_SIDE_EFFECTS__
function number(message2) {
  return {
    kind: "schema",
    type: "number",
    reference: number,
    expects: "number",
    async: false,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      if (typeof dataset.value === "number" && !isNaN(dataset.value)) {
        dataset.typed = true;
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/object/object.ts
// @__NO_SIDE_EFFECTS__
function object(entries2, message2) {
  return {
    kind: "schema",
    type: "object",
    reference: object,
    expects: "Object",
    async: false,
    entries: entries2,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      const input = dataset.value;
      if (input && typeof input === "object") {
        dataset.typed = true;
        dataset.value = {};
        for (const key in this.entries) {
          const valueSchema = this.entries[key];
          if (key in input || (valueSchema.type === "exact_optional" || valueSchema.type === "optional" || valueSchema.type === "nullish") && // @ts-expect-error
          valueSchema.default !== void 0) {
            const value2 = key in input ? (
              // @ts-expect-error
              input[key]
            ) : getDefault(valueSchema);
            const valueDataset = valueSchema["~run"]({ value: value2 }, config2);
            if (valueDataset.issues) {
              const pathItem = {
                type: "object",
                origin: "value",
                input,
                key,
                value: value2
              };
              for (const issue of valueDataset.issues) {
                if (issue.path) {
                  issue.path.unshift(pathItem);
                } else {
                  issue.path = [pathItem];
                }
                dataset.issues?.push(issue);
              }
              if (!dataset.issues) {
                dataset.issues = valueDataset.issues;
              }
              if (config2.abortEarly) {
                dataset.typed = false;
                break;
              }
            }
            if (!valueDataset.typed) {
              dataset.typed = false;
            }
            dataset.value[key] = valueDataset.value;
          } else if (valueSchema.fallback !== void 0) {
            dataset.value[key] = getFallback(valueSchema);
          } else if (valueSchema.type !== "exact_optional" && valueSchema.type !== "optional" && valueSchema.type !== "nullish") {
            _addIssue(this, "key", dataset, config2, {
              input: void 0,
              expected: `"${key}"`,
              path: [
                {
                  type: "object",
                  origin: "key",
                  input,
                  key,
                  // @ts-expect-error
                  value: input[key]
                }
              ]
            });
            if (config2.abortEarly) {
              break;
            }
          }
        }
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/object/objectAsync.ts
// @__NO_SIDE_EFFECTS__
function objectAsync(entries2, message2) {
  return {
    kind: "schema",
    type: "object",
    reference: objectAsync,
    expects: "Object",
    async: true,
    entries: entries2,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    async "~run"(dataset, config2) {
      const input = dataset.value;
      if (input && typeof input === "object") {
        dataset.typed = true;
        dataset.value = {};
        const valueDatasets = await Promise.all(
          Object.entries(this.entries).map(async ([key, valueSchema]) => {
            if (key in input || (valueSchema.type === "exact_optional" || valueSchema.type === "optional" || valueSchema.type === "nullish") && // @ts-expect-error
            valueSchema.default !== void 0) {
              const value2 = key in input ? (
                // @ts-expect-error
                input[key]
              ) : await getDefault(valueSchema);
              return [
                key,
                value2,
                valueSchema,
                await valueSchema["~run"]({ value: value2 }, config2)
              ];
            }
            return [
              key,
              // @ts-expect-error
              input[key],
              valueSchema,
              null
            ];
          })
        );
        for (const [key, value2, valueSchema, valueDataset] of valueDatasets) {
          if (valueDataset) {
            if (valueDataset.issues) {
              const pathItem = {
                type: "object",
                origin: "value",
                input,
                key,
                value: value2
              };
              for (const issue of valueDataset.issues) {
                if (issue.path) {
                  issue.path.unshift(pathItem);
                } else {
                  issue.path = [pathItem];
                }
                dataset.issues?.push(issue);
              }
              if (!dataset.issues) {
                dataset.issues = valueDataset.issues;
              }
              if (config2.abortEarly) {
                dataset.typed = false;
                break;
              }
            }
            if (!valueDataset.typed) {
              dataset.typed = false;
            }
            dataset.value[key] = valueDataset.value;
          } else if (valueSchema.fallback !== void 0) {
            dataset.value[key] = await getFallback(valueSchema);
          } else if (valueSchema.type !== "exact_optional" && valueSchema.type !== "optional" && valueSchema.type !== "nullish") {
            _addIssue(this, "key", dataset, config2, {
              input: void 0,
              expected: `"${key}"`,
              path: [
                {
                  type: "object",
                  origin: "key",
                  input,
                  key,
                  value: value2
                }
              ]
            });
            if (config2.abortEarly) {
              break;
            }
          }
        }
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/objectWithRest/objectWithRest.ts
// @__NO_SIDE_EFFECTS__
function objectWithRest(entries2, rest, message2) {
  return {
    kind: "schema",
    type: "object_with_rest",
    reference: objectWithRest,
    expects: "Object",
    async: false,
    entries: entries2,
    rest,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      const input = dataset.value;
      if (input && typeof input === "object") {
        dataset.typed = true;
        dataset.value = {};
        for (const key in this.entries) {
          const valueSchema = this.entries[key];
          if (key in input || (valueSchema.type === "exact_optional" || valueSchema.type === "optional" || valueSchema.type === "nullish") && // @ts-expect-error
          valueSchema.default !== void 0) {
            const value2 = key in input ? (
              // @ts-expect-error
              input[key]
            ) : getDefault(valueSchema);
            const valueDataset = valueSchema["~run"]({ value: value2 }, config2);
            if (valueDataset.issues) {
              const pathItem = {
                type: "object",
                origin: "value",
                input,
                key,
                value: value2
              };
              for (const issue of valueDataset.issues) {
                if (issue.path) {
                  issue.path.unshift(pathItem);
                } else {
                  issue.path = [pathItem];
                }
                dataset.issues?.push(issue);
              }
              if (!dataset.issues) {
                dataset.issues = valueDataset.issues;
              }
              if (config2.abortEarly) {
                dataset.typed = false;
                break;
              }
            }
            if (!valueDataset.typed) {
              dataset.typed = false;
            }
            dataset.value[key] = valueDataset.value;
          } else if (valueSchema.fallback !== void 0) {
            dataset.value[key] = getFallback(valueSchema);
          } else if (valueSchema.type !== "exact_optional" && valueSchema.type !== "optional" && valueSchema.type !== "nullish") {
            _addIssue(this, "key", dataset, config2, {
              input: void 0,
              expected: `"${key}"`,
              path: [
                {
                  type: "object",
                  origin: "key",
                  input,
                  key,
                  // @ts-expect-error
                  value: input[key]
                }
              ]
            });
            if (config2.abortEarly) {
              break;
            }
          }
        }
        if (!dataset.issues || !config2.abortEarly) {
          for (const key in input) {
            if (_isValidObjectKey(input, key) && !(key in this.entries)) {
              const valueDataset = this.rest["~run"](
                // @ts-expect-error
                { value: input[key] },
                config2
              );
              if (valueDataset.issues) {
                const pathItem = {
                  type: "object",
                  origin: "value",
                  input,
                  key,
                  // @ts-expect-error
                  value: input[key]
                };
                for (const issue of valueDataset.issues) {
                  if (issue.path) {
                    issue.path.unshift(pathItem);
                  } else {
                    issue.path = [pathItem];
                  }
                  dataset.issues?.push(issue);
                }
                if (!dataset.issues) {
                  dataset.issues = valueDataset.issues;
                }
                if (config2.abortEarly) {
                  dataset.typed = false;
                  break;
                }
              }
              if (!valueDataset.typed) {
                dataset.typed = false;
              }
              dataset.value[key] = valueDataset.value;
            }
          }
        }
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/objectWithRest/objectWithRestAsync.ts
// @__NO_SIDE_EFFECTS__
function objectWithRestAsync(entries2, rest, message2) {
  return {
    kind: "schema",
    type: "object_with_rest",
    reference: objectWithRestAsync,
    expects: "Object",
    async: true,
    entries: entries2,
    rest,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    async "~run"(dataset, config2) {
      const input = dataset.value;
      if (input && typeof input === "object") {
        dataset.typed = true;
        dataset.value = {};
        const [normalDatasets, restDatasets] = await Promise.all([
          // If key is present or its an optional schema with a default value,
          // parse input of key or default value asynchronously
          Promise.all(
            Object.entries(this.entries).map(async ([key, valueSchema]) => {
              if (key in input || (valueSchema.type === "exact_optional" || valueSchema.type === "optional" || valueSchema.type === "nullish") && // @ts-expect-error
              valueSchema.default !== void 0) {
                const value2 = key in input ? (
                  // @ts-expect-error
                  input[key]
                ) : await getDefault(valueSchema);
                return [
                  key,
                  value2,
                  valueSchema,
                  await valueSchema["~run"]({ value: value2 }, config2)
                ];
              }
              return [
                key,
                // @ts-expect-error
                input[key],
                valueSchema,
                null
              ];
            })
          ),
          // Parse other entries with rest schema asynchronously
          // Hint: We exclude specific keys for security reasons
          Promise.all(
            Object.entries(input).filter(
              ([key]) => _isValidObjectKey(input, key) && !(key in this.entries)
            ).map(
              async ([key, value2]) => [
                key,
                value2,
                await this.rest["~run"]({ value: value2 }, config2)
              ]
            )
          )
        ]);
        for (const [key, value2, valueSchema, valueDataset] of normalDatasets) {
          if (valueDataset) {
            if (valueDataset.issues) {
              const pathItem = {
                type: "object",
                origin: "value",
                input,
                key,
                value: value2
              };
              for (const issue of valueDataset.issues) {
                if (issue.path) {
                  issue.path.unshift(pathItem);
                } else {
                  issue.path = [pathItem];
                }
                dataset.issues?.push(issue);
              }
              if (!dataset.issues) {
                dataset.issues = valueDataset.issues;
              }
              if (config2.abortEarly) {
                dataset.typed = false;
                break;
              }
            }
            if (!valueDataset.typed) {
              dataset.typed = false;
            }
            dataset.value[key] = valueDataset.value;
          } else if (valueSchema.fallback !== void 0) {
            dataset.value[key] = await getFallback(valueSchema);
          } else if (valueSchema.type !== "exact_optional" && valueSchema.type !== "optional" && valueSchema.type !== "nullish") {
            _addIssue(this, "key", dataset, config2, {
              input: void 0,
              expected: `"${key}"`,
              path: [
                {
                  type: "object",
                  origin: "key",
                  input,
                  key,
                  value: value2
                }
              ]
            });
            if (config2.abortEarly) {
              break;
            }
          }
        }
        if (!dataset.issues || !config2.abortEarly) {
          for (const [key, value2, valueDataset] of restDatasets) {
            if (valueDataset.issues) {
              const pathItem = {
                type: "object",
                origin: "value",
                input,
                key,
                value: value2
              };
              for (const issue of valueDataset.issues) {
                if (issue.path) {
                  issue.path.unshift(pathItem);
                } else {
                  issue.path = [pathItem];
                }
                dataset.issues?.push(issue);
              }
              if (!dataset.issues) {
                dataset.issues = valueDataset.issues;
              }
              if (config2.abortEarly) {
                dataset.typed = false;
                break;
              }
            }
            if (!valueDataset.typed) {
              dataset.typed = false;
            }
            dataset.value[key] = valueDataset.value;
          }
        }
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/optional/optional.ts
// @__NO_SIDE_EFFECTS__
function optional(wrapped, default_) {
  return {
    kind: "schema",
    type: "optional",
    reference: optional,
    expects: `(${wrapped.expects} | undefined)`,
    async: false,
    wrapped,
    default: default_,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      if (dataset.value === void 0) {
        if (this.default !== void 0) {
          dataset.value = getDefault(this, dataset, config2);
        }
        if (dataset.value === void 0) {
          dataset.typed = true;
          return dataset;
        }
      }
      return this.wrapped["~run"](dataset, config2);
    }
  };
}

// src/schemas/optional/optionalAsync.ts
// @__NO_SIDE_EFFECTS__
function optionalAsync(wrapped, default_) {
  return {
    kind: "schema",
    type: "optional",
    reference: optionalAsync,
    expects: `(${wrapped.expects} | undefined)`,
    async: true,
    wrapped,
    default: default_,
    get "~standard"() {
      return _getStandardProps(this);
    },
    async "~run"(dataset, config2) {
      if (dataset.value === void 0) {
        if (this.default !== void 0) {
          dataset.value = await getDefault(this, dataset, config2);
        }
        if (dataset.value === void 0) {
          dataset.typed = true;
          return dataset;
        }
      }
      return this.wrapped["~run"](dataset, config2);
    }
  };
}

// src/schemas/picklist/picklist.ts
// @__NO_SIDE_EFFECTS__
function picklist(options, message2) {
  return {
    kind: "schema",
    type: "picklist",
    reference: picklist,
    expects: _joinExpects(options.map(_stringify), "|"),
    async: false,
    options,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      if (this.options.includes(dataset.value)) {
        dataset.typed = true;
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/promise/promise.ts
// @__NO_SIDE_EFFECTS__
function promise(message2) {
  return {
    kind: "schema",
    type: "promise",
    reference: promise,
    expects: "Promise",
    async: false,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      if (dataset.value instanceof Promise) {
        dataset.typed = true;
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/record/record.ts
// @__NO_SIDE_EFFECTS__
function record(key, value2, message2) {
  return {
    kind: "schema",
    type: "record",
    reference: record,
    expects: "Object",
    async: false,
    key,
    value: value2,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      const input = dataset.value;
      if (input && typeof input === "object") {
        dataset.typed = true;
        dataset.value = {};
        for (const entryKey in input) {
          if (_isValidObjectKey(input, entryKey)) {
            const entryValue = input[entryKey];
            const keyDataset = this.key["~run"]({ value: entryKey }, config2);
            if (keyDataset.issues) {
              const pathItem = {
                type: "object",
                origin: "key",
                input,
                key: entryKey,
                value: entryValue
              };
              for (const issue of keyDataset.issues) {
                issue.path = [pathItem];
                dataset.issues?.push(issue);
              }
              if (!dataset.issues) {
                dataset.issues = keyDataset.issues;
              }
              if (config2.abortEarly) {
                dataset.typed = false;
                break;
              }
            }
            const valueDataset = this.value["~run"](
              { value: entryValue },
              config2
            );
            if (valueDataset.issues) {
              const pathItem = {
                type: "object",
                origin: "value",
                input,
                key: entryKey,
                value: entryValue
              };
              for (const issue of valueDataset.issues) {
                if (issue.path) {
                  issue.path.unshift(pathItem);
                } else {
                  issue.path = [pathItem];
                }
                dataset.issues?.push(issue);
              }
              if (!dataset.issues) {
                dataset.issues = valueDataset.issues;
              }
              if (config2.abortEarly) {
                dataset.typed = false;
                break;
              }
            }
            if (!keyDataset.typed || !valueDataset.typed) {
              dataset.typed = false;
            }
            if (keyDataset.typed) {
              dataset.value[keyDataset.value] = valueDataset.value;
            }
          }
        }
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/record/recordAsync.ts
// @__NO_SIDE_EFFECTS__
function recordAsync(key, value2, message2) {
  return {
    kind: "schema",
    type: "record",
    reference: recordAsync,
    expects: "Object",
    async: true,
    key,
    value: value2,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    async "~run"(dataset, config2) {
      const input = dataset.value;
      if (input && typeof input === "object") {
        dataset.typed = true;
        dataset.value = {};
        const datasets = await Promise.all(
          Object.entries(input).filter(([key2]) => _isValidObjectKey(input, key2)).map(
            ([entryKey, entryValue]) => Promise.all([
              entryKey,
              entryValue,
              this.key["~run"]({ value: entryKey }, config2),
              this.value["~run"]({ value: entryValue }, config2)
            ])
          )
        );
        for (const [
          entryKey,
          entryValue,
          keyDataset,
          valueDataset
        ] of datasets) {
          if (keyDataset.issues) {
            const pathItem = {
              type: "object",
              origin: "key",
              input,
              key: entryKey,
              value: entryValue
            };
            for (const issue of keyDataset.issues) {
              issue.path = [pathItem];
              dataset.issues?.push(issue);
            }
            if (!dataset.issues) {
              dataset.issues = keyDataset.issues;
            }
            if (config2.abortEarly) {
              dataset.typed = false;
              break;
            }
          }
          if (valueDataset.issues) {
            const pathItem = {
              type: "object",
              origin: "value",
              input,
              key: entryKey,
              value: entryValue
            };
            for (const issue of valueDataset.issues) {
              if (issue.path) {
                issue.path.unshift(pathItem);
              } else {
                issue.path = [pathItem];
              }
              dataset.issues?.push(issue);
            }
            if (!dataset.issues) {
              dataset.issues = valueDataset.issues;
            }
            if (config2.abortEarly) {
              dataset.typed = false;
              break;
            }
          }
          if (!keyDataset.typed || !valueDataset.typed) {
            dataset.typed = false;
          }
          if (keyDataset.typed) {
            dataset.value[keyDataset.value] = valueDataset.value;
          }
        }
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/set/set.ts
// @__NO_SIDE_EFFECTS__
function set(value2, message2) {
  return {
    kind: "schema",
    type: "set",
    reference: set,
    expects: "Set",
    async: false,
    value: value2,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      const input = dataset.value;
      if (input instanceof Set) {
        dataset.typed = true;
        dataset.value = /* @__PURE__ */ new Set();
        for (const inputValue of input) {
          const valueDataset = this.value["~run"](
            { value: inputValue },
            config2
          );
          if (valueDataset.issues) {
            const pathItem = {
              type: "set",
              origin: "value",
              input,
              key: null,
              value: inputValue
            };
            for (const issue of valueDataset.issues) {
              if (issue.path) {
                issue.path.unshift(pathItem);
              } else {
                issue.path = [pathItem];
              }
              dataset.issues?.push(issue);
            }
            if (!dataset.issues) {
              dataset.issues = valueDataset.issues;
            }
            if (config2.abortEarly) {
              dataset.typed = false;
              break;
            }
          }
          if (!valueDataset.typed) {
            dataset.typed = false;
          }
          dataset.value.add(valueDataset.value);
        }
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/set/setAsync.ts
// @__NO_SIDE_EFFECTS__
function setAsync(value2, message2) {
  return {
    kind: "schema",
    type: "set",
    reference: setAsync,
    expects: "Set",
    async: true,
    value: value2,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    async "~run"(dataset, config2) {
      const input = dataset.value;
      if (input instanceof Set) {
        dataset.typed = true;
        dataset.value = /* @__PURE__ */ new Set();
        const valueDatasets = await Promise.all(
          [...input].map(
            async (inputValue) => [
              inputValue,
              await this.value["~run"]({ value: inputValue }, config2)
            ]
          )
        );
        for (const [inputValue, valueDataset] of valueDatasets) {
          if (valueDataset.issues) {
            const pathItem = {
              type: "set",
              origin: "value",
              input,
              key: null,
              value: inputValue
            };
            for (const issue of valueDataset.issues) {
              if (issue.path) {
                issue.path.unshift(pathItem);
              } else {
                issue.path = [pathItem];
              }
              dataset.issues?.push(issue);
            }
            if (!dataset.issues) {
              dataset.issues = valueDataset.issues;
            }
            if (config2.abortEarly) {
              dataset.typed = false;
              break;
            }
          }
          if (!valueDataset.typed) {
            dataset.typed = false;
          }
          dataset.value.add(valueDataset.value);
        }
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/strictObject/strictObject.ts
// @__NO_SIDE_EFFECTS__
function strictObject(entries2, message2) {
  return {
    kind: "schema",
    type: "strict_object",
    reference: strictObject,
    expects: "Object",
    async: false,
    entries: entries2,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      const input = dataset.value;
      if (input && typeof input === "object") {
        dataset.typed = true;
        dataset.value = {};
        for (const key in this.entries) {
          const valueSchema = this.entries[key];
          if (key in input || (valueSchema.type === "exact_optional" || valueSchema.type === "optional" || valueSchema.type === "nullish") && // @ts-expect-error
          valueSchema.default !== void 0) {
            const value2 = key in input ? (
              // @ts-expect-error
              input[key]
            ) : getDefault(valueSchema);
            const valueDataset = valueSchema["~run"]({ value: value2 }, config2);
            if (valueDataset.issues) {
              const pathItem = {
                type: "object",
                origin: "value",
                input,
                key,
                value: value2
              };
              for (const issue of valueDataset.issues) {
                if (issue.path) {
                  issue.path.unshift(pathItem);
                } else {
                  issue.path = [pathItem];
                }
                dataset.issues?.push(issue);
              }
              if (!dataset.issues) {
                dataset.issues = valueDataset.issues;
              }
              if (config2.abortEarly) {
                dataset.typed = false;
                break;
              }
            }
            if (!valueDataset.typed) {
              dataset.typed = false;
            }
            dataset.value[key] = valueDataset.value;
          } else if (valueSchema.fallback !== void 0) {
            dataset.value[key] = getFallback(valueSchema);
          } else if (valueSchema.type !== "exact_optional" && valueSchema.type !== "optional" && valueSchema.type !== "nullish") {
            _addIssue(this, "key", dataset, config2, {
              input: void 0,
              expected: `"${key}"`,
              path: [
                {
                  type: "object",
                  origin: "key",
                  input,
                  key,
                  // @ts-expect-error
                  value: input[key]
                }
              ]
            });
            if (config2.abortEarly) {
              break;
            }
          }
        }
        if (!dataset.issues || !config2.abortEarly) {
          for (const key in input) {
            if (!(key in this.entries)) {
              _addIssue(this, "key", dataset, config2, {
                input: key,
                expected: "never",
                path: [
                  {
                    type: "object",
                    origin: "key",
                    input,
                    key,
                    // @ts-expect-error
                    value: input[key]
                  }
                ]
              });
              break;
            }
          }
        }
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/strictObject/strictObjectAsync.ts
// @__NO_SIDE_EFFECTS__
function strictObjectAsync(entries2, message2) {
  return {
    kind: "schema",
    type: "strict_object",
    reference: strictObjectAsync,
    expects: "Object",
    async: true,
    entries: entries2,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    async "~run"(dataset, config2) {
      const input = dataset.value;
      if (input && typeof input === "object") {
        dataset.typed = true;
        dataset.value = {};
        const valueDatasets = await Promise.all(
          Object.entries(this.entries).map(async ([key, valueSchema]) => {
            if (key in input || (valueSchema.type === "exact_optional" || valueSchema.type === "optional" || valueSchema.type === "nullish") && // @ts-expect-error
            valueSchema.default !== void 0) {
              const value2 = key in input ? (
                // @ts-expect-error
                input[key]
              ) : await getDefault(valueSchema);
              return [
                key,
                value2,
                valueSchema,
                await valueSchema["~run"]({ value: value2 }, config2)
              ];
            }
            return [
              key,
              // @ts-expect-error
              input[key],
              valueSchema,
              null
            ];
          })
        );
        for (const [key, value2, valueSchema, valueDataset] of valueDatasets) {
          if (valueDataset) {
            if (valueDataset.issues) {
              const pathItem = {
                type: "object",
                origin: "value",
                input,
                key,
                value: value2
              };
              for (const issue of valueDataset.issues) {
                if (issue.path) {
                  issue.path.unshift(pathItem);
                } else {
                  issue.path = [pathItem];
                }
                dataset.issues?.push(issue);
              }
              if (!dataset.issues) {
                dataset.issues = valueDataset.issues;
              }
              if (config2.abortEarly) {
                dataset.typed = false;
                break;
              }
            }
            if (!valueDataset.typed) {
              dataset.typed = false;
            }
            dataset.value[key] = valueDataset.value;
          } else if (valueSchema.fallback !== void 0) {
            dataset.value[key] = await getFallback(valueSchema);
          } else if (valueSchema.type !== "exact_optional" && valueSchema.type !== "optional" && valueSchema.type !== "nullish") {
            _addIssue(this, "key", dataset, config2, {
              input: void 0,
              expected: `"${key}"`,
              path: [
                {
                  type: "object",
                  origin: "key",
                  input,
                  key,
                  value: value2
                }
              ]
            });
            if (config2.abortEarly) {
              break;
            }
          }
        }
        if (!dataset.issues || !config2.abortEarly) {
          for (const key in input) {
            if (!(key in this.entries)) {
              _addIssue(this, "key", dataset, config2, {
                input: key,
                expected: "never",
                path: [
                  {
                    type: "object",
                    origin: "key",
                    input,
                    key,
                    // @ts-expect-error
                    value: input[key]
                  }
                ]
              });
              break;
            }
          }
        }
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/strictTuple/strictTuple.ts
// @__NO_SIDE_EFFECTS__
function strictTuple(items, message2) {
  return {
    kind: "schema",
    type: "strict_tuple",
    reference: strictTuple,
    expects: "Array",
    async: false,
    items,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      const input = dataset.value;
      if (Array.isArray(input)) {
        dataset.typed = true;
        dataset.value = [];
        for (let key = 0; key < this.items.length; key++) {
          const value2 = input[key];
          const itemDataset = this.items[key]["~run"]({ value: value2 }, config2);
          if (itemDataset.issues) {
            const pathItem = {
              type: "array",
              origin: "value",
              input,
              key,
              value: value2
            };
            for (const issue of itemDataset.issues) {
              if (issue.path) {
                issue.path.unshift(pathItem);
              } else {
                issue.path = [pathItem];
              }
              dataset.issues?.push(issue);
            }
            if (!dataset.issues) {
              dataset.issues = itemDataset.issues;
            }
            if (config2.abortEarly) {
              dataset.typed = false;
              break;
            }
          }
          if (!itemDataset.typed) {
            dataset.typed = false;
          }
          dataset.value.push(itemDataset.value);
        }
        if (!(dataset.issues && config2.abortEarly) && this.items.length < input.length) {
          _addIssue(this, "type", dataset, config2, {
            input: input[this.items.length],
            expected: "never",
            path: [
              {
                type: "array",
                origin: "value",
                input,
                key: this.items.length,
                value: input[this.items.length]
              }
            ]
          });
        }
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/strictTuple/strictTupleAsync.ts
// @__NO_SIDE_EFFECTS__
function strictTupleAsync(items, message2) {
  return {
    kind: "schema",
    type: "strict_tuple",
    reference: strictTupleAsync,
    expects: "Array",
    async: true,
    items,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    async "~run"(dataset, config2) {
      const input = dataset.value;
      if (Array.isArray(input)) {
        dataset.typed = true;
        dataset.value = [];
        const itemDatasets = await Promise.all(
          this.items.map(async (item, key) => {
            const value2 = input[key];
            return [key, value2, await item["~run"]({ value: value2 }, config2)];
          })
        );
        for (const [key, value2, itemDataset] of itemDatasets) {
          if (itemDataset.issues) {
            const pathItem = {
              type: "array",
              origin: "value",
              input,
              key,
              value: value2
            };
            for (const issue of itemDataset.issues) {
              if (issue.path) {
                issue.path.unshift(pathItem);
              } else {
                issue.path = [pathItem];
              }
              dataset.issues?.push(issue);
            }
            if (!dataset.issues) {
              dataset.issues = itemDataset.issues;
            }
            if (config2.abortEarly) {
              dataset.typed = false;
              break;
            }
          }
          if (!itemDataset.typed) {
            dataset.typed = false;
          }
          dataset.value.push(itemDataset.value);
        }
        if (!(dataset.issues && config2.abortEarly) && this.items.length < input.length) {
          _addIssue(this, "type", dataset, config2, {
            input: input[this.items.length],
            expected: "never",
            path: [
              {
                type: "array",
                origin: "value",
                input,
                key: this.items.length,
                value: input[this.items.length]
              }
            ]
          });
        }
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/string/string.ts
// @__NO_SIDE_EFFECTS__
function string(message2) {
  return {
    kind: "schema",
    type: "string",
    reference: string,
    expects: "string",
    async: false,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      if (typeof dataset.value === "string") {
        dataset.typed = true;
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/symbol/symbol.ts
// @__NO_SIDE_EFFECTS__
function symbol(message2) {
  return {
    kind: "schema",
    type: "symbol",
    reference: symbol,
    expects: "symbol",
    async: false,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      if (typeof dataset.value === "symbol") {
        dataset.typed = true;
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/tuple/tuple.ts
// @__NO_SIDE_EFFECTS__
function tuple(items, message2) {
  return {
    kind: "schema",
    type: "tuple",
    reference: tuple,
    expects: "Array",
    async: false,
    items,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      const input = dataset.value;
      if (Array.isArray(input)) {
        dataset.typed = true;
        dataset.value = [];
        for (let key = 0; key < this.items.length; key++) {
          const value2 = input[key];
          const itemDataset = this.items[key]["~run"]({ value: value2 }, config2);
          if (itemDataset.issues) {
            const pathItem = {
              type: "array",
              origin: "value",
              input,
              key,
              value: value2
            };
            for (const issue of itemDataset.issues) {
              if (issue.path) {
                issue.path.unshift(pathItem);
              } else {
                issue.path = [pathItem];
              }
              dataset.issues?.push(issue);
            }
            if (!dataset.issues) {
              dataset.issues = itemDataset.issues;
            }
            if (config2.abortEarly) {
              dataset.typed = false;
              break;
            }
          }
          if (!itemDataset.typed) {
            dataset.typed = false;
          }
          dataset.value.push(itemDataset.value);
        }
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/tuple/tupleAsync.ts
// @__NO_SIDE_EFFECTS__
function tupleAsync(items, message2) {
  return {
    kind: "schema",
    type: "tuple",
    reference: tupleAsync,
    expects: "Array",
    async: true,
    items,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    async "~run"(dataset, config2) {
      const input = dataset.value;
      if (Array.isArray(input)) {
        dataset.typed = true;
        dataset.value = [];
        const itemDatasets = await Promise.all(
          this.items.map(async (item, key) => {
            const value2 = input[key];
            return [key, value2, await item["~run"]({ value: value2 }, config2)];
          })
        );
        for (const [key, value2, itemDataset] of itemDatasets) {
          if (itemDataset.issues) {
            const pathItem = {
              type: "array",
              origin: "value",
              input,
              key,
              value: value2
            };
            for (const issue of itemDataset.issues) {
              if (issue.path) {
                issue.path.unshift(pathItem);
              } else {
                issue.path = [pathItem];
              }
              dataset.issues?.push(issue);
            }
            if (!dataset.issues) {
              dataset.issues = itemDataset.issues;
            }
            if (config2.abortEarly) {
              dataset.typed = false;
              break;
            }
          }
          if (!itemDataset.typed) {
            dataset.typed = false;
          }
          dataset.value.push(itemDataset.value);
        }
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/tupleWithRest/tupleWithRest.ts
// @__NO_SIDE_EFFECTS__
function tupleWithRest(items, rest, message2) {
  return {
    kind: "schema",
    type: "tuple_with_rest",
    reference: tupleWithRest,
    expects: "Array",
    async: false,
    items,
    rest,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      const input = dataset.value;
      if (Array.isArray(input)) {
        dataset.typed = true;
        dataset.value = [];
        for (let key = 0; key < this.items.length; key++) {
          const value2 = input[key];
          const itemDataset = this.items[key]["~run"]({ value: value2 }, config2);
          if (itemDataset.issues) {
            const pathItem = {
              type: "array",
              origin: "value",
              input,
              key,
              value: value2
            };
            for (const issue of itemDataset.issues) {
              if (issue.path) {
                issue.path.unshift(pathItem);
              } else {
                issue.path = [pathItem];
              }
              dataset.issues?.push(issue);
            }
            if (!dataset.issues) {
              dataset.issues = itemDataset.issues;
            }
            if (config2.abortEarly) {
              dataset.typed = false;
              break;
            }
          }
          if (!itemDataset.typed) {
            dataset.typed = false;
          }
          dataset.value.push(itemDataset.value);
        }
        if (!dataset.issues || !config2.abortEarly) {
          for (let key = this.items.length; key < input.length; key++) {
            const value2 = input[key];
            const itemDataset = this.rest["~run"]({ value: value2 }, config2);
            if (itemDataset.issues) {
              const pathItem = {
                type: "array",
                origin: "value",
                input,
                key,
                value: value2
              };
              for (const issue of itemDataset.issues) {
                if (issue.path) {
                  issue.path.unshift(pathItem);
                } else {
                  issue.path = [pathItem];
                }
                dataset.issues?.push(issue);
              }
              if (!dataset.issues) {
                dataset.issues = itemDataset.issues;
              }
              if (config2.abortEarly) {
                dataset.typed = false;
                break;
              }
            }
            if (!itemDataset.typed) {
              dataset.typed = false;
            }
            dataset.value.push(itemDataset.value);
          }
        }
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/tupleWithRest/tupleWithRestAsync.ts
// @__NO_SIDE_EFFECTS__
function tupleWithRestAsync(items, rest, message2) {
  return {
    kind: "schema",
    type: "tuple_with_rest",
    reference: tupleWithRestAsync,
    expects: "Array",
    async: true,
    items,
    rest,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    async "~run"(dataset, config2) {
      const input = dataset.value;
      if (Array.isArray(input)) {
        dataset.typed = true;
        dataset.value = [];
        const [normalDatasets, restDatasets] = await Promise.all([
          // Parse schema of each normal item
          Promise.all(
            this.items.map(async (item, key) => {
              const value2 = input[key];
              return [
                key,
                value2,
                await item["~run"]({ value: value2 }, config2)
              ];
            })
          ),
          // Parse other items with rest schema
          Promise.all(
            input.slice(this.items.length).map(async (value2, key) => {
              return [
                key + this.items.length,
                value2,
                await this.rest["~run"]({ value: value2 }, config2)
              ];
            })
          )
        ]);
        for (const [key, value2, itemDataset] of normalDatasets) {
          if (itemDataset.issues) {
            const pathItem = {
              type: "array",
              origin: "value",
              input,
              key,
              value: value2
            };
            for (const issue of itemDataset.issues) {
              if (issue.path) {
                issue.path.unshift(pathItem);
              } else {
                issue.path = [pathItem];
              }
              dataset.issues?.push(issue);
            }
            if (!dataset.issues) {
              dataset.issues = itemDataset.issues;
            }
            if (config2.abortEarly) {
              dataset.typed = false;
              break;
            }
          }
          if (!itemDataset.typed) {
            dataset.typed = false;
          }
          dataset.value.push(itemDataset.value);
        }
        if (!dataset.issues || !config2.abortEarly) {
          for (const [key, value2, itemDataset] of restDatasets) {
            if (itemDataset.issues) {
              const pathItem = {
                type: "array",
                origin: "value",
                input,
                key,
                value: value2
              };
              for (const issue of itemDataset.issues) {
                if (issue.path) {
                  issue.path.unshift(pathItem);
                } else {
                  issue.path = [pathItem];
                }
                dataset.issues?.push(issue);
              }
              if (!dataset.issues) {
                dataset.issues = itemDataset.issues;
              }
              if (config2.abortEarly) {
                dataset.typed = false;
                break;
              }
            }
            if (!itemDataset.typed) {
              dataset.typed = false;
            }
            dataset.value.push(itemDataset.value);
          }
        }
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/undefined/undefined.ts
// @__NO_SIDE_EFFECTS__
function undefined_(message2) {
  return {
    kind: "schema",
    type: "undefined",
    reference: undefined_,
    expects: "undefined",
    async: false,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      if (dataset.value === void 0) {
        dataset.typed = true;
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/undefinedable/undefinedable.ts
// @__NO_SIDE_EFFECTS__
function undefinedable(wrapped, default_) {
  return {
    kind: "schema",
    type: "undefinedable",
    reference: undefinedable,
    expects: `(${wrapped.expects} | undefined)`,
    async: false,
    wrapped,
    default: default_,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      if (dataset.value === void 0) {
        if (this.default !== void 0) {
          dataset.value = getDefault(this, dataset, config2);
        }
        if (dataset.value === void 0) {
          dataset.typed = true;
          return dataset;
        }
      }
      return this.wrapped["~run"](dataset, config2);
    }
  };
}

// src/schemas/undefinedable/undefinedableAsync.ts
// @__NO_SIDE_EFFECTS__
function undefinedableAsync(wrapped, default_) {
  return {
    kind: "schema",
    type: "undefinedable",
    reference: undefinedableAsync,
    expects: `(${wrapped.expects} | undefined)`,
    async: true,
    wrapped,
    default: default_,
    get "~standard"() {
      return _getStandardProps(this);
    },
    async "~run"(dataset, config2) {
      if (dataset.value === void 0) {
        if (this.default !== void 0) {
          dataset.value = await getDefault(this, dataset, config2);
        }
        if (dataset.value === void 0) {
          dataset.typed = true;
          return dataset;
        }
      }
      return this.wrapped["~run"](dataset, config2);
    }
  };
}

// src/schemas/union/utils/_subIssues/_subIssues.ts
// @__NO_SIDE_EFFECTS__
function _subIssues(datasets) {
  let issues;
  if (datasets) {
    for (const dataset of datasets) {
      if (issues) {
        issues.push(...dataset.issues);
      } else {
        issues = dataset.issues;
      }
    }
  }
  return issues;
}

// src/schemas/union/union.ts
// @__NO_SIDE_EFFECTS__
function union(options, message2) {
  return {
    kind: "schema",
    type: "union",
    reference: union,
    expects: _joinExpects(
      options.map((option) => option.expects),
      "|"
    ),
    async: false,
    options,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      let validDataset;
      let typedDatasets;
      let untypedDatasets;
      for (const schema of this.options) {
        const optionDataset = schema["~run"]({ value: dataset.value }, config2);
        if (optionDataset.typed) {
          if (optionDataset.issues) {
            if (typedDatasets) {
              typedDatasets.push(optionDataset);
            } else {
              typedDatasets = [optionDataset];
            }
          } else {
            validDataset = optionDataset;
            break;
          }
        } else {
          if (untypedDatasets) {
            untypedDatasets.push(optionDataset);
          } else {
            untypedDatasets = [optionDataset];
          }
        }
      }
      if (validDataset) {
        return validDataset;
      }
      if (typedDatasets) {
        if (typedDatasets.length === 1) {
          return typedDatasets[0];
        }
        _addIssue(this, "type", dataset, config2, {
          issues: _subIssues(typedDatasets)
        });
        dataset.typed = true;
      } else if (untypedDatasets?.length === 1) {
        return untypedDatasets[0];
      } else {
        _addIssue(this, "type", dataset, config2, {
          issues: _subIssues(untypedDatasets)
        });
      }
      return dataset;
    }
  };
}

// src/schemas/union/unionAsync.ts
// @__NO_SIDE_EFFECTS__
function unionAsync(options, message2) {
  return {
    kind: "schema",
    type: "union",
    reference: unionAsync,
    expects: _joinExpects(
      options.map((option) => option.expects),
      "|"
    ),
    async: true,
    options,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    async "~run"(dataset, config2) {
      let validDataset;
      let typedDatasets;
      let untypedDatasets;
      for (const schema of this.options) {
        const optionDataset = await schema["~run"](
          { value: dataset.value },
          config2
        );
        if (optionDataset.typed) {
          if (optionDataset.issues) {
            if (typedDatasets) {
              typedDatasets.push(optionDataset);
            } else {
              typedDatasets = [optionDataset];
            }
          } else {
            validDataset = optionDataset;
            break;
          }
        } else {
          if (untypedDatasets) {
            untypedDatasets.push(optionDataset);
          } else {
            untypedDatasets = [optionDataset];
          }
        }
      }
      if (validDataset) {
        return validDataset;
      }
      if (typedDatasets) {
        if (typedDatasets.length === 1) {
          return typedDatasets[0];
        }
        _addIssue(this, "type", dataset, config2, {
          issues: _subIssues(typedDatasets)
        });
        dataset.typed = true;
      } else if (untypedDatasets?.length === 1) {
        return untypedDatasets[0];
      } else {
        _addIssue(this, "type", dataset, config2, {
          issues: _subIssues(untypedDatasets)
        });
      }
      return dataset;
    }
  };
}

// src/schemas/unknown/unknown.ts
// @__NO_SIDE_EFFECTS__
function unknown() {
  return {
    kind: "schema",
    type: "unknown",
    reference: unknown,
    expects: "unknown",
    async: false,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset) {
      dataset.typed = true;
      return dataset;
    }
  };
}

// src/schemas/variant/variant.ts
// @__NO_SIDE_EFFECTS__
function variant(key, options, message2) {
  return {
    kind: "schema",
    type: "variant",
    reference: variant,
    expects: "Object",
    async: false,
    key,
    options,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      const input = dataset.value;
      if (input && typeof input === "object") {
        let outputDataset;
        let maxDiscriminatorPriority = 0;
        let invalidDiscriminatorKey = this.key;
        let expectedDiscriminators = [];
        const parseOptions = (variant2, allKeys) => {
          for (const schema of variant2.options) {
            if (schema.type === "variant") {
              parseOptions(schema, new Set(allKeys).add(schema.key));
            } else {
              let keysAreValid = true;
              let currentPriority = 0;
              for (const currentKey of allKeys) {
                const discriminatorSchema = schema.entries[currentKey];
                if (currentKey in input ? discriminatorSchema["~run"](
                  // @ts-expect-error
                  { typed: false, value: input[currentKey] },
                  { abortEarly: true }
                ).issues : discriminatorSchema.type !== "exact_optional" && discriminatorSchema.type !== "optional" && discriminatorSchema.type !== "nullish") {
                  keysAreValid = false;
                  if (invalidDiscriminatorKey !== currentKey && (maxDiscriminatorPriority < currentPriority || maxDiscriminatorPriority === currentPriority && currentKey in input && !(invalidDiscriminatorKey in input))) {
                    maxDiscriminatorPriority = currentPriority;
                    invalidDiscriminatorKey = currentKey;
                    expectedDiscriminators = [];
                  }
                  if (invalidDiscriminatorKey === currentKey) {
                    expectedDiscriminators.push(
                      schema.entries[currentKey].expects
                    );
                  }
                  break;
                }
                currentPriority++;
              }
              if (keysAreValid) {
                const optionDataset = schema["~run"]({ value: input }, config2);
                if (!outputDataset || !outputDataset.typed && optionDataset.typed) {
                  outputDataset = optionDataset;
                }
              }
            }
            if (outputDataset && !outputDataset.issues) {
              break;
            }
          }
        };
        parseOptions(this, /* @__PURE__ */ new Set([this.key]));
        if (outputDataset) {
          return outputDataset;
        }
        _addIssue(this, "type", dataset, config2, {
          // @ts-expect-error
          input: input[invalidDiscriminatorKey],
          expected: _joinExpects(expectedDiscriminators, "|"),
          path: [
            {
              type: "object",
              origin: "value",
              input,
              key: invalidDiscriminatorKey,
              // @ts-expect-error
              value: input[invalidDiscriminatorKey]
            }
          ]
        });
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/variant/variantAsync.ts
// @__NO_SIDE_EFFECTS__
function variantAsync(key, options, message2) {
  return {
    kind: "schema",
    type: "variant",
    reference: variantAsync,
    expects: "Object",
    async: true,
    key,
    options,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    async "~run"(dataset, config2) {
      const input = dataset.value;
      if (input && typeof input === "object") {
        let outputDataset;
        let maxDiscriminatorPriority = 0;
        let invalidDiscriminatorKey = this.key;
        let expectedDiscriminators = [];
        const parseOptions = async (variant2, allKeys) => {
          for (const schema of variant2.options) {
            if (schema.type === "variant") {
              await parseOptions(schema, new Set(allKeys).add(schema.key));
            } else {
              let keysAreValid = true;
              let currentPriority = 0;
              for (const currentKey of allKeys) {
                const discriminatorSchema = schema.entries[currentKey];
                if (currentKey in input ? (await discriminatorSchema["~run"](
                  // @ts-expect-error
                  { typed: false, value: input[currentKey] },
                  { abortEarly: true }
                )).issues : discriminatorSchema.type !== "exact_optional" && discriminatorSchema.type !== "optional" && discriminatorSchema.type !== "nullish") {
                  keysAreValid = false;
                  if (invalidDiscriminatorKey !== currentKey && (maxDiscriminatorPriority < currentPriority || maxDiscriminatorPriority === currentPriority && currentKey in input && !(invalidDiscriminatorKey in input))) {
                    maxDiscriminatorPriority = currentPriority;
                    invalidDiscriminatorKey = currentKey;
                    expectedDiscriminators = [];
                  }
                  if (invalidDiscriminatorKey === currentKey) {
                    expectedDiscriminators.push(
                      schema.entries[currentKey].expects
                    );
                  }
                  break;
                }
                currentPriority++;
              }
              if (keysAreValid) {
                const optionDataset = await schema["~run"](
                  { value: input },
                  config2
                );
                if (!outputDataset || !outputDataset.typed && optionDataset.typed) {
                  outputDataset = optionDataset;
                }
              }
            }
            if (outputDataset && !outputDataset.issues) {
              break;
            }
          }
        };
        await parseOptions(this, /* @__PURE__ */ new Set([this.key]));
        if (outputDataset) {
          return outputDataset;
        }
        _addIssue(this, "type", dataset, config2, {
          // @ts-expect-error
          input: input[invalidDiscriminatorKey],
          expected: _joinExpects(expectedDiscriminators, "|"),
          path: [
            {
              type: "object",
              origin: "value",
              input,
              key: invalidDiscriminatorKey,
              // @ts-expect-error
              value: input[invalidDiscriminatorKey]
            }
          ]
        });
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/schemas/void/void.ts
// @__NO_SIDE_EFFECTS__
function void_(message2) {
  return {
    kind: "schema",
    type: "void",
    reference: void_,
    expects: "void",
    async: false,
    message: message2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      if (dataset.value === void 0) {
        dataset.typed = true;
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}

// src/methods/keyof/keyof.ts
// @__NO_SIDE_EFFECTS__
function keyof(schema, message2) {
  return picklist(Object.keys(schema.entries), message2);
}

// src/methods/message/message.ts
// @__NO_SIDE_EFFECTS__
function message(schema, message_) {
  return {
    ...schema,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      return schema["~run"](dataset, { ...config2, message: message_ });
    }
  };
}

// src/methods/omit/omit.ts
// @__NO_SIDE_EFFECTS__
function omit(schema, keys) {
  const entries2 = {
    ...schema.entries
  };
  for (const key of keys) {
    delete entries2[key];
  }
  return {
    ...schema,
    entries: entries2,
    get "~standard"() {
      return _getStandardProps(this);
    }
  };
}

// src/methods/parse/parse.ts
function parse(schema, input, config2) {
  const dataset = schema["~run"]({ value: input }, getGlobalConfig(config2));
  if (dataset.issues) {
    throw new ValiError(dataset.issues);
  }
  return dataset.value;
}

// src/methods/parse/parseAsync.ts
async function parseAsync(schema, input, config2) {
  const dataset = await schema["~run"](
    { value: input },
    getGlobalConfig(config2)
  );
  if (dataset.issues) {
    throw new ValiError(dataset.issues);
  }
  return dataset.value;
}

// src/methods/parser/parser.ts
// @__NO_SIDE_EFFECTS__
function parser(schema, config2) {
  const func = (input) => parse(schema, input, config2);
  func.schema = schema;
  func.config = config2;
  return func;
}

// src/methods/parser/parserAsync.ts
// @__NO_SIDE_EFFECTS__
function parserAsync(schema, config2) {
  const func = (input) => parseAsync(schema, input, config2);
  func.schema = schema;
  func.config = config2;
  return func;
}

// src/methods/partial/partial.ts
// @__NO_SIDE_EFFECTS__
function partial(schema, keys) {
  const entries2 = {};
  for (const key in schema.entries) {
    entries2[key] = !keys || keys.includes(key) ? optional(schema.entries[key]) : schema.entries[key];
  }
  return {
    ...schema,
    entries: entries2,
    get "~standard"() {
      return _getStandardProps(this);
    }
  };
}

// src/methods/partial/partialAsync.ts
// @__NO_SIDE_EFFECTS__
function partialAsync(schema, keys) {
  const entries2 = {};
  for (const key in schema.entries) {
    entries2[key] = !keys || keys.includes(key) ? optionalAsync(schema.entries[key]) : schema.entries[key];
  }
  return {
    ...schema,
    entries: entries2,
    get "~standard"() {
      return _getStandardProps(this);
    }
  };
}

// src/methods/pick/pick.ts
// @__NO_SIDE_EFFECTS__
function pick(schema, keys) {
  const entries2 = {};
  for (const key of keys) {
    entries2[key] = schema.entries[key];
  }
  return {
    ...schema,
    entries: entries2,
    get "~standard"() {
      return _getStandardProps(this);
    }
  };
}

// src/methods/pipe/pipe.ts
// @__NO_SIDE_EFFECTS__
function pipe(...pipe2) {
  return {
    ...pipe2[0],
    pipe: pipe2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      for (const item of pipe2) {
        if (item.kind !== "metadata") {
          if (dataset.issues && (item.kind === "schema" || item.kind === "transformation")) {
            dataset.typed = false;
            break;
          }
          if (!dataset.issues || !config2.abortEarly && !config2.abortPipeEarly) {
            dataset = item["~run"](dataset, config2);
          }
        }
      }
      return dataset;
    }
  };
}

// src/methods/pipe/pipeAsync.ts
// @__NO_SIDE_EFFECTS__
function pipeAsync(...pipe2) {
  return {
    ...pipe2[0],
    pipe: pipe2,
    async: true,
    get "~standard"() {
      return _getStandardProps(this);
    },
    async "~run"(dataset, config2) {
      for (const item of pipe2) {
        if (item.kind !== "metadata") {
          if (dataset.issues && (item.kind === "schema" || item.kind === "transformation")) {
            dataset.typed = false;
            break;
          }
          if (!dataset.issues || !config2.abortEarly && !config2.abortPipeEarly) {
            dataset = await item["~run"](dataset, config2);
          }
        }
      }
      return dataset;
    }
  };
}

// src/methods/required/required.ts
// @__NO_SIDE_EFFECTS__
function required(schema, arg2, arg3) {
  const keys = Array.isArray(arg2) ? arg2 : void 0;
  const message2 = Array.isArray(arg2) ? arg3 : arg2;
  const entries2 = {};
  for (const key in schema.entries) {
    entries2[key] = !keys || keys.includes(key) ? nonOptional(schema.entries[key], message2) : schema.entries[key];
  }
  return {
    ...schema,
    entries: entries2,
    get "~standard"() {
      return _getStandardProps(this);
    }
  };
}

// src/methods/required/requiredAsync.ts
// @__NO_SIDE_EFFECTS__
function requiredAsync(schema, arg2, arg3) {
  const keys = Array.isArray(arg2) ? arg2 : void 0;
  const message2 = Array.isArray(arg2) ? arg3 : arg2;
  const entries2 = {};
  for (const key in schema.entries) {
    entries2[key] = !keys || keys.includes(key) ? nonOptionalAsync(schema.entries[key], message2) : schema.entries[key];
  }
  return {
    ...schema,
    entries: entries2,
    get "~standard"() {
      return _getStandardProps(this);
    }
  };
}

// src/methods/safeParse/safeParse.ts
// @__NO_SIDE_EFFECTS__
function safeParse(schema, input, config2) {
  const dataset = schema["~run"]({ value: input }, getGlobalConfig(config2));
  return {
    typed: dataset.typed,
    success: !dataset.issues,
    output: dataset.value,
    issues: dataset.issues
  };
}

// src/methods/safeParse/safeParseAsync.ts
// @__NO_SIDE_EFFECTS__
async function safeParseAsync(schema, input, config2) {
  const dataset = await schema["~run"](
    { value: input },
    getGlobalConfig(config2)
  );
  return {
    typed: dataset.typed,
    success: !dataset.issues,
    output: dataset.value,
    issues: dataset.issues
  };
}

// src/methods/safeParser/safeParser.ts
// @__NO_SIDE_EFFECTS__
function safeParser(schema, config2) {
  const func = (input) => safeParse(schema, input, config2);
  func.schema = schema;
  func.config = config2;
  return func;
}

// src/methods/safeParser/safeParserAsync.ts
// @__NO_SIDE_EFFECTS__
function safeParserAsync(schema, config2) {
  const func = (input) => safeParseAsync(schema, input, config2);
  func.schema = schema;
  func.config = config2;
  return func;
}

// src/methods/summarize/summarize.ts
// @__NO_SIDE_EFFECTS__
function summarize(issues) {
  let summary = "";
  for (const issue of issues) {
    if (summary) {
      summary += "\n";
    }
    summary += `\xD7 ${issue.message}`;
    const dotPath = getDotPath(issue);
    if (dotPath) {
      summary += `
  \u2192 at ${dotPath}`;
    }
  }
  return summary;
}

// src/methods/unwrap/unwrap.ts
// @__NO_SIDE_EFFECTS__
function unwrap(schema) {
  return schema.wrapped;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (0);


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