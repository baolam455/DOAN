import React, { useEffect, useState, useCallback } from "react";
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    useWindowDimensions,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { CustomerProfile, getCurrentCustomer, logoutCustomer } from "../../services/customerApi";
import { getDashboardStats, DashboardStats } from "../../services/orderApi";
import { DateFilter } from "../../components/Web/Dashboard/DashboardFilterBar";
import { getInitials, showComingSoon } from "../../utils/helpers";
import { colors, radii } from "../../theme";

import DashboardSidebar from "../../components/Web/Dashboard/DashboardSidebar";
import DashboardQuickMenu from "../../components/Web/Dashboard/DashboardQuickMenu";
import DashboardFilterBar from "../../components/Web/Dashboard/DashboardFilterBar";
import DashboardMetricGrid from "../../components/Web/Dashboard/DashboardMetricGrid";
import DashboardReturnCard from "../../components/Web/Dashboard/DashboardReturnCard";
import DashboardTrendChart from "../../components/Web/Dashboard/DashboardTrendChart";
import DashboardRecentOrders from "../../components/Web/Dashboard/DashboardRecentOrders";
import DashboardProfilePanel from "../../components/Web/Dashboard/DashboardProfilePanel";

function getDateRange(filter: DateFilter): { from?: string; to?: string } {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    if (filter === "today") {
        return {
            from: `${todayStr}T00:00:00.000Z`,
            to: `${todayStr}T23:59:59.999Z`,
        };
    }
    if (filter === "7days") {
        const from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return { from: from.toISOString() };
    }
    if (filter === "30days") {
        const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return { from: from.toISOString() };
    }
    return {};
}

