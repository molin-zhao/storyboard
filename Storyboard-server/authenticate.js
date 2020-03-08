const jwt = require("jsonwebtoken");
const agent = require("superagent");
const { JSONWEBTOKEN } = require("./config/encrypt.config");
const { REDIS_GET } = require("./config/proxy.config");
const { REDIS_KEY, AUTH } = require("./config/redis-cluster.config");
const { ERROR } = require("./response");

const getToken = cred => {
  return jwt.sign(cred, JSONWEBTOKEN.SECRETKEY, {
    expiresIn: JSONWEBTOKEN.MAX_AGE
  });
};

const verifyAuthorization = (req, res, next) => {
  let token = req.query.token || req.body.token || req.headers.authorization;
  if (!token) throw new Error(ERROR.UNAUTHORIZED);
  return jwt.verify(token, JSONWEBTOKEN.SECRETKEY, async (err, decoded) => {
    if (err) throw new Error(err);
    try {
      let userId = decoded._id;
      const resToken = (resPwd = await agent
        .post(REDIS_GET)
        .set("accept", "json")
        .send({
          auth: AUTH,
          key: `${userId}:${REDIS_KEY.JWT_TOKEN}`
        }));
      if (resToken.status !== 200) throw new Error(ERROR.SERVER_ERROR);
      if (token !== resToken.body.data) throw new Error(ERROR.UNAUTHORIZED);
      req.user = decoded;
      return next();
    } catch (err) {
      res.status(500).json({
        message: ERROR.SERVER_ERROR
      });
    }
  });
};

const decodeToken = token => {
  return new Promise((resolve, reject) => {
    return jwt.verify(token, JSONWEBTOKEN.SECRETKEY, (err, decoded) => {
      if (err)
        return reject({
          type: ERROR.UNAUTHORIZED,
          messsage: err.message ? err.message : err
        });
      return resolve(decoded);
    });
  });
};

module.exports = {
  getToken,
  decodeToken,
  verifyAuthorization
};
