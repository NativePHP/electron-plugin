import express from 'express'
import {BrowserWindow, systemPreferences} from 'electron'
import {writeFile} from 'fs'
const router = express.Router();

router.get('/can-prompt-touch-id', (req, res) => {
    res.json({
        result: systemPreferences.canPromptTouchID(),
    })
});

router.post('/prompt-touch-id', async (req, res) => {
    try {
        await systemPreferences.promptTouchID(req.body.reason)

        res.sendStatus(200);
    } catch (e) {
        res.status(400).json({
            error: e.message,
        })
    }
});
router.get('/printers', async (req, res) => {
  const printers = await BrowserWindow.getAllWindows()[0].webContents.getPrintersAsync();

  res.json({
    printers,
  });
});

router.post('/print', async (req, res) => {
  const {printer, html} = req.body;

  let printWindow = new BrowserWindow({
    show: false,
  });

  printWindow.webContents.on('did-finish-load', () => {
    printWindow.webContents.print({
      silent: true,
      deviceName: printer,
    }, (success, errorType) => {
      res.sendStatus(200);
    });
    printWindow = null;
  });

  await printWindow.loadURL(`data:text/html;charset=UTF-8,${html}`);
});

router.post('/print-to-pdf', async (req, res) => {
  const {path, html} = req.body;

  let printWindow = new BrowserWindow({
    show: false,
  });

  printWindow.webContents.on('did-finish-load', () => {
    printWindow.webContents.printToPDF({}).then(data => {
      writeFile(path, data, (e) => {
        if (e) throw error;
      });
      
      printWindow.close();
      res.sendStatus(200);
    }).catch(e => {
      printWindow.close();
      
      res.status(400).json({
        error: e.message,
      });
    });
  });

  await printWindow.loadURL(`data:text/html;charset=UTF-8,${html}`);
});

export default router;
