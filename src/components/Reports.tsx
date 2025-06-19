import React, { useEffect, useState } from "react";

// Simple bar chart for Pomodoro stats
function BarChart({ data }: { data: { date: string; pomodoros: number }[] }) {
  const max = Math.max(...data.map((d) => d.pomodoros), 1);
  return (
    <div className="flex gap-1 items-end h-24 w-full">
      {data.map((d) => (
        <div key={d.date} className="flex flex-col items-center flex-1">
          <div
            className="bg-primary rounded-t w-4"
            style={{ height: `${(d.pomodoros / max) * 100}%` }}
            title={`${d.pomodoros} on ${d.date}`}
          ></div>
          <span className="text-xs mt-1">{d.date.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}

export const Reports: React.FC = () => {
  const [stats, setStats] = useState<{ date: string; pomodoros: number }[]>([]);

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
    <div className="flex flex-col items-center gap-4 p-4 bg-card rounded-lg shadow w-full max-w-xs">
      <h2 className="text-xl font-bold">Reports</h2>
      <BarChart data={last7} />
      <div className="flex gap-2 mt-2">
        <button className="btn btn-outline" onClick={exportCSV}>Export CSV</button>
        <button className="btn btn-outline" onClick={exportJSON}>Export JSON</button>
      </div>
    </div>
  );
};
