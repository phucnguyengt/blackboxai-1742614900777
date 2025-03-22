// Biến để theo dõi trạng thái highlight mode
let isHighlightModeEnabled = false;

// Class để quản lý highlights
class HighlightManager {
  constructor() {
    this.highlightClass = 'light-highlighter-text';
  }

  // Tạo highlight mới
  createHighlight(range, color) {
    try {
      const span = document.createElement('span');
      span.className = this.highlightClass;
      span.style.backgroundColor = color;
      span.dataset.timestamp = Date.now();
      
      range.surroundContents(span);

      // Lưu highlight vào storage
      this.saveHighlight({
        text: span.textContent,
        color: color,
        url: window.location.href,
        timestamp: span.dataset.timestamp,
        title: document.title
      });

      return span;
    } catch (error) {
      console.error('Error creating highlight:', error);
      chrome.runtime.sendMessage({
        action: 'show-notification',
        message: 'Could not create highlight. Please try selecting text again.'
      });
    }
  }

  // Lưu highlight vào storage
  async saveHighlight(highlightData) {
    try {
      const { highlights = [] } = await chrome.storage.local.get('highlights');
      highlights.push(highlightData);
      await chrome.storage.local.set({ highlights });
    } catch (error) {
      console.error('Error saving highlight:', error);
    }
  }

  // Xóa highlight
  async removeHighlight(element) {
    try {
      const timestamp = element.dataset.timestamp;
      const { highlights = [] } = await chrome.storage.local.get('highlights');
      
      // Xóa từ storage
      const updatedHighlights = highlights.filter(h => h.timestamp !== timestamp);
      await chrome.storage.local.set({ highlights: updatedHighlights });

      // Xóa element
      const parent = element.parentNode;
      while (element.firstChild) {
        parent.insertBefore(element.firstChild, element);
      }
      parent.removeChild(element);
    } catch (error) {
      console.error('Error removing highlight:', error);
    }
  }
}

// Khởi tạo highlight manager
const highlightManager = new HighlightManager();

// Xử lý tin nhắn từ background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'highlight') {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      highlightManager.createHighlight(range, request.color);
      selection.removeAllRanges(); // Clear selection after highlighting
    }
  } else if (request.action === 'toggle-highlight-mode') {
    isHighlightModeEnabled = !isHighlightModeEnabled;
    chrome.runtime.sendMessage({
      action: 'show-notification',
      message: `Highlight mode ${isHighlightModeEnabled ? 'enabled' : 'disabled'}`
    });
  }
});

// Thêm double-click listener để xóa highlight
document.addEventListener('dblclick', (event) => {
  if (event.target.classList.contains(highlightManager.highlightClass)) {
    highlightManager.removeHighlight(event.target);
  }
});