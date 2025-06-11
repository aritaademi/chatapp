// DarkModeToggle.js
import React from 'react';

const DarkModeToggle = ({ toggleDarkMode, isDarkMode }) => {
  return (
    <button 
      onClick={toggleDarkMode} 
      style={{
        backgroundColor: isDarkMode ? '#333' : '#f7f7f7',
        color: isDarkMode ? '#fff' : '#000',
        padding: '10px 15px',
        borderRadius: '5px',
        border: 'none',
        cursor: 'pointer'
      }}
    >
      {isDarkMode ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
};

export default DarkModeToggle;
