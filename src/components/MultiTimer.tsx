import React, { useState, useRef } from "react";
import { CountdownTimer } from "./CountdownTimer";
import { Stopwatch } from "./Stopwatch";
import { Pomodoro } from "./Pomodoro";

type TimerType = "timer" | "stopwatch" | "pomodoro";

interface TimerTab {
  id: string;
  type: TimerType;
  name: string;
  initialDuration?: string | null;
}

const TAB_COLORS: Record<TimerType, string> = {
  timer: "#6366f1",
  stopwatch: "#22d3ee",
  pomodoro: "#f59e42",
};

export const MultiTimer: React.FC = () => {
  const [tabs, setTabs] = useState<TimerTab[]>([
    { id: "main", type: "timer", name: "Timer 1" },
  ]);
  const [active, setActive] = useState("main");
  const tabListRef = useRef<HTMLDivElement>(null);

  const addTab = (type: TimerType) => {
    const id = Date.now().toString();
    setTabs((prev) => [...prev, { id, type, name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${prev.length + 1}` }]);
    setActive(id);
  };
  const closeTab = (id: string) => {
    setTabs((prev) => prev.filter((t) => t.id !== id));
    if (active === id && tabs.length > 1) setActive(tabs[0].id);
  };
  const renameTab = (id: string, name: string) => {
    setTabs((prev) => prev.map((t) => t.id === id ? { ...t, name } : t));
  };

  // Keyboard navigation for tabs
  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, idx: number) => {
    if (!tabListRef.current) return;
    const tabEls = Array.from(tabListRef.current.querySelectorAll('[role="tab"]'));
    if (e.key === 'ArrowRight') {
      (tabEls[(idx + 1) % tabEls.length] as HTMLElement).focus();
    } else if (e.key === 'ArrowLeft') {
      (tabEls[(idx - 1 + tabEls.length) % tabEls.length] as HTMLElement).focus();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in bg-white/80 dark:bg-zinc-900/80 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 backdrop-blur-md p-2">
      <div className="flex gap-1 mb-2 overflow-x-auto relative" ref={tabListRef}>
        {tabs.map((tab, idx) => (
          <div
            key={tab.id}
            role="tab"
            tabIndex={0}
            className={`flex items-center px-2 py-1 rounded cursor-pointer transition-all duration-200 relative ${active === tab.id ? 'shadow-lg scale-105' : ''}`}
            style={{ background: active === tab.id ? TAB_COLORS[tab.type] : '#f3f4f6', color: active === tab.id ? '#fff' : '#222' }}
            onClick={() => setActive(tab.id)}
            onKeyDown={e => handleTabKeyDown(e, idx)}
            aria-label={`Tab: ${tab.name}`}
          >
            <input
              className="bg-transparent border-none w-20 font-bold text-center outline-none"
              value={tab.name}
              onChange={e => renameTab(tab.id, e.target.value)}
              aria-label={`Rename ${tab.name}`}
            />
            {tabs.length > 1 && (
              <button className="ml-1 text-xs" onClick={e => { e.stopPropagation(); closeTab(tab.id); }} aria-label={`Close ${tab.name}`} title={`Close ${tab.name}`}>×</button>
            )}
            {/* Animated underline */}
            {active === tab.id && (
              <span className="absolute left-0 right-0 -bottom-1 h-1 rounded-b bg-primary animate-fade-in" />
            )}
          </div>
        ))}
        <div className="flex gap-1 ml-2">
          <button className="btn btn-xs btn-outline" onClick={() => addTab("timer")}>+Timer</button>
          <button className="btn btn-xs btn-outline" onClick={() => addTab("stopwatch")}>+Stopwatch</button>
          <button className="btn btn-xs btn-outline" onClick={() => addTab("pomodoro")}>+Pomodoro</button>
        </div>
      </div>
      <div className="mt-2">
        {tabs.map(tab => (
          <div key={tab.id} style={{ display: tab.id === active ? 'block' : 'none' }} className="animate-fade-in">
            {tab.type === 'timer' && <CountdownTimer initialDuration={tab.initialDuration} />}
            {tab.type === 'stopwatch' && <Stopwatch />}
            {tab.type === 'pomodoro' && <Pomodoro />}
          </div>
        ))}
      </div>
    </div>
  );
};
