# 📖 LOVE SKETCHBOOK — Món Quà Tình Yêu 20/10

> *"Một trang giấy trắng dần được lấp đầy bằng những nét vẽ, những lời thương và những kỷ niệm. Cuối cùng, tất cả kết thành một cây tình yêu kỳ diệu, được tạo nên từ những điều nhỏ bé nhưng có ý nghĩa."*

---

## 🎨 Art Direction — Pencil & Colored Pencil Romance

Website quà tặng 20/10 mang ngôn ngữ nghệ thuật của một cuốn sổ phác thảo bằng bút chì graphite và chì màu:
- **Nền giấy**: Vân giấy kem ấm áp (`#F7F1E5` / `#FFFDF8`).
- **Nét vẽ**: Viền chì graphite hữu cơ (`#5E514B`), nét phác thảo còn lưu vết, gạch bóng chì màu.
- **Bảng màu chì màu**: Hồng chì (`#DDA0A5`), đỏ hồng đất (`#C9757C`), xanh sage (`#A9B99A`), vàng chì (`#E1C17A`), tím pastel (`#C8B4D4`).
- **Typography**: Kết hợp font viết tay mộc mạc (*Patrick Hand*, *Caveat*) và serif lãng mạn (*Playfair Display*, *Lora*), hỗ trợ trọn vẹn tiếng Việt.

---

## 🌟 Ba Giao Diện & Hành Trình Cảm Xúc

1. **Mini-game đập bóng bay (`/g/:slug`)**:
   - Thử thách mở đầu vui nhộn: đập vỡ chính xác 20 quả bóng kỷ niệm vẽ bằng chì màu.
   - Âm thanh pop nhẹ nhàng qua Web Audio API.
   - Khi đạt 20/20, hiệu ứng vụn chì màu và lật trang sổ phác thảo mở ra phần quà chính.

2. **Trang trải nghiệm người nhận (`/g/:slug`)**:
   - **Lời chúc lãng mạn**: Trình bày trên trang giấy kẻ dòng với hiệu ứng đánh máy bút chì tuần tự, hoa lá góc trang.
   - **Cây Tình Yêu Kỳ Ảo (`ThreeGallery3D`)**: Cây vẽ bằng bút chì và chì màu, thân cành vững chãi tạo dáng trái tim tinh tế, hoa lá 5 cánh nở rộ và các cánh hoa bay chầm chậm theo gió.
   - **Vòng ảnh 3D tương tác**: Ảnh in scrapbook polaroid xoay quanh cây ở 3 quỹ đạo 3D ôm sát cây với hiệu ứng che khuất thực tế (Depth Occlusion), vuốt/kéo quán tính mượt mà, click để phóng to ảnh.

3. **Trang tạo món quà (`/create`)**:
   - Bàn vẽ 3 cột: Nhập thông tin & lời chúc, tải ảnh lên với tính năng nén tự động trên trình duyệt, xem trước tức thì (Live Preview).
   - **Mã QR & Chia sẻ**: Sinh mã QR sắc nét nằm trong khung polaroid vẽ tay, tải ảnh QR chất lượng cao, sao chép link, chia sẻ trực tiếp qua Facebook / Zalo / Web Share API.

---

## 🚀 Hướng Dẫn Chạy Dự Án

### 1. Cài đặt và cấu hình môi trường

Tạo file `.env.local` từ `.env.example`:

```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/love_sketchbook?retryWrites=true&w=majority

# Port máy chủ backend (mặc định: 5000)
PORT=5000

# Client origin cho CORS
CLIENT_URL=http://localhost:3000

# (Tùy chọn) Cloudinary lưu trữ ảnh đám mây
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 2. Khởi chạy môi trường phát triển (Cả Backend & Frontend)

```bash
# Cài đặt thư viện
npm install

# Khởi chạy đồng thời cả Express Backend (port 5000) và Vite Frontend (port 3000)
npm run dev
```

Truy cập: `http://localhost:3000`
- Trang tạo quà: `http://localhost:3000/create`
- Xem thử món quà mẫu: `http://localhost:3000/g/love-demo`

### 3. Biên dịch Production

```bash
npm run build
```
