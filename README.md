# Handbag Store Assignment

## 1. Giới thiệu

Đây là một ứng dụng mobile được xây dựng bằng React Native với Expo, mô phỏng một cửa hàng túi xách (handbag store). Ứng dụng cho phép người dùng xem danh sách sản phẩm, tìm kiếm theo tên, lọc theo thương hiệu, xem chi tiết từng sản phẩm, đánh dấu yêu thích và quản lý danh sách favorites được lưu cục bộ trên thiết bị.

Về bản chất, project này phù hợp cho một assignment về mobile app có điều hướng nhiều màn hình, xử lý trạng thái, gọi API lấy dữ liệu và lưu trữ local bằng AsyncStorage.

## 2. Mục tiêu của Assignment

- Xây dựng giao diện mobile theo kiểu shopping app.
- Hiển thị danh sách túi xách từ nguồn dữ liệu bên ngoài.
- Cho phép tìm kiếm sản phẩm theo tên.
- Cho phép lọc sản phẩm theo brand/thương hiệu.
- Sắp xếp danh sách sản phẩm theo giá giảm dần.
- Xem màn hình chi tiết của từng sản phẩm.
- Thêm/xóa sản phẩm yêu thích và lưu lại bằng AsyncStorage.
- Hiển thị phần đánh giá/feedback cho từng sản phẩm.
- Thực hành điều hướng bằng React Navigation với tab và stack.

## 3. Công nghệ sử dụng

| Thành phần     | Công nghệ                                                                                                   |
| -------------- | ----------------------------------------------------------------------------------------------------------- |
| Frontend       | React Native, Expo                                                                                          |
| Backend        | Không có backend tự xây; dữ liệu sản phẩm được lấy từ MockAPI công khai                                     |
| Database       | Không dùng cơ sở dữ liệu truyền thống; favorites được lưu bằng AsyncStorage trên thiết bị                   |
| Authentication | Không có                                                                                                    |
| Khác           | React Navigation, @expo/vector-icons, expo-status-bar, react-native-safe-area-context, react-native-screens |

### Nguồn dữ liệu đang dùng

- API sản phẩm: `https://6910152245e65ab24ac584e0.mockapi.io/se181860`
- Feedback/comment: dữ liệu tĩnh trong file source code

## 4. Yêu cầu môi trường

Trước khi chạy project, cần cài các công cụ sau:

- Node.js LTS: nên dùng phiên bản ổn định, nếu lỗi môi trường thì cần kiểm tra lại version phù hợp với Expo đang dùng.
- npm: đi kèm Node.js, dùng để cài dependencies.
- Git: để clone project.
- Expo Go trên điện thoại hoặc giả lập Android/iOS nếu muốn chạy app mobile.
- IDE: Visual Studio Code hoặc IDE tương đương.

Nếu chạy trên máy local với simulator/emulator:

- Android Studio hoặc Xcode, tùy hệ điều hành.
- Một trình duyệt web hiện đại nếu chạy bằng `expo start --web`.

## 5. Hướng dẫn cài đặt và setup

### Bước 1: Clone project

```bash
git clone https://github.com/hoaibao1102/mobile-app-assignment.git
cd rn1
```

Nếu bạn chỉ nhận được source code dưới dạng thư mục, có thể copy toàn bộ thư mục project vào máy và mở trực tiếp trong VS Code.

### Bước 2: Cài dependencies

Từ thư mục gốc của project, chạy:

```bash
npm install
```

Project hiện có file `package-lock.json`, vì vậy nên ưu tiên `npm install` để đồng bộ đúng version package.

### Bước 3: Cấu hình file môi trường

Hiện tại project **không có file `.env`** và cũng chưa thấy cơ chế đọc biến môi trường trong source code.

- Không cần cấu hình environment file cho trạng thái hiện tại.
- Nếu sau này chuyển API URL sang biến môi trường, cần kiểm tra lại và cập nhật tài liệu.

### Bước 4: Chạy project

Chạy app bằng Expo:

```bash
npm start
```

Hoặc dùng các lệnh tương ứng:

```bash
npm run android
npm run ios
npm run web
```

Lưu ý:

- `npm run android` cần Android emulator hoặc thiết bị Android đã kết nối.
- `npm run ios` chỉ dùng được trên macOS có Xcode.
- `npm run web` mở ứng dụng trên trình duyệt.

## 6. Cấu trúc thư mục

```text
rn1/
├── App.js
├── app.json
├── index.js
├── package.json
├── package-lock.json
├── assets/
└── src/
    ├── api/
    ├── components/
    ├── constants/
    ├── data/
    ├── hooks/
    ├── layouts/
    ├── navigation/
    ├── screens/
    ├── services/
    └── utils/
```

