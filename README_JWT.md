# JWT Authentication Implementation

Ứng dụng đã được tích hợp JWT (JSON Web Token) authentication để quản lý phiên đăng nhập an toàn.

## Tổng quan

### Các thành phần chính:
1. **AuthService** (`services/authService.ts`) - Quản lý JWT tokens
2. **AuthContext** (`contexts/AuthContext.tsx`) - React Context cho authentication state
3. **AuthProvider** - Wrapper toàn bộ app
4. **Secure Storage** - Lưu token bằng AsyncStorage

## Cách hoạt động

### 1. Đăng ký/Đăng nhập
- User đăng ký/đăng nhập thành công
- Server trả về user data
- `AuthService.generateToken()` tạo JWT token
- Token được lưu trong AsyncStorage
- AuthContext cập nhật user state

### 2. Authentication Flow
- App khởi động → AuthProvider check token
- Token hợp lệ → Chuyển đến Dashboard
- Token hết hạn/không có → Chuyển đến Login

### 3. Bảo mật
- JWT secret được lưu trong `config/environment.ts`
- Token có thời hạn 24 giờ
- Token được verify trước mỗi request

## Sử dụng trong Components

```typescript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <View>
      <Text>Chào {user?.name}!</Text>
      <Button title="Đăng xuất" onPress={logout} />
    </View>
  );
}
```

## API Calls với Authentication

```typescript
import { authService } from '../services/authService';

async function makeAuthenticatedRequest() {
  const token = await authService.getToken();

  const response = await fetch('/api/protected', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
}
```

## Cấu hình Production

### 1. Environment Variables
```typescript
// config/environment.ts
export const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET || 'fallback-secret',
  EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
};

export const SUPABASE_CONFIG = {
  URL: process.env.SUPABASE_URL,
  ANON_KEY: process.env.SUPABASE_ANON_KEY,
};
```

### 2. Secure Secret Storage
- Sử dụng Keychain (iOS) / Keystore (Android) thay vì AsyncStorage
- Rotate JWT secret định kỳ
- Implement refresh tokens

### 3. Token Validation
- Validate token trên server-side cho mọi protected API
- Implement token blacklist cho logout
- Handle token expiration gracefully

## Lưu ý Bảo mật

⚠️ **Quan trọng:**
- KHÔNG commit JWT secret vào Git
- Sử dụng HTTPS cho tất cả requests
- Implement rate limiting
- Validate input data kỹ lưỡng
- Hash passwords trước khi lưu database

## Testing

```bash
# Test login flow
npm run test -- --testPathPattern=auth

# Test token validation
npm run test -- --testPathPattern=jwt
```