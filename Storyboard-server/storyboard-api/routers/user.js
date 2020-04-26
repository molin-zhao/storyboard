const express = require("express");
const router = express.Router();
const { ERROR, handleError, handleSuccess } = require("../../response");
const { verifyAuthorization, verifyUser } = require("../../authenticate");
const redisOps = require("../../redisOps");
const Project = require("../../models/Project");
const Team = require("../../models/Team");
const User = require("../../models/User");
const Message = require("../../models/Message");

/**
 * search user by username
 * returns a list of users
 */
router.post("/search", async (req, res) => {
  try {
    let value = req.body.value;
    let limit = parseInt(req.body.limit);
    let exclude = req.body.exclude ? req.body.exclude : [];
    const users = await User.searchUser(value, limit, exclude);
    return handleSuccess(res, { value, data: users });
  } catch (err) {
    return handleError(res, err);
  }
});

/**
 * get user projects, teams and personal info entering the storyboard
 * returns data of projects array, teams array and user object
 */
router.get("/storyboard", verifyAuthorization, verifyUser, async (req, res) => {
  try {
    let reqId = req.query.user;
    const userProjs = await Project.fetchUserProjects(reqId);
    const userTeams = await Team.fetchUserTeams(reqId);
    const userInfo = await User.fetchUserInfo(reqId);
    let data = {
      projects: userProjs,
      teams: userTeams,
      user: userInfo,
    };
    return handleSuccess(res, data);
  } catch (err) {
    return handleError(res, err);
  }
});

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
      $set: { username, gender, avatar },
    });
    handleSuccess(res, user);
  } catch (err) {
    return handleError(res, err);
  }
});

/**
 * get user avatar by user id
 */
router.get("/avatar", async (req, res) => {
  try {
    let userId = req.query.id;
    if (!userId) throw new Error(ERROR.SERVICE_ERROR.PARAM_NOT_PROVIDED);
    const resp = await User.findOne({ _id: userId }).select("avatar");
    return handleSuccess(res, resp.avatar);
  } catch (err) {
    return handleError(res, err);
  }
});

/**
 * get user online status by id
 */
router.get("/online", async (req, res) => {
  try {
    let userId = req.query.id;
    if (!userId) throw new Error(ERROR.SERVICE_ERROR.PARAM_NOT_PROVIDED);
    const resp = await redisOps.getSocketServer(userId);
    if (resp.status === 200 && resp.body.data) return handleSuccess(res, true);
    return handleSuccess(res, false);
  } catch (err) {
    return handleError(res, err);
  }
});

/**
 * get users online status by user ids
 */
router.post("/online", verifyAuthorization, async (req, res) => {
  try {
    let memberIds = req.body.memberIds;
    const resp = await User.find({ _id: { $in: memberIds } }).select(
      "_id online"
    );
    return handleSuccess(res, resp);
  } catch (err) {
    return handleError(res, err);
  }
});

/**
 * get message sent to the user
 */
router.get("/message", verifyAuthorization, async (req, res) => {
  try {
    let userId = req.query.id;
    if (!userId) throw new Error(ERROR.SERVICE_ERROR.PARAM_NOT_PROVIDED);
    const resp = await Message.fetchMessages(userId);
    return handleSuccess(res, resp);
  } catch (err) {
    return handleError(res, err);
  }
});

router.post("/message/del", verifyAuthorization, async (req, res) => {
  try {
    let messageIds = req.body.messageIds;
    if (!messageIds || messageIds.length === 0)
      throw new Error(ERROR.SERVICE_ERROR.ARGUMENTS_INVALID);
    const resp = await Message.deleteMany({ _id: { $in: messageIds } });
    return handleSuccess(res, resp);
  } catch (err) {
    return handleError(res, err);
  }
});

module.exports = router;
