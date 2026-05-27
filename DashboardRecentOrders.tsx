import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Order, getOrders, statusLabel, statusColor, statusIcon } from "../../../services/orderApi";
import { colors, radii } from "../../../theme";

type Props = {
  onViewAll?: () => void;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function DashboardRecentOrders({ onViewAll }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders()
      .then((list) => {
        // Sap xep giam dan theo ngay tao, lay 5 don moi nhat
        const sorted = [...list].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setOrders(sorted.slice(0, 5));
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Đơn hàng gần đây</Text>
        <TouchableOpacity activeOpacity={0.75} onPress={onViewAll}>
          <Text style={styles.viewAll}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>

      {/* Loading */}
      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="small" color={colors.brand} />
        </View>
      )}

      {/* Empty */}
      {!loading && orders.length === 0 && (
        <View style={styles.centered}>
          <MaterialCommunityIcons name="package-variant-closed" size={36} color={colors.border} />
          <Text style={styles.emptyText}>Chưa có đơn hàng nào</Text>
        </View>
      )}

      {/* Danh sach don */}
      {!loading && orders.map((order, index) => {
        const color = statusColor(order.status);
        return (
          <View
            key={order.id}
            style={[styles.orderRow, index < orders.length - 1 && styles.orderRowBorder]}
          >
            {/* Icon trang thai */}
            <View style={[styles.iconBox, { backgroundColor: color + "20" }]}>
              <MaterialCommunityIcons
                name={statusIcon(order.status) as any}
                size={18}
                color={color}
              />
            </View>

            {/* Noi dung */}
            <View style={styles.orderInfo}>
              <Text style={styles.orderCode} numberOfLines={1}>
                #{order.order_code}
              </Text>
              <Text style={styles.receiverName} numberOfLines={1}>
                {order.receiver_name}
              </Text>
            </View>

            {/* Badge trang thai + ngay */}
            <View style={styles.orderRight}>
              <View style={[styles.statusBadge, { backgroundColor: color + "18", borderColor: color + "40" }]}>
                <Text style={[styles.statusText, { color }]}>{statusLabel(order.status)}</Text>
              </View>
              <Text style={styles.dateText}>{formatDate(order.created_at)}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    overflow: "hidden",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },

  viewAll: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.brand,
  },

  centered: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 28,
    gap: 8,
  },

  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 6,
  },

  orderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },

  orderRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
  },

  orderInfo: {
    flex: 1,
  },

  orderCode: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },

  receiverName: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },

  orderRight: {
    alignItems: "flex-end",
    gap: 4,
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },

  dateText: {
    fontSize: 11,
    color: colors.textMuted,
  },
});
