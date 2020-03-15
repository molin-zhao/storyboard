const express = require("express");
const router = express.Router();
const { verifyAuthorization, verifyUser } = require("../../authenticate");
const {
  ERROR,
  SUCCESS,
  handleError,
  handleSuccess
} = require("../../response");
const Team = require("../../models/Team");

router.get("/", verifyAuthorization, verifyUser, async (req, res) => {
  try {
    let reqId = req.query.id;
    const userTeams = await Team.fetchUserTeams(reqId);
    return handleSuccess(res, userTeams);
  } catch (err) {
    return handleError(res, err);
  }
});

router.post("/create", verifyAuthorization, verifyUser, async (req, res) => {
  try {
    let user = req.body.user;
    let name = req.body.name;
    let members = req.body.members;
    let newTeam = new Team({
      creator: user,
      name,
      members
    });
    const team = newTeam.save();
    return handleSuccess(res, team);
  } catch (err) {
    return handleError(res, err);
  }
});

module.exports = router;
