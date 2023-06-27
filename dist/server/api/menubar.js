"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const electron_1 = require("electron");
const helper_1 = require("./helper");
const state_1 = __importDefault(require("../state"));
const menubar_1 = require("menubar");
const utils_1 = require("../utils");
const router = express_1.default.Router();
router.post("/label", (req, res) => {
    res.sendStatus(200);
    const { label } = req.body;
    state_1.default.activeMenuBar.tray.setTitle(label);
});
router.post("/show", (req, res) => {
    res.sendStatus(200);
    state_1.default.activeMenuBar.showWindow();
});
router.post("/hide", (req, res) => {
    res.sendStatus(200);
    state_1.default.activeMenuBar.hideWindow();
});
router.post("/create", (req, res) => {
    res.sendStatus(200);
    const { width, height, url, label, alwaysOnTop, vibrancy, backgroundColor, transparency, icon, showDockIcon, contextMenu } = req.body;
    state_1.default.activeMenuBar = (0, menubar_1.menubar)({
        icon: icon || state_1.default.icon.replace("icon.png", "IconTemplate.png"),
        index: url,
        showDockIcon,
        browserWindow: {
            width,
            height,
            alwaysOnTop,
            vibrancy,
            backgroundColor,
            transparent: transparency,
            webPreferences: {
                nodeIntegration: true,
                sandbox: false,
                contextIsolation: false
            }
        }
    });
    state_1.default.activeMenuBar.on("after-create-window", () => {
        require("@electron/remote/main").enable(state_1.default.activeMenuBar.window.webContents);
    });
    state_1.default.activeMenuBar.on("ready", () => {
        state_1.default.activeMenuBar.tray.setTitle(label);
        state_1.default.activeMenuBar.on("hide", () => {
            (0, utils_1.notifyLaravel)("events", {
                event: "\\Native\\Laravel\\Events\\MenuBar\\MenuBarHidden"
            });
        });
        state_1.default.activeMenuBar.on("show", () => {
            (0, utils_1.notifyLaravel)("events", {
                event: "\\Native\\Laravel\\Events\\MenuBar\\MenuBarShown"
            });
        });
        state_1.default.activeMenuBar.tray.on("right-click", () => {
            (0, utils_1.notifyLaravel)("events", {
                event: "\\Native\\Laravel\\Events\\MenuBar\\MenuBarContextMenuOpened"
            });
            let menu = electron_1.Menu.buildFromTemplate([{ role: "quit" }]);
            if (contextMenu) {
                const menuEntries = contextMenu.map(helper_1.mapMenu);
                menu = electron_1.Menu.buildFromTemplate(menuEntries);
            }
            state_1.default.activeMenuBar.tray.popUpContextMenu(menu);
        });
    });
});
exports.default = router;
