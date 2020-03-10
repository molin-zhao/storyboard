const express = require("express");
const router = express.Router();
const { verifyAuthorization } = require("../../authenticate");
const { ERROR, SUCCESS } = require("../../response");
const Project = require("../../models/Project");

router.get("/", verifyAuthorization, async (req, res) => {
  try {
    let reqId = req.query.id;
    let tokenId = req.user._id;
    if (reqId !== tokenId) throw new Error(ERROR.USER_UNSPECIFIED);
    const userProjs = await Project.containUser(reqId);
    return res.status(200).json({
      messagse: SUCCESS.OK,
      data: userProjs
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message ? err.message : err
    });
  }
});

module.exports = router;
