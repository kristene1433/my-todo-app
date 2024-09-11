import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import NotificationIcon from '../mainPage/notifications/NotificationIcon';
import { FaCog } from 'react-icons/fa'; 
import TaskForm from '../TaskForm';
import './MainPage.css';
import axios from 'axios';

const MainPage = ({ tasks, setTasks }) => {
  const [notificationMessages, setNotificationMessages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const checkTasks = () => {
      const now = new Date();
      let notifications = [];

      tasks.forEach((task) => {
        const dueDate = new Date(task.date);
        const timeDiff = dueDate - now;
        const oneDay = 24 * 60 * 60 * 1000;

        const taskTitle = task.title || task.name || task.description || 'Unnamed Task';

        if (timeDiff < 0 && !task.isCompleted) {
          notifications.push(`Task overdue: "${taskTitle}"`);
        } else if (timeDiff < oneDay && timeDiff > 0 && !task.isCompleted) {
          notifications.push(`Task due soon: "${taskTitle}"`);
        }
      });

      setNotificationMessages(notifications);
    };

    const interval = setInterval(checkTasks, 30000);

    checkTasks();

    return () => clearInterval(interval);
  }, [tasks]);

  const handleFormSubmit = async (newTask) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found, authorization required');
      }

      const response = await axios.post('http://localhost:5000/api/tasks', newTask, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTasks([...tasks, response.data]);
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Failed to add task. Please try again.');
    }
  };

  

  // Get the last 10 tasks and format dates
  const last10Tasks = tasks.slice(-10).reverse();

  return (
    <div className="main-page-container">
      <header className="main-header">
        <h1 className="header-title">Your To-Do List</h1>
        <div className="header-icons">
          <NotificationIcon notifications={notificationMessages} />
          <FaCog 
            className="settings-icon"
            onClick={() => navigate('/settings')} 
          />
        </div>
      </header>

      {/* Manually added Category Navigation */}
      <section className="categories-section">
        <h2>Categories</h2>
        <ul>
          <li><Link to="/category/Work">Work Tasks</Link></li>
          <li><Link to="/category/Personal">Personal Tasks</Link></li>
          <li><Link to="/category/Shopping">Shopping Tasks</Link></li>
          {/* Add more categories as needed */}
        </ul>
      </section>

      <TaskForm onSubmit={handleFormSubmit} buttonLabel="Add Task" />

      <section className="last-tasks-section">
        <h2>Last 10 Tasks Added</h2>
        <ul>
          {last10Tasks.map((task, index) => {
            const formattedDate = new Date(task.date).toLocaleDateString();
            return (
              <li key={index}>
                {formattedDate} - {task.description} - {task.priority} - {task.category}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
};

export default MainPage;

