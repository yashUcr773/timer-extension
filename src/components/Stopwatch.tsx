import React, { useState, useRef, useEffect, useCallback } from "react";

const MOTIVATIONAL_QUOTES = [
  "Keep going, every second counts!",
  "You’re making progress!",
  "Stay sharp, stay focused!",
  "Track your best time!",
  "Every lap is a win!",
  "You’ve got this!",
  "Discipline is the bridge between goals and accomplishment.",
  "Success is the sum of small efforts repeated day in and day out.",
  "You’re building momentum!",
  "One step at a time!",
  "You’re doing better than you think!",
];
const STOPWATCH_COLOR = "#22d3ee";

export const Stopwatch: React.FC = () => {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [quoteIdx, setQuoteIdx] = useState(() => Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length));
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTick = useRef<number | null>(null);

  useEffect(() => {
    if (running) {
      lastTick.current = Date.now();
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + (Date.now() - (lastTick.current || Date.now())));
        lastTick.current = Date.now();
      }, 10);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const start = useCallback(() => setRunning(true), []);
  const pause = useCallback(() => setRunning(false), []);
  const reset = useCallback(() => {
    setRunning(false);
    setElapsed(0);
    setLaps([]);
  }, []);
  const lap = useCallback(() => setLaps((prev) => [...prev, elapsed]), [elapsed]);

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
      if (e.ctrlKey && e.shiftKey && e.code === 'KeyL') {
        lap();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [running, start, pause, reset, lap]);

  // Confetti on lap
  useEffect(() => {
    if (laps.length > 0 && laps.length % 5 === 0) {
      setShowConfetti(true);
      setQuoteIdx(Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length));
    }
  }, [laps]);
  useEffect(() => {
    if (!showConfetti) return;
    const timeout = setTimeout(() => setShowConfetti(false), 2000);
    return () => clearTimeout(timeout);
  }, [showConfetti]);

  const format = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
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

  // Progress calculation (max 1 hour for ring)
  const percent = Math.max(0, Math.min(1, elapsed / 3600000));

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-white/80 dark:bg-zinc-900/80 rounded-2xl shadow-2xl w-full max-w-xs animate-fade-in border border-zinc-200 dark:border-zinc-700 backdrop-blur-md relative">
      {/* Confetti animation */}
      {showConfetti && (
        <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center animate-fade-in">
          <span className="text-6xl select-none">🎉</span>
        </div>
      )}
      <div className="flex w-full justify-between items-center mb-1">
        <h2 className="text-xl font-bold">Stopwatch</h2>
      </div>
      {/* Motivational quote and new quote button */}
      <div className="italic text-xs text-center text-zinc-500 dark:text-zinc-400 mb-1 animate-fade-in flex items-center gap-2">
        <span>{MOTIVATIONAL_QUOTES[quoteIdx]}</span>
        <button
          className="btn btn-xs btn-ghost"
          aria-label="New motivational quote"
          title="Show another quote"
          onClick={() => setQuoteIdx(idx => (idx + 1) % MOTIVATIONAL_QUOTES.length)}
        >🔄</button>
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
            stroke={STOPWATCH_COLOR}
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
            fill={STOPWATCH_COLOR}
            style={{ transition: 'cx 0.5s linear, cy 0.5s linear, fill 0.3s' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-mono tabular-nums select-none animate-timer" aria-live="polite">{format(elapsed)}</span>
        </div>
      </div>
      {/* Controls */}
      <div className="flex gap-2">
        <button className="btn btn-primary" onClick={start} disabled={running} aria-label="Start Stopwatch" title="Start (Ctrl+Shift+S)">
          ▶️ Start
        </button>
        <button className="btn btn-secondary" onClick={pause} disabled={!running} aria-label="Pause Stopwatch" title="Pause (Ctrl+Shift+S)">
          ⏸️ Pause
        </button>
        <button className="btn btn-outline" onClick={reset} aria-label="Reset Stopwatch" title="Reset (Ctrl+Shift+R)">
          🔄 Reset
        </button>
        <button className="btn btn-accent" onClick={lap} disabled={!running} aria-label="Lap" title="Lap (Ctrl+Shift+L)">
          🏁 Lap
        </button>
      </div>
      {/* Always-on-top button */}
      <button className="btn btn-accent mt-2" onClick={openAlwaysOnTop} aria-label="Open Always-on-Top Stopwatch" title="Open Always-on-Top Stopwatch">
        📌 Always-on-Top
      </button>
      {/* Laps */}
      {laps.length > 0 && (
        <div className="w-full mt-2 max-h-32 overflow-y-auto bg-muted rounded p-2 animate-fade-in">
          <h3 className="font-semibold text-sm mb-1">Laps</h3>
          <ul className="text-sm font-mono">
            {laps.map((lap, i) => (
              <li key={i} className="flex justify-between">
                <span>Lap {i + 1}</span>
                <span>{format(lap)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
