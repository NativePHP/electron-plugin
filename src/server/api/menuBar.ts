import express from "express";
import { Menu, Tray, nativeImage } from "electron";
import { mapMenu } from "./helper";
import state from "../state";
import { menubar } from "menubar";
import { notifyLaravel } from "../utils";
import { join } from "path";

const router = express.Router();

router.post("/label", (req, res) => {
  res.sendStatus(200);

  const { label } = req.body;

  state.activeMenuBar.tray.setTitle(label);
});

router.post("/show", (req, res) => {
  res.sendStatus(200);

  state.activeMenuBar.showWindow();
});

router.post("/hide", (req, res) => {
  res.sendStatus(200);

  state.activeMenuBar.hideWindow();
});

router.post("/create", (req, res) => {
  res.sendStatus(200);

  const {
    width,
    height,
    url,
    label,
    alwaysOnTop,
    vibrancy,
    backgroundColor,
    transparency,
    icon,
    withoutIcon,
    showDockIcon,
    onlyShowContextWindow,
    contextMenu
  } = req.body;

  const menuBarIcon = withoutIcon ? nativeImage.createEmpty() : (icon || state.icon.replace("icon.png", "IconTemplate.png"));

  if (onlyShowContextWindow === true) {
    const tray = new Tray(menuBarIcon);
    tray.setContextMenu(buildMenu(contextMenu));

    state.activeMenuBar = menubar({
      tray,
      index: false,
      showDockIcon,
      showOnAllWorkspaces: false,
      browserWindow: {
        show: false,
        width: 0,
        height: 0,
      }
    });

  } else {
    state.activeMenuBar = menubar({
      icon: menuBarIcon,
      index: url,
      showDockIcon,
      showOnAllWorkspaces: false,
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
    state.activeMenuBar.on("after-create-window", () => {
      require("@electron/remote/main").enable(state.activeMenuBar.window.webContents);
    });
  }

  state.activeMenuBar.on("ready", () => {
    state.activeMenuBar.tray.setTitle(label);

    state.activeMenuBar.on("hide", () => {
      notifyLaravel("events", {
        event: "\\Native\\Laravel\\Events\\MenuBar\\MenuBarHidden"
      });
    });

    state.activeMenuBar.on("show", () => {
      notifyLaravel("events", {
        event: "\\Native\\Laravel\\Events\\MenuBar\\MenuBarShown"
      });
    });

    if (onlyShowContextWindow !== true) {
      state.activeMenuBar.tray.on("right-click", () => {
        notifyLaravel("events", {
          event: "\\Native\\Laravel\\Events\\MenuBar\\MenuBarContextMenuOpened"
        });

        state.activeMenuBar.tray.popUpContextMenu(buildMenu(contextMenu));
      });
    }
  });
});

function buildMenu(contextMenu) {
  let menu = Menu.buildFromTemplate([{ role: "quit" }]);

  if (contextMenu) {
    const menuEntries = contextMenu.map(mapMenu);
    menu = Menu.buildFromTemplate(menuEntries);
  }

  return menu;
}

export default router;
