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
      // Kiểm tra xem range có hợp lệ không
      if (range.collapsed) {
        throw new Error('No text selected');
      }

      // Kiểm tra xem range có nằm trong một highlight khác không
      let ancestor = range.commonAncestorContainer;
      while (ancestor && ancestor.nodeType === Node.ELEMENT_NODE) {
        if (ancestor.classList.contains(this.highlightClass)) {
          throw new Error('Cannot highlight within an existing highlight');
        }
        ancestor = ancestor.parentNode;
      }

      const span = document.createElement('span');
      span.className = this.highlightClass;
      span.style.backgroundColor = color;
      span.dataset.timestamp = Date.now();
      
      // Lưu nội dung gốc trước khi highlight
      const originalContent = range.cloneContents();
      
      // Tạo highlight
      range.surroundContents(span);

      // Lưu highlight vào storage
      this.saveHighlight({
        text: span.textContent,
        color: color,
        url: window.location.href,
        timestamp: span.dataset.timestamp,
        title: document.title,
        originalContent: originalContent.textContent // Lưu nội dung gốc
      });

      return span;
    } catch (error) {
      console.error('Error creating highlight:', error);
      
      let errorMessage = 'Could not create highlight. ';
      if (error.message === 'No text selected') {
        errorMessage += 'Please select some text first.';
      } else if (error.message === 'Cannot highlight within an existing highlight') {
        errorMessage += 'Cannot highlight text that is already highlighted.';
      } else if (error.message.includes('The given range isn\'t in a single block.')) {
        errorMessage += 'Please select text within a single paragraph or element.';
      } else {
        errorMessage += 'Please try selecting text again.';
      }

      chrome.runtime.sendMessage({
        action: 'show-notification',
        message: errorMessage
      });

      return null;
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
      
      // Tìm highlight trong storage
      const highlightData = highlights.find(h => h.timestamp === timestamp);
      if (!highlightData) {
        throw new Error('Highlight not found in storage');
      }

      // Xóa từ storage
      const updatedHighlights = highlights.filter(h => h.timestamp !== timestamp);
      await chrome.storage.local.set({ highlights: updatedHighlights });

      // Khôi phục nội dung gốc
      const parent = element.parentNode;
      while (element.firstChild) {
        parent.insertBefore(element.firstChild, element);
      }
      parent.removeChild(element);

      // Thông báo xóa thành công
      chrome.runtime.sendMessage({
        action: 'show-notification',
        message: 'Highlight removed successfully'
      });
    } catch (error) {
      console.error('Error removing highlight:', error);
      chrome.runtime.sendMessage({
        action: 'show-notification',
        message: 'Error removing highlight. Please try again.'
      });
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