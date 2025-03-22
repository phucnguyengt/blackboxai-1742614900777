// Class quản lý highlight
class HighlightManager {
  constructor() {
    this.highlightClass = 'light-highlighter-text';
    this.isHighlightMode = false;
  }

  // Tạo highlight mới
  createHighlight(range, color) {
    try {
      // Kiểm tra range hợp lệ
      if (!range || range.collapsed) {
        throw new Error('No text selected');
      }

      // Tạo element highlight
      const span = document.createElement('span');
      span.className = this.highlightClass;
      span.style.backgroundColor = color;
      span.dataset.timestamp = Date.now();

      // Wrap range bằng span
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
      return null;
    }
  }

  // Lưu highlight vào storage
  async saveHighlight(highlight) {
    try {
      const { highlights = [] } = await chrome.storage.local.get('highlights');
      highlights.push(highlight);
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

      // Xóa element và giữ lại text content
      const parent = element.parentNode;
      while (element.firstChild) {
        parent.insertBefore(element.firstChild, element);
      }
      parent.removeChild(element);
    } catch (error) {
      console.error('Error removing highlight:', error);
    }
  }

  // Toggle highlight mode
  toggleHighlightMode() {
    this.isHighlightMode = !this.isHighlightMode;
    document.body.style.cursor = this.isHighlightMode ? 'pointer' : 'default';
  }
}

// Khởi tạo manager
const highlightManager = new HighlightManager();

// Lắng nghe message từ background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'highlight') {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    highlightManager.createHighlight(range, request.color);
    selection.removeAllRanges();
  } else if (request.action === 'toggle-highlight-mode') {
    highlightManager.toggleHighlightMode();
  }
});

// Double click để xóa highlight
document.addEventListener('dblclick', (event) => {
  if (event.target.classList.contains(highlightManager.highlightClass)) {
    highlightManager.removeHighlight(event.target);
  }
});