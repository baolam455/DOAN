import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import type { OrderStatus } from "../../../services/orderApi";
import {
  AdminOrder,
  formatCurrency,
  formatDateTime,
  orderStatusLabel,
} from "../../../services/adminApi";
import { colors } from "../../../theme";

type Props = {
  orders: AdminOrder[];
  onChangeStatus: (orderId: string, status: OrderStatus) => void;
};

const statusOptions: ("all" | OrderStatus)[] = [
  "all",
  "pending",
  "picked_up",
  "in_transit",
  "delivering",
  "delivered",
  "returned",
  "cancelled",
];

const quickStatusOptions: OrderStatus[] = [
  "picked_up",
  "in_transit",
  "delivering",
  "delivered",
  "returned",
];

const webNoOutline =
  Platform.OS === "web"
    ? ({ outlineStyle: "none", outlineWidth: 0, outlineColor: "transparent" } as any)
    : null;

function statusColor(status: OrderStatus) {
  switch (status) {
    case "pending":
      return "#F59E0B";
    case "picked_up":
      return "#2563EB";
    case "in_transit":
      return "#7C3AED";
    case "delivering":
      return "#EA580C";
    case "delivered":
      return "#0F6B3A";
    case "returned":
      return "#B42318";
    case "cancelled":
      return colors.textMuted;
    default:
      return colors.textMuted;
  }
}

export default function AdminOrdersPanel({ orders, onChangeStatus }: Props) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");

  const filteredOrders = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesQuery =
        !cleanQuery ||
        order.code.toLowerCase().includes(cleanQuery) ||
        order.customerName.toLowerCase().includes(cleanQuery) ||
        order.receiverName.toLowerCase().includes(cleanQuery) ||
        order.route.toLowerCase().includes(cleanQuery);

      return matchesStatus && matchesQuery;
    });
  }, [orders, query, statusFilter]);

  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <View>
          <Text style={styles.panelTitle}>Quản lý đơn hàng</Text>
          <Text style={styles.panelDesc}>Theo dõi trạng thái, shipper phụ trách, COD và phí giao</Text>
        </View>
      </View>

      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <MaterialCommunityIcons name="magnify" size={19} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, webNoOutline]}
            value={query}
            onChangeText={setQuery}
            placeholder="Tìm mã đơn, khách hàng, người nhận, tuyến"
            placeholderTextColor={colors.textSubtle}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {statusOptions.map((item) => {
            const active = item === statusFilter;

            return (
              <TouchableOpacity
                key={item}
                activeOpacity={0.82}
                style={[styles.filterChip, active && styles.filterChipActive, webNoOutline]}
                onPress={() => setStatusFilter(item)}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>
                  {item === "all" ? "Tất cả" : orderStatusLabel(item)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.codeCol]}>Mã đơn</Text>
            <Text style={[styles.headerCell, styles.customerCol]}>Khách hàng</Text>
            <Text style={[styles.headerCell, styles.routeCol]}>Tuyến giao</Text>
            <Text style={[styles.headerCell, styles.moneyCol]}>COD / Phí</Text>
            <Text style={[styles.headerCell, styles.statusCol]}>Trạng thái</Text>
            <Text style={[styles.headerCell, styles.actionCol]}>Cập nhật</Text>
          </View>

          {filteredOrders.map((order) => (
            <View key={order.id} style={styles.tableRow}>
              <View style={styles.codeCol}>
                <Text style={styles.orderCode}>{order.code}</Text>
                <Text style={styles.orderTime}>{formatDateTime(order.createdAt)}</Text>
              </View>

              <View style={styles.customerCol}>
                <Text style={styles.customerName}>{order.customerName}</Text>
                <Text style={styles.receiverName}>Nhận: {order.receiverName}</Text>
                <Text style={styles.shipperName}>{order.assignedShipper || "Chưa gán shipper"}</Text>
              </View>

              <View style={styles.routeCol}>
                <Text style={styles.routeText}>{order.route}</Text>
                <Text style={styles.orderTime}>Cập nhật: {formatDateTime(order.updatedAt)}</Text>
              </View>

              <View style={styles.moneyCol}>
                <Text style={styles.moneyText}>{formatCurrency(order.codAmount)}</Text>
                <Text style={styles.feeText}>Phí {formatCurrency(order.shippingFee)}</Text>
              </View>

              <View style={styles.statusCol}>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: statusColor(order.status) + "16",
                      borderColor: statusColor(order.status) + "40",
                    },
                  ]}
                >
                  <Text style={[styles.statusText, { color: statusColor(order.status) }]}>
                    {orderStatusLabel(order.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.actionCol}>
                {quickStatusOptions.map((item) => {
                  const active = order.status === item;

                  return (
                    <TouchableOpacity
                      key={item}
                      activeOpacity={0.82}
                      style={[styles.statusButton, active && styles.statusButtonActive, webNoOutline]}
                      onPress={() => onChangeStatus(order.id, item)}
                    >
                      <Text style={[styles.statusButtonText, active && styles.statusButtonTextActive]}>
                        {orderStatusLabel(item)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
  },

  panelHeader: {
    marginBottom: 16,
  },

  panelTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.text,
  },

  panelDesc: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },

  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    flexWrap: "wrap",
    gap: 8,
  },

  searchBox: {
    flex: 1,
    maxWidth: 360,
    minWidth: 180,
    height: 40,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    marginRight: 12,
  },

  searchInput: {
    flex: 1,
    height: 38,
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },

  filterRow: {
    alignItems: "center",
  },

  filterChip: {
    height: 34,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: 11,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
    backgroundColor: "#FFFFFF",
  },

  filterChipActive: {
    borderColor: colors.brand,
    backgroundColor: colors.brandSoft,
  },

  filterText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textMuted,
  },

  filterTextActive: {
    color: "#0F6B3A",
  },

  table: {
    minWidth: 1120,
  },

  tableHeader: {
    height: 42,
    borderRadius: 6,
    backgroundColor: colors.surfaceMuted,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  tableRow: {
    minHeight: 102,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  headerCell: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.textMuted,
    textTransform: "uppercase",
  },

  codeCol: {
    width: 165,
    paddingRight: 12,
  },

  customerCol: {
    width: 210,
    paddingRight: 12,
  },

  routeCol: {
    width: 270,
    paddingRight: 12,
  },

  moneyCol: {
    width: 130,
    paddingRight: 12,
  },

  statusCol: {
    width: 145,
    paddingRight: 12,
  },

  actionCol: {
    width: 300,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },

  orderCode: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0F6B3A",
  },

  orderTime: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 5,
  },

  customerName: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.text,
  },

  receiverName: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },

  shipperName: {
    fontSize: 12,
    color: "#0F6B3A",
    fontWeight: "800",
    marginTop: 5,
  },

  routeText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },

  moneyText: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.text,
  },

  feeText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },

  statusBadge: {
    minHeight: 30,
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },

  statusText: {
    fontSize: 12,
    fontWeight: "900",
  },

  statusButton: {
    height: 29,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
    marginBottom: 6,
  },

  statusButtonActive: {
    borderColor: colors.brand,
    backgroundColor: colors.brandSoft,
  },

  statusButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.textMuted,
  },

  statusButtonTextActive: {
    color: "#0F6B3A",
  },
});
