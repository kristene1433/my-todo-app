const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,  // Ensure that the date is a required field
    index: true,  // Index for faster queries based on date
  },
  description: {
    type: String,
    required: true,
    index: true,  // Index for faster searches on description
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Low',
    index: true,  // Index for priority field to optimize queries
  },
  category: {
    type: String,
    required: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });  // Adds createdAt and updatedAt fields automatically

// Create a compound index for description and priority
TaskSchema.index({ description: 1, priority: 1 });

// Compile the model
const Task = mongoose.model('Task', TaskSchema);

module.exports = Task;
