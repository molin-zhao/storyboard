const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GroupSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: "lightgrey"
  },
  task: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "Task"
      }
    ]
  }
});

module.exports = mongoose.model("Group", GroupSchema);
