# Bonus 6 - Firebase Auth, User Profile Management & FCM Integration

> **Môn học:** MMA301 - Lập trình di động đa nền tảng (React Native / Expo)  
> **Chủ đề:** Tích hợp Firebase Authentication, Cloud Firestore và Firebase Cloud Messaging (FCM)

---

## 🌐 Danh sách Đường Link Nộp bài (Submission Links)

| Nội dung | Đường dẫn (URL) | Ghi chú |
| :--- | :--- | :--- |
| 📱 **Link Tải File Cài Đặt Android (APK)** | [Tải trực tiếp file APK (58.3 MB)](https://expo.dev/artifacts/eas/Et2BtcYGj18cPhfMaSK5wESvgViSfbANtPuSqr7kwcI.apk) | Cài đặt và chạy native 100% trên điện thoại Android để test FCM Notification |
| 🚀 **Link Ứng Dụng Web Chạy Trực Tiếp** | [https://bonus6-firebase-integration.expo.app](https://bonus6-firebase-integration.expo.app) | Bản React Native Web deploy qua EAS Hosting, mở trực tiếp trên trình duyệt |
| 💻 **Link Mã Nguồn (GitHub Repository)** | [https://github.com/ndhung23/bonus6-firebase-integration](https://github.com/ndhung23/bonus6-firebase-integration) | Source code công khai, quản lý commit và tài liệu hướng dẫn |
| ⚙️ **Link Theo Dõi EAS Build (Expo Cloud)** | [Trang Build EAS Android](https://expo.dev/accounts/ndhung23/projects/bonus6-firebase-integration/builds/cc0154e3-2ff7-4330-aedf-70833ef1a4f8) | Tiến trình build tự động artifact APK bản mới nhất trên cloud |
| 📊 **Link Expo Project Dashboard** | [Expo Project Overview](https://expo.dev/accounts/ndhung23/projects/bonus6-firebase-integration) | Trang quản lý dự án trên nền tảng Expo |

---

## 📋 Các Chức Năng Đã Hoàn Thành Theo Đề Bài

### 1. Đăng nhập & Quản lý người dùng qua Firebase
- **Đăng ký & Đăng nhập:** Xác thực qua Firebase Authentication (`createUserWithEmailAndPassword`, `signInWithEmailAndPassword`).
- **Lưu trữ hồ sơ Realtime:** Tự động tạo và đồng bộ tài liệu người dùng tại Cloud Firestore `users/{uid}`.
- **Cập nhật thông tin chi tiết:**
  - **Email:** Hỗ trợ cập nhật qua `updateEmail` / `verifyBeforeUpdateEmail` và đồng bộ vào Firestore.
  - **Số điện thoại:** Lưu trữ và đồng bộ tức thì trên Cloud Firestore.
  - **Mật khẩu:** Xác thực lại bảo mật bằng mật khẩu hiện tại (`reauthenticateWithCredential`) trước khi đổi sang mật khẩu mới (`updatePassword`).
  - **Địa chỉ:** Lưu trữ và đồng bộ tức thì trên Cloud Firestore.
- **Lưu phiên đăng nhập bền vững:** Tích hợp `@react-native-async-storage/async-storage` với `initializeAuth` giúp giữ phiên làm việc khi tắt/mở lại ứng dụng trên thiết bị di động.

### 2. Cài đặt dịch vụ Firebase Cloud Messaging (FCM)
- **Quản lý quyền:** Tự động yêu cầu và kiểm tra quyền thông báo trên thiết bị (`POST_NOTIFICATIONS` trên Android 13+ và Web/iOS).
- **Lấy Device Token:** Lấy Native FCM Device Token & Expo Push Token, tự động đồng bộ vào hồ sơ người dùng trên Firestore.
- **Xử lý đa trạng thái:**
  - **Foreground:** Nhận thông báo và hiển thị toast biểu ngữ tùy biến ngay trong ứng dụng khi app đang mở.
  - **Background:** Hẹn giờ phát thông báo sau 3 giây để kiểm tra hiển thị khi ẩn ứng dụng xuống màn hình chính.
  - **Tapped Notification:** Bắt sự kiện khi người dùng nhấn vào thông báo trên thanh trạng thái hệ thống và tự động điều hướng về tab FCM.
- **Quản lý lịch sử thông báo:** Lưu trữ 30 thông báo gần nhất vào bộ nhớ máy, cơ chế khử trùng key tự động chống trùng lặp.

---

## 📂 Cấu Trúc Thư Mục Dự Án

```text
bonus6_firebase_integration/
├── src/
│   ├── components/
│   │   ├── AuthScreen.js         # Giao diện Đăng nhập / Đăng ký tài khoản
│   │   ├── ProfileTab.js         # Quản lý & cập nhật Email, SĐT, Mật khẩu, Địa chỉ
│   │   ├── FcmTab.js             # Quản lý FCM Token, bắn thử & lịch sử thông báo
│   │   └── UiPrimitives.js       # Bộ UI component hiện đại (Input, Button, Card, Badge)
│   └── services/
│       ├── firebaseConfig.js     # Khởi tạo Firebase App, Auth (với AsyncStorage) & Firestore
│       ├── userService.js        # Logic xử lý Auth & Firestore Realtime Sync
│       └── fcmService.js         # Logic cấu hình Expo Notifications, FCM Token & Listeners
├── App.js                        # Điều phối luồng ứng dụng và lắng nghe Notification
├── app.json                      # Cấu hình Expo, Plugins & Bundle Identifier
├── eas.json                      # Cấu hình EAS Build (APK Preview & Production)
├── package.json                  # Dependencies dự án
└── README.md                     # Tài liệu hướng dẫn & link nộp bài
```

---

## 🚀 Hướng Dẫn Chạy Dự Án Tại Local

1. **Cài đặt thư viện:**
   ```bash
   npm install
   ```

2. **Cấu hình biến môi trường (`.env`):**
   Tạo file `.env` tại thư mục gốc với các thông số Firebase:
   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.firebasestorage.app
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
   EXPO_PUBLIC_FIREBASE_VAPID_KEY=B...
   ```

3. **Chạy ứng dụng:**
   - **Mở trên Expo Go:** `npm start` (Quét mã QR bằng ứng dụng Expo Go trên điện thoại)
   - **Mở trên Web:** `npm run web`
