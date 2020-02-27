const express = require("express");
const router = express.Router();
const { SMS_CONFIG } = require("../../config");
const { sendSMS, sendEmail } = require("../../utils");

router.post("/sms/phone", (req, res) => {
  let phone = req.body.phone;
  let templateId = SMS_CONFIG.TEMPLATE.REGISTER;
  let params = ["1234", "3"];
  sendSMS(phone, templateId, params)
    .then(resp => {
      if (resp) console.log(resp.body);
      return res.status(200).json({
        message: "success"
      });
    })
    .catch(err => {
      console.log(err);
      return res.status(500).json({
        message: "error sending message"
      });
    });
});

router.post("/sms/email", (req, res) => {
  let email = req.body.email;
  let subject = "测试";
  let html = "<h1>测试啊啊啊</h1>";
  sendEmail(email, subject, html)
    .then(resp => {
      console.log(resp);
      res.status(200).json({
        message: resp
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        message: "error sending email"
      });
    });
});

module.exports = router;
