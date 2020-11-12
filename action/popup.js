window.addEventListener("load", () => {
  const opacityInput = document.getElementById("opacity-input");
  const fontSizeInput = document.getElementById("font-size-input");

  opacityInput.addEventListener("change", (e) => {
    chrome.runtime.sendMessage({ setPreference: { opacity: e.target.value } });
  });
  fontSizeInput.addEventListener("change", (e) => {
    chrome.runtime.sendMessage({ setPreference: { fontSize: e.target.value } });
  });

  chrome.runtime.sendMessage({ getPreference: true }, (response) => {
    const { preference } = response;
    opacityInput.value = preference.opacity;
    fontSizeInput.value = preference.fontSize;
  });
});