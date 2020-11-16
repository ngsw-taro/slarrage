if (typeof slarragePresentationLoaded === "undefined") {
  const slarragePresentationLoaded = true;

  (() => {
    class ElementManager {
      elementWithCommandsList = [];

      addElement(element, commands) {
        element.managedId = new Date().getTime();
        this.elementWithCommandsList.push({ element, commands });
      }
      removeElement(element) {
        const index = this.elementWithCommandsList.findIndex(
          (it) => it.element.managedId === element.managedId
        );
        if (index >= 0) {
          this.elementWithCommandsList.splice(index, 1);
        }
      }
      updatePreference(preference) {
        this.elementWithCommandsList.forEach(({ element, commands }) => {
          element.style.opacity = preference.opacity;
          element.childNodes.forEach(
            (child) => (child.style.fontSize = getFontSize(commands))
          );
        });
      }
    }

    const elementManager = new ElementManager();
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
        elementManager.updatePreference(preference);
      }
    });

    const show = async (message, count) => {
      const { commands } = message;
      if (isIgnore(commands)) return;
      if (isBarrage(commands) && count <= 30) {
        sleep(Math.random() * 100).then(() => show(message, (count ?? 0) + 1));
      }

      // メインコンテンツを表示する要素をセットアップ
      const contentElements = createContentElements(message);
      contentElements.forEach((element) =>
        updateElementStyle(element, commands)
      );

      // 画面を流れる役割を担う要素をセットアップ
      const wrapper = document.createElement("div");
      contentElements.forEach((element) => wrapper.insertBefore(element, null));
      wrapper.className = "slarrage";

      const lifespan = calcLifespan(message);
      const position = getPosition(commands);
      updateWrapperStyle(wrapper, commands, position, lifespan);

      // delay
      const index = commands.findIndex((it) => it.startsWith("delay:"));
      if (index >= 0) {
        const delaySeconds = commands[index].match(/delay:(\d+)/)?.[1];
        if (delaySeconds != null) {
          await sleep(delaySeconds * 1000);
        }
      }

      // bodyに追加して画面に反映
      elementManager.addElement(wrapper, commands);
      document.body.insertBefore(wrapper, document.body.firstChild);
      messageCounts[position]++;
      setTimeout(() => {
        elementManager.removeElement(wrapper);
        wrapper.remove();
        messageCounts[position]--;
      }, lifespan * 1000);
    };

    const calcLifespan = ({ contents }) => {
      return contents.reduce((acc, { text, imageUrl }) => {
        const score = text != null ? text.length * 0.2 : 0.3;
        return acc + score;
      }, 6);
    };

    const createContentElements = ({ contents }) => {
      return contents.map(({ text, imageUrl }) => {
        if (text != null) {
          const div = document.createElement("div");
          div.innerText = text;
          return div;
        }

        const img = document.createElement("img");
        img.src = imageUrl;
        return img;
      });
    };

    const isIgnore = (commands) => {
      return commands.includes("ignore");
    };

    const isBarrage = (commands) => {
      return commands.includes("barrage");
    };

    const updateElementStyle = (element, commands) => {
      switch (element.tagName) {
        case "IMG":
          element.style.width = getFontSize(commands);
          break;
        default:
          element.style.fontSize = getFontSize(commands);
      }
      element.style.fontFamily = getFontFamily(commands);
      element.style.color = getColor(commands);
      element.style.animation = getAnimation(commands);
    };

    const getFontFamily = (commands) => {
      const preset = ["sans-serif", "serif", "monospace", "fantasy", "cursive"];
      const addedOn = ["horror", "brush", "handwritten"];
      const fontFamilyName =
        commands
          .map((it) => it.match(/font:(.+)/))
          .find((it) => it != null)?.[1] ?? "";
      return [...preset, ...addedOn].includes(fontFamilyName)
        ? fontFamilyName
        : preset[0];
    };

    const getFontSize = (commands) => {
      let basePx = 32;
      if (commands.includes("small")) {
        basePx = 24;
      } else if (commands.includes("big")) {
        basePx = 64;
      } else if (commands.includes("huge")) {
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
        wrapper.style.bottom = `calc(2% + ${
          32 * messageCounts.bottom * scale
        }px)`;
        wrapper.style.animation = "none";
        wrapper.style.left = "50%";
        wrapper.style.transform = "translateX(-50%)";
      } else {
        wrapper.style.top = `${
          Math.random() * 32 * messageCounts.random * scale
        }px`;
      }
    };

    const sleep = async (millis) =>
      new Promise((resolve) => setTimeout(resolve, millis));
  })();
}
