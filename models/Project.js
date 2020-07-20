const mongoose = require("../common/mongodb");
const Schema = mongoose.Schema;
const { objectId, generateRandomColor } = require("../common/utils");
const { COLORS } = require("../config/project.config");
const Phase = require("./Phase");
const Group = require("./Group");
const Task = require("./Task");

const ProjectSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    description: {
      type: String,
      default: "",
    },
    members: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
    },
    phases: {
      type: [{ type: Schema.Types.ObjectId, ref: "Phase" }],
      default: [],
    },
  },
  { timestamps: true }
);

ProjectSchema.statics.fetchUserProjects = function (userId) {
  let id = objectId(userId);
  return this.find({
    $or: [{ members: id }, { creator: id }],
  })
    .populate({
      path: "creator",
      select: "_id username avatar gender",
      model: "User",
    })
    .populate({
      path: "members",
      select: "_id username avatar gender",
      model: "User",
    })
    .populate({
      path: "phases",
      populate: {
        path: "groups",
        populate: {
          path: "tasks",
          populate: {
            path: "members",
            model: "User",
            select: "_id username avatar gender",
          },
        },
      },
    });
};

ProjectSchema.statics.createProject = function (projectDef, session) {
  return new Promise(async (resolve, reject) => {
    try {
      const { name, creator, members, description } = projectDef;
      await Task.createCollection();
      await Group.createCollection();
      await Phase.createCollection();
      await Project.createCollection();
      const newTask = new Task();
      const task = await newTask.save({ session });
      const newGroup = new Group({
        color: generateRandomColor(COLORS),
        tasks: [task._id],
      });
      const group = await newGroup.save({ session });
      const newPhase = new Phase({ groups: [group._id] });
      const phase = await newPhase.save({ session });
      const newProject = new Project({
        name,
        description,
        creator,
        members,
        phases: [phase._id],
      });
      const project = await newProject.save({ session });
      const populatedProject = project
        .populate({
          path: "creator",
          select: "_id username avatar gender",
          model: "User",
        })
        .populate({
          path: "members",
          select: "_id username avatar gender",
          model: "User",
        })
        .populate({
          path: "phases",
          populate: {
            path: "groups",
            populate: {
              path: "tasks",
              populate: {
                path: "members",
                populate: {
                  path: "member",
                  model: "User",
                  select: "_id username avatar gender",
                },
              },
            },
          },
        })
        .execPopulate();
      return resolve(populatedProject);
    } catch (e) {
      return reject(e);
    }
  });
};

ProjectSchema.statics.createPhase = function (projectId, phaseDef, session) {
  return new Promise(async (resolve, reject) => {
    try {
      const id = objectId(projectId);
      const { name, description } = phaseDef;
      await Task.createCollection();
      await Group.createCollection();
      await Phase.createCollection();
      const newTask = new Task();
      const task = await newTask.save({ session });
      const newGroup = new Group({
        color: generateRandomColor(COLORS),
        tasks: [task._id],
      });
      const group = await newGroup.save({ session });
      const newPhase = new Phase({
        name,
        description,
        groups: [group._id],
      });
      const phase = await newPhase.save({ session });
      const resp = await Project.updateOne(
        { _id: id },
        { $addToSet: { phases: phase } },
        { session }
      ).session(session);
      if (resp.ok === 1 && resp.nModified === 1) {
        const populatedPhase = phase
          .populate({
            path: "groups",
            populate: {
              path: "tasks",
              populate: {
                path: "members",
                model: "User",
              },
            },
          })
          .execPopulate();
        return resolve(populatedPhase);
      } else {
        return reject();
      }
    } catch (err) {
      return reject(err);
    }
  });
};

ProjectSchema.statics.createGroup = function (phaseId, groupDef, session) {
  return new Promise(async (resolve, reject) => {
    try {
      const id = objectId(phaseId);
      const { name } = groupDef;
      await Task.createCollection();
      await Group.createCollection();
      const newTask = new Task();
      const task = await newTask.save({ session });
      const newGroup = new Group({
        name,
        color: generateRandomColor(COLORS),
        tasks: [task._id],
      });
      const group = await newGroup.save({ session });
      const resp = await Phase.updateOne(
        { _id: id },
        { $addToSet: { groups: group } },
        { session }
      );
      if (resp.ok === 1 && resp.nModified === 1) {
        const populatedGroup = group
          .populate({
            path: "tasks",
            populate: {
              path: "members",
              model: "User",
            },
          })
          .execPopulate();
        return resolve(populatedGroup);
      } else {
        return reject();
      }
    } catch (err) {
      return reject(err);
    }
  });
};

