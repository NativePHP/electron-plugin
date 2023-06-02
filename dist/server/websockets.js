"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const php_1 = require("./php");
const state_1 = __importDefault(require("./state"));
function serveWebsockets() {
    const phpServer = (0, child_process_1.spawn)(state_1.default.php, ['artisan', 'websockets:serve'], {
        cwd: (0, php_1.getAppPath)(),
    });
    phpServer.stdout.on('data', (data) => {
    });
    phpServer.stderr.on('data', (data) => {
    });
    return phpServer;
}
exports.default = serveWebsockets;
