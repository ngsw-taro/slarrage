const LOCAL_STORAGE_PREFERENCE_KEY = "preference";

// initialize or migrate
const initialPreference = JSON.parse(
  localStorage.getItem(LOCAL_STORAGE_PREFERENCE_KEY) ?? '{"version":0}'
);
const defaultPreference = {
  version: 2,
  opacity: 0.75,
  fontSize: 1,
  barrage: true,
  position: true,
  animation: true,
};
if (initialPreference.version < 2) {
  const pref = { ...defaultPreference, ...initialPreference, version: 2 };
  localStorage.setItem(LOCAL_STORAGE_PREFERENCE_KEY, JSON.stringify(pref));
}

const tabIds = new Set();
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (!("url" in changeInfo)) {
    tabIds.delete(tabId);
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request);

  if ("hasTabId" in request) {
    sendResponse({ result: tabIds.has(request.hasTabId) });
    return;
  }
  if ("addTabId" in request) {
    tabIds.add(request.addTabId);
    return;
  }
  if ("getPreference" in request) {
    sendResponse({
      preference: JSON.parse(
        localStorage.getItem(LOCAL_STORAGE_PREFERENCE_KEY)
      ),
    });
    return;
  }
  if ("setPreference" in request) {
    const json = localStorage.getItem(LOCAL_STORAGE_PREFERENCE_KEY) ?? "{}";
    const preference = { ...JSON.parse(json), ...request.setPreference };
    localStorage.setItem(
      LOCAL_STORAGE_PREFERENCE_KEY,
      JSON.stringify(preference)
    );
    sendMessage({ preference });
    return;
  }
  sendMessage(request);
});

const sendMessage = (message) => {
  chrome.runtime.sendMessage(message);
  chrome.tabs.query({ active: true }, (tabs) => {
    tabs.forEach((tab) => chrome.tabs.sendMessage(tab.id, message));
  });
};
