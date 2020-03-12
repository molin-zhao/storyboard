const cryptoJS = require("crypto-js");
const { generateRandomNumber } = require("./number");
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

const getRandomAvatar = (gender, imgSrc) => {
  let rand = generateRandomNumber(0, imgSrc[gender].length - 1);
  return imgSrc[gender][rand];
};

const convertBase64UrlToBlob = urlData => {
  let arr = urlData.split(",");
  let mime = arr[0].match(/:(.*?);/)[1];
  let bstr = atob(arr[1]);
  let n = bstr.length;
  let u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

const convertBase64UrlToFile = (urlData, fileName) => {
  let arr = urlData.split(",");
  let mime = arr[0].match(/:(.*?);/)[1];
  let bytes = atob(arr[1]);
  let n = bytes.length;
  let ia = new Uint8Array(n);
  while (n--) {
    ia[n] = bytes.charCodeAt(n);
  }
  return new File([ia], fileName, { type: mime });
};

const compressImage = (src, config) => {
  return new Promise((resolve, reject) => {
    let img = new Image();
    img.src = src;
    img.onload = function() {
      let that = this;
      let w = that.width;
      let h = that.height;
      let scale = w / h;
      w = config.width || config.height * scale;
      h = config.height || config.width / scale;
      let quality = 0.7; // default quality 0.7
      let canvas = document.createElement("canvas");
      let ctx = canvas.getContext("2d");
      let anw = document.createAttribute("width");
      anw.nodeValue = w;
      let anh = document.createAttribute("height");
      anh.nodeValue = h;
      canvas.setAttributeNode(anw);
      canvas.setAttributeNode(anh);
      ctx.drawImage(that, 0, 0, w, h);
      if (config.quality && config.quality <= 1 && config.quality > 0) {
        quality = config.quality;
      }
      let base64 = canvas.toDataURL("image/*", quality);
      let type = config.type;
      if (type === "file") {
        let filename = config.name ? config.name : "file";
        let file = convertBase64UrlToFile(base64, filename);
        return resolve(file);
      } else if (type === "blob") {
        let blob = convertBase64UrlToBlob(base64);
        return resolve(blob);
      } else {
        return resolve(base64);
      }
    };
  });
};

export {
  isAlphanumberic,
  isEmailOrPhone,
  isEmail,
  isPhone,
  isCode,
  isPassword,
  encrypt,
  decrypt,
  getRandomAvatar,
  compressImage
};