### Giải thích từng thư mục/file chính

- `App.js`: file gốc của ứng dụng, bọc `NavigationContainer` và gọi `AppNavigator`.
- `index.js`: điểm khởi tạo root component cho Expo.
- `app.json`: cấu hình Expo như tên app, icon, splash screen và platform settings.
- `assets/`: chứa icon, splash image và các tài nguyên tĩnh của app.
- `src/api/`: chứa logic gọi API lấy dữ liệu túi xách.
- `src/components/`: các component giao diện tái sử dụng như card sản phẩm, filter brand, rating summary.
- `src/constants/`: các hằng số giao diện, đặc biệt là bảng màu.
- `src/data/`: dữ liệu tĩnh, hiện dùng để lưu feedback/comment.
- `src/hooks/`: nơi chứa custom hooks. File `useProducts.js` hiện đang để trống, cần kiểm tra lại nếu muốn sử dụng trong tương lai.
- `src/layouts/`: layout bao bọc giao diện, hiện có `MainLayout` dùng `SafeAreaView`.
- `src/navigation/`: cấu hình điều hướng tab/stack.
- `src/screens/`: các màn hình chính của ứng dụng.
- `src/services/`: logic lưu favorites vào AsyncStorage.
- `src/utils/`: các hàm tiện ích như format tiền và phần trăm.

## 7. Luồng hoạt động chính của hệ thống

1. Ứng dụng khởi chạy từ `index.js` và render `App.js`.
2. `App.js` bọc toàn bộ app bằng `NavigationContainer`.
3. `AppNavigator` tạo 2 tab chính: `Home` và `Favorites`.
4. Màn hình Home:
   - gọi API để lấy danh sách handbags,
   - đọc danh sách favorites từ AsyncStorage,
   - cho phép tìm kiếm theo tên,
   - lọc theo brand,
   - sắp xếp theo giá giảm dần,
   - hiển thị danh sách bằng `HandbagCard`.
5. Khi người dùng chọn một sản phẩm, app chuyển sang màn hình Detail.
6. Màn hình Detail hiển thị ảnh, tên, brand, giá, giảm giá, category, màu sắc, giới tính và rating/comment.
7. Người dùng có thể thêm hoặc bỏ favorite ngay tại Home, Detail hoặc Favorites.
8. Màn hình Favorites đọc lại dữ liệu từ AsyncStorage và cho phép xóa từng item hoặc clear toàn bộ.

## 8. Các chức năng chính đã làm

- Hiển thị danh sách túi xách từ API.
- Tìm kiếm túi xách theo tên.
- Lọc túi xách theo thương hiệu.
- Sắp xếp danh sách theo giá giảm dần.
- Xem chi tiết sản phẩm.
- Thêm/xóa favorite.
- Xóa toàn bộ danh sách favorite với hộp thoại xác nhận.
- Hiển thị rating summary và feedback comments theo từng sản phẩm.
- Điều hướng bằng tab bottom navigation kết hợp stack navigation.

## 9. Mô tả từng phần code chính

### `src/api/handbagApi.js`

- Chứa hàm `getHandbags()` để fetch dữ liệu từ MockAPI.
- Nếu lỗi mạng hoặc API lỗi, hàm trả về mảng rỗng.

### `src/services/favoriteService.js`

- Dùng `AsyncStorage` với key `FAVORITE_HANDBAGS`.
- Có các hàm:
  - `getFavorites()`
  - `saveFavorites()`
  - `addFavorite()`
  - `removeFavorite()`
  - `clearFavorites()`

### `src/screens/HomeScreen.js`

- Load handbags và favorites khi màn hình được focus.
- Có ô tìm kiếm và filter brand.
- Render danh sách bằng `FlatList`.

### `src/screens/DetailScreen.js`

- Nhận `handbag` từ route params.
- Hiển thị ảnh lớn, giá, discount và các thông tin mô tả.
- Lấy feedback theo `handbagId` từ `src/data/feedbacks.js`.

### `src/screens/FavoritesScreen.js`

- Hiển thị danh sách sản phẩm yêu thích.
- Hỗ trợ xóa từng item hoặc clear all.

### `src/components/HandbagCard.js`

- Component card tái sử dụng cho danh sách sản phẩm.
- Hiển thị ảnh, tên, brand, giá, giảm giá, category và gender.

### `src/components/BrandFilter.js`

- Danh sách filter ngang cho các brand.
- Có state active/inactive rõ ràng.

