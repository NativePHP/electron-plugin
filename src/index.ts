import type CrossProcessExports from 'electron'
import { autoUpdater } from "electron-updater"
import state from './server/state';
import {electronApp, is, optimizer} from '@electron-toolkit/utils'
import { resolve } from "path";
import {retrieveNativePHPConfig, runScheduler, servePhpApp, serveWebsockets, startAPI} from './server'
import {notifyLaravel} from "./server/utils";
import { BrowserWindow, app } from "electron";
import ps from 'ps-node'

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
      ps.kill(process.pid);
    } catch (err) {
      console.error(err);
    }
  });
}

class NativePHP {
  public bootstrap(app: CrossProcessExports.App, icon: string, phpBinary: string, cert: string) {
    require('@electron/remote/main').initialize();

    state.icon = icon;
    state.php = phpBinary;
    state.caCert = cert;

    this.bootstrapApp(app);
    this.addEventListeners(app);
    this.addTerminateListeners(app);
  }


  private addEventListeners(app: Electron.CrossProcessExports.App) {
    app.on('open-url', (event, url) => {
      notifyLaravel('events', {
        event: '\\Native\\Laravel\\Events\\App\\OpenedFromURL',
        payload: [url]
      })
    })

    app.on('open-file', (event, path) => {
      notifyLaravel('events', {
        event: '\\Native\\Laravel\\Events\\App\\OpenFile',
        payload: [path]
      })
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })
  }

  private addTerminateListeners(app: Electron.CrossProcessExports.App) {
    app.on('before-quit', (e) => {
      if (schedulerInterval) {
        clearInterval(schedulerInterval);
      }

      killChildProcesses();
    });
  }

  private bootstrapApp(app: Electron.CrossProcessExports.App) {
    app.whenReady().then(async () => {

	    console.log('NativePHP bootstrap - Checking for Platform/Architecture...');
      console.log('Platform:', process.platform);
      console.log('Architecture:', process.arch);
      
      if (process.env.NODE_ENV === 'development') {
        // app.dock.setIcon(state.icon) // TODO: Fix this
      }

      // Default open or close DevTools by F12 in development
      // and ignore CommandOrControl + R in production.
      // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
      app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
      })

      let nativePHPConfig = {};
      try {
        let {stdout} = await retrieveNativePHPConfig()
        nativePHPConfig = JSON.parse(stdout);
      } catch (e) {
        console.error(e);
      }

      // @ts-ignore
      electronApp.setAppUserModelId(nativePHPConfig?.app_id)

      // @ts-ignore
      const deepLinkProtocol = nativePHPConfig?.deeplink_scheme;
      if (deepLinkProtocol) {
        if (process.defaultApp) {
          if (process.argv.length >= 2) {
            app.setAsDefaultProtocolClient(deepLinkProtocol, process.execPath, [resolve(process.argv[1])])
          }
        } else {
          app.setAsDefaultProtocolClient(deepLinkProtocol)
        }
      }

      // Start PHP server and websockets
      const apiPort = await startAPI()
      console.log('API server started on port', apiPort.port);

      phpProcesses = await servePhpApp(apiPort.port)

      websocketProcess = serveWebsockets()

      await notifyLaravel('booted')

      // @ts-ignore
      if (nativePHPConfig?.updater?.enabled === true) {
        autoUpdater.checkForUpdatesAndNotify()
      }

      schedulerInterval = setInterval(() => {
        console.log("Running scheduler...")
        runScheduler(apiPort.port);
      }, 60 * 1000);

      app.on('activate', function (event, hasVisibleWindows) {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (!hasVisibleWindows) {
          notifyLaravel('booted')
        }
        event.preventDefault();
      })
    })
  }
}

export = new NativePHP()
