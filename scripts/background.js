chrome.runtime.onInstalled.addListener(() => {
  console.log("Hebrew RTL Enforcer Pro v2.2 installed/updated.");
  // ערכי ברירת מחדל
  chrome.storage.sync.set({
    enabled: true,
    alignRight: true,
    alwaysRTL: false, // אופציה חדשה: ברירת מחדל = false
    excludedSites: [],
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggleRTL") {
    chrome.storage.sync.set({ enabled: message.enabled });
  } else if (message.action === "toggleAlwaysRTL") {
    chrome.storage.sync.set({ alwaysRTL: message.alwaysRTL });
  }
});
