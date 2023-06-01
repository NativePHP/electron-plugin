import { spawn } from 'child_process'
import { getAppPath } from './php'
import state from './state'

function serveWebsockets() {
  const phpServer = spawn(state.php, ['artisan', 'websockets:serve'], {
    cwd: getAppPath(),
  })

  phpServer.stdout.on('data', (data) => {
  })

  phpServer.stderr.on('data', (data) => {
  })
  return phpServer;
}

export default serveWebsockets;
