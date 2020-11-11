const messageCounts = {
  random: 0,
  bottom: 0,
};
let preference;

// 初回読み込み時、プリファレンスの要求を行う
chrome.runtime.sendMessage({ getPreference: true }, (response) => {
  preference = response.preference;
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { messages } = request;
  if (messages != null) {
    messages.forEach(show);
  }
  if (request.preference != null) {
    preference = request.preference;
  }
});

const show = (message) => {
  const element = createBaseElement(message);
  if (element == null) return;

  const commands = message.command.split(" ");
  if (isIgnore(commands)) return;

  const lifespan = calcLifespan(message);
  const position = getPosition(commands);
  element.style = `
    opacity: ${preference.opacity};
    z-index: ${10000 + messageCounts.random + messageCounts.bottom}; 
    animation-duration: ${lifespan}s;
    font-size: ${getFontSize(commands, preference.fontSize)};
    color: ${getColor(commands)};
    ${getStyleForPosition(position)}
  `;

  document.body.insertBefore(element, document.body.firstChild);
  messageCounts[position]++;
  setTimeout(() => {
    element.remove();
    messageCounts[position]--;
  }, lifespan * 1000);
};

const calcLifespan = ({ text }) => {
  return 6 + text.length * 0.2;
};

const createBaseElement = ({ text, imageUrl }) => {
  if (text !== "") {
    const div = document.createElement("div");
    div.innerText = text;
    div.className = "slarrage";
    return div;
  }
  if (imageUrl !== "") {
    const img = document.createElement("img");
    img.src = imageUrl;
    img.className = "slarrage";
    return img;
  }
  return null;
};

const isIgnore = (commands) => {
  return commands.some((it) => it === "ignore");
};

const getFontSize = (commands, scale) => {
  let basePx = 32;
  if (commands.some((it) => it === "small")) {
    basePx = 24;
  }
  if (commands.some((it) => it === "big")) {
    basePx = 64;
  }
  return `${basePx * scale}px`;
};

const getColor = (commands) => {
  if (commands.some((it) => it === "red")) return "red";
  if (commands.some((it) => it === "pink")) return "pink";
  if (commands.some((it) => it === "black")) return "black";
  if (commands.some((it) => it === "blue")) return "blue";
  if (commands.some((it) => it === "green")) return "green";
  if (commands.some((it) => it === "yellow")) return "yellow";
  if (commands.some((it) => it === "orange")) return "orange";
  return "white";
};

const getPosition = (commands) => {
  if (commands.some((it) => it === "bottom")) return "bottom";
  return "random";
};

const getStyleForPosition = (position) => {
  if (position === "bottom") {
    return `
      bottom: calc(2% + ${64 * messageCounts.bottom}px);
      animation: none;
      left: 50%;
      transform: translateX(-50%);
    `;
  }
  return `
    top: ${Math.random() * 50 * messageCounts.random}px;
  `;
};
