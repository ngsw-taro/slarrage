const messageCounts = {
  random: 0,
  bottom: 0,
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { messages } = request;
  messages.forEach(show);
});

const show = (message) => {
  const element = createBaseElement(message);
  if (element == null) return;

  const lifespan = calcLifespan(message);
  const commands = message.command.split(" ");
  const position = getPosition(commands);
  element.style = `
    z-index: ${10000 + messageCounts.random + messageCounts.bottom}; 
    animation-duration: ${lifespan}s;
    font-size: ${getFontSize(commands)};
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

const getFontSize = (commands) => {
  if (commands.some((it) => it === "small")) return "24px";
  if (commands.some((it) => it === "big")) return "64px";
  return "32px";
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
