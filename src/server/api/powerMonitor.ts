import express from 'express'
import { powerMonitor } from 'electron'
const router = express.Router();

router.get('/get-system-idle-state', (req, res) => {
    res.json({
        result: powerMonitor.getSystemIdleState(req.body.threshold),
    })
});

router.post('/get-system-idle-time', (req, res) => {
    res.json({
        result: powerMonitor.getSystemIdleTime(),
    })
});

router.get('/get-current-thermal-state', (req, res) => {
    res.json({
        result: powerMonitor.getCurrentThermalState(),
    })
});

router.get('/is-on-battery-power', (req, res) => {
    res.json({
        result: powerMonitor.isOnBatteryPower(),
    })
});

export default router;
