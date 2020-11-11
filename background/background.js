chrome.runtime.onMessage.addListener((request) => {
  console.log(request);
  chrome.tabs.query({ active: true }, (tabs) => {
    tabs.forEach((tab) => chrome.tabs.sendMessage(tab.id, request));
  });
});
