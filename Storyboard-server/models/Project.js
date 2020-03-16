const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { objectId } = require("../utils");

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
    }
  },
  {
    timestamps: true
  }
);

ProjectSchema.statics.fetchUserProjects = function(userId) {
  let id = objectId(userId);
  return this.aggregate([
    {
      $match: {
        $or: [{ members: id }, { creator: id }]
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "creator",
        foreignField: "_id",
        as: "creator"
      }
    },
    {
      $unwind: "$creator"
    },
    {
      $lookup: {
        from: "users",
        localField: "members",
        foreignField: "_id",
        as: "members"
      }
    },
    {
      $unwind: {
        path: "$members",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: "Users",
        localField: "phases.groups.tasks.members",
        foreignField: "_id",
        as: "task_members"
      }
    },
    {
      $unwind: {
        path: "$task_members",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: 1,
        description: 1,
        name: 1,
        members: {
          _id: 1,
          username: 1,
          avatar: 1,
          gender: 1
        },
        creator: {
          _id: 1,
          username: 1,
          avatar: 1,
          gender: 1
        },
        phases: {
          _id: 1,
          name: 1,
          groups: {
            _id: 1,
            name: 1,
            color: 1,
            tasks: {
              _id: 1,
              name: 1,
              description: 1,
              start_date: 1,
              due_date: 1,
              priority: 1,
              members: {
                _id: "$task_member._id",
                username: "$task_member.username",
                avatar: "$task_member.avatar",
                gender: "$task_member.gender"
              },
              status: 1
            }
          }
        }
      }
    }
  ]);
};

/**
 * assemble a project
 * params: project, phase, group, task
 * return: project with phases, groups and tasks
 */
ProjectSchema.statics.assembleProject = function(pro, pha, g, t) {
  return {
    ...pro,
    phases: [
      {
        ...pha,
        groups: [
          {
            ...g,
            tasks: [
              {
                ...t
              }
            ]
          }
        ]
      }
    ]
  };
};

module.exports = mongoose.model("Project", ProjectSchema);
