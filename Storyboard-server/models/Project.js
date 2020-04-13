const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { objectId } = require("../utils");
const TaskSchema = new Schema({
  name: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  start_date: {
    type: Date,
  },
  due_date: {
    type: Date,
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  status: {
    type: String,
    enum: ["working", "planned", "stuck", "done", "defer"],
    default: "planned",
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
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const GroupSchema = new Schema({
  name: {
    type: String,
    default: "",
  },
  color: {
    type: String,
    default: "lightgrey",
  },
  tasks: [TaskSchema],
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const PhaseSchema = new Schema({
  name: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  groups: [GroupSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Task = mongoose.model("Task", TaskSchema);
const Group = mongoose.model("Group", GroupSchema);
const Phase = mongoose.model("Phase", PhaseSchema);

const ProjectSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      required: true,
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
    phases: [PhaseSchema],
  },
  {
    timestamps: true,
  }
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
      path: "phases.groups.tasks.members",
      select: "_id username avatar gender",
      model: "User",
    });
};

ProjectSchema.statics.createPhase = function (projectId, newPhase) {
  return new Promise(async (resolve, reject) => {
    try {
      let id = objectId(projectId);
      let phase = new Phase(newPhase);
      const resp = await this.updateOne(
        { _id: id },
        { $addToSet: { phases: phase } }
      );
      if (resp.ok === 1 && resp.nModified === 1) {
        return resolve(phase);
      } else {
        return resolve(null);
      }
    } catch (err) {
      return reject(err);
    }
  });
};

ProjectSchema.statics.createGroup = function (phaseId, newGroup) {
  return new Promise(async (resolve, reject) => {
    try {
      let id = objectId(phaseId);
      let group = new Group(newGroup);
      const resp = await this.updateOne(
        { "phases._id": id },
        { $addToSet: { "phases.$.groups": group } }
      );
      if (resp.ok === 1 && resp.nModified === 1) {
        return resolve(group);
      } else {
        return resolve(null);
      }
    } catch (err) {
      return reject(err);
    }
  });
};

ProjectSchema.statics.createTask = function (groupId, newTask) {
  return new Promise(async (resolve, reject) => {
    try {
      let id = objectId(groupId);
      let task = new Task(newTask);
      const resp = await this.updateOne(
        { "phases.groups._id": id },
        { $addToSet: { "phases.$.groups.0.tasks": task } }
      );
      if (resp.ok === 1 && resp.nModified === 1) {
        return resolve(task);
      } else {
        return resolve(null);
      }
    } catch (err) {
      return reject(err);
    }
  });
};

ProjectSchema.statics.deleteTask = function (taskId) {
  return new Promise(async (resolve, reject) => {
    try {
      let id = objectId(taskId);
      const resp = await this.updateOne(
        { "phases.groups.tasks._id": id },
        {
          $pull: {
            "phases.$.groups.0.tasks": { _id: id },
          },
        }
      );
      if (resp.ok === 1 && resp.nModified === 1) {
        return resolve("ok");
      } else {
        return resolve(null);
      }
    } catch (err) {
      return reject(err);
    }
  });
};

ProjectSchema.statics.deleteGroup = function (groupId) {
  return new Promise(async (resolve, reject) => {
    try {
      let id = objectId(groupId);
      const resp = await this.updateOne(
        { "phases.groups._id": id },
        { $pull: { "phases.$.groups": { _id: id } } }
      );
      if (resp.ok === 1 && resp.nModified === 1) {
        return resolve("ok");
      } else {
        return resolve(null);
      }
    } catch (err) {
      return reject(err);
    }
  });
};

ProjectSchema.statics.deletePhase = function (phaseId) {
  return new Promise(async (resolve, reject) => {
    try {
      let id = objectId(phaseId);
      const resp = await this.updateOne(
        { "phases._id": id },
        { $pull: { phases: { _id: id } } }
      );
      if (resp.ok === 1 && resp.nModified === 1) {
        return resolve("ok");
      } else {
        return resolve(null);
      }
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
    return this.findByIdAndUpdate(
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
      const resp = await this.updateOne(
        { "phases.groups.tasks._id": id },
        { "phases.$.groups.0.tasks.0.members": members }
      );
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
        const resp = await this.updateOne(
          { _id: objectId(key) },
          logs[key]
        ).session(session);
        if (resp.ok === 1 && resp.nModified === 1) projectIds.push(key);
        else continue;
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
        const resp = await this.updateOne(
          { "phases._id": objectId(key) },
          logs[key]
        ).session(session);
        if (resp.ok === 1 && resp.nModified === 1) phaseIds.push(key);
        else continue;
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
        const resp = await this.updateOne(
          { "phases.groups._id": objectId(key) },
          logs[key]
        ).session(session);
        if (resp.ok === 1 && resp.nModified === 1) groupIds.push(key);
        else continue;
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
        const resp = await this.updateOne(
          { "phases.groups.tasks._id": objectId(key) },
          logs[key]
        ).session(session);
        if (resp.ok === 1 && resp.nModified === 1) taskIds.push(key);
        else continue;
      }
      return resolve(taskIds);
    } catch (err) {
      return reject(err);
    }
  });
};
module.exports = mongoose.model("Project", ProjectSchema);
