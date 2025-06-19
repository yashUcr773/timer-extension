import React, { useState } from "react";
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

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <div className="flex gap-1 mb-2 overflow-x-auto">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`flex items-center px-2 py-1 rounded cursor-pointer transition-all duration-200 ${active === tab.id ? 'shadow-lg scale-105' : ''}`}
            style={{ background: active === tab.id ? TAB_COLORS[tab.type] : '#f3f4f6', color: active === tab.id ? '#fff' : '#222' }}
            onClick={() => setActive(tab.id)}
            title={`Switch to ${tab.name}`}
            tabIndex={0}
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
