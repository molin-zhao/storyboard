const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GroupSchema = new Schema(
  {
    phase_id: {
      type: Schema.Types.ObjectId,
      ref: "Phase",
      required: true
    },
    name: {
      type: String,
      default: ""
    },
    color: {
      type: String,
      default: "lightgrey"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Group", GroupSchema);
