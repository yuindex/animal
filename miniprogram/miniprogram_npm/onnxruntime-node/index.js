module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1709710411690, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listSupportedBackends = void 0;
__exportStar(require("onnxruntime-common"), exports);
var backend_1 = require("./backend");
Object.defineProperty(exports, "listSupportedBackends", { enumerable: true, get: function () { return backend_1.listSupportedBackends; } });
const onnxruntime_common_1 = require("onnxruntime-common");
const version_1 = require("./version");
const backend_2 = require("./backend");
const backends = (0, backend_2.listSupportedBackends)();
for (const backend of backends) {
    (0, onnxruntime_common_1.registerBackend)(backend.name, backend_2.onnxruntimeBackend, 100);
}
Object.defineProperty(onnxruntime_common_1.env.versions, 'node', { value: version_1.version, enumerable: true });
//# sourceMappingURL=index.js.map
}, function(modId) {var map = {"./backend":1709710411691,"./version":1709710411693}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1709710411691, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _OnnxruntimeSessionHandler_inferenceSession;
Object.defineProperty(exports, "__esModule", { value: true });
exports.listSupportedBackends = exports.onnxruntimeBackend = void 0;
const binding_1 = require("./binding");
class OnnxruntimeSessionHandler {
    constructor(pathOrBuffer, options) {
        _OnnxruntimeSessionHandler_inferenceSession.set(this, void 0);
        __classPrivateFieldSet(this, _OnnxruntimeSessionHandler_inferenceSession, new binding_1.binding.InferenceSession(), "f");
        if (typeof pathOrBuffer === 'string') {
            __classPrivateFieldGet(this, _OnnxruntimeSessionHandler_inferenceSession, "f").loadModel(pathOrBuffer, options);
        }
        else {
            __classPrivateFieldGet(this, _OnnxruntimeSessionHandler_inferenceSession, "f").loadModel(pathOrBuffer.buffer, pathOrBuffer.byteOffset, pathOrBuffer.byteLength, options);
        }
        this.inputNames = __classPrivateFieldGet(this, _OnnxruntimeSessionHandler_inferenceSession, "f").inputNames;
        this.outputNames = __classPrivateFieldGet(this, _OnnxruntimeSessionHandler_inferenceSession, "f").outputNames;
    }
    async dispose() {
        __classPrivateFieldGet(this, _OnnxruntimeSessionHandler_inferenceSession, "f").dispose();
    }
    startProfiling() {
        // TODO: implement profiling
    }
    endProfiling() {
        // TODO: implement profiling
    }
    async run(feeds, fetches, options) {
        return new Promise((resolve, reject) => {
            process.nextTick(() => {
                try {
                    resolve(__classPrivateFieldGet(this, _OnnxruntimeSessionHandler_inferenceSession, "f").run(feeds, fetches, options));
                }
                catch (e) {
                    // reject if any error is thrown
                    reject(e);
                }
            });
        });
    }
}
_OnnxruntimeSessionHandler_inferenceSession = new WeakMap();
class OnnxruntimeBackend {
    async init() {
        return Promise.resolve();
    }
    async createInferenceSessionHandler(pathOrBuffer, options) {
        return new Promise((resolve, reject) => {
            process.nextTick(() => {
                try {
                    resolve(new OnnxruntimeSessionHandler(pathOrBuffer, options || {}));
                }
                catch (e) {
                    // reject if any error is thrown
                    reject(e);
                }
            });
        });
    }
}
exports.onnxruntimeBackend = new OnnxruntimeBackend();
exports.listSupportedBackends = binding_1.binding.listSupportedBackends;
//# sourceMappingURL=backend.js.map
}, function(modId) { var map = {"./binding":1709710411692}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1709710411692, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.binding = void 0;
// export native binding
exports.binding = 
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
require(`../bin/napi-v3/${process.platform}/${process.arch}/onnxruntime_binding.node`);
//# sourceMappingURL=binding.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1709710411693, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.version = void 0;
// This file is generated by /js/scripts/update-version.ts
// Do not modify file content manually.
exports.version = '1.17.0';
//# sourceMappingURL=version.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1709710411690);
})()
//miniprogram-npm-outsideDeps=["onnxruntime-common"]
//# sourceMappingURL=index.js.map