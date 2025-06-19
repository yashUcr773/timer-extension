import React, { useState, useEffect, useCallback } from "react";

const pad = (n: number) => n.toString().padStart(2, "0");
function secondsToHMS(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

const STORAGE_KEY = "timemate_countdown";
const MOTIVATIONAL_QUOTES = [
  "Stay focused, stay productive!",
  "You’re doing great—keep going!",
  "Small steps every day!",
  "Breaks help you grow!",
  "Progress, not perfection.",
  "One session at a time!",
  "You’ve got this!",
];
const PRESET_PROFILES = [
  { name: "25 min", duration: "00:25:00" },
  { name: "15 min", duration: "00:15:00" },
  { name: "5 min", duration: "00:05:00" },
];
const TIMER_COLOR = "#6366f1";

export const CountdownTimer: React.FC<{ initialDuration?: string | null }> = ({ initialDuration }) => {
  const [input, setInput] = useState(initialDuration || "00:25:00");
  const [remaining, setRemaining] = useState(1500);
  const [running, setRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [quote, setQuote] = useState(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);

  // Sync with background timer state
  const syncState = useCallback(() => {
    chrome.runtime.sendMessage({ type: "get_timer" }, (state: { input: string; remaining: number; running: boolean }) => {
      if (state) {
        setInput(state.input);
        setRemaining(state.remaining);
        setRunning(state.running);
      }
    });
  }, []);

  useEffect(() => {
    if (initialDuration) {
      setInput(initialDuration);
      chrome.runtime.sendMessage({ type: "set_input", input: initialDuration }, syncState);
    }
    syncState();
    // Listen for storage changes (background updates)
    const listener = (changes: Record<string, unknown>, area: string) => {
      if (area === "local" && changes[STORAGE_KEY]) {
        syncState();
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }, [initialDuration, syncState]);

  const start = useCallback(() => {
    chrome.runtime.sendMessage({ type: "start" }, syncState);
  }, [syncState]);
  const pause = useCallback(() => {
    chrome.runtime.sendMessage({ type: "pause" }, syncState);
  }, [syncState]);
  const reset = useCallback(() => {
    chrome.runtime.sendMessage({ type: "reset" }, syncState);
  }, [syncState]);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    chrome.runtime.sendMessage({ type: "set_input", input: value }, syncState);
  };

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
  }, [running, start, pause, reset]);

  // Confetti on timer complete
  useEffect(() => {
    if (!running && remaining === 0) {
      setShowConfetti(true);
      setQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
    }
  }, [running, remaining]);
  useEffect(() => {
    if (!showConfetti) return;
    const timeout = setTimeout(() => setShowConfetti(false), 2500);
    return () => clearTimeout(timeout);
  }, [showConfetti]);

  // Progress calculation
  const total = (() => {
    const [h, m, s] = input.split(":").map(Number);
    return h * 3600 + m * 60 + s;
  })();
  const percent = Math.max(0, Math.min(1, remaining / (total || 1)));

  // Preset profile handler
  const applyPreset = (preset: typeof PRESET_PROFILES[number]) => {
    setInput(preset.duration);
    chrome.runtime.sendMessage({ type: "set_input", input: preset.duration }, syncState);
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
        <h2 className="text-xl font-bold">Countdown Timer</h2>
        <button
          className="btn btn-sm btn-outline"
          onClick={() => setShowSettings(true)}
          aria-label="Timer Settings"
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
            <h3 className="text-lg font-semibold mb-2">Timer Settings</h3>
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
              Duration (HH:MM:SS)
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                pattern="\\d{2}:\\d{2}:\\d{2}"
                className="input input-bordered w-32 text-center font-mono"
                aria-label="Set timer duration (HH:MM:SS)"
                disabled={running}
              />
            </label>
          </form>
        </div>
      )}
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
            stroke={TIMER_COLOR}
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
            fill={TIMER_COLOR}
            style={{ transition: 'cx 0.5s linear, cy 0.5s linear, fill 0.3s' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-mono tabular-nums select-none animate-timer" aria-live="polite">{secondsToHMS(remaining)}</span>
        </div>
      </div>
      {/* Controls */}
      <div className="flex gap-2">
        <button className="btn btn-primary" onClick={start} disabled={running || remaining === 0} aria-label="Start Timer" title="Start (Ctrl+Shift+S)">
          ▶️ Start
        </button>
        <button className="btn btn-secondary" onClick={pause} disabled={!running} aria-label="Pause Timer" title="Pause (Ctrl+Shift+S)">
          ⏸️ Pause
        </button>
        <button className="btn btn-outline" onClick={reset} aria-label="Reset Timer" title="Reset (Ctrl+Shift+R)">
          🔄 Reset
        </button>
      </div>
      {/* Always-on-top button */}
      <button className="btn btn-accent mt-2" onClick={openAlwaysOnTop} aria-label="Open Always-on-Top Timer" title="Open Always-on-Top Timer">
        📌 Always-on-Top
      </button>
    </div>
  );
};
