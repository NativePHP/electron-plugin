import { BrowserWindow } from "electron";

interface State {
  activeMenuBar: any;
  php: string | null;
  phpPort: number | null;
  caCert: string | null;
  icon: string | null
  windows: Record<string, BrowserWindow>
  randomSecret: string,
  findWindow: (id: string) => BrowserWindow | null
}

function generateRandomString(length: number) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;

  for (let i = 0; i < length; i += 1) {
    result += characters.charAt(Math.floor(Math.random() *
      charactersLength));
  }

  return result;
}

export default {
    activeMenuBar: null,
    php: null,
    phpPort: null,
    caCert: null,
    icon: null,
    randomSecret: generateRandomString(32),
    windows: {},
    findWindow(id: string) {
      return this.windows[id] || null
    }
} as State;
