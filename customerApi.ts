import {
  apiRequest,
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  saveAuthTokens,
  API_BASE_URL,
} from "./apiClient";

// Supabase client nhẹ chỉ dùng để upload ảnh lên Storage
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

type UserRole = "admin" | "dispatcher" | "warehouse" | "shipper" | "customer";

type RegisterCustomerInput = {
  storeName: string;
  phone: string;
  email: string;
  address: string;
  password: string;
  rePassword: string;
};

type LoginCustomerInput = {
  account: string;
  password: string;
};

export type CustomerProfile = {
  id: string;
  full_name?: string;
  store_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  role: UserRole;
  status?: string;
  warehouse_name?: string;
  created_at?: string;
  avatar_url?: string;
  cccd_front_url?: string;
  cccd_back_url?: string;
  business_license_url?: string;
};

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  role: UserRole;
  message?: string;
  user?: CustomerProfile;
};

type BusinessRequestInput = {
  fullName: string;
  phone: string;
  email: string;
  company: string;
  taxCode: string;
};

function cleanText(value: string) {
  return value.trim();
}

function cleanEmail(value: string) {
  return value.trim().toLowerCase();
}

function cleanPhone(value: string) {
  return value.trim().replace(/\D/g, "");
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/.test(password);
}

export { getAccessToken, getRefreshToken };

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Có lỗi xảy ra, vui lòng thử lại";
}

export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  const data = await apiRequest<{ accessToken: string; refreshToken: string }>(
    "/auth/refresh",
    {
      method: "POST",
      skipAuth: true,
      body: { refreshToken },
    },
  );

  await saveAuthTokens(data.accessToken, data.refreshToken);
  return data.accessToken || null;
}

export async function registerCustomer(input: RegisterCustomerInput) {
  const storeName = cleanText(input.storeName);
  const phone = cleanPhone(input.phone);
  const email = cleanEmail(input.email);
  const address = cleanText(input.address);
  const { password, rePassword } = input;

  if (!storeName || !phone || !email || !address || !password || !rePassword) {
    throw new Error("Vui lòng nhập đầy đủ thông tin");
  }
  if (!/^\d{10}$/.test(phone)) {
    throw new Error("Số điện thoại phải đủ 10 số");
  }
  if (!isValidEmail(email)) {
    throw new Error("Email không hợp lệ");
  }
  if (!isStrongPassword(password)) {
    throw new Error("Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt");
  }
  if (password !== rePassword) {
    throw new Error("Mật khẩu xác nhận không khớp");
  }

  return apiRequest<{ message: string }>("/auth/register", {
    method: "POST",
    skipAuth: true,
    body: {
      full_name: storeName,
      phone,
      email,
      address,
      password,
    },
  });
}

export async function loginCustomer(input: LoginCustomerInput): Promise<LoginResponse> {
  const account = cleanText(input.account);
  const password = input.password;

  if (!account || !password) {
    throw new Error("Vui lòng nhập tài khoản và mật khẩu");
  }

  if (account.includes("@") && !isValidEmail(account)) {
    throw new Error("Email không hợp lệ");
  }

  if (!account.includes("@") && !/^\d{10}$/.test(cleanPhone(account))) {
    throw new Error("Số điện thoại phải đủ 10 số hoặc nhập email hợp lệ");
  }

  const session = await apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    skipAuth: true,
    body: {
      account: account.includes("@") ? cleanEmail(account) : cleanPhone(account),
      password,
    },
  });

  await saveAuthTokens(session.accessToken, session.refreshToken);
  return session;
}

export async function getCurrentCustomer(): Promise<CustomerProfile | null> {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  return apiRequest<CustomerProfile>("/users/me", {
    method: "GET",
  });
}

export async function logoutCustomer() {
  await clearAuthTokens();
  return true;
}

