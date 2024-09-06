import * as express from 'express';
const router = express.Router();
import { clipboard, nativeImage } from 'electron'
import { notifyLaravel } from "../utils";

const DEFAULT_TYPE = 'clipboard'

router.get('/text', (req, res) => {
    const {type} = req.query

    res.json({
        // @ts-ignore
        text: clipboard.readText(type || DEFAULT_TYPE)
    })

    forwardToLaravel(ClipboardEvents.Read, ClipboardContentTypes.Text)
});

router.post('/text', (req, res) => {
    const {text} = req.body
    const {type} = req.query

    // @ts-ignore
    clipboard.writeText(text, type || DEFAULT_TYPE)

    res.json({
        text,
    })

    forwardToLaravel(ClipboardEvents.Write, ClipboardContentTypes.Text)
});

router.get('/html', (req, res) => {
    const {type} = req.query

    res.json({
        // @ts-ignore
        html: clipboard.readHTML(type || DEFAULT_TYPE)
    })

    forwardToLaravel(ClipboardEvents.Read, ClipboardContentTypes.Html)
});

router.post('/html', (req, res) => {
    const {html} = req.body
    const {type} = req.query
    // @ts-ignore
    clipboard.writeHTML(html, type || DEFAULT_TYPE)

    res.json({
      html,
    })

    forwardToLaravel(ClipboardEvents.Write, ClipboardContentTypes.Html)
});

router.get('/image', (req, res) => {
    const {type} = req.query
    // @ts-ignore
    const image = clipboard.readImage(type || DEFAULT_TYPE);

    res.json({
        image: image.isEmpty() ? null : image.toDataURL()
    })

    forwardToLaravel(ClipboardEvents.Read, ClipboardContentTypes.Image)
});

router.post('/image', (req, res) => {
    const {image} = req.body
    const {type} = req.query

    try {
      const _nativeImage = nativeImage.createFromDataURL(image)
      // @ts-ignore
      clipboard.writeImage(_nativeImage, type || DEFAULT_TYPE)
    } catch (e) {
      res.status(400).json({
        error: e.message,
      })
      return
    }

    res.sendStatus(200);

    forwardToLaravel(ClipboardEvents.Write, ClipboardContentTypes.Image)
});

router.delete('/', (req, res) => {
    const {type} = req.query

    // @ts-ignore
    clipboard.clear(type || DEFAULT_TYPE)

    res.sendStatus(200);
});

function forwardToLaravel(eventType: ClipboardEvents, contentType: ClipboardContentTypes) {
  notifyLaravel("events", {
    event: `\\Native\\Laravel\\Events\\Clipboard\\${eventType}`,
    payload: {
      contentType
    }
  });
}

export default router;
