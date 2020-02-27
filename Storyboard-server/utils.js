const qcloudSMS = require("qcloudsms_js");
const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");
const geoip = require("geoip-lite");
const { SMS_CONFIG, MAIL } = require("./config");
const { ERROR } = require("./response");
const mailTransport = nodemailer.createTransport(
  smtpTransport({
    host: MAIL.HOST,
    port: MAIL.PORT,
    auth: MAIL.AUTH
  })
);
const normalizePort = val => {
  let port = parseInt(val, 10);
  if (isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
};

const sendSMS = (phone, templateId, templateParams = null) => {
  let sms = qcloudSMS(SMS_CONFIG.APP_ID, SMS_CONFIG.APP_KEY);
  let smsSender = sms.SmsSingleSender();
  return new Promise((resolve, reject) => {
    smsSender.sendWithParam(
      86,
      phone,
      templateId,
      templateParams,
      SMS_CONFIG.APP_SIGN,
      "",
      "",
      (err, res) => {
        if (err) return reject();
        return resolve(res.req);
      }
    );
  });
};

const sendEmail = (email, subject, html) => {
  return mailTransport.sendMail({
    from: MAIL.AUTH.user,
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

const generateRandomNumber = (min, max) => {
  if (typeof min !== "number" || typeof max !== "number" || min > max)
    throw new Error(ERROR.SEVICE_ERROR.ARGUMENTS_INVALID);
  return parseInt(Math.random() * (max - min + 1) + min, 10);
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

module.exports = {
  normalizePort,
  sendSMS,
  sendEmail,
  getMongoUrl,
  generateRandomNumber,
  getClientIP,
  getClientPos
};
