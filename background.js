// Minimal background script for Chrome extension
chrome.runtime.onInstalled.addListener(() => {
  // Placeholder for future logic
  console.log("TimeMate extension installed.");
});

// Timer state
let timerState = {
  input: "00:25:00",
  remaining: 1500,
  running: false,
  lastUpdate: null,
};
let timerInterval = null;

function hmsToSeconds(hms) {
  const [h, m, s] = hms.split(":").map(Number);
  return (h || 0) * 3600 + (m || 0) * 60 + (s || 0);
}

function notify(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'vite.svg',
    title,
    message,
    priority: 2
  });
  if (navigator?.vibrate) navigator.vibrate([200, 100, 200]);
}

function updateBadge() {
  if (timerState.running && timerState.remaining > 0) {
    const min = Math.floor(timerState.remaining / 60);
    const sec = timerState.remaining % 60;
    chrome.action.setBadgeText({ text: `${min}:${sec.toString().padStart(2, '0')}` });
    chrome.action.setBadgeBackgroundColor({ color: timerState.remaining <= 10 ? '#f87171' : '#60a5fa' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

function startTimer() {
  if (timerState.running || timerState.remaining <= 0) return;
  timerState.running = true;
  timerState.lastUpdate = Date.now();
  timerInterval = setInterval(() => {
    timerState.remaining--;
    timerState.lastUpdate = Date.now();
    updateBadge();
    if (timerState.remaining <= 0) {
      clearInterval(timerInterval);
      timerState.running = false;
      timerState.remaining = 0;
      updateBadge();
      notify('Timer Finished', 'Your countdown timer has ended!');
    }
    chrome.storage.local.set({ timemate_countdown: { ...timerState } });
  }, 1000);
  chrome.storage.local.set({ timemate_countdown: { ...timerState } });
  updateBadge();
}

function pauseTimer() {
  timerState.running = false;
  if (timerInterval) clearInterval(timerInterval);
  chrome.storage.local.set({ timemate_countdown: { ...timerState } });
  updateBadge();
}

function resetTimer() {
  pauseTimer();
  timerState.remaining = hmsToSeconds(timerState.input);
  chrome.storage.local.set({ timemate_countdown: { ...timerState } });
  updateBadge();
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "get_timer") {
    sendResponse({ ...timerState });
  } else if (msg.type === "set_input") {
    timerState.input = msg.input;
    timerState.remaining = hmsToSeconds(msg.input);
    chrome.storage.local.set({ timemate_countdown: { ...timerState } });
    sendResponse({ ...timerState });
  } else if (msg.type === "start") {
    startTimer();
    sendResponse({ ...timerState });
  } else if (msg.type === "pause") {
    pauseTimer();
    sendResponse({ ...timerState });
  } else if (msg.type === "reset") {
    resetTimer();
    sendResponse({ ...timerState });
  }
  return true;
});

// On extension load, restore state from storage
chrome.storage.local.get(["timemate_countdown"], (result) => {
  if (result.timemate_countdown) {
    timerState = { ...timerState, ...result.timemate_countdown };
    if (timerState.running) startTimer();
  }
});
