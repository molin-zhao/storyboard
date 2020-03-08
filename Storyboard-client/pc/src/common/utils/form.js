const cryptoJS = require("crypto-js");
const isAlphanumberic = function(value, errorMsg) {
  if (value) {
    let reg = /^\w+$/;
    if (!reg.test(value)) return errorMsg;
  }
  return "";
};

const isEmailOrPhone = function(value, errorMsg) {
  if (!value) return "";
  let emailReg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
  let phoneReg = /^1[3456789]\d{9}$/;
  let isEmail = emailReg.test(value);
  let isPhone = value.length === 11 && phoneReg.test(value);
  if (!isEmail && !isPhone) return errorMsg;
  return "";
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

const isCode = function(value, errorMsg) {
  if (value.length > 10) return errorMsg;
  if (!value) return "";
  let reg = /^\w+$/;
  if (!reg.test(value)) return errorMsg;
  return "";
};

const isPassword = function(value, errorMsg) {
  if (value) {
    let reg = /^.*(?=.{8,16})(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&*?\(\)+=\[\]\{\}_<>,.;:'"-]).*$/;
    if (!reg.test(value)) return errorMsg;
  }
  return "";
};

const encrypt = (val, secret) => {
  let s = cryptoJS.enc.Utf8.parse(secret);
  let v = cryptoJS.enc.Utf8.parse(val);
  let encrypted = cryptoJS.AES.encrypt(v, s, {
    mode: cryptoJS.mode.ECB,
    padding: cryptoJS.pad.Pkcs7
  });
  return encrypted.toString();
};

const decrypt = (val, secret) => {
  let s = cryptoJS.enc.Utf8.parse(secret);
  let decrypted = cryptoJS.AES.decrypt(val, s, {
    mode: cryptoJS.mode.ECB,
    padding: cryptoJS.pad.Pkcs7
  });
  return cryptoJS.enc.Utf8.stringify(decrypted).toString();
};

export {
  isAlphanumberic,
  isEmailOrPhone,
  isEmail,
  isPhone,
  isCode,
  isPassword,
  encrypt,
  decrypt
};
