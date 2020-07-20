const jwt = require("jsonwebtoken");
const { JSONWEBTOKEN } = require("../config/encrypt.config");
const { AUTH } = require("../config/redis-cluster.config");
const { ERROR, handleError } = require("./response");

const getToken = (cred) => {
  return jwt.sign(cred, JSONWEBTOKEN.SECRETKEY, {
    expiresIn: JSONWEBTOKEN.MAX_AGE,
  });
};

const decodeToken = (token) => {
  return new Promise((resolve, reject) => {
    return jwt.verify(token, JSONWEBTOKEN.SECRETKEY, (err, decoded) => {
      if (err) return reject(ERROR.UNAUTHORIZED);
      return resolve(decoded);
    });
  });
};

const verifyAuthorization = async (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (!token) throw new Error(ERROR.UNAUTHORIZED);
    const decoded = await decodeToken(token);
    req.user = decoded;
    return next();
  } catch (err) {
    if (err.message === ERROR.UNAUTHORIZED) {
      return res.status(401).json({
        message: err.message,
      });
    } else {
      return res.status(500).json({
        message: err.message ? err.message : ERROR.SERVER_ERROR,
      });
    }
  }
};

const verifyRedisAuth = async (req, res, next) => {
  try {
    let auth = req.body.auth || req.query.auth;
    if (AUTH && auth !== AUTH) throw new Error(ERROR.UNAUTHORIZED);
    return next();
  } catch (err) {
    return handleError(res, err);
  }
};

const verifyUser = (req, res, next) => {
  let tokenUser = req.user._id;
  let requestUser = req.query.user || req.body.user;
  if (tokenUser !== requestUser)
    return res.status(403).json({
      message: ERROR.FORBIDDEN,
    });
  return next();
};

module.exports = {
  getToken,
  decodeToken,
  verifyAuthorization,
  verifyUser,
  verifyRedisAuth,
};
