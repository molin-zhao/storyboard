const express = require("express");
const cluster = require("../redis-cluster");
const { ERROR, SUCCESS } = require("../../response");
const { REDIS_CLUSTER } = require("../../config");
const router = express.Router();

router.post("/set", async (req, res) => {
  let auth = req.body.auth;
  let key = req.body.key;
  let value = req.body.value;
  let ex = req.body.expire;
  if (REDIS_CLUSTER.AUTH && auth !== REDIS_CLUSTER.AUTH) {
    return res.status(401).json({
      message: ERROR.UNAUTHORIZED
    });
  }
  try {
    let result = ex
      ? await cluster.set(key, value, "EX", ex)
      : await cluster.set(key, value);
    return res.status(200).json({
      message: SUCCESS.OK,
      data: result
    });
  } catch (err) {
    return res.status(500).json({
      message: ERROR.SERVER_ERROR
    });
  }
});

router.post("/get", (req, res) => {
  let auth = req.body.auth;
  let key = req.body.key;
  if (REDIS_CLUSTER.AUTH && auth !== REDIS_CLUSTER.AUTH) {
    return res.status(401).json({
      message: ERROR.UNAUTHORIZED
    });
  }
  cluster.get(key, (err, result) => {
    if (err) {
      console.log(err.message);
      return res.status(500).json({
        message: ERROR.SERVER_ERROR
      });
    }
    return res.status(200).json({
      message: SUCCESS.OK,
      data: result
    });
  });
});

router.get("/set", async (req, res) => {
  let auth = req.params.auth;
  let key = req.params.key;
  let value = req.params.value;
  let ex = req.params.expire;
  if (REDIS_CLUSTER.AUTH && auth !== REDIS_CLUSTER.AUTH) {
    return res.status(401).json({
      message: ERROR.UNAUTHORIZED
    });
  }
  try {
    let result = ex
      ? await cluster.set(key, value, "EX", ex)
      : await cluster.set(key, value);
    return res.status(200).json({
      message: SUCCESS.OK,
      data: result
    });
  } catch (err) {
    return res.status(500).json({
      message: ERROR.SERVER_ERROR
    });
  }
});

router.get("/get", (req, res) => {
  let auth = req.params.auth;
  let key = req.params.key;
  if (REDIS_CLUSTER.AUTH && auth !== REDIS_CLUSTER.AUTH) {
    return res.status(401).json({
      message: ERROR.UNAUTHORIZED
    });
  }
  cluster.get(key, (err, result) => {
    if (err) {
      console.log(err.message);
      return res.status(500).json({
        message: ERROR.SERVER_ERROR
      });
    }
    return res.status(200).json({
      message: SUCCESS.OK,
      data: result
    });
  });
});

module.exports = router;
