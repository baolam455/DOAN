import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, radii } from "../../../theme";

const NAV_BREAKPOINT = 900;

const menuItems = [
  "Về chúng tôi",
  "For Business",
  "For E-Commerce",
  "Tuyển dụng",
  "Tin tức",
  "Hỏi đáp",
  "Liên hệ",
];

type Props = {
  onHomePress: () => void;
  onPressConsult?: () => void;
  onPressMenuItem?: (item: string) => void;
};

export default function LoginPageHeader({ onHomePress, onPressConsult, onPressMenuItem }: Props) {
  const { width } = useWindowDimensions();
  const isNarrow = width < NAV_BREAKPOINT;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View>
      {/* TOP BAR */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onHomePress}>
          <Text style={styles.logo}>Loogistic</Text>
        </TouchableOpacity>

        {/* Wide screen: horizontal nav */}
        {!isNarrow && (
          <View style={styles.menu}>
            <TouchableOpacity onPress={onHomePress}>
              <Text style={styles.menuActive}>Trang chủ</Text>
            </TouchableOpacity>
            {menuItems.map((item) => (
              <TouchableOpacity key={item} activeOpacity={0.75} onPress={() => onPressMenuItem?.(item)}>
                <Text style={styles.menuItem}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.headerRight}>
          {!isNarrow && (
            <TouchableOpacity style={styles.consultBtn} activeOpacity={0.85} onPress={onPressConsult}>
              <Text style={styles.consultText}>Tu van Doanh nghiep</Text>
            </TouchableOpacity>
          )}

          {isNarrow && (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.hamburgerBtn}
              onPress={() => setMenuOpen((prev) => !prev)}
            >
              <MaterialCommunityIcons
                name={menuOpen ? "close" : "menu"}
                size={26}
                color={colors.text}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* MOBILE DROPDOWN */}
      {isNarrow && menuOpen && (
        <View style={styles.mobileMenu}>
          <TouchableOpacity onPress={() => { onHomePress(); setMenuOpen(false); }}>
            <Text style={styles.mobileMenuActive}>Trang chu</Text>
          </TouchableOpacity>
          {menuItems.map((item) => (
            <TouchableOpacity key={item} activeOpacity={0.75} onPress={() => { onPressMenuItem?.(item); setMenuOpen(false); }}>
              <Text style={styles.mobileMenuItem}>{item}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.mobileConsultBtn} activeOpacity={0.85} onPress={() => { onPressConsult?.(); setMenuOpen(false); }}>
            <Text style={styles.mobileConsultText}>Tu van Doanh nghiep</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 68,
    backgroundColor: colors.surface,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  logo: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.brand,
  },

  // ── Wide nav ──
  menu: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },

  menuActive: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },

  menuItem: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "400",
  },

  headerRight: {
    flexShrink: 0,
    marginLeft: 16,
  },

  consultBtn: {
    backgroundColor: colors.brand,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.sm,
  },

  consultText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },

  // ── Hamburger ──
  hamburgerBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Mobile dropdown ──
  mobileMenu: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },

  mobileMenuActive: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  mobileMenuItem: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: "400",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  mobileConsultBtn: {
    marginTop: 14,
    marginBottom: 4,
    backgroundColor: colors.brand,
    borderRadius: radii.sm,
    paddingVertical: 12,
    alignItems: "center",
  },

  mobileConsultText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});