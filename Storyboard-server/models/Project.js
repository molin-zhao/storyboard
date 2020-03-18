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
  createdAt: {
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
  createdAt: {
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
  let id = objectId(projectId);
  let phase = new Phase({ newPhase });
  return this.updateOne({ _id: id }, { $addToSet: { phases: phase } });
};

ProjectSchema.statics.createGroup = function(phaseId, newGroup) {
  let id = objectId(phaseId);
  let group = new Group(newGroup);
  return this.updateOne(
    { "phases._id": id },
    { $addToSet: { "phases.$.groups": group } }
  );
};

ProjectSchema.statics.createTask = function(groupId, newTask) {
  let id = objectId(groupId);
  let task = new Task(newTask);
  return this.updateOne(
    { "phases.groups._id": id },
    { $addToSet: { "phases.$.groups.0.tasks": task } }
  );
};

module.exports = mongoose.model("Project", ProjectSchema);
