import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../../../theme";

type Props = {
  onRegisterPress: () => void;
};

export default function LoginHeaderBlock({ onRegisterPress }: Props) {
  return (
    <View style={styles.loginHeader}>
      <Text style={styles.loginTitle}>Đăng nhập</Text>

      <View style={styles.subRow}>
        <Text style={styles.subText}>Bạn chưa có tài khoản? </Text>
        <TouchableOpacity onPress={onRegisterPress}>
          <Text style={styles.linkText}>Đăng ký</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loginHeader: {
    marginBottom: 18,
  },

  loginTitle: {
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