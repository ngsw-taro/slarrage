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

const show = async (message) => {
  const commands = message.command.split(" ");
  if (isIgnore(commands)) return;

  // メインコンテンツを表示する要素をセットアップ
  const element = createBaseElement(message);
  if (element == null) return;
  updateElementStyle(element, commands);

  // 画面を流れる役割を担う要素をセットアップ
  const wrapper = document.createElement("div");
  wrapper.insertBefore(element, wrapper.firstChild);
  wrapper.className = "slarrage";

  const lifespan = calcLifespan(message);
  const position = getPosition(commands);
  updateWrapperStyle(wrapper, commands, position, lifespan);

  // delay
  const index = commands.findIndex((it) => it.startsWith("delay:"));
  if (index >= 0) {
    const delaySeconds = commands[index].match(/delay:(\d)+/)?.[1];
    if (delaySeconds != null) {
      await new Promise((resolve) => setTimeout(resolve, delaySeconds * 1000));
    }
  }

  // bodyに追加して画面に反映
  document.body.insertBefore(wrapper, document.body.firstChild);
  messageCounts[position]++;
  setTimeout(() => {
    wrapper.remove();
    messageCounts[position]--;
  }, lifespan * 1000);
};

const calcLifespan = ({ text }) => {
  return 6 + text.length * 0.2;
};

const createBaseElement = ({ text, imageUrl }) => {
  if (text.trim() !== "") {
    const div = document.createElement("div");
    div.innerText = text;
    return div;
  }
  if (imageUrl !== "") {
    const img = document.createElement("img");
    img.src = imageUrl;
    return img;
  }
  return null;
};

const isIgnore = (commands) => {
  return commands.some((it) => it === "ignore");
};

const updateElementStyle = (element, commands) => {
  element.style.fontSize = getFontSize(commands);
  element.style.color = getColor(commands);
  element.style.animation = getAnimation(commands);
};

const getFontSize = (commands) => {
  let basePx = 32;
  if (commands.some((it) => it === "small")) {
    basePx = 24;
  }
  if (commands.some((it) => it === "big")) {
    basePx = 64;
  }
  if (commands.some((it) => it === "huge")) {
    basePx = 96;
  }
  return `${basePx * preference.fontSize}px`;
};

const getColor = (commands) => {
  // カラーコード指定
  for (const command of commands) {
    if (command.match(/^#[0-9a-fA-F]{6}$/)) {
      return command;
    }
  }

  // カラー名
  const colorNames = [
    "red",
    "pink",
    "black",
    "blue",
    "green",
    "yellow",
    "orange",
    "purple",
    "cyan",
    "lime",
    "gold",
    "brown",
  ];
  return commands.filter((it) => colorNames.includes(it))[0] ?? "white";
};

const getAnimation = (commands) => {
  if (commands.includes("shake"))
    return "slarrage-shake 0.1s linear infinite alternate";
  if (commands.includes("spin")) return "slarrage-spin 1s linear infinite";
  return "none";
};

const getPosition = (commands) => {
  if (commands.some((it) => it === "bottom")) return "bottom";
  return "random";
};

const updateWrapperStyle = (wrapper, commands, position, lifespan) => {
  wrapper.style.opacity = preference.opacity;
  wrapper.style.animationDuration = `${lifespan}s`;
  wrapper.style.zIndex = `${
    10000 + messageCounts.random + messageCounts.bottom
  }`;

  const scale = preference.fontSize;
  if (position === "bottom") {
    wrapper.style.bottom = `calc(2% + ${32 * messageCounts.bottom * scale}px)`;
    wrapper.style.animation = "none";
    wrapper.style.left = "50%";
    wrapper.style.transform = "translateX(-50%)";
  } else {
    wrapper.style.top = `${
      Math.random() * 32 * messageCounts.random * scale
    }px`;
  }
};
