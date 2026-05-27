# Supabase cho GHTK Clone

Project hiện dùng Supabase cho:

- Đăng ký, đăng nhập.
- Lưu profile và role.
- Quản lý customer.
- Quản lý đơn hàng.
- Lịch sử vận chuyển.
- Quản lý admin.
- Bưu cục.
- Cấu hình phí vận chuyển.

## File quan trọng

- `config/supabase.ts`: cấu hình Supabase client.
- `services/customerApi.ts`: auth, profile, đăng ký doanh nghiệp.
- `services/orderApi.ts`: tạo đơn, danh sách đơn, chi tiết đơn, tracking.
- `services/adminApi.ts`: dữ liệu admin, role, khóa tài khoản, bưu cục, phí.
- `supabase/schema.sql`: SQL tạo database từ project trắng.
- `docs/SUPABASE_SETUP.md`: hướng dẫn từng bước.

## Chạy từ database trắng

Đọc và làm theo:

```text
docs/SUPABASE_SETUP.md
```

## Tạo admin nhanh

Sau khi đăng ký tài khoản trong app, vào Supabase SQL Editor chạy:

```sql
UPDATE public.profiles
SET role = 'admin', status = 'active'
WHERE email = 'email-admin-cua-ban@example.com';
```

Đăng xuất rồi đăng nhập lại, app sẽ tự chuyển vào màn admin.
