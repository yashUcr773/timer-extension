import React, { useState, useRef, useEffect } from "react";

export const Stopwatch: React.FC = () => {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
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

  const start = () => setRunning(true);
  const pause = () => setRunning(false);
  const reset = () => {
    setRunning(false);
    setElapsed(0);
    setLaps([]);
  };
  const lap = () => setLaps((prev) => [...prev, elapsed]);

  const format = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-card rounded-lg shadow">
      <h2 className="text-xl font-bold">Stopwatch</h2>
      <div className="text-4xl font-mono tabular-nums">{format(elapsed)}</div>
      <div className="flex gap-2">
        <button className="btn btn-primary" onClick={start} disabled={running}>Start</button>
        <button className="btn btn-secondary" onClick={pause} disabled={!running}>Pause</button>
        <button className="btn btn-outline" onClick={reset}>Reset</button>
        <button className="btn btn-accent" onClick={lap} disabled={!running}>Lap</button>
      </div>
      {laps.length > 0 && (
        <div className="w-full mt-2">
          <h3 className="font-semibold">Laps</h3>
          <ul className="text-sm font-mono max-h-32 overflow-y-auto">
            {laps.map((lap, i) => (
              <li key={i}>Lap {i + 1}: {format(lap)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
