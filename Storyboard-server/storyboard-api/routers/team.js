const express = require("express");
const router = express.Router();
const { verifyAuthorization } = require("../../authenticate");
const { ERROR, SUCCESS } = require("../../response");
const Team = require("../../models/Team");

router.get("/", verifyAuthorization, async (req, res) => {
  try {
    let reqId = req.query.id;
    let tokenId = req.user._id;
    if (reqId !== tokenId) throw new Error(ERROR.USER_UNSPECIFIED);
    const userTeams = await Team.containUser(reqId);
    return res.status(200).json({
      messagse: SUCCESS.OK,
      data: userTeams
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message ? err.message : err
    });
  }
});

module.exports = router;
