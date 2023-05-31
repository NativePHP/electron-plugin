import { session } from "electron";
import serveWebsockets from "./websockets";
import startAPIServer from "./api";
import {
  startQueueWorker,
  startScheduler,
  serveApp,
  retrieveNativePHPConfig,
} from "./php";
import axios from "axios";

let phpPort: number | null = null;

const randomSecret: string =
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15);

export async function servePhpApp(apiPort: number) {
  const processes = [];
  const result = await serveApp(randomSecret, apiPort);
  processes.push(result.process);

  processes.push(startQueueWorker(randomSecret, apiPort));

  phpPort = result.port;
  await appendCookie();

  return processes;
}

export function runScheduler(apiPort: number) {
  startScheduler(randomSecret, apiPort);
}

export function startQueue(apiPort: number) {
  if (!process.env.NATIVE_PHP_SKIP_QUEUE) {
    return startQueueWorker(randomSecret, apiPort);
  }
}

export function startAPI(): Promise<number> {
  return startAPIServer(randomSecret);
}

export { serveWebsockets, retrieveNativePHPConfig };

export async function appendCookie() {
  const cookie = {
    url: `http://localhost:${phpPort}`,
    name: "_php_native",
    value: randomSecret,
  };
  await session.defaultSession.cookies.set(cookie);
}

export async function notifyLaravel(endpoint: string, payload = {}) {
  try {
    await axios.post(
      `http://127.0.0.1:${phpPort}/_native/api/${endpoint}`,
      payload,
      {
        headers: {
          "X-NativePHP-Secret": randomSecret,
        },
      }
    );
  } catch (e) {
    //
  }
}
