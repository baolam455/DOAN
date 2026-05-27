import React, { useEffect, useState } from "react";
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Platform,
    Modal,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { getCurrentCustomer, logoutCustomer } from "../../services/customerApi";
import {
    getOrderById,
    getOrderTracking,
    cancelOrder,
    Order,
    OrderTracking,
    statusLabel,
    statusColor,
    statusIcon,
} from "../../services/orderApi";
import DashboardSidebar from "../../components/Web/Dashboard/DashboardSidebar";
import DashboardQuickMenu from "../../components/Web/Dashboard/DashboardQuickMenu";
import { getInitials, formatDate, formatMoney, showComingSoon } from "../../utils/helpers";
import { colors, radii } from "../../theme";

const webNoOutline =
    Platform.OS === "web"
        ? ({ outlineStyle: "none", outlineWidth: 0, outlineColor: "transparent" } as any)
        : null;

function InfoRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
    return (
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={[styles.infoValue, accent && styles.infoValueAccent]}>{value}</Text>
        </View>
    );
}

function TrackingEvent({ event, isLast }: { event: OrderTracking; isLast: boolean }) {
    const color = statusColor(event.status);
    return (
        <View style={styles.trackingEvent}>
            <View style={styles.trackingLeft}>
                <View style={[styles.trackingDot, { backgroundColor: color }]}>
                    <MaterialCommunityIcons
                        name={statusIcon(event.status) as any}
                        size={14}
                        color="#FFFFFF"
                    />
                </View>
                {!isLast && <View style={styles.trackingLine} />}
            </View>

            <View style={styles.trackingContent}>
                <Text style={[styles.trackingStatus, { color }]}>{statusLabel(event.status)}</Text>
                {event.note ? <Text style={styles.trackingNote}>{event.note}</Text> : null}
                {event.location ? (
                    <View style={styles.trackingLocRow}>
                        <MaterialCommunityIcons name="map-marker-outline" size={13} color="#999999" />
                        <Text style={styles.trackingLoc}>{event.location}</Text>
                    </View>
                ) : null}
                <Text style={styles.trackingDate}>{formatDate(event.created_at)}</Text>
            </View>
        </View>
    );
}

