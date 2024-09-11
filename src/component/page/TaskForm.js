import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const TaskForm = ({ onSubmit, initialValues = {}, buttonLabel = "Add Task" }) => {
  const [date, setDate] = useState(new Date());
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Low');
  const [category, setCategory] = useState('Work');

  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      setDate(initialValues.date ? new Date(initialValues.date) : new Date());
      setDescription(initialValues.description || '');
      setPriority(initialValues.priority || 'Low');
      setCategory(initialValues.category || 'Work');
    }
  }, [initialValues]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const taskData = {
      date: date.toISOString(),
      description,
      priority,
      category,
      isCompleted: initialValues.isCompleted || false, // Keep the completion state for editing
    };

    onSubmit(taskData);

    if (!initialValues._id) {
      // Reset the form if we're adding a new task
      setDate(new Date());
      setDescription('');
      setPriority('Low');
      setCategory('Work');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Date:</label>
        <DatePicker
          selected={date}
          onChange={(date) => setDate(date)}
          dateFormat="MM/dd/yyyy"
          className="form-control"
        />
      </div>

      <div>
        <label>Description:</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Priority:</label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      <div>
        <label>Category:</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
          <option value="Shopping">Shopping</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <button type="submit">{buttonLabel}</button>
    </form>
  );
};

export default TaskForm;
