// Hiển thị danh sách highlight
async function displayHighlights() {
  try {
    const container = document.querySelector('.highlights-container');
    container.innerHTML = '';

    // Lấy highlights từ storage
    const { highlights = [] } = await chrome.storage.local.get('highlights');
    
    if (highlights.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-highlighter"></i>
          <p>No highlights yet. Select text and right click to highlight!</p>
        </div>
      `;
      return;
    }

    // Sắp xếp theo thời gian mới nhất
    highlights.sort((a, b) => b.timestamp - a.timestamp);

    // Tạo element cho mỗi highlight
    highlights.forEach(highlight => {
      const div = document.createElement('div');
      div.className = 'highlight-item';
      div.innerHTML = `
        <div class="highlight-text">${highlight.text}</div>
        <div class="highlight-meta">
          <a href="${highlight.url}" class="highlight-url" title="${highlight.title}">${highlight.title}</a>
          <div class="highlight-actions">
            <button class="btn btn-delete" data-timestamp="${highlight.timestamp}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `;
      container.appendChild(div);
    });

    // Thêm event listener cho nút xóa
    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        const timestamp = btn.dataset.timestamp;
        const { highlights = [] } = await chrome.storage.local.get('highlights');
        const updatedHighlights = highlights.filter(h => h.timestamp !== timestamp);
        await chrome.storage.local.set({ highlights: updatedHighlights });
        displayHighlights();
      });
    });

  } catch (error) {
    console.error('Error displaying highlights:', error);
    document.querySelector('.highlights-container').innerHTML = `
      <div class="empty-state">
        <i class="fas fa-exclamation-circle"></i>
        <p>Error loading highlights. Please try again.</p>
      </div>
    `;
  }
}

// Khởi tạo popup
document.addEventListener('DOMContentLoaded', () => {
  // Hiển thị highlights
  displayHighlights();

  // Lắng nghe thay đổi từ storage
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.highlights) {
      displayHighlights();
    }
  });
});