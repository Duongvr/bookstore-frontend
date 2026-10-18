Bộ prompt xây dựng giao diện React – Web quản lý cửa hàng sách tích hợp AI
Nhóm 2 – Đồ án chuyên ngành. Chỉ phần giao diện (Frontend ReactJS).
Cách dùng
1. Gửi Prompt 0 (ngữ cảnh chung) vào đầu mỗi phiên làm việc với AI (hoặc lưu thành file hướng dẫn của dự án).
2. Gửi lần lượt các prompt theo thứ tự đánh số. Mỗi prompt độc lập, chỉ phụ thuộc vào Prompt 0 và các prompt hạ tầng (1–3).
3. Đường dẫn API trong prompt là tạm thời. Sau khi đối chiếu Swagger tại https://ecommercenest.duckdns.org/api/docs, chỉ cần sửa file src/api/endpoints.js.
Prompt 0 – Ngữ cảnh chung (gửi đầu mỗi phiên)
Bạn là senior React developer. Tôi đang làm giao diện cho đề tài "Ứng dụng Web quản lý cửa hàng sách Phương Anh tích hợp AI". Chỉ làm Frontend, backend (Spring Boot, JWT) đã có sẵn tại https://ecommercenest.duckdns.org/api (Swagger: /api/docs).

CÔNG NGHỆ: React 18 + Vite, JavaScript (ES6+), React Router v6, Axios, react-hook-form + zod, Tailwind CSS, recharts (biểu đồ), lucide-react (icon). Không dùng thư viện UI nặng khác.

VAI TRÒ: ADMIN, STAFF, CUSTOMER. Token JWT gửi qua header Authorization: Bearer <token>.

DỮ LIỆU CHÍNH: users(user_id, username, full_name, email, phone, address, status ACTIVE/LOCKED, role), categories(category_id, category_name, description), authors(author_id, author_name, bio), publishers(publisher_id, publisher_name), books(book_id, title, price, stock_quantity, description, category, publisher, authors[] theo author_order), cart_items(book_id, quantity), orders(order_id, shipping_address, total_amount, order_status, payment_status, payment_method COD/BANK_TRANSFER/MOMO, created_at), order_items(book_id, quantity, unit_price), order_status_history(old_status, new_status, changed_by, note, created_at), inventory_transactions(type IMPORT/EXPORT_ORDER/ADJUSTMENT, quantity, note, created_at).

TRẠNG THÁI ĐƠN: PENDING (Chờ xác nhận) -> CONFIRMED (Đã xác nhận) -> PREPARING (Đang chuẩn bị) -> SHIPPING (Đang giao) -> DELIVERED (Đã giao); nhánh CANCELLED (Đã hủy). Định nghĩa trong src/utils/constants.js kèm nhãn tiếng Việt và màu badge, KHÔNG viết cứng ở nơi khác.

