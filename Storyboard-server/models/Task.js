const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TaskSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  start_date: {
    type: Date
  },
  due_date: {
    type: Date
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    defualt: "medium"
  },
  status: {
    type: String,
    enum: ["working", "planned", "stuck", "done", "defer"],
    default: "planned"
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
});

module.exports = mongoose.model("Task", TaskSchema);
