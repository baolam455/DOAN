import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { quoteShippingFee } from "../../services/publicApi";
import { colors, radii } from "../../theme";

const webNoOutline =
  Platform.OS === "web"
    ? ({ outlineStyle: "none", outlineWidth: 0, outlineColor: "transparent" } as any)
    : null;

function formatCurrency(value: number) {
  return value.toLocaleString("vi-VN") + "đ";
}

export default function ShippingFeeLookupScreen() {
  const navigation = useNavigation<any>();
  const [province, setProvince] = useState("");
  const [weight, setWeight] = useState("0.5");
  const [shippingType, setShippingType] = useState<"express" | "bbs">("express");
  const [fee, setFee] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleQuote = async () => {
    const totalWeight = Number(weight.replace(",", "."));
    if (!Number.isFinite(totalWeight) || totalWeight <= 0) {
      setError("Khối lượng phải lớn hơn 0 kg");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setFee(
        await quoteShippingFee({
          receiverProvince: province.trim() || undefined,
          shippingType,
          totalWeight,
        }),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tra được cước phí");
      setFee(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.backButton, webNoOutline]}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="chevron-left" size={28} color={colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Tra cứu cước phí</Text>
          <Text style={styles.subtitle}>Ước tính theo khu vực nhận hàng và khối lượng</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.form}>
          <Text style={styles.label}>Tỉnh/TP nhận hàng</Text>
          <TextInput
            style={[styles.input, webNoOutline]}
            value={province}
            onChangeText={setProvince}
            placeholder="Ví dụ: TP Hồ Chí Minh, Hà Nội, Đà Nẵng"
            placeholderTextColor={colors.textSubtle}
          />

          <Text style={styles.label}>Khối lượng</Text>
          <View style={styles.weightRow}>
            <TextInput
              style={[styles.input, styles.weightInput, webNoOutline]}
              value={weight}
              onChangeText={(value) => setWeight(value.replace(/[^0-9.,]/g, ""))}
              keyboardType="decimal-pad"
              placeholder="0.5"
              placeholderTextColor={colors.textSubtle}
            />
            <Text style={styles.unit}>kg</Text>
          </View>

          <Text style={styles.label}>Dịch vụ</Text>
          <View style={styles.optionRow}>
            <TouchableOpacity
              activeOpacity={0.82}
              style={[
                styles.option,
                shippingType === "express" && styles.optionActive,
                webNoOutline,
              ]}
              onPress={() => setShippingType("express")}
            >
              <Text style={[styles.optionText, shippingType === "express" && styles.optionTextActive]}>
                EXPRESS
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.82}
              style={[
                styles.option,
                shippingType === "bbs" && styles.optionActive,
                webNoOutline,
              ]}
              onPress={() => setShippingType("bbs")}
            >
              <Text style={[styles.optionText, shippingType === "bbs" && styles.optionTextActive]}>
                BBS hàng lớn
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.86}
            style={[styles.submitButton, loading && styles.submitButtonDisabled, webNoOutline]}
            onPress={handleQuote}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <MaterialCommunityIcons name="calculator-variant-outline" size={18} color="#FFFFFF" />
            )}
            <Text style={styles.submitText}>{loading ? "Đang tính..." : "Tính cước phí"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>Cước phí tạm tính</Text>
          <Text style={styles.resultValue}>{fee === null ? "--" : formatCurrency(fee)}</Text>
          <Text style={styles.resultDesc}>
            Cước chính thức được backend tính lại khi tạo đơn để tránh lệch dữ liệu giữa FE và BE.
          </Text>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    height: 68,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },

  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 3,
  },

  body: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 22,
  },

  form: {
    width: 480,
    flexShrink: 1,
    minWidth: 280,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 22,
    marginRight: 18,
    marginBottom: 16,
    shadowColor: "#101828",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },

  label: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 7,
    marginTop: 14,
  },

  input: {
    height: 42,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: 12,
    fontSize: 14,
    color: colors.text,
  },

  weightRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  weightInput: {
    flex: 1,
  },

  unit: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMuted,
  },

  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  option: {
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: 16,
    justifyContent: "center",
  },

  optionActive: {
    borderColor: colors.brand,
    backgroundColor: colors.brandSoft,
  },

  optionText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
  },

  optionTextActive: {
    color: colors.brandDark,
  },

  submitButton: {
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.brand,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
  },

  submitButtonDisabled: {
    opacity: 0.65,
  },

  submitText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  resultBox: {
    flex: 1,
    minWidth: 220,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 24,
    alignSelf: "flex-start",
    marginBottom: 16,
    shadowColor: "#101828",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },

  resultTitle: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: "600",
  },

  resultValue: {
    fontSize: 38,
    lineHeight: 46,
    color: colors.brand,
    fontWeight: "700",
    marginTop: 10,
  },

  resultDesc: {
    marginTop: 12,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 20,
  },

  errorText: {
    marginTop: 14,
    fontSize: 13,
    fontWeight: "600",
    color: colors.danger,
  },
});
