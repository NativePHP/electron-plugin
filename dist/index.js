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
const electron_1 = require("electron");
const electron_updater_1 = require("electron-updater");
const state_1 = __importDefault(require("./server/state"));
const utils_1 = require("@electron-toolkit/utils");
const server_1 = require("./server");
const utils_2 = require("./server/utils");
const path_1 = require("path");
const ps_node_1 = __importDefault(require("ps-node"));
class NativePHP {
    constructor() {
        this.phpProcesses = [];
        this.websocketProcess = undefined;
        this.schedulerInterval = undefined;
        this.killChildProcesses = () => {
            const processes = [...this.phpProcesses, this.websocketProcess].filter((p) => p !== undefined);
            processes.forEach((process) => {
                try {
                    ps_node_1.default.kill(process.pid);
                }
                catch (err) {
                    console.error(err);
                }
            });
        };
    }
    bootstrap(app, icon, phpBinary, cert) {
        require("@electron/remote/main").initialize();
        state_1.default.icon = icon;
        state_1.default.php = phpBinary;
        state_1.default.caCert = cert;
        this.bootstrapApp(app);
        this.addEventListeners(app);
    }
    addEventListeners(app) {
        app.on("open-url", (event, url) => {
            (0, utils_2.notifyLaravel)("events", {
                event: "\\Native\\Laravel\\Events\\App\\OpenedFromURL",
                payload: [url],
            });
        });
        app.on("open-file", (event, path) => {
            (0, utils_2.notifyLaravel)("events", {
                event: "\\Native\\Laravel\\Events\\App\\OpenFile",
                payload: [path],
            });
        });
        app.on("window-all-closed", () => {
            if (process.platform !== "darwin") {
                app.quit();
            }
        });
        app.on("before-quit", (e) => {
            if (this.schedulerInterval) {
                clearInterval(this.schedulerInterval);
            }
            this.killChildProcesses();
        });
        app.on("browser-window-created", (_, window) => {
            utils_1.optimizer.watchWindowShortcuts(window);
        });
        app.on("activate", function (event, hasVisibleWindows) {
            if (!hasVisibleWindows) {
                (0, utils_2.notifyLaravel)("booted");
            }
            event.preventDefault();
        });
    }
    bootstrapApp(app) {
        let nativePHPConfig = {};
        (0, server_1.retrieveNativePHPConfig)()
            .then((result) => {
            try {
                nativePHPConfig = JSON.parse(result.stdout);
            }
            catch (e) {
                console.error(e);
            }
        })
            .catch((err) => {
            console.error(err);
        })
            .finally(() => {
            this.setupApp(nativePHPConfig);
        });
    }
    setupApp(nativePHPConfig) {
        electron_1.app.whenReady().then(() => __awaiter(this, void 0, void 0, function* () {
            this.setDockIcon();
            this.setAppUserModelId(nativePHPConfig);
            this.setDeepLinkHandler(nativePHPConfig);
            const apiPort = yield (0, server_1.startAPI)();
            console.log("API server started on port", apiPort.port);
            let phpIniSettings = {};
            try {
                const { stdout } = yield (0, server_1.retrievePhpIniSettings)();
                phpIniSettings = JSON.parse(stdout);
            }
            catch (e) {
                console.error(e);
            }
            this.phpProcesses = yield (0, server_1.servePhpApp)(apiPort.port, phpIniSettings);
            this.websocketProcess = (0, server_1.serveWebsockets)();
            yield (0, utils_2.notifyLaravel)("booted");
            this.bootAutoUpdater(nativePHPConfig);
            const now = new Date();
            const delay = (60 - now.getSeconds()) * 1000 + (1000 - now.getMilliseconds());
            setTimeout(() => {
                console.log("Running scheduler...");
                (0, server_1.runScheduler)(apiPort.port, phpIniSettings);
                this.schedulerInterval = setInterval(() => {
                    console.log("Running scheduler...");
                    (0, server_1.runScheduler)(apiPort.port, phpIniSettings);
                }, 60 * 1000);
            }, delay);
        }));
    }
    setDockIcon() {
        if (process.platform === "darwin" &&
            process.env.NODE_ENV === "development") {
            electron_1.app.dock.setIcon(state_1.default.icon);
        }
    }
    setAppUserModelId(config) {
        utils_1.electronApp.setAppUserModelId(config === null || config === void 0 ? void 0 : config.app_id);
    }
    setDeepLinkHandler(config) {
        const deepLinkProtocol = config === null || config === void 0 ? void 0 : config.deeplink_scheme;
        if (deepLinkProtocol) {
            if (process.defaultApp) {
                if (process.argv.length >= 2) {
                    electron_1.app.setAsDefaultProtocolClient(deepLinkProtocol, process.execPath, [
                        (0, path_1.resolve)(process.argv[1]),
                    ]);
                }
            }
            else {
                electron_1.app.setAsDefaultProtocolClient(deepLinkProtocol);
            }
        }
    }
    bootAutoUpdater(config) {
        var _a;
        if (((_a = config === null || config === void 0 ? void 0 : config.updater) === null || _a === void 0 ? void 0 : _a.enabled) === true) {
            electron_updater_1.autoUpdater.checkForUpdatesAndNotify();
        }
    }
}
module.exports = new NativePHP();
