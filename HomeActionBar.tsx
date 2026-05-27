import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

type Props = {
  onLoginPress: () => void;
  onPostOfficePress: () => void;
  onTrackOrderPress: () => void;
  onRatePress: () => void;
};

export default function HomeActionBar({
  onLoginPress,
  onPostOfficePress,
  onTrackOrderPress,
  onRatePress,
}: Props) {
  const actions = [
    { label: "Đăng ký / Đăng nhập", onPress: onLoginPress },
    { label: "Tra cứu bưu cục",      onPress: onPostOfficePress },
    { label: "Tra cứu đơn hàng",     onPress: onTrackOrderPress },
    { label: "Tra cứu cước phí",     onPress: onRatePress },
  ];

  return (
    <View style={styles.actionBar}>
      {actions.map((item, index) => {
        const isLast = index === actions.length - 1;

        return (
          <TouchableOpacity
            key={item.label}
            activeOpacity={0.85}
            style={[styles.actionItem, isLast && styles.actionItemLast]}
            onPress={item.onPress}
          >
            <Text style={styles.actionText}>{item.label}</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  actionBar: {
    // Fixed height removed -- wrap to 2x2 on narrow screens
    minHeight: 64,
    flexDirection: "row",
    flexWrap: "wrap",
  },

  actionItem: {
    flex: 1,
    minWidth: 160,           // at 4*160=640px it stays 1 row; narrower wraps to 2x2
    height: 64,              // each cell has consistent height
    backgroundColor: "#00C73C",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    borderRightWidth: 1,
    borderRightColor: "#12B246",
  },

  actionItemLast: {
    backgroundColor: "#53E56E",
  },

  actionText: {
    color: "#111111",
    fontSize: 16,
    fontWeight: "700",
  },

  arrow: {
    color: "#111111",
    fontSize: 24,
    fontWeight: "700",
  },
});
