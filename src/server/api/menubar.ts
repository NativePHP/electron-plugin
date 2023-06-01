import express from 'express'
import {Menu, nativeImage} from 'electron'
import {mapMenu} from "./helper";
import state from "../state"
import {menubar} from 'menubar';
import {notifyLaravel} from "../utils";
const router = express.Router();

router.post('/api/menubar/label', (req, res) => {
    res.sendStatus(200)

    const {label} = req.body

    state.activeMenuBar.tray.setTitle(label)
})

router.post('/api/menubar', (req, res) => {
    res.sendStatus(200)

    const {id, width, height, url, alwaysOnTop, vibrancy, backgroundColor, transparency, icon, showDockIcon} = req.body

    if (! showDockIcon) {
        //app.dock.hide();
    } else {
        //app.dock.show();
    }

    state.activeMenuBar = menubar({
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
  state.activeMenuBar.on('after-create-window', () => {
        require("@electron/remote/main").enable(state.activeMenuBar.window.webContents)
    });
  state.activeMenuBar.on('ready', () => {
    state.activeMenuBar.tray.setImage(nativeImage.createEmpty());
    state.activeMenuBar.on('show', () => {
            notifyLaravel('events', {
                event: '\\Native\\Laravel\\Events\\MenuBar\\MenuBarClicked',
            })
        });
      state.activeMenuBar.tray.on('right-click', () => {
        state.activeMenuBar.tray.popUpContextMenu(Menu.buildFromTemplate([
                { role: 'quit' }
            ]))
        });
        console.log("menubar ready")
    });
});

export default router;
