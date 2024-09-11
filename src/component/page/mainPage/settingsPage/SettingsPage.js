import React, { useState } from 'react';
import themes from './themes'; // Adjust the import path according to your folder structure

const SettingsPage = ({ onThemeChange }) => {
  const [selectedTheme, setSelectedTheme] = useState('light');

  const handleThemeChange = (e) => {
    const newTheme = themes[e.target.value];
    setSelectedTheme(e.target.value);
    onThemeChange(newTheme);
  };

  return (
    <div>
      <h2>Settings</h2>
      <div>
        <label htmlFor="theme">Choose Theme: </label>
        <select id="theme" value={selectedTheme} onChange={handleThemeChange}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="blue">Blue</option>
          {/* Add more theme options here if you have them */}
        </select>
      </div>
    </div>
  );
};

export default SettingsPage;

