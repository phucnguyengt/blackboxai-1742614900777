// DOM Elements
const highlightsContainer = document.getElementById('highlights-container');
const loadingElement = document.getElementById('loading');
const emptyStateElement = document.getElementById('empty-state');

// Format date function
function formatDate(timestamp) {
    return new Date(parseInt(timestamp)).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Create highlight element
function createHighlightElement(highlight) {
    const div = document.createElement('div');
    div.className = 'highlight-item';
    div.style.borderLeft = `4px solid ${highlight.color}`;

    div.innerHTML = `
        <div class="highlight-text">${highlight.text}</div>
        <div class="highlight-meta">
            <div>
                <div>${highlight.title || 'Untitled Page'}</div>
                <a href="${highlight.url}" class="highlight-url" target="_blank" title="${highlight.url}">
                    ${new URL(highlight.url).hostname}
                </a>
                <div>${formatDate(highlight.timestamp)}</div>
            </div>
            <div class="highlight-actions">
                <button class="btn btn-delete" data-timestamp="${highlight.timestamp}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;

    // Add delete event listener
    const deleteButton = div.querySelector('.btn-delete');
    deleteButton.addEventListener('click', async () => {
        try {
            const { highlights = [] } = await chrome.storage.local.get('highlights');
            const updatedHighlights = highlights.filter(h => h.timestamp !== highlight.timestamp);
            await chrome.storage.local.set({ highlights: updatedHighlights });
            
            // Remove the highlight element with animation
            div.style.opacity = '0';
            div.style.transform = 'translateX(100%)';
            setTimeout(() => {
                div.remove();
                checkEmpty();
            }, 300);
        } catch (error) {
            console.error('Error deleting highlight:', error);
        }
    });

    return div;
}

// Check if highlights list is empty
function checkEmpty() {
    if (highlightsContainer.children.length === 0) {
        emptyStateElement.style.display = 'block';
    } else {
        emptyStateElement.style.display = 'none';
    }
}

// Load highlights from storage
async function loadHighlights() {
    try {
        loadingElement.style.display = 'block';
        highlightsContainer.innerHTML = '';

        const { highlights = [] } = await chrome.storage.local.get('highlights');
        
        // Sort highlights by timestamp (newest first)
        highlights.sort((a, b) => b.timestamp - a.timestamp);

        // Create and append highlight elements
        highlights.forEach(highlight => {
            const highlightElement = createHighlightElement(highlight);
            highlightsContainer.appendChild(highlightElement);
        });

        checkEmpty();
    } catch (error) {
        console.error('Error loading highlights:', error);
        highlightsContainer.innerHTML = '<div class="error">Error loading highlights</div>';
    } finally {
        loadingElement.style.display = 'none';
    }
}

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.highlights) {
        loadHighlights();
    }
});

// Initial load
document.addEventListener('DOMContentLoaded', loadHighlights);