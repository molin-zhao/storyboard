const Redis = require("ioredis");
const {
  NODES,
  AUTH,
  REDIS_EX,
  REDIS_KEY,
} = require("../config/redis-cluster.config");
const { ERROR } = require("./response");
const { SERVICE_NOT_AVAILABLE } = ERROR.SERVICE_ERROR;
const cluster = new Redis.Cluster(NODES, {
  redisOptions: { password: AUTH },
  scaleReads: "slave",
});

const setJwtToken = (id, token) => {
  return new Promise(async (resolve, reject) => {
    try {
      const key = `${id}:${REDIS_KEY.JWT_TOKEN}`;
      const value = token;
      const exp = REDIS_EX.JWT_TOKEN_EX;
      const resp = await cluster.set(key, value, "EX", exp);
      return resolve(resp);
    } catch (err) {
      return reject(err);
    }
  });
};

const getJwtToken = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const key = `${id}:${REDIS_KEY.JWT_TOKEN}`;
      const resp = await cluster.get(key);
      return resolve(resp);
    } catch (err) {
      return reject(err);
    }
  });
};

const delJwtToken = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const key = `${id}:${REDIS_KEY.JWT_TOKEN}`;
      const resp = await cluster.del(key);
      return resolve(resp);
    } catch (err) {
      return reject(err);
    }
  });
};

const setSmsPassword = (id, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      const key = `${id}:${REDIS_KEY.CRYPTO}`;
      const value = password;
      const exp = REDIS_EX.SMS_PASSWORD;
      const resp = cluster.set(key, value, "EX", exp);
      return resolve(resp);
    } catch (err) {
      return reject(err);
    }
  });
};

const getSmsPassword = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const key = `${id}:${REDIS_KEY.CRYPTO}`;
      const resp = await cluster.get(key);
      return resolve(resp);
    } catch (err) {
      return reject(err);
    }
  });
};

const setSmsCode = (id, code) => {
  return new Promise(async (resolve, reject) => {
    try {
      const key = `${id}:${REDIS_KEY.SMS_CODE}`;
      const value = code;
      const exp = REDIS_EX.SMS_CODE;
      const resp = cluster.set(key, value, "EX", exp);
      return resolve(resp);
    } catch (err) {
      return reject(err);
    }
  });
};

const getSmsCode = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const key = `${id}:${REDIS_KEY.SMS_CODE}`;
      const resp = await cluster.get(key);
      return resolve(resp);
    } catch (err) {
      return reject(err);
    }
  });
};

const setSocketServer = (id, serverName) => {
  return new Promise(async (resolve, reject) => {
    try {
      const key = `${id}:${REDIS_KEY.SOCKET_SERVER}`;
      const value = serverName;
      const resp = await cluster.set(key, value);
      return resolve(resp);
    } catch (err) {
      return reject(err);
    }
  });
};

const getSocketServer = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const key = `${id}:${REDIS_KEY.SOCKET_SERVER}`;
      const resp = await cluster.get(key);
      return resolve(resp);
    } catch (err) {
      return reject(err);
    }
  });
};

const delSocketServer = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const key = `${id}:${REDIS_KEY.SOCKET_SERVER}`;
      const resp = await cluster.del(key);
      return resolve(resp);
    } catch (err) {
      return reject(err);
    }
  });
};

const setLoginAttempt = (id, attemptInfo) => {
  return new Promise(async (resolve, reject) => {
    try {
      const key = `${id}:${REDIS_KEY.LOGIN_ATTEMPT}`;
      const value = JSON.stringify(attemptInfo);
      const exp = REDIS_EX.LOGIN_ATTEMPT;
      const resp = await cluster.set(key, value, "EX", exp);
      return resolve(resp);
    } catch (err) {
      return reject(err);
    }
  });
};

const getLoginAttempt = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const key = `${id}:${REDIS_KEY.LOGIN_ATTEMPT}`;
      const resp = await cluster.get(key);
      return resolve(resp);
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
  setLoginAttempt,
  getLoginAttempt,
};
