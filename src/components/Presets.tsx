import React, { useState, useEffect } from "react";

interface Preset {
  id: string;
  name: string;
  color: string;
  duration: string; // HH:MM:SS
}

const presetColors = [
  "#f87171", // red
  "#60a5fa", // blue
  "#34d399", // green
  "#fbbf24", // yellow
  "#a78bfa", // purple
  "#f472b6", // pink
];

function getStorage() {
  return chrome?.storage?.sync || chrome?.storage?.local;
}

export const Presets: React.FC<{ onSelect: (preset: Preset) => void }> = ({ onSelect }) => {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("00:25:00");
  const [color, setColor] = useState(presetColors[0]);

  useEffect(() => {
    const storage = getStorage();
    if (storage) {
      storage.get(["timer_presets"], (result: Record<string, Preset[]>) => {
        if (result["timer_presets"]) setPresets(result["timer_presets"]);
      });
    }
  }, []);

  const savePreset = () => {
    if (!name.trim()) return;
    const newPreset = { id: Date.now().toString(), name, color, duration };
    const updated = [...presets, newPreset];
    setPresets(updated);
    const storage = getStorage();
    if (storage) storage.set({ "timer_presets": updated });
    setName("");
    setDuration("00:25:00");
    setColor(presetColors[0]);
  };

  const removePreset = (id: string) => {
    const updated = presets.filter((p) => p.id !== id);
    setPresets(updated);
    const storage = getStorage();
    if (storage) storage.set({ "timer_presets": updated });
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-card rounded-lg shadow w-full max-w-xs">
      <h2 className="text-xl font-bold">Presets</h2>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="input input-bordered w-24"
        />
        <input
          type="text"
          placeholder="HH:MM:SS"
          value={duration}
          onChange={e => setDuration(e.target.value)}
          className="input input-bordered w-24 font-mono"
        />
        <select value={color} onChange={e => setColor(e.target.value)} className="input input-bordered w-16">
          {presetColors.map(c => <option key={c} value={c} style={{ background: c }}>{c}</option>)}
        </select>
        <button className="btn btn-primary" onClick={savePreset}>Save</button>
      </div>
      <div className="flex flex-col gap-2">
        {presets.map(preset => (
          <div key={preset.id} className="flex items-center gap-2">
            <button
              className="btn btn-sm flex-1"
              style={{ background: preset.color, color: '#fff' }}
              onClick={() => onSelect(preset)}
            >
              {preset.name} ({preset.duration})
            </button>
            <button className="btn btn-xs btn-outline" onClick={() => removePreset(preset.id)}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
};
