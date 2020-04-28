const mongoose = require("../mongodb");
const Schema = mongoose.Schema;
const GroupSchema = new Schema(
  {
    name: {
      type: String,
      default: "",
    },
    color: {
      type: String,
      default: "lightgrey",
    },
    tasks: {
      type: [{ type: Schema.Types.ObjectId, ref: "Task" }],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Group", GroupSchema);
