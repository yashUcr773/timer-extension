import React, { useState, useEffect } from "react";

const pad = (n: number) => n.toString().padStart(2, "0");
function secondsToHMS(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

const STORAGE_KEY = "timemate_countdown";

export const CountdownTimer: React.FC = () => {
  const [input, setInput] = useState("00:25:00");
  const [remaining, setRemaining] = useState(1500);
  const [running, setRunning] = useState(false);

  // Sync with background timer state
  const syncState = () => {
    // @ts-expect-error: Chrome extension APIs are available in the extension environment
    chrome.runtime.sendMessage({ type: "get_timer" }, (state) => {
      if (state) {
        setInput(state.input);
        setRemaining(state.remaining);
        setRunning(state.running);
      }
    });
  };

  useEffect(() => {
    syncState();
    // Listen for storage changes (background updates)
    // @ts-expect-error: Chrome extension APIs are available in the extension environment
    const listener = (changes, area) => {
      if (area === "local" && changes[STORAGE_KEY]) {
        syncState();
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);

  const start = () => {
    chrome.runtime.sendMessage({ type: "start" }, syncState);
  };
  const pause = () => {
    chrome.runtime.sendMessage({ type: "pause" }, syncState);
  };
  const reset = () => {
    chrome.runtime.sendMessage({ type: "reset" }, syncState);
  };
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

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-card rounded-lg shadow">
      <h2 className="text-xl font-bold">Countdown Timer</h2>
      <input
        type="text"
        value={input}
        onChange={handleInputChange}
        pattern="\\d{2}:\\d{2}:\\d{2}"
        className="input input-bordered w-32 text-center font-mono"
        aria-label="Set timer duration (HH:MM:SS)"
        disabled={running}
      />
      <div className="text-4xl font-mono tabular-nums">{secondsToHMS(remaining)}</div>
      <div className="flex gap-2">
        <button className="btn btn-primary" onClick={start} disabled={running || remaining === 0}>
          Start
        </button>
        <button className="btn btn-secondary" onClick={pause} disabled={!running}>
          Pause
        </button>
        <button className="btn btn-outline" onClick={reset}>
          Reset
        </button>
      </div>
      <button className="btn btn-accent mt-2" onClick={openAlwaysOnTop}>
        Open Always-on-Top Timer
      </button>
    </div>
  );
};
