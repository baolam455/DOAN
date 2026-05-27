import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, radii } from "../../../theme";

type ActivePage = "overview" | "orders" | "report" | "money" | "chat" | "profile";

type Props = {
    initials: string;
    activePage?: ActivePage;
    onToggleQuickMenu: () => void;
    onPressOverview?: () => void;
    onPressOrders?: () => void;
    onPressReport?: () => void;
    onPressMoney?: () => void;
    onPressChat?: () => void;
    onPressWallet?: () => void;
    onPressHelp?: () => void;
    onPressProfile?: () => void;
    onPressLogout?: () => void;
};

// Nút sidebar thông thường
function SidebarButton({
    icon,
    active = false,
    onPress,
    collapsed = false,
}: {
    icon: any;
    active?: boolean;
    onPress?: () => void;
    collapsed?: boolean;
}) {
    return (
        <TouchableOpacity
            activeOpacity={0.75}
            onPress={onPress}
            style={[
                styles.sidebarButton,
                active && styles.sidebarButtonActive,
                collapsed && styles.sidebarButtonCollapsed,
            ]}
        >
            <MaterialCommunityIcons
                name={icon}
                size={23}
                color={active ? colors.brand : colors.text}
            />
        </TouchableOpacity>
    );
}

export default function DashboardSidebar({
    initials,
    activePage = "overview",
    onToggleQuickMenu,
    onPressOverview,
    onPressOrders,
    onPressReport,
    onPressMoney,
    onPressChat,
    onPressWallet,
    onPressHelp,
    onPressProfile,
    onPressLogout,
}: Props) {
    const [collapsed, setCollapsed] = useState(false);

    const sidebarWidth = collapsed ? 52 : 72;

    return (
        <View style={[styles.sidebar, { width: sidebarWidth }]}>
            {/* ── TOP: Avatar + Profile + Logout ── */}
            <View style={styles.sidebarTop}>
                {/* Avatar — bấm mở QuickMenu */}
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={onToggleQuickMenu}
                    style={styles.avatarWrap}
                >
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                </TouchableOpacity>

                {/* Hồ sơ tài khoản — nằm ngay dưới avatar */}
                <SidebarButton
                    icon="account-circle-outline"
                    active={activePage === "profile"}
                    onPress={onPressProfile}
                    collapsed={collapsed}
                />

                {/* Đăng xuất — nằm kề dưới Profile */}
                <SidebarButton
                    icon="logout-variant"
                    onPress={onPressLogout}
                    collapsed={collapsed}
                />

                {/* Divider ngăn cách nhóm tài khoản và chức năng chính */}
                <View style={styles.divider} />

                {/* ── Nhóm chức năng chính ── */}
                <View style={styles.menuGroup}>
                    <SidebarButton
                        icon="view-dashboard-outline"
                        active={activePage === "overview"}
                        onPress={onPressOverview}
                        collapsed={collapsed}
                    />
                    <SidebarButton
                        icon="clipboard-list-outline"
                        active={activePage === "orders"}
                        onPress={onPressOrders}
                        collapsed={collapsed}
                    />
                    <SidebarButton
                        icon="chart-line"
                        active={activePage === "report"}
                        onPress={onPressReport}
                        collapsed={collapsed}
                    />
                    <SidebarButton
                        icon="cash"
                        active={activePage === "money"}
                        onPress={onPressMoney}
                        collapsed={collapsed}
                    />
                    <SidebarButton
                        icon="message-processing-outline"
                        active={activePage === "chat"}
                        onPress={onPressChat}
                        collapsed={collapsed}
                    />
                </View>
            </View>

            {/* ── BOTTOM: Ví + Hỗ trợ + Nút Thu gọn/Mở rộng ── */}
            <View style={styles.sidebarBottom}>
                {/* Ví COD */}
                <SidebarButton
                    icon="wallet-outline"
                    onPress={onPressWallet}
                    collapsed={collapsed}
                />

                {/* Trung tâm hỗ trợ */}
                <SidebarButton
                    icon="help-circle-outline"
                    onPress={onPressHelp}
                    collapsed={collapsed}
                />

                {/* Nút Thu gọn / Mở rộng sidebar */}
                <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => setCollapsed((v) => !v)}
                    style={[
                        styles.sidebarButton,
                        styles.collapseButton,
                        collapsed && styles.sidebarButtonCollapsed,
                    ]}
                >
                    <MaterialCommunityIcons
                        name={collapsed ? "chevron-right" : "chevron-left"}
                        size={22}
                        color={colors.textMuted}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    sidebar: {
        backgroundColor: "#FFFFFF",
        borderRightWidth: 1,
        borderRightColor: colors.border,
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 16,
        paddingBottom: 14,
        zIndex: 10,
        // Transition mượt khi width thay đổi (chỉ hoạt động trên web)
        // @ts-ignore
        transition: "width 0.2s ease",
    },

    sidebarTop: {
        alignItems: "center",
        width: "100%",
    },

    sidebarBottom: {
        alignItems: "center",
        width: "100%",
    },

    avatarWrap: {
        marginBottom: 10,
    },

    avatarCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.brand,
        justifyContent: "center",
        alignItems: "center",
    },

    avatarText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "700",
    },

    divider: {
        width: "70%",
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 10,
    },

    menuGroup: {
        alignItems: "center",
        width: "100%",
    },

    sidebarButton: {
        width: 46,
        height: 46,
        borderRadius: radii.md,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },

    // Khi thu gọn thì thu nhỏ nút lại một chút để vừa với width mới
    sidebarButtonCollapsed: {
        width: 38,
        height: 38,
    },

    sidebarButtonActive: {
        backgroundColor: colors.brandSoft,
    },

    collapseButton: {
        marginTop: 4,
        backgroundColor: colors.surfaceMuted || "#F5F5F5",
    },
});
