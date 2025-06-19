import React, { useState, useRef, useEffect, useCallback } from "react";

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

const MOTIVATIONAL_QUOTES = [
  "Stay focused, stay productive!",
  "You’re doing great—keep going!",
  "Small steps every day!",
  "Breaks help you grow!",
  "Progress, not perfection.",
  "One Pomodoro at a time!",
  "You’ve got this!",
];
const PRESET_PROFILES = [
  { name: "Classic", work: 25, shortBreak: 5, longBreak: 15, cycles: 4 },
  { name: "Short", work: 15, shortBreak: 3, longBreak: 10, cycles: 4 },
  { name: "Long", work: 50, shortBreak: 10, longBreak: 30, cycles: 2 },
];
const MODE_COLORS = {
  work: "#6366f1",
  shortBreak: "#22d3ee",
  longBreak: "#f59e42",
};

export const Pomodoro: React.FC = () => {
  const [config, setConfig] = useState(defaultConfig);
  const [showSettings, setShowSettings] = useState(false);
  const [mode, setMode] = useState<Mode>("work");
  const [remaining, setRemaining] = useState(config.work);
  const [running, setRunning] = useState(false);
  const [cycle, setCycle] = useState(1);
  const [stats, setStats] = useState<{ date: string; pomodoros: number }[]>([]);
  const [quote, setQuote] = useState(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
  const [showConfetti, setShowConfetti] = useState(false);
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

  const start = useCallback(() => setRunning(true), []);
  const pause = useCallback(() => setRunning(false), []);
  const reset = useCallback(() => {
    setRunning(false);
    setRemaining(config[mode]);
  }, [config, mode]);

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

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.code === 'KeyS') {
        if (running) {
          pause();
        } else {
          start();
        }
      }
      if (e.ctrlKey && e.shiftKey && e.code === 'KeyR') {
        reset();
      }
      if (e.ctrlKey && e.shiftKey && e.code === 'KeyO') {
        setShowSettings(s => !s);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [running, reset, pause, start]);

  // Confetti on Pomodoro complete
  useEffect(() => {
    if (!showConfetti) return;
    const timeout = setTimeout(() => setShowConfetti(false), 2500);
    return () => clearTimeout(timeout);
  }, [showConfetti]);

  // Show confetti and new quote on Pomodoro complete
  useEffect(() => {
    if (!running && mode === 'work' && remaining === 0) {
      setShowConfetti(true);
      setQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
    }
  }, [running, mode, remaining]);

  // Progress calculation
  const total = config[mode];
  const percent = Math.max(0, Math.min(1, remaining / total));
  const color = MODE_COLORS[mode];

  // Preset profile handler
  const applyPreset = (preset: typeof PRESET_PROFILES[number]) => {
    setConfig({
      work: preset.work * 60,
      shortBreak: preset.shortBreak * 60,
      longBreak: preset.longBreak * 60,
      cycles: preset.cycles,
      autoStart: config.autoStart,
    });
    setShowSettings(false);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-card rounded-lg shadow w-full max-w-xs relative">
      {/* Confetti animation */}
      {showConfetti && (
        <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center animate-fade-in">
          <span className="text-6xl select-none">🎉</span>
        </div>
      )}
      <div className="flex w-full justify-between items-center mb-2">
        <h2 className="text-xl font-bold">Pomodoro</h2>
        <button
          className="btn btn-sm btn-outline"
          onClick={() => setShowSettings(true)}
          aria-label="Pomodoro Settings"
          title="Settings (Ctrl+Shift+O)"
        >
          <span role="img" aria-label="settings">⚙️</span>
        </button>
      </div>
      {/* Motivational quote */}
      <div className="italic text-xs text-center text-zinc-500 dark:text-zinc-400 mb-1 animate-fade-in">
        {quote}
      </div>
      {/* Settings Modal with glassmorphism */}
      {showSettings && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          tabIndex={-1}
          aria-modal="true"
          role="dialog"
          onClick={() => setShowSettings(false)}
        >
          <form
            className="flex flex-col gap-2 w-80 bg-white/80 dark:bg-zinc-900/80 p-6 rounded-xl shadow-2xl relative border border-zinc-200 dark:border-zinc-700"
            onClick={e => e.stopPropagation()}
            onSubmit={e => e.preventDefault()}
            tabIndex={0}
            autoFocus
          >
            <button
              className="absolute top-2 right-2 btn btn-xs btn-ghost"
              onClick={() => setShowSettings(false)}
              aria-label="Close settings"
              type="button"
            >✖️</button>
            <h3 className="text-lg font-semibold mb-2">Pomodoro Settings</h3>
            <div className="flex gap-2 mb-2">
              {PRESET_PROFILES.map(preset => (
                <button
                  key={preset.name}
                  type="button"
                  className="btn btn-xs btn-outline"
                  onClick={() => applyPreset(preset)}
                  title={`Apply ${preset.name} preset`}
                >{preset.name}</button>
              ))}
            </div>
            <label className="flex flex-col text-sm">
              Work (minutes)
              <input
                type="number"
                name="work"
                min={1}
                max={120}
                value={config.work / 60}
                onChange={e => setConfig(prev => ({ ...prev, work: Number(e.target.value) * 60 }))
                }
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
                onChange={e => setConfig(prev => ({ ...prev, shortBreak: Number(e.target.value) * 60 }))
                }
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
                onChange={e => setConfig(prev => ({ ...prev, longBreak: Number(e.target.value) * 60 }))
                }
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
        </div>
      )}
      {/* Mode badges with highlight and color */}
      <div className="flex gap-2 mb-2">
        <span
          className={`badge px-3 py-1 rounded-full text-sm transition-all duration-200 ${mode === 'work' ? 'scale-110 shadow' : ''} text-white`}
          style={{ background: MODE_COLORS.work, opacity: mode === 'work' ? 1 : 0.5 }}
        >
          Work
        </span>
        <span
          className={`badge px-3 py-1 rounded-full text-sm transition-all duration-200 ${mode === 'shortBreak' ? 'scale-110 shadow' : ''} text-white`}
          style={{ background: MODE_COLORS.shortBreak, opacity: mode === 'shortBreak' ? 1 : 0.5 }}
        >
          Short Break
        </span>
        <span
          className={`badge px-3 py-1 rounded-full text-sm transition-all duration-200 ${mode === 'longBreak' ? 'scale-110 shadow' : ''} text-white`}
          style={{ background: MODE_COLORS.longBreak, opacity: mode === 'longBreak' ? 1 : 0.5 }}
        >
          Long Break
        </span>
      </div>
      {/* Animated Progress ring with moving indicator */}
      <div className="relative flex items-center justify-center my-2">
        <svg width="120" height="120" className="block">
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="10"
          />
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={2 * Math.PI * 54}
            strokeDashoffset={(1 - percent) * 2 * Math.PI * 54}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s linear, stroke 0.3s' }}
          />
          {/* Moving indicator dot */}
          <circle
            cx={60 + 54 * Math.sin(2 * Math.PI * (1 - percent))}
            cy={60 - 54 * Math.cos(2 * Math.PI * (1 - percent))}
            r="6"
            fill={color}
            style={{ transition: 'cx 0.5s linear, cy 0.5s linear, fill 0.3s' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-mono tabular-nums select-none animate-timer" aria-live="polite">{secondsToHMS(remaining)}</span>
        </div>
      </div>
      {/* Controls */}
      <div className="flex gap-2">
        <button className="btn btn-primary" onClick={start} disabled={running} aria-label="Start Pomodoro" title="Start (Ctrl+Shift+S)">
          ▶️ Start
        </button>
        <button className="btn btn-secondary" onClick={pause} disabled={!running} aria-label="Pause Pomodoro" title="Pause (Ctrl+Shift+S)">
          ⏸️ Pause
        </button>
        <button className="btn btn-outline" onClick={reset} aria-label="Reset Pomodoro" title="Reset (Ctrl+Shift+R)">
          🔄 Reset
        </button>
      </div>
      {/* Always-on-top button */}
      <button className="btn btn-accent mt-2" onClick={openAlwaysOnTop} aria-label="Open Always-on-Top Pomodoro" title="Open Always-on-Top Pomodoro">
        📌 Always-on-Top
      </button>
      {/* Cycle indicator */}
      <div className="flex items-center gap-1 mt-2" aria-label={`Cycle ${cycle} of ${config.cycles}`} title="Pomodoro Cycles">
        {Array.from({ length: config.cycles }).map((_, i) => (
          <span
            key={i}
            className={`inline-block w-3 h-3 rounded-full ${i < cycle ? 'bg-primary' : 'bg-zinc-300 dark:bg-zinc-700'} transition-all`}
          />
        ))}
        <span className="ml-2 text-xs text-zinc-500">Cycle {cycle} / {config.cycles}</span>
      </div>
      {/* Stats */}
      <div className="w-full mt-2">
        <h3 className="font-semibold text-sm mb-1">Today's Pomodoros</h3>
        <div className="text-center text-lg font-mono">{stats.find(s => s.date === new Date().toISOString().slice(0, 10))?.pomodoros || 0}</div>
      </div>
    </div>
  );
};
