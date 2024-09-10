import express from 'express'
import state from "../state";
const router = express.Router();

router.post('/', (req, res) => {
    const {event, payload} = req.body;

    Object.values(state.windows).forEach(window => {
        window.webContents.send('native-event', { event, payload })
    })

    if (state.activeMenuBar?.window) {
        state.activeMenuBar.window.webContents.send('native-event', { event, payload })
    }

    res.sendStatus(200)
})

export default router;
