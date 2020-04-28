const express = require("express");
const router = express.Router();
const { verifyAuthorization, verifyUser } = require("../../authenticate");
const { handleError, handleSuccess } = require("../../response");
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
      members,
    });
    let teamDoc = await newTeam.save();
    const team = await teamDoc
      .populate({
        path: "members",
        select: "_id username avatar gender",
        model: "User",
      })
      .populate({
        path: "creator",
        select: "_id username avatar gender",
        model: "User",
      })
      .execPopulate();
    return handleSuccess(res, team);
  } catch (err) {
    return handleError(res, err);
  }
});

/**
 * delete team
 */
router.delete("/delete", verifyAuthorization, async (req, res) => {
  try {
    const teamId = req.query.id;
    const resp = await Team.deleteOne({ _id: teamId });
    return handleSuccess(res, resp);
  } catch (err) {
    return handleError(res, err);
  }
});
/**
 * edit team members
 */

router.put("/member", verifyAuthorization, async (req, res) => {
  try {
    const memberIds = req.body.memberIds;
    const teamId = req.body.teamId;
    const resp = await Team.updateOne(
      { _id: teamId },
      { $set: { members: memberIds } }
    );
    if (resp.ok === 1 && resp.nModified === 1) {
      return handleSuccess(res, "ok");
    } else {
      return handleSuccess(res, "accept");
    }
  } catch (err) {
    return handleError(res, err);
  }
});

module.exports = router;