ProjectSchema.statics.createTask = function (groupId, taskDef, session) {
  return new Promise(async (resolve, reject) => {
    try {
      const id = objectId(groupId);
      await Task.createCollection();
      const newTask = new Task(taskDef);
      const task = await newTask.save({ session });
      const resp = await Group.updateOne(
        { _id: id },
        { $addToSet: { tasks: task } },
        { session }
      );
      if (resp.ok === 1 && resp.nModified === 1) {
        const popluatedTask = task
          .populate({
            path: "members",
            model: "User",
          })
          .execPopulate();
        return resolve(popluatedTask);
      } else {
        return reject();
      }
    } catch (err) {
      return reject(err);
    }
  });
};

ProjectSchema.statics.deleteTask = function (groupId, taskId, session) {
  return new Promise(async (resolve, reject) => {
    try {
      const id = objectId(taskId);
      const parentId = objectId(groupId);
      const resp = await Group.updateOne(
        { _id: parentId },
        {
          $pull: {
            tasks: { _id: id },
          },
        },
        { session }
      );
      if (resp.ok === 1 && resp.nModified === 1) {
        const del_task = await Task.deleteOne({ _id: id }, { session });
        if (del_task.n === 1 && del_task.ok === 1) return resolve("ok");
        else return reject();
      } else {
        return reject(null);
      }
    } catch (err) {
      return reject(err);
    }
  });
};

ProjectSchema.statics.deleteGroup = function (phaseId, groupId, session) {
  return new Promise(async (resolve, reject) => {
    try {
      const id = objectId(groupId);
      const parentId = objectId(phaseId);
      const resp = await Phase.updateOne(
        { _id: parentId },
        { $pull: { groups: { _id: id } } },
        { session }
      );
      if (resp.ok === 1 && resp.nModified === 1) {
        const group = await Group.findByIdAndDelete(
          { _id: id },
          { session, select: "tasks" }
        );
        const tasks = group["tasks"];
        const del_tasks = await Task.deleteMany(
          { _id: { $in: tasks } },
          { session }
        );
        if (del_tasks.ok === 1) return resolve("ok");
        else return reject();
      } else {
        return reject();
      }
    } catch (err) {
      return reject(err);
    }
  });
};

ProjectSchema.statics.deletePhase = function (projectId, phaseId, session) {
  return new Promise(async (resolve, reject) => {
    try {
      const id = objectId(phaseId);
      const parentId = objectId(projectId);
      const resp = await Project.updateOne(
        { _id: parentId },
        { $pull: { phases: { _id: id } } }
      );
      if (resp.ok === 1 && resp.nModified === 1) {
        const phase = await Phase.findByIdAndDelete(
          { _id: id },
          { session }
        ).populate({
          path: "groups",
        });
        let groupIds = [];
        let taskIds = [];
        for (let group of phase["groups"]) {
          groupIds.push(group["_id"]);
          taskIds = taskIds.concat(group["tasks"]);
        }
        const del_groups = await Group.deleteMany(
          { _id: { $in: groupIds } },
          { session }
        );
        const del_tasks = await Task.deleteMany(
          { _id: { $in: taskIds } },
          { session }
        );
        if (del_groups.ok && del_tasks.ok) return resolve("ok");
        else return reject();
      } else {
        return reject();
      }
    } catch (err) {
      return reject(err);
    }
  });
};

ProjectSchema.statics.deleteProject = function (projectId, session) {
  return new Promise(async (resolve, reject) => {
    try {
      let id = objectId(projectId);
      const project = await Project.findByIdAndDelete(
        { _id: id },
        { session }
      ).populate({
        path: "phases",
        populate: {
          path: "groups",
        },
      });
      let phaseIds = [];
      let groupIds = [];
      let taskIds = [];
      for (let phase of project["phases"]) {
        phaseIds.push(phase["_id"]);
        for (let group of phase["groups"]) {
          groupIds.push(group["_id"]);
          taskIds = taskIds.concat(group["tasks"]);
        }
      }
      const del_phases = await Phase.deleteMany(
        { _id: { $in: phaseIds } },
        { session }
      );
      const del_groups = await Group.deleteMany(
        { _id: { $in: groupIds } },
        { session }
      );
      const del_tasks = await Task.deleteMany(
        { _id: { $in: taskIds } },
        { session }
      );
      if (del_phases.ok && del_groups.ok && del_tasks.ok) return resolve("ok");
      else return reject();
    } catch (err) {
      return reject(err);
    }
  });
};

