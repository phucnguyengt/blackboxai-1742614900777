# Light Highlighter

A lightweight Chrome extension for highlighting text on web pages.

## Features

- Highlight text with 5 different colors
- Save highlights locally
- View all highlights in popup
- Double-click to remove highlights
- Keyboard shortcut (Alt+H) to toggle highlight mode

## How to Use

1. Select text you want to highlight
2. Right click and choose "Highlight Text" from the context menu
3. Select a color to highlight
4. View your highlights by clicking the extension icon
5. Double click on any highlight to remove it
6. Use Alt+H to toggle highlight mode

## Installation

1. Download or clone this repository
2. Open Chrome and go to chrome://extensions/
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder

## Files Structure

- `manifest.json`: Extension configuration
- `background.js`: Background service worker
- `contentPage.js`: Content script for highlighting
- `main.js`: Popup logic
- `index.html`: Popup HTML
- `styles.css`: Styling for popup and highlights

## Storage

All highlights are saved locally using Chrome's storage API. Data stored includes:
- Highlighted text
- URL of the page
- Page title
- Timestamp
- Highlight color

## Keyboard Shortcuts

- `Alt+H`: Toggle highlight mode

## Colors Available

- Yellow (#ffeb3b)
- Green (#a5d6a7) 
- Blue (#90caf9)
- Pink (#f48fb1)
- Purple (#ce93d8)

## Notes

- Highlights are saved locally in your browser
- No internet connection required
- No account needed
- Lightweight and fast
- Privacy focused - no data is sent to any server