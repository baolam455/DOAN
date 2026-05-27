import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { PublicTrackingResult, trackOrderByCode } from "../../services/publicApi";
import { statusColor, statusIcon, statusLabel } from "../../services/orderApi";
import { formatDate } from "../../utils/helpers";
import { colors, radii } from "../../theme";

const webNoOutline =
  Platform.OS === "web"
    ? ({ outlineStyle: "none", outlineWidth: 0, outlineColor: "transparent" } as any)
    : null;

export default function TrackOrderScreen() {
  const navigation = useNavigation<any>();
  const [orderCode, setOrderCode] = useState("");
  const [result, setResult] = useState<PublicTrackingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async () => {
    const code = orderCode.trim();
    if (!code) {
      setError("Vui lòng nhập mã vận đơn");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(await trackOrderByCode(code));
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : "Không tìm thấy đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const order = result?.order;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.backButton, webNoOutline]}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="chevron-left" size={28} color={colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Tra cứu đơn hàng</Text>
          <Text style={styles.subtitle}>Nhập mã vận đơn để xem trạng thái mới nhất</Text>
        </View>
      </View>

      <View style={styles.searchBand}>
        <TextInput
          style={[styles.input, webNoOutline]}
          value={orderCode}
          onChangeText={setOrderCode}
          autoCapitalize="characters"
          placeholder="Ví dụ: TK20260524A19QK"
          placeholderTextColor={colors.textSubtle}
          onSubmitEditing={handleTrack}
        />
        <TouchableOpacity
          activeOpacity={0.86}
          style={[styles.searchButton, loading && styles.searchButtonDisabled, webNoOutline]}
          onPress={handleTrack}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <MaterialCommunityIcons name="magnify" size={19} color="#FFFFFF" />
          )}
          <Text style={styles.searchText}>{loading ? "Đang tra..." : "Tra cứu"}</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.centerBox}>
          <MaterialCommunityIcons name="alert-circle-outline" size={54} color="#DC2626" />
          <Text style={styles.errorTitle}>Không tra được đơn hàng</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : !order ? (
        <View style={styles.centerBox}>
          <MaterialCommunityIcons name="package-variant-closed" size={58} color={colors.borderStrong} />
          <Text style={styles.emptyTitle}>Chưa có dữ liệu tra cứu</Text>
          <Text style={styles.emptyText}>Mã vận đơn được tạo sau khi shop tạo đơn thành công.</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator>
          <View style={styles.summaryCard}>
            <View style={styles.summaryTop}>
              <View>
                <Text style={styles.orderCode}>{order.order_code}</Text>
                <Text style={styles.receiver}>{order.receiver_name}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: statusColor(order.status) + "18",
                    borderColor: statusColor(order.status) + "44",
                  },
                ]}
              >
                <Text style={[styles.statusText, { color: statusColor(order.status) }]}>
                  {statusLabel(order.status)}
                </Text>
              </View>
            </View>

            <View style={styles.infoGrid}>
              <InfoItem label="Điện thoại" value={order.receiver_phone || "---"} />
              <InfoItem label="Khu vực nhận" value={order.receiver_province || "Chưa cập nhật"} />
              <InfoItem label="Loại giao" value={order.shipping_type === "express" ? "Nhanh" : "Tiết kiệm"} />
              <InfoItem label="Ngày tạo" value={formatDate(order.created_at)} />
            </View>
          </View>

          <View style={styles.trackingCard}>
            <Text style={styles.cardTitle}>Lịch sử vận chuyển</Text>
            {[...(result?.tracking || [])].reverse().map((item, index) => {
              const color = statusColor(item.status);
              const isLast = index === (result?.tracking.length || 0) - 1;

              return (
                <View key={item.id} style={styles.timelineRow}>
                  <View style={styles.timelineLeft}>
                    <View style={[styles.timelineDot, { backgroundColor: color }]}>
                      <MaterialCommunityIcons
                        name={statusIcon(item.status) as any}
                        size={14}
                        color="#FFFFFF"
                      />
                    </View>
                    {!isLast && <View style={styles.timelineLine} />}
                  </View>
                  <View style={styles.timelineMain}>
                    <Text style={[styles.timelineStatus, { color }]}>{statusLabel(item.status)}</Text>
                    {item.note ? <Text style={styles.timelineNote}>{item.note}</Text> : null}
                    {item.location ? <Text style={styles.timelineLocation}>{item.location}</Text> : null}
                    <Text style={styles.timelineTime}>{formatDate(item.created_at)}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    height: 68,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },

  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 3,
  },

  searchBand: {
    minHeight: 68,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: "row",
    flexWrap: "wrap",           // wrap sang dòng mới trên màn hình hẹp
    alignItems: "center",
    paddingHorizontal: 22,
    paddingVertical: 12,
    gap: 8,
  },

  input: {
    flex: 1,
    height: 42,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: 12,
    fontSize: 14,
    color: colors.text,
    marginRight: 10,
  },

  searchButton: {
    height: 42,
    borderRadius: radii.sm,
    backgroundColor: colors.brand,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
  },

  searchButtonDisabled: {
    opacity: 0.65,
  },

  searchText: {
    marginLeft: 7,
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  errorTitle: {
    marginTop: 14,
    fontSize: 17,
    fontWeight: "700",
    color: colors.danger,
  },

  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
  },

  emptyTitle: {
    marginTop: 14,
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },

  emptyText: {
    marginTop: 7,
    fontSize: 14,
    color: colors.textMuted,
  },

  content: {
    flex: 1,
  },

  contentInner: {
    padding: 22,
  },

  summaryCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 20,
    marginBottom: 14,
    shadowColor: "#101828",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },

  summaryTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 14,
    marginBottom: 14,
  },

  orderCode: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.brandDark,
  },

  receiver: {
    marginTop: 5,
    fontSize: 14,
    color: colors.text,
    fontWeight: "600",
  },

  statusBadge: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },

  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },

  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  infoItem: {
    width: "50%",   // 25% quá hẹp trên mobile — 2 cột là đủ
    paddingRight: 12,
    marginTop: 8,
  },

  infoLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
    marginBottom: 4,
  },

  infoValue: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },

  trackingCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 20,
    shadowColor: "#101828",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 14,
  },

  timelineRow: {
    flexDirection: "row",
    marginBottom: 20,
  },

  timelineLeft: {
    width: 34,
    alignItems: "center",
  },

  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 26,
    backgroundColor: colors.border,
    marginTop: 4,
  },

  timelineMain: {
    flex: 1,
    marginLeft: 12,
  },

  timelineStatus: {
    fontSize: 13,
    fontWeight: "700",
  },

  timelineNote: {
    marginTop: 4,
    fontSize: 13,
    color: colors.text,
  },

  timelineLocation: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textMuted,
  },

  timelineTime: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textSubtle,
  },
});
