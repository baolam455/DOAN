import { apiRequest } from "./apiClient";
import type { AdminPostOffice } from "./adminApi";
import type { OrderTracking } from "./orderApi";

// Public tracking chỉ trả về subset an toàn — không lộ địa chỉ chi tiết, COD, phí.
// Tách riêng type thay vì dùng Order đầy đủ để tránh type mismatch ngầm.
export type PublicOrder = {
  order_code: string;
  status: string;
  shipping_type: "express" | "bbs";
  receiver_name: string;
  receiver_province: string | null;
  receiver_ward: string | null;
  receiver_phone: string | null; // đã mask: 0987***456
  created_at: string;
  updated_at: string;
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

export type QuoteShippingFeeInput = {
  receiverProvince?: string;
  shippingType: "express" | "bbs";
  totalWeight: number;
};

export type PublicTrackingResult = {
  order: PublicOrder;
  tracking: OrderTracking[];
};

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

export async function getPublicPostOffices() {
  const data = await apiRequest<RawPostOffice[]>("/public/post-offices", {
    skipAuth: true,
  });

  return data.map(toPostOffice);
}

export async function quoteShippingFee(input: QuoteShippingFeeInput) {
  const data = await apiRequest<{ shippingFee: number }>("/public/shipping-fee/quote", {
    method: "POST",
    skipAuth: true,
    body: input,
  });

  return Number(data.shippingFee || 0);
}

export async function trackOrderByCode(orderCode: string) {
  return apiRequest<PublicTrackingResult>(
    `/public/track/${encodeURIComponent(orderCode.trim())}`,
    { skipAuth: true },
  );
}
