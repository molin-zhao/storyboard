const express = require("express");
const router = express.Router();
const {
  ERROR,
  SUCCESS,
  handleError,
  handleSuccess
} = require("../../response");
const { verifyAuthorization } = require("../../authenticate");
const Project = require("../../models/Project");
const Team = require("../../models/Team");
const User = require("../../models/User");

router.post("/search", (req, res) => {
  let value = req.body.value;
  let limit = req.body.limit;
  let exclude = req.body.exclude ? req.body.exclude : [];
  let data =
    value === "hello" && exclude.length === 0
      ? [
          {
            _id: "111111111",
            avatar: "/static/image/user_m_1.png",
            username: "jfalosijgaop;iehapohdihgaosdjfwnehlgiahegh"
          },
          {
            _id: "111111112",
            avatar: "/static/image/user_m_2.png",
            username: "jfalosijgaopiehapo"
          },
          {
            _id: "111111113",
            avatar: "/static/image/user_m_3.png",
            username: "jfalohegh"
          },
          {
            _id: "111111114",
            avatar: "/static/image/user_m_4.png",
            username: "jfalegh"
          },
          {
            _id: "111111115",
            avatar: "",
            username: "jfalosijgiahegh"
          }
        ]
      : [];
  res.status(200).json({
    message: SUCCESS.OK,
    data: {
      value: value,
      data
    }
  });
});

router.get("/storyboard", verifyAuthorization, async (req, res) => {
  try {
    let reqId = req.query.id;
    let tokenId = req.user._id;
    if (reqId !== tokenId) throw new Error(ERROR.USER_UNSPECIFIED);
    const userProjs = await Project.fetchUserProjects(reqId);
    const userTeams = await Team.fetchUserTeams(reqId);
    const userInfo = await User.fetchUserInfo(reqId);
    return res.status(200).json({
      messagse: SUCCESS.OK,
      data: {
        projects: userProjs,
        teams: userTeams,
        user: userInfo
      }
    });
  } catch (err) {
    return handleError(res, err);
  }
});

router.post("/profile/update", verifyAuthorization, async (req, res) => {
  try {
    let tokenUser = req.user._id;
    let reqUser = req.body.user;
    if (tokenUser !== reqUser) throw new Error(ERROR.FORBIDDEN);
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

router.post("/profile", verifyAuthorization, async (req, res) => {
  try {
    let tokenUser = req.user._id;
    let reqUser = req.body.user;
    if (tokenUser !== reqUser) throw new Error(ERROR.FORBIDDEN);
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