ProjectSchema.statics.fetchOnlineMembers = function (projectId) {
  let id = objectId(projectId);
  return this.aggregate([
    {
      $match: {
        _id: id,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "members",
        foreignField: "_id",
        as: "members",
      },
    },
    {
      $unwind: {
        path: "$location",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        members: {
          _id: 1,
          username: 1,
          avatar: 1,
          gender: 1,
          online: 1,
        },
      },
    },
    {
      $sort: {
        "members.online": 1,
      },
    },
  ]);
};

ProjectSchema.statics.addProjectMembers = function (projectId, members) {
  return new Promise((resolve, reject) => {
    return Project.findByIdAndUpdate(
      projectId,
      {
        $addToSet: { members },
      },
      { fields: { _id: 1, members: 1 }, new: true }
    ).exec(async (err, doc) => {
      if (err) return reject(err);
      try {
        const result = await doc
          .populate({
            path: "members",
            select: "_id username avatar gender",
            model: "User",
          })
          .execPopulate();
        return resolve(result);
      } catch (e) {
        return reject(e);
      }
    });
  });
};

ProjectSchema.statics.editTaskMembers = function (taskId, members) {
  let id = objectId(taskId);
  return new Promise(async (resolve, reject) => {
    try {
      const resp = await Task.updateOne({ _id: id }, { members: members });
      if (resp.ok === 1 && resp.nModified === 1) {
        return resolve("ok");
      } else {
        return resolve("accept");
      }
    } catch (err) {
      return reject(err);
    }
  });
};

ProjectSchema.statics.saveProjectLogs = function (logs, session) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!logs || logs.constructor !== Object) return resolve([]);
      let keys = Object.keys(logs);
      if (keys.length === 0) return resolve([]);
      let projectIds = [];
      for (const key of keys) {
        const resp = await Project.updateOne(
          { _id: objectId(key) },
          logs[key],
          { session }
        );
        if (resp.ok === 1 && resp.nModified === 1) projectIds.push(key);
        else return reject();
      }
      return resolve(projectIds);
    } catch (err) {
      return reject(err);
    }
  });
};

ProjectSchema.statics.savePhaseLogs = function (logs, session) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!logs || logs.constructor !== Object) return resolve([]);
      let keys = Object.keys(logs);
      if (keys.length === 0) return resolve([]);
      let phaseIds = [];
      for (const key of keys) {
        const resp = await Phase.updateOne({ _id: objectId(key) }, logs[key], {
          session,
        });
        if (resp.ok === 1 && resp.nModified === 1) phaseIds.push(key);
        else return reject();
      }
      return resolve(phaseIds);
    } catch (err) {
      return reject(err);
    }
  });
};

ProjectSchema.statics.saveGroupLogs = function (logs, session) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!logs || logs.constructor !== Object) return resolve([]);
      let keys = Object.keys(logs);
      if (keys.length === 0) return resolve([]);
      let groupIds = [];
      for (const key of keys) {
        const resp = await Group.updateOne({ _id: objectId(key) }, logs[key], {
          session,
        });
        if (resp.ok === 1 && resp.nModified === 1) groupIds.push(key);
        else return reject();
      }
      return resolve(groupIds);
    } catch (err) {
      return reject(err);
    }
  });
};

ProjectSchema.statics.saveTaskLogs = function (logs, session) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!logs || logs.constructor !== Object) return resolve([]);
      let keys = Object.keys(logs);
      if (keys.length === 0) return resolve([]);
      let taskIds = [];
      for (const key of keys) {
        const resp = await Task.updateOne({ _id: objectId(key) }, logs[key], {
          session,
        });
        if (resp.ok === 1 && resp.nModified === 1) taskIds.push(key);
        else return reject();
      }
      return resolve(taskIds);
    } catch (err) {
      return reject(err);
    }
  });
};

const Project = mongoose.model("Project", ProjectSchema);

module.exports = Project;
