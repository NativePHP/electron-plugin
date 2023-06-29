import express from 'express'
import {app, Menu} from 'electron'
import {mapMenu} from "./helper";
import state from "../state";
const router = express.Router();

router.get('/:key', (req, res) => {
  const key = req.params.key;
  const defaultValue = req.query.default;

  state.store.get(key, defaultValue);

  res.sendStatus(200)
});

router.post('/:key', (req, res) => {
  const key = req.params.key;
  const value = req.body.value;

  state.store.set(key, value);

  res.sendStatus(200)
});

router.delete('/:key', (req, res) => {
  const key = req.params.key;

  state.store.delete(key);

  res.sendStatus(200)
});
export default router;
