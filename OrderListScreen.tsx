import React, { useEffect, useState, useCallback } from "react";
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Platform,
    useWindowDimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { getCurrentCustomer, logoutCustomer } from "../../services/customerApi";
import {
    getOrders,
    Order,
    OrderStatus,
    statusLabel,
    statusColor,
} from "../../services/orderApi";
import DashboardSidebar from "../../components/Web/Dashboard/DashboardSidebar";
import DashboardQuickMenu from "../../components/Web/Dashboard/DashboardQuickMenu";
import { getInitials, formatDate, formatMoney, showComingSoon } from "../../utils/helpers";
import { colors, radii } from "../../theme";

const webNoOutline =
    Platform.OS === "web"
        ? ({ outlineStyle: "none", outlineWidth: 0, outlineColor: "transparent" } as any)
        : null;

type FilterTab = "all" | OrderStatus;

const TABS: { key: FilterTab; label: string }[] = [
    { key: "all", label: "Tất cả" },
    { key: "pending", label: "Chờ lấy hàng" },
    { key: "delivering", label: "Đang giao" },
    { key: "delivered", label: "Thành công" },
    { key: "returned", label: "Hoàn hàng" },
    { key: "cancelled", label: "Đã hủy" },
];


function StatusBadge({ status }: { status: string }) {
    const color = statusColor(status);
    return (
        <View style={[styles.badge, { backgroundColor: color + "22", borderColor: color + "55" }]}>
            <Text style={[styles.badgeText, { color }]}>{statusLabel(status)}</Text>
        </View>
    );
}

function isDelivering(status: string) {
    return ["picked_up", "in_transit", "delivering"].includes(status);
}

