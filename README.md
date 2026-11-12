# SOA – Bài thực hành

Mỗi bài là một service độc lập, chạy ở cổng riêng và dùng database riêng.

| Bài | Thư mục | Cổng | Database | Mô tả |
|---|---|---|---|---|
| TH2 | `BaiThucHanh2` | 3000 | `soa_th2` | Đăng nhập và xác thực JWT |
| TH3 | `BaiThucHanh3` | 3001 | `soa_th3` | Quản lý sản phẩm |
| TH4 | `BaiThucHanh4` | 3002 | `soa_th4` | Quản lý đơn hàng |

TH3 và TH4 xác thực bằng cách gọi `GET http://localhost:3000/auth` của TH2.
TH4 gọi thêm `GET http://localhost:3001/products/:id` của TH3 để kiểm tra tồn kho.

## Chạy

1. Bật MySQL (XAMPP).
2. Mở phpMyAdmin, tab **Import**, nhập lần lượt `database/th2.sql`, `database/th3.sql`, `database/th4.sql` (mỗi file một lần, file tự tạo database).
3. Với mỗi bài, copy `.env.example` thành `.env` và sửa `DB_PASSWORD` nếu MySQL có mật khẩu.
4. Cài thư viện: `npm run install:all`
5. Chạy cả ba service: `npm start` (hoặc từng bài: `npm run auth`, `npm run product`, `npm run order`).

## Thử nhanh

1. Đăng nhập: `POST http://localhost:3000/` với `{ "userName": "admin", "password": "123456" }` rồi lấy `token`.
2. Gọi API kèm header `Authorization: Bearer <token>`.

## Bài TH4 – API đơn hàng

| Method | URL | Body (JSON) |
|---|---|---|
| GET | `/orders` | |
| GET | `/orders/:id` | |
| POST | `/orders` | `{"customer_name":"A","customer_email":"a@x.com","items":[{"product_id":1,"quantity":2}]}` |
| PUT | `/orders/:id` | `{"status":"completed"}` (pending, completed, cancelled) |
| DELETE | `/orders/:id` | |
| GET | `/order_items` | |
| GET | `/order_items/:id` | |
| POST | `/order_items` | `{"order_id":1,"product_id":2,"quantity":1}` |
| PUT | `/order_items/:id` | `{"quantity":3}` |
| DELETE | `/order_items/:id` | |

- `POST /orders` kiểm tra tồn kho qua TH3 (chỉ kiểm tra, không trừ kho). Tên và giá sản phẩm lấy từ TH3, tổng tiền tính ở server.
- Thêm, sửa, xóa `order_items` thì `total_amount` của đơn được tính lại.
- Mã lỗi: `400` dữ liệu sai hoặc không đủ hàng, `401` thiếu token, `403` token sai hoặc hết hạn, `404` không tìm thấy, `503` TH2 hoặc TH3 không chạy.
