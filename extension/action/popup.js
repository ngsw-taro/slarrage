window.addEventListener("load", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    initCommon();
    initActions(tab);
    initPreferences();
  });
});

const initCommon = () => {
  const links = document.querySelectorAll("a");
  links.forEach((link) => {
    link.addEventListener("click", () =>
      chrome.tabs.create({ url: link.getAttribute("href") })
    );
  });
};

const initActions = (tab) => {
  const showCommentsButton = document.getElementById("show-comments");
  showCommentsButton.addEventListener("click", () => {
    chrome.tabs.executeScript(tab.id, { file: "content/presentation.js" });
    chrome.tabs.insertCSS(tab.id, { file: "content/presentation.css" });
    showCommentsButton.setAttribute("disabled", "true");
    chrome.runtime.sendMessage({ addTabId: tab.id });
  });

  chrome.runtime.sendMessage({ hasTabId: tab.id }, ({ result }) => {
    if (result) {
      showCommentsButton.setAttribute("disabled", "true");
    } else {
      showCommentsButton.removeAttribute("disabled");
    }
  });
};

const initPreferences = () => {
  const opacityInput = document.getElementById("opacity-input");
  const fontSizeInput = document.getElementById("font-size-input");

  opacityInput.addEventListener("change", (e) => {
    chrome.runtime.sendMessage({
      setPreference: { opacity: e.target.value },
    });
  });
  fontSizeInput.addEventListener("change", (e) => {
    chrome.runtime.sendMessage({
      setPreference: { fontSize: e.target.value },
    });
  });

  chrome.runtime.sendMessage({ getPreference: true }, (response) => {
    const { preference } = response;
    opacityInput.value = preference.opacity;
    fontSizeInput.value = preference.fontSize;
  });
};