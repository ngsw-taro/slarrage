const LOCAL_STORAGE_PREFERENCE_KEY = "preference";

const defaultPreference = {
  version: 2,
  opacity: 0.75,
  fontSize: 1,
  barrage: true,
  position: true,
  animation: true,
};

const isEmptyObject = (obj) => Object.keys(obj).length === 0;

chrome.runtime.onInstalled.addListener(async () => {
  // initialize or migrate
  const local = await chrome.storage.local.get(LOCAL_STORAGE_PREFERENCE_KEY);

  const initialPreference = JSON.parse(
    isEmptyObject(local)
      ? '{"version": 0}'
      : local[LOCAL_STORAGE_PREFERENCE_KEY]
  );

  if (initialPreference.version < 2) {
    const migrated = { ...defaultPreference, ...initialPreference, version: 2 };
    await chrome.storage.local.set({
      [LOCAL_STORAGE_PREFERENCE_KEY]: JSON.stringify(migrated),
    });
  }
});

const tabIds = new Set();
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (!("url" in changeInfo)) {
    tabIds.delete(tabId);
  }
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
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
    const local = await chrome.storage.local.get(LOCAL_STORAGE_PREFERENCE_KEY);
    const json = isEmptyObject(local)
      ? "{}"
      : local[LOCAL_STORAGE_PREFERENCE_KEY];

    sendResponse({
      [LOCAL_STORAGE_PREFERENCE_KEY]: JSON.parse(json),
    });
    return;
  }
  if ("setPreference" in request) {
    const local = await chrome.storage.local.get(LOCAL_STORAGE_PREFERENCE_KEY);
    const json = isEmptyObject(local)
      ? "{}"
      : local[LOCAL_STORAGE_PREFERENCE_KEY];
    const preference = { ...JSON.parse(json), ...request.setPreference };
    await chrome.storage.local.set({
      [LOCAL_STORAGE_PREFERENCE_KEY]: JSON.stringify(preference),
    });
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
