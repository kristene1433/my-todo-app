import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { saveAs } from 'file-saver';

const CategoryPage = ({ tasks, setTasks }) => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all'); // State to track the filter option

  const filteredTasks = tasks.filter(task => {
    if (task.category !== categoryName) return false; // Ensure tasks match the category
    if (filter === 'completed') return task.isCompleted;
    if (filter === 'incomplete') return !task.isCompleted;
    return true; // 'all' filter
  });

  const deleteTask = async (taskId) => {
    try {
      console.log('Deleting task with ID:', taskId); // Log the ID being deleted
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setTasks(tasks.filter(task => task._id !== taskId));
      navigate(`/category/${categoryName}`); // Refresh the page after deletion
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const toggleTaskCompletion = async (taskId) => {
    try {
      const updatedTasks = tasks.map(task =>
        task._id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
      );
      setTasks(updatedTasks);

      // Update the task in the database
      const taskToUpdate = updatedTasks.find(task => task._id === taskId);
      await axios.put(`http://localhost:5000/api/tasks/${taskId}`, taskToUpdate, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // Export Tasks as JSON or CSV
  const exportTasks = (format = 'json') => {
    const categoryTasks = filteredTasks; // Export only filtered tasks

    if (!categoryTasks || categoryTasks.length === 0) {
      console.error("No tasks available for export.");
      return;
    }

    let fileData;
    let fileType;
    let fileName;

    if (format === 'json') {
      fileData = JSON.stringify(categoryTasks, null, 2);
      fileType = 'application/json';
      fileName = `${categoryName}_tasks.json`;
    } else if (format === 'csv') {
      fileData = convertToCSV(categoryTasks);
      if (!fileData) {
        console.error("Failed to generate CSV data.");
        return;
      }
      fileType = 'text/csv';
      fileName = `${categoryName}_tasks.csv`;
    }

    const blob = new Blob([fileData], { type: fileType });
    saveAs(blob, fileName);
  };

  // Helper function to convert JSON to CSV
  const convertToCSV = (tasks) => {
    if (!tasks || tasks.length === 0) {
      console.error("No tasks to convert to CSV");
      return '';
    }

    const validTasks = tasks.filter(task => task && typeof task === 'object');

    if (validTasks.length === 0) {
      console.error("All tasks are invalid");
      return '';
    }

    const headers = Object.keys(validTasks[0]);
    const rows = validTasks.map((task) => headers.map((header) => task[header] || '').join(','));

    return [headers.join(','), ...rows].join('\n');
  };

  // Function to handle file import
  const importTasks = async (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
      const fileContent = e.target.result;
      let importedTasks;

      if (file.type === 'application/json') {
        importedTasks = JSON.parse(fileContent);
      } else if (file.type === 'text/csv') {
        importedTasks = parseCSV(fileContent);
      }

      // Ensure each imported task is saved in the backend and has a correct MongoDB _id
      const tasksWithIds = await Promise.all(importedTasks.map(async (task) => {
        try {
          // Save task to backend to ensure it has a correct _id
          const response = await axios.post('http://localhost:5000/api/tasks', task, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          console.log('Task saved to backend:', response.data); // Log the saved task
          return response.data; // Return the saved task with the correct _id
        } catch (error) {
          console.error('Error saving task to MongoDB:', error); // Log the error if the save fails
          return null; // Return null if saving failed
        }
      }));

      // Filter out tasks that failed to save and add the successful ones to the state
      const validTasks = tasksWithIds.filter(task => task !== null);
      setTasks([...tasks, ...validTasks]);
    };

    reader.readAsText(file);
  };

  // Helper function to parse CSV to JSON
  const parseCSV = (csvText) => {
    const [headerLine, ...rows] = csvText.split('\n');
    const headers = headerLine.split(',');

    return rows.map((row) => {
      const values = row.split(',');
      return headers.reduce((task, header, index) => {
        task[header] = values[index];
        return task;
      }, {});
    });
  };

  return (
    <div>
      <h2>{categoryName} Tasks</h2>

      {/* Filter Buttons */}
      <div>
        <button onClick={() => setFilter('all')}>All</button>
        <button onClick={() => setFilter('completed')}>Completed</button>
        <button onClick={() => setFilter('incomplete')}>Incomplete</button>
      </div>

      {/* Export and Import Buttons */}
      <div style={{ marginTop: '20px', marginBottom: '20px' }}>
        <button onClick={() => exportTasks('json')}>Export as JSON</button>
        <button onClick={() => exportTasks('csv')}>Export as CSV</button>
        <input type="file" accept=".json,.csv" onChange={importTasks} style={{ marginLeft: '10px' }} />
      </div>

      <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
        {filteredTasks.map((task) => (
          <li 
            key={task._id} 
            style={{ 
              margin: '10px 0', 
              padding: '10px', 
              border: '1px solid #ccc', 
              borderRadius: '5px', 
              backgroundColor: task.isCompleted ? '#e0e0e0' : '#f9f9f9',
              textDecoration: task.isCompleted ? 'line-through' : 'none'
            }}>
            <input 
              type="checkbox" 
              checked={task.isCompleted} 
              onChange={() => toggleTaskCompletion(task._id)} 
              style={{ marginRight: '10px' }} 
            />
            <strong>Date:</strong> {new Date(task.date).toLocaleDateString()}<br />
            <strong>Description:</strong> {task.description}<br />
            <strong>Priority:</strong> {task.priority}<br />
            <strong>Category:</strong> {task.category}
            <div style={{ marginTop: '5px' }}>
              <Link to={`/edit/${task._id}`} style={{ marginRight: '10px' }}>Edit</Link>
              <button 
                onClick={() => deleteTask(task._id)} 
                style={{ color: 'red', cursor: 'pointer', border: 'none', background: 'none' }}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryPage;




