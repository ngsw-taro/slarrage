(() => {
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

      const img = node.querySelector("img");
      const span = node.querySelector(".p-rich_text_section");
      const textAndCommand =
        span != null
          ? divideTextAndCommand(span.innerText)
          : { text: "", command: "" };
      return { imageUrl: img?.src ?? "", ...textAndCommand };
    }).filter((message) => message != null);
  };

  // 元メッセージからテキストとコマンドを分けて、オブジェクトとして返す
  const divideTextAndCommand = (rawText) => {
    const commandResult = rawText.match(/\[(.+?)]/);
    const command = commandResult !== null ? commandResult[1] : "";
    const text = rawText.replace(/\[(.+?)]/, "");
    return { text, command };
  };
})();
