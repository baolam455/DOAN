import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../../../theme";

type Props = {
  onLoginPress: () => void;
};

export default function RegisterHeaderBlock({ onLoginPress }: Props) {
  return (
    <View style={styles.registerHeader}>
      <Text style={styles.registerTitle}>Đăng ký dịch vụ</Text>

      <View style={styles.subRow}>
        <Text style={styles.subText}>Bạn đã có tài khoản? </Text>
        <TouchableOpacity onPress={onLoginPress}>
          <Text style={styles.linkText}>Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  registerHeader: {
    marginBottom: 18,
  },

  registerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
  },

  subRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },

  subText: {
    fontSize: 14,
    color: colors.textMuted,
  },

  linkText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.brand,
  },
});
