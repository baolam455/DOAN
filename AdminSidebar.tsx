import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform, useWindowDimensions } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { colors, radii } from "../../../theme";

export type AdminSection = "overview" | "users" | "orders" | "offices" | "fees";

type Props = {
  activeSection: AdminSection;
  initials: string;
  onChangeSection: (section: AdminSection) => void;
  onLogout: () => void;
};

const webNoOutline =
  Platform.OS === "web"
    ? ({ outlineStyle: "none", outlineWidth: 0, outlineColor: "transparent" } as any)
    : null;

const menuItems: {
  key: AdminSection;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}[] = [
  { key: "overview", label: "Tổng quan", icon: "view-dashboard-outline" },
  { key: "users", label: "Người dùng", icon: "account-group-outline" },
  { key: "orders", label: "Đơn hàng", icon: "clipboard-list-outline" },
  { key: "offices", label: "Bưu cục", icon: "map-marker-radius-outline" },
  { key: "fees", label: "Cấu hình phí", icon: "cash-multiple" },
];

export default function AdminSidebar({
  activeSection,
  initials,
  onChangeSection,
  onLogout,
}: Props) {
  const { width } = useWindowDimensions();
  // Tren tablet portrait (<900px): collapsed = icon-only, khong hien text
  const collapsed = width < 900;

  return (
    <View style={[styles.sidebar, collapsed && styles.sidebarCollapsed]}>
      <View style={styles.top}>
        {/* Brand row: full khi mo rong, chi icon khi thu nho */}
        <View style={[styles.brandRow, collapsed && styles.brandRowCollapsed]}>
          <View style={styles.logoMark}>
            <MaterialCommunityIcons name="truck-fast-outline" size={22} color="#FFFFFF" />
          </View>
          {!collapsed && (
            <View>
              <Text style={styles.brandTitle}>Loogistic</Text>
              <Text style={styles.brandSub}>Admin console</Text>
            </View>
          )}
        </View>

        {/* Avatar: full chip khi mo rong, chi hinh tron khi thu nho */}
        <View style={[styles.profileChip, collapsed && styles.profileChipCollapsed]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          {!collapsed && (
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Admin</Text>
              <View style={styles.rolePill}>
                <View style={styles.roleDot} />
                <Text style={styles.roleLabel}>Toàn quyền</Text>
              </View>
            </View>
          )}
        </View>

        {/* Menu items: icon + text khi mo rong, chi icon khi thu nho */}
        <View style={styles.menu}>
          {menuItems.map((item) => {
            const active = item.key === activeSection;
            return (
              <TouchableOpacity
                key={item.key}
                activeOpacity={0.84}
                style={[
                  styles.menuItem,
                  active && styles.menuItemActive,
                  collapsed && styles.menuItemCollapsed,
                  webNoOutline,
                ]}
                onPress={() => onChangeSection(item.key)}
              >
                {active && <View style={styles.activeBar} />}
                <MaterialCommunityIcons
                  name={item.icon}
                  size={19}
                  color={active ? "#FFFFFF" : colors.navyMuted}
                  style={styles.menuIcon}
                />
                {!collapsed && (
                  <Text style={[styles.menuText, active && styles.menuTextActive]}>
                    {item.label}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.84}
        style={[styles.logoutBtn, collapsed && styles.logoutBtnCollapsed, webNoOutline]}
        onPress={onLogout}
      >
        <MaterialCommunityIcons name="logout-variant" size={18} color="#FDA4AF" />
        {!collapsed && <Text style={styles.logoutText}>Đăng xuất</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 236,
    backgroundColor: colors.navy,
    paddingHorizontal: 14,
    paddingTop: 20,
    paddingBottom: 16,
    justifyContent: "space-between",
  },

  /* Collapsed: chi icon, thu nho xuong 64px */
  sidebarCollapsed: {
    width: 64,
    paddingHorizontal: 8,
  },

  top: {
    flex: 1,
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 18,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1B314A",
  },

  brandRowCollapsed: {
    justifyContent: "center",
  },

  logoMark: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  brandTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  brandSub: {
    fontSize: 11,
    color: "#88A1BA",
    marginTop: 2,
  },

  profileChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#182B45",
    borderRadius: radii.md,
    paddingHorizontal: 11,
    paddingVertical: 10,
    marginBottom: 16,
  },

  profileChipCollapsed: {
    justifyContent: "center",
    paddingHorizontal: 4,
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  profileInfo: {
    flex: 1,
  },

  profileName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#F8FAFC",
    marginBottom: 4,
  },

  rolePill: {
    flexDirection: "row",
    alignItems: "center",
  },

  roleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brand,
    marginRight: 5,
  },

  roleLabel: {
    fontSize: 11,
    color: "#88A1BA",
  },

  menu: {
    marginTop: 2,
  },

  menuItem: {
    height: 42,
    borderRadius: radii.sm,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    paddingHorizontal: 10,
    position: "relative",
    overflow: "hidden",
  },

  menuItemCollapsed: {
    justifyContent: "center",
    paddingHorizontal: 4,
  },

  menuItemActive: {
    backgroundColor: "#213856",
  },

  activeBar: {
    position: "absolute",
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    borderRadius: 2,
    backgroundColor: colors.brand,
  },

  menuIcon: {
    width: 22,
  },

  menuText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.navyMuted,
    marginLeft: 9,
  },

  menuTextActive: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  logoutBtn: {
    height: 42,
    borderRadius: radii.sm,
    backgroundColor: "#2A1720",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  logoutBtnCollapsed: {
    paddingHorizontal: 4,
  },

  logoutText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FDA4AF",
    marginLeft: 7,
  },
});
