const express = require("express");
const cluster = require("../redis-cluster");
const { ERROR, SUCCESS } = require("../../response");
const { REDIS_CLUSTER } = require("../../config");
const router = express.Router();

router.post("/set", (req, res) => {
  let auth = req.body.auth;
  let key = req.body.key;
  let value = req.body.value;
  if (REDIS_CLUSTER.AUTH && auth !== REDIS_CLUSTER.AUTH) {
    return res.status(401).json({
      message: ERROR.UNAUTHORIZED
    });
  }
  cluster
    .set(key, value)
    .then(result => {
      console.log(result);
      return res.status(200).json({
        message: SUCCESS.OK
      });
    })
    .catch(err => {
      console.log(err);
      return res.status(500).json({
        message: ERROR.SERVER_ERROR
      });
    });
});

router.post("/get", (req, res) => {
  let auth = req.body.auth;
  let key = req.body.key;
  let value = req.body.value;
  if (REDIS_CLUSTER.AUTH && auth !== REDIS_CLUSTER.AUTH) {
    return res.status(401).json({
      message: ERROR.UNAUTHORIZED,
      body: req.body
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

router.get("/set", (req, res) => {
  let auth = req.params.auth;
  let key = req.params.key;
  let value = req.params.value;
  if (REDIS_CLUSTER.AUTH && auth !== REDIS_CLUSTER.AUTH) {
    return res.status(401).json({
      message: ERROR.UNAUTHORIZED
    });
  }
  cluster
    .set(key, value)
    .then(result => {
      console.log(result);
      return res.status(200).json({
        message: SUCCESS.OK
      });
    })
    .catch(err => {
      console.log(err);
      return res.status(500).json({
        message: ERROR.SERVER_ERROR
      });
    });
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