export default function DashboardScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();

    const { width } = useWindowDimensions();
    const isMobile = width < 768;

    const [quickMenuVisible, setQuickMenuVisible] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false); // Sidebar overlay tren mobile
    const [activePage, setActivePage] = useState<"overview" | "profile">("overview");

    // Khi navigate từ màn khác với param openProfile=true → tự động mở trang hồ sơ
    useEffect(() => {
        if (route?.params?.openProfile) {
            setActivePage("profile");
        }
    }, [route?.params?.openProfile]);
    const [customer, setCustomer] = useState<CustomerProfile | null>(null);
    const [stats, setStats] = useState<DashboardStats | undefined>(undefined);
    const [dateFilter, setDateFilter] = useState<DateFilter>("all");

    useEffect(() => {
        getCurrentCustomer()
            .then((profile) => { if (profile) setCustomer(profile); })
            .catch((error) => { console.log("Khong lay duoc thong tin KH:", error); });
    }, []);

    const loadStats = useCallback(async (filter: DateFilter) => {
        try {
            const range = getDateRange(filter);
            const data = await getDashboardStats(range.from, range.to);
            setStats(data);
        } catch (error) {
            console.log("Loi tai thong ke:", error);
        }
    }, []);

    useEffect(() => {
        loadStats(dateFilter);
    }, [dateFilter, loadStats]);

    const customerName = customer?.store_name || "Khach hang";
    const customerInitials = getInitials(customerName);

    // Hiện thông báo "Sắp ra mắt" thay vì dẫn sang màn trống
    const goFeature = (title: string) => showComingSoon(title);

    const handleLogout = async () => {
        try {
            await logoutCustomer();
        } catch (error) {
            console.log("Dang xuat loi:", error);
        } finally {
            navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        }
    };

    // Props sidebar dùng lại ở cả desktop và mobile overlay
    const sidebarProps = {
        initials: customerInitials,
        activePage: activePage as any,
        onToggleQuickMenu: () => { setQuickMenuVisible((prev) => !prev); setSidebarOpen(false); },
        onPressOverview: () => { setActivePage("overview"); setSidebarOpen(false); navigation.navigate("Dashboard"); },
        onPressOrders: () => { setSidebarOpen(false); navigation.navigate("OrderList"); },
        onPressProfile: () => { setActivePage("profile"); setSidebarOpen(false); },
        onPressReport: () => { setSidebarOpen(false); goFeature("Báo cáo thống kê"); },
        onPressMoney: () => { setSidebarOpen(false); goFeature("COD và đối soát"); },
        onPressChat: () => { setSidebarOpen(false); goFeature("Hỗ trợ khách hàng"); },
        onPressWallet: () => { setSidebarOpen(false); goFeature("Ví thanh toán"); },
        onPressHelp: () => { setSidebarOpen(false); goFeature("Trung tâm hỗ trợ"); },
        onPressLogout: handleLogout,
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.root}>
                {/* Backdrop trong suốt cho QuickMenu — chỉ bắt click, không che tối màn hình */}
                {quickMenuVisible && (
                    <TouchableOpacity
                        activeOpacity={1}
                        style={styles.menuBackdrop}
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

                {quickMenuVisible && (
                    <DashboardQuickMenu
                        onLogout={handleLogout}
                        onPressProfile={() => {
                            setActivePage("profile");
                            setQuickMenuVisible(false);
                        }}
                    />
                )}

                {/* Desktop: sidebar cố định bên trái */}
                {!isMobile && (
                    <DashboardSidebar {...sidebarProps} />
                )}

                {/* Mobile: sidebar dạng overlay slide từ trái */}
                {isMobile && sidebarOpen && (
                    <View style={styles.sidebarOverlay}>
                        <DashboardSidebar {...sidebarProps} />
                    </View>
                )}

                <View style={styles.mainArea}>
                    <View style={styles.header}>
                        {/* Hamburger chỉ hiện trên mobile */}
                        {isMobile && (
                            <TouchableOpacity
                                activeOpacity={0.75}
                                onPress={() => setSidebarOpen((v) => !v)}
                                style={styles.hamburgerBtn}
                            >
                                <MaterialCommunityIcons name="menu" size={26} color={colors.text} />
                            </TouchableOpacity>
                        )}

                        <Text style={styles.pageTitle}>
                            {activePage === "profile" ? "Hồ sơ tài khoản" : "Tổng quan"}
                        </Text>

                        {activePage !== "profile" && (
                            <TouchableOpacity
                                activeOpacity={0.85}
                                style={styles.createButton}
                                onPress={() => navigation.navigate("CreateOrder")}
                            >
                                <MaterialCommunityIcons name="plus" size={21} color="#FFFFFF" />
                                <Text style={styles.createButtonText}>{"Tạo đơn hàng"}</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Trang ho so tai khoan */}
                    {activePage === "profile" && (
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <DashboardProfilePanel
                                profile={customer}
                                onProfileUpdated={(updated) => setCustomer(updated)}
                            />
                        </ScrollView>
                    )}

                    {/* Trang tong quan — an khi dang o profile */}
                    {activePage !== "profile" && (
                    <ScrollView
                        style={styles.scrollArea}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator
                    >
                        <DashboardFilterBar
                            activeFilter={dateFilter}
                            onPressToday={() => setDateFilter("today")}
                            onPressSevenDays={() => setDateFilter("7days")}
                            onPressThirtyDays={() => setDateFilter("30days")}
                            onPressCustom={() => setDateFilter("all")}
                            onPressNotice={() => goFeature("Thông báo")}
                        />

                        <View style={styles.contentRow}>
                            <View style={styles.leftColumn}>
                                <DashboardMetricGrid
                                    stats={stats}
                                    onPressGenerated={() => navigation.navigate("OrderList")}
                                    onPressSuccess={() => navigation.navigate("OrderList")}
                                    onPressDelivering={() => navigation.navigate("OrderList")}
                                    onPressShippingFee={() => goFeature("Phí vận chuyển")}
                                />

                                <DashboardReturnCard
                                    onPressReason={(reason) => goFeature(reason)}
                                />

                                <DashboardTrendChart
                                    onPress={() => goFeature("Xu hướng hàng tiền")}
                                />
                            </View>

                            <View style={styles.rightColumn}>
                                {/* Thay the Top SP/KV luon trong bang widget don hang thuc te */}
                                <DashboardRecentOrders
                                    onViewAll={() => navigation.navigate("OrderList")}
                                />
                            </View>
                        </View>
                    </ScrollView>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },

    root: { flex: 1, flexDirection: "row", backgroundColor: colors.background },

    // Backdrop trong suốt — chỉ dùng để đóng QuickMenu khi bấm ra ngoài
    menuBackdrop: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 20,
    },

    // Backdrop tối — che phủ nội dung khi sidebar mobile đang mở
    sidebarBackdrop: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 25,
        backgroundColor: "rgba(0,0,0,0.2)",
    },

    // Sidebar dạng overlay trên mobile — nằm đè lên nội dung, zIndex cao hơn backdrop
    sidebarOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 30,
    },

    mainArea: { flex: 1, backgroundColor: colors.background },

    hamburgerBtn: {
        marginRight: 12,
        padding: 4,
    },

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

    createButton: {
        height: 40,
        borderRadius: radii.md,
        backgroundColor: colors.brand,
        paddingHorizontal: 18,
        flexDirection: "row",
        alignItems: "center",
    },

    createButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFFFFF",
        marginLeft: 8,
    },

    scrollArea: { flex: 1 },

    scrollContent: {
        paddingLeft: 22,
        paddingRight: 22,
        paddingTop: 22,
        paddingBottom: 28,
    },

    // 2-column layout, wraps on narrow viewport (F12 open, tablet)
    contentRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        flexWrap: "wrap",
    },

    // Left col: flex:1 + minWidth so it never gets too narrow
    leftColumn: {
        flex: 1,
        minWidth: 300,
        marginRight: 18,
        marginBottom: 16,
    },

    // Right col: fixed preferred width, shrinks with flexShrink + minWidth
    rightColumn: {
        width: 400,
        flexShrink: 1,
        minWidth: 280,
        marginBottom: 16,
    },
});
