const express = require("express");
const router = express.Router();
const { verifyAuthorization } = require("../../authenticate");
const {
  ERROR,
  SUCCESS,
  handleError,
  handleSuccess
} = require("../../response");
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
    return handleError(res, err);
  }
});

router.post("/create", verifyAuthorization, async (req, res) => {
  try {
    let reqUserId = req.body.user;
    let tokenUserId = req.user._id;
    if (reqUserId !== tokenUserId) throw new Error(ERROR.USER_UNSPECIFIED);
    let members = req.body.members;
    let name = req.body.name;
    let description = req.body.description;
    let newProj = new Project({
      creator: reqUserId,
      name,
      description,
      members
    });
    const project = await newProj.save();
    return handleSuccess(res, project);
  } catch (err) {
    return handleError(res, err);
  }
});

module.exports = router;
