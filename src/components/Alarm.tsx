import React, { useState, useEffect, useRef } from "react";

const pad = (n: number) => n.toString().padStart(2, "0");
function getTimeString(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export const Alarm: React.FC = () => {
  const [alarms, setAlarms] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [now, setNow] = useState(getTimeString(new Date()));
  const alarmedRef = useRef<Set<string>>(new Set());

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => setNow(getTimeString(new Date())), 1000);
    return () => clearInterval(interval);
  }, []);

  // Check alarms
  useEffect(() => {
    alarms.forEach(time => {
      if (time === now && !alarmedRef.current.has(time)) {
        // Notify user
        if (window.Notification && Notification.permission === "granted") {
          new Notification("⏰ Alarm!", { body: `It's ${time}` });
        } else if (window.Notification && Notification.permission !== "denied") {
          Notification.requestPermission().then(permission => {
            if (permission === "granted") {
              new Notification("⏰ Alarm!", { body: `It's ${time}` });
            }
          });
        }
        if ("vibrate" in navigator) navigator.vibrate?.(500);
        alarmedRef.current.add(time);
      }
      if (time !== now) alarmedRef.current.delete(time);
    });
  }, [now, alarms]);

  const addAlarm = () => {
    if (/^\d{2}:\d{2}$/.test(input) && !alarms.includes(input)) {
      setAlarms([...alarms, input]);
      setInput("");
    }
  };
  const removeAlarm = (time: string) => setAlarms(alarms.filter(a => a !== time));

  return (
    <div className="flex flex-col gap-4 p-4 bg-white/80 dark:bg-zinc-900/80 rounded-2xl shadow-2xl w-full max-w-xs animate-fade-in border border-zinc-200 dark:border-zinc-700 backdrop-blur-md">
      <h2 className="text-xl font-bold flex items-center gap-2">Alarm <span className="text-lg">⏰</span></h2>
      <div className="text-center text-2xl font-mono mb-2">Current: {now}</div>
      <form className="flex gap-2 mb-2" onSubmit={e => { e.preventDefault(); addAlarm(); }}>
        <input
          type="time"
          value={input}
          onChange={e => setInput(e.target.value)}
          className="input input-bordered font-mono"
          aria-label="Set alarm time"
          required
        />
        <button className="btn btn-primary" type="submit" aria-label="Add alarm" title="Add alarm">➕</button>
      </form>
      <div className="flex flex-col gap-1">
        {alarms.length === 0 && <div className="text-xs text-zinc-400 italic text-center py-2">No alarms set.</div>}
        {alarms.map(time => (
          <div key={time} className="flex items-center gap-2 p-2 rounded bg-muted/60 animate-fade-in">
            <span className="font-mono text-lg flex-1">{time}</span>
            <button className="btn btn-xs btn-ghost" onClick={() => removeAlarm(time)} aria-label={`Delete alarm ${time}`} title={`Delete alarm ${time}`}>🗑️</button>
          </div>
        ))}
      </div>
      <div className="w-full text-xs text-zinc-400 text-center mt-2">
        <span>Alarm will notify you when the time matches. Keep this tab open.</span>
      </div>
    </div>
  );
};
