import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TaskForm from '../TaskForm';
import '../mainPage/MainPage.css';
import axios from 'axios';

const EditTask = ({ tasks, setTasks }) => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [editComplete, setEditComplete] = useState(false);
  const [editedTask, setEditedTask] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const taskToEdit = tasks.find(task => task._id === taskId);

  useEffect(() => {
    if (!taskToEdit) {
      setErrorMessage('Task not found.');
    }
  }, [taskToEdit]);

  const handleFormSubmit = async (updatedTask) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/tasks/${taskId}`, updatedTask, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setTasks(tasks.map(task => (task._id === taskId ? { ...task, ...response.data } : task)));
      setEditedTask(response.data); // Store the updated task
      setEditComplete(true); // Set edit complete to true to show confirmation
    } catch (error) {
      console.error('Error updating task:', error);
      setErrorMessage('Failed to update task. Please try again.');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setTasks(tasks.filter(task => task._id !== taskId));
      navigate('/'); // Redirect to the main page after deletion
    } catch (error) {
      console.error('Error deleting task:', error);
      setErrorMessage('Failed to delete task. Please try again.');
    }
  };

  return (
    <div className="main-page-container">
      <header className="main-header">
        <h1 className="header-title">Edit Task</h1>
      </header>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {taskToEdit && (
        <TaskForm
          onSubmit={handleFormSubmit}
          initialValues={taskToEdit}
          buttonLabel="Save Changes"
        />
      )}

      {editComplete && (
        <div className="confirmation-message">
          <h2>Edit Complete</h2>
          <p>Your task has been successfully updated:</p>
          <ul>
            <li>Date: {new Date(editedTask.date).toLocaleDateString()}</li>
            <li>Description: {editedTask.description}</li>
            <li>Priority: {editedTask.priority}</li>
            <li>Category: {editedTask.category}</li>
          </ul>
          <button onClick={() => navigate('/')}>Return to Main Page</button>
        </div>
      )}

      {!editComplete && (
        <div style={{ marginTop: '20px' }}>
          <button style={{ color: 'red', cursor: 'pointer' }} onClick={handleDelete}>
            Delete Task
          </button>
        </div>
      )}
    </div>
  );
};

export default EditTask;

