const express = require("express");
const router = express.Router();
const { verifyAuthorization } = require("../../authenticate");
const { ERROR, handleError, handleSuccess } = require("../../response");
const Project = require("../../models/Project");

/**
 * get user projects
 */
router.get("/", verifyAuthorization, async (req, res) => {
  try {
    let reqId = req.query.id;
    let tokenId = req.user._id;
    if (reqId !== tokenId) throw new Error(ERROR.USER_UNSPECIFIED);
    const userProjs = await Project.fetchUserProjects(reqId);
    return handleSuccess(res, userProjs);
  } catch (err) {
    return handleError(res, err);
  }
});

/**
 * create a project
 */
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
