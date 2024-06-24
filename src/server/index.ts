import serveWebsockets from "./websockets";
import startAPIServer, { APIProcess } from "./api";
import {
  retrieveNativePHPConfig,
  retrievePhpIniSettings,
  serveApp,
  startQueueWorker,
  startScheduler,
} from "./php";
import { appendCookie } from "./utils";
import state from "./state";

export async function servePhpApp(phpIniSettings: object) {
  const processes = [];
  const result = await serveApp(
    state.randomSecret,
    state.electronApiPort,
    phpIniSettings
  );
  processes.push(result.process);

  processes.push(
    startQueueWorker(state.randomSecret, state.electronApiPort, phpIniSettings)
  );

  state.phpPort = result.port;
  await appendCookie();

  return processes;
}

export function runScheduler(phpIniSettings: object) {
  startScheduler(state.randomSecret, state.electronApiPort, phpIniSettings);
}

export function startQueue(phpIniSettings: object) {
  if (!process.env.NATIVE_PHP_SKIP_QUEUE) {
    return startQueueWorker(
      state.randomSecret,
      state.electronApiPort,
      phpIniSettings
    );
  }
}

export function startAPI(): Promise<APIProcess> {
  return startAPIServer(state.randomSecret);
}

export { serveWebsockets, retrieveNativePHPConfig, retrievePhpIniSettings };
