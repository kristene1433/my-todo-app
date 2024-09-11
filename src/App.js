import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css'; // Import the CSS file
import themes from './component/page/mainPage/settingsPage/themes'; 
import MainPage from './component/page/mainPage/MainPage';
import CategoryPage from './component/page/categoryPage/CategoryPage'; // Import CategoryPage
import EditTask from './component/page/categoryPage/EditTask'; // Import EditTask
import Toolbar from './component/page/Toolbar'; // Import the Toolbar component
import SettingsPage from './component/page/mainPage/settingsPage/SettingsPage'; // Import the SettingsPage component
import LoginForm from './component/LoginForm';
import RegisterForm from './component/RegistrationForm';
import ChatBot from './component/ChatBot'; // Import the ChatBot component
import './index.css'; // Import index.css
import './styles.css'; // Import styles.css

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [authToken, setAuthToken] = useState(localStorage.getItem('token'));
  const [currentTheme, setCurrentTheme] = useState(themes.light);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!authToken) return; // Don't attempt to fetch tasks if not authenticated

      try {
        const response = await axios.get('http://localhost:5000/api/tasks', {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, [authToken]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
  };

  const handleThemeChange = (theme) => {
    setCurrentTheme(theme);
    applyTheme(theme);
  };

  const applyTheme = (theme) => {
    document.documentElement.style.setProperty('--background-color', theme.backgroundColor);
    document.documentElement.style.setProperty('--text-color', theme.textColor);
    document.documentElement.style.setProperty('--primary-color', theme.primaryColor);
    document.documentElement.style.setProperty('--secondary-color', theme.secondaryColor);
    document.documentElement.style.setProperty('--font-family', theme.fontFamily);
    document.documentElement.style.setProperty('--border-radius', theme.borderRadius);
    document.documentElement.style.setProperty('--button-background-color', theme.buttonBackgroundColor);
    document.documentElement.style.setProperty('--button-text-color', theme.buttonTextColor);
    document.documentElement.style.setProperty('--link-color', theme.linkColor);
    document.documentElement.style.setProperty('--input-background-color', theme.inputBackgroundColor);
    document.documentElement.style.setProperty('--input-text-color', theme.inputTextColor);
    document.documentElement.style.setProperty('--input-border-color', theme.inputBorderColor);
  };

  return (
    <Router>
      <div style={{ backgroundColor: currentTheme.backgroundColor, color: currentTheme.textColor }}>
        <Toolbar onLogout={handleLogout} authToken={authToken} /> {/* Pass the required props */}

        {/* Adding the ChatBot component */}
        <ChatBot />

        <Routes>
          <Route path="/" element={<MainPage tasks={tasks} setTasks={setTasks} />} />
          <Route path="/category/:categoryName" element={<CategoryPage tasks={tasks} setTasks={setTasks} />} /> {/* Add the CategoryPage route */}
          <Route path="/edit/:taskId" element={<EditTask tasks={tasks} setTasks={setTasks} />} /> {/* Add the EditTask route */}
          <Route path="/settings" element={<SettingsPage onThemeChange={handleThemeChange} />} /> {/* Add the settings page route */}
          <Route path="/login" element={<LoginForm setAuthToken={(token) => setAuthToken(token)} />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;


