const express = require("express");
const router = express.Router();
const { handleError, handleSuccess } = require("../../response");
const { verifyAuthorization, verifyUser } = require("../../authenticate");
const Project = require("../../models/Project");
const Team = require("../../models/Team");
const User = require("../../models/User");

/**
 * search user by username
 * returns a list of users
 */
router.post("/search", async (req, res) => {
  try {
    let value = req.body.value;
    let limit = req.body.limit;
    let exclude = req.body.exclude ? req.body.exclude : [];
    const users = await User.searchUser(value, limit, exclude);
    return handleSuccess(res, users);
  } catch (err) {
    return handleError(res, err);
  }
});

/**
 * get user projects, teams and personal info entering the storyboard
 * returns data of projects array, teams array and user object
 */
router.get(
  "/storyboard",
  /**  verifyAuthorization, verifyUser, */ async (req, res) => {
    try {
      let reqId = req.query.user;
      const userProjs = await Project.fetchUserProjects(reqId);
      const userTeams = await Team.fetchUserTeams(reqId);
      const userInfo = await User.fetchUserInfo(reqId);
      let data = {
        projects: userProjs,
        teams: userTeams,
        user: userInfo
      };
      return handleSuccess(res, data);
    } catch (err) {
      return handleError(res, err);
    }
  }
);

/**
 * edit or update profile
 */
router.post("/profile", verifyAuthorization, verifyUser, async (req, res) => {
  try {
    let reqUser = req.body.user;
    let username = req.body.username;
    let gender = req.body.gender;
    let avatar = req.body.avatar;
    const user = await User.findByIdAndUpdate(reqUser, {
      $set: { username, gender, avatar }
    });
    handleSuccess(res, user);
  } catch (err) {
    return handleError(res, err);
  }
});

module.exports = router;
