import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform, useWindowDimensions } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { ShippingFeeRule, formatCurrency } from "../../../services/adminApi";
import { colors, radii } from "../../../theme";

type Props = {
  feeRules: ShippingFeeRule[];
  onToggleRule: (ruleId: string) => void;
};

const webNoOutline =
  Platform.OS === "web"
    ? ({ outlineStyle: "none", outlineWidth: 0, outlineColor: "transparent" } as any)
    : null;

export default function AdminPricingPanel({ feeRules, onToggleRule }: Props) {
  // Tren man hinh nho (<600px), thu hep cot gia de khong bi tran
  const { width } = useWindowDimensions();
  const moneyWidth = width < 600 ? 110 : 180;

  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <View>
          <Text style={styles.panelTitle}>Cấu hình phí vận chuyển</Text>
          <Text style={styles.panelDesc}>Khung giá theo khoảng cách và khối lượng đơn hàng</Text>
        </View>
      </View>

      <View style={styles.ruleList}>
        {feeRules.map((rule) => (
          <View key={rule.id} style={styles.ruleRow}>
            <View style={styles.ruleIconBox}>
              <MaterialCommunityIcons name="cash-multiple" size={20} color={colors.brandDark} />
            </View>

            <View style={styles.ruleMain}>
              {/* numberOfLines gioi han text khong tran ra ngoai tren man hinh nho */}
              <Text style={styles.ruleName} numberOfLines={2} ellipsizeMode="tail">{rule.name}</Text>
              <Text style={styles.ruleDesc} numberOfLines={1} ellipsizeMode="tail">
                {rule.distanceFromKm}-{rule.distanceToKm} km · {rule.weightFromKg}-{rule.weightToKg} kg
              </Text>
            </View>

            <View style={[styles.ruleMoney, { width: moneyWidth }]}>
              <Text style={styles.baseFee}>{formatCurrency(rule.baseFee)}</Text>
              <Text style={styles.extraFee}>+ {formatCurrency(rule.extraFeePerKg)} / kg</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.82}
              style={[styles.toggleButton, rule.active && styles.toggleButtonActive, webNoOutline]}
              onPress={() => onToggleRule(rule.id)}
            >
              <View style={[styles.toggleKnob, rule.active && styles.toggleKnobActive]} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
  },

  panelHeader: {
    marginBottom: 16,
  },

  panelTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },

  panelDesc: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },

  ruleList: {
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },

  ruleRow: {
    minHeight: 82,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  ruleIconBox: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  ruleMain: {
    flex: 1,
  },

  ruleName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },

  ruleDesc: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 5,
  },

  ruleMoney: {
    // width handled via inline style (moneyWidth) for responsive narrow screens
    alignItems: "flex-end",
    paddingRight: 18,
  },

  baseFee: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },

  extraFee: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 5,
  },

  toggleButton: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.borderStrong,
    padding: 3,
    justifyContent: "center",
  },

  toggleButtonActive: {
    backgroundColor: colors.brand,
  },

  toggleKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surface,
  },

  toggleKnobActive: {
    marginLeft: 20,
  },
});
