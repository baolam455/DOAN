import { apiRequest } from "./apiClient";

export type OrderStatus =
  | "pending"
  | "picked_up"
  | "in_transit"
  | "delivering"
  | "delivered"
  | "returned"
  | "cancelled";

export type Order = {
  id: string;
  customer_id: string;
  order_code: string;
  shop_order_code: string | null;
  status: OrderStatus;
  receiver_phone: string;
  receiver_name: string;
  receiver_address: string;
  receiver_ward: string | null;
  receiver_province: string | null;
  shipping_type: "express" | "bbs";
  transport_type: "road" | "air";
  pickup_method: "home" | "post";
  ship_payer: "customer" | "shop";
  cod_amount: number | null;   // null nếu đơn không có COD
  product_value: number | null;
  shipping_fee: number | null;
  total_weight: number;
  product_name: string | null;
  quantity: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  pickup_at: string | null;
  delivered_at: string | null;
};

export type OrderTracking = {
  id: string;
  order_id: string;
  status: string;
  note: string | null;
  location: string | null;
  created_at: string;
};

export type DashboardStats = {
  total: number;
  delivered: number;
  delivering: number;
  returned: number;
  totalCod: number;
  totalShippingFee: number;
  totalQuantity: number;
  deliveredQuantity: number;
  deliveringQuantity: number;
  // COD da thu (don thanh cong) — neu API tra ve
  deliveredCod?: number;
  // COD chua thu (don dang giao) — neu API tra ve
  deliveringCod?: number;
};

export type CreateOrderInput = {
  receiverPhone: string;
  receiverName: string;
  receiverAddress: string;
  receiverWard?: string;
  receiverProvince?: string;
  shippingType: "express" | "bbs";
  transportType: "road" | "air";
  pickupMethod: "home" | "post";
  shipPayer: "customer" | "shop";
  codAmount: number;
  productValue: number;
  totalWeight: number;
  productName: string;
  quantity: number;
  shopOrderCode?: string;
  pickupAddress?: string;
  pickupNote?: string;
};

export function statusLabel(status: string): string {
  switch (status) {
    case "pending":
      return "Chờ lấy hàng";
    case "picked_up":
      return "Đã lấy hàng";
    case "in_transit":
      return "Đang vận chuyển";
    case "delivering":
      return "Đang giao hàng";
    case "delivered":
      return "Giao thành công";
    case "returned":
      return "Hoàn hàng";
    case "cancelled":
      return "Đã hủy";
    default:
      return status;
  }
}

export function statusColor(status: string): string {
  switch (status) {
    case "pending":
      return "#F59E0B";
    case "picked_up":
      return "#3B82F6";
    case "in_transit":
      return "#8B5CF6";
    case "delivering":
      return "#F97316";
    case "delivered":
      return "#4D9858";
    case "returned":
      return "#EF4444";
    case "cancelled":
      return "#9CA3AF";
    default:
      return "#666666";
  }
}

export function statusIcon(status: string): string {
  switch (status) {
    case "pending":
      return "package-variant-closed";
    case "picked_up":
      return "truck-check-outline";
    case "in_transit":
      return "truck-fast-outline";
    case "delivering":
      return "truck-delivery-outline";
    case "delivered":
      return "check-circle-outline";
    case "returned":
      return "arrow-u-left-top";
    case "cancelled":
      return "close-circle-outline";
    default:
      return "circle-outline";
  }
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  return apiRequest<Order>("/orders", {
    method: "POST",
    body: input,
  });
}

export async function getOrders(filters?: {
  status?: OrderStatus;
  dateFrom?: string;
  dateTo?: string;
}): Promise<Order[]> {
  const orders = await apiRequest<Order[]>("/orders");

  return orders.filter((order) => {
    if (filters?.status && order.status !== filters.status) return false;
    if (filters?.dateFrom && order.created_at < filters.dateFrom) return false;
    if (filters?.dateTo && order.created_at > filters.dateTo) return false;
    return true;
  });
}

export async function getOrderById(orderId: string): Promise<Order> {
  return apiRequest<Order>(`/orders/${orderId}`);
}

export async function getOrderTracking(orderId: string): Promise<OrderTracking[]> {
  return apiRequest<OrderTracking[]>(`/orders/${orderId}/tracking`);
}

export async function getDashboardStats(
  dateFrom?: string,
  dateTo?: string,
): Promise<DashboardStats> {
  const params = new URLSearchParams();
  if (dateFrom) params.set("dateFrom", dateFrom);
  if (dateTo) params.set("dateTo", dateTo);

  const query = params.toString();
  return apiRequest<DashboardStats>(`/orders/stats${query ? `?${query}` : ""}`);
}

export async function cancelOrder(orderId: string): Promise<boolean> {
  await apiRequest<{ message: string }>(`/orders/${orderId}/cancel`, { method: "POST" });
  return true;
}
