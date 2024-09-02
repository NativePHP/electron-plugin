"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const state_1 = __importDefault(require("../state"));
const router = express_1.default.Router();
router.post('/log', (req, res) => {
    var _a;
    const { level, message, context } = req.body;
    Object.values(state_1.default.windows).forEach(window => {
        window.webContents.send('log', { level, message, context });
    });
    if ((_a = state_1.default.activeMenuBar) === null || _a === void 0 ? void 0 : _a.window) {
        state_1.default.activeMenuBar.window.webContents.send('log', { level, message, context });
    }
    res.sendStatus(200);
});
exports.default = router;
