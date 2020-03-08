const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const agent = require("superagent");
const { BCRYPT } = require("../config/encrypt.config");
const { REDIS_KEY, AUTH } = require("../config/redis-cluster.config");
const { REDIS_SET } = require("../config/proxy.config");
const { getToken } = require("../authenticate");
const { ERROR } = require("../response");

const UserSchema = new Schema(
  {
    strategy: {
      type: String,
      enum: ["local", "oauth"],
      required: true
    },
    username: {
      type: String
    },
    password: {
      type: String,
      select: false
    },
    avatar: {
      type: String
    },
    email: {
      type: String,
      unique: true
    },
    phone: {
      type: String,
      unique: true
    },
    gender: {
      type: String,
      enum: ["M", "F"],
      default: "M"
    }
  },
  { timestamps: true }
);

UserSchema.pre("save", function(next) {
  if (this.strategy !== "local") return next();
  if (!this.isModified("password")) return next();
  bcrypt.genSalt(BCRYPT.SALT_FACTOR, (err, salt) => {
    if (err) return next(err);
    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) return next(err);
      this.password = hash;
      return next();
    });
  });
});

UserSchema.statics.loginUser = function(account, password) {
  return new Promise((resolve, reject) => {
    let criteria =
      account.indexOf("@") === -1 ? { phone: account } : { email: account };
    return this.findOne(criteria)
      .select("password")
      .exec((err, user) => {
        if (err) return reject(err);
        if (!user) return reject(ERROR.USER_NAME_NOT_FOUND);
        bcrypt.compare(password, user.password, async (err, isMatch) => {
          if (err) return reject(err);
          if (!isMatch)
            return resolve({ error: ERROR.USER_PASSWORD_INCORRECT });
          // password matched, login user
          try {
            let userCreds = { _id: user._id };
            let token = getToken(userCreds);
            const tokenRes = await agent
              .post(REDIS_SET)
              .set("accept", "json")
              .send({
                auth: AUTH,
                key: `${user._id}:${REDIS_KEY.JWT_TOKEN}`,
                value: token
              });
            if (tokenRes.status !== 200) return reject(ERROR.SERVER_ERROR);
            return resolve({ id: user._id, token });
          } catch (err) {
            return reject(err);
          }
        });
      });
  });
};

UserSchema.statics.getUserToken = async function(user) {
  return new Promise(async (resolve, reject) => {
    try {
      let userCreds = { _id: user._id };
      let token = getToken(userCreds);
      const tokenRes = await agent
        .post(REDIS_SET)
        .set("accept", "json")
        .send({
          auth: AUTH,
          key: `${user._id}:${REDIS_KEY.JWT_TOKEN}`,
          value: token
        });
      if (tokenRes.status !== 200) return reject(ERROR.SERVER_ERROR);
      return resolve(token);
    } catch (err) {
      return reject(err);
    }
  });
};

UserSchema.statics.findAccount = function(account) {
  let criteria =
    account.indexOf("@") === -1 ? { phone: account } : { email: account };
  return this.findOne(criteria);
};

module.exports = mongoose.model("User", UserSchema);
