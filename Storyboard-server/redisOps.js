const { REDIS_DEL, REDIS_SET, REDIS_GET } = require("./config/proxy.config");
const { REDIS_KEY, AUTH, REDIS_EX } = require("./config/redis-cluster.config");
const agent = require("superagent");

const setJwtToken = (id, token) => {
  return agent
    .post(REDIS_SET)
    .set("accept", "json")
    .send({
      auth: AUTH,
      key: `${id}:${REDIS_KEY.JWT_TOKEN}`,
      value: token,
      expire: REDIS_EX.JWT_TOKEN_EX
    });
};

const getJwtToken = id => {
  return agent
    .post(REDIS_GET)
    .set("accept", "json")
    .send({
      auth: AUTH,
      key: `${id}:${REDIS_KEY.JWT_TOKEN}`
    });
};

const delJwtToken = id => {
  return agent
    .post(REDIS_DEL)
    .set("accept", "json")
    .send({
      auth: AUTH,
      key: `${id}:${REDIS_KEY.JWT_TOKEN}`
    });
};

const setSmsPassword = (id, password) => {
  return agent
    .post(REDIS_SET)
    .set("accept", "json")
    .send({
      auth: AUTH,
      key: `${id}:${REDIS_KEY.CRYPTO}`,
      value: password,
      expire: REDIS_EX.SMS_PASSWORD
    });
};

const getSmsPassword = id => {
  return agent
    .post(REDIS_GET)
    .set("accept", "json")
    .send({
      auth: AUTH,
      key: `${id}:${REDIS_KEY.CRYPTO}`
    });
};

const setSmsCode = (id, code) => {
  return agent
    .post(REDIS_SET)
    .set("accept", "json")
    .send({
      auth: AUTH,
      key: `${id}:${REDIS_KEY.SMS_CODE}`,
      value: code,
      expire: REDIS_EX.SMS_CODE
    });
};

const getSmsCode = id => {
  return agent
    .post(REDIS_GET)
    .set("accept", "json")
    .send({
      auth: AUTH,
      key: `${id}:${REDIS_KEY.SMS_CODE}`
    });
};

const setSocketServer = (id, serverName) => {
  return agent
    .post(REDIS_SET)
    .set("accept", "json")
    .send({
      auth: AUTH,
      key: `${id}:${REDIS_KEY.SOCKET_SERVER}`,
      value: serverName
    });
};

const getSocketServer = id => {
  return agent
    .post(REDIS_GET)
    .set("accept", "json")
    .send({
      auth: AUTH,
      key: `${id}:${REDIS_KEY.SOCKET_SERVER}`
    });
};

const delSocketServer = id => {
  return agent
    .post(REDIS_DEL)
    .set("accept", "json")
    .send({
      auth: AUTH,
      key: `${id}:${REDIS_KEY.SOCKET_SERVER}`
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
  delSocketServer
};