QUY TẮC BẮT BUỘC CHO MỌI CODE:
1. Tất cả đường dẫn API chỉ nằm trong src/api/endpoints.js. Component và page KHÔNG được chứa chuỗi URL.
2. Luồng gọi: Page -> hook/service (src/api/services/*.js) -> axiosClient -> endpoints. Page không gọi axios trực tiếp.
3. Mọi trang lấy dữ liệu phải xử lý đủ 4 trạng thái: loading (Skeleton đúng hình dạng nội dung), rỗng (EmptyState), lỗi (ErrorState có nút Thử lại), thành công. Không dùng spinner che cả trang.
4. Nút submit/thao tác phải có trạng thái loading và bị disable khi đang gửi, tránh bấm đúp.
5. Thông báo thành công/thất bại dùng Toast; lỗi từ backend lấy từ response.data.message.
6. Hành động xóa/hủy/khóa phải qua ConfirmModal.
7. Phân trang, từ khóa, bộ lọc lưu trên URL query (useSearchParams) để reload và chia sẻ link được. Ô tìm kiếm debounce 400ms.
8. Giao diện responsive (mobile-first cho khu vực khách), tiếng Việt, tiền định dạng VNĐ (Intl.NumberFormat), ngày dd/MM/yyyy HH:mm.
9. Code chia component nhỏ, tái sử dụng, đặt tên rõ ràng, có comment ngắn tiếng Việt ở phần logic quan trọng. Không để code chết, không console.log.
10. Hỗ trợ truy cập cơ bản: label cho input, aria cho modal/toast, focus rõ ràng, điều hướng được bằng bàn phím.

Khi tôi yêu cầu một trang, hãy trả về: cấu trúc file, code đầy đủ chạy được, và liệt kê giả định về API (field nào bạn đang giả định) để tôi đối chiếu Swagger.
Prompt 1 – Hạ tầng: endpoints, axiosClient, services, xác thực, router
(Dùng Prompt 0.) Hãy tạo lớp hạ tầng cho dự án:

1) src/api/endpoints.js
- export BASE_URL = import.meta.env.VITE_API_URL.
- export const ENDPOINTS gồm các nhóm: AUTH (LOGIN, REGISTER, ME), BOOKS (LIST, DETAIL(id)), CATEGORIES, AUTHORS, PUBLISHERS (LIST, DETAIL(id)), CART (GET, ITEMS, ITEM(bookId)), ORDERS (LIST, DETAIL(id), STATUS(id), CANCEL(id)), PAYMENTS, INVENTORY (LIST, IMPORT, HISTORY), USERS (LIST, DETAIL(id), ROLE(id), STATUS(id)), STATS (REVENUE, TOP_BOOKS, EXPORT), AI (CHAT).
- Ở đầu file có chú thích: "Đối chiếu với Swagger trước khi dùng". Các path đặt theo chuẩn REST, dễ sửa tại một chỗ.

2) src/api/axiosClient.js
- axios.create({ baseURL: BASE_URL, timeout: 15000 }).
- Request interceptor: gắn Bearer token lấy từ localStorage.
- Response interceptor: trả response.data; chuẩn hóa lỗi thành { status, message } (ưu tiên response.data.message; mất mạng thì "Không thể kết nối máy chủ"; timeout thì "Máy chủ phản hồi quá lâu").
- 401: xóa token, chuyển /login kèm ?redirect=<trang hiện tại> (trừ khi đang gọi API login). 403: phát sự kiện để hiện Toast "Bạn không có quyền thực hiện thao tác này".
- Hỗ trợ tải file blob (cho xuất báo cáo) qua tham số responseType.

3) src/api/services/: authApi, bookApi, categoryApi, authorApi, publisherApi, cartApi, orderApi, paymentApi, inventoryApi, userApi, statsApi, aiApi. Mỗi hàm chỉ gọi axiosClient với ENDPOINTS, có JSDoc mô tả tham số và dữ liệu trả về. Có hàm chuẩn hóa dữ liệu (mapper) để thay đổi tên field của API chỉ sửa ở service.

4) src/context/AuthContext.jsx
- State: user, token, role, loading (khởi tạo bằng cách gọi ME nếu có token).
- Hàm login(username, password), logout(), register(). Cung cấp hook useAuth().
- Lưu token an toàn trong localStorage, tự dọn khi 401.

5) src/hooks: useFetch(fetcher, deps) trả { data, loading, error, refetch } (hủy request cũ bằng AbortController, tránh race condition); useDebounce(value, ms); useCart() (số lượng item cho badge ở header, cập nhật lạc quan khi thêm/xóa).

6) src/context/ToastContext.jsx: showToast({ type: success|error|info, message }), tự tắt sau 4 giây, xếp chồng, có nút đóng.

7) src/routes/AppRoutes.jsx + ProtectedRoute.jsx
- ProtectedRoute nhận prop roles=[...]: chưa đăng nhập thì chuyển /login?redirect=...; sai quyền thì render trang 403; trong lúc AuthContext đang loading thì hiện màn hình chờ.
- Dùng React.lazy + Suspense cho từng trang, fallback là skeleton phù hợp.
- Sơ đồ route: công khai (/, /books, /books/:id, /login, /register); CUSTOMER (/cart, /checkout, /orders, /orders/:id, /profile); ADMIN/STAFF dưới /admin/* theo bảng phân quyền: Dashboard, Thống kê, Danh mục, Tác giả, NXB, Người dùng, Khách hàng chỉ ADMIN; Sách (STAFF chỉ xem), Kho, Đơn hàng cho cả ADMIN và STAFF. * -> trang 404.
- Sau đăng nhập: CUSTOMER về /, ADMIN/STAFF về /admin (hoặc về redirect nếu hợp lệ).

8) .env.example với VITE_API_URL.

Tiêu chí hoàn thành: không có chuỗi URL nào ngoài endpoints.js; đổi một path chỉ sửa một dòng; token hết hạn tự về trang đăng nhập.
Prompt 2 – Component dùng chung
(Dùng Prompt 0.) Tạo thư mục src/components/common với các component sau, mỗi component có props rõ ràng, dùng Tailwind, hỗ trợ dark text rõ tương phản:

- Skeleton: biến thể text, rectangle, circle; có sẵn BookCardSkeleton, TableRowSkeleton(rows, cols), DetailSkeleton. Hiệu ứng shimmer bằng CSS (không dùng thư viện).
- Spinner: kích cỡ sm/md/lg, dùng trong nút.
- Button: variant primary/secondary/danger/ghost, prop loading (hiện spinner và disable), prop disabled, icon trái/phải.
- EmptyState: icon, tiêu đề, mô tả, nút hành động tùy chọn.
- ErrorState: hiện message lỗi, nút "Thử lại" gọi onRetry.
- ConfirmModal: tiêu đề, nội dung, nhãn nút, loading khi đang xử lý, đóng bằng Esc/click nền, focus trap.
- Modal: nền mờ, animation mở/đóng, đóng bằng Esc, khóa cuộn trang nền.
- Toast hiển thị (nối với ToastContext): icon theo loại, animation trượt vào.
- Pagination: nhận page, totalPages, onChange; hiển thị rút gọn dạng 1 ... 4 5 6 ... 20; có nút trước/sau; ẩn khi chỉ có 1 trang.
- SearchInput: debounce 400ms, nút xóa nội dung, hiện spinner nhỏ khi đang tìm.
- StatusBadge: nhận loại (order | payment | user) và giá trị, lấy nhãn và màu từ constants.
- FormField: bọc label, input/select/textarea, hiện lỗi từ react-hook-form, dấu * cho trường bắt buộc.
- QuantityInput: nút -/+, nhập tay, giới hạn min/max (max = tồn kho), onChange.
- DataTable: props columns (header, accessor/render, width), data, loading (hiện TableRowSkeleton), emptyText, pagination; hàng hover, cuộn ngang trên mobile.
- ChartCard: khung có tiêu đề, loading skeleton, rỗng, lỗi.
- PageHeader: tiêu đề + breadcrumb + vùng nút hành động.
- ErrorBoundary: bắt lỗi render, hiện trang lỗi thân thiện kèm nút tải lại.

Kèm trang demo /dev/components (chỉ bật ở môi trường dev) hiển thị tất cả component ở các trạng thái để kiểm tra bằng mắt.
Prompt 3 – Layout
(Dùng Prompt 0, Prompt 1, Prompt 2.) Tạo 3 layout trong src/layouts:

1) AuthLayout: bố cục hai cột trên desktop (bên trái hình/slogan cửa hàng sách, bên phải form), một cột trên mobile. Có link về trang chủ.

2) CustomerLayout:
- Header cố định: logo, ô tìm kiếm (Enter hoặc bấm nút thì chuyển /books?q=...), menu danh mục (dropdown tải từ API, có skeleton), icon giỏ hàng kèm badge số lượng (từ useCart), menu tài khoản (Hồ sơ, Đơn hàng, Đăng xuất) hoặc nút Đăng nhập/Đăng ký khi chưa đăng nhập.
- Menu dạng hamburger trên mobile.
- Footer: thông tin cửa hàng, liên kết.
- Nút chat AI nổi góc phải dưới (gắn ChatWidget ở Prompt 14), ẩn ở trang đăng nhập/đăng ký.
- Outlet có animation chuyển trang nhẹ (fade 150ms) và tự cuộn lên đầu khi đổi route.

3) AdminLayout (dùng cho ADMIN và STAFF):
- Sidebar: Dashboard, Sách, Danh mục, Tác giả, NXB, Kho, Đơn hàng, Khách hàng, Người dùng, Thống kê. Mục tự ẩn theo role (STAFF chỉ thấy Sách, Kho, Đơn hàng). Mục đang chọn được đánh dấu, thu gọn được, trên mobile thành drawer.
- Topbar: breadcrumb theo route, tên người dùng + badge vai trò, menu (Hồ sơ, Đăng xuất).
- Vùng nội dung có PageHeader, nền khác trang khách để phân biệt.

Cả ba layout phải bọc ErrorBoundary quanh Outlet và hiển thị tốt ở 360px, 768px, 1280px.

Prompt 4 – Trang đăng nhập /login
(Dùng Prompt 0–3.) Tạo src/pages/auth/LoginPage.jsx dùng AuthLayout.

Giao diện: tiêu đề, ô username, ô password (nút hiện/ẩn mật khẩu), nút "Đăng nhập", link sang /register.

Logic và trạng thái:
- Validate bằng zod: username và password bắt buộc, hiển thị lỗi dưới ô khi blur/submit.
- Submit gọi authApi.login qua AuthContext. Trong lúc gửi: nút loading, các ô disable.
- Sai tài khoản/mật khẩu: hiển thị đúng một thông báo chung "Tên đăng nhập hoặc mật khẩu không chính xác" (không phân biệt sai username hay password), đặt trong khung cảnh báo phía trên form, giữ nguyên username đã nhập, xóa ô mật khẩu và focus vào đó.
- Tài khoản bị khóa: hiện thông báo "Tài khoản đã bị khóa hoặc vô hiệu hóa. Vui lòng liên hệ quản trị viên để được hỗ trợ."
- Lỗi mạng/máy chủ: hiện "Không thể kết nối, vui lòng thử lại" kèm nút thử lại.
- Thành công: chuyển theo role (CUSTOMER về /, ADMIN/STAFF về /admin) hoặc về ?redirect nếu hợp lệ (chặn open redirect: chỉ chấp nhận đường dẫn nội bộ bắt đầu bằng /).
- Nếu đã đăng nhập mà vào /login thì tự chuyển về trang phù hợp.
- Enter để gửi form; accessibility: label, aria-live cho vùng lỗi.

Không lưu mật khẩu ở bất kỳ đâu ngoài state của form.
Prompt 5 – Trang đăng ký /register
(Dùng Prompt 0–3.) Tạo src/pages/auth/RegisterPage.jsx dùng AuthLayout.

Trường: họ và tên, username (4–50 ký tự, không dấu cách), email, số điện thoại (không bắt buộc, định dạng số VN), mật khẩu (tối thiểu 8 ký tự, có chữ và số), nhập lại mật khẩu.

Yêu cầu:
- Validate zod, báo lỗi theo từng ô; chỉ báo ô nhập lại mật khẩu khi khác mật khẩu.
- Thanh đo độ mạnh mật khẩu (yếu/trung bình/mạnh) cập nhật khi gõ.
- Submit: nút loading + disable form. Lỗi 400/409 từ backend như trùng username hoặc email: gắn lỗi vào đúng ô tương ứng (nếu backend chỉ trả message chung thì hiện ở khung cảnh báo phía trên).
- Thành công: Toast "Đăng ký thành công" rồi chuyển /login, điền sẵn username.
- Link sang /login. Responsive, một cột trên mobile.
Prompt 6 – Trang chủ /
(Dùng Prompt 0–3.) Tạo src/pages/customer/HomePage.jsx trong CustomerLayout.

Các khối (mỗi khối tải độc lập, có skeleton riêng, lỗi một khối không làm hỏng khối khác):
1. Hero banner: tiêu đề, câu giới thiệu, ô tìm kiếm lớn (Enter chuyển /books?q=...), nút "Hỏi trợ lý AI" mở ChatWidget.
2. Danh mục nổi bật: lưới chip/thẻ lấy từ API danh mục, bấm vào chuyển /books?category=<id>.
3. Sách mới: 8 cuốn mới nhất (sắp theo created_at giảm dần) dùng BookCard, kèm link "Xem tất cả".
4. Gợi ý cho bạn (AI): chỉ hiện khi đã đăng nhập; gọi aiApi, hiển thị carousel BookCard; nếu AI lỗi hoặc không có dữ liệu thì ẩn khối, không hiện lỗi đỏ.

Yêu cầu: BookCard dùng chung (ảnh có fallback khi lỗi, tên cắt 2 dòng, tác giả, giá VNĐ, nhãn Còn hàng / Sắp hết (<=5) / Hết hàng, nút thêm nhanh vào giỏ). Lazy-load ảnh (loading="lazy"), giữ tỉ lệ ảnh để không giật bố cục. Hover card có hiệu ứng nâng nhẹ. Responsive 2 cột mobile, 4 cột desktop.

Prompt 7 – Danh sách và tìm kiếm sách /books
(Dùng Prompt 0–3.) Tạo src/pages/customer/BookListPage.jsx.

Bố cục: thanh bên bộ lọc (trên mobile thành nút "Bộ lọc" mở drawer) + vùng kết quả.

Bộ lọc và trạng thái URL (useSearchParams): q (từ khóa), category, author, publisher, minPrice, maxPrice, sort (mới nhất, giá tăng, giá giảm, tên A-Z), page, limit. Thay đổi bộ lọc thì reset page=1. Có nút "Xóa bộ lọc" và hiển thị các bộ lọc đang áp dụng dưới dạng tag có thể bỏ từng cái.

Kết quả:
- Dòng tóm tắt: "Tìm thấy N sách cho 'từ khóa'".
- Lưới BookCard; loading lần đầu hiện 12 BookCardSkeleton; khi đổi trang/bộ lọc giữ dữ liệu cũ mờ đi (opacity) cùng thanh tiến trình mảnh phía trên, không nháy trắng.
- Không có kết quả: EmptyState "Không tìm thấy kết quả phù hợp" kèm nút xóa bộ lọc.
- Lỗi: ErrorState có Thử lại.
- Pagination ở cuối, đổi trang thì cuộn lên đầu danh sách.
- Danh sách thể loại, tác giả, NXB cho bộ lọc tải qua service riêng, có skeleton nhỏ.

SearchInput debounce 400ms. Hủy request cũ khi người dùng gõ tiếp (tránh race condition).

Prompt 8 – Chi tiết sách /books/:id
(Dùng Prompt 0–3.) Tạo src/pages/customer/BookDetailPage.jsx.

Giao diện: breadcrumb (Trang chủ / Thể loại / Tên sách); cột trái ảnh sách (có fallback); cột phải: tên, các tác giả theo thứ tự author_order (link lọc theo tác giả), thể loại, NXB, giá lớn, tình trạng kho (Còn hàng N cuốn / Sắp hết / Hết hàng), QuantityInput, nút "Thêm vào giỏ hàng", nút "Mua ngay" (thêm rồi chuyển /cart). Dưới là tab Mô tả (xuống dòng đúng, có nút Xem thêm khi dài). Cuối trang: "Sách cùng thể loại" (4 BookCard).

Logic và trạng thái:
- Loading: DetailSkeleton đúng bố cục. Sách không tồn tại (404): trang "Không tìm thấy sách" có nút về /books. Lỗi khác: ErrorState.
- Số lượng tối thiểu 1, tối đa bằng tồn kho; hết hàng thì khóa QuantityInput và nút, hiện nhãn Hết hàng.
- Chưa đăng nhập bấm thêm giỏ: chuyển /login?redirect=/books/:id.
- Thêm giỏ: nút loading; thành công hiện Toast và tăng badge giỏ ngay (cập nhật lạc quan, hoàn tác nếu lỗi); thất bại "Sản phẩm không đủ số lượng" thì hiện Toast lỗi và tải lại tồn kho.
- Đổi id trên URL thì tải lại, cuộn lên đầu, cập nhật document.title.

Prompt 9 – Giỏ hàng /cart
(Dùng Prompt 0–3.) Tạo src/pages/customer/CartPage.jsx (CUSTOMER).

Giao diện: bảng/danh sách dòng gồm ảnh, tên (link sang chi tiết), đơn giá, QuantityInput, thành tiền, nút Xóa. Bên phải (desktop) hoặc dưới (mobile, cố định đáy) là khung tóm tắt: số sản phẩm, tạm tính, tổng tiền, nút "Đặt hàng". Có link "Tiếp tục mua sắm".

Logic và trạng thái:
- Loading: skeleton các dòng giỏ. Giỏ trống: EmptyState "Giỏ hàng trống" + nút đến /books.
- Đổi số lượng: debounce 500ms rồi gọi API; chỉ dòng đó hiện loading nhỏ và khóa nút +/- của dòng đó, các dòng khác vẫn thao tác được; tổng tiền cập nhật lại từ dữ liệu server khi xong. Lỗi thì hoàn về số lượng cũ và Toast "Sản phẩm không đủ số lượng".
- Xóa: ConfirmModal "Xóa sản phẩm khỏi giỏ hàng?"; xác nhận mới gọi API, dòng biến mất bằng animation thu gọn.
- Dòng có sách hết hàng hoặc vượt tồn kho: viền cảnh báo và dòng chữ giải thích, vô hiệu hóa nút Đặt hàng cho đến khi chỉnh lại.
- Tính tổng bằng hàm tiện ích thuần túy (kiểm thử được), định dạng VNĐ.
- Nút Đặt hàng chuyển /checkout.
Prompt 10 – Đặt hàng /checkout
(Dùng Prompt 0–3.) Tạo src/pages/customer/CheckoutPage.jsx (CUSTOMER).

Bố cục hai cột: trái là form, phải là tóm tắt đơn (danh sách sản phẩm thu gọn, tạm tính, tổng).

Form: họ tên người nhận (điền từ hồ sơ), số điện thoại, địa chỉ nhận hàng (textarea, điền từ hồ sơ, sửa được, bắt buộc), phương thức thanh toán dạng radio card (COD, Chuyển khoản, MoMo; mỗi thẻ có icon và mô tả ngắn), ghi chú (tùy chọn).

Logic và trạng thái:
- Vào trang khi giỏ trống thì chuyển /cart.
- Loading ban đầu: skeleton cho tóm tắt và form.
- Bấm "Xác nhận đặt hàng": mở ConfirmModal xem lại tổng tiền; xác nhận mới gửi. Trong lúc gửi: nút loading, toàn bộ form disable, hiện lớp phủ nhẹ "Đang xử lý đơn hàng...", chặn gửi lần hai (idempotent ở phía client).
- Thành công: xóa dữ liệu giỏ trong CartContext, Toast "Đặt hàng thành công", chuyển /orders/:id. Nếu phương thức là chuyển khoản/MoMo và API trả link hoặc mã QR thì hiện bước thanh toán (trang con hoặc modal) với QR, số tiền, nội dung chuyển khoản, nút "Tôi đã thanh toán" và trạng thái "Đang chờ thanh toán" (polling mỗi 5 giây, có nút dừng).
- Thất bại do hết hàng: hiện danh sách sản phẩm lỗi, nút "Quay lại giỏ hàng để điều chỉnh". Các lỗi khác: Toast lỗi, giữ nguyên dữ liệu form.
- Cảnh báo trước khi rời trang nếu form đã sửa mà chưa gửi.
Prompt 11 – Lịch sử đơn hàng /orders
(Dùng Prompt 0–3.) Tạo src/pages/customer/OrderListPage.jsx (CUSTOMER).

Giao diện: tab lọc theo trạng thái (Tất cả, Chờ xác nhận, Đã xác nhận, Đang chuẩn bị, Đang giao, Đã giao, Đã hủy) lưu trên URL (?status=), mỗi đơn là một thẻ gồm mã đơn, ngày đặt, số sản phẩm, tổng tiền, StatusBadge trạng thái đơn và trạng thái thanh toán, nút "Xem chi tiết"; thẻ hiện 2–3 ảnh sách đầu tiên.

Trạng thái: skeleton thẻ đơn khi tải; rỗng "Bạn chưa có đơn hàng nào" (kèm nút mua sắm; riêng khi lọc thì "Không có đơn nào ở trạng thái này"); lỗi có Thử lại; phân trang; sắp theo mới nhất. Đổi tab thì giữ danh sách cũ mờ đi trong lúc tải.
Prompt 12 – Chi tiết và theo dõi đơn /orders/:id
(Dùng Prompt 0–3.) Tạo src/pages/customer/OrderDetailPage.jsx (CUSTOMER).

Giao diện: tiêu đề "Đơn hàng #mã" + StatusBadge; OrderTimeline ngang (dọc trên mobile) gồm 5 bước Chờ xác nhận, Đã xác nhận, Đang chuẩn bị, Đang giao, Đã giao, bước hiện tại nổi bật, bước đã qua có tích và thời điểm lấy từ lịch sử trạng thái; đơn đã hủy thì hiện timeline rút gọn kèm nhãn Đã hủy và lý do nếu có. Khối thông tin giao hàng, khối thanh toán (phương thức, trạng thái, mã giao dịch nếu có), bảng sản phẩm (ảnh, tên, SL, đơn giá lúc mua, thành tiền), tổng tiền.

Hành vi:
- Nút "Hủy đơn" chỉ hiện khi trạng thái cho phép (PENDING, CONFIRMED); bấm mở ConfirmModal có ô lý do tùy chọn; thành công thì Toast và tải lại dữ liệu.
- Với đơn chưa hoàn tất, tự làm mới trạng thái mỗi 30 giây khi tab đang mở (dừng khi tab ẩn), có nút "Làm mới" thủ công.
- Nút "Mua lại" thêm các sách vào giỏ (bỏ qua sách hết hàng và thông báo).
- Skeleton khi tải, 404 thì "Không tìm thấy đơn hàng", không cho xem đơn của người khác (403 thì hiện trang không có quyền).
Prompt 13 – Hồ sơ cá nhân /profile (và /admin/profile)
(Dùng Prompt 0–3.) Tạo src/pages/shared/ProfilePage.jsx dùng được cho cả CUSTOMER (trong CustomerLayout) và ADMIN/STAFF (trong AdminLayout).

Hai tab: "Thông tin cá nhân" và "Đổi mật khẩu".
- Thông tin: họ tên, email, số điện thoại, địa chỉ; username chỉ đọc; hiện vai trò bằng badge. Form dùng react-hook-form, chỉ bật nút Lưu khi có thay đổi (dirty), lưu xong Toast "Cập nhật thành công" và cập nhật lại AuthContext. Skeleton khi tải.
- Đổi mật khẩu: mật khẩu hiện tại, mật khẩu mới (thanh đo độ mạnh), nhập lại; sai mật khẩu hiện tại thì báo ở đúng ô. Thành công thì Toast và giữ phiên đăng nhập (hoặc yêu cầu đăng nhập lại nếu backend bắt buộc).
- Khách hàng có thêm khối "Đơn hàng gần đây" (3 đơn) với link /orders.
- Cảnh báo khi rời trang nếu có thay đổi chưa lưu.
Prompt 14 – Chat AI tư vấn sách (ChatWidget)
(Dùng Prompt 0–3.) Tạo src/components/features/ChatWidget/ (ChatWidget.jsx, MessageBubble.jsx, BookSuggestionCard.jsx, useChat.js) gắn vào CustomerLayout.

Giao diện:
- Nút tròn nổi góc phải dưới; bấm mở khung chat (panel 380x560 trên desktop, toàn màn hình trên mobile) có animation mở/đóng; header có tiêu đề "Trợ lý sách", nút thu nhỏ và nút xóa cuộc trò chuyện.
- Tin nhắn người dùng bên phải, trợ lý bên trái; tin của trợ lý hỗ trợ xuống dòng và danh sách; dưới tin của trợ lý hiện các BookSuggestionCard (ảnh, tên, tác giả, giá, nút Xem và Thêm vào giỏ) dạng cuộn ngang.
- Màn hình chào lúc đầu với 3–4 câu hỏi gợi ý bấm để gửi (ví dụ "Sách phát triển bản thân cho người mới bắt đầu").
- Ô nhập nhiều dòng tự giãn, Enter gửi, Shift+Enter xuống dòng, giới hạn 500 ký tự có bộ đếm.

Trạng thái:
- Khi chờ phản hồi: bong bóng "đang trả lời" với 3 chấm nhảy, khóa nút gửi, tự cuộn xuống tin mới nhất (không giật nếu người dùng đang cuộn lên đọc).
- Lỗi: tin nhắn lỗi có nút "Gửi lại"; timeout dài thì thông báo thân thiện.
- Chưa đăng nhập: vẫn dùng được nếu API cho phép, nếu không thì hiện lời mời đăng nhập ngay trong khung chat.
- Lưu lịch sử trong sessionStorage để đóng mở không mất; gửi kèm các tin gần nhất làm ngữ cảnh theo đúng tham số của API.
- Bấm "Thêm vào giỏ" trong thẻ gợi ý dùng cùng logic với trang chi tiết (Toast, cập nhật badge giỏ).
- Chặn render HTML thô trong nội dung AI (tránh XSS), chỉ hiển thị văn bản.
Prompt 15 – Dashboard /admin
(Dùng Prompt 0–3.) Tạo src/pages/admin/DashboardPage.jsx (ADMIN).

Giao diện: hàng thẻ tổng quan (doanh thu tháng này, số đơn mới, đơn chờ xử lý, sách sắp hết hàng; mỗi thẻ có icon, số lớn, so sánh với kỳ trước bằng mũi tên xanh/đỏ), biểu đồ đường doanh thu 30 ngày (recharts), danh sách Top 5 sách bán chạy, bảng 5 đơn mới nhất (bấm vào mở chi tiết), danh sách sách sắp hết hàng (link sang /admin/inventory).

Trạng thái: mỗi khối tải độc lập với skeleton và ErrorState riêng (có Thử lại); khối rỗng hiện "Chưa có dữ liệu"; nút "Làm mới" ở đầu trang gọi lại tất cả; hiện thời điểm cập nhật gần nhất. Biểu đồ có tooltip định dạng VNĐ, responsive, màu có đủ tương phản. Thẻ "đơn chờ xử lý" bấm vào chuyển /admin/orders?status=PENDING.
Prompt 16 – Quản lý sách /admin/books
(Dùng Prompt 0–3.) Tạo src/pages/admin/books/BookManagePage.jsx và BookFormModal.jsx (ADMIN thêm/sửa/xóa; STAFF chỉ xem: ẩn các nút ghi).

Trang danh sách: PageHeader có nút "Thêm sách"; thanh công cụ gồm SearchInput, lọc thể loại, lọc tình trạng kho (Tất cả, Còn hàng, Sắp hết, Hết hàng), sắp xếp; DataTable cột ảnh nhỏ, tên, tác giả, thể loại, NXB, giá, tồn kho (badge màu), thao tác (Sửa, Xóa). Phân trang, bộ lọc lưu trên URL.

Form thêm/sửa (modal rộng hoặc trang riêng /admin/books/new, /admin/books/:id/edit): tên (bắt buộc), giá (số > 0, định dạng VNĐ khi hiển thị), mô tả, thể loại (select tải từ API), NXB (select), tác giả (chọn nhiều có tìm kiếm, kéo thả hoặc nút lên/xuống để sắp thứ tự theo author_order), ảnh bìa nếu API hỗ trợ (xem trước, giới hạn dung lượng và định dạng). Tồn kho khi tạo mới chỉ nhập số ban đầu; khi sửa thì hiển thị chỉ đọc kèm link "Nhập kho" (tồn kho đổi qua quy trình kho).

Trạng thái: skeleton bảng, EmptyState "Chưa có sách nào" + nút Thêm; lỗi + Thử lại; dropdown phụ thuộc tải có skeleton nhỏ và xử lý lỗi riêng. Lưu: nút loading, đóng modal và tải lại danh sách, Toast "Thêm/Cập nhật thành công". Xóa: ConfirmModal nêu tên sách; lỗi ràng buộc (sách đã có trong đơn) thì hiện đúng message backend. Cảnh báo khi đóng form có thay đổi chưa lưu.
Prompt 17 – Danh mục, tác giả, nhà xuất bản (CrudTable dùng chung)
(Dùng Prompt 0–3.) Tạo component src/components/features/CrudTable.jsx và 3 trang: /admin/categories, /admin/authors, /admin/publishers (ADMIN), mỗi trang chỉ khai báo cấu hình.

CrudTable nhận cấu hình: title, service (list, create, update, remove), columns, formFields (tên field, nhãn, loại input, schema zod), searchable, deleteWarning. Tự xử lý:
- Danh sách với SearchInput, DataTable, phân trang, skeleton/rỗng/lỗi.
- Nút "Thêm mới" mở Modal form; nút Sửa điền sẵn dữ liệu; Lưu có loading, đóng modal, Toast, tải lại danh sách (hoặc cập nhật cục bộ).
- Lỗi trùng tên: gắn vào ô tên với thông báo "Tên danh mục đã tồn tại" (đổi theo loại), người dùng nhập lại ngay trong modal (không đóng).
- Xóa: ConfirmModal; nếu backend trả lỗi đang được sử dụng thì hiện đúng message (ví dụ "Không thể xóa danh mục vì đang có sản phẩm thuộc danh mục này"); bấm Hủy thì quay lại danh sách.
- Cột "Số sách" (nếu API trả) để người dùng biết mục nào đang dùng.

Cấu hình cụ thể: Danh mục (tên duy nhất, mô tả); Tác giả (tên, tiểu sử); NXB (tên).
Prompt 18 – Quản lý kho /admin/inventory
(Dùng Prompt 0–3.) Tạo src/pages/admin/inventory/InventoryPage.jsx (ADMIN, STAFF).

Hai tab:
1) Tồn kho: DataTable sách với tồn kho, tìm kiếm, bộ lọc nhanh "Sắp hết hàng" (ngưỡng <= 5, cấu hình được ở một hằng số) và "Hết hàng"; dòng sắp hết nền vàng nhạt, hết hàng nền đỏ nhạt; thẻ thống kê nhanh phía trên (tổng đầu sách, số sắp hết, số hết). Mỗi dòng có nút "Nhập kho".
2) Lịch sử biến động: bảng giao dịch kho (thời gian, sách, loại IMPORT/EXPORT_ORDER/ADJUSTMENT dạng badge, số lượng +/- tô màu, ghi chú, người thực hiện), lọc theo loại, theo sách, theo khoảng ngày, phân trang.

Form nhập kho (modal): chọn sách (tìm kiếm có gợi ý), số lượng (số nguyên > 0), ghi chú (tùy chọn). Có thêm chế độ "Điều chỉnh" cho số lượng âm/dương và bắt buộc ghi chú lý do. Lưu: loading, Toast, cập nhật dòng tương ứng và lịch sử.

Trạng thái chuẩn: skeleton, rỗng, lỗi + Thử lại, cảnh báo xác nhận khi điều chỉnh làm tồn kho âm (chặn ở client và hiển thị message server).
Prompt 19 – Quản lý đơn hàng /admin/orders
(Dùng Prompt 0–3.) Tạo src/pages/admin/orders/OrderManagePage.jsx (ADMIN, STAFF).

Thanh công cụ: SearchInput (mã đơn, tên hoặc email khách), lọc trạng thái đơn (tab có đếm số lượng), lọc trạng thái thanh toán, lọc khoảng ngày, sắp xếp. Tất cả lưu trên URL.

Bảng: mã đơn (link), khách hàng, ngày đặt, tổng tiền, StatusBadge đơn, StatusBadge thanh toán, phương thức thanh toán, thao tác nhanh. Thao tác nhanh trên dòng: nút "Xác nhận" cho đơn PENDING và menu chuyển sang trạng thái kế tiếp hợp lệ (chỉ hiện các bước được phép theo luồng PENDING -> CONFIRMED -> PREPARING -> SHIPPING -> DELIVERED, và Hủy khi còn cho phép). Hỗ trợ chọn nhiều dòng và "Xác nhận hàng loạt" cho đơn PENDING, hiện kết quả từng đơn (thành công/thất bại).

Trạng thái: skeleton bảng, rỗng "Không có đơn hàng nào", lỗi + Thử lại, phân trang. Đổi trạng thái: nút loading ngay trên dòng, cập nhật cục bộ khi thành công, Toast; lỗi thì hoàn tác và hiện message. Có nút tự làm mới danh sách mỗi 60 giây (bật/tắt được) để theo dõi đơn mới, kèm chấm báo "có đơn mới".
Prompt 20 – Chi tiết đơn (admin) /admin/orders/:id
(Dùng Prompt 0–3.) Tạo src/pages/admin/orders/AdminOrderDetailPage.jsx (ADMIN, STAFF).

Bố cục: cột chính gồm tiêu đề mã đơn + badge, OrderTimeline, bảng sản phẩm (ảnh, tên, SL, đơn giá lúc mua, thành tiền), tổng tiền; cột phụ gồm khách hàng (tên, SĐT, email, link tới hồ sơ nếu là ADMIN), địa chỉ giao, thanh toán (phương thức, trạng thái, mã giao dịch, số tiền), và khung hành động.

Khung hành động: hiển thị duy nhất các nút chuyển trạng thái hợp lệ tiếp theo (ví dụ đơn PENDING có "Xác nhận đơn" và "Hủy đơn"); mỗi nút mở ConfirmModal có ô ghi chú (bắt buộc với Hủy); khi đang gửi thì loading và khóa các nút. Đơn đã DELIVERED hoặc CANCELLED thì không còn nút.

Tab "Lịch sử trạng thái": danh sách (trạng thái cũ -> mới, người thực hiện, thời điểm, ghi chú) sắp từ mới đến cũ. Nút In phiếu giao hàng (CSS in riêng, ẩn sidebar).

Trạng thái: DetailSkeleton, 404 "Không tìm thấy đơn hàng", lỗi + Thử lại; sau khi đổi trạng thái tải lại đơn và lịch sử, Toast kết quả.
Prompt 21 – Quản lý khách hàng /admin/customers
(Dùng Prompt 0–3.) Tạo src/pages/admin/customers/CustomerManagePage.jsx và CustomerDetailPage.jsx (ADMIN).

Danh sách: SearchInput (tên, email, SĐT), bảng (họ tên, email, SĐT, ngày tạo, số đơn, tổng chi tiêu nếu API có, badge trạng thái), phân trang, bấm dòng mở chi tiết.

Chi tiết /admin/customers/:id: khối thông tin (sửa được họ tên, SĐT, địa chỉ qua form có validate), khối thống kê nhanh (số đơn, tổng chi tiêu), tab "Lịch sử mua hàng" là bảng đơn của khách (mã đơn link sang /admin/orders/:id, ngày, tổng tiền, trạng thái).

Trạng thái: skeleton, rỗng "Chưa có khách hàng" / "Khách chưa có đơn hàng", lỗi + Thử lại, 404 khi không tồn tại. Lưu thông tin: nút loading, Toast, cập nhật tại chỗ.
Prompt 22 – Quản lý người dùng và phân quyền /admin/users
(Dùng Prompt 0–3.) Tạo src/pages/admin/users/UserManagePage.jsx (chỉ ADMIN).

Bảng: họ tên, username, email, vai trò (badge CUSTOMER/STAFF/ADMIN), trạng thái (badge Hoạt động/Đã khóa), ngày tạo, thao tác. Thanh công cụ: SearchInput, lọc vai trò, lọc trạng thái, phân trang, nút "Thêm nhân viên" nếu API hỗ trợ.

Thao tác:
- Đổi vai trò: modal chọn vai trò (radio) kèm mô tả quyền của từng vai trò, nút Lưu / Hủy (Hủy thì đóng và không đổi gì).
- Khóa / Mở khóa: ConfirmModal nêu rõ hậu quả ("Người dùng sẽ không thể đăng nhập"); dùng switch hoặc nút, có loading trên dòng.
- Quy tắc an toàn: với dòng của chính tài khoản đang đăng nhập thì vô hiệu hóa nút khóa và đổi vai trò, có tooltip "Bạn không thể khóa hoặc đổi quyền chính mình"; nếu vẫn có cách kích hoạt (ví dụ phím tắt) thì hiện cảnh báo thay vì gửi API. Chặn hạ quyền admin cuối cùng nếu API cho biết.

Trạng thái: skeleton bảng, rỗng "Không có người dùng phù hợp", lỗi + Thử lại, Toast cập nhật thành công, cập nhật cục bộ sau khi lưu rồi đồng bộ lại từ server.
Prompt 23 – Thống kê và báo cáo /admin/statistics
(Dùng Prompt 0–3.) Tạo src/pages/admin/statistics/StatisticsPage.jsx (ADMIN).

Bộ lọc đầu trang: loại báo cáo (tab Doanh thu, Đơn hàng, Sản phẩm bán chạy), khoảng thời gian (chọn nhanh Hôm nay, 7 ngày, 30 ngày, Tháng này, Tùy chọn từ ngày - đến ngày), kiểu gom (ngày/tuần/tháng) cho biểu đồ. Validate: từ ngày <= đến ngày, không vượt hiện tại. Thay đổi bộ lọc lưu trên URL; có nút "Áp dụng" để tránh gọi API liên tục.

Nội dung:
- Thẻ tổng hợp: tổng doanh thu, số đơn hoàn thành, giá trị đơn trung bình.
- Biểu đồ: doanh thu/đơn theo thời gian (đường hoặc cột), sản phẩm bán chạy dạng cột ngang; tooltip VNĐ; responsive.
- Bảng số liệu bên dưới có sắp xếp theo cột, tổng cộng ở chân bảng.
- Nút "Xuất báo cáo" (menu PDF / Excel): gọi API tải file dạng blob, nút loading "Đang tạo file...", tải xuống bằng tên file có khoảng ngày, Toast khi xong hoặc lỗi.

Trạng thái: skeleton cho thẻ, biểu đồ, bảng; không có dữ liệu thì EmptyState "Không có dữ liệu để thống kê" (ẩn nút xuất); lỗi + Thử lại; khi đổi bộ lọc giữ dữ liệu cũ mờ đi cho đến khi có kết quả mới.
Prompt 24 – Trang hệ thống: 403, 404, 500, màn hình chờ
(Dùng Prompt 0–3.) Tạo src/pages/system/: ForbiddenPage (403), NotFoundPage (404), ServerErrorPage (500) và component AppLoading (màn hình chờ khi AuthContext khởi tạo).

- Mỗi trang có minh họa SVG đơn giản, tiêu đề, mô tả thân thiện, nút "Về trang chủ" (ADMIN/STAFF thì về /admin) và nút "Quay lại".
- 403: nếu chưa đăng nhập thì nút chính là "Đăng nhập".
- 404: gợi ý ô tìm kiếm sách.
- 500 và ErrorBoundary: nút "Tải lại trang", không lộ chi tiết lỗi kỹ thuật cho người dùng.
- AppLoading: logo + thanh tiến trình, chỉ hiện sau 200ms để tránh nháy khi tải nhanh.
- Đặt tiêu đề trình duyệt phù hợp cho từng trang.
Kiểm tra nghiệm thu chung (dán sau mỗi trang)
Trước khi kết thúc, hãy tự kiểm tra theo danh sách: (1) không có chuỗi URL ngoài endpoints.js; (2) đủ 4 trạng thái loading/rỗng/lỗi/thành công; (3) nút gửi có loading và disable; (4) thao tác xóa/hủy/khóa có xác nhận; (5) bộ lọc và phân trang nằm trên URL; (6) hiển thị tốt ở 360px, 768px, 1280px; (7) phân quyền route đúng; (8) liệt kê các giả định về field API để tôi đối chiếu Swagger.