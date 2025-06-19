import './App.css'
import { CountdownTimer } from './components/CountdownTimer'
import { Stopwatch } from './components/Stopwatch'
import { Pomodoro } from './components/Pomodoro'
import { Reports } from './components/Reports'
import { Presets } from './components/Presets'
import { MultiTimer } from './components/MultiTimer'
import { ThemeToggle } from './components/ThemeToggle'
import { Alarm } from './components/Alarm'
import { useState, useEffect } from 'react'

function App() {
  const [tab, setTab] = useState<'timer' | 'stopwatch' | 'pomodoro' | 'reports' | 'presets' | 'multi' | 'alarm'>('timer')
  const [presetDuration, setPresetDuration] = useState<string | null>(null)

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.code === 'KeyS') {
        // Start/Pause Timer
        const btn = document.querySelector('.btn-primary, .btn-secondary') as HTMLButtonElement;
        if (btn) btn.click();
      } else if (e.ctrlKey && e.shiftKey && e.code === 'KeyR') {
        // Reset
        const btn = document.querySelector('.btn-outline') as HTMLButtonElement;
        if (btn) btn.click();
      } else if (e.ctrlKey && e.shiftKey && e.code === 'Digit1') {
        setTab('timer');
      } else if (e.ctrlKey && e.shiftKey && e.code === 'Digit2') {
        setTab('stopwatch');
      } else if (e.ctrlKey && e.shiftKey && e.code === 'Digit3') {
        setTab('pomodoro');
      } else if (e.ctrlKey && e.shiftKey && e.code === 'Digit4') {
        setTab('alarm');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative">
      <ThemeToggle />
      <div className="flex gap-2 mb-4 flex-wrap">
        <button className={`btn ${tab === 'timer' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('timer')}>Timer</button>
        <button className={`btn ${tab === 'stopwatch' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('stopwatch')}>Stopwatch</button>
        <button className={`btn ${tab === 'pomodoro' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('pomodoro')}>Pomodoro</button>
        <button className={`btn ${tab === 'alarm' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('alarm')}>Alarm</button>
        <button className={`btn ${tab === 'reports' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('reports')}>Reports</button>
        <button className={`btn ${tab === 'presets' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('presets')}>Presets</button>
        <button className={`btn ${tab === 'multi' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('multi')}>Multi-Timer</button>
      </div>
      {tab === 'timer' && <CountdownTimer key={presetDuration} initialDuration={presetDuration} />}
      {tab === 'stopwatch' && <Stopwatch />}
      {tab === 'pomodoro' && <Pomodoro />}
      {tab === 'alarm' && <Alarm />}
      {tab === 'reports' && <Reports />}
      {tab === 'presets' && <Presets onSelect={preset => { setPresetDuration(preset.duration); setTab('timer'); }} />}
      {tab === 'multi' && <MultiTimer />}
    </div>
  )
}

export default App
