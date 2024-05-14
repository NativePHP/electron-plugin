import { existsSync } from "fs";
import { join } from "path";
import { spawn } from "child_process";
import { getAppPath } from "./php";
import state from "./state";

function serveWebsockets() {
  if (!existsSync(join(getAppPath(), 'vendor', 'laravel', 'reverb'))) {
    return;
  }

  const phpServer = spawn(state.php, ["artisan", "reverb:start"], {
    cwd: getAppPath()
  });

  phpServer.stdout.on("data", (data) => {
  });

  phpServer.stderr.on("data", (data) => {
  });
  return phpServer;
}

export default serveWebsockets;
