const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { objectId } = require("../utils");
const TaskSchema = new Schema({
  name: {
    type: String,
    default: ""
  },
  description: {
    type: String,
    default: ""
  },
  start_date: {
    type: Date
  },
  due_date: {
    type: Date
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium"
  },
  status: {
    type: String,
    enum: ["working", "planned", "stuck", "done", "defer"],
    default: "planned"
  },
  members: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    default: []
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const GroupSchema = new Schema({
  name: {
    type: String,
    default: ""
  },
  color: {
    type: String,
    default: "lightgrey"
  },
  tasks: [TaskSchema],
  created_at: {
    type: Date,
    default: Date.now
  }
});

const PhaseSchema = new Schema({
  name: {
    type: String,
    default: ""
  },
  description: {
    type: String,
    default: ""
  },
  groups: [GroupSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Task = mongoose.model("Task", TaskSchema);
const Group = mongoose.model("Group", GroupSchema);
const Phase = mongoose.model("Phase", PhaseSchema);

const ProjectSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    creator: {
      type: Schema.Types.ObjectId,
      required: true
    },
    description: {
      type: String,
      default: ""
    },
    members: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "User"
        }
      ],
      default: []
    },
    phases: [PhaseSchema]
  },
  {
    timestamps: true
  }
);

ProjectSchema.statics.fetchUserProjects = function(userId) {
  let id = objectId(userId);
  return this.find({
    $or: [{ members: id }, { creator: id }]
  })
    .populate({
      path: "creator",
      select: "_id username avatar",
      model: "User"
    })
    .populate({
      path: "members",
      select: "_id username avatar",
      model: "User"
    })
    .populate({
      path: "phases.groups.tasks.members",
      select: "_id username avatar",
      model: "User"
    });
};

ProjectSchema.statics.createPhase = function(projectId, newPhase) {
  return new Promise(async (resolve, reject) => {
    try {
      let id = objectId(projectId);
      let phase = new Phase({ newPhase });
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

ProjectSchema.statics.createGroup = function(phaseId, newGroup) {
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

ProjectSchema.statics.createTask = function(groupId, newTask) {
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

ProjectSchema.statics.deleteTask = function(taskId) {
  return new Promise(async (resolve, reject) => {
    try {
      let id = objectId(taskId);
      const resp = await this.updateOne(
        { "phases.groups.tasks._id": id },
        { $pull: { "phases.$.groups.0.tasks": id } }
      );
      console.log(resp);
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

ProjectSchema.statics.deleteGroup = function(groupId) {
  return new Promise(async (resolve, reject) => {
    try {
      let id = objectId(groupId);
      const resp = await this.updateOne(
        { "phases.groups._id": id },
        { $pull: { "phases.$.groups": id } }
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

ProjectSchema.statics.deletePhase = function(phaseId) {
  return new Promise(async (resolve, reject) => {
    try {
      let id = objectId(phaseId);
      const resp = await this.updateOne(
        { "phases._id": id },
        { $pull: { phases: id } }
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

module.exports = mongoose.model("Project", ProjectSchema);
