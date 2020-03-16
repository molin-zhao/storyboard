const express = require("express");
const router = express.Router();
const { verifyAuthorization, verifyUser } = require("../../authenticate");
const { ERROR, handleError, handleSuccess } = require("../../response");
const { COLORS } = require("../../config/project.config");
const { generateRandomColor } = require("../../utils");
const Project = require("../../models/Project");
const Phase = require("../../models/Phase");
const Group = require("../../models/Group");
const Task = require("../../models/Task");

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
router.post("/create", verifyAuthorization, verifyUser, async (req, res) => {
  let reqUserId = req.body.user;
  let members = req.body.members;
  let name = req.body.name;
  let description = req.body.description;
  let color = generateRandomColor(COLORS);
  let mongoose = req.app.locals.mongoose;
  const session = await mongoose.startSession();
  try {
    await session.startTransaction();
    let newProject = new Project({
      creator: reqUserId,
      name,
      description,
      members
    });
    let project = await newProject.save();
    let newPhase = new Phase({
      project_id: project._id,
      name: "",
      description: ""
    });
    let phase = await newPhase.save();
    let newGroup = new Group({
      phase_id: phase._id,
      name: "",
      color
    });
    let group = await newGroup.save();
    let newTask = new Task({
      group_id: group._id
    });
    let task = newTask.save();
    let data = Project.assembleProject(project, phase, group, task);
    await session.commitTransaction();
    return handleSuccess(res, data);
  } catch (err) {
    await session.abortTransaction();
    return handleError(res, err);
  } finally {
    session.endSession();
  }
});

/**
 * create a phase
 */
router.post("/phase/create", verifyAuthorization, async (req, res) => {});

/**
 * create a task
 */

router.post("/task/create", verifyAuthorization, async (req, res) => {});

module.exports = router;
