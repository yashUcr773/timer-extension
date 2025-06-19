import React, { useEffect, useState } from "react";

// Animated bar chart for Pomodoro stats
function BarChart({ data }: { data: { date: string; pomodoros: number }[] }) {
  const max = Math.max(...data.map((d) => d.pomodoros), 1);
  return (
    <div className="flex gap-1 items-end h-24 w-full animate-fade-in">
      {data.map((d) => (
        <div key={d.date} className="flex flex-col items-center flex-1">
          <div
            className="bg-primary rounded-t w-4 transition-all duration-500"
            style={{ height: `${(d.pomodoros / max) * 100}%`, minHeight: 4 }}
            title={`${d.pomodoros} on ${d.date}`}
          ></div>
          <span className="text-xs mt-1 text-zinc-500 dark:text-zinc-400">{d.date.slice(5)}</span>
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

export const Reports: React.FC = () => {
  const [stats, setStats] = useState<{ date: string; pomodoros: number }[]>([]);
  const [quote] = useState(MOTIVATIONAL_STATS[Math.floor(Math.random() * MOTIVATIONAL_STATS.length)]);

  useEffect(() => {
    // Load stats from localStorage (or chrome.storage)
    const raw = localStorage.getItem("pomodoro_stats");
    if (raw) setStats(JSON.parse(raw));
  }, []);

  const exportCSV = () => {
    const csv = ["date,pomodoros", ...stats.map(s => `${s.date},${s.pomodoros}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pomodoro_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(stats, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pomodoro_report.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Show last 7 days
  const last7 = stats.slice(-7);

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-card rounded-lg shadow w-full max-w-xs animate-fade-in">
      <h2 className="text-xl font-bold">Reports</h2>
      <div className="italic text-xs text-center text-zinc-500 dark:text-zinc-400 mb-1 animate-fade-in">
        {quote}
      </div>
      <BarChart data={last7} />
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
