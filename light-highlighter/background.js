// Định nghĩa các màu highlight có sẵn
const HIGHLIGHT_COLORS = {
  yellow: '#ffeb3b',
  green: '#a5d6a7',
  blue: '#90caf9',
  pink: '#f48fb1',
  purple: '#ce93d8'
};

// Khởi tạo context menu khi extension được cài đặt
chrome.runtime.onInstalled.addListener(() => {
  // Tạo menu cha
  chrome.contextMenus.create({
    id: 'highlight-menu',
    title: 'Highlight Text',
    contexts: ['selection']
  });

  // Tạo submenu cho từng màu
  Object.entries(HIGHLIGHT_COLORS).forEach(([color, hex]) => {
    chrome.contextMenus.create({
      id: `highlight-${color}`,
      parentId: 'highlight-menu',
      title: color.charAt(0).toUpperCase() + color.slice(1),
      contexts: ['selection']
    });
  });
});

// Xử lý khi người dùng chọn màu từ context menu
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId.startsWith('highlight-')) {
    const color = info.menuItemId.replace('highlight-', '');
    chrome.tabs.sendMessage(tab.id, {
      action: 'highlight',
      color: HIGHLIGHT_COLORS[color]
    });
  }
});

// Xử lý phím tắt
chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-highlight-mode') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'toggle-highlight-mode'
      });
    });
  }
});

// Lắng nghe thông báo từ content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'show-notification') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'assets/icons/icon48.png',
      title: 'Light Highlighter',
      message: request.message
    });
  }
});