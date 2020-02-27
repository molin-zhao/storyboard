const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const { SALT_FACTOR } = require("../config");

const UserSchema = new Schema(
  {
    strategy: {
      type: String,
      enum: ["Local", "OAuth"],
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
      type: String
    },
    phone: {
      type: String
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
  if (this.strategy !== "Local") return next();
  if (!this.isModified("password")) return next();
  bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
    if (err) return next(err);
    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) return next(err);
      this.password = hash;
    });
  });
});

UserSchema.statics.loginLocal = function(criteria, req, res) {
  let password = req.body.password;
  return this.findOne(criteria)
    .select("password")
    .exec((err, user) => {
      if (err) return handleError(res, err);
      if (user) {
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) return handleError(res, err);
          if (isMatch) {
            let userCreds = {
              _id: user._id
            };
            let token = authenticate.getToken(userCreds);
            let ip = getRemoteIpAddress(req);
            let deviceType = getRemoteDeviceType(req.useragent);
            let loginStatus = {
              token: token,
              ipAddress: ip,
              deviceType: deviceType,
              lastLoginTime: Date.now()
            };
            this.updateOne(
              { _id: user._id },
              { $set: { loginStatus: loginStatus } }
            )
              .then(() => {
                return res.json({
                  status: response.SUCCESS.OK.CODE,
                  msg: response.SUCCESS.OK.MSG,
                  token: token,
                  user: userCreds
                });
              })
              .catch(err => {
                return handleError(res, err);
              });
          } else {
            return res.json({
              status: response.ERROR.USER_PASSWORD_INCORRECT.CODE,
              msg: response.ERROR.USER_PASSWORD_INCORRECT.MSG
            });
          }
        });
      } else {
        return res.json({
          status: response.ERROR.USER_NAME_NOT_FOUND.CODE,
          msg: response.ERROR.USER_NAME_NOT_FOUND.MSG
        });
      }
    });
};

module.exports = mongoose.model("User", UserSchema);
