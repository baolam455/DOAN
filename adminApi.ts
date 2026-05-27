import { apiRequest } from "./apiClient";
import type { OrderStatus } from "./orderApi";

export type AdminRole =
  | "admin"
  | "dispatcher"
  | "warehouse"
  | "shipper"
  | "customer";

export type AdminAccountStatus =
  | "active"
  | "locked_short"
  | "locked_long"
  | "disabled";

export type AdminUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: AdminRole;
  status: AdminAccountStatus;
  warehouseName?: string;
  lastActiveAt: string;
  createdAt: string;
  totalOrders: number;
  successRate: number;
};

export type AdminOrder = {
  id: string;
  code: string;
  customerName: string;
  receiverName: string;
  route: string;
  status: OrderStatus;
  codAmount: number;
  shippingFee: number;
  assignedShipper?: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminPostOffice = {
  id: string;
  code: string;
  name: string;
  province: string;
  district: string;
  address: string;
  lat: number;
  lng: number;
  staffCount: number;
  activeShipperCount: number;
  queueOrders: number;
};

export type ShippingFeeRule = {
  id: string;
  name: string;
  distanceFromKm: number;
  distanceToKm: number;
  weightFromKg: number;
  weightToKg: number;
  baseFee: number;
  extraFeePerKg: number;
  active: boolean;
};

export type AdminStats = {
  totalUsers: number;
  activeUsers: number;
  lockedUsers: number;
  totalOrders: number;
  deliveringOrders: number;
  completedOrders: number;
  completionRate: number;
  revenue: number;
  avgDeliveryHours: number;
  activeShippers: number;
  postOffices: number;
  systemAlerts: number;
};

export type AdminDashboardData = {
  stats: AdminStats;
  users: AdminUser[];
  orders: AdminOrder[];
  postOffices: AdminPostOffice[];
  feeRules: ShippingFeeRule[];
  synced: boolean;
};

export type AdminUserDraft = {
  fullName: string;
  email: string;
  phone: string;
  role: AdminRole;
  password: string;        // Mat khau tam admin dat cho user lan dau
  warehouseName?: string;
};

type RawProfile = {
  id: string;
  full_name?: string | null;
  store_name?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  status?: string | null;
  warehouse_name?: string | null;
  last_active_at?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
  total_orders?: number | null;
  success_rate?: number | null;
};

type RawPostOffice = {
  id?: string | null;
  code?: string | null;
  name?: string | null;
  province?: string | null;
  district?: string | null;
  address?: string | null;
  lat?: number | string | null;
  lng?: number | string | null;
  staff_count?: number | string | null;
  active_shipper_count?: number | string | null;
  queue_orders?: number | string | null;
};

type RawShippingFeeRule = {
  id: string;
  name?: string | null;
  distance_from_km?: number | string | null;
  distance_to_km?: number | string | null;
  weight_from_kg?: number | string | null;
  weight_to_kg?: number | string | null;
  base_fee?: number | string | null;
  extra_fee_per_kg?: number | string | null;
  active?: boolean | null;
};

const nowIso = () => new Date().toISOString();

function normalizeRole(value: unknown): AdminRole {
  if (
    value === "admin" ||
    value === "dispatcher" ||
    value === "warehouse" ||
    value === "shipper" ||
    value === "customer"
  ) {
    return value;
  }

  return "customer";
}

function normalizeStatus(value: unknown): AdminAccountStatus {
  if (
    value === "active" ||
    value === "locked_short" ||
    value === "locked_long" ||
    value === "disabled"
  ) {
    return value;
  }

  return "active";
}

function isOrderStatus(value: unknown): value is OrderStatus {
  return [
    "pending",
    "picked_up",
    "in_transit",
    "delivering",
    "delivered",
    "returned",
    "cancelled",
  ].includes(String(value));
}

function toAdminUser(row: RawProfile): AdminUser {
  const createdAt = row.created_at || nowIso();

  return {
    id: row.id,
    fullName: row.full_name || row.store_name || row.email || "Chưa đặt tên",
    email: row.email || "",
    phone: row.phone || "",
    role: normalizeRole(row.role),
    status: normalizeStatus(row.status),
    warehouseName: row.warehouse_name || undefined,
    lastActiveAt: row.last_active_at || row.updated_at || createdAt,
    createdAt,
    totalOrders: Number(row.total_orders || 0),
    successRate: Number(row.success_rate || 0),
  };
}

function toPostOffice(row: RawPostOffice): AdminPostOffice {
  const code = row.code || String(row.id || "");

  return {
    id: String(row.id || code),
    code,
    name: row.name || "Bưu cục",
    province: row.province || "",
    district: row.district || "",
    address: row.address || "",
    lat: Number(row.lat || 0),
    lng: Number(row.lng || 0),
    staffCount: Number(row.staff_count || 0),
    activeShipperCount: Number(row.active_shipper_count || 0),
    queueOrders: Number(row.queue_orders || 0),
  };
}

function toFeeRule(row: RawShippingFeeRule): ShippingFeeRule {
  return {
    id: row.id,
    name: row.name || "Khung phí",
    distanceFromKm: Number(row.distance_from_km || 0),
    distanceToKm: Number(row.distance_to_km || 0),
    weightFromKg: Number(row.weight_from_kg || 0),
    weightToKg: Number(row.weight_to_kg || 0),
    baseFee: Number(row.base_fee || 0),
    extraFeePerKg: Number(row.extra_fee_per_kg || 0),
    active: Boolean(row.active),
  };
}

function toAdminStats(users: AdminUser[], orders: AdminOrder[], offices: AdminPostOffice[]): AdminStats {
  const deliveringStatuses: OrderStatus[] = ["picked_up", "in_transit", "delivering"];
  const completedOrders = orders.filter((order) => order.status === "delivered");
  const revenue = completedOrders.reduce((sum, order) => sum + order.shippingFee, 0);

  return {
    totalUsers: users.length,
    activeUsers: users.filter((user) => user.status === "active").length,
    lockedUsers: users.filter((user) => user.status !== "active").length,
    totalOrders: orders.length,
    deliveringOrders: orders.filter((order) => deliveringStatuses.includes(order.status)).length,
    completedOrders: completedOrders.length,
    completionRate: orders.length ? Math.round((completedOrders.length / orders.length) * 100) : 0,
    revenue,
    avgDeliveryHours: 0,
    activeShippers: users.filter((user) => user.role === "shipper" && user.status === "active").length,
    postOffices: offices.length,
    systemAlerts: users.filter((user) => user.status !== "active").length,
  };
}

export function roleLabel(role: AdminRole) {
  switch (role) {
    case "admin":
      return "Admin";
    case "dispatcher":
      return "Điều phối";
    case "warehouse":
      return "Nhân viên kho";
    case "shipper":
      return "Shipper";
    case "customer":
      return "Customer";
    default:
      return role;
  }
}

export function accountStatusLabel(status: AdminAccountStatus) {
  switch (status) {
    case "active":
      return "Đang hoạt động";
    case "locked_short":
      return "Khóa ngắn hạn";
    case "locked_long":
      return "Khóa dài hạn";
    case "disabled":
      return "Vô hiệu hóa";
    default:
      return status;
  }
}

export function orderStatusLabel(status: OrderStatus) {
  switch (status) {
    case "pending":
      return "Chờ lấy hàng";
    case "picked_up":
      return "Đã lấy hàng";
    case "in_transit":
      return "Đang vận chuyển";
    case "delivering":
      return "Đang giao";
    case "delivered":
      return "Hoàn thành";
    case "returned":
      return "Hoàn hàng";
    case "cancelled":
      return "Đã hủy";
    default:
      return status;
  }
}

export function formatCurrency(amount: number) {
  return amount.toLocaleString("vi-VN") + "đ";
}

export function formatDateTime(value: string) {
  const date = new Date(value);
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const [profiles, orders, postOffices, feeRules] = await Promise.all([
    apiRequest<RawProfile[]>("/admin/users"),
    apiRequest<AdminOrder[]>("/admin/orders"),
    apiRequest<RawPostOffice[]>("/admin/post-offices"),
    apiRequest<RawShippingFeeRule[]>("/admin/shipping-fee-rules"),
  ]);

  const users = profiles.map(toAdminUser);
  const offices = postOffices.map(toPostOffice);
  const normalizedOrders = orders.map((order) => ({
    ...order,
    status: isOrderStatus(order.status) ? order.status : "pending",
  }));

  return {
    users,
    orders: normalizedOrders,
    postOffices: offices,
    feeRules: feeRules.map(toFeeRule),
    stats: toAdminStats(users, normalizedOrders, offices),
    synced: true,
  };
}

export async function updateAdminUserRole(userId: string, role: AdminRole) {
  await apiRequest<{ message: string }>("/admin/set-role", {
    method: "POST",
    body: { userId, role },
  });

  return true;
}

export async function updateAdminUserStatus(
  userId: string,
  status: AdminAccountStatus,
) {
  await apiRequest<{ message: string }>("/admin/set-status", {
    method: "POST",
    body: { userId, status },
  });

  return true;
}

// Tao tai khoan user moi — propagate error de caller xu ly (khong duoc swallow)
export async function createAdminUserProfile(input: AdminUserDraft): Promise<AdminUser> {
  const data = await apiRequest<RawProfile>("/admin/users", {
    method: "POST",
    body: input,
  });

  return toAdminUser(data);
}

export async function deleteAdminUser(userId: string) {
  await apiRequest<{ message: string }>(`/admin/users/${userId}`, {
    method: "DELETE",
  });

  return true;
}

export async function updateAdminOrderStatus(orderId: string, status: OrderStatus) {
  await apiRequest<{ message: string }>(`/admin/orders/${orderId}/status`, {
    method: "PATCH",
    body: { status },
  });

  return true;
}

export async function toggleShippingFeeRule(ruleId: string, active: boolean) {
  await apiRequest<{ message: string }>(`/admin/shipping-fee-rules/${ruleId}`, {
    method: "PATCH",
    body: { active },
  });

  return true;
}

export function distanceInKm(
  latA: number,
  lngA: number,
  latB: number,
  lngB: number,
) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(latB - latA);
  const dLng = toRad(lngB - lngA);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(latA)) *
      Math.cos(toRad(latB)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

export function findNearestPostOffices(
  postOffices: AdminPostOffice[],
  lat: number,
  lng: number,
  limit = 5,
) {
  return postOffices
    .map((office) => ({
      office,
      distanceKm: distanceInKm(lat, lng, office.lat, office.lng),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}
