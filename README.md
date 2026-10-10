# Liên Quân Account Checker

Một full-stack starter giúp bạn tạo tool kiểm tra tài khoản Liên Quân theo mô hình:
- backend API với Express
- frontend dashboard dạng web
- provider registry cho mock / public-api / scraper
- cấu trúc dễ mở rộng cho việc tích hợp dữ liệu thật

## Tính năng

- Kiểm tra account bằng nickname hoặc accountId
- Hỗ trợ nhiều provider
- Giao diện web đơn giản
- API endpoint rõ ràng
- Dễ thay thế dữ liệu mock bằng dữ liệu từ nguồn thật

## Lưu ý quan trọng

Dùng dự án này để kiểm tra dữ liệu công khai, tuân thủ chính sách mạng và điều khoản của nhà phát hành. Không bypass hoặc khai thác dữ liệu trái phép. Khi tích hợp provider ngoài, hãy đảm bảo đáp ứng điều kiện pháp lý và quyền sử dụng dữ liệu.

## Cài đặt

```bash
npm install
cp .env.example .env
npm run dev
```

Mở trình duyệt tại:
- http://localhost:3000

## API

### Health check

```bash
GET /api/health
```

### Danh sách provider

```bash
GET /api/providers
```

### Kiểm tra tài khoản

```bash
POST /api/check-account
Content-Type: application/json

{
  "nickname": "SkyBlade",
  "accountId": "hero-001",
  "server": "Hạ Long",
  "provider": "mock"
}
```

## Cấu trúc dự án

```text
.
├── public/
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── .env.example
├── .gitignore
├── package.json
├── README.md
├── server.js
└── LICENSE
```

## Kế hoạch mở rộng

1. Thêm provider thật dựa trên API được cấp phép
2. Thêm cache và rate limit
3. Thêm auth cho admin
4. Tích hợp database PostgreSQL / MongoDB
5. Thiết kế dashboard phân tích ranking, lịch sử, dữ liệu account

## Giấy phép

MIT
