import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { getCurrentCustomer, logoutCustomer } from "../../services/customerApi";
import type { OrderStatus } from "../../services/orderApi";
import {
  AdminAccountStatus,
  AdminDashboardData,
  AdminRole,
  AdminStats,
  AdminUser,
  AdminUserDraft,
  createAdminUserProfile,
  deleteAdminUser,
  formatCurrency,
  getAdminDashboardData,
  orderStatusLabel,
  toggleShippingFeeRule,
  updateAdminOrderStatus,
  updateAdminUserRole,
  updateAdminUserStatus,
} from "../../services/adminApi";
import AdminSidebar, {
  AdminSection,
} from "../../components/Web/Admin/AdminSidebar";
import AdminMetricGrid from "../../components/Web/Admin/AdminMetricGrid";
import AdminUsersPanel from "../../components/Web/Admin/AdminUsersPanel";
import AdminOrdersPanel from "../../components/Web/Admin/AdminOrdersPanel";
import AdminPostOfficePanel from "../../components/Web/Admin/AdminPostOfficePanel";
import AdminPricingPanel from "../../components/Web/Admin/AdminPricingPanel";
import { getInitials } from "../../utils/helpers";
import { colors, radii } from "../../theme";

type AdminProfile = {
  full_name?: string;
  store_name?: string;
  email?: string;
};

const webNoOutline =
  Platform.OS === "web"
    ? ({ outlineStyle: "none", outlineWidth: 0, outlineColor: "transparent" } as any)
    : null;

// ─── Period filter ────────────────────────────────────────────────────────────
type Period = "today" | "7days" | "30days";

const PERIOD_LABELS: Record<Period, string> = {
  today:   "Hôm nay",
  "7days": "7 ngày",
  "30days":"30 ngày",
};

function getPeriodCutoff(period: Period): Date {
  const d = new Date();
  if (period === "today") {
    d.setHours(0, 0, 0, 0);
  } else if (period === "7days") {
    d.setDate(d.getDate() - 7);
    d.setHours(0, 0, 0, 0);
  } else {
    d.setDate(d.getDate() - 30);
    d.setHours(0, 0, 0, 0);
  }
  return d;
}

// ─── Stats từ toàn bộ data (system-wide) ─────────────────────────────────────
function makeStats(data: AdminDashboardData): AdminStats {
  const deliveringStatuses: OrderStatus[] = ["picked_up", "in_transit", "delivering"];
  const completedOrders = data.orders.filter((order) => order.status === "delivered");
  const revenue = completedOrders.reduce((sum, order) => sum + order.shippingFee, 0);

  return {
    totalUsers: data.users.length,
    activeUsers: data.users.filter((user) => user.status === "active").length,
    lockedUsers: data.users.filter((user) => user.status !== "active").length,
    totalOrders: data.orders.length,
    deliveringOrders: data.orders.filter((order) =>
      deliveringStatuses.includes(order.status),
    ).length,
    completedOrders: completedOrders.length,
    completionRate: data.orders.length
      ? Math.round((completedOrders.length / data.orders.length) * 100)
      : 0,
    revenue,
    avgDeliveryHours: data.stats.avgDeliveryHours,
    activeShippers: data.users.filter(
      (user) => user.role === "shipper" && user.status === "active",
    ).length,
    postOffices: data.postOffices.length,
    systemAlerts: data.users.filter((user) => user.status !== "active").length + 2,
  };
}

