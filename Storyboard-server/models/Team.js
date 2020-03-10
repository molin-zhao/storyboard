const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { objectId } = require("../utils");

const TeamSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    members: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: []
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

TeamSchema.statics.fetchUserTeams = function(userId) {
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
      $project: {
        _id: 1,
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

module.exports = mongoose.model("Team", TeamSchema);
