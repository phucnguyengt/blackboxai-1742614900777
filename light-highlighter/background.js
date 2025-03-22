// Định nghĩa các màu highlight có sẵn với tên hiển thị
const HIGHLIGHT_COLORS = {
  yellow: { color: '#ffeb3b', title: '🟡 Yellow' },
  green: { color: '#a5d6a7', title: '🟢 Green' },
  blue: { color: '#90caf9', title: '🔵 Blue' },
  pink: { color: '#f48fb1', title: '🔴 Pink' },
  purple: { color: '#ce93d8', title: '🟣 Purple' }
};

// Hàm hiển thị thông báo
function showNotification(message) {
  try {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'assets/icons/icon48.png',
      title: 'Light Highlighter',
      message: message,
      priority: 1
    });
  } catch (error) {
    console.error('Error showing notification:', error);
  }
}

// Khởi tạo extension khi được cài đặt hoặc cập nhật
chrome.runtime.onInstalled.addListener((details) => {
  try {
    // Xóa menu cũ nếu có
    chrome.contextMenus.removeAll(() => {
      // Tạo menu cha
      chrome.contextMenus.create({
        id: 'highlight-menu',
        title: '🖍️ Highlight Text',
        contexts: ['selection']
      });

      // Tạo submenu cho từng màu
      Object.entries(HIGHLIGHT_COLORS).forEach(([id, data]) => {
        chrome.contextMenus.create({
          id: `highlight-${id}`,
          parentId: 'highlight-menu',
          title: data.title,
          contexts: ['selection']
        });
      });
    });

    // Hiển thị thông báo chào mừng khi cài đặt hoặc cập nhật
    if (details.reason === 'install') {
      showNotification('Light Highlighter is ready to use! Select text and right-click to highlight.');
    } else if (details.reason === 'update') {
      showNotification('Light Highlighter has been updated! New version is ready to use.');
    }
  } catch (error) {
    console.error('Error initializing extension:', error);
  }
});

// Xử lý khi người dùng chọn màu từ context menu
chrome.contextMenus.onClicked.addListener((info, tab) => {
  try {
    if (info.menuItemId.startsWith('highlight-')) {
      const colorId = info.menuItemId.replace('highlight-', '');
      const colorData = HIGHLIGHT_COLORS[colorId];
      
      if (!colorData) {
        throw new Error('Invalid color selected');
      }

      chrome.tabs.sendMessage(tab.id, {
        action: 'highlight',
        color: colorData.color
      });
    }
  } catch (error) {
    console.error('Error handling context menu click:', error);
    showNotification('Error applying highlight. Please try again.');
  }
});

// Xử lý phím tắt
chrome.commands.onCommand.addListener(async (command) => {
  try {
    if (command === 'toggle-highlight-mode') {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs[0]) {
        await chrome.tabs.sendMessage(tabs[0].id, {
          action: 'toggle-highlight-mode'
        });
      }
    }
  } catch (error) {
    console.error('Error handling command:', error);
    showNotification('Error toggling highlight mode. Please try again.');
  }
});

// Lắng nghe thông báo từ content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'show-notification') {
    showNotification(request.message);
  }
});
