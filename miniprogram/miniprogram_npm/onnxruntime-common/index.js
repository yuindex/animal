module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1709710411671, function(require, module, exports) {

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
/**
 * # ONNX Runtime JavaScript API
 *
 * ONNX Runtime JavaScript API is a unified API for all JavaScript usages, including the following NPM packages:
 *
 * - [onnxruntime-node](https://www.npmjs.com/package/onnxruntime-node)
 * - [onnxruntime-web](https://www.npmjs.com/package/onnxruntime-web)
 * - [onnxruntime-react-native](https://www.npmjs.com/package/onnxruntime-react-native)
 *
 * See also:
 * - [Get Started](https://onnxruntime.ai/docs/get-started/with-javascript.html)
 * - [Inference examples](https://github.com/microsoft/onnxruntime-inference-examples/tree/main/js)
 *
 * @packageDocumentation
 */
__exportStar(require("./backend.js"), exports);
__exportStar(require("./env.js"), exports);
__exportStar(require("./inference-session.js"), exports);
__exportStar(require("./tensor.js"), exports);
__exportStar(require("./trace.js"), exports);
__exportStar(require("./onnx-value.js"), exports);
__exportStar(require("./training-session.js"), exports);
//# sourceMappingURL=index.js.map
}, function(modId) {var map = {"./backend.js":1709710411672,"./env.js":1709710411674,"./inference-session.js":1709710411677,"./tensor.js":1709710411679,"./onnx-value.js":1709710411687,"./training-session.js":1709710411688}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1709710411672, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerBackend = void 0;
var backend_impl_js_1 = require("./backend-impl.js");
Object.defineProperty(exports, "registerBackend", { enumerable: true, get: function () { return backend_impl_js_1.registerBackend; } });
//# sourceMappingURL=backend.js.map
}, function(modId) { var map = {"./backend-impl.js":1709710411673}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1709710411673, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveBackend = exports.registerBackend = void 0;
const backends = new Map();
const backendsSortedByPriority = [];
/**
 * Register a backend.
 *
 * @param name - the name as a key to lookup as an execution provider.
 * @param backend - the backend object.
 * @param priority - an integer indicating the priority of the backend. Higher number means higher priority. if priority
 * < 0, it will be considered as a 'beta' version and will not be used as a fallback backend by default.
 *
 * @ignore
 */
const registerBackend = (name, backend, priority) => {
    if (backend && typeof backend.init === 'function' && typeof backend.createInferenceSessionHandler === 'function') {
        const currentBackend = backends.get(name);
        if (currentBackend === undefined) {
            backends.set(name, { backend, priority });
        }
        else if (currentBackend.priority > priority) {
            // same name is already registered with a higher priority. skip registeration.
            return;
        }
        else if (currentBackend.priority === priority) {
            if (currentBackend.backend !== backend) {
                throw new Error(`cannot register backend "${name}" using priority ${priority}`);
            }
        }
        if (priority >= 0) {
            const i = backendsSortedByPriority.indexOf(name);
            if (i !== -1) {
                backendsSortedByPriority.splice(i, 1);
            }
            for (let i = 0; i < backendsSortedByPriority.length; i++) {
                if (backends.get(backendsSortedByPriority[i]).priority <= priority) {
                    backendsSortedByPriority.splice(i, 0, name);
                    return;
                }
            }
            backendsSortedByPriority.push(name);
        }
        return;
    }
    throw new TypeError('not a valid backend');
};
exports.registerBackend = registerBackend;
/**
 * Resolve backend by specified hints.
 *
 * @param backendHints - a list of execution provider names to lookup. If omitted use registered backends as list.
 * @returns a promise that resolves to the backend.
 *
 * @ignore
 */
const resolveBackend = async (backendHints) => {
    const backendNames = backendHints.length === 0 ? backendsSortedByPriority : backendHints;
    const errors = [];
    for (const backendName of backendNames) {
        const backendInfo = backends.get(backendName);
        if (backendInfo) {
            if (backendInfo.initialized) {
                return backendInfo.backend;
            }
            else if (backendInfo.aborted) {
                continue; // current backend is unavailable; try next
            }
            const isInitializing = !!backendInfo.initPromise;
            try {
                if (!isInitializing) {
                    backendInfo.initPromise = backendInfo.backend.init(backendName);
                }
                await backendInfo.initPromise;
                backendInfo.initialized = true;
                return backendInfo.backend;
            }
            catch (e) {
                if (!isInitializing) {
                    errors.push({ name: backendName, err: e });
                }
                backendInfo.aborted = true;
            }
            finally {
                delete backendInfo.initPromise;
            }
        }
    }
    throw new Error(`no available backend found. ERR: ${errors.map(e => `[${e.name}] ${e.err}`).join(', ')}`);
};
exports.resolveBackend = resolveBackend;
//# sourceMappingURL=backend-impl.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1709710411674, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const env_impl_js_1 = require("./env-impl.js");
/**
 * Represent a set of flags as a global singleton.
 */
exports.env = env_impl_js_1.env;
//# sourceMappingURL=env.js.map
}, function(modId) { var map = {"./env-impl.js":1709710411675}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1709710411675, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const version_js_1 = require("./version.js");
let logLevelValue = 'warning';
exports.env = {
    wasm: {},
    webgl: {},
    webgpu: {},
    versions: { common: version_js_1.version },
    set logLevel(value) {
        if (value === undefined) {
            return;
        }
        if (typeof value !== 'string' || ['verbose', 'info', 'warning', 'error', 'fatal'].indexOf(value) === -1) {
            throw new Error(`Unsupported logging level: ${value}`);
        }
        logLevelValue = value;
    },
    get logLevel() {
        return logLevelValue;
    },
};
// set property 'logLevel' so that they can be correctly transferred to worker by `postMessage()`.
Object.defineProperty(exports.env, 'logLevel', { enumerable: true });
//# sourceMappingURL=env-impl.js.map
}, function(modId) { var map = {"./version.js":1709710411676}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1709710411676, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.version = void 0;
// This file is generated by /js/scripts/update-version.ts
// Do not modify file content manually.
exports.version = '1.17.0';
//# sourceMappingURL=version.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1709710411677, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.InferenceSession = void 0;
const inference_session_impl_js_1 = require("./inference-session-impl.js");
// eslint-disable-next-line @typescript-eslint/naming-convention
exports.InferenceSession = inference_session_impl_js_1.InferenceSession;
//# sourceMappingURL=inference-session.js.map
}, function(modId) { var map = {"./inference-session-impl.js":1709710411678}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1709710411678, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.InferenceSession = void 0;
const backend_impl_js_1 = require("./backend-impl.js");
const tensor_js_1 = require("./tensor.js");
const trace_js_1 = require("./trace.js");
class InferenceSession {
    constructor(handler) {
        this.handler = handler;
    }
    async run(feeds, arg1, arg2) {
        (0, trace_js_1.TRACE_FUNC_BEGIN)();
        const fetches = {};
        let options = {};
        // check inputs
        if (typeof feeds !== 'object' || feeds === null || feeds instanceof tensor_js_1.Tensor || Array.isArray(feeds)) {
            throw new TypeError('\'feeds\' must be an object that use input names as keys and OnnxValue as corresponding values.');
        }
        let isFetchesEmpty = true;
        // determine which override is being used
        if (typeof arg1 === 'object') {
            if (arg1 === null) {
                throw new TypeError('Unexpected argument[1]: cannot be null.');
            }
            if (arg1 instanceof tensor_js_1.Tensor) {
                throw new TypeError('\'fetches\' cannot be a Tensor');
            }
            if (Array.isArray(arg1)) {
                if (arg1.length === 0) {
                    throw new TypeError('\'fetches\' cannot be an empty array.');
                }
                isFetchesEmpty = false;
                // output names
                for (const name of arg1) {
                    if (typeof name !== 'string') {
                        throw new TypeError('\'fetches\' must be a string array or an object.');
                    }
                    if (this.outputNames.indexOf(name) === -1) {
                        throw new RangeError(`'fetches' contains invalid output name: ${name}.`);
                    }
                    fetches[name] = null;
                }
                if (typeof arg2 === 'object' && arg2 !== null) {
                    options = arg2;
                }
                else if (typeof arg2 !== 'undefined') {
                    throw new TypeError('\'options\' must be an object.');
                }
            }
            else {
                // decide whether arg1 is fetches or options
                // if any output name is present and its value is valid OnnxValue, we consider it fetches
                let isFetches = false;
                const arg1Keys = Object.getOwnPropertyNames(arg1);
                for (const name of this.outputNames) {
                    if (arg1Keys.indexOf(name) !== -1) {
                        const v = arg1[name];
                        if (v === null || v instanceof tensor_js_1.Tensor) {
                            isFetches = true;
                            isFetchesEmpty = false;
                            fetches[name] = v;
                        }
                    }
                }
                if (isFetches) {
                    if (typeof arg2 === 'object' && arg2 !== null) {
                        options = arg2;
                    }
                    else if (typeof arg2 !== 'undefined') {
                        throw new TypeError('\'options\' must be an object.');
                    }
                }
                else {
                    options = arg1;
                }
            }
        }
        else if (typeof arg1 !== 'undefined') {
            throw new TypeError('Unexpected argument[1]: must be \'fetches\' or \'options\'.');
        }
        // check if all inputs are in feed
        for (const name of this.inputNames) {
            if (typeof feeds[name] === 'undefined') {
                throw new Error(`input '${name}' is missing in 'feeds'.`);
            }
        }
        // if no fetches is specified, we use the full output names list
        if (isFetchesEmpty) {
            for (const name of this.outputNames) {
                fetches[name] = null;
            }
        }
        // feeds, fetches and options are prepared
        const results = await this.handler.run(feeds, fetches, options);
        const returnValue = {};
        for (const key in results) {
            if (Object.hasOwnProperty.call(results, key)) {
                const result = results[key];
                if (result instanceof tensor_js_1.Tensor) {
                    returnValue[key] = result;
                }
                else {
                    returnValue[key] = new tensor_js_1.Tensor(result.type, result.data, result.dims);
                }
            }
        }
        (0, trace_js_1.TRACE_FUNC_END)();
        return returnValue;
    }
    async release() {
        return this.handler.dispose();
    }
    static async create(arg0, arg1, arg2, arg3) {
        (0, trace_js_1.TRACE_FUNC_BEGIN)();
        // either load from a file or buffer
        let filePathOrUint8Array;
        let options = {};
        if (typeof arg0 === 'string') {
            filePathOrUint8Array = arg0;
            if (typeof arg1 === 'object' && arg1 !== null) {
                options = arg1;
            }
            else if (typeof arg1 !== 'undefined') {
                throw new TypeError('\'options\' must be an object.');
            }
        }
        else if (arg0 instanceof Uint8Array) {
            filePathOrUint8Array = arg0;
            if (typeof arg1 === 'object' && arg1 !== null) {
                options = arg1;
            }
            else if (typeof arg1 !== 'undefined') {
                throw new TypeError('\'options\' must be an object.');
            }
        }
        else if (arg0 instanceof ArrayBuffer ||
            (typeof SharedArrayBuffer !== 'undefined' && arg0 instanceof SharedArrayBuffer)) {
            const buffer = arg0;
            let byteOffset = 0;
            let byteLength = arg0.byteLength;
            if (typeof arg1 === 'object' && arg1 !== null) {
                options = arg1;
            }
            else if (typeof arg1 === 'number') {
                byteOffset = arg1;
                if (!Number.isSafeInteger(byteOffset)) {
                    throw new RangeError('\'byteOffset\' must be an integer.');
                }
                if (byteOffset < 0 || byteOffset >= buffer.byteLength) {
                    throw new RangeError(`'byteOffset' is out of range [0, ${buffer.byteLength}).`);
                }
                byteLength = arg0.byteLength - byteOffset;
                if (typeof arg2 === 'number') {
                    byteLength = arg2;
                    if (!Number.isSafeInteger(byteLength)) {
                        throw new RangeError('\'byteLength\' must be an integer.');
                    }
                    if (byteLength <= 0 || byteOffset + byteLength > buffer.byteLength) {
                        throw new RangeError(`'byteLength' is out of range (0, ${buffer.byteLength - byteOffset}].`);
                    }
                    if (typeof arg3 === 'object' && arg3 !== null) {
                        options = arg3;
                    }
                    else if (typeof arg3 !== 'undefined') {
                        throw new TypeError('\'options\' must be an object.');
                    }
                }
                else if (typeof arg2 !== 'undefined') {
                    throw new TypeError('\'byteLength\' must be a number.');
                }
            }
            else if (typeof arg1 !== 'undefined') {
                throw new TypeError('\'options\' must be an object.');
            }
            filePathOrUint8Array = new Uint8Array(buffer, byteOffset, byteLength);
        }
        else {
            throw new TypeError('Unexpected argument[0]: must be \'path\' or \'buffer\'.');
        }
        // get backend hints
        const eps = options.executionProviders || [];
        const backendHints = eps.map(i => typeof i === 'string' ? i : i.name);
        const backend = await (0, backend_impl_js_1.resolveBackend)(backendHints);
        const handler = await backend.createInferenceSessionHandler(filePathOrUint8Array, options);
        (0, trace_js_1.TRACE_FUNC_END)();
        return new InferenceSession(handler);
    }
    startProfiling() {
        this.handler.startProfiling();
    }
    endProfiling() {
        this.handler.endProfiling();
    }
    get inputNames() {
        return this.handler.inputNames;
    }
    get outputNames() {
        return this.handler.outputNames;
    }
}
exports.InferenceSession = InferenceSession;
//# sourceMappingURL=inference-session-impl.js.map
}, function(modId) { var map = {"./backend-impl.js":1709710411673,"./tensor.js":1709710411679}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1709710411679, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tensor = void 0;
const tensor_impl_js_1 = require("./tensor-impl.js");
// eslint-disable-next-line @typescript-eslint/naming-convention
exports.Tensor = tensor_impl_js_1.Tensor;
//# sourceMappingURL=tensor.js.map
}, function(modId) { var map = {"./tensor-impl.js":1709710411680}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1709710411680, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tensor = void 0;
const tensor_conversion_impl_js_1 = require("./tensor-conversion-impl.js");
const tensor_factory_impl_js_1 = require("./tensor-factory-impl.js");
const tensor_impl_type_mapping_js_1 = require("./tensor-impl-type-mapping.js");
const tensor_utils_impl_js_1 = require("./tensor-utils-impl.js");
/**
 * the implementation of Tensor interface.
 *
 * @ignore
 */
class Tensor {
    /**
     * implementation.
     */
    constructor(arg0, arg1, arg2) {
        // perform one-time check for BigInt support
        (0, tensor_impl_type_mapping_js_1.checkBigInt)();
        let type;
        let dims;
        if (typeof arg0 === 'object' && 'location' in arg0) {
            //
            // constructing tensor from specific location
            //
            this.dataLocation = arg0.location;
            type = arg0.type;
            dims = arg0.dims;
            switch (arg0.location) {
                case 'cpu-pinned': {
                    const expectedTypedArrayConstructor = tensor_impl_type_mapping_js_1.NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP.get(type);
                    if (!expectedTypedArrayConstructor) {
                        throw new TypeError(`unsupported type "${type}" to create tensor from pinned buffer`);
                    }
                    if (!(arg0.data instanceof expectedTypedArrayConstructor)) {
                        throw new TypeError(`buffer should be of type ${expectedTypedArrayConstructor.name}`);
                    }
                    this.cpuData = arg0.data;
                    break;
                }
                case 'texture': {
                    if (type !== 'float32') {
                        throw new TypeError(`unsupported type "${type}" to create tensor from texture`);
                    }
                    this.gpuTextureData = arg0.texture;
                    this.downloader = arg0.download;
                    this.disposer = arg0.dispose;
                    break;
                }
                case 'gpu-buffer': {
                    if ((type !== 'float32' && type !== 'float16' && type !== 'int32' && type !== 'int64' && type !== 'uint32' &&
                        type !== 'bool')) {
                        throw new TypeError(`unsupported type "${type}" to create tensor from gpu buffer`);
                    }
                    this.gpuBufferData = arg0.gpuBuffer;
                    this.downloader = arg0.download;
                    this.disposer = arg0.dispose;
                    break;
                }
                default:
                    throw new Error(`Tensor constructor: unsupported location '${this.dataLocation}'`);
            }
        }
        else {
            //
            // constructing tensor of location 'cpu'
            //
            let data;
            let maybeDims;
            // check whether arg0 is type or data
            if (typeof arg0 === 'string') {
                //
                // Override: constructor(type, data, ...)
                //
                type = arg0;
                maybeDims = arg2;
                if (arg0 === 'string') {
                    // string tensor
                    if (!Array.isArray(arg1)) {
                        throw new TypeError('A string tensor\'s data must be a string array.');
                    }
                    // we don't check whether every element in the array is string; this is too slow. we assume it's correct and
                    // error will be populated at inference
                    data = arg1;
                }
                else {
                    // numeric tensor
                    const typedArrayConstructor = tensor_impl_type_mapping_js_1.NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP.get(arg0);
                    if (typedArrayConstructor === undefined) {
                        throw new TypeError(`Unsupported tensor type: ${arg0}.`);
                    }
                    if (Array.isArray(arg1)) {
                        if (arg0 === 'float16') {
                            // Throw error here because when user try to use number array as data,
                            // e.g. new Tensor('float16', [1, 2, 3, 4], dims)), it will actually call
                            // Uint16Array.from(arg1) which generates wrong data.
                            throw new TypeError('Creating a float16 tensor from number array is not supported. Please use Uint16Array as data.');
                        }
                        else if (arg0 === 'uint64' || arg0 === 'int64') {
                            // use 'as any' here because:
                            // 1. TypeScript's check on type of 'Array.isArray()' does not work with readonly arrays.
                            // see https://github.com/microsoft/TypeScript/issues/17002
                            // 2. TypeScript's check on union type of '(BigInt64ArrayConstructor|BigUint64ArrayConstructor).from()'
                            // does not accept parameter mapFn.
                            // 3. parameters of 'SupportedTypedArrayConstructors.from()' does not match the requirement of the union
                            // type.
                            // assume 'arg1' is of type "readonly number[]|readonly bigint[]" here.
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            data = typedArrayConstructor.from(arg1, BigInt);
                        }
                        else {
                            // assume 'arg1' is of type "readonly number[]" here.
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            data = typedArrayConstructor.from(arg1);
                        }
                    }
                    else if (arg1 instanceof typedArrayConstructor) {
                        data = arg1;
                    }
                    else {
                        throw new TypeError(`A ${type} tensor's data must be type of ${typedArrayConstructor}`);
                    }
                }
            }
            else {
                //
                // Override: constructor(data, ...)
                //
                maybeDims = arg1;
                if (Array.isArray(arg0)) {
                    // only boolean[] and string[] is supported
                    if (arg0.length === 0) {
                        throw new TypeError('Tensor type cannot be inferred from an empty array.');
                    }
                    const firstElementType = typeof arg0[0];
                    if (firstElementType === 'string') {
                        type = 'string';
                        data = arg0;
                    }
                    else if (firstElementType === 'boolean') {
                        type = 'bool';
                        // 'arg0' is of type 'boolean[]'. Uint8Array.from(boolean[]) actually works, but typescript thinks this is
                        // wrong type. We use 'as any' to make it happy.
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        data = Uint8Array.from(arg0);
                    }
                    else {
                        throw new TypeError(`Invalid element type of data array: ${firstElementType}.`);
                    }
                }
                else {
                    // get tensor type from TypedArray
                    const mappedType = tensor_impl_type_mapping_js_1.NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP.get(arg0.constructor);
                    if (mappedType === undefined) {
                        throw new TypeError(`Unsupported type for tensor data: ${arg0.constructor}.`);
                    }
                    type = mappedType;
                    data = arg0;
                }
            }
            // type and data is processed, now processing dims
            if (maybeDims === undefined) {
                // assume 1-D tensor if dims omitted
                maybeDims = [data.length];
            }
            else if (!Array.isArray(maybeDims)) {
                throw new TypeError('A tensor\'s dims must be a number array');
            }
            dims = maybeDims;
            this.cpuData = data;
            this.dataLocation = 'cpu';
        }
        // perform check on dims
        const size = (0, tensor_utils_impl_js_1.calculateSize)(dims);
        // if data is on CPU, check whether data length matches tensor size
        if (this.cpuData && size !== this.cpuData.length) {
            throw new Error(`Tensor's size(${size}) does not match data length(${this.cpuData.length}).`);
        }
        this.type = type;
        this.dims = dims;
        this.size = size;
    }
    // #endregion
    // #region factory
    static async fromImage(image, options) {
        return (0, tensor_factory_impl_js_1.tensorFromImage)(image, options);
    }
    static fromTexture(texture, options) {
        return (0, tensor_factory_impl_js_1.tensorFromTexture)(texture, options);
    }
    static fromGpuBuffer(gpuBuffer, options) {
        return (0, tensor_factory_impl_js_1.tensorFromGpuBuffer)(gpuBuffer, options);
    }
    static fromPinnedBuffer(type, buffer, dims) {
        return (0, tensor_factory_impl_js_1.tensorFromPinnedBuffer)(type, buffer, dims);
    }
    // #endregion
    // #region conversions
    toDataURL(options) {
        return (0, tensor_conversion_impl_js_1.tensorToDataURL)(this, options);
    }
    toImageData(options) {
        return (0, tensor_conversion_impl_js_1.tensorToImageData)(this, options);
    }
    // #endregion
    // #region properties
    get data() {
        this.ensureValid();
        if (!this.cpuData) {
            throw new Error('The data is not on CPU. Use `getData()` to download GPU data to CPU, ' +
                'or use `texture` or `gpuBuffer` property to access the GPU data directly.');
        }
        return this.cpuData;
    }
    get location() {
        return this.dataLocation;
    }
    get texture() {
        this.ensureValid();
        if (!this.gpuTextureData) {
            throw new Error('The data is not stored as a WebGL texture.');
        }
        return this.gpuTextureData;
    }
    get gpuBuffer() {
        this.ensureValid();
        if (!this.gpuBufferData) {
            throw new Error('The data is not stored as a WebGPU buffer.');
        }
        return this.gpuBufferData;
    }
    // #endregion
    // #region methods
    async getData(releaseData) {
        this.ensureValid();
        switch (this.dataLocation) {
            case 'cpu':
            case 'cpu-pinned':
                return this.data;
            case 'texture':
            case 'gpu-buffer': {
                if (!this.downloader) {
                    throw new Error('The current tensor is not created with a specified data downloader.');
                }
                if (this.isDownloading) {
                    throw new Error('The current tensor is being downloaded.');
                }
                try {
                    this.isDownloading = true;
                    const data = await this.downloader();
                    this.downloader = undefined;
                    this.dataLocation = 'cpu';
                    this.cpuData = data;
                    if (releaseData && this.disposer) {
                        this.disposer();
                        this.disposer = undefined;
                    }
                    return data;
                }
                finally {
                    this.isDownloading = false;
                }
            }
            default:
                throw new Error(`cannot get data from location: ${this.dataLocation}`);
        }
    }
    dispose() {
        if (this.isDownloading) {
            throw new Error('The current tensor is being downloaded.');
        }
        if (this.disposer) {
            this.disposer();
            this.disposer = undefined;
        }
        this.cpuData = undefined;
        this.gpuTextureData = undefined;
        this.gpuBufferData = undefined;
        this.downloader = undefined;
        this.isDownloading = undefined;
        this.dataLocation = 'none';
    }
    // #endregion
    // #region tensor utilities
    ensureValid() {
        if (this.dataLocation === 'none') {
            throw new Error('The tensor is disposed.');
        }
    }
    reshape(dims) {
        this.ensureValid();
        if (this.downloader || this.disposer) {
            throw new Error('Cannot reshape a tensor that owns GPU resource.');
        }
        return (0, tensor_utils_impl_js_1.tensorReshape)(this, dims);
    }
}
exports.Tensor = Tensor;
//# sourceMappingURL=tensor-impl.js.map
}, function(modId) { var map = {"./tensor-impl-type-mapping.js":1709710411683,"./tensor-utils-impl.js":1709710411684}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1709710411683, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkBigInt = exports.NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP = exports.NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP = void 0;
// a runtime map that maps type string to TypedArray constructor. Should match Tensor.DataTypeMap.
exports.NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP = new Map([
    ['float32', Float32Array],
    ['uint8', Uint8Array],
    ['int8', Int8Array],
    ['uint16', Uint16Array],
    ['float16', Uint16Array],
    ['int16', Int16Array],
    ['int32', Int32Array],
    ['bool', Uint8Array],
    ['float64', Float64Array],
    ['uint32', Uint32Array],
]);
// a runtime map that maps type string to TypedArray constructor. Should match Tensor.DataTypeMap.
exports.NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP = new Map([
    [Float32Array, 'float32'],
    [Uint8Array, 'uint8'],
    [Int8Array, 'int8'],
    [Uint16Array, 'uint16'],
    [Int16Array, 'int16'],
    [Int32Array, 'int32'],
    [Float64Array, 'float64'],
    [Uint32Array, 'uint32'],
]);
// the following code allows delaying execution of BigInt checking. This allows lazy initialization for
// NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP and NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP, which allows BigInt polyfill
// if available.
let isBigIntChecked = false;
const checkBigInt = () => {
    if (!isBigIntChecked) {
        isBigIntChecked = true;
        const isBigInt64ArrayAvailable = typeof BigInt64Array !== 'undefined' && typeof BigInt64Array.from === 'function';
        const isBigUint64ArrayAvailable = typeof BigUint64Array !== 'undefined' && typeof BigUint64Array.from === 'function';
        if (isBigInt64ArrayAvailable) {
            exports.NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP.set('int64', BigInt64Array);
            exports.NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP.set(BigInt64Array, 'int64');
        }
        if (isBigUint64ArrayAvailable) {
            exports.NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP.set('uint64', BigUint64Array);
            exports.NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP.set(BigUint64Array, 'uint64');
        }
    }
};
exports.checkBigInt = checkBigInt;
//# sourceMappingURL=tensor-impl-type-mapping.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1709710411684, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.tensorReshape = exports.calculateSize = void 0;
const tensor_impl_js_1 = require("./tensor-impl.js");
/**
 * calculate size from dims.
 *
 * @param dims the dims array. May be an illegal input.
 */
const calculateSize = (dims) => {
    let size = 1;
    for (let i = 0; i < dims.length; i++) {
        const dim = dims[i];
        if (typeof dim !== 'number' || !Number.isSafeInteger(dim)) {
            throw new TypeError(`dims[${i}] must be an integer, got: ${dim}`);
        }
        if (dim < 0) {
            throw new RangeError(`dims[${i}] must be a non-negative integer, got: ${dim}`);
        }
        size *= dim;
    }
    return size;
};
exports.calculateSize = calculateSize;
/**
 * implementation of Tensor.reshape()
 */
const tensorReshape = (tensor, dims) => {
    switch (tensor.location) {
        case 'cpu':
            return new tensor_impl_js_1.Tensor(tensor.type, tensor.data, dims);
        case 'cpu-pinned':
            return new tensor_impl_js_1.Tensor({
                location: 'cpu-pinned',
                data: tensor.data,
                type: tensor.type,
                dims,
            });
        case 'texture':
            return new tensor_impl_js_1.Tensor({
                location: 'texture',
                texture: tensor.texture,
                type: tensor.type,
                dims,
            });
        case 'gpu-buffer':
            return new tensor_impl_js_1.Tensor({
                location: 'gpu-buffer',
                gpuBuffer: tensor.gpuBuffer,
                type: tensor.type,
                dims,
            });
        default:
            throw new Error(`tensorReshape: tensor location ${tensor.location} is not supported`);
    }
};
exports.tensorReshape = tensorReshape;
//# sourceMappingURL=tensor-utils-impl.js.map
}, function(modId) { var map = {"./tensor-impl.js":1709710411680}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1709710411687, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
//# sourceMappingURL=onnx-value.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1709710411688, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingSession = void 0;
const training_session_impl_js_1 = require("./training-session-impl.js");
// eslint-disable-next-line @typescript-eslint/naming-convention
exports.TrainingSession = training_session_impl_js_1.TrainingSession;
//# sourceMappingURL=training-session.js.map
}, function(modId) { var map = {"./training-session-impl.js":1709710411689}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1709710411689, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingSession = void 0;
const backend_impl_js_1 = require("./backend-impl.js");
const tensor_js_1 = require("./tensor.js");
const noBackendErrMsg = 'Training backend could not be resolved. ' +
    'Make sure you\'re using the correct configuration & WebAssembly files.';
class TrainingSession {
    constructor(handler, hasOptimizerModel, hasEvalModel) {
        this.handler = handler;
        this.hasOptimizerModel = hasOptimizerModel;
        this.hasEvalModel = hasEvalModel;
    }
    get trainingInputNames() {
        return this.handler.inputNames;
    }
    get trainingOutputNames() {
        return this.handler.outputNames;
    }
    get evalInputNames() {
        if (this.hasEvalModel) {
            return this.handler.evalInputNames;
        }
        else {
            throw new Error('This training session has no evalModel loaded.');
        }
    }
    get evalOutputNames() {
        if (this.hasEvalModel) {
            return this.handler.evalOutputNames;
        }
        else {
            throw new Error('This training session has no evalModel loaded.');
        }
    }
    static async create(trainingOptions, sessionOptions) {
        const evalModel = trainingOptions.evalModel || '';
        const optimizerModel = trainingOptions.optimizerModel || '';
        const options = sessionOptions || {};
        // get backend hints
        const eps = options.executionProviders || [];
        const backendHints = eps.map(i => typeof i === 'string' ? i : i.name);
        const backend = await (0, backend_impl_js_1.resolveBackend)(backendHints);
        if (backend.createTrainingSessionHandler) {
            const handler = await backend.createTrainingSessionHandler(trainingOptions.checkpointState, trainingOptions.trainModel, evalModel, optimizerModel, options);
            return new TrainingSession(handler, !!trainingOptions.optimizerModel, !!trainingOptions.evalModel);
        }
        else {
            throw new Error(noBackendErrMsg);
        }
    }
    /**
     * Helper function for runTrainStep and future runStep methods that handles the type-narrowing conversion from
     * the given parameters to SessionHandler.FetchesType and RunOptions.
     *
     * @param inputNames the feeds object is checked that they contain all input names in the provided list of input
     * names.
     * @param outputNames the fetches object is checked that their keys match up with valid names in the list of output
     * names.
     * @param feeds the required input
     * @param arg1 narrowed & converted into the SessionHandler.FetchesType or RunOptions object
     * @param arg2 optional RunOptions object.
     * @returns
     */
    typeNarrowingForRunStep(inputNames, outputNames, feeds, arg1, arg2) {
        const fetches = {};
        let options = {};
        // check inputs
        if (typeof feeds !== 'object' || feeds === null || feeds instanceof tensor_js_1.Tensor || Array.isArray(feeds)) {
            throw new TypeError('\'feeds\' must be an object that use input names as keys and OnnxValue as corresponding values.');
        }
        let isFetchesEmpty = true;
        // determine which override is being used
        if (typeof arg1 === 'object') {
            if (arg1 === null) {
                throw new TypeError('Unexpected argument[1]: cannot be null.');
            }
            if (arg1 instanceof tensor_js_1.Tensor) {
                throw new TypeError('\'fetches\' cannot be a Tensor');
            }
            if (Array.isArray(arg1)) {
                if (arg1.length === 0) {
                    throw new TypeError('\'fetches\' cannot be an empty array.');
                }
                isFetchesEmpty = false;
                // output names
                for (const name of arg1) {
                    if (typeof name !== 'string') {
                        throw new TypeError('\'fetches\' must be a string array or an object.');
                    }
                    if (outputNames.indexOf(name) === -1) {
                        throw new RangeError(`'fetches' contains invalid output name: ${name}.`);
                    }
                    fetches[name] = null;
                }
                if (typeof arg2 === 'object' && arg2 !== null) {
                    options = arg2;
                }
                else if (typeof arg2 !== 'undefined') {
                    throw new TypeError('\'options\' must be an object.');
                }
            }
            else {
                // decide whether arg1 is fetches or options
                // if any output name is present and its value is valid OnnxValue, we consider it fetches
                let isFetches = false;
                const arg1Keys = Object.getOwnPropertyNames(arg1);
                for (const name of outputNames) {
                    if (arg1Keys.indexOf(name) !== -1) {
                        const v = arg1[name];
                        if (v === null || v instanceof tensor_js_1.Tensor) {
                            isFetches = true;
                            isFetchesEmpty = false;
                            fetches[name] = v;
                        }
                    }
                }
                if (isFetches) {
                    if (typeof arg2 === 'object' && arg2 !== null) {
                        options = arg2;
                    }
                    else if (typeof arg2 !== 'undefined') {
                        throw new TypeError('\'options\' must be an object.');
                    }
                }
                else {
                    options = arg1;
                }
            }
        }
        else if (typeof arg1 !== 'undefined') {
            throw new TypeError('Unexpected argument[1]: must be \'fetches\' or \'options\'.');
        }
        // check if all inputs are in feed
        for (const name of inputNames) {
            if (typeof feeds[name] === 'undefined') {
                throw new Error(`input '${name}' is missing in 'feeds'.`);
            }
        }
        // if no fetches is specified, we use the full output names list
        if (isFetchesEmpty) {
            for (const name of outputNames) {
                fetches[name] = null;
            }
        }
        return [fetches, options];
    }
    /**
     * Helper method for runTrainStep and any other runStep methods. Takes the ReturnType result from the SessionHandler
     * and changes it into a map of Tensors.
     *
     * @param results
     * @returns
     */
    convertHandlerReturnTypeToMapOfTensors(results) {
        const returnValue = {};
        for (const key in results) {
            if (Object.hasOwnProperty.call(results, key)) {
                const result = results[key];
                if (result instanceof tensor_js_1.Tensor) {
                    returnValue[key] = result;
                }
                else {
                    returnValue[key] = new tensor_js_1.Tensor(result.type, result.data, result.dims);
                }
            }
        }
        return returnValue;
    }
    async lazyResetGrad() {
        await this.handler.lazyResetGrad();
    }
    async runTrainStep(feeds, arg1, arg2) {
        const [fetches, options] = this.typeNarrowingForRunStep(this.trainingInputNames, this.trainingOutputNames, feeds, arg1, arg2);
        const results = await this.handler.runTrainStep(feeds, fetches, options);
        return this.convertHandlerReturnTypeToMapOfTensors(results);
    }
    async runOptimizerStep(options) {
        if (this.hasOptimizerModel) {
            await this.handler.runOptimizerStep(options || {});
        }
        else {
            throw new Error('This TrainingSession has no OptimizerModel loaded.');
        }
    }
    async runEvalStep(feeds, arg1, arg2) {
        if (this.hasEvalModel) {
            const [fetches, options] = this.typeNarrowingForRunStep(this.evalInputNames, this.evalOutputNames, feeds, arg1, arg2);
            const results = await this.handler.runEvalStep(feeds, fetches, options);
            return this.convertHandlerReturnTypeToMapOfTensors(results);
        }
        else {
            throw new Error('This TrainingSession has no EvalModel loaded.');
        }
    }
    async getParametersSize(trainableOnly = true) {
        return this.handler.getParametersSize(trainableOnly);
    }
    async loadParametersBuffer(array, trainableOnly = true) {
        const paramsSize = await this.getParametersSize(trainableOnly);
        // checking that the size of the Uint8Array is equivalent to the byte length of a Float32Array of the number
        // of parameters
        if (array.length !== 4 * paramsSize) {
            throw new Error('Size of the buffer passed into loadParametersBuffer must match the number of parameters in ' +
                'the model. Please use getParametersSize method to check.');
        }
        return this.handler.loadParametersBuffer(array, trainableOnly);
    }
    async getContiguousParameters(trainableOnly = true) {
        return this.handler.getContiguousParameters(trainableOnly);
    }
    async release() {
        return this.handler.dispose();
    }
}
exports.TrainingSession = TrainingSession;
//# sourceMappingURL=training-session-impl.js.map
}, function(modId) { var map = {"./backend-impl.js":1709710411673,"./tensor.js":1709710411679}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1709710411671);
})()
//miniprogram-npm-outsideDeps=["./trace.js","./tensor-conversion-impl.js","./tensor-factory-impl.js"]
//# sourceMappingURL=index.js.map