// ─── Thẻ tổng quan đa chỉ số (2×2 grid, mỗi thẻ 3 con số) ───────────────────
function MultiMetricCard({
  title,
  icon,
  color,
  fields,
}: {
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  fields: { label: string; value: string | number }[];
}) {
  return (
    <View style={styles.metricCard}>
      {/* inner card — chứa toàn bộ nội dung với bg/border/shadow */}
      <View style={styles.metricCardInner}>
        <View style={styles.metricCardHead}>
          <View style={[styles.metricIcon, { backgroundColor: color + "1A" }]}>
            <MaterialCommunityIcons name={icon} size={16} color={color} />
          </View>
          <Text style={[styles.metricTitle, { color }]}>{title}</Text>
        </View>
        <View style={styles.metricFields}>
          {fields.map((f) => (
            <View key={f.label} style={styles.metricField}>
              <Text style={styles.metricFieldVal}>{f.value}</Text>
              <Text style={styles.metricFieldLbl}>{f.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── Thanh lọc thời gian (Hôm nay / 7 ngày / 30 ngày) ───────────────────────
function DateFilterBar({
  selected,
  onChange,
}: {
  selected: Period;
  onChange: (p: Period) => void;
}) {
  return (
    <View style={styles.periodBar}>
      {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
        <TouchableOpacity
          key={p}
          activeOpacity={0.75}
          style={[styles.periodTab, selected === p && styles.periodTabActive]}
          onPress={() => onChange(p)}
        >
          <Text style={[styles.periodText, selected === p && styles.periodTextActive]}>
            {PERIOD_LABELS[p]}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Tổng quan theo khoảng thời gian đã chọn ─────────────────────────────────
function OverviewBlocks({
  data,
  period,
}: {
  data: AdminDashboardData;
  period: Period;
}) {
  // Lọc đơn hàng theo period
  const cutoff = getPeriodCutoff(period);
  const periodOrders = data.orders.filter(
    (o) => new Date(o.createdAt) >= cutoff,
  );

  // Tính số liệu từ đơn đã lọc
  const newOrders    = periodOrders.length;
  const newCOD       = periodOrders.reduce((s, o) => s + o.codAmount, 0);
  const deliveredQty = periodOrders.filter((o) => o.status === "delivered").length;
  const deliveredRev = periodOrders.filter((o) => o.status === "delivered")
    .reduce((s, o) => s + o.shippingFee, 0);
  const inTransitQty = periodOrders.filter((o) =>
    (["picked_up", "in_transit", "delivering"] as const).includes(o.status as any),
  ).length;
  const inTransitCOD = periodOrders.filter((o) =>
    (["picked_up", "in_transit", "delivering"] as const).includes(o.status as any),
  ).reduce((s, o) => s + o.codAmount, 0);
  const returnedQty  = periodOrders.filter((o) => o.status === "returned").length;
  const returnedCOD  = periodOrders.filter((o) => o.status === "returned")
    .reduce((s, o) => s + o.codAmount, 0);
  const completionRate = newOrders
    ? Math.round((deliveredQty / newOrders) * 100)
    : 0;

  // Danh sách cho info panels dưới (từ toàn bộ data, không filter)
  const lockedUsers  = data.users.filter((u) => u.status !== "active").slice(0, 4);
  const urgentOrders = data.orders
    .filter((o) => o.status === "returned" || o.status === "delivering")
    .slice(0, 4);

  return (
    <View>
      {/* 4 thẻ tổng quan đa chỉ số (2×2) */}
      <View style={styles.metricGrid}>
        <MultiMetricCard
          title="Phát sinh"
          icon="package-variant-closed"
          color={colors.brand}
          fields={[
            { label: "Đơn hàng", value: newOrders },
            { label: "COD", value: formatCurrency(newCOD) },
            { label: "Hoàn thành", value: `${completionRate}%` },
          ]}
        />
        <MultiMetricCard
          title="Thành công"
          icon="check-circle-outline"
          color="#027A48"
          fields={[
            { label: "Đơn hàng", value: deliveredQty },
            { label: "Doanh thu", value: formatCurrency(deliveredRev) },
            { label: "Tỷ lệ", value: newOrders ? `${Math.round(deliveredQty / newOrders * 100)}%` : "—" },
          ]}
        />
        <MultiMetricCard
          title="Đang vận hành"
          icon="truck-fast-outline"
          color={colors.info}
          fields={[
            { label: "Đơn hàng", value: inTransitQty },
            { label: "COD cần thu", value: formatCurrency(inTransitCOD) },
            { label: "Chờ xử lý", value: periodOrders.filter((o) => o.status === "pending").length },
          ]}
        />
        <MultiMetricCard
          title="Đơn hoàn"
          icon="arrow-u-left-top"
          color={colors.danger}
          fields={[
            { label: "Đơn hoàn", value: returnedQty },
            { label: "COD hoàn", value: formatCurrency(returnedCOD) },
            { label: "Tỷ lệ hoàn", value: newOrders ? `${Math.round(returnedQty / newOrders * 100)}%` : "—" },
          ]}
        />
      </View>

      {/* 3 info panels: tài khoản + đơn urgent + doanh thu */}
      <View style={styles.splitRow}>
        <View style={styles.infoPanel}>
          <View style={styles.infoPanelInner}>
            <View style={styles.infoHeader}>
              <Text style={styles.infoTitle}>Tài khoản cần xử lý</Text>
              <MaterialCommunityIcons name="shield-account-outline" size={20} color={colors.brandDark} />
            </View>
            {lockedUsers.length === 0 ? (
              <Text style={styles.emptyText}>Không có tài khoản bị khóa</Text>
            ) : (
              lockedUsers.map((user) => (
                <View key={user.id} style={styles.compactRow}>
                  <View style={styles.compactMain}>
                    <Text style={styles.compactTitle}>{user.fullName}</Text>
                    <Text style={styles.compactSub}>{user.email}</Text>
                  </View>
                  <Text style={[styles.compactBadge, { color: colors.danger }]}>
                    {user.status === "locked_long" ? "Dài hạn" : "7 ngày"}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>

        <View style={styles.infoPanel}>
          <View style={styles.infoPanelInner}>
            <View style={styles.infoHeader}>
              <Text style={styles.infoTitle}>Đơn cần theo dõi</Text>
              <MaterialCommunityIcons name="clipboard-alert-outline" size={20} color={colors.warning} />
            </View>
            {urgentOrders.length === 0 ? (
              <Text style={styles.emptyText}>Không có đơn cần theo dõi</Text>
            ) : (
              urgentOrders.map((order) => (
                <View key={order.id} style={styles.compactRow}>
                  <View style={styles.compactMain}>
                    <Text style={styles.compactTitle}>{order.code}</Text>
                    <Text style={styles.compactSub}>{order.route}</Text>
                  </View>
                  <Text style={[styles.compactBadge, { color: colors.warning }]}>
                    {orderStatusLabel(order.status)}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>

        <View style={styles.infoPanel}>
          <View style={styles.infoPanelInner}>
            <View style={styles.infoHeader}>
              <Text style={styles.infoTitle}>Doanh thu vận hành</Text>
              <MaterialCommunityIcons name="chart-line" size={20} color={colors.info} />
            </View>
            <View style={styles.revenueBox}>
              <Text style={styles.revenueValue}>{formatCurrency(deliveredRev)}</Text>
              <Text style={styles.revenueSub}>
                {period === "today" ? "Hôm nay" : period === "7days" ? "7 ngày qua" : "30 ngày qua"}
              </Text>
            </View>
            <View style={styles.revenueLine}>
              <Text style={styles.revenueLabel}>Tỷ lệ hoàn thành</Text>
              <Text style={styles.revenueStrong}>{completionRate}%</Text>
            </View>
            <View style={styles.revenueLine}>
              <Text style={styles.revenueLabel}>Thời gian giao TB</Text>
              <Text style={styles.revenueStrong}>{data.stats.avgDeliveryHours} giờ</Text>
            </View>
            <View style={styles.revenueLine}>
              <Text style={styles.revenueLabel}>Đơn trong kỳ</Text>
              <Text style={styles.revenueStrong}>{newOrders} đơn</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function AdminDashboardScreen() {
  const navigation = useNavigation<any>();
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  // Bộ lọc thời gian cho overview (Hôm nay / 7 ngày / 30 ngày)
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("7days");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAdminDashboardData();
      setData(result);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getCurrentCustomer()
      .then((result) => {
        if (result) setProfile(result);
      })
      .catch(() => {});

    loadData();
  }, [loadData]);

  const displayName = profile?.full_name || profile?.store_name || profile?.email || "Admin";
  const initials = getInitials(displayName, "AD");

  const hydratedData = useMemo(() => {
    if (!data) return null;

    return {
      ...data,
      stats: makeStats(data),
    };
  }, [data]);

  const updateUsers = (updater: (users: AdminUser[]) => AdminUser[]) => {
    setData((prev) => {
      if (!prev) return prev;

      const next = {
        ...prev,
        users: updater(prev.users),
      };

      return {
        ...next,
        stats: makeStats(next),
      };
    });
  };

  const handleAddUser = async (input: AdminUserDraft) => {
    try {
      const created = await createAdminUserProfile(input);
      // Cập nhật danh sách user ngay sau khi tạo thành công từ API
      updateUsers((users) => [created, ...users]);
    } catch (e: any) {
      // Hiển thị lỗi rõ ràng — không tạo user giả
      Alert.alert("Tạo tài khoản thất bại", e?.message || "Vui lòng thử lại");
    }
  };

  const handleChangeRole = async (userId: string, role: AdminRole) => {
    updateUsers((users) =>
      users.map((user) => (user.id === userId ? { ...user, role } : user)),
    );
    await updateAdminUserRole(userId, role);
  };

  const handleChangeStatus = async (
    userId: string,
    status: AdminAccountStatus,
  ) => {
    updateUsers((users) =>
      users.map((user) => (user.id === userId ? { ...user, status } : user)),
    );
    await updateAdminUserStatus(userId, status);
  };

  const handleDeleteUser = async (userId: string) => {
    // Xoa khoi local state ngay lap tuc (optimistic update)
    updateUsers((users) => users.filter((user) => user.id !== userId));
    // Goi API xoa phia server
    try {
      await deleteAdminUser(userId);
    } catch {
      // Neu xoa that bai → load lai du lieu goc
      loadData();
    }
  };

  const handleChangeOrderStatus = async (orderId: string, status: OrderStatus) => {
    setData((prev) => {
      if (!prev) return prev;

      const next = {
        ...prev,
        orders: prev.orders.map((order) =>
          order.id === orderId
            ? { ...order, status, updatedAt: new Date().toISOString() }
            : order,
        ),
      };

      return {
        ...next,
        stats: makeStats(next),
      };
    });
    await updateAdminOrderStatus(orderId, status);
  };

  const handleToggleFeeRule = async (ruleId: string) => {
    const currentRule = data?.feeRules.find((rule) => rule.id === ruleId);
    if (!currentRule) return;

    setData((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        feeRules: prev.feeRules.map((rule) =>
          rule.id === ruleId ? { ...rule, active: !rule.active } : rule,
        ),
      };
    });

    await toggleShippingFeeRule(ruleId, !currentRule.active);
  };

  const handleLogout = async () => {
    try {
      await logoutCustomer();
    } finally {
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    }
  };

  const renderSection = () => {
    if (!hydratedData) return null;

    if (activeSection === "users") {
      return (
        <AdminUsersPanel
          users={hydratedData.users}
          onAddUser={handleAddUser}
          onDeleteUser={handleDeleteUser}
          onChangeRole={handleChangeRole}
          onChangeStatus={handleChangeStatus}
        />
      );
    }

    if (activeSection === "orders") {
      return (
        <AdminOrdersPanel
          orders={hydratedData.orders}
          onChangeStatus={handleChangeOrderStatus}
        />
      );
    }

    if (activeSection === "offices") {
      return <AdminPostOfficePanel postOffices={hydratedData.postOffices} />;
    }

    if (activeSection === "fees") {
      return (
        <AdminPricingPanel
          feeRules={hydratedData.feeRules}
          onToggleRule={handleToggleFeeRule}
        />
      );
    }

    return (
      <>
        <DateFilterBar selected={selectedPeriod} onChange={setSelectedPeriod} />
        <OverviewBlocks data={hydratedData} period={selectedPeriod} />
      </>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <AdminSidebar
          activeSection={activeSection}
          initials={initials}
          onChangeSection={setActiveSection}
          onLogout={handleLogout}
        />

        <View style={styles.mainArea}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {/* Breadcrumb style */}
              <Text style={styles.breadcrumb}>Admin  /</Text>
              <Text style={styles.pageTitle}>
                {activeSection === "overview"  && "Tổng quan hệ thống"}
                {activeSection === "users"     && "Quản lý người dùng"}
                {activeSection === "orders"    && "Quản lý đơn hàng"}
                {activeSection === "offices"   && "Danh sách bưu cục"}
                {activeSection === "fees"      && "Cấu hình phí vận chuyển"}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.82}
              style={[styles.refreshButton, webNoOutline]}
              onPress={loadData}
            >
              <MaterialCommunityIcons name="refresh" size={16} color={colors.brand} />
              <Text style={styles.refreshText}>Làm mới</Text>
            </TouchableOpacity>
          </View>

          {loading || !hydratedData ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={colors.brand} />
              <Text style={styles.loadingText}>Đang tải dữ liệu admin...</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.scrollArea}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator
            >
              <AdminMetricGrid stats={hydratedData.stats} synced={hydratedData.synced} />

              {renderSection()}
            </ScrollView>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  root: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: colors.background,
  },

  mainArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  /* ── Header ── */
  header: {
    height: 60,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  breadcrumb: {
    fontSize: 13,
    color: colors.textSubtle,
    marginRight: 6,
  },

  pageTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },

  refreshButton: {
    height: 34,
    borderRadius: radii.sm,
    backgroundColor: colors.brandSoft,
    borderWidth: 1,
    borderColor: "#B7E4CF",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  refreshText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.brand,
    marginLeft: 5,
  },

  /* ── Scroll ── */
  scrollArea: {
    flex: 1,
  },

  scrollContent: {
    padding: 18,
    paddingBottom: 36,
  },

  /* ── Loading ── */
  loadingBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "500",
    color: colors.textMuted,
  },

  /* ── Period filter bar (Hôm nay / 7 ngày / 30 ngày) ── */
  periodBar: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: 4,
    marginBottom: 14,
    alignSelf: "flex-start",
  },

  periodTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radii.sm,
  },

  periodTabActive: {
    backgroundColor: colors.brand,
  },

  periodText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textMuted,
  },

  periodTextActive: {
    color: "#fff",
    fontWeight: "600",
  },

  /* ── 4 thẻ tổng quan (2×2 grid) ── */
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
    marginBottom: 12,
  },

  /* metricCard = vỏ ngoài (spacing), metricCardInner = card thật (bg/border/shadow) */
  metricCard: {
    width: "50%",
    minWidth: 200,
    paddingHorizontal: 6,
    marginBottom: 12,
  },

  metricCardInner: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    overflow: "hidden",
    shadowColor: "#101828",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },

  /* Header trong card: icon + tên nhóm */
  metricCardHead: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  metricIcon: {
    width: 28,
    height: 28,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  metricTitle: {
    fontSize: 13,
    fontWeight: "700",
    flex: 1,
  },

  /* Dòng chỉ số: 3 ô cạnh nhau */
  metricFields: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 8,
  },

  metricField: {
    flex: 1,
    alignItems: "flex-start",
  },

  metricFieldVal: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 3,
  },

  metricFieldLbl: {
    fontSize: 11,
    color: colors.textSubtle,
    fontWeight: "500",
  },

  /* ── Split row — 3 info panels ── */
  splitRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },

  infoPanel: {
    width: "33.33%",
    minWidth: 200,
    paddingHorizontal: 6,
    marginBottom: 12,
  },

  infoPanelInner: {
    minHeight: 200,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16,
    shadowColor: "#101828",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },

  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 6,
  },

  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },

  emptyText: {
    fontSize: 13,
    color: colors.textSubtle,
    paddingVertical: 16,
    fontStyle: "italic",
  },

  compactRow: {
    minHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },

  compactMain: {
    flex: 1,
    paddingRight: 8,
  },

  compactTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },

  compactSub: {
    fontSize: 12,
    color: colors.textSubtle,
    marginTop: 2,
  },

  compactBadge: {
    minWidth: 60,
    borderRadius: 10,
    backgroundColor: colors.surfaceMuted,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 3,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "600",
    color: colors.textMuted,
  },

  revenueBox: {
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginTop: 8,
    marginBottom: 10,
  },

  revenueValue: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.brand,
  },

  revenueSub: {
    fontSize: 12,
    color: colors.textSubtle,
    marginTop: 3,
  },

  revenueLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  revenueLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },

  revenueStrong: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
});
