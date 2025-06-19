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

  // Add random color button
  const pickRandomColor = () => {
    const idx = Math.floor(Math.random() * presetColors.length);
    setColor(presetColors[idx]);
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-white/80 dark:bg-zinc-900/80 rounded-2xl shadow-2xl w-full max-w-xs animate-fade-in border border-zinc-200 dark:border-zinc-700 backdrop-blur-md">
      <h2 className="text-xl font-bold flex items-center gap-2">Presets <span className="text-lg">🎨</span></h2>
      <form className="flex flex-col gap-2 mb-2" onSubmit={e => { e.preventDefault(); savePreset(); }}>
        <label className="flex flex-col text-sm">
          Name
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="input input-bordered"
            maxLength={20}
            required
            aria-label="Preset name"
          />
        </label>
        <label className="flex flex-col text-sm">
          Duration (HH:MM:SS)
          <input
            type="text"
            value={duration}
            onChange={e => setDuration(e.target.value)}
            pattern="\\d{2}:\\d{2}:\\d{2}"
            className="input input-bordered font-mono"
            required
            aria-label="Preset duration"
          />
        </label>
        <label className="flex flex-col text-sm">
          Color
          <div className="flex gap-1 mt-1 items-center">
            {presetColors.map(c => (
              <button
                key={c}
                type="button"
                className={`w-6 h-6 rounded-full border-2 ${color === c ? 'border-black dark:border-white scale-110 ring-2 ring-primary' : 'border-transparent'} transition-all`}
                style={{ background: c }}
                onClick={() => setColor(c)}
                aria-label={`Select color ${c}`}
                title={`Select color ${c}`}
              />
            ))}
            <button
              type="button"
              className="btn btn-xs btn-outline ml-2"
              onClick={pickRandomColor}
              aria-label="Pick random color"
              title="Pick random color"
            >🎲</button>
          </div>
        </label>
        <button className="btn btn-primary mt-2" type="submit" aria-label="Save preset" title="Save preset">
          💾 Save Preset
        </button>
      </form>
      <div className="flex flex-col gap-2">
        {presets.length === 0 && <div className="text-xs text-zinc-400 italic text-center py-4">No presets yet. Add your favorite timer setups!</div>}
        {presets.map(preset => (
          <div
            key={preset.id}
            className="flex items-center gap-2 p-2 rounded bg-muted/60 animate-fade-in border-l-4"
            style={{ borderColor: preset.color }}
          >
            <button
              className="flex-1 text-left font-semibold"
              style={{ color: preset.color }}
              onClick={() => onSelect(preset)}
              aria-label={`Use preset ${preset.name}`}
              title={`Use preset ${preset.name}`}
            >
              {preset.name} <span className="ml-2 font-mono text-xs text-zinc-500">{preset.duration}</span>
            </button>
            <button
              className="btn btn-xs btn-ghost"
              onClick={() => removePreset(preset.id)}
              aria-label={`Delete preset ${preset.name}`}
              title={`Delete preset ${preset.name}`}
            >🗑️</button>
          </div>
        ))}
      </div>
    </div>
  );
};
