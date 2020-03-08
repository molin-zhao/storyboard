const qcloudSMS = require("qcloudsms_js");
const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");
const FastDFSClient = require("fdfs");
const geoip = require("geoip-lite");
const cryptoJS = require("crypto-js");
const { TRACKERS, TIMEOUT, EXT, CHARSET } = require("./config/dfs.config");
const { APP_ID, APP_KEY, APP_SIGN } = require("./config/sms.config");
const { HOST, PORT, AUTH, FROM } = require("./config/mail.config");
const { ERROR } = require("./response");
const mailTransport = nodemailer.createTransport(
  smtpTransport({
    host: HOST,
    port: PORT,
    auth: AUTH
  })
);
const normalizePort = val => {
  let port = parseInt(val, 10);
  if (isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
};

const sendSMS = (phone, templateId, templateParams = null) => {
  let sms = qcloudSMS(APP_ID, APP_KEY);
  let smsSender = sms.SmsSingleSender();
  return new Promise((resolve, reject) => {
    smsSender.sendWithParam(
      86,
      phone,
      templateId,
      templateParams,
      APP_SIGN,
      "",
      "",
      (err, res) => {
        if (err) return reject();
        return resolve(res.req);
      }
    );
  });
};

const sendEmail = (email, subject, html, lang) => {
  let from = FROM[lang] ? FROM[lang] : FROM["DEFAULT"];
  return mailTransport.sendMail({
    from,
    to: email,
    subject,
    html
  });
};

const getMongoUrl = (urlArr, dbName) => {
  let url = "mongodb://";
  for (let i = 0; i < urlArr.length; i++) {
    url += `${urlArr[i].host}:${urlArr[i].port}`;
    if (i === urlArr.length - 1) url += "/";
    else url += ",";
  }
  return (url += dbName);
};

const getRabbitmqUrl = (urlArr, user, pass, vhost = "/") => {
  let host = [];
  for (let i = 0; i < urlArr.length; i++) {
    let url = `amqp://${user}:${pass}@${urlArr[i]}${vhost}`;
    host.push(url);
  }
  return host;
};

const generateRandomNumber = (min, max) => {
  if (typeof min !== "number" || typeof max !== "number" || min > max)
    throw new Error(ERROR.SEVICE_ERROR.ARGUMENTS_INVALID);
  return parseInt(Math.random() * (max - min + 1) + min, 10);
};

const generateCode = (length = 6) => {
  if (typeof length !== "number" || length < 1) {
    throw new Error(ERROR.SEVICE_ERROR.ARGUMENTS_INVALID);
  }
  let code = "";
  let i = 0;
  while (i < length) {
    code += generateRandomNumber(0, 9);
    i++;
  }
  return code;
};

const getClientIP = req => {
  let ip =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  if (ip.split(",").length > 0) ip = ip.split(",")[0];
  ip = ip.substr(ip.lastIndexOf(":") + 1, ip.length);
  return ip;
};

const getClientPos = ip => {
  return geoip.lookup(ip);
};

const getDFSConnection = () => {
  let trackers = TRACKERS;
  trackers.sort(() => Math.random() - 0.5);
  return new FastDFSClient({
    trackers: TRACKERS,
    timeout: TIMEOUT,
    defaultExt: EXT,
    charset: CHARSET
  });
};

const decrypt = (val, secret) => {
  let s = cryptoJS.enc.Utf8.parse(secret);
  let decrypted = cryptoJS.AES.decrypt(val, s, {
    mode: cryptoJS.mode.ECB,
    padding: cryptoJS.pad.Pkcs7
  });
  return cryptoJS.enc.Utf8.stringify(decrypted).toString();
};

const isEmailOrPhone = function(value) {
  if (!value) return false;
  let emailReg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
  let phoneReg = /^1[3456789]\d{9}$/;
  let isEmail = emailReg.test(value);
  let isPhone = value.length === 11 && phoneReg.test(value);
  if (!isEmail && !isPhone) return false;
  return true;
};

const isPassword = function(value, errorMsg) {
  if (!value) return false;
  let reg = /^.*(?=.{8,16})(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&*?\(\)+=\[\]\{\}_<>,.;:'"-]).*$/;
  if (reg.test(value)) return true;
  return false;
};

const isPhone = value => {
  if (!value) return false;
  let reg = /^1[3456789]\d{9}$/;
  if (value.length === 11 && reg.test(value)) return true;
  return false;
};

const isEmail = value => {
  if (!value) return false;
  let reg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
  if (reg.test(value)) return true;
  return false;
};

module.exports = {
  normalizePort,
  sendSMS,
  sendEmail,
  getMongoUrl,
  getRabbitmqUrl,
  generateRandomNumber,
  getClientIP,
  getClientPos,
  generateCode,
  getDFSConnection,
  decrypt,
  isEmailOrPhone,
  isPassword,
  isPhone,
  isEmail
};
