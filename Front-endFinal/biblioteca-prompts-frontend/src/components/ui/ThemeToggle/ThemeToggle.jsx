import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme) => {
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  return (
    <div className="theme-toggle-container">
      <button 
        className="theme-toggle" 
        onClick={toggleTheme}
        aria-label={`Mudar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
        title={`Mudar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
      >
        <div className="toggle-icon-wrapper">
          {theme === 'dark' ? (
            <Moon size={18} className="toggle-icon" />
          ) : (
            <Sun size={18} className="toggle-icon" />
          )}
        </div>
        <span className="theme-label">
          {theme === 'dark' ? 'Escuro' : 'Claro'}
        </span>
      </button>
    </div>
  );
};

export default ThemeToggle;