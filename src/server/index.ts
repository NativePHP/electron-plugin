import { session } from "electron";
import serveWebsockets from "./websockets";
import startAPIServer, { APIProcess } from "./api";
import {
  startQueueWorker,
  startScheduler,
  serveApp,
  retrieveNativePHPConfig,
} from "./php";
import { appendCookie } from "./utils";
import state from "./state";

export async function servePhpApp(apiPort: number) {
  const processes = [];
  const result = await serveApp(state.randomSecret, apiPort);
  processes.push(result.process);

  processes.push(startQueueWorker(state.randomSecret, apiPort));

  state.phpPort = result.port;
  await appendCookie();

  return processes;
}

export function runScheduler(apiPort: number) {
  startScheduler(state.randomSecret, apiPort);
}

export function startQueue(apiPort: number) {
  if (!process.env.NATIVE_PHP_SKIP_QUEUE) {
    return startQueueWorker(state.randomSecret, apiPort);
  }
}

export function startAPI(): Promise<APIProcess> {
  return startAPIServer(state.randomSecret);
}

export { serveWebsockets, retrieveNativePHPConfig };
