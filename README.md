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
| Khác           | React Navigation, @expo/vector-icons, @react-native-async-storage/async-storage, expo-constants, expo-status-bar, react-native-safe-area-context, react-native-screens |

### Nguồn dữ liệu đang dùng

- API sản phẩm: dùng chung schema như ví dụ bên dưới. Mỗi người có thể dùng API riêng bằng cách cấu hình biến môi trường `EXPO_PUBLIC_API_URL` trong file `.env`.
- Mỗi sản phẩm có một mảng `review` chứa các đánh giá (rating & comment).

## 4. Cấu trúc dữ liệu API

Mỗi đối tượng handbag trong API có cấu trúc như sau:

```json
{
  "id": "1",
  "handbagName": "Galuchat Serpenti Forever Crossbody in Red",
  "cost": 2798,
  "category": "Crossbody",
  "color": ["Red"],
  "gender": true,
  "uri": "https://...",
  "brand": "Bvlgari",
  "percentOff": 0.42,
  "review": [
    { "rating": 5, "comment": "Thiết kế rất sang, màu đỏ nổi bật." },
    { "rating": 4, "comment": "Chất liệu cao cấp và hoàn thiện tốt." }
  ]
}
```

### Giải thích fields

| Field        | Type         | Mô tả                                            |
|-------------|-------------|--------------------------------------------------|
| `id`         | string      | Mã sản phẩm                                       |
| `handbagName`| string      | Tên sản phẩm                                      |
| `cost`       | number      | Giá gốc                                           |
| `category`   | string      | Danh mục (Crossbody, Shoulder Bag, ...)            |
| `color`      | string[]    | Danh sách màu sắc                                  |
| `gender`     | boolean     | `true` - Nữ, `false` - Nam                        |
| `uri`        | string      | URL ảnh sản phẩm                                   |
| `brand`      | string      | Thương hiệu                                       |
| `percentOff` | number      | Phần trăm giảm giá (0.42 = 42%)                   |
| `review`     | array       | Danh sách đánh giá, mỗi item gồm `rating` (1-5) và `comment` (string) |

> **Lưu ý:** Trước đây project dùng file `src/data/feedbacks.js` riêng để lưu đánh giá. Hiện tại đã chuyển hoàn toàn sang mảng `review` trong API. Không cần dùng file dữ liệu tĩnh nữa.

## 5. Yêu cầu môi trường

Trước khi chạy project, cần cài các công cụ sau:

- Node.js LTS: nên dùng phiên bản ổn định, nếu lỗi môi trường thì cần kiểm tra lại version phù hợp với Expo đang dùng.
- npm: đi kèm Node.js, dùng để cài dependencies.
- Git: để clone project.
- Expo Go trên điện thoại hoặc giả lập Android/iOS nếu muốn chạy app mobile.
- IDE: Visual Studio Code hoặc IDE tương đương.

Nếu chạy trên máy local với simulator/emulator:

- Android Studio hoặc Xcode, tùy hệ điều hành.
- Một trình duyệt web hiện đại nếu chạy bằng `expo start --web`.

## 6. Hướng dẫn cài đặt và setup

### Bước 1: Clone project

```bash
git clone https://github.com/hoaibao1102/mobile-app-assignment.git
cd mobile-app-assignment
```

Nếu bạn chỉ nhận được source code dưới dạng thư mục, có thể copy toàn bộ thư mục project vào máy và mở trực tiếp trong VS Code.

### Bước 2: Cài dependencies

Từ thư mục gốc của project, chạy:

```bash
npm install
```

Project hiện có file `package-lock.json`, vì vậy nên ưu tiên `npm install` để đồng bộ đúng version package.

### Bước 3: Cấu hình file môi trường

Project sử dụng file `.env` để lưu biến môi trường. Các bước cấu hình:

1. Mở file `.env` ở thư mục gốc.
2. Sửa giá trị `EXPO_PUBLIC_API_URL` nếu cần đổi API.

