const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { objectId } = require("../common/utils");
const FieldSchema = new Schema({
  name: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    enum: ["boolean", "number", "string", "date"],
    default: "string",
  },
});
const ItemSchema = new Schema({
  fields: [
    {
      field_ref: FieldSchema,
      value: {
        type: String,
        default: "",
      },
    },
  ],
});
const WarehouseSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    members: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fields: [FieldSchema],
    items: [ItemSchema],
  },
  { timestamps: true }
);

WarehouseSchema.statics.fetchUserWarehouse = function (userId) {
  let id = objectId(userId);
  return this.find({ $or: [{ members: id }, { creator: id }] })
    .populate({
      path: "members",
      select: "_id username avatar gender",
      model: "User",
    })
    .populate({
      path: "creator",
      select: "_id username avatar gender",
      model: "User",
    })
    .populate("items.field.field_ref");
};

module.exports = mongoose.model("Warehouse", WarehouseSchema);
