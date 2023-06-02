"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function generateRandomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i += 1) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}
exports.default = {
    activeMenuBar: null,
    php: null,
    phpPort: null,
    caCert: null,
    icon: null,
    randomSecret: generateRandomString(32),
    windows: {},
    findWindow(id) {
        return this.windows[id] || null;
    }
};
