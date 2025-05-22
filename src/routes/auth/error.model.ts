import { UnauthorizedException, UnprocessableEntityException } from '@nestjs/common'

// OTP
export const InvalidOTPException = new UnprocessableEntityException([
  { message: 'Mã OTP không hợp lệ', path: 'code', key: 'INVALID_OTP' },
])
export const OTPExpiredException = new UnprocessableEntityException([
  { message: 'Mã OTP đã hết hạn', path: 'code', key: 'OTP_EXPIRED' },
])
export const SendOTPFailedException = new UnprocessableEntityException([
  { message: 'Gửi mã OTP thất bại', path: 'code', key: 'SEND_OTP_FAILED' },
])

// Email
export const EmailAlreadyExistsException = new UnprocessableEntityException([
  { message: 'Email đã tồn tại', path: 'email', key: 'EMAIL_ALREADY_EXISTS' },
])
export const InvalidEmailException = new UnprocessableEntityException([
  { message: 'Email không hợp lệ', path: 'email', key: 'INVALID_EMAIL' },
])

// Phone Number
export const PhoneNumberAlreadyExistsException = new UnprocessableEntityException([
  { message: 'Số điện thoại đã tồn tại', path: 'phoneNumber', key: 'PHONE_NUMBER_ALREADY_EXISTS' },
])
export const InvalidPhoneNumberException = new UnprocessableEntityException([
  { message: 'Số điện thoại không hợp lệ', path: 'phoneNumber', key: 'INVALID_PHONE_NUMBER' },
])

// Password
export const PasswordNotMatchException = new UnprocessableEntityException([
  { message: 'Mật khẩu không khớp', path: 'password', key: 'PASSWORD_NOT_MATCH' },
])
export const PasswordNotTrueException = new UnprocessableEntityException([
  { message: 'Mật khẩu không đúng', path: 'password', key: 'PASSWORD_NOT_TRUE' },
])

// User
export const UserNotFoundException = new UnprocessableEntityException([
  { message: 'Tài khoản không tồn tại', path: 'email', key: 'USER_NOT_FOUND' },
])
export const UserNotVerifiedException = new UnprocessableEntityException([
  { message: 'Tài khoản chưa được xác thực', path: 'email', key: 'USER_NOT_VERIFIED' },
])
export const UserNotActiveException = new UnprocessableEntityException([
  { message: 'Tài khoản không hoạt động', path: 'email', key: 'USER_NOT_ACTIVE' },
])

// Refresh Token
export const InvalidRefreshTokenException = new UnprocessableEntityException([
  { message: 'Refresh token không hợp lệ', path: 'refreshToken', key: 'INVALID_REFRESH_TOKEN' },
])
export const RefreshTokenExpiredException = new UnprocessableEntityException([
  { message: 'Refresh token đã hết hạn', path: 'refreshToken', key: 'REFRESH_TOKEN_EXPIRED' },
])

// common
export const UnauthorizedExceptionCustom = new UnauthorizedException([
  { message: 'Không có quyền truy cập', path: 'unauthorized', key: 'UNAUTHORIZED' },
])

// google
export const GoogleInvalidEmailException = new UnprocessableEntityException([
  { message: 'Không thể lấy thông tin email từ google', path: 'email', key: 'GOOGLE_INVALID_EMAIL' },
])
export const GoogleLoginFailedException = new UnprocessableEntityException([
  { message: 'Đăng nhập với google thất bại', path: 'google', key: 'GOOGLE_LOGIN_FAILED' },
])
