const express = require("express");
const router = express.Router();
const { getClientIP, getClientPos } = require("../../utils");

router.get("/", (req, res) => {
  let ip = getClientIP(req);
  let geo = getClientPos(ip);
  return res.status(200).json({
    message: { ip, geo }
  });
});
module.exports = router;
