const express = require("express");
const router = express.Router();
const { verifyAuthorization, verifyUser } = require("../../authenticate");
const { handleError, handleSuccess } = require("../../response");
const { COLORS } = require("../../config/project.config");
const { generateRandomColor } = require("../../utils");
const Project = require("../../models/Project");

/**
 * get user projects
 */
router.get("/", verifyAuthorization, verifyUser, async (req, res) => {
  try {
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
  try {
    let reqUserId = req.body.user;
    let members = req.body.members;
    let name = req.body.name;
    let description = req.body.description;
    let color = generateRandomColor(COLORS);
    let newProject = new Project({
      creator: reqUserId,
      name,
      description,
      members,
      phases: [
        {
          name: "",
          description: "",
          groups: [{ name: "", color, tasks: [{ name: "", members: [] }] }]
        }
      ]
    });
    let project = await newProject.save();
    return handleSuccess(res, project);
  } catch (err) {
    return handleError(res, err);
  }
});

router.delete("/delete", verifyAuthorization, verifyUser, async (req, res) => {
  try {
    let projectId = req.query.id;
    const deleteProjectRes = await Project.deleteOne({ _id: projectId });
    return handleSuccess(res, deleteProjectRes);
  } catch (err) {
    return handleError(res, err);
  }
});
/**
 * create a phase
 */
router.post("/phase/create", verifyAuthorization, async (req, res) => {
  try {
    let name = req.body.name;
    let description = req.body.description;
    let projectId = req.body.projectId;
    let color = generateRandomColor(COLORS);
    let newPhase = {
      name,
      description,
      groups: [{ name: "", color, tasks: [{ name: "", members: [] }] }]
    };
    const createRes = await Project.createPhase(projectId, newPhase);
    return handleSuccess(res, createRes);
  } catch (err) {
    return handleError(res, err);
  }
});

/**
 * create a group
 */

router.post("/group/create", verifyAuthorization, async (req, res) => {
  try {
    let phaseId = req.body.phaseId;
    let color = generateRandomColor(COLORS);
    let newGroup = {
      name: "",
      color,
      tasks: [{ name: "", members: [] }]
    };
    const resp = await Project.createGroup(phaseId, newGroup);
    return handleSuccess(res, resp);
  } catch (err) {
    return handleError(res, err);
  }
});

/**
 * create a task
 */
router.post("/task/create", verifyAuthorization, async (req, res) => {
  try {
    const {
      name,
      members,
      status,
      priority,
      startDate,
      dueDate,
      groupId
    } = req.body;
    let newTask = {
      name,
      members,
      start_date: startDate,
      due_date: dueDate,
      status,
      priority
    };
    const createRes = await Project.createTask(groupId, newTask);
    return handleSuccess(res, createRes);
  } catch (err) {
    return handleError(res, err);
  }
});

router.delete("/task/delete", verifyAuthorization, async (req, res) => {
  try {
    let taskId = req.query.id;
    const resp = await Project.deleteTask(taskId);
    return handleSuccess(res, resp);
  } catch (err) {
    return handleError(res, err);
  }
});

router.delete("/group/delete", verifyAuthorization, async (req, res) => {
  try {
    let groupId = req.query.id;
    const resp = await Project.deleteGroup(groupId);
    return handleSuccess(res, resp);
  } catch (err) {
    return handleError(res, err);
  }
});

router.delete("/phase/delete", verifyAuthorization, async (req, res) => {
  try {
    let phaseId = req.query.id;
    const resp = await Project.deletePhase(phaseId);
    return handleSuccess(res, resp);
  } catch (err) {
    return handleError(res, err);
  }
});

/**
 * get project online users
 */
router.get("/member/online", async (req, res) => {
  try {
    let projectId = req.query.id;
    const resp = await Project.fetchOnlineMembers(projectId);
    return handleSuccess(res, resp.shift());
  } catch (err) {
    return handleError(res, err);
  }
});

/**
 * add project members
 */
router.post(
  "/member/add",
  verifyAuthorization,
  verifyUser,
  async (req, res) => {
    try {
      let projectId = req.body.projectId;
      let members = req.body.members;
      const resp = await Project.addProjectMembers(projectId, members);
      return handleSuccess(res, resp);
    } catch (err) {
      return handleError(res, err);
    }
  }
);
module.exports = router;
