window.addEventListener("load", () => {
  chrome.runtime.onMessage.addListener((request) => {
    if ("stop" in request) {
      observer.disconnect();
    }
  });

  const observer = new MutationObserver((records) => {
    const messages = records.map(toMessages).flat();
    if (messages.length > 0) {
      chrome.runtime.sendMessage({ messages });
    }
  });
  const target = document.querySelector(
    'div[data-qa="message_pane"] .c-virtual_list__scroll_container'
  );
  observer.observe(target, { childList: true });

  const toMessages = (record) => {
    return Array.from(record.addedNodes, (node) => {
      // 自分で投稿したメッセージには仮のIDとしてタイムスタンプにxが含まれているっぽいので、これを無視
      if (node.id.indexOf("x") >= 0) {
        return;
      }

      // 古い投稿がなんらかの理由で紛れ込むのを防ぐ
      const ts = parseFloat(node.id);
      if (ts < new Date().getTime() / 1000 - 3) {
        return;
      }

      const targetDiv = node.querySelector(".p-rich_text_section");
      if (targetDiv == null) {
        const img = node.querySelector("img");
        return img != null
          ? { contents: [{ imageUrl: img.src }], commands: ["huge"] }
          : null;
      }

      const commands = extractCommands(targetDiv.innerText);
      const contents = Array.from(targetDiv.childNodes, (child) => {
        if (child.nodeName === "#text") {
          return { text: removeCommands(child.textContent) };
        }
        const img =
          child.nodeName === "IMG" ? child : child.querySelector("img");
        return { imageUrl: img?.src };
      });
      return { contents, commands };
    }).filter((message) => message != null);
  };

  const extractCommands = (innerText) => {
    const commandResult = innerText.match(/\[(.+?)]/);
    if (commandResult == null) return [];
    return commandResult[1].split(" ");
  };

  const removeCommands = (textContent) => {
    return textContent.replace(/\[(.+?)]/, "");
  };
});
