const jwt = require("jsonwebtoken");
const { JSONWEBTOKEN } = require("./config/encrypt.config");
const redisOps = require("./redisOps");
const { ERROR } = require("./response");

const getToken = cred => {
  return jwt.sign(cred, JSONWEBTOKEN.SECRETKEY, {
    expiresIn: JSONWEBTOKEN.MAX_AGE
  });
};

const verifyAuthorization = (req, res, next) => {
  let token = req.headers.authorization || req.query.token || req.body.token;
  if (!token) throw new Error(ERROR.UNAUTHORIZED);
  return jwt.verify(token, JSONWEBTOKEN.SECRETKEY, async (err, decoded) => {
    if (err) throw new Error(ERROR.UNAUTHORIZED);
    try {
      let userId = decoded._id;
      const userRedisToken = await redisOps.getJwtToken(userId);
      if (userRedisToken.status !== 200)
        throw new Error(ERROR.SERVICE_ERROR.SERVICE_NOT_AVAILABLE);
      if (userRedisToken.body.data !== token)
        throw new Error(ERROR.UNAUTHORIZED);
      let exp = decoded.exp;
      let now = Math.round(Date.now() / 1000);
      let willExp = exp - now;
      if (willExp >= 0 && willExp <= JSONWEBTOKEN.RENEW_BEFORE) {
        let newToken = getToken({ _id: userId });
        const renewResp = await redisOps.setJwtToken(id, newToken);
        console.log(renewResp.body);
      }
      req.user = decoded;
      return next();
    } catch (err) {
      if (err === ERROR.UNAUTHORIZED) {
        return res.status(403).json({
          message: err
        });
      } else {
        return res.status(500).json({
          message: ERROR.SERVER_ERROR
        });
      }
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
