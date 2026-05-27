import React from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { AdminStats, formatCurrency } from "../../../services/adminApi";
import { colors, radii } from "../../../theme";

type Props = {
  stats: AdminStats;
  synced: boolean;
};

const TONES = {
  green: { border: colors.brand, bg: colors.brandSoft, icon: colors.brand, text: colors.brandDark },
  blue: { border: colors.info, bg: colors.infoSoft, icon: colors.info, text: "#1D4ED8" },
  orange: { border: colors.warning, bg: colors.warningSoft, icon: colors.warning, text: "#92400E" },
  red: { border: colors.danger, bg: colors.dangerSoft, icon: colors.danger, text: "#991B1B" },
};

function MetricCard({
  label,
  value,
  helper,
  icon,
  tone,
  cardWidth,
}: {
  label: string;
  value: string;
  helper: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  tone: keyof typeof TONES;
  cardWidth: string;
}) {
  const t = TONES[tone];

  return (
    <View style={[styles.card, { width: cardWidth as any }]}>
      <View style={[styles.cardInner, { borderLeftColor: t.border }]}>
        <View style={[styles.iconWrap, { backgroundColor: t.bg }]}>
          <MaterialCommunityIcons name={icon} size={19} color={t.icon} />
        </View>
        <Text style={styles.cardLabel}>{label}</Text>
        <Text style={[styles.cardValue, { color: t.text }]}>{value}</Text>
        <Text style={styles.cardHelper}>{helper}</Text>
      </View>
    </View>
  );
}

export default function AdminMetricGrid({ stats, synced }: Props) {
  // <600px: 2 cot; >=600px: 3 cot
  const { width } = useWindowDimensions();
  const cardWidth = width < 600 ? "50%" : "33.33%";

  return (
    <View style={styles.wrap}>
      <View style={styles.syncBar}>
        <View style={[styles.syncDot, synced ? styles.dotOnline : styles.dotOffline]} />
        <Text style={styles.syncText}>
          {synced
            ? "Đang đọc dữ liệu trực tiếp từ Backend API"
            : "Chưa đồng bộ được Backend API, đang dùng dữ liệu dự phòng"}
        </Text>
      </View>

      <View style={styles.grid}>
        <MetricCard
          cardWidth={cardWidth}
          label="Người dùng"
          value={stats.totalUsers.toLocaleString("vi-VN")}
          helper={`${stats.activeUsers} hoạt động · ${stats.lockedUsers} bị khóa`}
          icon="account-group-outline"
          tone="green"
        />
        <MetricCard
          cardWidth={cardWidth}
          label="Đơn vận hành"
          value={stats.totalOrders.toLocaleString("vi-VN")}
          helper={`${stats.deliveringOrders} đang trên đường giao`}
          icon="clipboard-list-outline"
          tone="blue"
        />
        <MetricCard
          cardWidth={cardWidth}
          label="Tỷ lệ hoàn thành"
          value={`${stats.completionRate}%`}
          helper={`${stats.completedOrders} đơn đã giao thành công`}
          icon="check-decagram-outline"
          tone="orange"
        />
        <MetricCard
          cardWidth={cardWidth}
          label="Doanh thu phí ship"
          value={formatCurrency(stats.revenue)}
          helper={`Thời gian giao TB: ${stats.avgDeliveryHours} giờ`}
          icon="cash-check"
          tone="green"
        />
        <MetricCard
          cardWidth={cardWidth}
          label="Shipper hoạt động"
          value={stats.activeShippers.toLocaleString("vi-VN")}
          helper={`${stats.postOffices} bưu cục đang mở cửa`}
          icon="truck-delivery-outline"
          tone="blue"
        />
        <MetricCard
          cardWidth={cardWidth}
          label="Cảnh báo hệ thống"
          value={stats.systemAlerts.toLocaleString("vi-VN")}
          helper="Cần admin xem xét và xử lý"
          icon="alert-circle-outline"
          tone="red"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 16,
  },

  syncBar: {
    minHeight: 34,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  syncDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 8,
  },

  dotOnline: {
    backgroundColor: colors.brand,
  },

  dotOffline: {
    backgroundColor: colors.warning,
  },

  syncText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.textMuted,
  },

  /* 3 cột đều nhau — padding tạo khoảng cách */
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },

  card: {
    // width handled via inline style (cardWidth prop) for responsive 2/3-col switch
    paddingHorizontal: 6,
    marginBottom: 12,
  },

  cardInner: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    padding: 16,
    shadowColor: "#101828",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },

  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  cardLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textMuted,
    marginBottom: 5,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },

  cardValue: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },

  cardHelper: {
    fontSize: 12,
    color: colors.textSubtle,
    lineHeight: 16,
  },
});
