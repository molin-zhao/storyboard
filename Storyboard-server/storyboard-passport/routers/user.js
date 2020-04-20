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

/**
 * verify and renew token
 */
router.get("/token/verify", async (req, res) => {
  try {
    let token = req.query.token;
    const decoded = await decodeToken(token);
    let userId = decoded._id;
    const tokenLookup = await redisOps.getJwtToken(userId);
    if (tokenLookup.status !== 200) throw new Error(ERROR.SERVER_ERROR);
    if (tokenLookup.body.data !== token) throw new Error(ERROR.UNAUTHORIZED);
    // verified, token is valid
    let exp = decoded.exp;
    let now = Math.round(Date.now() / 1000);
    let willExp = exp - now;
    if (willExp >= 0 && willExp <= JSONWEBTOKEN.RENEW_BEFORE) {
      try {
        let newToken = getToken({ _id: userId });
        const renewResp = await redisOps.setJwtToken(userId, newToken);
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
 * get sms crypto password
 */
router.get("/sms/password", async (req, res) => {
  try {
    let id = req.query.id;
    if (!id) throw new Error(ERROR.SERVICE_ERROR.PARAM_NOT_PROVIDED);
    if (!isEmailOrPhone(id))
      throw new Error(ERROR.SERVICE_ERROR.ARGUMENTS_INVALID);
    // check if the id is already registered
    const user = await User.findAccount(id);
    if (user)
      return handleError(
        res,
        new Error(ERROR.EMAIL_ADDRESS_OR_USERNAME_EXISTS),
        id
      );
    let pass = generateCode(CRYPTO.LENGTH);
    const codeRes = await redisOps.setSmsPassword(id, pass);
    if (codeRes.status !== 200)
      throw new Error(ERROR.SERVICE_ERROR.SERVICE_NOT_AVAILABLE);
    return handleSuccess(res, pass);
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
    let account = req.body.account;
    let token = req.body.token;
    if (!account || !token)
      throw new Error(ERROR.SERVICE_ERROR.PARAM_NOT_PROVIDED);
    const resPwd = await redisOps.getSmsPassword(account);
    if (resPwd.status !== 200) throw new Error(ERROR.SERVER_ERROR);
    if (account !== decrypt(token, resPwd.body.data))
      throw new Error(ERROR.SERVICE_ERROR.ARGUMENTS_INVALID);
    let templateId = TEMPLATE.REGISTER;
    let code = generateCode(REGISTER_LENGTH);
    console.log(code);
    let expire = REGISTER_EXPIRE / 60;
    let params = [code, expire];
    const resCode = await redisOps.setSmsCode(account, code);
    if (resCode.status !== 200) throw new Error(ERROR.SERVER_ERROR);
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
    let account = req.body.account;
    let token = req.body.token;
    let lang = req.body.lang;
    if (!account || !token)
      throw new Error(ERROR.SERVICE_ERROR.PARAM_NOT_PROVIDED);
    const resPwd = await redisOps.getSmsPassword(account);
    if (resPwd.status !== 200) throw new Error(ERROR.SERVER_ERROR);
    if (account !== decrypt(token, resPwd.body.data))
      throw new Error(ERROR.SERVICE_ERROR.ARGUMENTS_INVALID);
    let code = generateCode(REGISTER_LENGTH);
    let expire = REGISTER_EXPIRE / 60;
    let subject = REGISTER_SUBJECT[lang]
      ? REGISTER_SUBJECT[lang]
      : REGISTER_SUBJECT["DEFAULT"];
    let template = REGISTER_TEMPLATE[lang]
      ? REGISTER_TEMPLATE[lang]([code, expire])
      : REGISTER_TEMPLATE["DEFAULT"]([code, expire]);
    let html = REGISTER_HTML(template);
    const resCode = await redisOps.setSmsCode(account, code);
    if (resCode.status !== 200) throw new Error(ERROR.SERVER_ERROR);
    let resSend = await sendEmail(account, subject, html, lang);
    return handleSuccess(res, resSend.response);
  } catch (err) {
    return handleError(res, err);
  }
});

/**
 * register a new user using local strategy
 */
router.post("/register/local", async (req, res) => {
  try {
    let account = req.body.account;
    let code = req.body.code;
    let encryptPassword = req.body.password;
    let password = decrypt(encryptPassword, account.substr(0, CRYPTO.LENGTH));
    let avatar = req.body.avatar;
    let gender = req.body.gender;
    if (!isEmailOrPhone(account) || !isPassword(password))
      throw new Error(ERROR.SERVICE_ERROR.PARAM_NOT_PROVIDED);
    const codeRes = await redisOps.getSmsCode(account);
    if (codeRes.status !== 200)
      throw new Error(ERROR.SERVICE_ERROR.SERVICE_NOT_AVAILABLE);
    if (code !== codeRes.body.data) throw new Error(ERROR.INFO_NOT_MATCHED);
    // register user
    let newUser;
    if (isPhone(account)) {
      newUser = new User({
        strategy: "local",
        username: account,
        phone: account,
        password,
        avatar,
        gender,
      });
    } else {
      newUser = new User({
        strategy: "local",
        username: account.substr(0, account.indexOf("@")),
        email: account,
        password,
        avatar,
        gender,
      });
    }
    const user = await newUser.save(); // user contains all fields
    const token = await User.getUserToken(user);
    let resData = {
      token,
      id: user._id,
      avatar: user.avatar,
      username: user.username,
      gender: user.gender,
      phone: user.phone,
      email: user.email,
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
    let account = req.body.account;
    let encryptPassword = req.body.password;
    let password = decrypt(encryptPassword, account.substr(0, CRYPTO.LENGTH));
    if (!isEmailOrPhone(account))
      throw new Error(ERROR.SERVICE_ERROR.PARAM_NOT_PROVIDED);
    if (!isPassword(password))
      throw new Error(ERROR.SERVICE_ERROR.ARGUMENTS_INVALID);
    const user = await User.loginUser(account, password);
    return handleSuccess(res, user);
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
    const codeRes = await redisOps.getSmsCode(account);
    if (codeRes.status !== 200)
      throw new Error(ERROR.SERVICE_ERROR.SERVICE_NOT_AVAILABLE);
    let redisCode = codeRes.body.data;
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

router.get("/logout", verifyAuthorization, verifyUser, async (req, res) => {
  try {
    let user = req.query.user;
    const removeTokenRes = await redisOps.delJwtToken(user);
    if (removeTokenRes.status !== 200)
      throw new Error(ERROR.SERVICE_ERROR.SERVICE_NOT_AVAILABLE);
    return handleSuccess(res);
  } catch (err) {
    return handleError(res, err);
  }
});

module.exports = router;
