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
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrievePhpIniSettings = exports.retrieveNativePHPConfig = exports.serveWebsockets = exports.startAPI = exports.startQueue = exports.runScheduler = exports.servePhpApp = void 0;
const websockets_1 = __importDefault(require("./websockets"));
exports.serveWebsockets = websockets_1.default;
const api_1 = __importDefault(require("./api"));
const php_1 = require("./php");
Object.defineProperty(exports, "retrieveNativePHPConfig", { enumerable: true, get: function () { return php_1.retrieveNativePHPConfig; } });
Object.defineProperty(exports, "retrievePhpIniSettings", { enumerable: true, get: function () { return php_1.retrievePhpIniSettings; } });
const utils_1 = require("./utils");
const state_1 = __importDefault(require("./state"));
function servePhpApp(phpIniSettings) {
    return __awaiter(this, void 0, void 0, function* () {
        const processes = [];
        const result = yield (0, php_1.serveApp)(state_1.default.randomSecret, state_1.default.electronApiPort, phpIniSettings);
        processes.push(result.process);
        processes.push((0, php_1.startQueueWorker)(state_1.default.randomSecret, state_1.default.electronApiPort, phpIniSettings));
        state_1.default.phpPort = result.port;
        yield (0, utils_1.appendCookie)();
        return processes;
    });
}
exports.servePhpApp = servePhpApp;
function runScheduler(phpIniSettings) {
    (0, php_1.startScheduler)(state_1.default.randomSecret, state_1.default.electronApiPort, phpIniSettings);
}
exports.runScheduler = runScheduler;
function startQueue(phpIniSettings) {
    if (!process.env.NATIVE_PHP_SKIP_QUEUE) {
        return (0, php_1.startQueueWorker)(state_1.default.randomSecret, state_1.default.electronApiPort, phpIniSettings);
    }
}
exports.startQueue = startQueue;
function startAPI() {
    return (0, api_1.default)(state_1.default.randomSecret);
}
exports.startAPI = startAPI;
