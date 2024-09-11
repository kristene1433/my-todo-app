const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,  // Ensure that the date is a required field
  },
  description: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Low',
  },
  category: {
    type: String,
    required: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
});

const Task = mongoose.model('Task', TaskSchema);

module.exports = Task;


