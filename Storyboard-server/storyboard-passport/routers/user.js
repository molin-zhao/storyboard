const express = require("express");
const router = express.Router();
const { TEMPLATE } = require("../../config/sms.config");
const { JSONWEBTOKEN } = require("../../config/encrypt.config");
const {
  REGISTER_EXPIRE,
  REGISTER_HTML,
  REGISTER_LENGTH,
  REGISTER_SUBJECT,
  REGISTER_TEMPLATE
} = require("../../config/code.config");
const { CRYPTO } = require("../../config/encrypt.config");
const {
  sendSMS,
  sendEmail,
  generateCode,
  isEmailOrPhone,
  decrypt,
  isPassword,
  isPhone
} = require("../../utils");
const redisOps = require("../../redisOps");
const { ERROR, SUCCESS } = require("../../response");
const { verifyAuthorization, getToken } = require("../../authenticate");
const User = require("../../models/User");

/**
 * verify and renew token
 */
router.get("/token/verify", verifyAuthorization, async (req, res) => {
  let userId = req.user._id;
  let exp = req.user.exp;
  let now = Math.round(Date.now() / 1000);
  let willExp = exp - now;
  if (willExp >= 0 && willExp <= JSONWEBTOKEN.RENEW_BEFORE) {
    let newToken = getToken({ _id: userId });
    const renewResp = await redisOps.setJwtToken(userId, newToken);
    if (renewResp.status === 200) {
      // successfully renewed token
      return res.status(202).json({
        message: SUCCESS.OK,
        data: { id: userId, token: newToken }
      });
    }
  }
  return res.status(200).json({
    message: SUCCESS.OK
  });
});
/**
 * register a new user using local strategy
 */
router.post("/register/local", (req, res) => {
  throw new Error(ERROR.SERVER_ERROR);
});

/**
 * register a new user using oauth strategy
 */
router.post("/register/oauth", (req, res) => {});

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
      return res.status(202).json({
        message: ERROR.SERVICE_ERROR.SERVICE_NOT_ACCEPTABLE,
        data: id
      });
    let pass = generateCode(CRYPTO.LENGTH);
    const codeRes = await redisOps.setSmsPassword(id, pass);
    if (codeRes.status !== 200)
      throw new Error(ERROR.SERVICE_ERROR.SERVICE_NOT_AVAILABLE);
    return res.status(200).json({
      message: SUCCESS.OK,
      data: pass
    });
  } catch (err) {
    return res.status(500).json({
      message: ERROR.SERVER_ERROR,
      data: err.message
    });
  }
});

/**
 * get sms code for phone
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
    let expire = REGISTER_EXPIRE / 60;
    let params = [code, expire];
    const resCode = await redisOps.setSmsCode(account, code);
    if (resCode.status !== 200) throw new Error(ERROR.SERVER_ERROR);
    let resSend = await sendSMS(account, templateId, params);
    return res.status(200).json({
      message: "success",
      data: resSend.body.tel
    });
  } catch (err) {
    return res.status(500).json({
      message: ERROR.SERVER_ERROR,
      data: err.message
    });
  }
});

/**
 * get sms code for email
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
    return res.status(200).json({
      message: SUCCESS.OK,
      data: resSend.response
    });
  } catch (err) {
    return res.status(500).json({
      message: ERROR.SERVER_ERROR,
      data: err.message
    });
  }
});

router.post("/register", async (req, res) => {
  try {
    let account = req.body.account;
    let code = req.body.code;
    let encryptPassword = req.body.password;
    let password = decrypt(encryptPassword, code);
    if (!isEmailOrPhone(account) || !isPassword(password))
      throw new Error(ERROR.SERVICE_ERROR.PARAM_NOT_PROVIDED);
    const codeRes = await redisOps.getSmsCode(account);
    if (codeRes.status !== 200)
      throw new Error(ERROR.SERVICE_ERROR.SERVICE_NOT_AVAILABLE);
    if (code !== codeRes.body.data) {
      return res.status(202).json({
        message: ERROR.SERVICE_ERROR.ARGUMENTS_INVALID
      });
    }
    // register user
    let newUser;
    if (isPhone(account)) {
      newUser = new User({
        strategy: "local",
        username: account,
        phone: account,
        password
      });
    } else {
      newUser = new User({
        strategy: "local",
        username: account.substr(0, account.indexOf("@")),
        email: account,
        password
      });
    }
    const user = await newUser.save();
    const token = await User.getUserToken(user);
    return res.status(200).json({
      message: SUCCESS.OK,
      data: { id: user._id, token, user }
    });
  } catch (err) {
    return res.status(500).json({
      message: ERROR.SERVER_ERROR,
      data: err.message
    });
  }
});

router.post("/login/password", async (req, res) => {
  try {
    let account = req.body.account;
    let encryptPassword = req.body.password;
    let password = decrypt(encryptPassword, account.substr(0, CRYPTO.LENGTH));
    if (!isEmailOrPhone(account))
      throw new Error(ERROR.SERVICE_ERROR.PARAM_NOT_PROVIDED);
    if (!isPassword(password))
      throw new Error(ERROR.SERVICE_ERROR.ARGUMENTS_INVALID);
    const loginResponse = await User.loginUser(account, password);
    if (loginResponse.error)
      return res.status(202).json({
        message: loginResponse.error
      });
    return res.status(200).json({
      message: SUCCESS.OK,
      data: loginResponse
    });
  } catch (err) {
    return res.status(500).json({
      message: ERROR.SERVICE_ERROR.SERVICE_NOT_AVAILABLE,
      data: err
    });
  }
});

router.post("/login/sms", async (req, res) => {
  try {
    let account = req.body.account;
    let code = req.body.code;
    if (!isEmailOrPhone(account))
      throw new Error(ERROR.SERVICE_ERROR.PARAM_NOT_PROVIDED);
    const codeRes = await redisOps.getSmsCode(account);
    if (codeRes.status !== 200)
      throw new Error(ERROR.SERVICE_ERROR.SERVICE_NOT_AVAILABLE);
    let redisCode = codeRes.body.data;
    if (code !== redisCode) {
      return res.status(202).json({
        message: ERROR.SERVICE_ERROR.ARGUMENTS_INVALID
      });
    }
    // register user
    const user = await User.findAccount(account);
    if (!user) throw new Error(ERROR.USER_NAME_NOT_FOUND);
    const token = await User.getUserToken(user);
    return res.status(200).json({
      message: SUCCESS.OK,
      data: { id: user._id, token }
    });
  } catch (err) {
    return res.status(500).json({
      message: ERROR.SERVER_ERROR,
      data: err.message
    });
  }
});

router.get("/logout", verifyAuthorization, async (req, res) => {
  try {
    let user = req.query.id;
    let tokenUser = req.user._id;
    if (!user) throw new Error(ERROR.SERVICE_ERROR.PARAM_NOT_PROVIDED);
    if (user !== tokenUser)
      throw new Error(ERROR.SERVICE_ERROR.ARGUMENTS_INVALID);
    const removeTokenRes = await redisOps.delJwtToken(user);
    if (removeTokenRes.status !== 200)
      throw new Error(ERROR.SERVICE_ERROR.SERVICE_NOT_AVAILABLE);
    return res.status(200).json({
      message: SUCCESS.OK
    });
  } catch (err) {
    return res.json(500).json({
      message: ERROR.SERVICE_ERROR.SERVICE_NOT_ACCEPTABLE,
      data: err.message
    });
  }
});

module.exports = router;
