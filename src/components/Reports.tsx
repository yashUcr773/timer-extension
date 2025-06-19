import React, { useEffect, useState } from "react";

// Animated bar chart for Pomodoro stats
function BarChart({ data }: { data: { date: string; pomodoros: number }[] }) {
  const max = Math.max(...data.map((d) => d.pomodoros), 1);
  return (
    <div className="flex gap-1 items-end h-28 w-full animate-fade-in">
      {data.map((d) => (
        <div key={d.date} className="flex flex-col items-center flex-1 group">
          <div
            className="bg-gradient-to-t from-primary to-indigo-400 rounded-t w-5 transition-all duration-700 group-hover:scale-105 group-hover:shadow-lg"
            style={{ height: `${(d.pomodoros / max) * 100}%`, minHeight: 4 }}
            title={`${d.pomodoros} on ${d.date}`}
          ></div>
          <span className="text-[10px] mt-1 text-zinc-500 dark:text-zinc-400 select-none">{d.date.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}

const MOTIVATIONAL_STATS = [
  "Consistency is key!",
  "Great job tracking your focus!",
  "Every Pomodoro counts!",
  "Keep up the momentum!",
  "Review, reflect, improve!",
  "Your future self will thank you!",
  "Progress is progress, no matter how small.",
  "Celebrate your wins, learn from your lapses.",
  "Discipline is the bridge between goals and accomplishment.",
  "You’re building a powerful habit!",
  "Stay curious, stay productive!",
  "Success is the sum of small efforts repeated day in and day out.",
  "You’re one Pomodoro closer to your goals!",
  "Track, reflect, and grow every day!",
  "Focus on the process, not just the outcome.",
  "Small actions, big results.",
  "You are your only limit.",
  "The secret of getting ahead is getting started.",
  "Don’t watch the clock; do what it does. Keep going.",
  "Productivity is never an accident.",
  "The best way to get something done is to begin.",
  "Your habits shape your future.",
  "Every day is a chance to improve.",
  "You’re making your time count!",
  "Stay positive, work hard, make it happen.",
  "You’re closer than you think!",
  "Keep showing up for yourself!",
  "You’re building momentum!",
  "One step at a time!",
  "You’re doing better than you think!",
];

const RANGE_OPTIONS = [
  { label: "Last 7 days", value: 7 },
  { label: "Last 14 days", value: 14 },
  { label: "Last 30 days", value: 30 },
  { label: "All", value: 0 },
];

export const Reports: React.FC = () => {
  const [stats, setStats] = useState<{ date: string; pomodoros: number }[]>([]);
  const [quoteIdx, setQuoteIdx] = useState(() => Math.floor(Math.random() * MOTIVATIONAL_STATS.length));
  const [range, setRange] = useState<number>(7);

  useEffect(() => {
    // Load stats from localStorage (or chrome.storage)
    const raw = localStorage.getItem("pomodoro_stats");
    if (raw) setStats(JSON.parse(raw));
  }, []);

  // Filtered data for selected range
  const data = range === 0 ? stats : stats.slice(-range);
  // Summary stats
  const total = data.reduce((sum, d) => sum + d.pomodoros, 0);
  const best = data.reduce((max, d) => Math.max(max, d.pomodoros), 0);
  const avg = data.length ? (total / data.length).toFixed(1) : 0;
  const bestDay = data.find(d => d.pomodoros === best)?.date;

  const exportCSV = () => {
    const csv = ["date,pomodoros", ...data.map(s => `${s.date},${s.pomodoros}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pomodoro_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pomodoro_report.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-white/80 dark:bg-zinc-900/80 rounded-2xl shadow-2xl w-full max-w-xs animate-fade-in border border-zinc-200 dark:border-zinc-700 backdrop-blur-md">
      {/* Card header */}
      <div className="flex items-center gap-2 w-full mb-1">
        <span className="text-2xl">📊</span>
        <h2 className="text-xl font-bold flex-1">Reports</h2>
        <select
          className="input input-sm input-bordered text-xs"
          value={range}
          onChange={e => setRange(Number(e.target.value))}
          aria-label="Select time range"
        >
          {RANGE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      {/* Motivational quote and new quote button */}
      <div className="italic text-xs text-center text-zinc-500 dark:text-zinc-400 mb-1 animate-fade-in flex items-center gap-2">
        <span>{MOTIVATIONAL_STATS[quoteIdx]}</span>
        <button
          className="btn btn-xs btn-ghost"
          aria-label="New motivational quote"
          title="Show another quote"
          onClick={() => setQuoteIdx(idx => (idx + 1) % MOTIVATIONAL_STATS.length)}
        >🔄</button>
      </div>
      {/* Bar chart */}
      <BarChart data={data} />
      {/* Summary stats */}
      <div className="flex flex-col gap-1 w-full text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-100/60 dark:bg-zinc-800/60 rounded p-2 mt-1 animate-fade-in">
        <div>Total Pomodoros: <span className="font-bold text-primary">{total}</span></div>
        <div>Best Day: <span className="font-bold">{bestDay || '-'}</span> <span className="ml-2">({best} sessions)</span></div>
        <div>Average/Day: <span className="font-bold">{avg}</span></div>
      </div>
      {/* Export buttons */}
      <div className="flex gap-2 mt-2">
        <button className="btn btn-outline" onClick={exportCSV} aria-label="Export as CSV" title="Export as CSV">
          📄 Export CSV
        </button>
        <button className="btn btn-outline" onClick={exportJSON} aria-label="Export as JSON" title="Export as JSON">
          🗂️ Export JSON
        </button>
      </div>
      <div className="w-full text-xs text-zinc-400 text-center mt-2">
        <span>Tip: Review your stats weekly for best results!</span>
      </div>
    </div>
  );
};
