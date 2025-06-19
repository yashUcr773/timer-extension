import React, { useEffect, useState, useRef } from 'react';

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  });
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('timemate_theme', theme);
  }, [theme]);

  useEffect(() => {
    const saved = localStorage.getItem('timemate_theme');
    if (saved === 'dark' || saved === 'light') setTheme(saved);
  }, []);

  // Tooltip follows mouse
  const handleMouseMove = (e: React.MouseEvent) => {
    setTooltip({ x: e.clientX, y: e.clientY });
  };
  const handleMouseLeave = () => setTooltip(null);

  return (
    <>
      <button
        ref={btnRef}
        className="btn btn-sm btn-outline absolute top-2 right-2 transition-all duration-200 focus:ring-2 focus:ring-primary focus:outline-none focus:shadow-[0_0_8px_2px_rgba(99,102,241,0.5)] shadow-none"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        aria-label="Toggle dark mode"
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setTheme(theme === 'dark' ? 'light' : 'dark'); }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <span className="text-xl transition-all duration-200 animate-fade-in">
          {theme === 'dark' ? '🌙' : '☀️'}
        </span>
      </button>
      {tooltip && (
        <div
          className="fixed z-50 px-2 py-1 rounded bg-zinc-800 text-white text-xs shadow-lg pointer-events-none animate-fade-in"
          style={{ left: tooltip.x + 12, top: tooltip.y + 8 }}
        >
          {theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        </div>
      )}
    </>
  );
};
