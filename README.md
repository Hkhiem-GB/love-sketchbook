# 📖 LOVE SKETCHBOOK — Món Quà Tình Yêu 20/10

> *"Một trang giấy trắng dần được lấp đầy bằng những nét vẽ, những lời thương và những kỷ niệm. Cuối cùng, tất cả kết thành một cây tình yêu kỳ diệu, được tạo nên từ những điều nhỏ bé nhưng có ý nghĩa."*

---

## 🎨 Ngôn Ngữ Nghệ Thuật — Bút Chì & Chì Màu (Pencil & Colored Pencil Romance)

Website quà tặng tình yêu mang đậm phong cách cuốn sổ phác thảo thủ công (Scrapbook):
- **Chất liệu nền giấy**: Vân giấy kem ấm áp tự nhiên (`#F7F1E5` / `#FFFDF8`) với các chi tiết băng dính washi tape thủ công (hồng pastel, vàng hoàng hôn, xanh sage).
- **Nét vẽ hữu cơ**: Đường viền chì graphite mộc mạc (`#5E514B`), gạch bóng chì màu tả thực và nét vẽ tay không góc cạnh công nghiệp.
- **Bảng màu chì màu**: Hồng chì (`#DDA0A5`), hồng đất (`#C9757C`), xanh sage (`#A9B99A`), vàng chì (`#E1C17A`), tím lavender (`#C8B4D4`).
- **Nghệ thuật chữ (Typography)**: Phối hợp font viết tay (*Patrick Hand*, *Caveat*) và serif lãng mạn (*Playfair Display*, *Lora*), tối ưu hiển thị trọn vẹn dấu tiếng Việt.

---

## 🌟 Hành Trình Trải Nghiệm & Tính Năng Nổi Bật

### 1. Thử Thách Mở Đầu — Mini-Game Đập Bóng Bay (`/g/:slug`)
- Đập vỡ chính xác **20 quả bóng kỷ niệm** rực rỡ vẽ bằng chì màu để mở khóa món quà.
- Hiệu ứng âm thanh "pop" êm tai sinh động thông qua Web Audio API không phụ thuộc file ngoài.
- Khi hoàn thành 20/20, hiệu ứng vụn chì màu bung nở cùng chuyển cảnh lật trang sổ mềm mại sang phần quà chính.

### 2. Âm Nhạc Lãng Mạn — Trình Phát Nhạc Đĩa Than (`BackgroundMusicPlayer`)
- Tự động kích hoạt nhạc nền vòng lặp du dương khi bắt đầu mở lời chúc và cây tình yêu.
- **Nút đĩa than hoạt họa**: Đĩa than xoay tròn mượt mà khi phát nhạc, tỏa ra các nốt nhạc lơ lửng `♪ ♫ ♥`.
- **Tương tác linh hoạt, không biến mất**:
  - Ấn vào đĩa than để đóng/mở bảng điều khiển (Tên bài hát, Phát/Tạm dừng, Tắt/Bật tiếng).
  - Trình phát nhạc và đĩa than **không bao giờ bị biến mất** khi tạm dừng nhạc hay khi đóng mở, luôn luôn cố định và sẵn sàng tương tác.
  - Tự động đóng gọn gàng khi chạm ra ngoài bảng điều khiển.

### 3. Lời Chúc Yêu Thương Viết Tay
- Từng dòng tâm tư của người gửi được trình bày trên trang giấy kẻ dòng với hiệu ứng đánh máy bút chì tuần tự, điểm xuyết hoa lá và trái tim vẽ tay ở góc trang.

### 4. Cây Tình Yêu 3D & Vòng Ảnh Kỷ Niệm (`ThreeGallery3D`)
- **Cây Tình Yêu nghệ thuật**: Thân cành uốn lượn thành dáng trái tim vững chãi, điểm hoa lá nở rộ và các cánh hoa rơi chầm chậm theo chiều gió.
- **Hiệu ứng vẽ chì trực tiếp (Live Pencil Drawing Animation)**: Tái hiện sinh động từng nét vẽ chì phác thảo cây tình yêu trước khi đơm hoa kết trái.
- **Vòng ảnh 3D chân thực**:
  - Hỗ trợ lên đến **30 bức ảnh** kỷ niệm xoay quanh thân cây ở 3 tầng quỹ đạo.
  - Hiệu ứng che khuất không gian thực tế (True Depth Occlusion) — ảnh khuất sau thân cây sẽ chìm ra sau một cách tự nhiên.
  - Hỗ trợ vuốt chạm, xoay 3D với quán tính vật lý (inertia momentum) mượt mà.

