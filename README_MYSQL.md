# Mật Mã Thăng Long — React + MySQL

Bản này đã tách dữ liệu game khỏi React và chuyển sang kiến trúc:

React/Vite → Express API → MySQL

## 1. Tạo database MySQL

Mở MySQL Workbench/phpMyAdmin và chạy toàn bộ:

`database/schema.sql`

File này tạo database `mat_ma_thang_long` và seed dữ liệu hiện tại gồm:
- 7 checkpoint
- 35 mission
- toàn bộ option/câu trả lời
- collectible
- achievement
- help section
- vị trí checkpoint

## 2. Chạy API dữ liệu game

```bash
cd server
copy .env.example .env
npm install
npm run dev
```

API dữ liệu game chạy ở cổng `3002`. Mở `server/.env` và điền mật khẩu MySQL:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=mat_khau_mysql
DB_NAME=mat_ma_thang_long
GAME_DATA_PORT=3002
```

Kiểm tra API dữ liệu:

`http://localhost:3002/api/health`

## 3. Chạy API đăng nhập

Trong một terminal khác, từ thư mục gốc:

```bash
npm run auth:dev
```

API đăng nhập chạy ở cổng `3001` và cho phép credential requests từ origin frontend.

## 4. Chạy React

Từ thư mục gốc:

```bash
npm install
npm run dev
```

React gọi API đăng nhập ở cổng `3001` và API dữ liệu game ở cổng `3002`. Mặc định frontend tự dùng hostname hiện tại, nên có thể truy cập từ thiết bị khác trong cùng mạng LAN. Nếu hai API ở máy khác, đặt `VITE_API_URL` và `VITE_GAME_API_URL` trong `.env` trước khi khởi động Vite.

## 5. Quan trọng

`src/gameData.ts` đã được loại khỏi frontend. React không còn chứa 35 mission trong file code.

Dữ liệu được đọc từ MySQL thông qua API.

Các cột `_vi` và `_en` đã được tạo sẵn trong database để phục vụ chức năng Việt/Anh. Bản seed hiện tại giữ nội dung tiếng Việt và để cột tiếng Anh `NULL`; API sẽ fallback về tiếng Việt nếu bản dịch tiếng Anh chưa có.

Trạng thái chơi hiện tại (`cpProgress`) vẫn đang nằm trong React/local state. Nếu muốn làm tài khoản người dùng thật, bước tiếp theo là thêm `users`, `user_progress`, `user_missions`, `user_collectibles` và lưu tiến trình vào MySQL.

## English database data

After importing `database/schema.sql`, run `database/populate_english.sql` once to populate the English values for the checkpoint data. The frontend already requests `/api/game-data?lang=en` when English is selected.