export default function OrderListScreen() {
    const navigation = useNavigation<any>();

    const { width } = useWindowDimensions();
    const isMobile = width < 768;

    const [quickMenuVisible, setQuickMenuVisible] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [customer, setCustomer] = useState<{ store_name?: string } | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<FilterTab>("all");

    useEffect(() => {
        getCurrentCustomer()
            .then((p) => p && setCustomer(p))
            .catch(() => {});
    }, []);

    const loadOrders = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getOrders();
            setOrders(data);
        } catch (e) {
            console.log("Lỗi tải đơn hàng:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    const handleLogout = async () => {
        try {
            await logoutCustomer();
        } catch (e) {
            console.log("Đăng xuất lỗi:", e);
        }
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    };

    const filteredOrders =
        activeTab === "all"
            ? orders
            : activeTab === "delivering"
            ? orders.filter((o) => isDelivering(o.status))
            : orders.filter((o) => o.status === activeTab);

    const customerInitials = getInitials(customer?.store_name);

    const sidebarProps = {
        initials: customerInitials,
        activePage: "orders" as const,
        onToggleQuickMenu: () => { setQuickMenuVisible((p) => !p); setSidebarOpen(false); },
        onPressOverview: () => { setSidebarOpen(false); navigation.navigate("Dashboard"); },
        onPressOrders: () => setSidebarOpen(false),
        onPressReport: () => { setSidebarOpen(false); showComingSoon("Báo cáo thống kê"); },
        onPressMoney: () => { setSidebarOpen(false); showComingSoon("COD và đối soát"); },
        onPressChat: () => { setSidebarOpen(false); showComingSoon("Hỗ trợ khách hàng"); },
        onPressWallet: () => { setSidebarOpen(false); showComingSoon("Ví thanh toán"); },
        onPressHelp: () => { setSidebarOpen(false); showComingSoon("Trung tâm hỗ trợ"); },
        onPressProfile: () => { setSidebarOpen(false); navigation.navigate("Dashboard", { openProfile: true }); },
        onPressLogout: handleLogout,
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.root}>
                {/* Backdrop trong suốt cho QuickMenu */}
                {quickMenuVisible && (
                    <TouchableOpacity
                        activeOpacity={1}
                        style={styles.backdrop}
                        onPress={() => setQuickMenuVisible(false)}
                    />
                )}

                {/* Backdrop tối cho sidebar mobile overlay */}
                {isMobile && sidebarOpen && (
                    <TouchableOpacity
                        activeOpacity={1}
                        style={styles.sidebarBackdrop}
                        onPress={() => setSidebarOpen(false)}
                    />
                )}
                {quickMenuVisible && <DashboardQuickMenu onLogout={handleLogout} />}

                {/* Sidebar cố định trên desktop */}
                {!isMobile && <DashboardSidebar {...sidebarProps} />}

                {/* Sidebar overlay trên mobile */}
                {isMobile && sidebarOpen && (
                    <View style={styles.sidebarOverlay}>
                        <DashboardSidebar {...sidebarProps} />
                    </View>
                )}

                <View style={styles.mainArea}>
                    {/* Header */}
                    <View style={styles.header}>
                        {isMobile && (
                            <TouchableOpacity
                                activeOpacity={0.75}
                                onPress={() => setSidebarOpen((v) => !v)}
                                style={styles.hamburgerBtn}
                            >
                                <MaterialCommunityIcons name="menu" size={26} color={colors.text} />
                            </TouchableOpacity>
                        )}

                        <Text style={styles.pageTitle}>Danh sách đơn hàng</Text>

                        <TouchableOpacity
                            activeOpacity={0.85}
                            style={[styles.createBtn, webNoOutline]}
                            onPress={() => navigation.navigate("CreateOrder")}
                        >
                            <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
                            <Text style={styles.createBtnText}>Tạo đơn hàng</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Filter tabs */}
                    <View style={styles.tabBar}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {TABS.map((tab) => (
                                <TouchableOpacity
                                    key={tab.key}
                                    activeOpacity={0.8}
                                    style={[styles.tab, activeTab === tab.key && styles.tabActive, webNoOutline]}
                                    onPress={() => setActiveTab(tab.key)}
                                >
                                    <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                                        {tab.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={[styles.refreshBtn, webNoOutline]}
                            onPress={loadOrders}
                        >
                            <MaterialCommunityIcons name="refresh" size={20} color={colors.brand} />
                        </TouchableOpacity>
                    </View>

                    {/* Content: Card view tren mobile, Table tren desktop */}
                    <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator>
                        {loading ? (
                            <View style={styles.centerBox}>
                                <ActivityIndicator size="large" color={colors.brand} />
                                <Text style={styles.centerText}>Đang tải...</Text>
                            </View>
                        ) : filteredOrders.length === 0 ? (
                            <View style={styles.centerBox}>
                                <MaterialCommunityIcons name="package-variant" size={56} color="#DDDDDD" />
                                <Text style={styles.emptyTitle}>Chưa có đơn hàng nào</Text>
                                <Text style={styles.emptyDesc}>
                                    {activeTab === "all"
                                        ? "Bấm \"Tạo đơn hàng\" để tạo đơn đầu tiên"
                                        : "Không có đơn nào trong trạng thái này"}
                                </Text>
                            </View>
                        ) : isMobile ? (
                            /* === MOBILE: Card list === */
                            <View style={styles.cardList}>
                                {filteredOrders.map((order) => (
                                    <TouchableOpacity
                                        key={order.id}
                                        activeOpacity={0.85}
                                        style={[styles.orderCard, webNoOutline]}
                                        onPress={() => navigation.navigate("OrderDetail", { orderId: order.id })}
                                    >
                                        {/* Card header: ma don + status */}
                                        <View style={styles.cardTop}>
                                            <Text style={styles.cardCode}>{order.order_code}</Text>
                                            <StatusBadge status={order.status} />
                                        </View>

                                        {/* Nguoi nhan */}
                                        <Text style={styles.cardReceiver} numberOfLines={1}>
                                            {order.receiver_name} · {order.receiver_phone}
                                        </Text>
                                        {order.receiver_province ? (
                                            <Text style={styles.cardAddr} numberOfLines={1}>
                                                {order.receiver_province}
                                            </Text>
                                        ) : null}

                                        {/* Footer card: san pham + COD + ngay */}
                                        <View style={styles.cardFooter}>
                                            <Text style={styles.cardProduct} numberOfLines={1}>
                                                {order.product_name || "—"} · {order.total_weight} kg
                                            </Text>
                                            <View style={styles.cardMeta}>
                                                <Text style={styles.cardCod}>{formatMoney(order.cod_amount)}</Text>
                                                <Text style={styles.cardDate}>{formatDate(order.created_at)}</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : (
                            /* === DESKTOP: Table (scroll ngang) === */
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View style={styles.tableInner}>
                                    <View style={styles.tableHeader}>
                                        <Text style={[styles.colHeader, styles.colCode]}>Mã vận đơn</Text>
                                        <Text style={[styles.colHeader, styles.colReceiver]}>Người nhận</Text>
                                        <Text style={[styles.colHeader, styles.colProduct]}>Sản phẩm</Text>
                                        <Text style={[styles.colHeader, styles.colCod]}>Thu hộ</Text>
                                        <Text style={[styles.colHeader, styles.colStatus]}>Trạng thái</Text>
                                        <Text style={[styles.colHeader, styles.colDate]}>Ngày tạo</Text>
                                    </View>

                                    {filteredOrders.map((order, index) => (
                                        <TouchableOpacity
                                            key={order.id}
                                            activeOpacity={0.85}
                                            style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt, webNoOutline]}
                                            onPress={() => navigation.navigate("OrderDetail", { orderId: order.id })}
                                        >
                                            <View style={styles.colCode}>
                                                <Text style={styles.orderCode}>{order.order_code}</Text>
                                                {order.shop_order_code ? (
                                                    <Text style={styles.shopCode}>{order.shop_order_code}</Text>
                                                ) : null}
                                            </View>
                                            <View style={styles.colReceiver}>
                                                <Text style={styles.receiverName} numberOfLines={1}>{order.receiver_name}</Text>
                                                <Text style={styles.receiverPhone}>{order.receiver_phone}</Text>
                                                {order.receiver_province ? (
                                                    <Text style={styles.receiverAddr} numberOfLines={1}>{order.receiver_province}</Text>
                                                ) : null}
                                            </View>
                                            <View style={styles.colProduct}>
                                                <Text style={styles.productName} numberOfLines={2}>{order.product_name || "—"}</Text>
                                                <Text style={styles.productDetail}>{order.total_weight} kg · {order.quantity} SP</Text>
                                            </View>
                                            <View style={styles.colCod}>
                                                <Text style={styles.codAmount}>{formatMoney(order.cod_amount)}</Text>
                                            </View>
                                            <View style={styles.colStatus}>
                                                <StatusBadge status={order.status} />
                                            </View>
                                            <View style={styles.colDate}>
                                                <Text style={styles.dateText}>{formatDate(order.created_at)}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        )}
                    </ScrollView>

                    {/* Footer count */}
                    {!loading && filteredOrders.length > 0 && (
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>
                                Hiển thị {filteredOrders.length} / {orders.length} đơn hàng
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },

    root: { flex: 1, flexDirection: "row", backgroundColor: colors.background },

    backdrop: {
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 20,
    },

    sidebarBackdrop: {
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 25,
        backgroundColor: "rgba(0,0,0,0.2)",
    },

    sidebarOverlay: {
        position: "absolute", top: 0, left: 0, bottom: 0, zIndex: 30,
    },

    hamburgerBtn: { marginRight: 12, padding: 4 },

    mainArea: { flex: 1, backgroundColor: colors.background },

    header: {
        height: 68,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingLeft: 24,
        paddingRight: 24,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    pageTitle: { fontSize: 20, fontWeight: "700", color: colors.text },

    createBtn: {
        height: 40,
        borderRadius: radii.md,
        backgroundColor: colors.brand,
        paddingHorizontal: 18,
        flexDirection: "row",
        alignItems: "center",
    },

    createBtnText: { fontSize: 14, fontWeight: "600", color: "#FFFFFF", marginLeft: 8 },

    tabBar: {
        height: 50,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
    },

    tab: {
        height: 50,
        paddingHorizontal: 14,
        alignItems: "center",
        justifyContent: "center",
        borderBottomWidth: 2,
        borderBottomColor: "transparent",
        marginRight: 2,
    },

    tabActive: { borderBottomColor: colors.brand },

    tabText: { fontSize: 13, fontWeight: "500", color: colors.textMuted },

    tabTextActive: { color: colors.brand, fontWeight: "600" },

    refreshBtn: {
        width: 36,
        height: 36,
        borderRadius: radii.sm,
        backgroundColor: colors.brandSoft,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 8,
    },

    scrollArea: { flex: 1 },

    /* tableInner bao toan bo header + rows, dam bao chieu rong toi thieu cho table */
    tableInner: {
        minWidth: 760,
    },

    tableHeader: {
        flexDirection: "row",
        alignItems: "center",
        height: 42,
        backgroundColor: colors.surfaceMuted,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingHorizontal: 20,
    },

    tableRow: {
        flexDirection: "row",
        alignItems: "center",
        minHeight: 68,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },

    tableRowAlt: { backgroundColor: colors.surfaceMuted },

    colHeader: { fontSize: 12, fontWeight: "600", color: colors.textSubtle, textTransform: "uppercase" },

    colCode: { width: 160, marginRight: 8 },
    colReceiver: { flex: 1, marginRight: 8 },
    colProduct: { width: 150, marginRight: 8 },
    colCod: { width: 110, marginRight: 8, alignItems: "flex-end" },
    colStatus: { width: 140, marginRight: 8 },
    colDate: { width: 120 },

    orderCode: { fontSize: 14, fontWeight: "700", color: colors.brand },
    shopCode: { fontSize: 12, color: colors.textSubtle, marginTop: 2 },

    receiverName: { fontSize: 14, fontWeight: "600", color: colors.text },
    receiverPhone: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
    receiverAddr: { fontSize: 12, color: colors.textSubtle, marginTop: 2 },

    productName: { fontSize: 13, color: colors.text },
    productDetail: { fontSize: 12, color: colors.textSubtle, marginTop: 2 },

    codAmount: { fontSize: 14, fontWeight: "700", color: colors.text },

    dateText: { fontSize: 12, color: colors.textMuted },

    badge: {
        paddingHorizontal: 9,
        paddingVertical: 3,
        borderRadius: 12,
        borderWidth: 1,
        alignSelf: "flex-start",
    },

    badgeText: { fontSize: 12, fontWeight: "600" },

    centerBox: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 80,
    },

    centerText: { marginTop: 12, fontSize: 14, color: colors.textMuted },

    emptyTitle: { fontSize: 17, fontWeight: "700", color: colors.text, marginTop: 16 },

    emptyDesc: { fontSize: 14, color: colors.textMuted, marginTop: 8, textAlign: "center" },

    footer: {
        height: 42,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        alignItems: "center",
        justifyContent: "center",
    },

    footerText: { fontSize: 13, color: colors.textMuted },

    // ======= Mobile card list =======
    cardList: {
        padding: 12,
        gap: 10,
    },

    orderCard: {
        backgroundColor: colors.surface,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 14,
    },

    cardTop: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 6,
    },

    cardCode: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.brand,
        flex: 1,
        marginRight: 8,
    },

    cardReceiver: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.text,
        marginBottom: 2,
    },

    cardAddr: {
        fontSize: 12,
        color: colors.textSubtle,
        marginBottom: 8,
    },

    cardFooter: {
        borderTopWidth: 1,
        borderTopColor: colors.border,
        marginTop: 8,
        paddingTop: 8,
    },

    cardProduct: {
        fontSize: 12,
        color: colors.textMuted,
        marginBottom: 4,
    },

    cardMeta: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    cardCod: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.text,
    },

    cardDate: {
        fontSize: 12,
        color: colors.textSubtle,
    },
});
