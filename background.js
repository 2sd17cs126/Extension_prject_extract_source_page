chrome.commands.onCommand.addListener((command) => {
    if (command === 'my_shortcut') {
      chrome.windows.create({
        url: 'popup.html',
        type: 'popup',
        width: 500,
        height: 500
      });
    }
  });
  