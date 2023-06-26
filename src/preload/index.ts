import { contextBridge, ipcRenderer } from 'electron'
import * as remote from '@electron/remote'

// @ts-ignore
window.remote = remote;

ipcRenderer.on('log', (event, {level, message, context}) => {
    if (level === 'error') {
      console.error(`[${level}] ${message}`, context)
    } else if (level === 'warn') {
      console.warn(`[${level}] ${message}`, context)
    } else {
      console.log(`[${level}] ${message}`, context)
    }
});
