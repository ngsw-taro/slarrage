(() => {
  const div = document.createElement("div");
  div.style.zIndex = "9999";
  div.style.padding = "8px 16px";
  div.style.backgroundColor = "gold";
  div.style.color = "black";
  div.style.fontWeight = "bold";
  div.style.fontSize = "16px";
  div.style.position = "absolute";
  div.style.width = "100vw";
  div.style.display = "flex";
  div.style.justifyContent = "space-between";
  div.style.alignItems = "center";

  const message = document.createElement("div");
  message.innerText = "Slarrage is watching this channel.";

  const button = document.createElement("button");
  button.innerText = "Stop";
  button.style.padding = "8px";
  button.style.backgroundColor = "lightyellow";
  button.style.boxShadow = "0 0 4px gray";
  button.addEventListener("click", () => {
    div.remove();
    chrome.runtime.sendMessage({ stop: true });
  });

  div.insertBefore(message, null);
  div.insertBefore(button, null);
  document.body.insertBefore(div, document.body.firstChild);
})();
