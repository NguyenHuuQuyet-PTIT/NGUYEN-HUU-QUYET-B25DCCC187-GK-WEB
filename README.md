# MiniBlog

## 1. Giới thiệu và công nghệ sử dụng

MiniBlog hỗ trợ đọc, tìm kiếm, viết bài và bình luận. Dữ liệu có sẵn được lấy từ JSONPlaceholder bằng Fetch API; nội dung mới được lưu trên trình duyệt.

Công nghệ: React 19.2.0, TypeScript 5.9.3, Vite 7.2.2, React Router DOM 7.9.5, CSS và Playwright 1.56.1.

## 2. Cài đặt và chạy dự án

Yêu cầu Node.js 22.12 trở lên, npm và kết nối Internet. Chạy tại thư mục chứa `package.json`:

```bash
npm install
npm run dev
```

Mở `http://127.0.0.1:5173` hoặc địa chỉ Vite hiển thị. Tài khoản: **admin / 123456**.

Tạo bản build trong `build/` và chạy thử:

```bash
npm run build
npm run preview
```

## 3. Cấu trúc thư mục

```text
src/
├── components/  Thành phần dùng chung, form, phân trang và bảo vệ route
├── context/     Trạng thái đăng nhập và nội dung tự tạo
├── hooks/       Xử lý API, localStorage và dữ liệu chi tiết
├── pages/       Trang chủ, chi tiết, đăng nhập và viết bài
├── services/    Gọi API, kiểm tra kiểu và dữ liệu nhập
├── styles/      CSS chung và responsive
├── types/       Kiểu dữ liệu của ứng dụng
├── App.tsx      Khai báo các route
└── main.tsx     Khởi tạo ứng dụng
```

## 4. Chức năng đã hoàn thiện

- Lấy toàn bộ bài viết và tác giả từ API; tìm theo tiêu đề, sắp xếp và phân trang 9 bài/trang.
- Xem chi tiết bài viết, tác giả và bình luận; đăng nhập để gửi bình luận mới.
- Hiển thị đang tải, lỗi mạng/API và nút Thử lại; hủy request khi rời trang.
- Đăng nhập, đăng xuất; bảo vệ trang viết bài và quay lại trang đã yêu cầu sau đăng nhập.
- Tạo bài, chuyển đến chi tiết và hiển thị cùng danh sách bài viết có sẵn.
- Kiểm tra trường trống, khoảng trắng, min/max; có lỗi riêng, bộ đếm ký tự và chống gửi trùng.
- Lưu phiên, bài viết và bình luận mới vào localStorage; kiểm tra dữ liệu hỏng, không lưu danh sách API.
- Giao diện 3/2/1 cột theo thiết bị, menu di động và trang 404 có nút về trang chủ.

## 5. Kiểm thử và công cụ hỗ trợ

| Kịch bản | Kết quả thực tế |
| --- | --- |
| Tải, tìm kiếm, sắp xếp và phân trang | Đạt: đủ 100 bài; trang đầu 9 bài, trang cuối 1 bài; tìm kiếm và thứ tự đúng. |
| Chi tiết bài viết và bình luận API | Đạt: tiêu đề khớp danh sách, có tác giả và 5 bình luận của bài kiểm tra. |
| Đang tải, lỗi mạng/API và Thử lại | Đạt: có trạng thái tải, báo lỗi, phục hồi không reload; request được hủy khi rời trang. |
| URL sai hoặc bài viết không tồn tại | Đạt: hiện 404, có nút về trang chủ, không hiện Thử lại. |
| Đăng nhập, đăng xuất và bảo vệ route | Đạt: từ chối sai tài khoản; đăng nhập đúng quay lại trang yêu cầu; đăng xuất cập nhật giao diện. |
| Kiểm tra từng trường form | Đạt: cả 5 trường kiểm tra trống, khoảng trắng, min/max; bộ đếm đúng và submit trùng chỉ lưu một lần. |
| Lưu bài viết và bình luận mới | Đạt: giữ sau reload, hiển thị đúng bài và đồng bộ giữa hai tab. |
| localStorage hỏng hoặc bị chặn | Đạt: không trắng trang, báo lỗi ghi, không thông báo thành công khi lưu thất bại. |
| Responsive và menu điện thoại | Đạt: 3/2/1 cột, menu đóng/mở được, từ khóa dài không gây tràn ngang ở 320 px. |

Chạy lại kiểm thử:

```bash
npm test
npm run test:production
```

Tài liệu tham khảo: [JSONPlaceholder](https://jsonplaceholder.typicode.com/guide/), [React Router](https://reactrouter.com/api/components/Navigate), [Vite](https://vite.dev/config/build-options.html).

Công cụ AI hỗ trợ xây dựng mã nguồn, tham khảo AbortController, kiểm tra kiểu dữ liệu TypeScript và rà soát giao diện responsive.
