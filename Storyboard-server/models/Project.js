const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { objectId } = require("../utils");

const ProjectSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    phase: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Phase"
        }
      ]
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
        members: id
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
        }
      }
    }
  ]);
};

module.exports = mongoose.model("Project", ProjectSchema);
