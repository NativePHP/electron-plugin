import express from 'express'
import {app, Menu} from 'electron'
import {mapMenu} from "./helper";
import state from "../state";
const router = express.Router();

router.post('/log', (req, res) => {
    const {level, message, context} = req.body

    Object.values(state.windows).forEach(window => {
        window.webContents.send('log', {level, message, context})
    })

    if (state.activeMenuBar?.window) {
        state.activeMenuBar.window.webContents.send('log', {level, message, context})
    }

    res.sendStatus(200)
})

export default router;