// Cap nhat thong tin ho so khach hang (ten shop, sdt, dia chi)
// BE dung PUT va tra ve { message, data } nen phai unwrap result.data
export async function updateProfile(input: {
  storeName?: string;
  phone?: string;
  address?: string;
  avatar_url?: string;
}): Promise<CustomerProfile> {
  const body: Record<string, string> = {};
  if (input.storeName !== undefined) body.full_name = cleanText(input.storeName);
  if (input.phone !== undefined) body.phone = cleanPhone(input.phone);
  if (input.address !== undefined) body.address = cleanText(input.address);
  if (input.avatar_url !== undefined) body.avatar_url = input.avatar_url;

  const result = await apiRequest<{ message: string; data: CustomerProfile }>("/users/me", {
    method: "PUT",
    body,
  });

  return result.data;
}

// Doi mat khau khach hang — can mat khau cu de xac thuc
export async function changePassword(input: {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  const { oldPassword, newPassword, confirmPassword } = input;

  if (!oldPassword) throw new Error("Vui long nhap mat khau hien tai");
  if (!isStrongPassword(newPassword)) {
    throw new Error("Mat khau moi phai co chu hoa, chu thuong, so va ky tu dac biet");
  }
  if (newPassword !== confirmPassword) {
    throw new Error("Mat khau xac nhan khong khop");
  }

  return apiRequest<{ message: string }>("/users/me/password", {
    method: "POST",
    body: { oldPassword, newPassword },
  });
}

export async function registerBusinessRequest(input: BusinessRequestInput) {
  const fullName = cleanText(input.fullName);
  const phone = cleanPhone(input.phone);
  const email = cleanEmail(input.email);
  const company = cleanText(input.company);
  const taxCode = cleanText(input.taxCode);

  if (!fullName || !phone || !email || !company || !taxCode) {
    throw new Error("Vui lòng nhập đầy đủ thông tin doanh nghiệp");
  }
  if (!/^\d{10}$/.test(phone)) {
    throw new Error("Số điện thoại phải đủ 10 số");
  }
  if (!isValidEmail(email)) {
    throw new Error("Email không hợp lệ");
  }

  return apiRequest<{ data: unknown; message: string }>("/public/business-request", {
    method: "POST",
    skipAuth: true,
    body: {
      fullName,
      phone,
      email,
      company,
      taxCode,
    },
  });
}

// ─── Upload ảnh lên Supabase Storage ───────────────────────────────────────
// bucket phải được tạo sẵn trong Supabase Storage với tên "user-assets"
// Cấu hình bucket: Public bucket để URL có thể dùng trực tiếp

export type ImageUploadType = "avatar" | "cccd_front" | "cccd_back" | "business_license";

/**
 * Upload một ảnh lên Supabase Storage.
 * @param userId  - ID của người dùng (dùng làm tên thư mục)
 * @param fileUri - URI local của ảnh (từ ImagePicker hoặc DocumentPicker)
 * @param type    - Loại ảnh để xác định tên file và thư mục
 * @returns Public URL của ảnh sau khi upload thành công
 */
export async function uploadUserImage(
  userId: string,
  fileUri: string,
  type: ImageUploadType,
): Promise<string> {
  // Lấy extension từ URI
  const ext = fileUri.split(".").pop()?.toLowerCase() || "jpg";
  const mimeType = ext === "png" ? "image/png" : "image/jpeg";
  const fileName = `${type}.${ext}`;
  const storagePath = `${userId}/${fileName}`;

  // Đọc file thành blob (hoạt động cả trên React Native và Web)
  const response = await fetch(fileUri);
  const blob = await response.blob();

  const { error } = await supabaseClient.storage
    .from("user-assets")
    .upload(storagePath, blob, {
      contentType: mimeType,
      upsert: true, // Ghi đè nếu đã tồn tại
    });

  if (error) {
    throw new Error(`Upload ảnh thất bại: ${error.message}`);
  }

  const { data: urlData } = supabaseClient.storage
    .from("user-assets")
    .getPublicUrl(storagePath);

  return urlData.publicUrl;
}