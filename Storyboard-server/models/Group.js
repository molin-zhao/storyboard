const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Group = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    member: {
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

module.exports = mongoose.model("Group", Group);