const { REDIS_DEL, REDIS_SET, REDIS_GET } = require("./config/proxy.config");
const { REDIS_KEY, AUTH, REDIS_EX } = require("./config/redis-cluster.config");
const { ERROR } = require("./response");
const agent = require("superagent");
const UNAVAILABLE = ERROR.SERVICE_ERROR.SERVICE_NOT_AVAILABLE;

const setJwtToken = (id, token) => {
  return new Promise(async (resolve, reject) => {
    try {
      const resp = await agent
        .post(REDIS_SET)
        .set("accept", "json")
        .send({
          auth: AUTH,
          key: `${id}:${REDIS_KEY.JWT_TOKEN}`,
          value: token,
          expire: REDIS_EX.JWT_TOKEN_EX,
        });
      if (resp.status !== 200) return reject(UNAVAILABLE);
      return resolve(resp.body.data);
    } catch (err) {
      return reject(err);
    }
  });
};

const getJwtToken = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const resp = await agent
        .post(REDIS_GET)
        .set("accept", "json")
        .send({
          auth: AUTH,
          key: `${id}:${REDIS_KEY.JWT_TOKEN}`,
        });
      if (resp.status !== 200) return reject(UNAVAILABLE);
      return resolve(resp.body.data);
    } catch (err) {
      return reject(err);
    }
  });
};

const delJwtToken = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const resp = await agent
        .post(REDIS_DEL)
        .set("accept", "json")
        .send({
          auth: AUTH,
          key: `${id}:${REDIS_KEY.JWT_TOKEN}`,
        });
      if (resp.status !== 200) return reject(UNAVAILABLE);
      return resolve(resp.body.data);
    } catch (err) {
      return reject(err);
    }
  });
};

const setSmsPassword = (id, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      const resp = await agent
        .post(REDIS_SET)
        .set("accept", "json")
        .send({
          auth: AUTH,
          key: `${id}:${REDIS_KEY.CRYPTO}`,
          value: password,
          expire: REDIS_EX.SMS_PASSWORD,
        });
      if (resp.status !== 200) return reject(UNAVAILABLE);
      return resolve(resp.body.data);
    } catch (err) {
      return reject(err);
    }
  });
};

const getSmsPassword = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const resp = await agent
        .post(REDIS_GET)
        .set("accept", "json")
        .send({
          auth: AUTH,
          key: `${id}:${REDIS_KEY.CRYPTO}`,
        });
      if (resp.status !== 200) return reject(UNAVAILABLE);
      return resolve(resp.body.data);
    } catch (err) {
      return reject(err);
    }
  });
};

const setSmsCode = (id, code) => {
  return new Promise(async (resolve, reject) => {
    try {
      const resp = await agent
        .post(REDIS_SET)
        .set("accept", "json")
        .send({
          auth: AUTH,
          key: `${id}:${REDIS_KEY.SMS_CODE}`,
          value: code,
          expire: REDIS_EX.SMS_CODE,
        });
      if (resp.status !== 200) return reject(UNAVAILABLE);
      return resolve(resp.body.data);
    } catch (err) {
      return reject(err);
    }
  });
};

const getSmsCode = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const resp = await agent
        .post(REDIS_GET)
        .set("accept", "json")
        .send({
          auth: AUTH,
          key: `${id}:${REDIS_KEY.SMS_CODE}`,
        });
      if (resp.status !== 200) return reject(UNAVAILABLE);
      return resolve(resp.body.data);
    } catch (err) {
      return reject(err);
    }
  });
};

const setSocketServer = (id, serverName) => {
  return new Promise(async (resolve, reject) => {
    try {
      const resp = await agent
        .post(REDIS_SET)
        .set("accept", "json")
        .send({
          auth: AUTH,
          key: `${id}:${REDIS_KEY.SOCKET_SERVER}`,
          value: serverName,
        });
      if (resp.status !== 200) return reject(UNAVAILABLE);
      return resolve(resp.body.data);
    } catch (err) {
      return reject(err);
    }
  });
};

const getSocketServer = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const resp = await agent
        .post(REDIS_GET)
        .set("accept", "json")
        .send({
          auth: AUTH,
          key: `${id}:${REDIS_KEY.SOCKET_SERVER}`,
        });
      if (resp.status !== 200) return reject(UNAVAILABLE);
      return resolve(resp.body.data);
    } catch (err) {
      return reject(err);
    }
  });
};

const delSocketServer = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const resp = await agent
        .post(REDIS_DEL)
        .set("accept", "json")
        .send({
          auth: AUTH,
          key: `${id}:${REDIS_KEY.SOCKET_SERVER}`,
        });
      if (resp.status !== 200) return reject(UNAVAILABLE);
      return resolve(resp.body.data);
    } catch (err) {
      return reject(err);
    }
  });
};

module.exports = {
  setJwtToken,
  getJwtToken,
  delJwtToken,
  setSmsPassword,
  getSmsPassword,
  setSmsCode,
  getSmsCode,
  setSocketServer,
  getSocketServer,
  delSocketServer,
};
