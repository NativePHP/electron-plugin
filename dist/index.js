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
const electron_updater_1 = require("electron-updater");
const state_1 = __importDefault(require("./server/state"));
const utils_1 = require("@electron-toolkit/utils");
const server_1 = require("./server");
const utils_2 = require("./server/utils");
const electron_1 = require("electron");
const path_1 = require("path");
const ps_node_1 = __importDefault(require("ps-node"));
let phpProcesses = [];
let websocketProcess;
let schedulerInterval;
const killChildProcesses = () => {
    let processes = [
        ...phpProcesses,
        websocketProcess,
    ];
    processes.forEach((process) => {
        try {
            console.log(`Killing process ${process.pid}`);
            ps_node_1.default.kill(process.pid);
        }
        catch (err) {
            console.error(err);
        }
    });
};
class NativePHP {
    bootstrap(app, icon, phpBinary, cert) {
        require('@electron/remote/main').initialize();
        state_1.default.icon = icon;
        state_1.default.php = phpBinary;
        state_1.default.caCert = cert;
        this.bootstrapApp(app);
        this.addEventListeners(app);
        this.addTerminateListeners(app);
    }
    addEventListeners(app) {
        app.on('open-url', (event, url) => {
            (0, utils_2.notifyLaravel)('events', {
                event: '\\Native\\Laravel\\Events\\App\\OpenedFromURL',
                payload: [url]
            });
        });
        app.on('open-file', (event, path) => {
            (0, utils_2.notifyLaravel)('events', {
                event: '\\Native\\Laravel\\Events\\App\\OpenFile',
                payload: [path]
            });
        });
        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                app.quit();
            }
        });
    }
    addTerminateListeners(app) {
        app.on('before-quit', (e) => {
            if (schedulerInterval) {
                clearInterval(schedulerInterval);
            }
            killChildProcesses();
        });
    }
    bootstrapApp(app) {
        app.whenReady().then(() => __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (process.env.NODE_ENV === 'development') {
                app.dock.setIcon(state_1.default.icon);
            }
            app.on('browser-window-created', (_, window) => {
                utils_1.optimizer.watchWindowShortcuts(window);
            });
            let nativePHPConfig = {};
            try {
                let { stdout } = yield (0, server_1.retrieveNativePHPConfig)();
                nativePHPConfig = JSON.parse(stdout);
            }
            catch (e) {
                console.error(e);
            }
            utils_1.electronApp.setAppUserModelId(nativePHPConfig === null || nativePHPConfig === void 0 ? void 0 : nativePHPConfig.app_id);
            const deepLinkProtocol = nativePHPConfig === null || nativePHPConfig === void 0 ? void 0 : nativePHPConfig.deeplink_scheme;
            if (deepLinkProtocol) {
                if (process.defaultApp) {
                    if (process.argv.length >= 2) {
                        app.setAsDefaultProtocolClient(deepLinkProtocol, process.execPath, [(0, path_1.resolve)(process.argv[1])]);
                    }
                }
                else {
                    app.setAsDefaultProtocolClient(deepLinkProtocol);
                }
            }
            const apiPort = yield (0, server_1.startAPI)();
            console.log('API server started on port', apiPort.port);
            phpProcesses = yield (0, server_1.servePhpApp)(apiPort.port);
            websocketProcess = (0, server_1.serveWebsockets)();
            yield (0, utils_2.notifyLaravel)('booted');
            if (((_a = nativePHPConfig === null || nativePHPConfig === void 0 ? void 0 : nativePHPConfig.updater) === null || _a === void 0 ? void 0 : _a.enabled) === true) {
                electron_updater_1.autoUpdater.checkForUpdatesAndNotify();
            }
            schedulerInterval = setInterval(() => {
                console.log("Running scheduler...");
                (0, server_1.runScheduler)(apiPort.port);
            }, 60 * 1000);
            app.on('activate', function () {
                if (electron_1.BrowserWindow.getAllWindows().length === 0)
                    (0, utils_2.notifyLaravel)('booted');
            });
        }));
    }
}
module.exports = new NativePHP();
