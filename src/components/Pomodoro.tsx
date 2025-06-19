import React, { useState, useRef, useEffect } from "react";

const defaultConfig = {
  work: 25 * 60, // 25 min
  shortBreak: 5 * 60, // 5 min
  longBreak: 15 * 60, // 15 min
  cycles: 4,
  autoStart: false,
};

const pad = (n: number) => n.toString().padStart(2, "0");
function secondsToHMS(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${pad(m)}:${pad(s)}`;
}

type Mode = "work" | "shortBreak" | "longBreak";

export const Pomodoro: React.FC = () => {
  const [config, setConfig] = useState(defaultConfig);
  const [showSettings, setShowSettings] = useState(false);
  const [mode, setMode] = useState<Mode>("work");
  const [remaining, setRemaining] = useState(config.work);
  const [running, setRunning] = useState(false);
  const [cycle, setCycle] = useState(1);
  const [stats, setStats] = useState<{ date: string; pomodoros: number }[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load config from chrome.storage.sync
  useEffect(() => {
    chrome.storage.sync.get(["pomodoroConfig"], (result: { pomodoroConfig?: typeof defaultConfig }) => {
      if (result.pomodoroConfig) {
        setConfig(result.pomodoroConfig);
      }
    });
  }, []);

  // Save config to chrome.storage.sync when changed
  useEffect(() => {
    chrome.storage.sync.set({ pomodoroConfig: config });
  }, [config]);

  useEffect(() => { setRemaining(config[mode]); }, [mode, config]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            if (mode === "work") {
              // Log pomodoro
              const today = new Date().toISOString().slice(0, 10);
              setStats((prev) => {
                const found = prev.find((s) => s.date === today);
                if (found) return prev.map((s) => s.date === today ? { ...s, pomodoros: s.pomodoros + 1 } : s);
                return [...prev, { date: today, pomodoros: 1 }];
              });
            }
            // Auto-switch mode
            if (mode === "work") {
              if (cycle % config.cycles === 0) {
                setMode("longBreak");
              } else {
                setMode("shortBreak");
              }
            } else {
              setMode("work");
              setCycle((c) => (mode === "longBreak" ? 1 : c + 1));
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, mode, config, cycle]);

  const start = () => setRunning(true);
  const pause = () => setRunning(false);
  const reset = () => { setRunning(false); setRemaining(config[mode]); };

  // Always-on-top window
  const openAlwaysOnTop = () => {
    chrome.windows.create({
      url: chrome.runtime.getURL("popup.html"),
      type: "popup",
      width: 360,
      height: 500,
      focused: true,
    });
  };

  // Settings form handlers
  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
    setConfig((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : Number(value),
    }));
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-card rounded-lg shadow w-full max-w-xs">
      <h2 className="text-xl font-bold">Pomodoro</h2>
      <button
        className="btn btn-sm btn-outline self-end"
        onClick={() => setShowSettings((s) => !s)}
        aria-label="Pomodoro Settings"
      >
        ⚙️
      </button>
      {showSettings && (
        <form
          className="flex flex-col gap-2 w-full bg-muted p-3 rounded mb-2"
          onSubmit={(e) => e.preventDefault()}
        >
          <label className="flex flex-col text-sm">
            Work (minutes)
            <input
              type="number"
              name="work"
              min={1}
              max={120}
              value={config.work / 60}
              onChange={(e) => setConfig((prev) => ({ ...prev, work: Number(e.target.value) * 60 }))}
              className="input input-bordered"
            />
          </label>
          <label className="flex flex-col text-sm">
            Short Break (minutes)
            <input
              type="number"
              name="shortBreak"
              min={1}
              max={60}
              value={config.shortBreak / 60}
              onChange={(e) => setConfig((prev) => ({ ...prev, shortBreak: Number(e.target.value) * 60 }))}
              className="input input-bordered"
            />
          </label>
          <label className="flex flex-col text-sm">
            Long Break (minutes)
            <input
              type="number"
              name="longBreak"
              min={1}
              max={60}
              value={config.longBreak / 60}
              onChange={(e) => setConfig((prev) => ({ ...prev, longBreak: Number(e.target.value) * 60 }))}
              className="input input-bordered"
            />
          </label>
          <label className="flex flex-col text-sm">
            Cycles
            <input
              type="number"
              name="cycles"
              min={1}
              max={10}
              value={config.cycles}
              onChange={handleConfigChange}
              className="input input-bordered"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="autoStart"
              checked={config.autoStart}
              onChange={handleConfigChange}
              className="checkbox"
            />
            Auto Start Next Session
          </label>
        </form>
      )}
      <div className="flex gap-2 mb-2">
        <span className={`badge ${mode === 'work' ? 'badge-primary' : ''}`}>Work</span>
        <span className={`badge ${mode === 'shortBreak' ? 'badge-secondary' : ''}`}>Short Break</span>
        <span className={`badge ${mode === 'longBreak' ? 'badge-accent' : ''}`}>Long Break</span>
      </div>
      <div className="text-4xl font-mono tabular-nums">{secondsToHMS(remaining)}</div>
      <div className="flex gap-2">
        <button className="btn btn-primary" onClick={start} disabled={running}>Start</button>
        <button className="btn btn-secondary" onClick={pause} disabled={!running}>Pause</button>
        <button className="btn btn-outline" onClick={reset}>Reset</button>
      </div>
      <button className="btn btn-accent mt-2" onClick={openAlwaysOnTop} aria-label="Open Always-on-Top Pomodoro">
        Open Always-on-Top Pomodoro
      </button>
      <div className="text-sm mt-2">Cycle: {cycle} / {config.cycles}</div>
      <div className="w-full mt-2">
        <h3 className="font-semibold">Today's Pomodoros</h3>
        <div className="text-center">{stats.find(s => s.date === new Date().toISOString().slice(0, 10))?.pomodoros || 0}</div>
      </div>
    </div>
  );
};
