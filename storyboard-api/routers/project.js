const express = require("express");
const router = express.Router();
const mongoose = require("../../common/mongodb");
const {
  verifyAuthorization,
  verifyUser,
} = require("../../common/authenticate");
const { handleError, handleSuccess } = require("../../common/response");
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
    let user = req.body.user;
    let members = req.body.members;
    let name = req.body.name;
    let description = req.body.description;
    let computedMembers = [];
    if (members && members.length > 0) {
      computedMembers = members.concat(user);
    } else {
      computedMembers.push(user);
    }
    let newProject = {
      creator: user,
      name,
      description,
      members: computedMembers,
    };
    const session = await mongoose.startSession();
    await session.startTransaction();
    try {
      const resp = await Project.createProject(newProject, session);
      await session.commitTransaction();
      return handleSuccess(res, resp);
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      await session.endSession();
    }
  } catch (err) {
    return handleError(res, err);
  }
});

router.delete("/:id", verifyAuthorization, verifyUser, async (req, res) => {
  try {
    let projectId = req.params.id;
    const session = await mongoose.startSession();
    await session.startTransaction();
    try {
      const resp = await Project.deleteProject(projectId, session);
      await session.commitTransaction();
      return handleSuccess(res, resp);
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      await session.endSession();
    }
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
    let newPhase = {
      name,
      description,
    };
    const session = await mongoose.startSession();
    await session.startTransaction();
    try {
      const createRes = await Project.createPhase(projectId, newPhase, session);
      await session.commitTransaction();
      return handleSuccess(res, createRes);
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      await session.endSession();
    }
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
    let newGroup = {
      name: "",
    };
    const session = await mongoose.startSession();
    await session.startTransaction();
    try {
      const resp = await Project.createGroup(phaseId, newGroup, session);
      await session.commitTransaction();
      return handleSuccess(res, resp);
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      await session.endSession();
    }
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
      groupId,
    } = req.body;
    let newTask = {
      name,
      members,
      start_date: startDate,
      due_date: dueDate,
      status,
      priority,
    };
    const session = await mongoose.startSession();
    await session.startTransaction();
    try {
      const createRes = await Project.createTask(groupId, newTask, session);
      await session.commitTransaction();
      return handleSuccess(res, createRes);
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      await session.endSession();
    }
  } catch (err) {
    return handleError(res, err);
  }
});

router.delete("/task/:id/:group", verifyAuthorization, async (req, res) => {
  try {
    let taskId = req.params.id;
    let groupId = req.params.group;
    const session = await mongoose.startSession();
    await session.startTransaction();
    try {
      const resp = await Project.deleteTask(groupId, taskId, session);
      await session.commitTransaction();
      return handleSuccess(res, resp);
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      await session.endSession();
    }
  } catch (err) {
    return handleError(res, err);
  }
});

router.delete("/group/:id/:phase", verifyAuthorization, async (req, res) => {
  try {
    let groupId = req.params.id;
    let phaseId = req.params.phase;
    const session = await mongoose.startSession();
    await session.startTransaction();
    try {
      const resp = await Project.deleteGroup(phaseId, groupId, session);
      await session.commitTransaction();
      return handleSuccess(res, resp);
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      await session.endSession();
    }
  } catch (err) {
    return handleError(res, err);
  }
});

router.delete("/phase/:id/:project", verifyAuthorization, async (req, res) => {
  try {
    let phaseId = req.params.id;
    let projectId = req.params.project;
    const session = await mongoose.startSession();
    await session.startTransaction();
    try {
      const resp = await Project.deletePhase(projectId, phaseId, session);
      await session.commitTransaction();
      return handleSuccess(res, resp);
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      await session.endSession();
    }
  } catch (err) {
    return handleError(res, err);
  }
});

/**
 * get project online users
 */
router.get("/member/online/:id", async (req, res) => {
  try {
    let projectId = req.params.id;
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

/**
 * edit task members
 */
router.put(
  "/task/member/edit",
  verifyAuthorization,
  verifyUser,
  async (req, res) => {
    try {
      let taskId = req.body.taskId;
      let members = req.body.members;
      const resp = await Project.editTaskMembers(taskId, members);
      return handleSuccess(res, resp);
    } catch (err) {
      return handleError(res, err);
    }
  }
);

/**
 * save project logs
 */
router.post("/save", verifyAuthorization, verifyUser, async (req, res) => {
  try {
    const { projectLogs, phaseLogs, groupLogs, taskLogs } = req.body;
    const session = await mongoose.startSession();
    await session.startTransaction();
    try {
      const projectIds = await Project.saveProjectLogs(projectLogs, session);
      const phaseIds = await Project.savePhaseLogs(phaseLogs, session);
      const groupIds = await Project.saveGroupLogs(groupLogs, session);
      const taskIds = await Project.saveTaskLogs(taskLogs, session);
      await session.commitTransaction();
      let data = { projectIds, phaseIds, groupIds, taskIds };
      return handleSuccess(res, data);
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      await session.endSession();
    }
  } catch (err) {
    return handleError(res, err);
  }
});

module.exports = router;
