import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Breakpoint: below this width the horizontal nav collapses to hamburger
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
  onPressConsult?: () => void;
  onPressMenuItem?: (item: string) => void;
};

export default function HomeHeader({ onPressConsult, onPressMenuItem }: Props) {
  const { width } = useWindowDimensions();
  const isNarrow = width < NAV_BREAKPOINT;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    // Outer wrapper holds both the topbar and the mobile dropdown
    <View>
      {/* ── TOP BAR ── */}
      <View style={styles.header}>
        <Text style={styles.logo}>Loogistic</Text>

        {/* Wide screen: horizontal nav */}
        {!isNarrow && (
          <View style={styles.menu}>
            <Text style={styles.menuActive}>Trang chủ</Text>
            {menuItems.map((item) => (
              <TouchableOpacity key={item} activeOpacity={0.75} onPress={() => onPressMenuItem?.(item)}>
                <Text style={styles.menuItem}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.headerRight}>
          {/* Wide: show CTA button */}
          {!isNarrow && (
            <TouchableOpacity style={styles.consultBtn} activeOpacity={0.85} onPress={onPressConsult}>
              <Text style={styles.consultText}>Tư vấn Doanh nghiệp</Text>
            </TouchableOpacity>
          )}

          {/* Narrow: show hamburger icon */}
          {isNarrow && (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.hamburgerBtn}
              onPress={() => setMenuOpen((prev) => !prev)}
            >
              <MaterialCommunityIcons
                name={menuOpen ? "close" : "menu"}
                size={26}
                color="#222222"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── MOBILE DROPDOWN (vertical menu) ── */}
      {isNarrow && menuOpen && (
        <View style={styles.mobileMenu}>
          <Text style={styles.mobileMenuActive}>Trang chủ</Text>
          {menuItems.map((item) => (
            <TouchableOpacity key={item} activeOpacity={0.75} onPress={() => { onPressMenuItem?.(item); setMenuOpen(false); }}>
              <Text style={styles.mobileMenuItem}>{item}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.mobileConsultBtn} activeOpacity={0.85} onPress={() => { onPressConsult?.(); setMenuOpen(false); }}>
            <Text style={styles.mobileConsultText}>Tư vấn Doanh nghiệp</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 68,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
  },

  logo: {
    fontSize: 26,
    fontWeight: "800",
    color: "#00B14F",
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
    color: "#00B14F",
    fontSize: 14,
    fontWeight: "700",
  },

  menuItem: {
    color: "#222222",
    fontSize: 14,
    fontWeight: "500",
  },

  headerRight: {
    flexShrink: 0,
    marginLeft: 16,
  },

  consultBtn: {
    backgroundColor: "#F15A24",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },

  consultText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
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
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
    paddingHorizontal: 24,
    paddingVertical: 12,
  },

  mobileMenuActive: {
    color: "#00B14F",
    fontSize: 15,
    fontWeight: "700",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },

  mobileMenuItem: {
    color: "#222222",
    fontSize: 15,
    fontWeight: "500",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },

  mobileConsultBtn: {
    marginTop: 14,
    marginBottom: 4,
    backgroundColor: "#F15A24",
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: "center",
  },

  mobileConsultText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});