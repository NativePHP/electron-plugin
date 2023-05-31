import { BrowserWindow } from "electron";

interface State {
  activeMenuBar: any;
  php: string | null;
  icon: string | null
  windows: Record<string, BrowserWindow>
}

export default {
    activeMenuBar: null,
    php: null,
    icon: null,
    windows: {}
} as State;
