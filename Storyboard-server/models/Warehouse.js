const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { objectId } = require("../utils");
const FieldSchema = new Schema({
  name: {
    type: String,
    default: ""
  },
  type: {
    type: String,
    enum: ["boolean", "number", "string", "date"],
    default: "string"
  }
});
const ItemSchema = new Schema({
  fields: [
    {
      field_ref: FieldSchema,
      value: {
        type: String,
        default: ""
      }
    }
  ]
});
const WarehouseSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ""
    },
    members: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: []
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    fields: [FieldSchema],
    items: [ItemSchema]
  },
  { timestamps: true }
);

WarehouseSchema.statics.fetchUserWarehouse = function(userId) {
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
        },
        items: 1
      }
    }
  ]);
};

module.exports = mongoose.model("Warehouse", WarehouseSchema);
