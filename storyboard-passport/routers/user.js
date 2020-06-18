const express = require("express");
const router = express.Router();
const { TEMPLATE } = require("../../config/sms.config");
const { JSONWEBTOKEN } = require("../../config/encrypt.config");
const {
  REGISTER_EXPIRE,
  REGISTER_HTML,
  REGISTER_LENGTH,
  REGISTER_SUBJECT,
  REGISTER_TEMPLATE,
} = require("../../config/code.config");
const { CRYPTO } = require("../../config/encrypt.config");
const {
  sendSMS,
  sendEmail,
  generateCode,
  isEmailOrPhone,
  decrypt,
  isPassword,
  isPhone,
  getClientIP,
  getClientPos,
} = require("../../utils");
const redisOps = require("../../redisOps");
const { ERROR, handleError, handleSuccess } = require("../../response");
const {
  verifyAuthorization,
  verifyUser,
  getToken,
  decodeToken,
} = require("../../authenticate");
const User = require("../../models/User");
const mongoose = require("../../mongodb");

/**
 * verify and renew token
 */
router.get("/token/verify/:token", async (req, res) => {
  try {
    let token = req.params.token;
    const decoded = await decodeToken(token);
    let userId = decoded._id;
    const tokenLookup = await redisOps.getJwtToken(userId);
    if (tokenLookup !== token) throw new Error(ERROR.UNAUTHORIZED);
    // verified, token is valid
    let exp = decoded.exp;
    let now = Math.round(Date.now() / 1000);
    let willExp = exp - now;
    if (willExp >= 0 && willExp <= JSONWEBTOKEN.RENEW_BEFORE) {
      try {
        let newToken = getToken({ _id: userId });
        await redisOps.setJwtToken(userId, newToken);
        // successfully renewed token
        let newCred = { id: userId, token: newToken };
        return handleSuccess(res, newCred, 201);
      } catch (err) {
        // cannot renew token but current token is valid
        return handleSuccess(res);
      }
    }
    return handleSuccess(res);
  } catch (err) {
    return handleError(res, err);
  }
});

/**
 * get sms code for phone
 *   1. token is encrypted by sms password and account
 *   2. decrypt the token with sms password, should get the account value
 *   3. these steps guaranteed the user get the latest sms password
 *      and passed the human verification in order to get the sms code
 */
router.post("/sms/phone", async (req, res) => {
  try {
    const { account, code, token } = req.body;
    if (!account || !code || !token)
      throw new Error(ERROR.SERVICE_ERROR.PARAM_NOT_PROVIDED);
    const decryptedAcnt = decrypt(token, code);
    console.log(code);
    console.log(decryptedAcnt);
    console.log(account);
    if (account !== decryptedAcnt)
      throw new Error(ERROR.SERVICE_ERROR.ARGUMENTS_INVALID);
    const user = await User.findAccount(account);
    if (user)
      return handleError(
        res,
        new Error(ERROR.EMAIL_ADDRESS_OR_USERNAME_EXISTS),
        account
      );
    let templateId = TEMPLATE.REGISTER;
    let smsCode = generateCode(REGISTER_LENGTH);
    let expire = REGISTER_EXPIRE / 60;
    let params = [smsCode, expire];
    await redisOps.setSmsCode(account, smsCode);
    let resSend = await sendSMS(account, templateId, params);
    return handleSuccess(res, resSend.body.tel);
  } catch (err) {
    return handleError(res, err);
  }
});

/**
 * get sms code for email
 *   1. same encrypt and decrypt process above
 */
router.post("/sms/email", async (req, res) => {
  try {
    const { account, token, code, lang } = req.body;
    if (!account || !token || !code)
      throw new Error(ERROR.SERVICE_ERROR.PARAM_NOT_PROVIDED);
    if (account !== decrypt(token, code))
      throw new Error(ERROR.SERVICE_ERROR.ARGUMENTS_INVALID);
    const user = await User.findAccount(account);
    if (user)
      return handleError(
        res,
        new Error(ERROR.EMAIL_ADDRESS_OR_USERNAME_EXISTS),
        account
      );
    let smsCode = generateCode(REGISTER_LENGTH);
    let expire = REGISTER_EXPIRE / 60;
    let subject = REGISTER_SUBJECT[lang]
      ? REGISTER_SUBJECT[lang]
      : REGISTER_SUBJECT["DEFAULT"];
    let template = REGISTER_TEMPLATE[lang]
      ? REGISTER_TEMPLATE[lang]([smsCode, expire])
      : REGISTER_TEMPLATE["DEFAULT"]([smsCode, expire]);
    const html = REGISTER_HTML(template);
    await redisOps.setSmsCode(account, smsCode);
    const resSend = await sendEmail(account, subject, html, lang);
    const destEamil = resSend.envelope.to.pop();
    return handleSuccess(res, destEamil);
  } catch (err) {
    return handleError(res, err);
  }
});

