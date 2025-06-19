import React, { useState } from "react";
import { CountdownTimer } from "./CountdownTimer";
import { Stopwatch } from "./Stopwatch";
import { Pomodoro } from "./Pomodoro";

const timerTypes = ["timer", "stopwatch", "pomodoro"] as const;
type TimerType = typeof timerTypes[number];

interface TimerTab {
  id: string;
  type: TimerType;
  name: string;
  initialDuration?: string | null;
}

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
    <div className="w-full max-w-md mx-auto">
      <div className="flex gap-1 mb-2">
        {tabs.map(tab => (
          <div key={tab.id} className={`flex items-center px-2 py-1 rounded cursor-pointer ${active === tab.id ? 'bg-primary text-white' : 'bg-muted'}`}
            onClick={() => setActive(tab.id)}>
            <input
              className="bg-transparent border-none w-20 font-bold text-center outline-none"
              value={tab.name}
              onChange={e => renameTab(tab.id, e.target.value)}
            />
            {tabs.length > 1 && (
              <button className="ml-1 text-xs" onClick={e => { e.stopPropagation(); closeTab(tab.id); }}>✕</button>
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
          <div key={tab.id} style={{ display: tab.id === active ? 'block' : 'none' }}>
            {tab.type === 'timer' && <CountdownTimer initialDuration={tab.initialDuration} />}
            {tab.type === 'stopwatch' && <Stopwatch />}
            {tab.type === 'pomodoro' && <Pomodoro />}
          </div>
        ))}
      </div>
    </div>
  );
};