### `src/components/RatingSummary.js`

- Tính số lượng đánh giá theo từng mức sao từ 5 đến 1.
- Hiển thị phần comment chi tiết.

### `src/utils/formatters.js`

- `formatCurrency()`: định dạng giá trị tiền tệ.
- `formatPercent()`: định dạng phần trăm giảm giá.

### `src/constants/colors.js`

- Chứa bảng màu nhất quán cho toàn app.

## 10. Cách test hoặc kiểm tra project

Hiện tại project **chưa thấy file test tự động** như Jest hoặc Testing Library, nên cách kiểm tra chủ yếu là test thủ công:

### Checklist kiểm tra nhanh

- Mở app lên không bị lỗi trắng màn hình.
- Danh sách handbags tải được từ API.
- Search theo tên hoạt động.
- Filter brand hoạt động.
- Chạm vào một card để mở màn hình Detail.
- Thêm favorite từ Home hoặc Detail.
- Vào tab Favorites để thấy item đã lưu.
- Xóa từng favorite và clear all hoạt động đúng.
- Rating summary và comments hiển thị theo đúng sản phẩm.

### Lệnh kiểm tra cơ bản

```bash
npm start
```

Hoặc:

```bash
npm run web
```

Nếu muốn kiểm tra lỗi runtime trên thiết bị thật, hãy mở app bằng Expo Go và theo dõi log của Metro bundler.

## 11. Các lỗi thường gặp khi setup và cách xử lý

### 1. Không cài được dependencies

Nguyên nhân thường gặp:

- Node.js quá cũ hoặc quá mới.
- Mạng chặn truy cập registry npm.

Cách xử lý:

- Kiểm tra lại phiên bản Node.js.
- Xóa `node_modules` rồi cài lại bằng `npm install`.
- Thử đổi mạng hoặc dùng mirror phù hợp nếu cần.

### 2. App không load được dữ liệu handbags

Nguyên nhân thường gặp:

- API MockAPI bị chặn mạng hoặc endpoint không còn hoạt động.
- Thiết bị/emulator không có kết nối internet.

Cách xử lý:

- Kiểm tra URL API trong `src/api/handbagApi.js`.
- Mở thử endpoint trên trình duyệt.
- Kiểm tra lại kết nối mạng.

### 3. Favorites không lưu lại sau khi thoát app

Nguyên nhân thường gặp:

- AsyncStorage không hoạt động đúng trên môi trường chạy.
- App chưa được focus/load lại dữ liệu.

Cách xử lý:

- Kiểm tra log console khi đọc/ghi favorites.
- Đảm bảo app đang dùng đúng key `FAVORITE_HANDBAGS`.

### 4. Điều hướng bị lỗi

Nguyên nhân thường gặp:

- Thiếu dependency của React Navigation.
- Expo/RN version không tương thích.

Cách xử lý:

- Chạy lại `npm install`.
- Kiểm tra `@react-navigation/native`, `bottom-tabs`, `native-stack`, `react-native-screens`, `safe-area-context` đã được cài đúng.

### 5. Ảnh sản phẩm không hiển thị

Nguyên nhân thường gặp:

- Link ảnh từ API bị lỗi.
- Thiết bị không truy cập được domain ảnh.

Cách xử lý:

- Kiểm tra giá trị `uri` trong dữ liệu trả về.
- Mở riêng URL ảnh để xác minh.

## 12. Ghi chú dành cho người chấm/người đọc project

- Đây là project mobile chạy bằng Expo, không phải web app hay backend service riêng.
- Dữ liệu sản phẩm được lấy từ API công khai bên ngoài, không có server nội bộ trong repository này.
- Favorites được lưu local bằng AsyncStorage nên dữ liệu yêu thích sẽ nằm trên thiết bị đang dùng.
- Feedback/comment hiện được hard-code trong file `src/data/feedbacks.js`.
- File `src/hooks/useProducts.js` hiện đang trống, cần kiểm tra lại nếu trong yêu cầu assignment có phần custom hook riêng.
- Nếu cần mở rộng assignment, có thể bổ sung search, sorting, pagination, hoặc tách dữ liệu sang backend riêng.

## 13. Kết luận

Project này mô phỏng một ứng dụng bán túi xách khá đầy đủ cho mục tiêu học tập: có gọi API, danh sách sản phẩm, chi tiết sản phẩm, favorite, điều hướng nhiều màn hình và lưu trữ local. Với cấu trúc hiện tại, người học có thể dễ dàng mở rộng thêm chức năng hoặc thay đổi nguồn dữ liệu khi cần.
