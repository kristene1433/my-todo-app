// ThemeSwitcher.js

import React, { useState } from 'react';
import themes from '../themes';

const ThemeSwitcher = ({ onThemeChange }) => {
  const [selectedTheme, setSelectedTheme] = useState('light');

  const handleThemeChange = (event) => {
    const newTheme = event.target.value;
    setSelectedTheme(newTheme);
    onThemeChange(themes[newTheme]); // Pass the selected theme to the parent component
  };

  return (
    <div>
      <label htmlFor="theme-select">Choose a theme:</label>
      <select id="theme-select" value={selectedTheme} onChange={handleThemeChange}>
        {Object.keys(themes).map((themeKey) => (
          <option key={themeKey} value={themeKey}>
            {themes[themeKey].name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ThemeSwitcher;