```bash
EXPO_PUBLIC_API_URL=https://6a0b0e8021e4456256972de2.mockapi.io/api/v1/handBags
```

> **Lưu ý:** Expo tự động đọc biến có tiền tố `EXPO_PUBLIC_` từ file `.env`. Không cần cài thêm package nào.

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

## 7. Cấu trúc thư mục

```text
mobile-app-assignment/
├── .env
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
- `src/data/`: (đã xóa) trước đây dùng để lưu feedback/comment tĩnh, nay đã chuyển vào API.
- `src/hooks/`: nơi chứa custom hooks. File `useProducts.js` hiện đang để trống, cần kiểm tra lại nếu muốn sử dụng trong tương lai.
- `src/layouts/`: layout bao bọc giao diện, hiện có `MainLayout` dùng `SafeAreaView`.
- `src/navigation/`: cấu hình điều hướng tab/stack.
- `src/screens/`: các màn hình chính của ứng dụng.
- `src/services/`: logic lưu favorites vào AsyncStorage.
- `src/utils/`: các hàm tiện ích như format tiền và phần trăm.

## 8. Luồng hoạt động chính của hệ thống

1. Ứng dụng khởi chạy từ `index.js` và render `App.js`.
2. `App.js` bọc toàn bộ app bằng `NavigationContainer`.
3. `AppNavigator` tạo 2 tab chính: `Home` và `Favorites`, mỗi tab có stack navigation riêng.
4. Màn hình Home:
   - gọi API để lấy danh sách handbags,
   - đọc danh sách favorites từ AsyncStorage,
   - hiển thị thanh **Smart Search** dẫn đến `SearchScreen`,
   - lọc theo brand (thanh filter ngang),
   - sắp xếp theo giá giảm dần,
   - hiển thị danh sách bằng `HandbagCard`.
5. Khi người dùng chọn một sản phẩm, app chuyển sang màn hình Detail (qua `HomeStack`).
6. Màn hình Detail:
   - hiển thị ảnh lớn, tên, brand, giá, giảm giá, category, màu sắc, giới tính và rating/comment,
   - có nút **tim** (favorite) bên cạnh tên sản phẩm,
   - hỗ trợ **swipe từ mép trái màn hình** để quay lại (PanResponder + Animated).
7. Người dùng có thể thêm hoặc bỏ favorite ngay tại Home, Detail hoặc Favorites.
8. **Smart Search** (`SearchScreen`):
   - gõ từ khóa tìm kiếm với **debounce 250ms**,
   - hiển thị **Recent Searches** (lưu AsyncStorage, tối đa 5 từ khóa),
   - **Trending Searches** gợi ý dựa trên thương hiệu phổ biến,
   - **Quick Filter** chips: lọc theo category, brand, color,
   - **Smart Suggestions** khi đang gõ,
   - **Recommendation Cards** cho từng thương hiệu (kèm rating trung bình),
   - ranking sản phẩm theo độ liên quan (công thức tính điểm).
9. Màn hình Favorites (`FavoriteStack`):
   - đọc danh sách favorites từ AsyncStorage,
   - chế độ **Select mode** (bằng nút Select hoặc long-press vào item):
     - chọn/bỏ chọn nhiều item,
     - **Select All** chọn toàn bộ.
   - thanh floating bar với nút **Delete** (xóa có xác nhận) và nút **Close** (thoát select mode),
   - nhấn vào item để xem chi tiết (qua `FavoriteDetail`).
10. **RatingSummary** hiển thị nhóm sao (5→1) và danh sách comments gốc từ API.

## 9. Các chức năng chính đã làm

### Danh sách & Lọc
- Hiển thị danh sách túi xách từ MockAPI với loading indicator.
- Lọc túi xách theo thương hiệu (thanh `BrandFilter` ngang).
- Sắp xếp danh sách theo giá giảm dần.
- Smart Search màn hình riêng với các tiện ích nâng cao.

### Smart Search (`SearchScreen`)
- Tìm kiếm với **debounce 250ms**.
- **Recent Searches**: lưu lịch sử tìm kiếm (tối đa 5) vào AsyncStorage, có nút xóa toàn bộ.
- **Trending Searches**: gợi ý các thương hiệu phổ biến tự động.
- **Quick Filter chips**: lọc nhanh theo Category, Brand, Color — có thể toggle on/off.
- **Smart Suggestions**: gợi ý từ khóa khi người dùng đang gõ.
- **Recommendation Cards**: card gợi ý cho từng thương hiệu kèm số lượng sản phẩm và rating trung bình.
- **Ranking**: sản phẩm được sắp xếp theo độ liên quan (ưu tiên tên chính xác > bắt đầu bằng từ khóa > brand > category > color).

### Chi tiết sản phẩm (`DetailScreen`)
- Xem chi tiết sản phẩm: ảnh lớn, tên, brand, giá, giảm giá, category, màu sắc, giới tính.
- Swipe từ mép trái màn hình để quay lại (dùng `PanResponder` + `Animated`).
- Thêm/xóa favorite trực tiếp trên màn hình detail.
- Xem rating summary và comments gốc từ API.

### Favorites (`FavoritesScreen`)
- Thêm/xóa favorite (tim) từ Home, Detail, Search hoặc Favorites.
- Hiển thị danh sách sản phẩm yêu thích, đồng bộ realtime khi focus.
- **Select mode**: nhấn nút "Select" hoặc long-press vào item để vào chế độ chọn nhiều.
- **Select All**: chọn toàn bộ danh sách favorite.
- **Floating action bar**: thanh nổi phía dưới với nút Delete (xóa có xác nhận) và nút Close.
- Xóa từng item hoặc xóa nhiều item cùng lúc.

### Rating & Comments
- `RatingSummary`: hiển thị số lượng đánh giá theo từng mức sao (5★ → 1★).
- Hiển thị danh sách comments kèm số sao tương ứng.
- Dữ liệu lấy trực tiếp từ mảng `review` của API (không cần file tĩnh).

### Điều hướng
- Tab bottom navigation: **Home** và **Favorites**.
- Mỗi tab có stack navigation riêng (`HomeStack`, `FavoriteStack`).
- Stack hỗ trợ điều hướng qua lại giữa danh sách và chi tiết sản phẩm.
- `SmartSearch` nằm trong `HomeStack` cùng với các màn hình detail tương ứng.

## 10. Mô tả từng phần code chính

### `src/api/handbagApi.js`

- Chứa hàm `getHandbags()` để fetch dữ liệu từ MockAPI.
- URL endpoint được đọc từ biến môi trường `EXPO_PUBLIC_API_URL` trong file `.env`.
- Cách cấu hình: sửa giá trị `EXPO_PUBLIC_API_URL` trong `.env`.
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

- Load handbags và favorites khi màn hình được focus (dùng `useFocusEffect`).
- Thanh **Smart Search** ở đầu màn hình, nhấn vào để mở `SearchScreen`.
- Filter brand ngang bằng `BrandFilter`.
- Sắp xếp sản phẩm theo giá giảm dần.
- Render danh sách bằng `FlatList` với `HandbagCard`.

### `src/screens/SearchScreen.js`

- **Header search**: TextInput tích hợp trong native stack header, có nút back, clear và search icon.
- **Debounce 250ms**: chỉ tìm kiếm sau khi ngừng gõ 250ms.
- **Recent Searches**: lịch sử tìm kiếm lưu AsyncStorage (tối đa 5), có nút "Clear all".
- **Trending Searches**: gợi ý các thương hiệu có nhiều sản phẩm nhất (từ `getTrendingSearches()`).
- **Quick Filter chips**: lọc nhanh theo Category, Brand, Color — mỗi chip có thể toggle on/off.
- **Smart Suggestions**: gợi ý từ khóa phân tích từ `getSmartSuggestions()` khi đang gõ.
- **Recommendation Cards**: card cho từng brand kèm số lượng sản phẩm và avg rating.
- **Ranking kết quả**: `filterProducts()` + `rankProducts()` — ưu tiên tên chính xác, startsWith, brand, category, color.
- Tích hợp favorite (thêm/xóa ngay trong kết quả tìm kiếm).

### `src/screens/DetailScreen.js`

- Nhận `handbag` từ route params.
- Hiển thị ảnh lớn, tên, brand, giá, discount, category, màu sắc, giới tính.
- **Swipe-back gesture**: dùng `PanResponder` + `Animated` — vuốt từ mép trái sang phải để quay lại.
- Tích hợp favorite (tim) — kiểm tra và thêm/xóa bằng `favoriteService`.
- Hiển thị `RatingSummary` với review từ API.

### `src/screens/FavoritesScreen.js`

- Hiển thị danh sách sản phẩm yêu thích từ AsyncStorage, tự động load lại khi focus.
- **Select mode**: vào chế độ chọn nhiều bằng nút "Select" hoặc long-press vào item.
  - Chọn/bỏ chọn từng item bằng checkbox overlay trên ảnh.
  - **Select All**: chọn toàn bộ danh sách.
- **Floating action bar** (chỉ hiện khi đang select mode):
  - Nút **Delete** (màu đỏ) — xóa các item đã chọn, có hộp thoại xác nhận.
  - Nút **Close** — thoát select mode.
- Nhấn vào item để xem chi tiết qua `FavoriteDetail` (stack riêng).
- Xóa nhanh từng item bằng nút tim (heart icon) khi không ở select mode.

### `src/components/HandbagCard.js`

- Component card tái sử dụng cho danh sách sản phẩm (`HomeScreen`, `SearchScreen`, `FavoritesScreen`).
- Hiển thị: ảnh, tên, brand, giá, giảm giá, rating (sao + điểm), gender icon.
- **Select mode**: khi `selectMode=true`, hiển thị checkbox overlay trên ảnh, ẩn nút tim.
  - `isSelected`: highlight border khi chọn.
  - `onSelectPress`: xử lý chọn/bỏ chọn.
  - `onLongPress`: kích hoạt select mode từ long-press.
- Tính điểm rating trung bình từ `handbag.review`.

### `src/components/BrandFilter.js`

- Danh sách filter ngang (`ScrollView` ngang) cho các brand.
- Có state active/inactive rõ ràng.
- Mặc định "All" được chọn, chọn brand khác để lọc.

### `src/components/RatingSummary.js`

- Tính số lượng đánh giá theo từng mức sao từ 5 đến 1.
- Nhóm hiển thị: mỗi hàng là "★★★★★" + "X reviews".
- Phần "Comments": hiển thị từng comment kèm số sao, trong card riêng.
- Xử lý trường hợp rỗng: "No feedback yet."

### `src/services/searchHistoryService.js`

- Dùng `AsyncStorage` với key `SEARCH_HISTORY`.
- Các hàm:
  - `getSearchHistory()`: lấy lịch sử tìm kiếm.
  - `addSearchTerm(term)`: thêm từ khóa (trùng thì xóa cũ, tối đa 5).
  - `clearSearchHistory()`: xóa toàn bộ lịch sử.

### `src/utils/searchUtils.js`

- `getAverageRating(review)`: tính rating trung bình từ mảng review.
- `getAllBrands(products)`, `getAllCategories(products)`, `getAllColors(products)`: lấy danh sách giá trị unique.
- `parseSearchQuery(text, products)`: phân tích natural language query.
- `filterProducts(products, query, filters)`: lọc sản phẩm theo từ khóa và bộ lọc.
- `rankProducts(products, query)`: sắp xếp theo mức độ liên quan (công thức tính điểm).
- `getTrendingSearches(products)`: top brand có nhiều sản phẩm nhất.
- `getSmartSuggestions(products, query)`: gợi ý từ khóa dựa trên input hiện tại.
- `getRecommendationCards(products)`: tạo recommendation card cho mỗi brand.

### `src/utils/formatters.js`

- `formatCurrency()`: định dạng giá trị tiền tệ.
- `formatPercent()`: định dạng phần trăm giảm giá.

### `src/constants/colors.js`

- Chứa bảng màu nhất quán cho toàn app: background, primary, secondary, danger, text, muted, border, yellow, success.

## 11. Cách test hoặc kiểm tra project

Hiện tại project **chưa thấy file test tự động** như Jest hoặc Testing Library, nên cách kiểm tra chủ yếu là test thủ công:

### Checklist kiểm tra nhanh

- Mở app lên không bị lỗi trắng màn hình.
- Danh sách handbags tải được từ API (có loading indicator).
- Filter brand hoạt động (chọn brand → chỉ hiện sản phẩm của brand đó).
- Smart Search:
  - Nhấn thanh "Smart Search" trên Home → mở `SearchScreen`.
  - Gõ từ khóa → kết quả hiện sau 250ms debounce.
  - Recent Searches lưu lại sau khi search.
  - Trending Searches hiển thị khi chưa gõ.
  - Quick Filter chips (Category, Brand, Color) hoạt động.
  - Smart Suggestions hiện khi đang gõ.
  - Recommendation Cards hiển thị.
  - Clear filters hoạt động.
- Detail:
  - Chạm vào card → mở màn hình Detail với đầy đủ thông tin.
  - Swipe từ mép trái → quay lại danh sách.
  - Thêm/bỏ favorite bằng nút tim.
  - Rating summary và comments hiển thị đúng.
- Favorites:
  - Vào tab Favorites → thấy item đã lưu.
  - Nhấn "Select" → vào chế độ chọn nhiều.
  - Long-press vào item → vào select mode với item đó được chọn.
  - Select All → chọn toàn bộ.
  - Chọn nhiều item → nhấn Delete → xác nhận → xóa thành công.
  - Nhấn nút Close → thoát select mode.
  - Xóa từng item bằng nút tim.
  - Nhấn vào item → xem chi tiết qua FavoriteDetail.

### Lệnh kiểm tra cơ bản

```bash
npm start
```

Hoặc:

```bash
npm run web
```

Nếu muốn kiểm tra lỗi runtime trên thiết bị thật, hãy mở app bằng Expo Go và theo dõi log của Metro bundler.

## 12. Các lỗi thường gặp khi setup và cách xử lý

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

- Kiểm tra URL API trong file `.env` (`EXPO_PUBLIC_API_URL`).
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

## 13. Ghi chú dành cho người chấm/người đọc project

- Đây là project mobile chạy bằng Expo, không phải web app hay backend service riêng.
- Dữ liệu sản phẩm được lấy từ API công khai bên ngoài, không có server nội bộ trong repository này.
- Favorites được lưu local bằng AsyncStorage nên dữ liệu yêu thích sẽ nằm trên thiết bị đang dùng.
- Search history cũng được lưu bằng AsyncStorage (key `SEARCH_HISTORY`), tối đa 5 từ khóa gần nhất.
- Rating và comment được lấy từ mảng `review` trên API, mỗi sản phẩm có nhiều review riêng (xem chi tiết ở mục 4).
- API endpoint được cấu hình qua file `.env` (`EXPO_PUBLIC_API_URL`), Expo tự động đọc ở runtime.
- File `src/hooks/useProducts.js` hiện đang trống, cần kiểm tra lại nếu trong yêu cầu assignment có phần custom hook riêng.
- FavoritesScreen có select mode với thanh floating action — thanh này dùng `position: absolute` nên không ảnh hưởng đến FlatList.
- Nếu cần mở rộng assignment, có thể bổ sung pagination, authentication, backend riêng, hoặc notification.

## 14. Kết luận

Project này mô phỏng một ứng dụng bán túi xách khá đầy đủ cho mục tiêu học tập: có gọi API, danh sách sản phẩm, chi tiết sản phẩm, favorite, điều hướng nhiều màn hình và lưu trữ local. Với cấu trúc hiện tại, người học có thể dễ dàng mở rộng thêm chức năng hoặc thay đổi nguồn dữ liệu khi cần.