export default function OrderDetailScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const orderId = route.params?.orderId as string;

    const [quickMenuVisible, setQuickMenuVisible] = useState(false);
    const [customer, setCustomer] = useState<{ store_name?: string } | null>(null);
    const [order, setOrder] = useState<Order | null>(null);
    const [tracking, setTracking] = useState<OrderTracking[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    // Thay thế browser confirm/alert — dùng state-based modal và notice
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [errorNotice, setErrorNotice] = useState<string | null>(null);

    useEffect(() => {
        getCurrentCustomer()
            .then((p) => p && setCustomer(p))
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (!orderId) return;

        const loadData = async () => {
            setLoading(true);
            try {
                const [ord, trk] = await Promise.all([
                    getOrderById(orderId),
                    getOrderTracking(orderId),
                ]);
                setOrder(ord);
                setTracking(trk);
            } catch (e) {
                console.log("Lỗi tải chi tiết đơn:", e);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [orderId]);

    const handleLogout = async () => {
        try {
            await logoutCustomer();
        } catch {}
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    };

    // Mở modal xác nhận thay vì gọi browser confirm()
    const handleCancel = () => {
        if (Platform.OS !== "web") {
            // Native: dùng Alert bình thường
            Alert.alert("Xác nhận hủy", "Bạn có chắc muốn hủy đơn hàng này?", [
                { text: "Không", style: "cancel" },
                { text: "Hủy đơn", style: "destructive", onPress: doCancel },
            ]);
        } else {
            // Web: dùng custom modal state
            setConfirmVisible(true);
        }
    };

    const doCancel = async () => {
        setConfirmVisible(false);
        if (!orderId) return;
        setCancelling(true);
        setErrorNotice(null);
        try {
            await cancelOrder(orderId);
            const [ord, trk] = await Promise.all([
                getOrderById(orderId),
                getOrderTracking(orderId),
            ]);
            setOrder(ord);
            setTracking(trk);
        } catch (e: any) {
            const msg = e?.message || "Không thể hủy đơn hàng";
            if (Platform.OS !== "web") {
                Alert.alert("Lỗi", msg);
            } else {
                // Web: hiện inline notice, không dùng browser alert()
                setErrorNotice("Hủy đơn thất bại: " + msg);
            }
        } finally {
            setCancelling(false);
        }
    };

    const customerInitials = getInitials(customer?.store_name);
    const canCancel = order?.status === "pending";

    const shippingTypeLabel = order?.shipping_type === "express" ? "EXPRESS (< 20kg)" : "BBS (≥ 20kg)";
    const transportTypeLabel = order?.transport_type === "road" ? "Đường bộ" : "Đường bay";
    const pickupMethodLabel = order?.pickup_method === "home" ? "Lấy hàng tận nơi" : "Gửi hàng bưu cục";
    const shipPayerLabel = order?.ship_payer === "customer" ? "Khách trả ship" : "Shop trả ship";

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.root}>
                {quickMenuVisible && (
                    <TouchableOpacity
                        activeOpacity={1}
                        style={styles.backdrop}
                        onPress={() => setQuickMenuVisible(false)}
                    />
                )}
                {quickMenuVisible && <DashboardQuickMenu onLogout={handleLogout} />}

                <DashboardSidebar
                    initials={customerInitials}
                    activePage="orders"
                    onToggleQuickMenu={() => setQuickMenuVisible((p) => !p)}
                    onPressOverview={() => navigation.navigate("Dashboard")}
                    onPressOrders={() => navigation.navigate("OrderList")}
                    onPressReport={() => showComingSoon("Báo cáo thống kê")}
                    onPressMoney={() => showComingSoon("COD và đối soát")}
                    onPressChat={() => showComingSoon("Hỗ trợ khách hàng")}
                    onPressWallet={() => showComingSoon("Ví thanh toán")}
                    onPressHelp={() => showComingSoon("Trung tâm hỗ trợ")}
                    onPressProfile={() => navigation.navigate("Dashboard", { openProfile: true })}
                    onPressLogout={handleLogout}
                />

                <View style={styles.mainArea}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={[styles.backBtn, webNoOutline]}
                                onPress={() => navigation.navigate("OrderList")}
                            >
                                <MaterialCommunityIcons name="chevron-left" size={26} color={colors.text} />
                            </TouchableOpacity>

                            <Text style={styles.pageTitle}>Chi tiết đơn hàng</Text>

                            {order && (
                                <Text style={styles.orderCodeHeader}>{order.order_code}</Text>
                            )}
                        </View>

                        {order && (
                            <View style={[styles.statusBadge, { backgroundColor: statusColor(order.status) + "22", borderColor: statusColor(order.status) + "55" }]}>
                                <Text style={[styles.statusBadgeText, { color: statusColor(order.status) }]}>
                                    {statusLabel(order.status)}
                                </Text>
                            </View>
                        )}
                    </View>

                    {loading ? (
                        <View style={styles.centerBox}>
                            <ActivityIndicator size="large" color={colors.brand} />
                            <Text style={styles.centerText}>Đang tải...</Text>
                        </View>
                    ) : !order ? (
                        <View style={styles.centerBox}>
                            <MaterialCommunityIcons name="alert-circle-outline" size={54} color="#DDDDDD" />
                            <Text style={styles.emptyTitle}>Không tìm thấy đơn hàng</Text>
                        </View>
                    ) : (
                        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator>
                            <View style={styles.contentRow}>
                                {/* Left: Order Info */}
                                <View style={styles.leftCol}>
                                    {/* Receiver info */}
                                    <View style={styles.card}>
                                        <Text style={styles.cardTitle}>Thông tin người nhận</Text>
                                        <InfoRow label="Tên" value={order.receiver_name} />
                                        <InfoRow label="Số điện thoại" value={order.receiver_phone} />
                                        <InfoRow label="Địa chỉ" value={order.receiver_address} />
                                        {order.receiver_ward && (
                                            <InfoRow label="Phường/Xã" value={order.receiver_ward} />
                                        )}
                                        {order.receiver_province && (
                                            <InfoRow label="Tỉnh/TP" value={order.receiver_province} />
                                        )}
                                    </View>

                                    {/* Product info */}
                                    <View style={styles.card}>
                                        <Text style={styles.cardTitle}>Thông tin sản phẩm</Text>
                                        <InfoRow label="Tên sản phẩm" value={order.product_name || "—"} />
                                        <InfoRow label="Số lượng" value={`${order.quantity} sản phẩm`} />
                                        <InfoRow label="Khối lượng" value={`${order.total_weight} kg`} />
                                    </View>

                                    {/* Shipping info */}
                                    <View style={styles.card}>
                                        <Text style={styles.cardTitle}>Dịch vụ vận chuyển</Text>
                                        <InfoRow label="Loại dịch vụ" value={shippingTypeLabel} />
                                        <InfoRow label="Phương tiện" value={transportTypeLabel} />
                                        <InfoRow label="Hình thức lấy" value={pickupMethodLabel} />
                                        <InfoRow label="Người trả ship" value={shipPayerLabel} />
                                    </View>

                                    {/* Pricing */}
                                    <View style={styles.card}>
                                        <Text style={styles.cardTitle}>Thanh toán</Text>
                                        <InfoRow label="Tiền thu hộ (COD)" value={formatMoney(order.cod_amount)} accent />
                                        <InfoRow label="Giá trị hàng" value={formatMoney(order.product_value)} />
                                        <InfoRow label="Phí vận chuyển" value={formatMoney(order.shipping_fee)} />
                                        <View style={[styles.infoRow, styles.totalRow]}>
                                            <Text style={styles.totalLabel}>Tổng thu</Text>
                                            <Text style={styles.totalValue}>
                                                {formatMoney((order.cod_amount ?? 0) + (order.shipping_fee ?? 0))}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Dates */}
                                    <View style={styles.card}>
                                        <Text style={styles.cardTitle}>Thời gian</Text>
                                        <InfoRow label="Ngày tạo" value={formatDate(order.created_at)} />
                                        {order.pickup_at && (
                                            <InfoRow label="Đã lấy hàng" value={formatDate(order.pickup_at)} />
                                        )}
                                        {order.delivered_at && (
                                            <InfoRow label="Giao thành công" value={formatDate(order.delivered_at)} />
                                        )}
                                    </View>

                                    {order.shop_order_code && (
                                        <View style={styles.card}>
                                            <Text style={styles.cardTitle}>Mã đơn riêng của shop</Text>
                                            <Text style={styles.shopCode}>{order.shop_order_code}</Text>
                                        </View>
                                    )}

                                    {/* Error notice — thay thế browser alert() */}
                                    {errorNotice ? (
                                        <View style={styles.errorNotice}>
                                            <MaterialCommunityIcons name="alert-circle-outline" size={16} color={colors.danger} />
                                            <Text style={styles.errorNoticeText}>{errorNotice}</Text>
                                            <TouchableOpacity onPress={() => setErrorNotice(null)} style={webNoOutline}>
                                                <MaterialCommunityIcons name="close" size={16} color={colors.danger} />
                                            </TouchableOpacity>
                                        </View>
                                    ) : null}

                                    {/* Cancel button */}
                                    {canCancel && (
                                        <TouchableOpacity
                                            activeOpacity={0.85}
                                            style={[styles.cancelBtn, cancelling && styles.cancelBtnDisabled, webNoOutline]}
                                            onPress={handleCancel}
                                            disabled={cancelling}
                                        >
                                            {cancelling ? (
                                                <ActivityIndicator size="small" color="#EF4444" />
                                            ) : (
                                                <MaterialCommunityIcons name="close-circle-outline" size={18} color="#EF4444" />
                                            )}
                                            <Text style={styles.cancelBtnText}>
                                                {cancelling ? "Đang hủy..." : "Hủy đơn hàng"}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>

                                {/* Right: Tracking */}
                                <View style={styles.rightCol}>
                                    <View style={styles.card}>
                                        <Text style={styles.cardTitle}>Lịch sử vận chuyển</Text>

                                        {tracking.length === 0 ? (
                                            <Text style={styles.noTracking}>Chưa có lịch sử vận chuyển</Text>
                                        ) : (
                                            <View style={styles.trackingList}>
                                                {[...tracking].reverse().map((event, index) => (
                                                    <TrackingEvent
                                                        key={event.id}
                                                        event={event}
                                                        isLast={index === tracking.length - 1}
                                                    />
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                    )}
                </View>
            </View>

            {/* Confirm Modal — thay thế browser confirm() trên web */}
            <Modal
                transparent
                animationType="fade"
                visible={confirmVisible}
                onRequestClose={() => setConfirmVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <MaterialCommunityIcons name="alert-outline" size={36} color={colors.danger} />
                        <Text style={styles.modalTitle}>Xác nhận hủy đơn</Text>
                        <Text style={styles.modalBody}>
                            Bạn có chắc muốn hủy đơn hàng này không?{"\n"}Hành động này không thể hoàn tác.
                        </Text>
                        <View style={styles.modalBtns}>
                            <TouchableOpacity
                                activeOpacity={0.85}
                                style={[styles.modalBtnCancel, webNoOutline]}
                                onPress={() => setConfirmVisible(false)}
                            >
                                <Text style={styles.modalBtnCancelText}>Không</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={0.85}
                                style={[styles.modalBtnConfirm, webNoOutline]}
                                onPress={doCancel}
                            >
                                <Text style={styles.modalBtnConfirmText}>Hủy đơn</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },

    root: { flex: 1, flexDirection: "row", backgroundColor: colors.background },

    backdrop: {
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 20,
    },

    mainArea: { flex: 1, backgroundColor: colors.background },

    header: {
        height: 68,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingLeft: 16,
        paddingRight: 24,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    headerLeft: { flexDirection: "row", alignItems: "center" },

    backBtn: {
        width: 38,
        height: 38,
        borderRadius: radii.sm,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
    },

    pageTitle: { fontSize: 20, fontWeight: "700", color: colors.text, marginRight: 12 },

    orderCodeHeader: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.brand,
        backgroundColor: colors.brandSoft,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: radii.sm,
    },

    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 12,
        borderWidth: 1,
    },

    statusBadgeText: { fontSize: 13, fontWeight: "600" },

    scrollArea: { flex: 1 },

    scrollContent: {
        paddingHorizontal: 22,
        paddingTop: 22,
        paddingBottom: 40,
    },

    contentRow: { flexDirection: "row", alignItems: "flex-start", flexWrap: "wrap" },

    leftCol: { flex: 1, minWidth: 280, marginRight: 18, marginBottom: 16 },

    rightCol: { width: 360, flexShrink: 1, minWidth: 260, marginBottom: 16 },

    card: {
        backgroundColor: colors.surface,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 18,
        marginBottom: 14,
        shadowColor: "#101828",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
    },

    cardTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: colors.text,
        marginBottom: 14,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },

    infoRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },

    infoLabel: { fontSize: 13, color: colors.textMuted, flex: 1 },

    infoValue: { fontSize: 13, color: colors.text, fontWeight: "500", flex: 2, textAlign: "right" },

    infoValueAccent: { color: colors.danger, fontWeight: "700" },

    totalRow: {
        borderBottomWidth: 0,
        paddingTop: 12,
        marginTop: 4,
    },

    totalLabel: { fontSize: 14, fontWeight: "700", color: colors.text, flex: 1 },

    totalValue: { fontSize: 15, fontWeight: "700", color: colors.text },

    shopCode: { fontSize: 14, fontWeight: "600", color: colors.brand },

    cancelBtn: {
        height: 44,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.danger,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.dangerSoft,
        marginBottom: 14,
    },

    cancelBtnDisabled: { opacity: 0.6 },

    cancelBtnText: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.danger,
        marginLeft: 8,
    },

    trackingList: { paddingTop: 8 },

    trackingEvent: {
        flexDirection: "row",
        marginBottom: 20,
    },

    trackingLeft: {
        width: 32,
        alignItems: "center",
    },

    trackingDot: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },

    trackingLine: {
        width: 2,
        flex: 1,
        backgroundColor: colors.border,
        marginTop: 4,
        minHeight: 24,
    },

    trackingContent: { flex: 1, marginLeft: 12, paddingBottom: 4 },

    trackingStatus: { fontSize: 13, fontWeight: "700", marginBottom: 4 },

    trackingNote: { fontSize: 13, color: colors.text, marginBottom: 4 },

    trackingLocRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },

    trackingLoc: { fontSize: 12, color: colors.textMuted, marginLeft: 4 },

    trackingDate: { fontSize: 12, color: colors.textSubtle },

    noTracking: { fontSize: 13, color: colors.textMuted, textAlign: "center", paddingVertical: 20 },

    centerBox: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 80,
    },

    centerText: { marginTop: 12, fontSize: 14, color: colors.textMuted },

    emptyTitle: { fontSize: 17, fontWeight: "700", color: colors.text, marginTop: 16 },

    // ---- Error notice (thay thế browser alert) ----
    errorNotice: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.dangerSoft,
        borderWidth: 1,
        borderColor: "#FECDCA",
        borderRadius: radii.sm,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 12,
        gap: 8,
    },

    errorNoticeText: {
        flex: 1,
        fontSize: 13,
        color: colors.danger,
        fontWeight: "500",
    },

    // ---- Confirm Modal (thay thế browser confirm) ----
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
    },

    modalBox: {
        backgroundColor: colors.surface,
        borderRadius: radii.md,
        padding: 28,
        alignItems: "center",
        width: "100%",
        maxWidth: 380,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 12,
        elevation: 8,
    },

    modalTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: colors.text,
        marginTop: 12,
        marginBottom: 8,
    },

    modalBody: {
        fontSize: 14,
        color: colors.textMuted,
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 20,
    },

    modalBtns: {
        flexDirection: "row",
        gap: 12,
        width: "100%",
    },

    modalBtnCancel: {
        flex: 1,
        height: 44,
        borderRadius: radii.sm,
        borderWidth: 1,
        borderColor: colors.borderStrong,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.surface,
    },

    modalBtnCancelText: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.textMuted,
    },

    modalBtnConfirm: {
        flex: 1,
        height: 44,
        borderRadius: radii.sm,
        backgroundColor: colors.danger,
        alignItems: "center",
        justifyContent: "center",
    },

    modalBtnConfirmText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#FFFFFF",
    },
});
