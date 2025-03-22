# Light Highlighter Extension

Một extension nhẹ nhàng giúp highlight (đánh dấu) văn bản trên các trang web và lưu trữ locally.

## Tính năng

- Highlight văn bản với 5 màu khác nhau (vàng, xanh lá, xanh dương, hồng, tím)
- Lưu trữ highlight locally (không cần server)
- Quản lý các highlight thông qua popup
- Phím tắt để bật/tắt chế độ highlight (Alt+H)
- Double-click để xóa highlight

## Cách cài đặt

1. Tải extension về máy
2. Mở Chrome/Edge, vào trang Extensions (chrome://extensions hoặc edge://extensions)
3. Bật chế độ Developer mode
4. Chọn "Load unpacked" và chọn thư mục chứa extension

## Cách sử dụng

1. Highlight văn bản:
   - Chọn văn bản cần highlight
   - Click chuột phải và chọn "Highlight Text" > chọn màu
   - Hoặc dùng phím tắt Alt+H để bật/tắt chế độ highlight

2. Xem các highlight:
   - Click vào icon extension trên thanh công cụ
   - Danh sách highlight sẽ hiện ra, bao gồm nội dung, trang web và thời gian

3. Xóa highlight:
   - Double-click vào highlight trên trang web để xóa
   - Hoặc click nút xóa trong popup để xóa

## Cấu trúc thư mục

```
light-highlighter/
├── manifest.json        # Cấu hình extension
├── background.js       # Service worker, xử lý context menu
├── contentPage.js      # Content script, xử lý highlight trên trang
├── index.html         # Giao diện popup
├── main.js           # Logic cho popup
├── styles.css        # Style cho popup và highlight
└── assets/
    └── icons/        # Chứa các icon của extension
```

## Yêu cầu về icon

Bạn cần thêm các icon vào thư mục `assets/icons` với các kích thước sau:
- icon16.png (16x16)
- icon32.png (32x32)
- icon48.png (48x48)
- icon128.png (128x128)

## Lưu ý

- Extension này lưu trữ dữ liệu locally trong chrome.storage.local
- Không yêu cầu kết nối internet
- Không hỗ trợ highlight trên file PDF
- Double-click để xóa highlight có thể không hoạt động trên một số trang web có xử lý double-click riêng