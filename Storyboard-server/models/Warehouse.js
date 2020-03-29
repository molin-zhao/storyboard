const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { objectId } = require("../utils");
const FieldSchema = new Schema({
  name: {
    type: String,
    default: ""
  },
  field_type: {
    type: String,
    enum: ["boolean", "numeric", "string", "date"],
    default: "string"
  },
  field_value: {
    type: String,
    default: ""
  }
});
const ItemSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    default: 1
  },
  field: [FieldSchema]
});
const WarehouseSchema = new Schema(
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
    },
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

module.exports = mongoose.model("Warehouse", WarehouseSchema);
