const bcrypt = require("bcrypt");
const passport = require("passport");
const { BCRYPT } = require("../config/encrypt.config");
const { EXCHANGE } = require("../config/rabbitmq-cluster.config");
const { getToken } = require("../common/authenticate");
const redisOps = require("../common/redis");
const { ERROR } = require("../common/response");
const { objectId } = require("../common/utils");
const { makeChannel } = require("../common/rabbitmq");
const mongoose = require("../common/mongodb");
const Schema = mongoose.Schema;

// make a unicast channel and publish message
const channel = makeChannel();
channel.addSetup((channel) =>
  Promise.all([
    channel.assertExchange(EXCHANGE.UNICAST.NAME, EXCHANGE.UNICAST.TYPE, {
      durable: true,
    }),
  ])
);

const UserSchema = new Schema(
  {
    strategy: {
      type: String,
      enum: ["local", "oauth"],
      select: false,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      select: false,
    },
    avatar: {
      type: String,
      default: "/static/image/m1.png",
    },
    email: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      enum: ["m", "f"],
      default: "m",
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", function (next) {
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

UserSchema.statics.loginUser = function (account, password, ip, geo) {
  return new Promise((resolve, reject) => {
    let criteria =
      account.indexOf("@") === -1 ? { phone: account } : { email: account };
    return this.findOne(criteria)
      .select("password avatar username gender email phone")
      .exec(async (err, user) => {
        if (err) return reject(err);
        if (!user) return reject(ERROR.USER_NAME_NOT_FOUND);
        const userId = user._id;
        const userToken = await redisOps.getJwtToken(userId);
        if (userToken) {
          /**
           * user already loggin
           * check if user is connected to the socket server
           * if user is connected, send user a message
           * else generate a login message
           */
          const serverName = await redisOps.getSocketServer(userId);
          const message = { type: "login-attempt", ip, geo, to: userId };
          if (serverName) {
            // notify online user
            await channel.publish(EXCHANGE.UNICAST.NAME, serverName, message);
          } else {
            // set login attempt to redis
            await redisOps.setLoginAttempt(userId, message);
          }
          return resolve(null);
        }
        if (password) {
          bcrypt.compare(password, user.password, async (err, isMatch) => {
            if (err) return reject(err);
            if (!isMatch) return reject(ERROR.USER_PASSWORD_INCORRECT);
            // password matched, login user
            try {
              let userCreds = { _id: user._id };
              let token = getToken(userCreds);
              await redisOps.setJwtToken(user._id, token);
              const { _id, avatar, gender, phone, email, username } = user;
              return resolve({
                id: _id,
                token,
                avatar,
                gender,
                phone,
                email,
                username,
              });
            } catch (err) {
              return reject(err);
            }
          });
        } else {
          try {
            let userCreds = { _id: user._id };
            let token = getToken(userCreds);
            await redisOps.setJwtToken(user._id, token);
            const { _id, avatar, gender, phone, email, username } = user;
            return resolve({
              id: _id,
              token,
              avatar,
              gender,
              phone,
              email,
              username,
            });
          } catch (err) {
            return reject(err);
          }
        }
      });
  });
};

UserSchema.statics.getUserToken = async function (user) {
  return new Promise(async (resolve, reject) => {
    try {
      let userCreds = { _id: user._id };
      let token = getToken(userCreds);
      const tokenRes = await redisOps.setJwtToken(user._id, token);
      if (tokenRes.status !== 200) return reject(ERROR.SERVER_ERROR);
      return resolve(token);
    } catch (err) {
      return reject(err);
    }
  });
};

UserSchema.statics.findAccount = function (account) {
  let criteria =
    account.indexOf("@") === -1 ? { phone: account } : { email: account };
  return this.findOne(criteria);
};

UserSchema.statics.fetchUserInfo = function (userId) {
  return this.findOne({ _id: userId });
};

UserSchema.statics.searchUser = function (value, limit, exclude) {
  return this.aggregate([
    {
      $match: {
        username: { $regex: ".*" + value + ".*" },
        _id: { $nin: objectId(exclude) },
      },
    },
    {
      $project: {
        _id: 1,
        avatar: 1,
        username: 1,
        gender: 1,
      },
    },
    {
      $limit: limit,
    },
    {
      $sort: {
        username: 1,
      },
    },
  ]);
};

UserSchema.statics.setOnline = function (user) {
  let id = objectId(user);
  return this.updateOne({ _id: id }, { $set: { online: true } });
};

UserSchema.statics.setOffline = function (user) {
  let id = objectId(user);
  return this.updateOne({ _id: id }, { $set: { online: false } });
};

module.exports = mongoose.model("User", UserSchema);
