import React, { useEffect, useState } from 'react';

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('timemate_theme', theme);
  }, [theme]);

  useEffect(() => {
    const saved = localStorage.getItem('timemate_theme');
    if (saved === 'dark' || saved === 'light') setTheme(saved);
  }, []);

  return (
    <button
      className="btn btn-sm btn-outline absolute top-2 right-2"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle dark mode"
    >
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
};
