import { session } from "electron";
import serveWebsockets from "./websockets";
import startAPIServer, { APIProcess } from "./api";
import {
  startQueueWorker,
  startScheduler,
  serveApp,
  retrieveNativePHPConfig,
  retrievePhpIniSettings,
} from "./php";
import { appendCookie } from "./utils";
import state from "./state";

export async function servePhpApp(apiPort: number, phpIniSettings: object) {
  const processes = [];
  const result = await serveApp(state.randomSecret, apiPort, phpIniSettings);
  processes.push(result.process);

  processes.push(startQueueWorker(state.randomSecret, apiPort, phpIniSettings));

  state.phpPort = result.port;
  await appendCookie();

  return processes;
}

export function runScheduler(apiPort: number, phpIniSettings: object) {
  startScheduler(state.randomSecret, apiPort, phpIniSettings);
}

export function startQueue(apiPort: number, phpIniSettings: object) {
  if (!process.env.NATIVE_PHP_SKIP_QUEUE) {
    return startQueueWorker(state.randomSecret, apiPort, phpIniSettings);
  }
}

export function startAPI(): Promise<APIProcess> {
  return startAPIServer(state.randomSecret);
}

export { serveWebsockets, retrieveNativePHPConfig, retrievePhpIniSettings };
