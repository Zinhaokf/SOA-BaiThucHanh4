# Bài thực hành 3 - Product Service (localhost:3001)

Dịch vụ quản lý sản phẩm (tạo, xem, cập nhật, xóa), chạy độc lập trên cổng 3001 với cơ sở dữ liệu riêng `soa_th3`.
Xác thực bằng cách gọi service đăng nhập của Bài TH 2 (`GET http://localhost:3000/auth`).

## Chạy
1. Bật MySQL (XAMPP).
2. Chạy service Bài TH 2 trước (cổng 3000): `node server.js`
3. Trong thư mục Bài TH 3: `npm install`
4. Chạy `schema.sql` trong MySQL (tạo DB riêng `soa_th3` + bảng `products`)
5. Sửa `.env` nếu cần:
```
   PORT=3001
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=soa_th3
   AUTH_SERVICE_URL=http://localhost:3000
```
6. `node index.js`

## Test (Postman hoặc curl)
1. Đăng nhập ở service Bài TH 2: `POST http://localhost:3000/`
```json
   { "userName": "admin", "password": "123456" }
```
   -> lấy `token`

2. Gọi API sản phẩm, gửi header `Authorization: Bearer <token>`:

| Method | URL | Body (JSON) |
|---|---|---|
| GET | /products | |
| GET | /products/1 | |
| POST | /products | {"name":"Bàn phím cơ","description":"Switch đỏ","price":1200000,"quantity":20} |
| PUT | /products/1 | {"price":23990000,"quantity":8} |
| DELETE | /products/1 | |

## Mã trạng thái
- 401: thiếu token
- 403: token không hợp lệ hoặc hết hạn
- 503: service xác thực (Bài TH 2) không chạy
- 400: dữ liệu không hợp lệ
- 404: không tìm thấy sản phẩm