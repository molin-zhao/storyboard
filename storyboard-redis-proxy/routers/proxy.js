const express = require("express");
const cluster = require("../redis-cluster");
const { ERROR, handleError, handleSuccess } = require("../../response");
const { verifyRedisAuth } = require("../../authenticate");
const router = express.Router();

router.post("/set", verifyRedisAuth, async (req, res) => {
  try {
    let key = req.body.key;
    let value = req.body.value;
    let ex = req.body.expire;
    if (!key) throw new Error(ERROR.SERVICE_ERROR.PARAM_NOT_PROVIDED);
    let resp = null;
    if (ex) {
      resp = await cluster.set(key, value, "EX", ex);
    } else {
      resp = await cluster.set(key, value);
    }
    return handleSuccess(res, resp);
  } catch (err) {
    return handleError(res, err);
  }
});

router.post("/get", verifyRedisAuth, async (req, res) => {
  try {
    let key = req.body.key;
    if (!key) throw new Error(ERROR.SERVICE_ERROR.PARAM_NOT_PROVIDED);
    const resp = await cluster.get(key);
    return handleSuccess(res, resp);
  } catch (err) {
    return handleError(res, err);
  }
});

router.get("/set", verifyRedisAuth, async (req, res) => {
  try {
    let key = req.query.key;
    let value = req.query.value;
    let ex = req.query.expire;
    if (!key) throw new Error(ERROR.SERVICE_ERROR.PARAM_NOT_PROVIDED);
    let resp = null;
    if (ex) {
      resp = await cluster.set(key, value, "EX", ex);
    } else {
      resp = await cluster.set(key, value);
    }
    return handleSuccess(res, resp);
  } catch (err) {
    return handleError(res, err);
  }
});

router.get("/get", verifyRedisAuth, async (req, res) => {
  try {
    let key = req.query.key;
    if (!key) throw new Error(ERROR.SERVICE_ERROR.PARAM_NOT_PROVIDED);
    const resp = await cluster.get(key);
    return handleSuccess(res, resp);
  } catch (err) {
    return handleError(res, err);
  }
});

router.get("/del", verifyRedisAuth, async (req, res) => {
  try {
    let key = req.query.key;
    if (!key) throw new Error(ERROR.SERVICE_ERROR.PARAM_NOT_PROVIDED);
    const resp = await cluster.del(key);
    return handleSuccess(res, resp);
  } catch (err) {
    return handleError(res, err);
  }
});

router.post("/del", verifyRedisAuth, async (req, res) => {
  try {
    let key = req.body.key;
    if (!key) throw new Error(ERROR.SERVICE_ERROR.PARAM_NOT_PROVIDED);
    const resp = await cluster.del(key);
    return handleSuccess(res, resp);
  } catch (err) {
    return handleError(res, err);
  }
});

router.post("/hset", verifyRedisAuth, async (req, res) => {
  try {
    let key = req.body.key;
    let field = req.body.field;
    let value = req.body.value;
    if (!key || !field) throw new Error(ERROR.SERVICE_ERROR.PARAM_NOT_PROVIDED);
    const resp = await cluster.hset(key, field, value);
    return handleSuccess(res, resp);
  } catch (err) {
    return handleError(res, err);
  }
});

router.post("/hget", async (req, res) => {
  try {
    let key = req.body.key;
    let field = req.body.field;
    if (!key || !field) throw new Error(ERROR.SERVICE_ERROR.PARAM_NOT_PROVIDED);
    const resp = await cluster.hget(key, field);
    return handleSuccess(res, resp);
  } catch (err) {
    return handleError(res, err);
  }
});

router.get("/hset", verifyRedisAuth, async (req, res) => {
  try {
    let key = req.query.key;
    let field = req.query.field;
    let value = req.query.value;
    if (!key || !field) throw new Error(ERROR.SERVICE_ERROR.PARAM_NOT_PROVIDED);
    const resp = await cluster.hset(key, field, value);
    return handleSuccess(res, resp);
  } catch (err) {
    return handleError(res, err);
  }
});

router.get("/hget", async (req, res) => {
  try {
    let key = req.query.key;
    let field = req.query.field;
    if (!key || !field) throw new Error(ERROR.SERVICE_ERROR.PARAM_NOT_PROVIDED);
    const resp = await cluster.hget(key, field);
    return handleSuccess(res, resp);
  } catch (err) {
    return handleError(res, err);
  }
});

module.exports = router;