/**
 * register a new user using local strategy
 */
router.post("/register/local", async (req, res) => {
  try {
    const { account, code, password, avatar, gender, length } = req.body;
    let decryptedPassword = decrypt(
      password,
      account.substr(0, parseInt(length))
    );
    if (!isEmailOrPhone(account) || !isPassword(decryptedPassword))
      throw new Error(ERROR.SERVICE_ERROR.PARAM_NOT_PROVIDED);
    const codeRes = await redisOps.getSmsCode(account);
    if (code !== codeRes) throw new Error(ERROR.INFO_NOT_MATCHED);
    // register user
    let user = {
      strategy: "local",
      password: decryptedPassword,
      avatar,
      gender,
    };
    if (isPhone(account)) {
      user["username"] = account;
      user["phone"] = account;
    } else {
      user["username"] = account.substr(0, account.indexOf("@"));
      user["email"] = acount;
    }
    newUser = new User(user);
    const createdUser = await newUser.save(); // user contains all fields
    const token = await User.getUserToken(createdUser);
    let resData = {
      token,
      id: user._id,
      ...createdUser,
    };
    return handleSuccess(res, resData);
  } catch (err) {
    return handleError(res, err);
  }
});

/**
 * register a new user using oauth strategy
 */
router.post("/register/oauth", (req, res) => {
  // TODO
});

/**
 * login by user password
 *   1. password should be encrypted on client side
 *   2. decrypt on sever side using the same crypt strategy
 */
router.post("/login/password", async (req, res) => {
  try {
    let ip = getClientIP(req);
    let geo = getClientPos(ip);
    const { account, password, length } = req.body;
    let decryptedPassword = decrypt(
      password,
      account.substr(0, parseInt(length))
    );
    if (!isEmailOrPhone(account) || !isPassword(decryptedPassword))
      throw new Error(ERROR.SERVICE_ERROR.PARAM_NOT_PROVIDED);
    const user = await User.loginUser(account, decryptedPassword, ip, geo);
    if (user) return handleSuccess(res, user);
    return handleSuccess(res, null, 202);
  } catch (err) {
    return handleError(res, err);
  }
});

/**
 * login by sms code
 */
router.post("/login/sms", async (req, res) => {
  try {
    let ip = getClientIP(req);
    let geo = getClientPos(ip);
    let account = req.body.account;
    let code = req.body.code;
    if (!isEmailOrPhone(account))
      throw new Error(ERROR.SERVICE_ERROR.PARAM_NOT_PROVIDED);
    const redisCode = await redisOps.getSmsCode(account);
    if (code !== redisCode) throw new Error(ERROR.USER_AUTHENTICATION_FAILED);
    const user = await User.findAccount(account);
    if (!user) throw new Error(ERROR.USER_NAME_NOT_FOUND);
    const token = await User.getUserToken(user);
    const { avatar, username, email, phone, gender } = user;
    let resData = {
      id: user._id,
      token,
      avatar,
      username,
      email,
      phone,
      gender,
    };
    return handleSuccess(res, resData);
  } catch (err) {
    return handleError(res, err);
  }
});

router.get(
  "/logout/:user",
  verifyAuthorization,
  verifyUser,
  async (req, res) => {
    try {
      let user = req.params.user;
      await redisOps.delJwtToken(user);
      return handleSuccess(res);
    } catch (err) {
      return handleError(res, err);
    }
  }
);

/**
 * logout with async messages
 */
router.post("/logout", verifyAuthorization, verifyUser, async (req, res) => {
  try {
    let user = req.body.user;
    let messages = req.body.messages;
    const session = await mongoose.startSession();
    await session.startTransaction();
    try {
      const update = await User.updateOne(
        { _id: user },
        { $set: { messages } },
        { upsert: true }
      );
      if (update.ok === 1 && update.nModified === 1) {
        await redisOps.delJwtToken(user);
        await session.commitTransaction();
        return handleSuccess(res, "ok");
      } else {
        throw new Error(ERROR.DATA_PERSISTENCE_ERROR);
      }
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      await session.endSession();
    }
  } catch (err) {
    return handleError(res, err);
  }
});

module.exports = router;
