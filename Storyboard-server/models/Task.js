const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const TaskSchema = new Schema(
  {
    name: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    start_date: {
      type: Date,
    },
    due_date: {
      type: Date,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["working", "planned", "stuck", "done", "defer"],
      default: "planned",
    },
    members: {
      type: [
        {
          status: {
            type: String,
            enum: ["planned", "working", "stuck", "done"],
            default: "working",
          },
          member: {
            type: Schema.Types.ObjectId,
            ref: "User",
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", TaskSchema);
