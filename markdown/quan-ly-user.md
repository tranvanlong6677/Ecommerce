# Yêu cầu về quản lý user

Hệ thống chúng ta coi Admin là quyền hạn quản lý cao nhất, giống như `root` hay `superuser` trong một số hệ thống khác.

Nếu bạn muốn quản lý người dùng, có thể dùng role admin hoặc giải pháp an toàn hơn là bạn tạo thêm một role `manager` hoặc `sub-admin` để quản lý user. Cho dù các role này bạn add full permissions thì vẫn bị một số hạn chế không được như role admin.

Mọi Role có permissions đến các API user đều có thể gọi nhưng có 1 số lưu ý

## Tạo user: POST /users

```json
{
  "email": "duthanhduoc14@gmail.com",
  "name": "Dư Thanh Được",
  "phoneNumber": "123098123",
  "avatar": "google.com",
  "password": "123456",
  "roleId": 1,
  "status": "ACTIVE"
}
```

- Chỉ có Role Admin mới được tạo user với roleId là admin

## Cập nhật user: PUT /users/:userId

body tương tự như tạo user

```json
{
  "email": "duthanhduoc12@gmail.com",
  "name": "Dư Thanh Được",
  "phoneNumber": "123098123",
  "avatar": "google.com",
  "password": "123456",
  "roleId": 2,
  "status": "ACTIVE"
}
```

- Chỉ có Role Admin mới được cập nhật user với roleId là admin, hoặc lên cấp role thành admin
- Bạn không thể cập nhật chính mình

## Xóa user: DELETE /users/:userId

- Chỉ có Role Admin mới được xóa user với roleId là admin
- Bạn không thể xóa chính mình

## Lấy danh sách user: GET /users

- Hỗ trợ phân trang
- Trả về kết quả kèm role name trong từng user

## Lấy thông tin user: GET /users/:userId

- Trả về kết quả tương tự api get profile cá nhân
