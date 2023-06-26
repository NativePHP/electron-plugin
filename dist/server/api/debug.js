"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const state_1 = __importDefault(require("../state"));
const router = express_1.default.Router();
router.post('/log', (req, res) => {
    const { level, message, context } = req.body;
    Object.values(state_1.default.windows).forEach(window => {
        window.webContents.send('log', { level, message, context });
    });
    res.sendStatus(200);
});
exports.default = router;