### 5. Khung Phóng To Ảnh Tinh Tế (`PhotoLightboxModal`)
- Chạm vào bất kỳ bức ảnh nào trong vòng xoay 3D hoặc lưới ảnh để mở xem chi tiết.
- **Tối ưu hóa kích thước**: Thu nhỏ gọn gàng, cân đối, không chiếm toàn màn hình, không che khuất thanh tiêu đề và các nút điều khiển.
- **Bảo toàn tỷ lệ 100% (`object-contain`)**: Không cắt xén (no-crop), không làm méo ảnh cho cả ảnh chân dung dọc, ảnh phong cảnh ngang lẫn ảnh vuông.
- Khóa cuộn nền trang web (`body scroll lock`), hỗ trợ phím `Escape` và nút đóng chuẩn cảm ứng di động.

### 6. Xưởng Tạo Cuốn Sổ Quà Tặng (`/create`)
- Bố cục trực quan 3 cột: Điền thông tin người nhận/gửi, viết lời chúc, chọn tối đa 30 bức ảnh và xem trước tức thì (Live Preview).
- **Lưu trữ ảnh đám mây ImgBB**: Tải ảnh trực tiếp từ trình duyệt lên ImgBB qua API Key, nén ảnh tự động bằng Canvas API phía client để tiết kiệm dung lượng và tăng tốc tải trang.
- **Mã QR & Chia sẻ đa kênh**: Sinh mã QR sắc nét đóng trong khung polaroid thủ công, hỗ trợ tải ảnh QR chất lượng cao về máy, sao chép liên kết hoặc chia sẻ trực tiếp qua Facebook / Zalo / Web Share API.

---

## 🛠️ Kiến Trúc Công Nghệ (Tech Stack)

| Thành phần | Công nghệ sử dụng |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons |
| **Đồ họa 3D & Hiệu ứng** | Three.js (WebGL), Canvas 2D Texture Helper, Web Audio API |
| **Backend & API** | Node.js, Express, esbuild (Vercel Serverless Function) |
| **Cơ sở dữ liệu** | MongoDB Atlas, Mongoose ODM |
| **Lưu trữ ảnh** | ImgBB API (Direct Client-Side Upload) |
| **Nền tảng triển khai** | Vercel (Hỗ trợ cấu hình `vercel.json` tối ưu cho SPA + Serverless API) |

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy Local

### 1. Cài đặt các gói phụ thuộc
```bash
npm install
```

### 2. Thiết lập biến môi trường
Tạo file `.env.local` ở thư mục gốc của dự án (tham khảo file `.env.example`):

```env
# 1. ImgBB API Key (Tải ảnh trực tiếp từ trình duyệt)
# Đăng ký và lấy key miễn phí tại: https://api.imgbb.com
VITE_IMGBB_API_KEY=your_imgbb_api_key_here

# 2. Chuỗi kết nối MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/love_sketchbook?retryWrites=true&w=majority

# 3. Cổng chạy máy chủ Express (Mặc định: 5000)
PORT=5000

# 4. Địa chỉ nguồn của Client cho CORS
CLIENT_URL=http://localhost:3000
```

### 3. Chạy môi trường phát triển (Full-stack Development)
Lệnh sau sẽ chạy đồng thời cả Express Backend (port 5000) và Vite Frontend (port 3000):

```bash
npm run dev
```

Mở trình duyệt tại:
- **Trang chủ / Tạo quà**: `http://localhost:3000/create`
- **Xem thử món quà mẫu**: `http://localhost:3000/g/love-demo`

### 4. Kiểm tra và Build Production
```bash
# Biên dịch Frontend (Vite) và Serverless Bundle (api/index.js)
npm run build
```

---

## 🌐 Hướng Dẫn Triển Khai Lên Vercel (Deploy Guide)

1. Đẩy mã nguồn lên kho lưu trữ GitHub.
2. Đăng nhập vào [Vercel](https://vercel.com) và chọn **Add New Project** > Chọn repository `love-sketchbook`.
3. Trong phần **Environment Variables**, cấu hình các biến sau:
   - `MONGODB_URI`: Chuỗi kết nối MongoDB Atlas của bạn.
   - `VITE_IMGBB_API_KEY`: API Key lấy từ ImgBB.
   - `CLIENT_URL`: Domain của Vercel (ví dụ: `https://love-sketchbook.vercel.app`).
4. Nhấn **Deploy**. Vercel sẽ tự động build client vào `dist` và đóng gói backend serverless function vào `api/index.js` theo cấu hình [`vercel.json`](file:///c:/Users/bkkhi/My%20Projects/LOVE-SKETCHBOOK/vercel.json).

---

## 📜 Giấy phép & Tác quyền

Dự án được xây dựng với tất cả sự trân trọng và tình yêu thương dành cho dịp 20/10. Chúc bạn có những phút giây ngọt ngào và hạnh phúc bên người thương! 🌸❤️
