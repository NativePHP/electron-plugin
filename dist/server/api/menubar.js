"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const electron_1 = require("electron");
const state_1 = __importDefault(require("../state"));
const menubar_1 = require("menubar");
const utils_1 = require("../utils");
const router = express_1.default.Router();
router.post('/api/menubar/label', (req, res) => {
    res.sendStatus(200);
    const { label } = req.body;
    state_1.default.activeMenuBar.tray.setTitle(label);
});
router.post('/api/menubar', (req, res) => {
    res.sendStatus(200);
    const { id, width, height, url, alwaysOnTop, vibrancy, backgroundColor, transparency, icon, showDockIcon } = req.body;
    if (!showDockIcon) {
    }
    else {
    }
    state_1.default.activeMenuBar = (0, menubar_1.menubar)({
        icon,
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
    state_1.default.activeMenuBar.on('after-create-window', () => {
        require("@electron/remote/main").enable(state_1.default.activeMenuBar.window.webContents);
    });
    state_1.default.activeMenuBar.on('ready', () => {
        state_1.default.activeMenuBar.tray.setImage(electron_1.nativeImage.createEmpty());
        state_1.default.activeMenuBar.on('show', () => {
            (0, utils_1.notifyLaravel)('events', {
                event: '\\Native\\Laravel\\Events\\MenuBar\\MenuBarClicked',
            });
        });
        state_1.default.activeMenuBar.tray.on('right-click', () => {
            state_1.default.activeMenuBar.tray.popUpContextMenu(electron_1.Menu.buildFromTemplate([
                { role: 'quit' }
            ]));
        });
        console.log("menubar ready");
    });
});
exports.default = router;
